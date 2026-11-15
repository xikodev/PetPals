# 5. Testing

> **Evidence status (15 November 2026):** This section is a test specification and source-code review of the PetPals `main` branch as viewed on GitHub on this date. A reproducible checkout and the application's dependencies were not available in the documentation-review environment, so the backend test suite, frontend lint/build commands, database migrations, local application, and full browser flows **were not executed here**. Consequently, the cases below are marked **Not run** rather than Passed. Before submission, execute the commands in §5.3 on a named Git revision and replace those entries with measured results and evidence.

## 5.1 Test Approach

PetPals is a peer-to-peer pet-care platform. At the current implementation stage, the backend includes Google sign-in, PostgreSQL-backed sessions, self-profile retrieval and editing, and server-side profile-photo normalization. The frontend includes a Google login page, profile editing, guest route guards, and a My Pets UI backed only by a browser-memory mock (not a persisted pet API). The broader booking, confirmation, calendar, review, and administration workflows are described in project requirements and architecture but are **not yet established as working end-to-end features**.

Testing is divided into the following levels:

| Level | Scope and method | Automation currently available | Evidence location |
| --- | --- | --- | --- |
| Backend component / handler | OAuth state and token validation, session security, registration, authorization, profile queries, and profile update validation with controlled fixtures or repositories | Node.js built-in test runner (`npm test`) | [`backend/test/`](../backend/test/) and the individual files linked below |
| Backend API / integration | Actual Express server, database connectivity, PostgreSQL persistence, authentication cookie behavior, status codes, and migration compatibility | No independently verified database-backed suite in the reviewed files | Local run notes and HTTP/SQL output **to be collected** |
| Frontend static quality | ESLint checks and Vite production compilation | `npm run lint`, `npm run build`; no frontend `npm test` script | [`frontend/package.json`](../frontend/package.json); execution output **to be collected** |
| Frontend manual/system | Route navigation, guest redirects, browser-to-API communication, authenticated profile, and error handling | No browser E2E test suite verified | Browser notes/screenshots **to be collected** |
| Deployment / non-functional | Docker/Render startup, database migrations, Google OAuth callback, access control, and availability | CI workflow exists but currently only echoes a message; it does not run the above checks | [CI configuration](../.github/workflows/ci.yml), deployment logs and checks **to be collected** |

The backend source defines four backend test files: [`auth-flow.test.js`](../backend/test/auth-flow.test.js), [`auth-security.test.js`](../backend/test/auth-security.test.js), [`user-profile.test.js`](../backend/test/user-profile.test.js), and [`user-settings.test.js`](../backend/test/user-settings.test.js). The tests use local fixtures, injected dependencies, and mock repositories; they must not be treated as proof of a successful live Google OAuth or PostgreSQL integration. The code inspection confirms the *existence and intended assertions* of these tests, not their current passing status.

Tests prioritize both valid actions and important failures: invalid/replayed OAuth attempts, missing sessions, cross-site request forgery (CSRF), attempts to modify protected profile fields, unauthorized access to another user's data, database outages, and unavailable frontend/API communication. End-to-end booking and calendar test cases will be added when corresponding code exists. Requirements-to-tests links should be entered in the [requirements traceability table](2-Requirements.md) after the team verifies the applicable requirement IDs; this document does not invent them.

## 5.2 Test Cases

The following IDs are proposed stable IDs for PetPals. **Actual Results** and **Pass/Fail** record execution, not whether a test file was found. Each case currently has no execution result from this review. Steps using valid authentication require an authorized test account and isolated test data; never share real credentials in evidence.

