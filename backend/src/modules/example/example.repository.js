// Temporary example data. Replace with database queries when PostgreSQL is connected.
const examples = [{ id: 1, name: "Example pet" }];

// Repositories handle data access without knowing about HTTP requests.
function findAll() {
  return examples.map((example) => ({ ...example }));
}

module.exports = { findAll };
