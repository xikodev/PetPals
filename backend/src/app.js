const express = require("express");
const exampleRoutes = require("./modules/example/example.routes");
const { readAuthConfig } = require('./modules/auth/auth.config');
const { createAuthRepository } = require('./modules/auth/auth.repository');
const { createGoogleProvider } = require('./modules/auth/google.provider');
const { createAuthRouter, createAuthHandlers } = require('./modules/auth/auth.routes');
const { createUsersRepository } = require('./modules/users/users.repository');
const { createUsersRouter } = require('./modules/users/users.routes');

const app = express();

// Parse incoming JSON request bodies.
app.use(express.json({ limit: '16kb' }));

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/examples", exampleRoutes);

// Lazy pool access keeps importing the app independent of a live database.
const database = {
  query: (...args) => require('./db').query(...args),
  connect: (...args) => require('./db').connect(...args),
};
const authConfig = readAuthConfig();
const authDependencies = {
  config: authConfig,
  repository: createAuthRepository(database),
  google: createGoogleProvider(authConfig),
};
app.use('/api/auth', createAuthRouter(authDependencies));
app.use('/api/users', createUsersRouter({
  repository: createUsersRepository(database),
  loadSession: createAuthHandlers(authDependencies).loadSession,
}));

// Return 404 for endpoints that don't exist.
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = app;
