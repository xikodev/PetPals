const test = require("node:test");
const assert = require("node:assert/strict");
const { createDatabaseConfig } = require("../src/db/config");

const settings = {
  DB_HOST: "localhost",
  DB_USER: "testuser",
  DB_PASSWORD: "testpassword",
  DB_NAME: "testdb",
};

test("connects using separate settings, including passwords with URL characters", () => {
  const config = createDatabaseConfig({ ...settings, DB_PASSWORD: "p@ss:/?#", DB_PORT: "5433" });
  assert.equal(config.host, "localhost");
  assert.equal(config.user, "testuser");
  assert.equal(config.password, "p@ss:/?#");
  assert.equal(config.database, "testdb");
  assert.equal(config.port, 5433);
});

test("DATABASE_URL takes precedence over individual settings", () => {
  const url = "postgresql://user:password@db:5432/appdb";
  const config = createDatabaseConfig({ ...settings, DATABASE_URL: url });
  assert.equal(config.connectionString, url);
  assert.equal(config.host, undefined);
});

test("external TLS verifies certificates and local TLS can be disabled", () => {
  assert.deepEqual(createDatabaseConfig({ ...settings, DB_SSL: "true" }).ssl, { rejectUnauthorized: true });
  assert.equal(createDatabaseConfig({ ...settings, DB_SSL: "false" }).ssl, false);
});

test("URL SSL settings are preserved when DB_SSL is not set", () => {
  const url = "postgresql://user:password@db/appdb?sslmode=verify-full";
  const config = createDatabaseConfig({ DATABASE_URL: url });
  assert.equal(config.connectionString, url);
  assert.equal(config.ssl, undefined);
});

test("rejects conflicting SSL configuration", () => {
  assert.throws(() => createDatabaseConfig({
    DATABASE_URL: "postgresql://user:password@db/appdb?sslmode=require",
    DB_SSL: "true",
  }), /Use DB_SSL or DATABASE_URL SSL options/);
});

test("reports missing settings without exposing credentials", () => {
  assert.throws(() => createDatabaseConfig({ DB_PASSWORD: "secret" }), {
    message: "Missing database setting: DB_HOST",
  });
});

test("rejects invalid ports and SSL settings", () => {
  for (const port of ["abc", "0", "65536", "1.5"]) {
    assert.throws(() => createDatabaseConfig({ ...settings, DB_PORT: port }), /DB_PORT/);
  }
  assert.throws(() => createDatabaseConfig({ ...settings, DB_SSL: "yes" }), /DB_SSL/);
});
