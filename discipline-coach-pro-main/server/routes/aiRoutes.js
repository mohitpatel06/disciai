// server/routes/aiRoutes.js
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware"); // ✅ FIXED
const { getAIFeedback } = require("../controllers/aiController");

router.post("/feedback", protect, getAIFeedback);

module.exports = router;