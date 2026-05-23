const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { getAIFeedback, aiChat, detectBurnout, getChatHistory, clearChatHistory } = require("../controllers/aiController");

router.post("/feedback", protect, getAIFeedback);
router.post("/chat", protect, aiChat);
router.get("/history", protect, getChatHistory);
router.delete("/history", protect, clearChatHistory);
router.get("/burnout", protect, detectBurnout); // ✅ New route

module.exports = router;