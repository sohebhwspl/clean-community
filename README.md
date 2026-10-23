# Clean Community (Next.js + MongoDB Atlas)

Full-stack port of the Spring Boot + React + PostgreSQL app. Next.js (App Router) serves both the UI and the `/api/*` endpoints; data lives in MongoDB Atlas. API paths, request/response shapes and role rules are identical to `docs/API.md`.

## Run
1. `npm install`
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. `npm run dev` → http://localhost:3000 (or `npm run build && npm start`).

The first admin is created automatically on the first request if no admin exists. In Atlas, allow your server's IP under Network Access.

## Layout
- `src/app` – routes (`(site)` pages, `api/` route handlers)
- `src/views`, `src/components`, `src/hooks`, `src/services` – the UI, carried over from the React app (`src/lib/router.tsx` maps the React Router API onto Next)
- `src/server` – models (Mongoose), auth (JWT in HttpOnly `cc_token` cookie), and the business rules per module

## Notes
- IDs are sequential numbers (counters collection), so `CC-0001` codes and search by ID still work.
- Images are stored in a private AWS S3 bucket (key saved in the `issueimages` collection) and served through short-lived signed links. Limits: JPEG/PNG/WebP, ≤ 5 MB, max 5 per request.
- Vercel limits request bodies to 4.5 MB, so uploads there are limited to about one photo at a time; self-hosted Node, Railway, Render, etc. have no such limit.
- `APP_TIMEZONE` (default `Asia/Kolkata`) decides what "today" means for cleanup drives.

- Forgot-password (email OTP) is disabled for admin accounts. If the admin password is lost, run `node --env-file=.env scripts/reset-admin-password.mjs <admin-email> <new-password>` on a machine that has the production `MONGODB_URI`.
