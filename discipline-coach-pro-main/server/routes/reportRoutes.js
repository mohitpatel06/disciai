// server/routes/reportRoutes.js
const express = require("express");
const router = express.Router();

const { getWeeklyReport, getMonthlyReport } = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware"); // ✅ FIXED

router.get("/weekly", protect, getWeeklyReport);
router.get("/monthly", protect, getMonthlyReport);

module.exports = router;