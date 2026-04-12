const Habit = require("../models/Habit");
const axios = require("axios");

const createHabit = async (req, res) => {
  try {
    const {
      userType,
      sleepHours, waterIntake, workout, mood, junkFood,
      studyHours, assignmentsDone, revisionDone,
      workHours, meetingsAttended, screenTime, stressLevel,
      readingMinutes, meditationMinutes, outdoorTime,
    } = req.body;

    // ✅ Score calculate — user type ke hisaab se
    let score = 0;

    // Common habits (40 points)
    if (Number(sleepHours) >= 7) score += 10;
    if (Number(waterIntake) >= 8) score += 10;
    if (Number(workout) >= 20) score += 10;
    if (!junkFood) score += 10;

    // User type specific (60 points)
    if (userType === "student") {
      if (Number(studyHours) >= 4) score += 20;
      if (Number(assignmentsDone) >= 1) score += 20;
      if (revisionDone) score += 20;
    } else if (userType === "professional") {
      if (Number(workHours) >= 6) score += 20;
      if (Number(screenTime) <= 4) score += 20;
      if (stressLevel === "low") score += 20;
    } else {
      if (Number(readingMinutes) >= 20) score += 20;
      if (Number(meditationMinutes) >= 10) score += 20;
      if (Number(outdoorTime) >= 30) score += 20;
    }

    // ✅ Streak calculate
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

    // ✅ AI Prompt — user type ke hisaab se
    let habitSummary = "";
    if (userType === "student") {
      habitSummary = `
Study Hours: ${studyHours}
Assignments Done: ${assignmentsDone}
Revision Done: ${revisionDone ? "Yes" : "No"}
Workout: ${workout} mins
Sleep: ${sleepHours} hrs
Water: ${waterIntake} glasses
Junk Food: ${junkFood ? "Yes" : "No"}
Mood: ${mood}`;
    } else if (userType === "professional") {
      habitSummary = `
Work Hours: ${workHours}
Meetings Attended: ${meetingsAttended}
Screen Time: ${screenTime} hrs
Stress Level: ${stressLevel}
Workout: ${workout} mins
Sleep: ${sleepHours} hrs
Water: ${waterIntake} glasses
Junk Food: ${junkFood ? "Yes" : "No"}
Mood: ${mood}`;
    } else {
      habitSummary = `
Reading: ${readingMinutes} mins
Meditation: ${meditationMinutes} mins
Outdoor Time: ${outdoorTime} mins
Workout: ${workout} mins
Sleep: ${sleepHours} hrs
Water: ${waterIntake} glasses
Junk Food: ${junkFood ? "Yes" : "No"}
Mood: ${mood}`;
    }

    let aiFeedback = "";
    try {
      const prompt = `
You are a friendly and personal habit coach.
Talk directly to the user like a personal coach — use their name "${userName}".
Be warm, specific, and practical. Do NOT write like a report or theory.
Use emojis to make it engaging.

User Type: ${userType}
Name: ${userName}
${habitSummary}
Discipline Score: ${score}/100

Output format (strictly follow this):

Productivity Level: Low / Medium / High [add relevant emoji]

Hey ${userName}! Here's your habit analysis for today:

What you did well ✅
[List only the habits that were good today]

What needs improvement ⚠️
[List only the habits that need work]

Today's Suggestions 💡
[Give 3-4 specific, actionable suggestions based on user type and today's data]

Discipline Score: ${score}/100 — [One motivating line]
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
      userType: userType || "general",
      sleepHours: Number(sleepHours) || 0,
      waterIntake: Number(waterIntake) || 0,
      workout: Number(workout) || 0,
      mood,
      junkFood,
      studyHours: Number(studyHours) || 0,
      assignmentsDone: Number(assignmentsDone) || 0,
      revisionDone: revisionDone || false,
      workHours: Number(workHours) || 0,
      meetingsAttended: Number(meetingsAttended) || 0,
      screenTime: Number(screenTime) || 0,
      stressLevel: stressLevel || "low",
      readingMinutes: Number(readingMinutes) || 0,
      meditationMinutes: Number(meditationMinutes) || 0,
      outdoorTime: Number(outdoorTime) || 0,
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
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createHabit, getHabits };