const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createHabit, getHabits } = require("../controllers/habitController");

// CREATE HABIT
router.post("/", protect, createHabit);

// GET HABITS
router.get("/", protect, getHabits);

module.exports = router;