| Test Case ID | Test Scenario | Input Data | Expected Results | Actual Results | Pass/Fail | Test Steps |
| --- | --- | --- | --- | --- | --- | --- |
| **BE-01** | Backend health check | Running backend with reachable PostgreSQL | `GET /health` returns HTTP 200 and `status: healthy` | Not run | **Not run** | Start backend as in §6.2; call `curl -i http://localhost:10000/health`; record status/body. |
| **DB-01** | Database connection | Valid local DB configuration | `npm run db:check` finishes successfully without modifying data | Not run | **Not run** | Configure `.env`, run `cd backend && npm run db:check`; save terminal output. |
| **DB-02** | Fresh schema and authentication sessions | New empty PetPals database | SQL migrations 001 then 002 complete; required tables, including `auth_sessions`, exist | Not run | **Not run** | Execute both migration files in order on a disposable DB; inspect `\dt` and session table. |
| **AUTH-01** | Google token verification | Valid locally signed fixture; altered signature, issuer, audience, nonce, or expiry | Valid fixture accepted; invalid tokens rejected | Not run | **Not run** | Run `npm test`; inspect assertions in `auth-security.test.js` and recorded TAP output. |
| **AUTH-02** | OAuth state/replay protection | Missing/mismatched state and repeated callback attempt | Invalid or repeated OAuth attempts cannot create a new authenticated session | Not run | **Not run** | Execute `auth-flow.test.js`; review state/cookie/replay cases and outcomes. |
| **AUTH-03** | Session handling | Anonymous request, valid session, expired session | Anonymous/expired requests are rejected; valid session returns its own user data | Not run | **Not run** | Run auth/profile tests; then attempt `GET /api/auth/me` with/without a test cookie against a running backend. |
| **AUTH-04** | CSRF and Origin protection | State-changing request with missing/invalid Origin or CSRF token | Request rejected without performing profile or session mutation | Not run | **Not run** | Run auth-security/settings tests; attempt a controlled invalid `PATCH /api/users/me` with authenticated fixture. |
| **AUTH-05** | Logout invalidates session | Authenticated session, valid Origin and CSRF token | `POST /api/auth/logout` expires session; subsequent protected request is unauthorized | Not run | **Not run** | Run auth-flow tests and repeat manually with a test cookie and token. |
| **USER-01** | Read own profile | Registered owner/helper, valid session | `GET /api/users/me` returns only signed-in profile and role-relevant pets/listings | Not run | **Not run** | Run `user-profile.test.js`; call API with each role's test session; inspect ownership. |
| **USER-02** | Profile cannot be read anonymously | No session or incomplete registration | `GET /api/users/me` returns HTTP 401; no private profile data exposed | Not run | **Not run** | `curl -i http://localhost:10000/api/users/me`; repeat with registration-pending fixture as applicable. |
| **USER-03** | Valid profile update | Authenticated owner/helper, valid Origin/CSRF; changed name | `PATCH /api/users/me` updates only permitted fields and resets owner/helper verification to `pending` when a name changes | Not run | **Not run** | Run `user-settings.test.js`; send supported JSON with test credentials; query own profile again. |
| **USER-04** | Reject unsupported profile fields | Authenticated user attempts `role`, `email`, or `verification_status` change | HTTP 400 and no unauthorized changes persisted | Not run | **Not run** | Run settings tests; send controlled invalid PATCH request; compare profile before/after. |
| **USER-05** | Reject cross-site profile edit | Authenticated user, bad/missing CSRF or Origin | HTTP 403; profile remains unchanged | Not run | **Not run** | Run settings tests; repeat controlled PATCH with invalid protection headers. |
| **FE-01** | Guest route protection | `VITE_MOCK_GUEST=true`; visit `/profile`, `/my-pets`, and `/my-listings` | Guest is sent to `/login`; protected content not displayed | Not run | **Not run** | Set `frontend/.env.local`, restart Vite, open all three paths directly, record redirects. |
| **FE-02** | Frontend code quality and build | Clean install of frontend at identified revision | ESLint and `vite build` complete without errors | Not run | **Not run** | `cd frontend && npm ci && npm run lint && npm run build`; save exit codes and output. |
| **FE-03** | Local API proxy | Vite frontend plus running backend | `GET /api/auth/me` through Vite reaches the backend; 401 is acceptable for a guest, but HTML fallback/network failure is not | Not run | **Not run** | Start both services; inspect `GET /api/auth/me` and response content type in browser devtools. |
| **USER-06** | Profile photo input and size limits | Authorized user; JPEG/PNG/WebP data URL, invalid data and representative larger image | Valid image in supported request size is normalized to JPEG; invalid image rejected; real app must honor documented upload size | Not run | **Not run** | Run `user-settings.test.js` and try controlled image uploads through the actual Express app; record 200/400/413 and request size. The users PATCH router has its own `512kb` JSON limit; the photo normalizer separately caps the `photo_data` string at 350000 characters. |
| **FE-04** | My Pets client-side mock | Add/edit/delete a test pet, then reload the page | UI operations work within the session, but mock pet data is lost on reload; this is not backend persistence | Not run | **Not run** | In an authorized local frontend test, open `/my-pets`, add a mock pet, reload, observe reset, and do not call the flow a database test. |
| **FE-05** | Local profile edit through Vite proxy | Authenticated test account; change an allowed name with Origin from Vite at `localhost:5173` | Profile editing should complete without a CSRF failure; compare with backend `AUTH_BASE_URL` Origin validation | Not run | **Not run** | Use browser devtools to inspect PATCH Origin, CSRF, and HTTP status; the current backend requires exact Origin equal to `AUTH_BASE_URL`, so this integration needs checking. |
| **DEP-01** | Hosted frontend/API and sign-in | Deployed frontend + backend, Google test account | User can reach frontend, begin sign-in, return with session, and use authenticated API on supported origin | Not run | **Not run** | Record live addresses, use test account, inspect redirects, cookies, network and backend logs. |
| **DEP-02** | Containerized startup | Repository Docker Compose setup, required environment | PostgreSQL starts; backend/frontend only considered successful if config, migrations, health, and browser-to-API flow work | Not run | **Not run** | Start disposable environment after configuring secrets; run `docker compose ps`, health check, and API/browser smoke tests. |

