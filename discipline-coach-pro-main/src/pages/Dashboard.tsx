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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://disciai-backend.onrender.com/api/habits",
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );
        if (res.data.length > 0) {
          setHabit(res.data[0]);
          setAllHabits(res.data);
        }
      } catch (error) {
        console.log("Error fetching habit", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, []);

  const monthlyHabits = allHabits.filter((h) => {
    const d = new Date(h.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const last7Days = allHabits
    .slice(0, 7)
    .reverse()
    .map((h) => ({
      date: new Date(h.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
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

  const monthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const getAISummary = (feedback) => {
    if (!feedback) return { level: "N/A", summary: "", emoji: "🟡" };
    const cleaned = feedback
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/###/g, "")
      .replace(/#/g, "");
    const lines = cleaned.split("\n").filter((l) => l.trim() !== "");
    const levelLine = lines.find((l) => l.toLowerCase().includes("productivity level"));
    const levelRaw = levelLine
      ? levelLine.replace(/productivity level[:\s]*/i, "").trim()
      : "N/A";
    let emoji = "🟡";
    if (levelRaw.toLowerCase().includes("high")) emoji = "🟢";
    if (levelRaw.toLowerCase().includes("low")) emoji = "🔴";
    const level = levelRaw.replace(/[^a-zA-Z\s]/g, "").trim();
    const heyLine = lines.find((l) => l.toLowerCase().includes("hey "));
    const summary = heyLine ? heyLine.trim() : "";
    return { level, summary, emoji };
  };

  const aiSummary = habit ? getAISummary(habit.aiFeedback) : null;

  // ✅ Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">

          <div className="h-8 w-36 bg-muted rounded"></div>

          {/* Discipline Score Skeleton */}
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="h-4 w-32 bg-muted rounded mb-3"></div>
            <div className="h-10 w-24 bg-muted rounded mb-3"></div>
            <div className="h-4 w-28 bg-muted rounded"></div>
          </div>

          {/* AI Summary Skeleton */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="h-5 w-28 bg-muted rounded mb-4"></div>
            <div className="h-4 w-40 bg-muted rounded mb-3"></div>
            <div className="h-4 w-64 bg-muted rounded mb-4"></div>
            <div className="h-9 w-36 bg-muted rounded"></div>
          </div>

          {/* Chart Skeleton */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="h-5 w-56 bg-muted rounded mb-4"></div>
            <div className="h-52 w-full bg-muted rounded"></div>
          </div>

          {/* Monthly Summary Skeleton */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="h-5 w-40 bg-muted rounded mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-background rounded-lg p-4 text-center border border-border">
                  <div className="h-8 w-12 bg-muted rounded mx-auto mb-2"></div>
                  <div className="h-3 w-20 bg-muted rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Habit Data Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 bg-card border border-border rounded-xl">
                <div className="h-3 w-20 bg-muted rounded mb-2"></div>
                <div className="h-5 w-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>

        </div>
      </DashboardLayout>
    );
  }

  if (!habit) {
    return (
      <DashboardLayout>
        <p className="p-6 text-foreground">No habit data yet.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

        {/* Discipline Score + Streak */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-foreground">Discipline Score</h2>
          <div className="text-3xl font-bold text-green-500">
            {habit.disciplineScore} / 100
          </div>
          <div className="mt-3 text-orange-500 font-semibold text-lg">
            🔥 {habit.streak || 1} Day Streak!
          </div>
        </div>

        {/* AI Summary Card */}
        {aiSummary && (
          <div className="bg-card border border-purple-300 dark:border-purple-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3 text-foreground">🤖 AI Summary</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Productivity Level:</span>
              <span className={`font-bold text-sm px-3 py-1 rounded-full ${aiSummary.level.toLowerCase().includes("high")
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : aiSummary.level.toLowerCase().includes("low")
                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                    : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                }`}>
                {aiSummary.emoji} {aiSummary.level}
              </span>
            </div>
            {aiSummary.summary && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {aiSummary.summary}
              </p>
            )}
            <button
              onClick={() => navigate("/report")}
              className="mt-4 text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
            >
              👉 View Full Analysis
            </button>
          </div>
        )}

        {/* Discipline Score Line Chart */}
        {last7Days.length > 1 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              📈 Discipline Score Trend (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Discipline Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Habits Bar Chart */}
        {last7Days.length > 1 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              📊 Habits Overview (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                />
                <Legend />
                <Bar dataKey="study" fill="#3b82f6" name="Study Hours" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep Hours" radius={[4, 4, 0, 0]} />
                <Bar dataKey="water" fill="#06b6d4" name="Water Intake" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Summary */}
        {monthlyHabits.length > 0 && (
          <div className="bg-card border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              📊 {monthName} Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-4 text-center shadow-sm border border-border">
                <p className="text-2xl font-bold text-green-500">{avgScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Discipline Score</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center shadow-sm border border-border">
                <p className="text-2xl font-bold text-blue-500">{avgStudy}h</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Study Hours</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center shadow-sm border border-border">
                <p className="text-2xl font-bold text-purple-500">{avgSleep}h</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Sleep Hours</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center shadow-sm border border-border">
                <p className="text-2xl font-bold text-cyan-500">{avgWater}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Water Intake</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Based on {monthlyHabits.length} entr{monthlyHabits.length === 1 ? "y" : "ies"} this month
            </p>
          </div>
        )}

        {/* Today's Habit Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-card border border-border rounded-xl text-foreground shadow-sm">
            <span className="text-muted-foreground text-sm">Study Hours</span>
            <p className="font-semibold text-lg">{habit.studyHours}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl text-foreground shadow-sm">
            <span className="text-muted-foreground text-sm">Workout</span>
            <p className="font-semibold text-lg">{habit.workout} mins</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl text-foreground shadow-sm">
            <span className="text-muted-foreground text-sm">Sleep Hours</span>
            <p className="font-semibold text-lg">{habit.sleepHours}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl text-foreground shadow-sm">
            <span className="text-muted-foreground text-sm">Water Intake</span>
            <p className="font-semibold text-lg">{habit.waterIntake} glasses</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl text-foreground shadow-sm">
            <span className="text-muted-foreground text-sm">Junk Food</span>
            <p className="font-semibold text-lg">{habit.junkFood ? "Yes" : "No"}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl text-foreground shadow-sm">
            <span className="text-muted-foreground text-sm">Mood</span>
            <p className="font-semibold text-lg capitalize">{habit.mood}</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;