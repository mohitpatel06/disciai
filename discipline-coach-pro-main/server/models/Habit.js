const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userType: { type: String, enum: ["student", "professional", "general"], default: "general" },

  // Common fields
  sleepHours: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 },
  workout: { type: Number, default: 0 },
  mood: { type: String, default: "neutral" },
  junkFood: { type: Boolean, default: false },

  // Student fields
  studyHours: { type: Number, default: 0 },
  assignmentsDone: { type: Number, default: 0 },
  revisionDone: { type: Boolean, default: false },

  // Professional fields
  workHours: { type: Number, default: 0 },
  meetingsAttended: { type: Number, default: 0 },
  screenTime: { type: Number, default: 0 },
  stressLevel: { type: String, default: "low" },

  // General fields
  readingMinutes: { type: Number, default: 0 },
  meditationMinutes: { type: Number, default: 0 },
  outdoorTime: { type: Number, default: 0 },

  // AI + Score
  disciplineScore: { type: Number, default: 0 },
  aiFeedback: { type: String, default: "" },
  streak: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Habit", habitSchema);