# 5. Testing

**Objective:** Show how the team checks the application's important behavior, what was actually tested, what the results show, and which known defects remain. A planned test is not evidence of a successful run.

## 5.1 Test Approach

**Objective:** Select checks that address the main user goals, important failure conditions, and project-specific non-functional requirements.

PetPals is a peer-to-peer pet-care platform. The implemented part is Google sign-in with registration (role and name), PostgreSQL-backed sessions, viewing and editing the own profile (including a profile photo), and managing pets (My pets: add, edit, delete, with a photo). The frontend has the login, registration, profile, My pets and "My listings" pages with guest route guards; "My listings" does not load data yet. Listings, search, booking, confirmation, calendar, messages, reviews and the administration workflows are planned and are not tested yet.

Testing is divided into the following levels:

| Level | Scope and method | Automation currently available | Evidence location |
| --- | --- | --- | --- |
| Backend component / handler | OAuth state and token validation, session security, registration, authorization, profile queries, and profile update validation with controlled fixtures or repositories | Node.js built-in test runner (`npm test`) | [`backend/test/`](../backend/test/) and the individual files linked below |
| Backend API / integration | Actual Express server, database connectivity, PostgreSQL persistence, authentication cookie behavior, status codes, and migration compatibility | No automated suite against a real database; database behavior is checked manually (BE-01, DB-01, DB-02, PETS-01) | Run record in [5.3](#53-executed-tests-and-results) |
| Frontend static quality | ESLint checks and Vite production compilation | `npm run lint`, `npm run build`; no frontend `npm test` script | [`frontend/package.json`](../frontend/package.json); results in [5.3](#53-executed-tests-and-results) |
| Frontend manual/system | Route navigation, guest redirects, browser-to-API communication, authenticated profile, and error handling | No browser E2E test suite verified | Manual results in [5.2](#52-test-cases) and [5.3](#53-executed-tests-and-results)|
| Deployment / non-functional | Docker/Render startup, database migrations, Google OAuth callback, access control, and availability | CI workflow exists but currently only echoes a message; it does not run the above checks | [CI configuration](../.github/workflows/ci.yml), deployment checks in [5.2](#52-test-cases) (DEP-01, DEP-02) |

The backend has six automated test files in [`backend/test/`](../backend/test/): [`auth-flow.test.js`](../backend/test/auth-flow.test.js), [`auth-security.test.js`](../backend/test/auth-security.test.js), [`user-profile.test.js`](../backend/test/user-profile.test.js), [`user-settings.test.js`](../backend/test/user-settings.test.js), [`pets.test.js`](../backend/test/pets.test.js) and [`database-config.test.js`](../backend/test/database-config.test.js). They use local fixtures, injected dependencies and test repositories, so they do not prove that a real Google account or the deployed database works; those parts are checked manually (see 5.2).

Tests prioritize both valid actions and important failures: invalid/replayed OAuth attempts, missing sessions, cross-site request forgery (CSRF), attempts to modify protected profile fields, unauthorized access to another user's data, database outages, and unavailable frontend/API communication. End-to-end booking and calendar test cases will be added when corresponding code exists. The links from requirements to tests are kept in the [requirement traceability table](./2-requirements.md#26-requirement-traceability).

## 5.2 Test Cases

**Objective:** Make important checks reproducible by recording the scenario, input, steps, expected result, and result of execution. Give each check a stable ID that can be used in the requirement traceability table.

Each case has a stable ID. **Actual Results** and **Pass/Fail** record what happened in the run described in [5.3](#53-executed-tests-and-results). Steps that need a signed-in user use a test Google account and test data; real credentials are never part of the evidence.

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
| **USER-03** | Valid profile update | Authenticated owner/helper, valid Origin/CSRF; changed name | `PATCH /api/users/me` updates only permitted fields and resets owner/helper verification to `pending` when a name changes | Changed the first name on the profile page and saved. After reloading the page the new name was still shown. Verification status showed "pending" afterwards. | **Passed** | Run `user-settings.test.js`; send supported JSON with test credentials; query own profile again. |
| **USER-04** | Reject unsupported profile fields | Authenticated user attempts `role`, `email`, or `verification_status` change | HTTP 400 and no unauthorized changes persisted | Not run | **Not run** | Run settings tests; send controlled invalid PATCH request; compare profile before/after. |
| **USER-05** | Reject cross-site profile edit | Authenticated user, bad/missing CSRF or Origin | HTTP 403; profile remains unchanged | Not run | **Not run** | Run settings tests; repeat controlled PATCH with invalid protection headers. |
| **FE-01** | Guest route protection | Not signed in (signed out) on the public application; visit /profile, /my-pets and /my-listings | Guest is sent to `/login`; protected content not displayed | Signed out, opened the three addresses directly; each time the login page (/login) was shown and no profile or pet data. | **Passed** | Sign out, then open each of the three addresses directly in the browser and note where you end up. |
| **FE-02** | Frontend code quality and build | Clean install of frontend at identified revision | ESLint and `vite build` complete without errors | Not run | **Not run** | `cd frontend && npm ci && npm run lint && npm run build`; save exit codes and output. |
| **FE-03** | Local API proxy | Vite frontend plus running backend | `GET /api/auth/me` through Vite reaches the backend; 401 is acceptable for a guest, but HTML fallback/network failure is not | Not run | **Not run** | Start both services; inspect `GET /api/auth/me` and response content type in browser devtools. |
| **USER-06** | Profile photo input and size limits | Authorized user; JPEG/PNG/WebP data URL, invalid data and representative larger image | Valid image in supported request size is normalized to JPEG; invalid image rejected; real app must honor documented upload size | Not run | **Not run** | Run `user-settings.test.js` and try controlled image uploads through the actual Express app; record 200/400/413 and request size. The users PATCH router has its own `512kb` JSON limit; the photo normalizer separately caps the `photo_data` string at 350000 characters. |
| **PETS-01** | Owner manages pets and data persists | Signed-in owner; name, species, birth date, photo; optional breed and care notes | A new pet appears in the list; after reloading the page it is still there; an edit and a delete are shown after saving | Added a pet on My pets; it appeared in the list and was still there after reloading. Edited and deleted it; both were shown.| **Passed** | Open My pets, add a pet, reload the page, edit it, delete it. Automated: `pets.test.js` (owner creates, reloads, edits and deletes pets). |
| **PETS-02** | Pet validation | Pet without a required field (name, species, birth date or photo) or with an invalid ID | HTTP 400 and nothing is saved | | | Automated: `pets.test.js` (invalid pet details and IDs fail before a database write). |
| **PETS-03** | Owners cannot reach another owner's pets | Two owners; second owner uses the first owner's pet ID | The pet is not found (404), nothing is changed | | | Automated: `pets.test.js` (owners cannot see, edit, delete or take ownership of another owner's pet). |
| **PETS-04** | Only owners can manage pets | Anonymous request; helper account; write request without CSRF token or Origin | Anonymous 401, helper 403, write without CSRF/Origin 403 | | | Automated: `pets.test.js` (anonymous and non-owner accounts cannot manage pets). |
| **FE-04** | Local profile edit through Vite proxy | Authenticated test account; change an allowed name with Origin from Vite at `localhost:5173` | Profile editing completes (HTTP 200) when the app is opened at http://localhost:5173; no CSRF or Origin error | Not run (local environment not set up) | **Not run** | Run backend and frontend locally, sign in, change the first name on the profile page, and check in browser devtools that the PATCH request returns 200. |
| **DEP-01** | Hosted frontend/API and sign-in | Deployed frontend + backend, Google test account | User can reach frontend, begin sign-in, return with session, and use authenticated API on supported origin | Signed in on the public application with a Google test account; Google returned the user to the application, signed in, and authenticated pages loaded. | **Passed** | Record live addresses, use test account, inspect redirects, cookies, network and backend logs. |
| **DEP-02** | Containerized startup | Repository Docker Compose setup, required environment | PostgreSQL starts; backend/frontend only considered successful if config, migrations, health, and browser-to-API flow work | Not run | **Not run** | Start disposable environment after configuring secrets; run `docker compose ps`, health check, and API/browser smoke tests. |
| **REG-01** | First sign-in and registration | New Google account that has never signed in | After Google consent the user lands on `/register`; after choosing owner or helper and entering first and last name the user lands on `/profile` and the verification status is "pending" | Signed in with a Google account that had not been used before. The application showed /register; chose owner, entered first and last name, and arrived on /profile with verification status "pending". | **Passed** | On the public URL sign in with a new test account; choose a role; enter a name; check `/profile`. Automated part: `auth-flow.test.js` (new Google user ... create an authenticated account). |

AUTH-01 to AUTH-05, REG-01 (backend part), USER-01 to USER-06 and PETS-01 to PETS-04 have automated cases in backend/test/. The manual steps are separate checks on the running application, because a test with fake data does not prove that a real Google account or the deployed database works.

**Future scope (not an executed test):** Once booking code is delivered, add owner/pet authorization, atomic overlapping-slot prevention, transitions `requested → accepted/declined → in_progress → completed`, two-party confirmation of the same unexpired attempt, Calendar failure isolation, review eligibility only after completion, and administrator permission checks. These rules are currently documented in [Architecture and Design](4-Architecture-and-Design.md), not demonstrated as working software. Do not invent cancellation/rescheduling states.

## 5.3 Executed Tests and Results

**Objective:** Give the application revision, environment, and evidence needed to interpret the actual results in the test-case table. Add a short run record when those details cannot be conveyed by a test-code or CI run link.

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

**Objective:** Let a reader see defects that affect use of the current application and important behavior the team could not verify.

The items below are known defects, unfinished features and limits of the tests.

| Issue or limitation | User-visible effect or unverified behavior | Evidence or follow-up |
| --- | --- | --- |
| **CI is placeholder** | A green CI workflow, if displayed, would not establish that unit tests or frontend checks succeeded | [CI workflow](../.github/workflows/ci.yml); replace echo with verified commands in a separate authorized change |
| **Profile-photo upload limits not tested end to end** | The users PATCH route parses JSON up to `512kb`, and `photo_data` has a separate 350000-character validation limit before image normalization. Correct handling of supported images, invalid data, and oversized requests is not yet demonstrated against a running server. The 16 KB auth/examples parsers are **not** applied to this users route. | [`backend/src/app.js`](../backend/src/app.js), [`backend/src/modules/users/users.routes.js`](../backend/src/modules/users/users.routes.js), [`backend/src/modules/users/users.photo.js`](../backend/src/modules/users/users.photo.js); run USER-06 |
| **Backend production auth settings not provided by local Compose** | All-container startup may fail or authentication may remain unusable without the required `AUTH_BASE_URL` and Google credentials | [`docker-compose.yml`](../docker-compose.yml), [`backend/Dockerfile`](../backend/Dockerfile), [auth setup](../backend/docs/google-auth.md) |
| **One hosted URL check returned HTTP 503** | Public frontend was unavailable during one check; duration/cause is unverified | Recheck live URL, Render status, and logs; save dated response |
| **Automated frontend E2E suite not present** | Protected routes and profile usage still require manual verification or a future browser automation suite | [`frontend/package.json`](../frontend/package.json), [`frontend/README.md`](../frontend/README.md) |
| **Booking features are not implemented** | Listings, search, booking, QR and button confirmation, Google Calendar events, messages, reviews and disputes have no code yet, so they have no tests. The "My listings" page is empty. | [Requirements](2-requirements.md), [Architecture](4-Architecture-and-Design.md) |
| **Administrator onboarding and UI unverified** | Administrator provisioning and moderation interface are not delivered by the reviewed auth implementation | [`backend/docs/google-auth.md`](../backend/docs/google-auth.md); confirm team implementation and access process |

Unfinished features are not counted as failed tests; they are listed above as not implemented. This section is updated when new functionality is merged or the deployment changes.
