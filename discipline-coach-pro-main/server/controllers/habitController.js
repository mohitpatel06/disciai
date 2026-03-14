const Habit = require("../models/Habit");
const axios = require("axios");

const createHabit = async (req, res) => {
  try {
    const {
      studyHours,
      workout,
      sleepHours,
      waterIntake,
      junkFood,
      mood,
    } = req.body;

    let score = 0;
    if (Number(studyHours) >= 4) score += 20;
    if (Number(workout) >= 20) score += 20;
    if (Number(sleepHours) >= 7) score += 20;
    if (Number(waterIntake) >= 8) score += 20;
    if (junkFood === false) score += 20;

    // Streak calculate karna
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const lastHabit = await Habit.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });

    let newStreak = 1;

    if (lastHabit) {
      const lastDate = new Date(lastHabit.createdAt);
      lastDate.setHours(0, 0, 0, 0);

      if (lastDate.getTime() === yesterday.getTime()) {
        newStreak = (lastHabit.streak || 1) + 1;
      } else if (lastDate.getTime() === todayStart.getTime()) {
        newStreak = lastHabit.streak || 1;
      } else {
        newStreak = 1;
      }
    }

    // ✅ User ka naam fetch karna
    const userName = req.user.name || "there";

    let aiFeedback = "";

    try {
      const prompt = `
You are a friendly and personal habit coach.

Talk directly to the user like a personal coach — use their name "${userName}".
Be warm, specific, and practical. Do NOT write like a report or theory.
Do NOT give generic motivational quotes.
Use emojis to make it engaging.

User Data:
Name: ${userName}
Study Hours: ${studyHours}
Workout Minutes: ${workout}
Sleep Hours: ${sleepHours}
Water Intake: ${waterIntake} glasses
Junk Food: ${junkFood ? "Yes" : "No"}
Mood: ${mood}
Discipline Score: ${score}/100

Output format (strictly follow this):

Productivity Level: Low / Medium / High [add relevant emoji]

Hey ${userName}! Here's your habit analysis for today:

What you did well ✅
[List only the habits that were good today — be specific with numbers]

What needs improvement ⚠️
[List only the habits that need work today — be specific with numbers]

Today's Suggestions for you 💡
[Give 3-4 very specific, actionable suggestions based on today's data — talk directly to ${userName}]

Discipline Score: ${score}/100 — [One motivating line based on the score, addressed to ${userName}]
`;

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

      aiFeedback = response.data.choices[0].message.content;

    } catch (aiError) {
      console.log("AI ERROR:", aiError.message);
      aiFeedback = "AI analysis unavailable today.";
    }

    const habit = await Habit.create({
      userId: req.user._id,
      studyHours: Number(studyHours),
      workout: Number(workout),
      sleepHours: Number(sleepHours),
      waterIntake: Number(waterIntake),
      junkFood,
      mood,
      disciplineScore: score,
      aiFeedback,
      streak: newStreak,
    });

    res.status(201).json(habit);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHabit,
  getHabits,
};