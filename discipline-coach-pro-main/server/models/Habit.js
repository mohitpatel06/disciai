// server/models/Habit.js - Habit schema definition
const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  studyHours: {
    type: Number,
    default: 0,
  },
  workout: {
    type: Number, // in minutes
    default: 0,
  },
  sleepHours: {
    type: Number,
    default: 0,
  },
  junkFood: {
    type: Boolean,
    default: false,
  },
  waterIntake: {
    type: Number, // glasses
    default: 0,
  },
  mood: {
    type: String,
    enum: ["great", "good", "neutral", "bad", "terrible"],
  },
  disciplineScore: {
    type: Number,
    default: 0,
  },
  aiFeedback: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Habit", habitSchema);
