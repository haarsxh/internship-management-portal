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

## Misc
`GET /health` → `{success:true, status:"ok"}` · uploaded PDFs are served from `/uploads/<file>` (server origin, not under `/api`).

Status codes used: 200, 201, 400 (validation / bad id), 401 (no/invalid token), 403 (wrong role / not owner), 404, 409 (duplicate), 500.
