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

    let aiFeedback = "";

    try {

      const prompt = `
You are a professional habit analyst.

Analyze the user's routine and give practical improvement suggestions.

User Data:
Study Hours: ${studyHours}
Workout Minutes: ${workout}
Sleep Hours: ${sleepHours}
Water Intake: ${waterIntake}
Junk Food: ${junkFood}
Mood: ${mood}
Discipline Score: ${score}

Rules:
Do NOT give motivational quotes.
Give practical analysis only.

Output format:

Productivity Level: Low / Medium / High

Habit Analysis:
Brief explanation of the user's routine.

Suggestions:
- suggestion
- suggestion
- suggestion
`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-chat",
          messages: [
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          }
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