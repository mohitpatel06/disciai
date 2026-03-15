const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ✅ Goals field add kiya
  goals: {
    studyHours: { type: Number, default: 6 },
    workout: { type: Number, default: 30 },
    sleepHours: { type: Number, default: 8 },
    waterIntake: { type: Number, default: 8 },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);