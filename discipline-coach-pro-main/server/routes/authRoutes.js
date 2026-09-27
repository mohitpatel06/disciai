const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);
router.get("/goals", protect, authController.getGoals);
router.put("/goals", protect, authController.updateGoals);
router.post("/onboarding", protect, authController.handleOnboarding);

router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;