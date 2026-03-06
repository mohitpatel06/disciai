// server/controllers/aiController.js - AI feedback controller

// @desc    Get AI feedback for a specific habit entry
// @route   POST /api/ai/feedback
const getAIFeedback = async (req, res) => {
  // TODO: implement AI feedback logic
  // - Receive habit data from request body
  // - Call aiService to generate feedback
  // - Return AI-generated feedback
  res.status(200).json({ message: "AI feedback endpoint" });
};

// @desc    Get AI-generated discipline tips
// @route   GET /api/ai/tips
const getDisciplineTips = async (req, res) => {
  // TODO: implement discipline tips logic
  // - Optionally use user's habit history for personalization
  // - Call aiService for tips
  // - Return tips
  res.status(200).json({ message: "AI tips endpoint" });
};

module.exports = { getAIFeedback, getDisciplineTips };
