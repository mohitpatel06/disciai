const Habit = require("../models/Habit");
const axios = require("axios");

const normalizeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

const scoreSleep = (sleepHours, goal) => {
  if (sleepHours >= goal && sleepHours <= goal + 1) return 20;
  if (sleepHours >= goal - 1 && sleepHours <= goal + 2) return 15;
  if (sleepHours >= goal - 2 && sleepHours <= goal + 3) return 10;
  if (sleepHours > goal + 3) return 5;
  return 0;
};

const scoreWater = (waterIntake, goal) => {
  if (waterIntake >= goal) return 15;
  if (waterIntake >= Math.max(4, goal - 2)) return 10;
  if (waterIntake >= 2) return 5;
  return 0;
};

const scoreWorkout = (workout, goal) => {
  if (workout >= goal && workout <= 75) return 15;
  if (workout >= Math.max(10, goal - 10)) return 10;
  if (workout > 0) return 5;
  return 0;
};

const scoreMood = (mood) => {
  const map = {
    great: 10,
    good: 7,
    neutral: 4,
    bad: 1,
    terrible: 0,
  };
  return map[mood] ?? 4;
};

const scoreNutrition = (junkFood) => (junkFood ? 3 : 10);

const scoreScreenTime = (screenTime) => {
  if (screenTime === 0) return 0;
  if (screenTime <= 2) return 10;
  if (screenTime <= 4) return 7;
  if (screenTime <= 6) return 3;
  return 0;
};

const scoreStress = (stressLevel) => {
  if (stressLevel === "low") return 10;
  if (stressLevel === "medium") return 5;
  return 0;
};

const scoreGoalCompletion = (values, goals) => {
  const targets = [
    values.sleepHours >= goals.sleepHours,
    values.waterIntake >= goals.waterIntake,
    values.workout >= goals.workout,
    values.studyHours >= (goals.studyHours || 6),
    values.assignmentsDone >= 1,
    values.revisionDone,
    values.screenTime > 0 && values.screenTime <= 4,
    values.stressLevel === "low",
    values.readingMinutes >= 20,
    values.meditationMinutes >= 10,
    values.outdoorTime >= 30,
  ];
  const completed = targets.filter(Boolean).length;
  return Math.min(20, Math.round((completed / targets.length) * 20));
};

const scoreCustomHabits = (customHabits = []) => {
  if (!Array.isArray(customHabits) || customHabits.length === 0) return 0;
  const completed = customHabits.filter((habit) => habit.completed || habit.value >= habit.target).length;
  return Math.min(10, Math.round((completed / customHabits.length) * 10));
};

const buildHabitSummary = (habitData) => {
  const lines = [];
  if (habitData.focusAreas && habitData.focusAreas.length) {
    lines.push(`Focus Areas: ${habitData.focusAreas.join(", ")}`);
  }

  lines.push(
    `Sleep: ${habitData.sleepHours} hrs`,
    `Water: ${habitData.waterIntake} glasses`,
    `Workout: ${habitData.workout} mins`,
    `Mood: ${habitData.mood}`,
    `Junk Food: ${habitData.junkFood ? "Yes" : "No"}`,
  );

  if (habitData.studyHours) lines.push(`Study: ${habitData.studyHours} hrs`);
  if (habitData.assignmentsDone) lines.push(`Assignments Done: ${habitData.assignmentsDone}`);
  if (habitData.revisionDone) lines.push(`Revision Done: Yes`);
  if (habitData.workHours) lines.push(`Work Hours: ${habitData.workHours} hrs`);
  if (habitData.meetingsAttended) lines.push(`Meetings: ${habitData.meetingsAttended}`);
  if (habitData.screenTime) lines.push(`Screen Time: ${habitData.screenTime} hrs`);
  if (habitData.stressLevel) lines.push(`Stress Level: ${habitData.stressLevel}`);
  if (habitData.readingMinutes) lines.push(`Reading: ${habitData.readingMinutes} mins`);
  if (habitData.meditationMinutes) lines.push(`Meditation: ${habitData.meditationMinutes} mins`);
  if (habitData.outdoorTime) lines.push(`Outdoor Time: ${habitData.outdoorTime} mins`);

  if (Array.isArray(habitData.customHabits) && habitData.customHabits.length) {
    habitData.customHabits.forEach((custom) => {
      lines.push(`Custom Habit: ${custom.name} — ${custom.value || 0}${custom.unit ? ` ${custom.unit}` : ""}${custom.completed ? " ✅" : ""}`);
    });
  }

  return lines.join("\n");
};

