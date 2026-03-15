import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import {
  Target, BookOpen, Dumbbell, Moon, Droplets,
  TrendingUp, Brain, Flame, Smile, Apple, Clock
} from "lucide-react";

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

  // ✅ Aaj ki habit hai ya nahi
  const isFilledToday = habit ? (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const lastHabitDate = new Date(habit.createdAt); lastHabitDate.setHours(0, 0, 0, 0);
    return lastHabitDate.getTime() === today.getTime();
  })() : false;

  // ✅ Goals sirf aaj ki habit ke saath dikhao
  const goalsProgress = goals && habit && isFilledToday ? [
    { label: "Study Hours", Icon: BookOpen, current: habit.studyHours, target: goals.studyHours, unit: "h", color: "#3b82f6" },
    { label: "Workout", Icon: Dumbbell, current: habit.workout, target: goals.workout, unit: "min", color: "#ef4444" },
    { label: "Sleep", Icon: Moon, current: habit.sleepHours, target: goals.sleepHours, unit: "h", color: "#8b5cf6" },
    { label: "Water Intake", Icon: Droplets, current: habit.waterIntake, target: goals.waterIntake, unit: "gl", color: "#06b6d4" },
  ] : [];

  const getMoodIcon = (mood) => {
    const map = { great: "😄", good: "🙂", neutral: "😐", bad: "😞", terrible: "😢" };
    return map[mood] || "😐";
  };

  // Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-36 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl h-36"></div>
            <div className="bg-card border border-border rounded-2xl h-36"></div>
          </div>
          <div className="bg-card border border-border rounded-2xl h-40"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl h-56"></div>
            <div className="bg-card border border-border rounded-2xl h-56"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Welcome Screen
  if (!habit) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto space-y-8 py-12 px-4">
          <div className="text-center space-y-3">
            <div className="text-6xl mb-2">👋</div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to DisciAI!</h1>
            <p className="text-muted-foreground">Your AI-powered discipline journey starts today</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { Icon: TrendingUp, title: "Track Daily Habits", desc: "Log study, workout, sleep and more", color: "text-blue-500", bg: "bg-blue-500/10" },
              { Icon: Brain, title: "AI-Powered Insights", desc: "Get personalized coaching from your AI coach", color: "text-purple-500", bg: "bg-purple-500/10" },
              { Icon: Flame, title: "Build Streaks", desc: "Stay consistent and build lasting discipline", color: "text-orange-500", bg: "bg-orange-500/10" },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                  <f.Icon size={20} className={f.color} />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/add-habit")}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-base transition-all"
            style={{ boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)" }}
          >
            + Add Your First Habit
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

        {/* Row 1 — Score + AI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Discipline Score */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Discipline Score</p>
              <div className="flex items-center gap-1 bg-orange-500/10 rounded-full px-2 py-1">
                <Flame size={12} className="text-orange-500" />
                <span className="text-xs font-bold text-orange-500">{habit.streak || 1} Day Streak</span>
              </div>
            </div>
            <div className="flex items-end gap-1 mb-3">
              <span className="text-5xl font-bold text-emerald-500">{habit.disciplineScore}</span>
              <span className="text-lg text-muted-foreground mb-1">/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${habit.disciplineScore}%` }}
              ></div>
            </div>
            {!isFilledToday && (
              <button
                onClick={() => navigate("/add-habit")}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition"
              >
                <Flame size={12} />
                Streak expires tonight — Log habits now
              </button>
            )}
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Brain size={14} className="text-purple-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">AI Summary</p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Productivity:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${aiSummary.level.toLowerCase().includes("high")
                    ? "bg-green-500/10 text-green-500"
                    : aiSummary.level.toLowerCase().includes("low")
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                  {aiSummary.emoji} {aiSummary.level}
                </span>
              </div>
              {aiSummary.summary && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  {aiSummary.summary}
                </p>
              )}
              <button
                onClick={() => navigate("/report")}
                className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition font-medium"
              >
                View Full Analysis →
              </button>
            </div>
          )}
        </div>

        {/* Today's Goals — sirf aaj ki habit hai toh dikhao */}
        {isFilledToday && goalsProgress.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target size={14} className="text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">Today's Goals</p>
              </div>
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
                        <g.Icon size={14} style={{ color: g.color }} />
                        <span className="text-xs font-medium text-foreground">{g.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground">
                          {g.current}/{g.target}{g.unit}
                        </span>
                        <span className={`text-xs ${achieved ? "text-emerald-500" : "text-red-400"}`}>
                          {achieved ? "✓" : "✗"}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: achieved ? "#10b981" : g.color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Aaj habit nahi fill ki — Goals section mein prompt dikhao */}
        {!isFilledToday && goals && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target size={14} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">Today's Goals</p>
            </div>
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-3">
                Log today's habits to track your goal progress
              </p>
              <button
                onClick={() => navigate("/add-habit")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                + Log Today's Habits
              </button>
            </div>
          </div>
        )}

        {/* Charts */}
        {last7Days.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">Score Trend — 7 Days</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={14} className="text-blue-500" />
                <p className="text-sm font-semibold text-foreground">Habits — 7 Days</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="study" fill="#3b82f6" name="Study" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="water" fill="#06b6d4" name="Water" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Monthly Summary */}
        {monthlyHabits.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">{monthName} Summary</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: `${avgScore}%`, label: "Avg Score", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { value: `${avgStudy}h`, label: "Avg Study", color: "text-blue-500", bg: "bg-blue-500/10" },
                { value: `${avgSleep}h`, label: "Avg Sleep", color: "text-purple-500", bg: "bg-purple-500/10" },
                { value: `${avgWater}`, label: "Avg Water", color: "text-cyan-500", bg: "bg-cyan-500/10" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Based on {monthlyHabits.length} entr{monthlyHabits.length === 1 ? "y" : "ies"} this month
            </p>
          </div>
        )}

        {/* Today's Log */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            {isFilledToday ? "📋 Today's Log" : "📋 Last Entry"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { Icon: BookOpen, label: "Study", value: `${habit.studyHours}h`, color: "text-blue-500", bg: "bg-blue-500/10" },
              { Icon: Dumbbell, label: "Workout", value: `${habit.workout}min`, color: "text-red-500", bg: "bg-red-500/10" },
              { Icon: Moon, label: "Sleep", value: `${habit.sleepHours}h`, color: "text-purple-500", bg: "bg-purple-500/10" },
              { Icon: Droplets, label: "Water", value: `${habit.waterIntake} gl`, color: "text-cyan-500", bg: "bg-cyan-500/10" },
              { Icon: Apple, label: "Junk Food", value: habit.junkFood ? "Yes" : "No", color: habit.junkFood ? "text-red-500" : "text-emerald-500", bg: habit.junkFood ? "bg-red-500/10" : "bg-emerald-500/10" },
              { Icon: Smile, label: "Mood", value: `${getMoodIcon(habit.mood)} ${habit.mood}`, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                  <item.Icon size={14} className={item.color} />
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-foreground text-sm capitalize mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;