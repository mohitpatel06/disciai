const axios = require("axios");
const Habit = require("../models/Habit");

// @desc    AI Chat with conversation history
// @route   POST /api/ai/chat
const aiChat = async (req, res) => {
  try {
    const { messages } = req.body;

    // User ki latest habits fetch karo for context
    const recentHabits = await Habit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(7);

    // Habit summary banao
    const habitSummary = recentHabits.length > 0
      ? recentHabits.map((h) =>
        `Date: ${new Date(h.createdAt).toLocaleDateString()}, Study: ${h.studyHours}h, Workout: ${h.workout}min, Sleep: ${h.sleepHours}h, Water: ${h.waterIntake} glasses, Score: ${h.disciplineScore}/100`
      ).join("\n")
      : "No recent habits found.";

    // System prompt
    const systemPrompt = `You are DisciAI — a friendly, personal AI discipline coach for ${req.user.name}.

Your job is to help ${req.user.name} improve their daily habits, discipline, and productivity.

Here are ${req.user.name}'s recent habit entries for context:
${habitSummary}

Rules:
- Always address the user by their first name: ${req.user.name}
- Be warm, encouraging, and practical
- Give specific advice based on their habit data when relevant
- Keep responses concise and actionable
- Use emojis to make responses engaging
- Never give generic advice — always personalize based on their data`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    console.log("AI Chat Error:", error.message);
    res.status(500).json({ message: "AI chat unavailable" });
  }
};

// @desc    Get AI feedback for a specific habit entry
// @route   POST /api/ai/feedback
const getAIFeedback = async (req, res) => {
  res.status(200).json({ message: "AI feedback endpoint" });
};

// @desc    Get AI-generated discipline tips
// @route   GET /api/ai/tips
const getDisciplineTips = async (req, res) => {
  res.status(200).json({ message: "AI tips endpoint" });
};

module.exports = { getAIFeedback, getDisciplineTips, aiChat };