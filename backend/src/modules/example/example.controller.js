const exampleService = require("./example.service");

// Controllers handle HTTP requests and responses.
function listExamples(req, res) {
  const examples = exampleService.listExamples();
  res.json(examples);
}

module.exports = { listExamples };
