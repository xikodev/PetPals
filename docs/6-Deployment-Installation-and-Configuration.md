# 6. Deployment, Installation, and Configuration

> **Review status (15 November 2026):** The instructions below describe the repository configuration and implemented interfaces on GitHub `main`, not a newly verified end-to-end installation. The review environment could inspect source but could not obtain a runnable checkout, use Docker/PostgreSQL, or complete Google sign-in. Local and public deployment checks marked **Requires verification** must be executed before this section is submitted as a fully validated installation guide.

## 6.1 Deployment View

PetPals is designed as one React Progressive Web Application for Pet Owners, Pet Helpers, and Administrators. The implemented frontend is built with React, React Router, and Vite; the Node.js/Express backend provides the current authentication, self-profile, and profile-editing APIs; PostgreSQL stores the application schema and authentication sessions. Google Identity supplies OpenID Connect authentication. Payment processing is outside project scope.

The version-controlled [`render.yaml`](../render.yaml) **defines**, but does not by itself prove the health of, these hosted parts:

| Deployment node / service | Runtime or role | Connection |
| --- | --- | --- |
| User's browser | Executes the React frontend and sends API requests | HTTPS to frontend; API session requests need a working same-origin routing arrangement |
| Render frontend service, `web-frontend` | Docker-built Vite assets served by Nginx | Delivers static files and React Router history fallback |
| Render backend service, `api-service` | Node.js/Express in Docker; `PORT` set by hosting platform | Handles `/health`, `/api/auth/*`, `/api/users/me`, and example routes |
| Render PostgreSQL database, `app-db` | Managed PostgreSQL (`appdb`, database user `dbuser` in declared blueprint) | Private database connection from the backend; not directly from browser |
| Google Identity | External OAuth 2.0/OpenID Connect provider | Browser authorization redirect and backend callback; provider is not hosted by PetPals |

**Deployment diagram (configuration-defined topology; public communication paths still require verification):**

![PetPals deployment view](assets/diagrams/6-1-deployment.svg)

PlantUML source: [`puml/6-1-deployment.puml`](puml/6-1-deployment.puml). The companion SVG is a visual export of this logical deployment view; deployment status must be independently checked.

**Actual vs. planned:** Authentication sessions, self-profile retrieval, profile updates and photo processing have code on `main`. The React client includes login, profile, and a My Pets page, but its pet CRUD implementation is an in-memory mock and is not stored through an API. Maps, Google Calendar synchronization, bookings, service confirmations, reviews and the administrative UI remain outside the verified live-deployment inventory of this report, even where represented in the design documentation. There is **one frontend application**, with different views based on role, not three separately deployed applications.

