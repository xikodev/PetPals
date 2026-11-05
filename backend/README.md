# Backend workflow

The backend uses Node.js and Express. Files use CommonJS: `require()` imports
another module, and `module.exports` makes functions or objects available to it.

## Run locally

From the repository root:

```bash
cd backend
npm ci
npm run db:check
npm start
```

Create `backend/.env` from `.env.example` and enter your database settings before
running these commands. The backend loads this file automatically, even when
started from another directory. Environment variables provided by the shell,
Docker, or Render take precedence over `.env` values.

The server listens on port `10000` by default. Override it with
`PORT=3000 npm start`. Startup runs `SELECT 1` and only starts the HTTP server if
the database is reachable. `npm run db:check` checks the connection without
starting HTTP or changing database data. SIGTERM/SIGINT close the HTTP server
and database pool.

## Folder responsibilities

```text
src/
├── app.js                       # Configure Express and mount routes
├── server.js                    # Import the app and start listening
├── config/environment.js        # Load local .env without overriding runtime variables
├── db/                          # PostgreSQL pool, configuration and connection check
├── middleware/                  # Future shared request handlers, e.g. authentication
└── modules/
    └── example/
        ├── example.routes.js     # Match URLs and HTTP methods to controllers
        ├── example.controller.js # Read requests and send HTTP responses
        ├── example.service.js    # Coordinate work and apply application rules
        └── example.repository.js # Read and write data
```

Keep `app.js` small: configure middleware and register feature routers here.
`server.js` starts the server separately, so other code can import the app for
testing without immediately opening a network port.

## How the example works

```text
GET /api/examples
  → app.js mounts the example router at /api/examples
  → example.routes.js matches GET /
  → example.controller.js calls the service and sends JSON
  → example.service.js calls the repository
  → example.repository.js returns example data
```

The imports follow the same chain: server → app → routes → controller → service
→ repository. Results return back up the chain to the controller.

Try these requests while the server is running:

```bash
curl http://localhost:10000/health
# {"status":"healthy"}

curl http://localhost:10000/api/examples
# [{"id":1,"name":"Example pet"}]
```

`GET /` returns `API running`. Unknown endpoints return HTTP `404` with
`{"error":"Not found"}`. JSON request bodies are parsed by `express.json()`
before reaching the routes.

The example repository still uses in-memory data; no application tables or
schema have been created. The backend uses `pg` (node-postgres) for direct SQL
queries without an ORM. Import the shared pool from `db/` into repositories:

```js
const db = require("../../db");

async function findById(id) {
  // Example only: create the pets table before using this query.
  const result = await db.query("SELECT * FROM pets WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

module.exports = { findById };
```

Pass user input as parameters (`$1`, `$2`, etc.), never by concatenating it into
SQL. For transactions, acquire a client with `await db.connect()`, run
`BEGIN`/queries/`COMMIT` on that same client, roll back on failure, and always
release the client in `finally`.

For asynchronous database calls, make the repository, service, and controller
functions `async` and `await` their results. Express 5 forwards rejected promises
from async route handlers to its error handling; add shared error middleware
when the application needs consistent JSON error responses.

## Database settings and deployment

Use either `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, or a
`DATABASE_URL`. If both are present, `DATABASE_URL` takes precedence. `DB_SSL=true`
enables TLS with certificate verification; use it for the Render external
database endpoint. `DB_SSL=false` is intended for local PostgreSQL. If SSL is
configured through URL parameters such as `sslmode`, leave `DB_SSL` unset.

For Render's internal URL on its private network, use `DB_SSL=false` for a
connection without TLS. The backend and database must be in the same Render
account and region. Internal TLS uses self-signed certificates, so the
certificate-verifying `DB_SSL=true` option is intended for the external endpoint.

In Render, set `DATABASE_URL` and `DB_SSL` under the **backend service's
Environment settings**. Alternatively, set the individual `DB_*` fields there.
The local `.env` is not uploaded to Render or baked into the Docker image.

For a standalone Docker container, inject the local settings at runtime:

```bash
docker build -t petpals-backend ./backend
docker run --rm --env-file backend/.env -p 10000:10000 petpals-backend
```

The repository's `docker-compose.yml` intentionally uses its own local Postgres
service (`db`) and `DB_SSL=false`, not the hosted Render database. Its environment
variables override `.env`. No `env_file` is needed for this local setup.

`.gitignore` and the backend `.dockerignore` exclude `.env` and `.env.*` secrets;
`.env.example` contains placeholders and remains available to the team. Keep
credentials out of source files, Dockerfiles, and tracked deployment YAML.

## Add a feature

1. Create a module folder, such as `src/modules/pets/`.
2. Define its routes, controllers, services, and repositories using the example
   as a starting point. Keep HTTP details in controllers and database queries
   in repositories.
3. Import its router in `app.js` and mount it before the final 404 handler:

   ```js
   const petRoutes = require("./modules/pets/pets.routes");
   app.use("/api/pets", petRoutes);
   ```

4. Validate incoming fields before using them, and add authentication middleware
   to routes that require a signed-in user.

`npm test` runs database configuration tests using Node's built-in test runner.
It does not connect to the database; use `npm run db:check` for a live connection
check.