const createHabit = async (req, res) => {
  try {
    const {
      userType,
      focusAreas = [],
      customHabits = [],
      sleepHours,
      waterIntake,
      workout,
      mood,
      junkFood,
      studyHours,
      assignmentsDone,
      revisionDone,
      workHours,
      meetingsAttended,
      screenTime,
      stressLevel,
      readingMinutes,
      meditationMinutes,
      outdoorTime,
    } = req.body;

    const goals = req.user.goals || {
      studyHours: 6,
      workout: 30,
      sleepHours: 8,
      waterIntake: 8,
    };

    const habitData = {
      userType: userType || "general",
      focusAreas,
      customHabits: Array.isArray(customHabits) ? customHabits : [],
      sleepHours: normalizeNumber(sleepHours),
      waterIntake: normalizeNumber(waterIntake),
      workout: normalizeNumber(workout),
      mood: mood || "neutral",
      junkFood: Boolean(junkFood),
      studyHours: normalizeNumber(studyHours),
      assignmentsDone: normalizeNumber(assignmentsDone),
      revisionDone: Boolean(revisionDone),
      workHours: normalizeNumber(workHours),
      meetingsAttended: normalizeNumber(meetingsAttended),
      screenTime: normalizeNumber(screenTime),
      stressLevel: typeof stressLevel === "string" ? stressLevel : "",
      readingMinutes: normalizeNumber(readingMinutes),
      meditationMinutes: normalizeNumber(meditationMinutes),
      outdoorTime: normalizeNumber(outdoorTime),
    };

    let score = 0;
    score += scoreSleep(habitData.sleepHours, goals.sleepHours);
    score += scoreWater(habitData.waterIntake, goals.waterIntake);
    score += scoreWorkout(habitData.workout, goals.workout);
    score += scoreMood(habitData.mood);
    score += scoreNutrition(habitData.junkFood);
    score += scoreScreenTime(habitData.screenTime);
    score += scoreStress(habitData.stressLevel);
    score += scoreGoalCompletion(habitData, goals);
    score += scoreCustomHabits(habitData.customHabits);

    const disciplineScore = Math.max(0, Math.min(100, Math.round(score)));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const lastHabit = await Habit.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
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

    const userName = req.user.name || "there";
    const habitSummary = buildHabitSummary(habitData);

    let aiFeedback = "";
    try {
      const prompt = `
You are a friendly and personal habit coach.
Talk directly to the user like a personal coach — use their name "${userName}".
Be warm, specific, and practical. Do NOT write like a report or theory.
Use emojis to make it engaging.

Name: ${userName}
Focus Areas: ${focusAreas.length ? focusAreas.join(", ") : "No specific focus areas"}
${habitSummary}
Discipline Score: ${disciplineScore}/100

Output format (strictly follow this):

Productivity Level: Low / Medium / High [add relevant emoji]

Hey ${userName}! Here's your habit analysis for today:

What you did well ✅
[List only the habits that were good today]

What needs improvement ⚠️
[List only the habits that need work]

Today's Suggestions 💡
[Give 3-4 specific, actionable suggestions based on today's data]

Discipline Score: ${disciplineScore}/100 — [One motivating line]
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
      ...habitData,
      disciplineScore,
      aiFeedback,
      streak: newStreak,
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error("Create Habit Error:", error && error.stack ? error.stack : error);
    res.status(500).json({ message: error.message });
  }
};

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createHabit, getHabits };