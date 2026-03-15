import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [habit, setHabit] = useState(null);
  const [allHabits, setAllHabits] = useState([]);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [habitsRes, goalsRes] = await Promise.all([
          axios.get("https://disciai-backend.onrender.com/api/habits", { headers, timeout: 5000 }),
          axios.get("https://disciai-backend.onrender.com/api/auth/goals", { headers }),
        ]);

        if (habitsRes.data.length > 0) {
          setHabit(habitsRes.data[0]);
          setAllHabits(habitsRes.data);
        }
        setGoals(goalsRes.data);
      } catch (error) {
        console.log("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthlyHabits = allHabits.filter((h) => {
    const d = new Date(h.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const last7Days = allHabits.slice(0, 7).reverse().map((h) => ({
    date: new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    score: h.disciplineScore,
    study: h.studyHours,
    sleep: h.sleepHours,
    water: h.waterIntake,
  }));

  const avg = (key) =>
    monthlyHabits.length
      ? (monthlyHabits.reduce((sum, h) => sum + h[key], 0) / monthlyHabits.length).toFixed(1)
      : 0;

  const avgScore = avg("disciplineScore");
  const avgStudy = avg("studyHours");
  const avgSleep = avg("sleepHours");
  const avgWater = avg("waterIntake");

  const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const getAISummary = (feedback) => {
    if (!feedback) return { level: "N/A", summary: "", emoji: "🟡" };
    const cleaned = feedback.replace(/\*\*/g, "").replace(/\*/g, "").replace(/###/g, "").replace(/#/g, "");
    const lines = cleaned.split("\n").filter((l) => l.trim() !== "");
    const levelLine = lines.find((l) => l.toLowerCase().includes("productivity level"));
    const levelRaw = levelLine ? levelLine.replace(/productivity level[:\s]*/i, "").trim() : "N/A";
    let emoji = "🟡";
    if (levelRaw.toLowerCase().includes("high")) emoji = "🟢";
    if (levelRaw.toLowerCase().includes("low")) emoji = "🔴";
    const level = levelRaw.replace(/[^a-zA-Z\s]/g, "").trim();
    const heyLine = lines.find((l) => l.toLowerCase().includes("hey "));
    const summary = heyLine ? heyLine.trim() : "";
    return { level, summary, emoji };
  };

  const aiSummary = habit ? getAISummary(habit.aiFeedback) : null;

  const isFilledToday = habit ? (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const lastHabitDate = new Date(habit.createdAt); lastHabitDate.setHours(0, 0, 0, 0);
    return lastHabitDate.getTime() === today.getTime();
  })() : false;

  // ✅ Goals Progress calculate karo
  const goalsProgress = goals && habit ? [
    {
      label: "Study Hours",
      icon: "📚",
      current: habit.studyHours,
      target: goals.studyHours,
      unit: "h",
      color: "blue",
    },
    {
      label: "Workout",
      icon: "💪",
      current: habit.workout,
      target: goals.workout,
      unit: "min",
      color: "red",
    },
    {
      label: "Sleep",
      icon: "😴",
      current: habit.sleepHours,
      target: goals.sleepHours,
      unit: "h",
      color: "purple",
    },
    {
      label: "Water Intake",
      icon: "💧",
      current: habit.waterIntake,
      target: goals.waterIntake,
      unit: "glasses",
      color: "cyan",
    },
  ] : [];

  const getBarColor = (color) => {
    const map = {
      blue: "bg-blue-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
      cyan: "bg-cyan-500",
    };
    return map[color] || "bg-emerald-500";
  };

  // Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-36 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card border border-border rounded-xl h-32"></div>
            <div className="p-6 bg-card border border-border rounded-xl h-32"></div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 h-40"></div>
          <div className="bg-card border border-border rounded-xl p-6 h-64"></div>
          <div className="bg-card border border-border rounded-xl p-6 h-64"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Welcome Screen
  if (!habit) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
          <div className="text-center space-y-3">
            <div className="text-5xl">👋</div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to DisciAI!</h1>
            <p className="text-muted-foreground text-lg">Your AI-powered discipline journey starts today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "📊", title: "Track Daily", desc: "Log your study, workout, sleep and more every day" },
              { icon: "🤖", title: "AI Insights", desc: "Get personalized coaching from your AI discipline coach" },
              { icon: "🔥", title: "Build Streaks", desc: "Stay consistent and build lasting habits day by day" },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate("/add-habit")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
              style={{ boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)" }}
            >
              + Add Your First Habit
            </button>
            <p className="text-xs text-muted-foreground mt-3">Takes less than 2 minutes ⚡</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

        {/* Top Row — Score + Streak + AI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Discipline Score + Streak */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Discipline Score</p>
            <div className="text-4xl font-bold text-emerald-500 mb-1">
              {habit.disciplineScore}<span className="text-lg text-muted-foreground">/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${habit.disciplineScore}%` }}
              ></div>
            </div>
            {isFilledToday ? (
              <div className="text-orange-500 font-semibold">
                🔥 {habit.streak || 1} Day Streak!
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-orange-500 font-semibold">
                  🔥 {habit.streak || 1} Day Streak
                </div>
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer"
                  style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                  onClick={() => navigate("/add-habit")}
                >
                  <span className="text-xs font-semibold text-red-500">
                    🔥 Streak expires tonight! Add your habits now
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-card border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <p className="text-sm font-bold text-foreground mb-3">🤖 AI Summary</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Productivity:</span>
                <span className={`font-bold text-xs px-2 py-1 rounded-full ${aiSummary.level.toLowerCase().includes("high")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : aiSummary.level.toLowerCase().includes("low")
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                  }`}>
                  {aiSummary.emoji} {aiSummary.level}
                </span>
              </div>
              {aiSummary.summary && (
                <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
                  {aiSummary.summary}
                </p>
              )}
              <button
                onClick={() => navigate("/report")}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
              >
                👉 View Full Analysis
              </button>
            </div>
          )}
        </div>

        {/* ✅ Today's Goals Progress */}
        {goalsProgress.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">🎯 Today's Goals</h2>
              <button
                onClick={() => navigate("/goals")}
                className="text-xs text-emerald-500 hover:underline font-medium"
              >
                Edit Goals →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalsProgress.map((g) => {
                const percent = Math.min(Math.round((g.current / g.target) * 100), 100);
                const achieved = g.current >= g.target;
                return (
                  <div key={g.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{g.icon}</span>
                        <span className="text-sm font-medium text-foreground">{g.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-foreground">
                          {g.current}/{g.target}{g.unit}
                        </span>
                        {achieved ? (
                          <span className="text-emerald-500 text-sm">✅</span>
                        ) : (
                          <span className="text-red-400 text-sm">❌</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${achieved ? "bg-emerald-500" : getBarColor(g.color)}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts */}
        {last7Days.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Line Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-bold mb-4 text-foreground">
                📈 Score Trend (7 Days)
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 3 }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-bold mb-4 text-foreground">
                📊 Habits (7 Days)
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="study" fill="#3b82f6" name="Study" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="water" fill="#06b6d4" name="Water" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

        {/* Monthly Summary */}
        {monthlyHabits.length > 0 && (
          <div className="bg-card border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4 text-foreground">
              📊 {monthName} Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: `${avgScore}%`, label: "Avg Score", color: "text-emerald-500" },
                { value: `${avgStudy}h`, label: "Avg Study", color: "text-blue-500" },
                { value: `${avgSleep}h`, label: "Avg Sleep", color: "text-purple-500" },
                { value: avgWater, label: "Avg Water", color: "text-cyan-500" },
              ].map((item) => (
                <div key={item.label} className="bg-background rounded-xl p-4 text-center border border-border">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Based on {monthlyHabits.length} entr{monthlyHabits.length === 1 ? "y" : "ies"} this month
            </p>
          </div>
        )}

        {/* Today's Habit Data */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">📋 Today's Log</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Study Hours", value: `${habit.studyHours}h` },
              { label: "Workout", value: `${habit.workout} mins` },
              { label: "Sleep Hours", value: `${habit.sleepHours}h` },
              { label: "Water Intake", value: `${habit.waterIntake} glasses` },
              { label: "Junk Food", value: habit.junkFood ? "Yes" : "No" },
              { label: "Mood", value: habit.mood },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-card border border-border rounded-xl shadow-sm">
                <p className="text-muted-foreground text-xs mb-1">{item.label}</p>
                <p className="font-semibold text-foreground capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;