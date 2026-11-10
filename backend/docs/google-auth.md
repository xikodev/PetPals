# Google sign-in

## What is implemented

- Google OpenID Connect authorization-code flow with state, nonce and S256 PKCE.
- Google RS256 signature verification against Google's HTTPS signing-key endpoint,
  plus issuer, audience, authorized-party, expiry, nonce and verified-email checks.
- Existing users are matched only by `google_subject`, never by email.
- New users confirm their names and choose owner/helper. Email and Google subject
  come only from the verified identity. New accounts remain `pending`.
- Opaque session cookies: HttpOnly, SameSite=Lax, Secure on HTTPS, host-only.
  Only SHA-256 hashes of bearer tokens are stored in PostgreSQL.
- Authenticated sessions expire after 30 minutes of API inactivity or 12 hours
  total. Sign-in and registration attempts expire after 10 minutes.
- Registration and logout require both a matching Origin and session CSRF token.
- Google access and ID tokens are discarded after sign-in. No Calendar permissions
  are requested and no Calendar credential storage is implemented here.

The existing Node dependencies and built-in crypto/fetch APIs are used. The
Google verifier is deliberately limited to Google's RS256 tokens; it is not a
general-purpose JWT utility. Token validation tests use locally signed fixtures.

## One-time setup (not performed automatically)

1. Apply `backend/migrations/002_auth_sessions.sql` to the database where migration
   001 has already been applied. Do not rerun 001. Migration 002 only adds the
   session table and indexes; it does not change existing users.
2. In Google Cloud, configure the OAuth consent screen and create an OAuth client
   of type **Web application**. While the app is in testing, add the Google
   accounts used for testing to its allowed test users.
3. Register these **Authorized redirect URIs**, replacing the Render hostname:
   - `http://localhost:10000/api/auth/google/callback`
   - `https://YOUR-BACKEND.onrender.com/api/auth/google/callback`
4. Configure the backend environment:

   ```dotenv
   AUTH_BASE_URL=https://YOUR-BACKEND.onrender.com
   GOOGLE_CLIENT_ID=your-google-web-client-id
   GOOGLE_CLIENT_SECRET=your-google-web-client-secret
   ```

   Locally, use `AUTH_BASE_URL=http://localhost:10000` in `backend/.env`.
   `AUTH_BASE_URL` is the public backend origin, with no path or query. Production
   requires HTTPS. Keep the existing database settings. Set secrets in Render's
   environment settings; never commit them.
5. Deploy the backend after the migration and environment settings are ready.
   No migration runs at startup.
6. Open `https://YOUR-BACKEND.onrender.com/api/auth/google` (locally,
   `http://localhost:10000/api/auth/google`) in a browser to start sign-in.
   After Google authentication, the callback sets a session cookie and redirects
   to `/api/auth/me`, which returns JSON. Authentication errors return JSON with
   an appropriate HTTP error status; there are no HTML pages.

No separate session secret is required: session cookies carry random 256-bit
tokens whose hashes are looked up in the database, not self-contained user data.

## Frontend integration

Frontend pages are owned by the frontend team. This backend provides only the
authentication API. Begin sign-in with browser navigation to `/api/auth/google`,
not an AJAX request. The current callback redirects to JSON at `/api/auth/me`;
a future frontend landing URL can be agreed when integrating the client.

The current cookie and Origin policy expects a same-origin client. Serve the
future React client and API on the same origin or behind a same-origin proxy,
preserving cookie and callback paths. A frontend hosted on a separate origin
requires an agreed CORS, cookie and CSRF configuration before integration; it
is not enabled by this change.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/auth/google` | Begin Google sign-in |
| `GET /api/auth/google/callback` | Validate and consume the OAuth attempt |
| `GET /api/auth/me` | Current user or pending registration; returns CSRF token |
| `POST /api/auth/register` | Complete new-user registration |
| `POST /api/auth/logout` | Delete session and expire cookie |

POST requests send JSON and `X-CSRF-Token` from `/me`, with cookies included.
Registration accepts `first_name`, `last_name`, and `role` (`owner` or `helper`).
There is no endpoint for public administrator registration or changing an
existing account's role/verification status.

## Permissions and administration

`auth.middleware.js` provides `requireUser`, `requireRole(...)`, and
`requireBookingAccess`. Future protected routes must first use the session loader
returned by `createAuthHandlers`, then the appropriate permission middleware.
Object ownership checks remain necessary for individual bookings and pets.

Pending users may sign in and complete profiles. Booking access requires an
approved, unsuspended owner/helper. Suspended users may still sign in, see their
status, and log out. The role and verification status are read from the database
on every authenticated request, so later administrator changes take effect.

Administrator approval UI, administrator creation, and initial administrator
provisioning are not implemented in this change. An already-provisioned Google
administrator account can sign in; public registration cannot create one.

Expired sessions are rejected immediately and removed at the next sign-in start.
For regular housekeeping, a future scheduled job may also run:

```sql
DELETE FROM auth_sessions WHERE expires_at <= CURRENT_TIMESTAMP;
```

## Validation

From `backend`, run `npm test` after `npm ci`. Tests cover signed-token validation,
PKCE parameters, callback replay, state/cookie binding, registration role limits,
CSRF, logout, session hashing and expiry queries, registration rollback, and
booking permission checks. Repository and handler tests use injected doubles;
they do not connect to Google or PostgreSQL.

Before release, verify real Google consent/callback, new-user registration,
returning-user login, logout and expiry against the configured environment.
Also verify migration 002 and the repository queries against PostgreSQL. Neither
live Google nor database verification has been performed by these unit tests.

Reference: [Google OpenID Connect documentation](https://developers.google.com/identity/openid-connect/openid-connect).