For **AUTH-01–AUTH-05** and **USER-01–USER-06**, the source contains corresponding automated cases. The manual HTTP steps are deliberately separate integration checks: a mocked test pass would not prove that a deployed database or Google account actually works.

**Future scope (not an executed test):** Once booking code is delivered, add owner/pet authorization, atomic overlapping-slot prevention, transitions `requested → accepted/declined → in_progress → completed`, two-party confirmation of the same unexpired attempt, Calendar failure isolation, review eligibility only after completion, and administrator permission checks. These rules are currently documented in [Architecture and Design](4-Architecture-and-Design.md), not demonstrated as working software. Do not invent cancellation/rescheduling states.

## 5.3 Executed Tests and Results

### Reviewed evidence and execution status

| Check or evidence | Date and revision | Environment | Observed result and outcome | Evidence |
| --- | --- | --- | --- | --- |
| Backend implementation / test inventory | 15 Nov 2026; GitHub `main` (commit SHA not captured) | Public GitHub file view | **Source reviewed**, not executed: auth, profile and settings routes and four Node test files present | [`backend/test/`](../backend/test/), [`backend/src/app.js`](../backend/src/app.js), [`backend/package.json`](../backend/package.json) |
| Frontend implementation / command inventory | 15 Nov 2026; GitHub `main` (SHA not captured) | Public GitHub file view | **Source reviewed**, not executed: React/Vite routes, working-in-code login/profile UI, dev API proxy, mocked My Pets data, ESLint/build scripts; no test script verified | [`frontend/src/App.jsx`](../frontend/src/App.jsx), [`frontend/vite.config.js`](../frontend/vite.config.js), [`frontend/package.json`](../frontend/package.json) |
| CI test execution | 15 Nov 2026; GitHub `main` | CI workflow source inspection | **Not a test run:** workflow step prints a message rather than invoking npm test/lint/build | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| Public availability spot check | 15 Nov 2026; live revision unknown | External HTTP retrieval of the repository-linked frontend URL | **HTTP 503 observed on 15 Nov 2026**. A single response is not proof of a persistent defect or other endpoint failures. | [Repository-linked frontend address](https://petpals-frontend.onrender.com/) (check again and save dated evidence) |
| Backend `npm test` | Not executed during this review | No local repository/dependencies | **Not run**; no pass/fail total or logs available | Required next step below |
| Backend database and API checks | Not executed during this review | No PostgreSQL/Google test environment | **Not run** | Required next step below |
| Frontend `npm run lint` and `npm run build` | Not executed during this review | No local repository/dependencies | **Not run**; no build output captured | Required next step below |
| Full frontend/browser and deployed OAuth flow | Not executed during this review | No authorized test account or validated hosted integration | **Not run** | Required next step below |

### Reproducible run procedure for a teammate

Use a clean checkout of the [PetPals repository](https://github.com/xikodev/PetPals) and record the revision before testing:

```bash
git checkout main
git pull --ff-only
git rev-parse --short HEAD

cd backend
npm ci
npm test
npm run db:check  # requires configured PostgreSQL; see Section 6
cd ../frontend
npm ci
npm run lint
npm run build
```

Start the backend and frontend as described in [Section 6](6-Deployment-Installation-and-Configuration.md), then execute the HTTP/browser cases against a clean test database. **Record** the UTC/local date, revision, OS, Node/npm versions, Postgres version, command, exit code, test count, and log/screenshot paths. For the backend suite, retain its TAP output (for example, `npm test > backend-test-output.txt 2>&1`, then save `$?` immediately). Do not add successful outcomes unless the commands were actually run and their output examined.

**Execution sign-off still required:** An authorized teammate must complete BE-01 through DEP-02 where relevant, update their *Actual Results* and *Pass/Fail* fields, and attach non-secret evidence before the test report can be described as complete.

## 5.4 Known Defects and Testing Limits

The items below distinguish observed conditions, source-level configuration risks, and unfinished scope. A source-level risk is **not** automatically a reproduced runtime defect.

| Issue or limitation | User-visible effect or unverified behavior | Evidence or follow-up |
| --- | --- | --- |
| **Testing evidence still required for the Trello definition of done** | No current pass/fail count for the backend suite, frontend lint/build, or live integration checks can be claimed from this review | Run §5.3 on a pinned revision; attach logs and update cases |
| **CI is placeholder** | A green CI workflow, if displayed, would not establish that unit tests or frontend checks succeeded | [CI workflow](../.github/workflows/ci.yml); replace echo with verified commands in a separate authorized change |
| **Profile-photo upload limits not tested end to end** | The users PATCH route parses JSON up to `512kb`, and `photo_data` has a separate 350000-character validation limit before image normalization. Correct handling of supported images, invalid data, and oversized requests is not yet demonstrated against a running server. The 16 KB auth/examples parsers are **not** applied to this users route. | [`backend/src/app.js`](../backend/src/app.js), [`backend/src/modules/users/users.routes.js`](../backend/src/modules/users/users.routes.js), [`backend/src/modules/users/users.photo.js`](../backend/src/modules/users/users.photo.js); run USER-06 |
| **Potential local CSRF Origin mismatch** | Backend accepts state-changing requests only if `Origin` matches `AUTH_BASE_URL` (usually port 10000), but browser-initiated Vite requests originate on port 5173; profile updates may return 403 | [`backend/src/modules/auth/auth.routes.js`](../backend/src/modules/auth/auth.routes.js), [`frontend/vite.config.js`](../frontend/vite.config.js); reproduce with FE-05 |
| **Frontend production API route unverified** | Vite proxies `/api` in development, but the reviewed Nginx config has no corresponding API proxy; hosted cookies/CSRF may not work without an agreed same-origin solution | [`frontend/vite.config.js`](../frontend/vite.config.js), [`frontend/nginx.conf`](../frontend/nginx.conf), [`backend/docs/google-auth.md`](../backend/docs/google-auth.md); verify deployment |
| **Backend production auth settings not provided by local Compose** | All-container startup may fail or authentication may remain unusable without the required `AUTH_BASE_URL` and Google credentials | [`docker-compose.yml`](../docker-compose.yml), [`backend/Dockerfile`](../backend/Dockerfile), [auth setup](../backend/docs/google-auth.md) |
| **One hosted URL check returned HTTP 503** | Public frontend was unavailable during one check; duration/cause is unverified | Recheck live URL, Render status, and logs; save dated response |
| **Live Google/PostgreSQL integration not exercised** | Component tests with mocks cannot verify provider callbacks, real cookie behavior, database migrations and persistence | Run AUTH, DB, USER and DEP integration cases in a safe test environment |
| **Automated frontend E2E suite not present** | Protected routes and profile usage still require manual verification or a future browser automation suite | [`frontend/package.json`](../frontend/package.json), [`frontend/README.md`](../frontend/README.md) |
| **Unfinished workflow features** | The login and profile frontend pages exist, but the pet CRUD frontend uses in-memory mocks and booking/QR/calendar/review flows are not established as working end to end | [`frontend/src/api/pets.js`](../frontend/src/api/pets.js), [Architecture](4-Architecture-and-Design.md) |
| **Administrator onboarding and UI unverified** | Administrator provisioning and moderation interface are not delivered by the reviewed auth implementation | [`backend/docs/google-auth.md`](../backend/docs/google-auth.md); confirm team implementation and access process |

Do not count the unfinished booking and administrative workflows as failed implemented tests. Update this section whenever new functionality is merged, test evidence is added, or the deployment configuration changes.
