# Database Schema (MongoDB / Mongoose)

```mermaid
erDiagram
    USER ||--o{ INTERNSHIP : "posts (company)"
    USER ||--o{ APPLICATION : "submits (student)"
    INTERNSHIP ||--o{ APPLICATION : "receives"
    USER }o--o{ INTERNSHIP : "bookmarks (student)"
    USER ||--o{ AUDIT_LOG : "performs (admin)"
    USER ||--o{ ANNOUNCEMENT : "publishes (admin)"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "bcrypt hash, select:false"
        string role "student | company | admin"
        boolean isApproved
        string companyName
        string website
        object profile "phone, college, branch, skills[], resumeUrl"
        ObjectId[] savedInternships "ref Internship"
    }
    INTERNSHIP {
        ObjectId _id PK
        string title
        string description
        ObjectId company FK "ref User"
        string location
        string mode "remote | onsite | hybrid"
        number stipend
        number durationMonths
        string[] skills
        date deadline
        string status "open | closed"
    }
    APPLICATION {
        ObjectId _id PK
        ObjectId student FK "ref User"
        ObjectId internship FK "ref Internship"
        string coverLetter
        string resumeUrl
        string status "applied | shortlisted | accepted | rejected"
        object[] statusHistory "status, at (timeline)"
        string notes "private to company"
        number rating "1-5, private to company"
        object interview "proposedAt, note, status proposed|confirmed|declined"
    }
    AUDIT_LOG {
        ObjectId _id PK
        ObjectId actor FK "ref User"
        string actorName
        string action "e.g. user.approve"
        string targetType
        ObjectId targetId
        string summary
    }
    ANNOUNCEMENT {
        ObjectId _id PK
        string message
        boolean active
        ObjectId createdBy FK "ref User"
    }
```

## Indexes (database optimization)
| Collection | Index | Purpose |
|---|---|---|
| User | `email` (unique) | login lookup, duplicate prevention |
| User | `{ role, isApproved }` | admin filtering, pending-approval count |
| Internship | `{ status, deadline }` | public listing (open + not expired, sorted by deadline) |
| Internship | `{ company }` | company's own listings |
| Internship | text on `title, skills, location` | keyword search |
| Application | `{ student, internship }` unique | one application per student per internship |
| Application | `{ internship, status }` | applicants list / status counts |
| AuditLog | `{ createdAt: -1 }`, `{ action, createdAt: -1 }` | newest-first log, filter by action prefix |
| Announcement | `{ active, createdAt: -1 }` | fetch the live banner |

## Aggregation pipelines
`GET /api/admin/stats` (users by role, status counts, per-day applications with `$dateToString`, top internships/companies) uses `aggregate()` with `$group`, `$sort`, `$limit`, `$lookup`, `$unwind`, `$project` to compute users by role, applications by status, most-applied internships and top companies. `GET /api/internships/mine` uses `$group` to attach applicant counts.
