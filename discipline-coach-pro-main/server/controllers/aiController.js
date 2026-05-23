const axios = require("axios");
const Habit = require("../models/Habit");
const Chat = require("../models/Chat");

// @desc    AI Chat
// @route   POST /api/ai/chat
const aiChat = async (req, res) => {
  try {
    const { messages } = req.body;
    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m) => m.role === "user")
      : null;

    const recentHabits = await Habit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(7);

    const habitSummary = recentHabits.length > 0
      ? recentHabits.map((h) =>
        `Date: ${new Date(h.createdAt).toLocaleDateString()}, Study: ${h.studyHours}h, Workout: ${h.workout}min, Sleep: ${h.sleepHours}h, Water: ${h.waterIntake} glasses, Score: ${h.disciplineScore}/100`
      ).join("\n")
      : "No recent habits found.";

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

    if (lastUserMessage) {
      await Chat.create({
        userId: req.user._id,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    await Chat.create({
      userId: req.user._id,
      role: "assistant",
      content: reply,
    });

    res.status(200).json({ reply });

  } catch (error) {
    console.log("AI Chat Error:", error.message);
    res.status(500).json({ message: "AI chat unavailable" });
  }
};

// @desc    Get AI chat history for current user
// @route   GET /api/ai/history
const getChatHistory = async (req, res) => {
  try {
    const history = await Chat.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.status(200).json(history);
  } catch (error) {
    console.log("Get Chat History Error:", error.message);
    res.status(500).json({ message: "Unable to fetch chat history" });
  }
};

// @desc    Delete AI chat history for current user
// @route   DELETE /api/ai/history
const clearChatHistory = async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user._id });
    res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    console.log("Clear Chat History Error:", error.message);
    res.status(500).json({ message: "Unable to clear chat history" });
  }
};

// @desc    Get AI feedback
// @route   POST /api/ai/feedback
const getAIFeedback = async (req, res) => {
  res.status(200).json({ message: "AI feedback endpoint" });
};

// @desc    Get AI discipline tips
// @route   GET /api/ai/tips
const getDisciplineTips = async (req, res) => {
  res.status(200).json({ message: "AI tips endpoint" });
};

// ✅ AI Burnout Detector
// @desc    Analyze last 7 days habits and detect burnout risk
// @route   GET /api/ai/burnout
const detectBurnout = async (req, res) => {
  try {
    const recentHabits = await Habit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(7);

    // Minimum 3 entries chahiye analysis ke liye
    if (recentHabits.length < 3) {
      return res.status(200).json({
        risk: "insufficient_data",
        message: "Log at least 3 days of habits to get burnout analysis.",
      });
    }

    const userName = req.user.name || "there";

    // Habit summary for AI
    const habitSummary = recentHabits.map((h) =>
      `Date: ${new Date(h.createdAt).toLocaleDateString()}
Score: ${h.disciplineScore}/100
Sleep: ${h.sleepHours}h
Workout: ${h.workout}min
Water: ${h.waterIntake} glasses
Mood: ${h.mood}
Junk Food: ${h.junkFood ? "Yes" : "No"}
Study Hours: ${h.studyHours || 0}h
Work Hours: ${h.workHours || 0}h`
    ).join("\n---\n");

    const prompt = `You are a burnout detection AI specialist analyzing habit data for ${userName}.

Analyze the following last ${recentHabits.length} days of habit data and detect burnout risk:

${habitSummary}

Based on this data, provide a burnout risk assessment. Look for these burnout signals:
- Consistently declining discipline scores
- Poor sleep (less than 6 hours)
- No workout or exercise
- Bad or terrible mood patterns
- Low water intake
- High junk food consumption
- Declining streaks

Respond in EXACTLY this JSON format (no extra text, no markdown):
{
  "risk": "high" or "medium" or "low",
  "score": <burnout risk percentage 0-100>,
  "title": "<short alert title>",
  "message": "<2-3 sentences personalized message to ${userName} about their burnout risk>",
  "signals": ["<signal 1>", "<signal 2>", "<signal 3>"],
  "actions": ["<action 1>", "<action 2>", "<action 3>"]
}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data.choices[0].message.content;

    // JSON parse karo
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    res.status(200).json(result);

  } catch (error) {
    console.log("Burnout Detection Error:", error.message);
    res.status(500).json({ message: "Burnout detection unavailable" });
  }
};

module.exports = { getAIFeedback, getDisciplineTips, aiChat, detectBurnout, getChatHistory, clearChatHistory };