function createDatabaseConfig(env = process.env) {
  if (env.DB_SSL && !["true", "false"].includes(env.DB_SSL)) {
    throw new Error("DB_SSL must be true or false");
  }

  const config = {
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  if (env.DATABASE_URL) {
    const url = new URL(env.DATABASE_URL);
    const urlHasSsl = ["sslmode", "sslcert", "sslkey", "sslrootcert"]
      .some((key) => url.searchParams.has(key));
    if (env.DB_SSL && urlHasSsl) {
      throw new Error("Use DB_SSL or DATABASE_URL SSL options, not both");
    }
    config.connectionString = env.DATABASE_URL;
  } else {
    for (const key of ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]) {
      if (!env[key]) throw new Error(`Missing database setting: ${key}`);
    }
    const port = Number(env.DB_PORT || 5432);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("DB_PORT must be a valid port number");
    }
    Object.assign(config, {
      host: env.DB_HOST,
      port,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    });
  }

  // Omit SSL configuration when unset so URL sslmode parameters can be used.
  if (env.DB_SSL) {
    config.ssl = env.DB_SSL === "true" ? { rejectUnauthorized: true } : false;
  }

  return config;
}

module.exports = { createDatabaseConfig };
