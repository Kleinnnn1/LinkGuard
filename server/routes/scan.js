const express = require("express");
const router = express.Router();
const { checkUrl, getHistory } = require("../controllers/scanController");

router.post("/", checkUrl);
router.get("/history", getHistory);

module.exports = router;