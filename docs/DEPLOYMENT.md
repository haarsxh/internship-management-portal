# Deploying to Render (one service) + MongoDB Atlas

The Express server also serves the built React app, so the whole project is **one web service with one URL**. No CORS setup is needed.

You need free accounts on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and [Render](https://render.com), and the code on GitHub (already done).

## 1. Create the database (Atlas)
1. Create a free **M0** cluster.
2. **Database Access** → add a database user (username + password). Avoid `@ : / ?` in the password, or URL-encode it.
3. **Network Access** → add IP address `0.0.0.0/0` (Render's free tier has no fixed IP).
4. **Connect → Drivers** → copy the connection string and add the database name:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/internship_portal?retryWrites=true&w=majority`

## 2. Load the demo data (once, from your computer)
```bash
cd server
MONGO_URI="<your atlas string>" npm run seed
```
This wipes and refills that database with the demo users, internships and applications. Skip it if you want an empty site.

## 3. Deploy on Render
1. Render dashboard → **New → Blueprint** → pick the `internship-management-portal` repo. It reads `render.yaml` and proposes one web service.
2. When asked, paste your Atlas string as **`MONGO_URI`**. `JWT_SECRET` is generated for you.
3. Click **Apply**. The first build takes a few minutes. When it finishes, open the `https://…onrender.com` URL.

(Manual alternative: **New → Web Service**, Build Command `npm run build`, Start Command `npm start`, then add the environment variables `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET` (a long random string) and `VITE_DEMO_LOGIN`.)

Health check: `https://<your-app>.onrender.com/api/health` should return `{"success":true,"status":"ok"}`.

## Things to know
- **Cold starts:** Render's free tier sleeps after ~15 minutes idle; the first request afterwards takes about a minute. Open the site before your demo.
- **Demo sign-in buttons:** `VITE_DEMO_LOGIN=true` (the default in `render.yaml`) shows one-tap Student/Company/Admin buttons that use the public seeded passwords, so anyone who finds the URL can sign in as admin. Set it to `false` in Render and redeploy for anything beyond a demo, and change the seeded passwords.
- **Reseeding** wipes all data, including accounts people created. Don't run it against a database you care about.
- **Resumes** are stored in MongoDB (2 MB PDF limit), so they survive restarts. Files are reachable by their unguessable URL without logging in.
- **Updates:** push to `main` and Render redeploys automatically.
- **Production check locally:** `npm run build`, then `NODE_ENV=production JWT_SECRET=<random> MONGO_URI=<uri> npm start` and open http://localhost:5001. (Build without `client/.env`, or with `VITE_API_URL` unset, so the app calls its own `/api`.)

## Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | server | Atlas connection string |
| `JWT_SECRET` | server | token signing key; the server refuses to start in production without a real one |
| `JWT_EXPIRES_IN` | server | token lifetime (default `7d`) |
| `NODE_ENV=production` | server | enables the production guard |
| `PORT` | server | set by Render |
| `CLIENT_URL` | server | only needed if the client is hosted on a different origin (not in this setup) |
| `VITE_API_URL` | client build | leave unset in production; the app uses same-origin `/api` |
| `VITE_DEMO_LOGIN` | client build | `false` hides the one-tap demo buttons |
