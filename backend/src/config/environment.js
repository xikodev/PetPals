const path = require("node:path");

// Environment variables supplied by Render or Docker take precedence.
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
  quiet: true,
});
