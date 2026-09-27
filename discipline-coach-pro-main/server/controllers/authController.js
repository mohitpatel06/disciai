const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const getJwtSecret = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const secret = process.env.JWT_SECRET || (!isProduction ? "dev_jwt_secret" : undefined);
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      emailVerificationToken: hashedVerificationToken
    });

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    console.log("Verify URL (Dev Test):", verifyUrl);
    
    try {
      await resend.emails.send({
        from: 'DisciAI <no-reply@disciai.mohitpatel.me>',
        to: email,
        subject: 'Email Verification - DisciAI',
        html: `<h2>Welcome to DisciAI!</h2>
               <p>Please click the link below to verify your email address:</p>
               <a href="${verifyUrl}" target="_blank">Verify Email</a>
               <p>If you didn't request this, please ignore this email.</p>`
      });
    } catch (err) {
      console.error("Resend Email Error:", err);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "Please verify your email before logging in."
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Please verify your email to login", needsVerification: true });
    }
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Goals
const getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user.goals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Goals
const updateGoals = async (req, res) => {
  try {
    const { studyHours, workout, sleepHours, waterIntake } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.goals = {
      studyHours: Number(studyHours) || 6,
      workout: Number(workout) || 30,
      sleepHours: Number(sleepHours) || 8,
      waterIntake: Number(waterIntake) || 8,
    };
    await user.save();
    res.status(200).json(user.goals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Generate Starter Habits based on Focus Areas
const generateStarterHabits = (focusAreas) => {
  const habitMap = {
    productivity: [
      { name: "Deep Work Session", category: "Work", target: 120, unit: "minutes" },
      { name: "Daily Goals", category: "Planning", target: 3, unit: "goals" },
      { name: "Screen Time Limit", category: "Focus", target: 480, unit: "minutes" },
    ],
    fitness: [
      { name: "Workout", category: "Exercise", target: 30, unit: "minutes" },
      { name: "Water Intake", category: "Hydration", target: 8, unit: "glasses" },
      { name: "Sleep", category: "Rest", target: 8, unit: "hours" },
    ],
    sleep: [
      { name: "Sleep Duration", category: "Rest", target: 8, unit: "hours" },
      { name: "Sleep Schedule", category: "Routine", target: 0, unit: "on-time" },
      { name: "No Screen Time Before Bed", category: "Digital Wellness", target: 0, unit: "minutes" },
    ],
    "mental-wellness": [
      { name: "Meditation", category: "Mindfulness", target: 10, unit: "minutes" },
      { name: "Journaling", category: "Reflection", target: 15, unit: "minutes" },
      { name: "Sleep", category: "Rest", target: 8, unit: "hours" },
    ],
    focus: [
      { name: "Deep Work", category: "Concentration", target: 120, unit: "minutes" },
      { name: "Pomodoro Sessions", category: "Technique", target: 4, unit: "sessions" },
      { name: "Screen Time Limit", category: "Distractions", target: 480, unit: "minutes" },
    ],
    discipline: [
      { name: "Daily Routine", category: "Habit", target: 8, unit: "hours" },
      { name: "Goal Completion", category: "Achievement", target: 5, unit: "goals" },
      { name: "Consistency Streak", category: "Tracking", target: 30, unit: "days" },
    ],
    health: [
      { name: "Workout", category: "Exercise", target: 30, unit: "minutes" },
      { name: "Water Intake", category: "Hydration", target: 8, unit: "glasses" },
      { name: "Healthy Meals", category: "Nutrition", target: 3, unit: "meals" },
    ],
    "work-life-balance": [
      { name: "Work Hours", category: "Work", target: 8, unit: "hours" },
      { name: "Personal Time", category: "Leisure", target: 2, unit: "hours" },
      { name: "Sleep", category: "Rest", target: 8, unit: "hours" },
    ],
  };

  let starterHabits = [];
  focusAreas.forEach((area) => {
    if (habitMap[area]) {
      starterHabits = [...starterHabits, ...habitMap[area]];
    }
  });

  // Remove duplicates by name
  const uniqueHabits = Array.from(
    new Map(starterHabits.map((h) => [h.name, h])).values()
  );

  return uniqueHabits;
};

// ✅ Onboarding Handler
const handleOnboarding = async (req, res) => {
  try {
    const { focusAreas } = req.body;

    if (!focusAreas || !Array.isArray(focusAreas) || focusAreas.length === 0) {
      return res.status(400).json({ message: "Please select at least one focus area" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save focus areas to user
    user.focusAreas = focusAreas;
    await user.save();

    // Generate starter habits
    const starterHabits = generateStarterHabits(focusAreas);

    res.status(200).json({
      message: "Onboarding completed",
      focusAreas,
      starterHabits,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Verify Email
const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ emailVerificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Resend Verification Email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    user.emailVerificationToken = hashedVerificationToken;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    await resend.emails.send({
      from: 'DisciAI <no-reply@disciai.mohitpatel.me>',
      to: user.email,
      subject: 'Email Verification - DisciAI',
      html: `<h2>Welcome to DisciAI!</h2>
             <p>Please click the link below to verify your email address:</p>
             <a href="${verifyUrl}" target="_blank">Verify Email</a>
             <p>If you didn't request this, please ignore this email.</p>`
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    console.log("Reset URL (Dev Test):", resetUrl);
    
    await resend.emails.send({
      from: 'DisciAI <no-reply@disciai.mohitpatel.me>',
      to: user.email,
      subject: 'Password Reset - DisciAI',
      html: `<h2>Password Reset Request</h2>
             <p>You requested a password reset. Click the link below to set a new password:</p>
             <a href="${resetUrl}" target="_blank">Reset Password</a>
             <p>This link is valid for 10 minutes. If you didn't request this, please ignore this email.</p>`
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getGoals,
  updateGoals,
  handleOnboarding,
  generateStarterHabits,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};