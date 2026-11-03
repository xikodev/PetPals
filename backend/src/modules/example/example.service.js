const exampleRepository = require("./example.repository");

// Services coordinate data access and apply application rules when needed.
function listExamples() {
  return exampleRepository.findAll();
}

module.exports = { listExamples };
