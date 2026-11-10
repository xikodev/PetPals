# PetPals Frontend

The PetPals frontend is a React application built with Vite. It uses React Router for navigation. The current version includes a home page, routes for login, profile and listings, and a login check for the protected pages.

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
| `nginx.conf`      | Serves the built frontend and directs page requests to `index.html` so React Router can handle direct links. |

## Routes

| URL            | Access    | Current behavior                                               |
| -------------- | --------- | -------------------------------------------------------------- |
| `/`            | Public    | Displays the home page.                                        |
| `/login`       | Public    | Displays the login screen placeholder.                         |
| `/profile`     | Protected | Checks the session before displaying the profile placeholder.  |
| `/my-listings` | Protected | Checks the session before displaying the listings placeholder. |

## Backend and mock data

During local development, frontend code uses relative URLs such as `/api/me`. Vite forwards requests starting with `/api` to `http://localhost:10000`.

`src/api/auth.js` calls `GET /api/me` to check the current session. A `401` response redirects a visitor from a protected page to `/login`. If the backend is unavailable, the page displays an error message.

Profile and listings data are currently mocked in `src/api/`. The profile mock supports reading and updating the first and last name. Changes last until the page is reloaded. The listings mock returns an empty list.

### Test guest access without the backend

Create `frontend/.env.local` with this line:

```env
VITE_MOCK_GUEST=true
```

Restart `npm run dev`, then open `/profile` or `/my-listings` directly. Both should redirect to `/login`. To test a real session, set `VITE_MOCK_GUEST=false`, restart Vite and run the backend with `/api/me` available. Keep `.env.local` on your own machine.

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
