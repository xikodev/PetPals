require("../config/environment");
const { Pool } = require("pg");
const { createDatabaseConfig } = require("./config");

const pool = new Pool(createDatabaseConfig());

pool.on("error", (error) => {
  // Do not log connection strings or credentials.
  console.error("Unexpected idle database connection error", error.code || "UNKNOWN");
});

module.exports = pool;
