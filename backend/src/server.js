require("./config/environment");
const app = require("./app");
const db = require("./db");

const port = process.env.PORT || 10000;

async function start() {
  try {
    await db.query("SELECT 1 AS connected");
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on 0.0.0.0:${port}`);
    });

    for (const signal of ["SIGTERM", "SIGINT"]) {
      process.once(signal, () => {
        server.close(async () => {
          await db.end();
        });
      });
    }
  } catch (error) {
    console.error("Database startup check failed", error.code || "UNKNOWN");
    await db.end();
    process.exitCode = 1;
  }
}

start();
