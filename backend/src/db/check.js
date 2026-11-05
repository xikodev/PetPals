const db = require("./index");

async function check() {
  try {
    await db.query("SELECT 1 AS connected");
    console.log("PostgreSQL connection successful");
  } catch (error) {
    console.error("PostgreSQL connection failed", error.code || "UNKNOWN");
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

check();
