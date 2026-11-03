const express = require("express");
const exampleController = require("./example.controller");

const router = express.Router();

// Mounted at /api/examples in app.js.
router.get("/", exampleController.listExamples);

module.exports = router;
