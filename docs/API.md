# API Documentation

Base URL: `http://localhost:5001/api` · JSON bodies · Protected routes need `Authorization: Bearer <token>`.
All errors: `{ "success": false, "message": "..." }`.

## Auth
| Method | Route | Auth | Body | Success response |
|---|---|---|---|---|
| POST | `/auth/register` | – | `{name, email, password, role: "student"\|"company", companyName?}` | 201 `{success, token, user}` (409 if email exists) |
| POST | `/auth/login` | – | `{email, password}` | 200 `{success, token, user}` (401 bad credentials) |
| GET | `/auth/me` | any | – | 200 `{success, user}` |
| PUT | `/auth/me` | any | `{name, companyName?, website?, phone?, college?, branch?, skills?}` | 200 `{success, user}` |
| POST | `/auth/me/resume` | any | multipart `resume` (PDF ≤ 2MB) | 200 `{success, user}` |

## Internships
| Method | Route | Auth | Body / Query | Success response |
|---|---|---|---|---|
| GET | `/internships` | – | `?q&mode&location&minStipend&page&limit` | 200 `{success, total, page, pages, internships[]}` |
| GET | `/internships/mine` | company | – | 200 `{success, internships[]}` with `applicationCount` |
| GET | `/internships/:id` | optional | – | 200 `{success, internship, application}` (404) |
| POST | `/internships` | company (approved) | `{title, description, location, mode, stipend, durationMonths, skills, deadline}` | 201 `{success, internship}` (400 validation, 403 not approved) |
| PUT | `/internships/:id` | owner / admin | any subset of fields incl. `status` | 200 `{success, internship}` (403, 404) |
| DELETE | `/internships/:id` | owner / admin | – | 200 `{success, message}` (also removes its applications) |

## Applications
| Method | Route | Auth | Body | Success response |
|---|---|---|---|---|
| POST | `/internships/:id/apply` | student | multipart `coverLetter?`, `resume?` (PDF) | 201 `{success, application}` (409 duplicate, 400 closed / no resume) |
| GET | `/applications/mine` | student | – | 200 `{success, applications[]}` (internship populated) |
| GET | `/internships/:id/applications` | owner company / admin | – | 200 `{success, internship, applications[]}` |
| PUT | `/applications/:id/status` | owner company / admin | `{status: applied\|shortlisted\|accepted\|rejected}` | 200 `{success, application}` |
| DELETE | `/applications/:id` | student (own, status `applied`) | – | 200 `{success, message}` |

## Admin
| Method | Route | Auth | Body | Success response |
|---|---|---|---|---|
| GET | `/admin/stats` | admin | – | 200 `{success, stats}` (aggregation) |
| GET | `/admin/users` | admin | `?role=` | 200 `{success, users[]}` |
| PUT | `/admin/users/:id/approve` | admin | `{isApproved: boolean}` | 200 `{success, user}` |
| DELETE | `/admin/users/:id` | admin | – | 200 `{success, message}` |

## Student extras
| Method | Route | Auth | Body | Success response |
|---|---|---|---|---|
| GET | `/student/saved` | student | – | 200 `{success, internships[]}` bookmarked internships |
| POST | `/student/saved/:id` | student | – | 201 `{success, saved:true}` (404 unknown internship, idempotent) |
| DELETE | `/student/saved/:id` | student | – | 200 `{success, saved:false}` |
| GET | `/student/recommendations` | student | – | 200 `{success, needsSkills, internships[]}` ranked by skill overlap; each has `matchedSkills`, `matchScore` (%) |
| GET | `/student/alerts` | student | – | 200 `{success, alerts[]}`: `deadline` (saved, closes within 3 days, not applied) and `interview` (proposed, awaiting reply) |
| PUT | `/applications/:id/interview/respond` | student (own) | `{response: confirmed\|declined}` | 200 `{success, application}` (400 if nothing proposed) |

`GET /internships` and `GET /internships/:id` add `saved` flags for logged-in students. Applications include `statusHistory[]` (`{status, at}`) for the timeline; `notes` and `rating` are **never** returned to students.

## Company extras
| Method | Route | Auth | Body | Success response |
|---|---|---|---|---|
| PUT | `/applications/:id/review` | owner company / admin | `{notes?, rating?: 1-5 \| null}` | 200 `{success, application}` (private notes/rating) |
| PUT | `/applications/:id/interview` | owner company / admin | `{proposedAt (future ISO date), note?}` | 200 `{success, application}` (400 if rejected or in the past) |
| DELETE | `/applications/:id/interview` | owner company / admin | – | 200 `{success, application}` |
| PUT | `/applications/bulk/status` | owner company / admin | `{ids: [], status}` | 200 `{success, updated}` (403 if any is not yours) |

Applicant filtering/sorting and CSV export run in the client from `GET /internships/:id/applications`.

## Admin extras
| Method | Route | Auth | Body | Success response |
|---|---|---|---|---|
| GET | `/admin/internships` | admin | `?status=` | 200 `{success, internships[]}` all internships with `applicationCount`; close/reopen/remove use `PUT`/`DELETE /internships/:id` |
| GET | `/admin/audit` | admin | `?page&limit&action=` (prefix, e.g. `user`) | 200 `{success, total, page, pages, entries[]}` |
| GET | `/admin/announcements` | admin | – | 200 `{success, announcements[]}` |
| POST | `/admin/announcements` | admin | `{message ≤ 280}` | 201 `{success, announcement}` (replaces the live banner) |
| PUT | `/admin/announcements/:id` | admin | `{active}` | 200 `{success, announcement}` |
| DELETE | `/admin/announcements/:id` | admin | – | 200 `{success, message}` |
| GET | `/announcements/active` | public | – | 200 `{success, announcement}` (or `null`) |

`GET /admin/stats` now also returns `applicationsOverTime` (14 daily buckets, UTC) for the line chart. Audit actions: `user.approve|revoke|delete`, `internship.close|reopen|delete`, `announcement.create|show|hide|delete`.

## Misc
`GET /health` → `{success:true, status:"ok"}` · uploaded PDFs are served from `/uploads/<file>` (server origin, not under `/api`).

Status codes used: 200, 201, 400 (validation / bad id), 401 (no/invalid token), 403 (wrong role / not owner), 404, 409 (duplicate), 500.
