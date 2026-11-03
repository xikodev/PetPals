# Backend workflow

The backend uses Node.js and Express. Files use CommonJS: `require()` imports
another module, and `module.exports` makes functions or objects available to it.

## Run locally

From the repository root:

```bash
cd backend
npm ci
npm start
```

The server listens on port `10000` by default. Override it with
`PORT=3000 npm start`. The current server reads environment variables from the
process; it does not automatically load `.env` files.

## Folder responsibilities

```text
src/
├── app.js                       # Configure Express and mount routes
├── server.js                    # Import the app and start listening
├── db/                          # Future database connection and shared DB setup
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

The example repository uses in-memory data. PostgreSQL is configured in the
repository's Docker Compose file, but this backend does not connect to it yet.
`db/` and `middleware/` are currently placeholders. When adding database access,
import the connection from `db/` into repositories and use parameterized queries.
For asynchronous database calls, make the repository, service, and controller
functions `async` and `await` their results. Express 5 forwards rejected promises
from async route handlers to its error handling; add shared error middleware
when the application needs consistent JSON error responses.

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

The current `npm test` command is a placeholder that prints a success message;
it does not run automated tests.

