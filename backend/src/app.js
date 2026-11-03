const express = require("express");
const exampleRoutes = require("./modules/example/example.routes");

const app = express();

// Parse incoming JSON request bodies.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/examples", exampleRoutes);

// Return 404 for endpoints that don't exist.
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = app;
