## Student Submission Form Setup

The student submission experience lives outside of Sanity Studio. Students authenticate with an email magic link, edit their project in a dedicated form, and all writes are persisted to the `studentSubmission` document in Sanity.

This guide covers the configuration required for local development and production.

---

### 1. Sanity configuration

1. Create a fine-grained API token in Sanity with **write access limited to the `studentSubmission` type**.  
   Recommended filter:  
   ```groq
   _type == "studentSubmission" && submittedBy == $identity.email
   ```
2. Store the token in your environment as `SANITY_WRITE_TOKEN`.
3. (Optional but recommended) set `SANITY_PROJECT_ID`, `SANITY_DATASET` and `SANITY_API_VERSION` to keep environments explicit.

These values are consumed by `server.js` to ensure students can only create/update their own records.

---

### 2. Magic link email delivery

The server can email magic links using SMTP. Configure the following variables:

| Variable | Description |
| --- | --- |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | SMTP host info |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials |
| `MAGIC_LINK_FROM_EMAIL` | From address for outbound mail |
| `MAGIC_LINK_SECRET` | Secret used to sign link and session tokens (change this in production) |
| `MAGIC_LINK_TTL` | Link lifetime (default 15m) |
| `SESSION_TOKEN_TTL` | Session lifetime once verified (default 2h) |

If SMTP is not configured the server will log the magic link URL to the console (development only).

---

### 3. Front-end configuration

The React app now exposes a student portal at `/submit`. Provide the following environment variables when building/running the frontend:

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_URL` | Base URL of the Express API (omit for same-origin deployments) |

For local development run both servers:

```bash
# Terminal 1 – API
SANITY_WRITE_TOKEN=<token> npm run server

# Terminal 2 – frontend
cd frontend
REACT_APP_API_URL=http://localhost:3000 npm start
```

---

### 4. API overview

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/request-magic-link` | POST | Accepts `{ email }`, ensures a submission document exists, and sends/logs a magic link. |
| `/api/auth/verify-magic-link` | POST | Accepts `{ token }`, validates the link, and returns an authenticated session token plus the student submission payload. |
| `/api/submissions/me` | GET | Returns the authenticated student submission (requires `Authorization: Bearer <session token>`). |
| `/api/submissions/me` | PUT | Updates the submission with `title`, `description`, and `images`. |
| `/api/submissions/upload-image` | POST | Accepts `multipart/form-data` with a single `file` to upload to Sanity assets. |

All protected routes require the session token issued during magic-link verification.

---

### 5. Notes & limitations

- Image uploads are limited to `SUBMISSION_IMAGE_MAX_BYTES` (defaults to 10 MB). Override when needed.
- The form stores captions alongside images but does not expose advanced image hotspot/crop controls.
- Session and link secrets should differ between environments. Rotate periodically.
- If the frontend and API share the same origin you can omit `REACT_APP_API_URL`; otherwise point it to your API host.

With these pieces in place students can authenticate via email and update their submissions without ever seeing Sanity Studio.