**Public address:** The repository references [`https://petpals-frontend.onrender.com/`](https://petpals-frontend.onrender.com/). An external retrieval on 15 November 2026 returned HTTP 503, so the public frontend was **not confirmed operational at the time of this check**. Ask the teammate who manages Render to verify the actual frontend/backend service URLs and availability. Do not insert an invented backend URL into the deployment diagram.

**Integration constraint:** In development, [`frontend/vite.config.js`](../frontend/vite.config.js) proxies `/api` to `http://localhost:10000`. The checked-in [`frontend/nginx.conf`](../frontend/nginx.conf) provides a static-file/SPA fallback but **does not contain an equivalent `/api` reverse proxy**. The backend authentication implementation expects same-origin cookies and Origin/CSRF checks, and its callback redirects returning users to a profile page (`localhost:5173/profile` in local development, `/profile` in production), while new users still enter the backend registration flow through `/api/auth/me`. Therefore, public frontend-to-backend login must be treated as **unverified pending integration/configuration**, not a completed production flow.

## 6.2 Installation and Local Configuration

The procedure below uses a local Node.js backend and Vite frontend plus a PostgreSQL container. It avoids treating the incomplete all-in-one production-mode Docker Compose configuration as a proven development setup. Follow the detailed setup documents in [`backend/README.md`](../backend/README.md), [`backend/docs/google-auth.md`](../backend/docs/google-auth.md) and [`frontend/README.md`](../frontend/README.md) if they are updated later; reconcile any conflicting instructions with the current code.

### 6.2.1 Prerequisites and source code

Install Git, Node.js and npm compatible with the versioned lockfiles, PostgreSQL 15 or a compatible version, and a PostgreSQL command-line client (`psql`) or Docker Engine with Docker Compose. The backend Dockerfile uses Node.js 20; the frontend README reports local development tested with Node.js 24/npm 11. **Do not assume either is a formal cross-platform support guarantee**: record the versions used in a successful clean-checkout test.

For a real Google sign-in test, obtain a Google Cloud **Web application OAuth client** in an authorized team project. A developer who only needs local route/guest checks can postpone Google OAuth, but fully starting the backend may still require valid auth settings; verify startup requirements against the checked-in environment validation.

From a terminal, clone the repository and check the revision:

```bash
git clone https://github.com/xikodev/PetPals.git
cd PetPals
git checkout main
git pull --ff-only
git rev-parse --short HEAD
```

The following paths assume the terminal is at **the repository root** unless a `cd` command is shown.

### 6.2.2 Database selection and migrations

**Team-shared Render database:** Borna asked teammates to create an untracked `backend/.env` using individually provided credentials for the Render PostgreSQL service. That arrangement runs Node.js locally but connects to a **shared remote database** (`DB_SSL=true` for an external TLS endpoint). Only authorized teammates should receive the current secret values; do not copy them into Git, this document, screenshots, or test logs. The shared database may contain real team data. **Do not run initial migrations or mutating integration tests there unless the database maintainer confirms the intended state and authorizes the operation.**

**Recommended isolated test setup:** The Docker commands below deliberately create a different, disposable *local* database. They should not be run against the shared Render database. In `backend/.env`, choose either the local Postgres values with `DB_SSL=false`, or the approved Render connection settings with TLS; do not mix them. For isolated automated tests, prefer local Postgres even if the developer normally connects to Render.


For the repository's development Docker Compose setup, start **only PostgreSQL** initially:

```bash
docker compose up -d db
docker compose ps
```

The Compose file configures a PostgreSQL 15 container, a local database named `appdb`, and a development account `dbuser`. Its sample password is **for isolated local development only**; replace shared/default credentials for any exposed or hosted environment. Wait for the database to become healthy. To inspect an already initialized database:

```bash
docker compose exec db psql -U dbuser -d appdb -c '\dt'
```

For a **fresh empty database only**, apply these migrations in order. They are not automatically run when the backend starts:

```bash
docker compose exec -T db psql -U dbuser -d appdb < backend/migrations/001_initial_schema.sql
docker compose exec -T db psql -U dbuser -d appdb < backend/migrations/002_auth_sessions.sql
docker compose exec db psql -U dbuser -d appdb -c '\dt'
```

Alternatively, for a separately managed local PostgreSQL instance with a previously created `dbuser` and `appdb`:

```bash
psql -h localhost -U dbuser -d appdb -v ON_ERROR_STOP=1 -f backend/migrations/001_initial_schema.sql
psql -h localhost -U dbuser -d appdb -v ON_ERROR_STOP=1 -f backend/migrations/002_auth_sessions.sql
```

The alternative assumes that the role/database already exist and has schema privileges; creating a PostgreSQL role/database requires an administrator and is installation-specific. **Do not rerun migration 001** on an existing initialized PetPals database. If only migration 002 is missing, apply only 002. Verify `auth_sessions` exists, and preserve production data by running migrations through a reviewed backup/change procedure. Do not use a production database for testing.

### 6.2.3 Backend configuration and startup

Copy the backend's safe example configuration to a local, uncommitted file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` (never commit real credentials). These are the relevant variable names from the repository:

| Variable | Purpose / safe local example |
| --- | --- |
| `PORT` | Backend listening port, normally `10000` |
| `DB_HOST` | `localhost` when running Node.js on the host and PostgreSQL through published Compose port |
| `DB_PORT` | `5432` for the local Compose database |
| `DB_USER` | Local application PostgreSQL role, e.g. `dbuser` |
| `DB_PASSWORD` | Local database password; **secret** |
| `DB_NAME` | Local database name, e.g. `appdb` |
| `DB_SSL` | `false` for a trusted local PostgreSQL setup; configure hosted TLS according to provider policy |
| `DATABASE_URL` | Optional connection-string alternative; if used, contains credentials and is **secret** |
| `AUTH_BASE_URL` | Local backend origin `http://localhost:10000` with no path |
| `GOOGLE_CLIENT_ID` | OAuth Web client identifier from Google Cloud |
| `GOOGLE_CLIENT_SECRET` | OAuth Web client secret; **secret** |

If Borna supplies a team-specific local configuration, enter those secret values only in the ignored `backend/.env`; never publish the password or OAuth secret. Rotate any previously exposed database and OAuth credentials. Avoid configuring conflicting `DATABASE_URL` and `DB_*` values; the backend code gives the connection string precedence. In Google Cloud, configure the OAuth consent screen, allow the relevant test accounts when consent is in testing mode, and add the authorized redirect URI:

```
http://localhost:10000/api/auth/google/callback
```

In a terminal at the repository root, run:

```bash
cd backend
npm ci
npm run db:check
npm test
npm start
```

The backend should listen at `http://localhost:10000` if configuration and database checks succeed. Keep the process running for browser testing. Test in a separate terminal:

```bash
curl -i http://localhost:10000/health
curl -i http://localhost:10000/api/auth/me
```

Expected behavior: `/health` should return a successful health JSON response; `/api/auth/me` without a session should return an authentication-related response, not a proxy/network error. Google sign-in begins by navigating the **browser** to `http://localhost:10000/api/auth/google`. Google returns to the backend callback. Existing authenticated users are redirected to the frontend profile page; a new user enters a registration session and is redirected to `/api/auth/me` JSON. The existing React login and profile pages do not by themselves prove that this end-to-end flow works with the current proxy and Origin settings.

For a full implemented route list, request bodies, response JSON, status and error codes, see [API reference](API.md). For detailed authentication constraints and examples see [Google sign-in](../backend/docs/google-auth.md), [User profile](../backend/docs/user-profile.md), and [User settings](../backend/docs/user-settings.md). The protected `GET /api/users/me` and `PATCH /api/users/me` routes require an authenticated test session; state-changing requests additionally require the documented Origin and CSRF token. New owner/helper accounts require administrator approval before booking access.

### 6.2.4 Frontend configuration, startup and quality checks

Open a **second terminal** from the repository root:

```bash
cd frontend
npm ci
npm run lint
npm run build
npm run dev
```

Open Vite's displayed development URL, normally `http://localhost:5173`. The checked-in frontend implements home, `/login`, `/profile`, `/my-pets`, and `/my-listings`. Profile display/editing uses backend APIs; My Pets CRUD uses an in-memory frontend mock and is not persisted. These distinctions should be demonstrated at the checkpoint rather than claiming every screen has working backend persistence.

The Vite development proxy forwards requests with the `/api` prefix to port 10000. To check guest routing without a Google test account, create an uncommitted `frontend/.env.local` containing:

```dotenv
VITE_MOCK_GUEST=true
```

Restart `npm run dev` after changing Vite environment files, and navigate directly to `/profile` and `/my-listings`; both should redirect a guest to `/login`. Remove this setting or set it to `false` when testing real authentication. This is a frontend route-guard check, **not proof of backend session functionality**.

For actual client-to-backend communication, use browser developer tools to inspect the request to `/api/auth/me`, including its status, content type, and the Vite proxy. A `401` from the backend for an anonymous request can be an expected result; a network error, HTML fallback or proxy failure is not. For data persistence, use an approved **isolated** test account to update an allowed profile field and then retrieve the profile again; do not use shared production users. Check the `Origin` on PATCH requests: local Vite runs at port 5173 while the backend compares Origin to `AUTH_BASE_URL` (typically port 10000), which may lead to HTTP 403. This needs an agreed proxy/security fix and a measured test rather than a presumed pass. Also verify profile-photo uploads: the users PATCH route has a `512kb` JSON parser and photo-data validation of at most 350000 characters; the `16kb` parsers in `app.js` are mounted on other API prefixes.

### 6.2.5 Troubleshooting and local acceptance criteria

| Symptom | Check |
| --- | --- |
| Backend refuses to start | Confirm PostgreSQL health, `DB_*` or `DATABASE_URL`, migration state, `AUTH_BASE_URL` and required Google settings; inspect backend console output |
| `npm run db:check` fails | Confirm DB port/account/password and that the database exists; use `docker compose ps` and PostgreSQL logs |
| OAuth sign-in fails | Verify callback URI matches Google Cloud settings exactly, `AUTH_BASE_URL`, allowed test accounts, and backend logs; never log tokens or client secrets |
| Browser `/api/*` returns frontend HTML | Check Vite proxy in local dev or Nginx reverse-proxy/routing configuration in deployed environment |
| Profile PATCH returns 403 | Check session, `X-CSRF-Token` from `/api/auth/me`, and the local Vite Origin (port 5173) versus backend `AUTH_BASE_URL` (port 10000); do not disable CSRF protection casually |
| Profile-photo PATCH returns 413 | The users PATCH route has a `512kb` JSON body limit, which returns HTTP 413 when exceeded. A `photo_data` string over 350000 characters instead fails validation with HTTP 400; the auth/examples `16kb` parsers do not apply to this route. |
| Node/Vite build fails | Use a Node/npm combination compatible with the current lockfiles and record exact build error |

**A local installation is verified only when** PostgreSQL is initialized, the backend health endpoint works, frontend lint/build complete, Vite serves the app, a client request reaches the API, and the required authenticated profile/persistence tests pass in a controlled environment. Those results were **not collected** during this document preparation. Record them in [Section 5](5-Testing.md).

## 6.3 Public Deployment and Administration

### 6.3.1 Hosting and build configuration

[`render.yaml`](../render.yaml) defines one PostgreSQL database and two Docker-backed Render web services. The backend's [`Dockerfile`](../backend/Dockerfile) uses Node.js 20 in production mode and starts `npm start`; the frontend's [`Dockerfile`](../frontend/Dockerfile) builds the Vite application and serves its `dist` output with Nginx. [`frontend/nginx.conf`](../frontend/nginx.conf) includes React Router SPA fallback. This is **versioned deployment configuration**, not independent confirmation that all three services are deployed and healthy.

The hosted backend must use Render's assigned `PORT`, an authorized managed PostgreSQL connection, an HTTPS `AUTH_BASE_URL` equal to the backend's public origin, and the team's Google OAuth Web client settings. It exposes a `/health` endpoint, which the blueprint references for health checking. The backend's database migration scripts do **not** run automatically at startup. Borna's shared Render database and the blueprint's `app-db` are not proven to be the same database; the actual Render database/service names and migration history must be checked in the dashboard.

### 6.3.2 Required hosted settings and secrets

| Service | Required setting | Handling |
| --- | --- | --- |
| Render PostgreSQL | Database name, role and database connection URL | Obtain from Render; do not publish credentials |
| Backend | `DATABASE_URL`, `PORT` (host-provided), and any required SSL configuration | Store securely in Render service environment; never embed database secrets in frontend |
| Backend | `AUTH_BASE_URL=https://<actual-backend-host>` | Backend origin over HTTPS; must match registered Google callback origin |
| Backend | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | From team's authorized Google Cloud OAuth client; client secret is private |
| Frontend | Browser-facing API routing / any Vite build-time public variables | Must be resolved during build and support the same-origin session/CSRF design; do not put secrets in `VITE_*` |
| GitHub Actions CD | `RENDER_DEPLOY_HOOK_URL`, if automatic redeployment via webhook is enabled | Repository secret; if absent, the workflow prints a skip message |

The repository's blueprint mentions `VITE_API_URL`, but the reviewed frontend uses relative `/api` calls through a **development-only Vite proxy**. Do not assume that setting this variable alone enables the production frontend; verify build-time wiring and the missing Nginx/API proxy with the frontend and backend owners.

### 6.3.3 Deployment procedure to verify with the maintainer

1. In Render, confirm which repository/branch is connected to `app-db`, `api-service`, and `web-frontend` (see [`render.yaml`](../render.yaml)). Compare the **actual** dashboard configuration with the version-controlled blueprint.
2. Provision or inspect managed PostgreSQL. On a *new empty* database, apply [`001_initial_schema.sql`](../backend/migrations/001_initial_schema.sql) and [`002_auth_sessions.sql`](../backend/migrations/002_auth_sessions.sql) in that order through an authorized secure SQL connection or approved migration mechanism. Check schema and permissions; never rerun initial schema on populated databases.
3. Set the backend's environment settings in Render and configure the exact HTTPS Google callback URL in Google Cloud: `https://<actual-backend-host>/api/auth/google/callback`.
4. Deploy the backend image; confirm startup logs and `GET https://<actual-backend-host>/health`. Check authentication errors without exposing session cookies, database URLs, or tokens.
5. Fix/confirm the production client-to-API routing and cookie/Origin design with the team. Because the checked-in Nginx config has no `/api` proxy, choose and implement a tested same-origin proxy arrangement (or a reviewed alternative security design) **before** claiming working public login.
6. Deploy the frontend image, verify its actual public address, load `/`, test SPA reload of `/profile`, and complete the sign-in and profile checks with an authorized test account. Capture browser network evidence that the request reaches the correct backend.
7. Record the deployed Git revision, URLs, migration version, and smoke-test results in [Testing](5-Testing.md). Do not claim deployment complete based solely on a Render dashboard green indicator or static home page.

**Current public status:** The frontend URL linked by the repository returned HTTP 503 during a check on 15 November 2026; this is a single observed response and should be rechecked against Render logs and service status. A verified backend production URL, working public OAuth flow, and successful Render migration evidence were not available during this review.

### 6.3.4 Administration, monitoring and maintenance

The application data model includes an administrator role, but the reviewed authentication implementation does not provide an administrator sign-up flow, an initial administrator provisioning process, or a completed admin UI. An already-provisioned Google administrator account may sign in, subject to backend implementation; access must be granted by an authorized maintainer. Do not document an unverified `/admin` URL or publish any administrator credentials.

Operational checks available from the versioned project include the backend `/health` endpoint, Render service logs/events, PostgreSQL connection diagnostics, and GitHub Actions workflow history. The CI workflow currently **does not** execute backend unit tests or frontend lint/build; it echoes a message. The CD workflow posts to a Render deploy hook on pushes to `main` **only if** its secret exists; otherwise it skips. These should not be characterized as verified continuous test and deployment coverage.

For a production update, review the PR and relevant test evidence, back up production data using an approved policy, inspect pending schema changes, deploy through the authorized team procedure, and run a health and browser smoke test. The presence of backup, restore, automatic cleanup, monitoring alerts, or rollback infrastructure was **not confirmed** in this audit; maintainers must document the real procedure before relying on it. Authentication session expiry is implemented, while regular database cleanup of expired session rows is described as potential future housekeeping, not a confirmed scheduled job.

**Pending team confirmations:** whether Render uses the blueprint's `app-db` or the separate team-shared database, actual Render service URLs and active deployment; working same-origin frontend/API configuration; Google OAuth redirect/test account setup; migration status; production logs; administrator provisioning; backup/restore procedures; and results of the checks in [§5](5-Testing.md).
