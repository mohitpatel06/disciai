const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { getAIFeedback, aiChat } = require("../controllers/aiController");

router.post("/feedback", protect, getAIFeedback);
router.post("/chat", protect, aiChat);

module.exports = router;