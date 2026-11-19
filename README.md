# PetPals

PetPals is a peer-to-peer pet care platform that connects pet owners with nearby helpers offering pet sitting, walking, and feeding services.

**Course project:** This project is being developed by a student team as part of the [Software Engineering](https://www.fer.unizg.hr/predmet/proinz) course at the Faculty of Electrical Engineering and Computing (FER), University of Zagreb.

## App Description

Pet owners who travel or work long hours often arrange care informally, without availability calendars, verified users, or a structured way to resolve disagreements. PetPals is planned for three groups of users: pet owners, who search for and book care; pet helpers, who offer sitting, walking, and feeding services; and administrators, who verify users and resolve disputes. A booking follows a defined sequence from request to acceptance, confirmation, and completion, so both parties share one record of the arrangement.

The planned system is one React Progressive Web App (PWA) for all roles: pet owners and helpers use it on their phones, and administrators use its administration views in a desktop browser for user verification, service moderation, and dispute resolution.

**Current functionality:** Google sign-in (OpenID Connect); new users choose the owner or helper role; sessions expire after 30 minutes of inactivity; a signed-in user can view and edit their profile (first name, last name, photo) and manage their pets (add, edit, delete, with photo) on My pets. The frontend has login, registration, "My profile", "My pets" and "My listings" pages; "My listings" does not load data yet. Administrator approval, listings, search and bookings are not implemented.

**Planned key features**

- Pet profiles with care instructions and relevant information.
- Search for helpers by location, service type, availability, and price.
- Service listings and availability management for helpers.
- Booking requests that helpers can accept or decline.
- Confirmation of service start and completion by both parties using QR codes or in-app buttons.
- Booking-specific messaging and mutual ratings after completed services.
- Administrative tools for verification, moderation, and dispute review.

**Scope:** Payment processing is outside the planned scope. Helpers will be able to view recorded earnings calculated from completed bookings.

For the complete scope, requirements, design, and test evidence as they are developed, see the [project documentation](docs/Home.md).

<a id="deployment"></a>
## Deployment

The application is hosted on Render and described by [`render.yaml`](render.yaml): a PostgreSQL database (`app-db`), the backend API (`api-service`, Docker, health check `/health`) and the frontend (`web-frontend`, Docker with nginx). The frontend forwards `/api` requests to the backend, so the browser sees a single origin, as the session cookie and the CSRF check require.

**Live application:** https://petpals-frontend.onrender.com

**Explore:** 
1. Open the URL and select **Sign in with Google**.
2. On first sign-in, choose **Pet owner** or **Pet helper** and enter your first and last name. Your verification status starts as pending.
3. Open **My profile**, change your name or photo, and save.
4. As an owner, open **My pets** and add, edit or delete a pet.
(Pages that need sign-in redirect to the login page when you are not signed in.)

**Demo:** 
Sign-in works only for Google accounts.

**Limitations:**
- The free Render plan puts the services to sleep, so the first request after a pause can take about a minute.
- The database runs on the free Render plan and expires in December 2026; it can be recreated from the migrations (see Section 6), but its data is not kept.
- Administrator approval, listings, search and bookings are not implemented yet; "My listings" is an empty page.
- Sessions expire after 30 minutes of inactivity.

See the [deployment, installation and configuration guide](docs/6-Deployment-Installation-and-Configuration.md) for the hosting setup.

<a id="quick-start"></a>
## Quick Start / Installation

**Prerequisites:** Node.js 20.19 or newer (npm included), Docker with Docker Compose (for the local PostgreSQL database), Git, and a Google account (needed only for sign-in).

```bash
git clone https://github.com/xikodev/PetPals.git
cd PetPals

# 1. Start the local PostgreSQL database (appdb, user dbuser) on port 5432
docker compose up -d db

# 2. Create the database tables (run once, in this order)
docker compose exec -T db psql -U dbuser -d appdb < backend/migrations/001_initial_schema.sql
docker compose exec -T db psql -U dbuser -d appdb < backend/migrations/002_auth_sessions.sql

# 3. Backend (terminal 1)
cd backend
npm ci
cp .env.example .env    # then fill in DB_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm start

# 4. Frontend (terminal 2, from the repository root)
cd frontend
npm ci
npm run dev

```

**Address:** the application is at `http://localhost:5173` (the Vite dev server forwards `/api` requests to the backend at `http://localhost:10000`).

**Configuration:** copy `backend/.env.example` to `backend/.env`. For the local database use `DB_PASSWORD=password` (the value set in `docker-compose.yml`) and keep `DB_SSL=false`. For Google sign-in set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (obtained from the team privately) and keep `AUTH_BASE_URL=http://localhost:10000`. The Google client must list `http://localhost:10000/api/auth/google/callback` as an authorized redirect URI. See [Google sign-in](backend/docs/google-auth.md).

Never commit real credentials: keep them in your local backend/.env (not tracked by Git) or in the Render dashboard.

**Verification:** 
1. `http://localhost:10000/health` returns a success response.
2. `cd backend && npm run db:check` prints "PostgreSQL connection successful".
3. `cd backend && npm test` passes.
4. Open `http://localhost:5173`, choose **Sign in with Google**, choose a role and enter your name on the registration screen, then open **My profile** and **My pets**.

## Documentation
- [Project documentation](docs/Home.md)
- [Backend README](backend/README.md)
- [API documentation](backend/docs/) (Google sign-in, profile, settings, pets)
- [Frontend README](frontend/README.md)


## Technologies

The team has chosen React (PWA) for the client, Node.js with Express for the API, PostgreSQL for the database, and Render for hosting. The table lists these and the planned integrations; it does not indicate that they have already been implemented.

| Technology or service | Planned role in this project | Reason for use or important constraint |
| --- | --- | --- |
| Google Maps API | Display nearby helpers as markers on a map. | Location helps owners find suitable nearby care. |
| Google Calendar API | Create calendar events and reminders after booking acceptance. | Both parties need reminders for the care period; calendar access requires authorization. |
| QR code service | Generate QR codes for service start and completion confirmation. | Supports confirmation during physical meetings; in-app buttons support confirmation when the parties are apart. |
| OAuth 2.0 / Google OpenID Connect | Support sign-in through an external provider Google. | Sign-in is separate from administrator verification, which is required before users can send or receive booking requests. |
| React PWA | One client for all roles: owners and helpers on phones, administrators in a desktop browser. | One codebase for mobile and desktop; installation and device features depend on the browser [ADR-01](docs/4-Architecture-and-Design.md#adr-01-choosing-react-pwa-over-native-mobile). |
| Node.js with Express | API that applies the business rules and is the only part that accesses the database. | One language across client and server [4.1](docs/4-Architecture-and-Design.md#41-solution-strategy). |
| PostgreSQL | Stores users, pets, listings, bookings, confirmations, messages, reviews and disputes. | Constraints and transactions prevent double bookings [ADR-02](docs/4-Architecture-and-Design.md#adr-02-choosing-postgresql-for-relational-data-integrity). |
| Render | Hosts the deployed application. | Chosen hosting platform; details follow in Deployment. |


## Team Members

| Member | Main role or contribution |
| --- | --- |
| Marta Cekić | Project organization, documentation, development |
| Borna Krpan | Backend development and integration |
| Mato Marunović | Frontend development and integration |
| Tomislav Miletić | Documentation, development and integration |
| Fran Ivanković | Documentation, Frontend development and integration |

Roles may change during the project. The repository and the agreed task tracker provide supporting evidence of teamwork.

## Contributing

Tasks are assigned and their progress is tracked on the team's Trello board. Documentation and code changes are made on separate branches and merged into the main branch through pull requests after review.

<!-- TODO: Add the link to the team's Trello board. "The team's task board: [Trello board](<paste link>)" -->

<a id="license"></a>
## License [![CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**License status:** The documentation in this repository is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

No public reuse license has been granted for the original application source code.

You may share and adapt the documentation provided that you give appropriate credit, indicate any changes, use it only for non-commercial purposes, and distribute adaptations under the same license.

Third-party code, datasets, images, icons, and other assets retain their own licenses and attribution requirements.

<!-- TODO: Link additional credits where relevant. -->

<a id="ai-usage"></a>
## AI Usage [![AI Usage: Disclosed](https://img.shields.io/badge/AI%20Usage-Disclosed-blue.svg)](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf)

This project follows FER's [Policy on the Appropriate Use of Artificial Intelligence](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf).

**Statement:** AI tools were used to draft and revise project documentation based on the PetPals project description and the course templates:

- **OpenAI Codex:** Code drafting and debugging.
- **Claude by Anthropic:** Drafting and revising project documentation.

Team members are responsible for reviewing and editing AI-assisted material before accepting it and for being able to explain their own contributions.


<a id="code-of-conduct-and-support"></a>
## Code of Conduct and Support [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Team members are expected to follow the **STUDENT CODE OF CONDUCT** of the Faculty of Electrical Engineering and Computing, University of Zagreb, the course teamwork guidelines, and the [IEEE Code of Ethics](https://www.ieee.org/about/corporate/governance/p7-8.html).

See the repository's [Code of Conduct](CODE_OF_CONDUCT.md).

---

**Course documentation template:** Documentation structure adapted from the FER Software Engineering course template by [Vlado Sruk](https://www.fer.unizg.hr/en/vlado.sruk), licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The application and its content are being created by the student team named above.
