# Internship Management Portal (MERN)

Assignment-II · MERN Stack (ITUL503). Students browse and apply to internships, companies post listings and manage applicants, admins approve companies and view platform statistics.

## Tech stack
- **Client:** React 19, Vite, React Router, Axios, Tailwind CSS, react-hot-toast
- **Server:** Node.js, Express, Mongoose (MongoDB Atlas), JWT, bcryptjs, multer, express-validator, helmet, cors

## Features mapped to the assignment
| CO | Where |
|---|---|
| CO3 – UI & routing | `client/src`: reusable components (Navbar, Sidebar, DataTable, Modal, Cards, FormInput), `useState`/`useRef`/Context API, `react-router-dom` (`Routes`, `Link`, `useNavigate`, `useParams`, protected + role-based routes), controlled forms with validation, loading/empty/error states |
| CO4 – REST & Mongoose | `server/routes`, `controllers`, `models`; Express routers, custom middleware (logger, validate, errorHandler, notFound), `ref` + `populate()`, async CRUD with 200/201/400/404/500 |
| CO5 – Integration, JWT, optimization | Axios with token interceptor + CORS + dotenv, JWT register/login, `protect`/`authorize` middleware, centralized error handler, toasts, indexes (`schema.index`) and aggregation pipelines (`/api/admin/stats`) |

## Feature overview
- **Students:** bookmark internships and see "closing in 3 days" alerts on the dashboard; application timeline (applied → shortlisted → accepted/rejected with dates); recommended internships ranked by skill overlap; profile completeness meter; confirm or decline interview proposals.
- **Companies:** filter, search and sort applicants; bulk shortlist/accept/reject; export applicants to CSV; private notes and 1-5 ratings; propose interview times.
- **Admins:** Recharts dashboard (applications over time, status pie, top internships/companies); moderate internships (close, reopen, remove); site-wide announcement banner; audit log of approvals, deletions, closures and announcements.

## Project structure
```
client/   React app (Vite)
server/   Express API (models, controllers, routes, middleware, seed)
docs/     API.md, postman_collection.json, ER-diagram.md
```

## Setup
Prerequisites: Node 18+, a MongoDB Atlas cluster (free tier) — or any MongoDB URI.

1. **Server**
   ```bash
   cd server
   npm install
   cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
   npm run seed                # optional: demo data
   npm run dev                 # http://localhost:5001
   ```
2. **Client**
   ```bash
   cd client
   npm install
   cp .env.example .env        # VITE_API_URL=http://localhost:5001/api
   npm run dev                 # http://localhost:5173
   ```

In Atlas, add your IP under *Network Access* and use a database user's credentials in `MONGO_URI`.

## Demo accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@portal.com | admin123 |
| Company (approved) | hr@acme.com | company123 |
| Company (pending approval) | hr@globex.com | company123 |
| Student | riya@student.com | student123 |

The login page has one-click **Quick demo sign in** buttons (Student / Company / Admin) that use these seeded accounts. Set `VITE_DEMO_LOGIN=false` in `client/.env` to hide them (do this for any real deployment).

Self-registration only creates students and companies; companies must be approved by an admin before posting.

## Demo flow for viva
Register/Login → Dashboard (role specific) → Company posts internship → Student searches, applies with PDF resume → Company shortlists/accepts → Student sees status → Admin approves companies and views aggregated stats → refresh the page to show persistence.

## Docs
- [API documentation](docs/API.md) · [Postman collection](docs/postman_collection.json) (log in first; the Login requests store `token`)
- [Schema / ER diagram](docs/ER-diagram.md)

## Notes
- Resume PDFs are stored on local disk in `server/uploads` and served publicly by URL; for production use object storage with access control.
- JWT is kept in `localStorage` for simplicity (acceptable for coursework; httpOnly cookies are safer in production).
