# PetPals Frontend

The PetPals frontend is a React application built with Vite. It uses React Router for navigation. The current version includes a home page, routes for login, registration, profile, My pets and My listings, and a login check for the protected pages.

## Run locally

Install Node.js and npm. The setup was tested with Node.js 24 and npm 11.

From the repository root, run:

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Keep the terminal running while working on the app.

## Project structure

| Path              | Purpose                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/main.jsx`    | Starts React and configures `BrowserRouter`.                                                                 |
| `src/App.jsx`     | Defines the routes, shared navigation and layout.                                                            |
| `src/pages/`      | Contains page components, including `HomePage.jsx`.                                                          |
| `src/components/` | Contains reusable components, including `RequireLogin.jsx`.                                                  |
| `src/api/`        | Contains functions for checking the session and accessing profile and listings data.                         |
| `src/context/`    | Reserved for state shared across components.                                                                 |
| `vite.config.js`  | Configures Vite and the local API proxy.                                                                     |
| `nginx.conf.template`      | Serves the built frontend and directs page requests to `index.html` so React Router can handle direct links. |



## Routes

| URL            | Access    | Current behavior                                               |
| -------------- | --------- | -------------------------------------------------------------- |
| `/`            | Public    | Introduces PetPals, planned services and booking flow, with links to profile/sign-in.                                        |
| `/login`       | Public    | Provides the Google sign-in link. A signed-in user is sent to `/profile`; a user who has not finished registration is sent to `/register`.                        |
| `/profile`     | Protected | Checks the session, then loads and edits the current profile.  |
| `/my-listings` | Protected | Checks the session, then displays an empty mocked listings list. |
| `/register`    | Public (only usable after the first Google sign-in) | Choose owner or helper and enter the first and last name, then go to `/profile`. A registered user is sent to `/profile`. |
| `/my-pets`     | Protected | Owners list, add, edit and delete their pets. |

## Backend and mock data

During local development, frontend code uses relative URLs such as `/api/auth/me`. Vite forwards requests starting with `/api` to `http://localhost:10000`.

Registration uses `POST /api/auth/register` and logout uses `POST /api/auth/logout`, both with the session CSRF token. My pets uses GET, POST, PATCH and DELETE on `/api/pets`. 

`src/api/auth.js` calls `GET /api/auth/me` to check the current session. A `401` response redirects a visitor from a protected page to `/login`. If the backend is unavailable, the page displays an error message.

Profile reads use `GET /api/users/me` and return `profile`, `pets`, and `active_listings`. Profile edits use `PATCH /api/users/me` with the changed fields and the session CSRF token. The update returns the saved `profile`. The My Listings page still uses a mock that returns an empty list.

### Test guest access without the backend

Create `frontend/.env.local` with this line:

```env
VITE_MOCK_GUEST=true
```

Restart `npm run dev`, then open `/profile` or `/my-listings` directly. Both should redirect to `/login`. To test a real session, set `VITE_MOCK_GUEST=false`, restart Vite and run the backend with `/api/auth/me` available. Keep `.env.local` on your own machine.

## Add a page

1. Create a component in `src/pages/`, for example `AboutPage.jsx`, and export it.
2. Import the component in `src/App.jsx`.
3. Add its route under the shared layout, for example `<Route path="about" element={<AboutPage />} />`.
4. For a page that requires login, place its route inside the existing `<Route element={<RequireLogin />}>` group.
5. If the page belongs in the navigation, add a `<Link>` to it in `Layout`. Put its data-access functions in `src/api/`.

## Check and build

From `frontend/`, run:

```sh
npm run lint
npm run build
```

Vite writes the production build to `dist/`. To check the Docker build, run this command from the repository root:

```sh
docker compose build frontend
```

The homepage describes discovery and booking as future features. New users complete registration (role and name) on the /register page after the first Google sign-in; see [Google sign-in](../backend/docs/google-auth.md).
