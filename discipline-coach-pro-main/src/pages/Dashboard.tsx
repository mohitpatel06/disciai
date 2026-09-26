import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import {
  BookOpen, Dumbbell, Moon, Droplets,
  TrendingUp, Brain, Flame, CheckCircle,
  Zap, ChevronRight, Sparkles, BarChart3, Pencil,
  CheckCheck, Plus,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface CustomHabitItem {
  id?: string;
  name: string;
  category?: string;
  target?: number;
  unit?: string;
  value?: number;
  completed?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const getUserId = (): string => {
  try {
    const rawToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!rawToken) return "guest";
    const parts = rawToken.split(".");
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.id || payload._id || "default";
    }
  } catch (e) {}
  return "default";
};

const getApiBase = (): string => {
  const envApiBase = import.meta.env.VITE_API_BASE_URL || "";
  return envApiBase ? envApiBase.replace(/\/$/, "") : "";
};

const getAuthHeaders = () => {
  const rawToken = localStorage.getItem("token") || sessionStorage.getItem("token");
  const token = rawToken ? String(rawToken).trim().replace(/^"|"$/g, "") : "";
  return { Authorization: `Bearer ${token}` };
};

/** Returns a time-based greeting */
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

// ─── Default habit specs (mirrors HabitForm) ──────────────────────────────

const DEFAULT_HABIT_SPECS = [
  { id: "study",     field: "studyHours",       label: "Study / Learning",           Icon: BookOpen,    color: "text-blue-500",    bg: "bg-blue-500/10",    defaultTarget: 2,  unit: "hrs"  },
  { id: "workout",   field: "workout",           label: "Physical Activity / Workout", Icon: Dumbbell,    color: "text-red-500",     bg: "bg-red-500/10",     defaultTarget: 30, unit: "mins" },
  { id: "sleep",     field: "sleepHours",        label: "Sleep",                      Icon: Moon,        color: "text-purple-500",  bg: "bg-purple-500/10",  defaultTarget: 8,  unit: "hrs"  },
  { id: "water",     field: "waterIntake",       label: "Water",                      Icon: Droplets,    color: "text-cyan-500",    bg: "bg-cyan-500/10",    defaultTarget: 3,  unit: "litres" },
  { id: "meditation",field: "meditationMinutes", label: "Meditation / Mindfulness",   Icon: Brain,       color: "text-emerald-500", bg: "bg-emerald-500/10", defaultTarget: 15, unit: "mins" },
];

// ─── Component ─────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [habit, setHabit] = useState<any>(null);
  const [allHabits, setAllHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAll, setSubmittingAll] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [greeting, setGreeting] = useState(getGreeting());

  const navigate = useNavigate();

  // Update greeting every minute so it stays accurate
  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const userId = getUserId();
  const customHabitsKey = `disciai_custom_habits_${userId}`;
  const enabledDefaultsKey = `disciai_enabled_defaults_${userId}`;
  const defaultConfigsKey = `disciai_default_configs_${userId}`;

  // ── Read saved habit config from localStorage ──
  const savedDefaultConfigs = useMemo<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(defaultConfigsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }, [defaultConfigsKey]);

  const savedEnabledDefaults = useMemo<string[]>(() => {
    try {
      const saved = localStorage.getItem(enabledDefaultsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_HABIT_SPECS.map((h) => h.id);
  }, [enabledDefaultsKey]);

  const savedCustomHabits = useMemo<CustomHabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(customHabitsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }, [customHabitsKey]);

  // ── Fetch user name + today's habits ──
  useEffect(() => {
    const apiBase = getApiBase();
    const headers = getAuthHeaders();

    const fetchAll = async () => {
      try {
        const [userRes, habitsRes] = await Promise.allSettled([
          axios.get(`${apiBase}/api/auth/me`, { headers, timeout: 5000 }),
          axios.get(`${apiBase}/api/habits`,  { headers, timeout: 5000 }),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.data?.name) {
          setUserName(userRes.value.data.name);
        }

        if (habitsRes.status === "fulfilled" && habitsRes.value.data?.length > 0) {
          setHabit(habitsRes.value.data[0]);
          setAllHabits(habitsRes.value.data);
        }
      } catch (e) {
        console.log("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Is today's record already submitted? ──
  const isFilledToday = useMemo(() => {
    if (!habit?.createdAt) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(habit.createdAt); d.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  }, [habit]);

  // ── Streak ──
  const currentStreak = useMemo(() => {
    if (!habit) return 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1); yesterday.setHours(0,0,0,0);
    const d = new Date(habit.createdAt); d.setHours(0,0,0,0);
    if (d.getTime() === today.getTime() || d.getTime() === yesterday.getTime()) return habit.streak || 1;
    return 0;
  }, [habit]);

  // ── Build active habit list from localStorage config ──
  const activeHabitItems = useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      field?: string;
      isCustom: boolean;
      customData?: CustomHabitItem;
      Icon: any;
      color: string;
      bg: string;
      targetText: string;
      targetVal: number;
    }> = [];

    // Default habits (enabled by user in Add Habit page)
    DEFAULT_HABIT_SPECS.forEach((spec) => {
      if (savedEnabledDefaults.includes(spec.id)) {
        const cfg = savedDefaultConfigs[spec.id];
        const targetVal = cfg?.target ?? spec.defaultTarget;
        const unit      = cfg?.unit   || spec.unit;
        const label     = cfg?.name   || spec.label;
        list.push({
          id: spec.id,
          field: spec.field,
          label,
          isCustom: false,
          Icon: spec.Icon,
          color: spec.color,
          bg: spec.bg,
          targetText: `${targetVal} ${unit}`,
          targetVal,
        });
      }
    });

    // Custom habits from localStorage
    const mergedCustom: CustomHabitItem[] = [...savedCustomHabits];
    if (Array.isArray(habit?.customHabits)) {
      habit.customHabits.forEach((ch: CustomHabitItem) => {
        if (!mergedCustom.some((m) => m.name.toLowerCase() === ch.name.toLowerCase())) {
          mergedCustom.push(ch);
        }
      });
    }

    mergedCustom.forEach((ch) => {
      list.push({
        id: ch.id || ("custom_" + ch.name),
        label: ch.name,
        isCustom: true,
        customData: ch,
        Icon: CheckCircle,
        color: "text-teal-500",
        bg: "bg-teal-500/10",
        targetText: ch.target ? `${ch.target}${ch.unit ? " " + ch.unit : ""}` : "Daily habit",
        targetVal: ch.target || 1,
      });
    });

    return list;
  }, [savedEnabledDefaults, savedCustomHabits, savedDefaultConfigs, habit]);

  // ── Check if a habit is completed today ──
  const checkIsCompleted = (item: (typeof activeHabitItems)[number]): boolean => {
    if (!isFilledToday || !habit) return false;
    if (item.isCustom) {
      if (!Array.isArray(habit.customHabits)) return false;
      const found = habit.customHabits.find(
        (c: CustomHabitItem) => c.name.toLowerCase() === item.label.toLowerCase()
      );
      if (!found) return false;
      return Boolean(found.completed || Number(found.value || 0) >= Number(found.target || 1));
    } else if (item.field) {
      return Number(habit[item.field] || 0) > 0;
    }
    return false;
  };

  const completedCount = useMemo(
    () => activeHabitItems.filter(checkIsCompleted).length,
    [activeHabitItems, habit, isFilledToday]
  );
  const totalActive = activeHabitItems.length;
  const progressPercent = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  // ── Single global submit: marks ALL active habits as done at target ──
  const handleSubmitAll = async () => {
    if (submittingAll) return;
    setSubmittingAll(true);
    setSubmitSuccess(false);

    const previous = habit;

    const optimistic = previous
      ? { ...previous }
      : {
          disciplineScore: 100, streak: 1,
          createdAt: new Date().toISOString(),
          studyHours: 0, workout: 0, sleepHours: 0,
          waterIntake: 0, meditationMinutes: 0,
          mood: "great", junkFood: false, customHabits: [],
        };

    // Set default habit fields to their target
    DEFAULT_HABIT_SPECS.forEach((spec) => {
      if (savedEnabledDefaults.includes(spec.id)) {
        const cfg = savedDefaultConfigs[spec.id];
        const targetVal = cfg?.target ?? spec.defaultTarget;
        const cur = Number(optimistic[spec.field] || 0);
        optimistic[spec.field] = Math.max(cur, targetVal);
      }
    });

    // Build custom habits payload
    const mergedCustom: CustomHabitItem[] = [...savedCustomHabits];
    if (Array.isArray(optimistic.customHabits)) {
      optimistic.customHabits.forEach((ch: CustomHabitItem) => {
        if (!mergedCustom.some((m) => m.name.toLowerCase() === ch.name.toLowerCase())) {
          mergedCustom.push(ch);
        }
      });
    }
    optimistic.customHabits = mergedCustom.map((ch) => ({
      name: ch.name,
      category: ch.category || "General",
      target: ch.target || 1,
      unit: ch.unit || "",
      value: ch.target || 1,
      completed: true,
    }));

    setHabit(optimistic);

    try {
      const apiBase = getApiBase();
      const headers = getAuthHeaders();
      const body = {
        userType: optimistic.userType || "general",
        focusAreas: optimistic.focusAreas || [],
        studyHours: optimistic.studyHours || 0,
        workout: optimistic.workout || 0,
        sleepHours: optimistic.sleepHours || 0,
        waterIntake: optimistic.waterIntake || 0,
        meditationMinutes: optimistic.meditationMinutes || 0,
        mood: optimistic.mood || "great",
        junkFood: false,
        customHabits: optimistic.customHabits || [],
      };

      const res = await axios.post(`${apiBase}/api/habits`, body, { headers });
      if (res.data) {
        setHabit(res.data);
        setAllHabits((prev) => {
          const todayStr = new Date().toDateString();
          const rest = prev.filter((h) => new Date(h.createdAt).toDateString() !== todayStr);
          return [res.data, ...rest];
        });
        setSubmitSuccess(true);
        setSubmitError("");
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setHabit(previous);
      const status = err?.response?.status;
      if (status === 401) {
        setSubmitError("Session expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (status === 500) {
        setSubmitError("Server error. Please try again.");
      } else if (err?.code === "ERR_NETWORK" || err?.code === "ECONNREFUSED") {
        setSubmitError("Cannot reach server. Make sure the backend is running.");
      } else {
        setSubmitError("Submit failed. Please try again.");
      }
      setTimeout(() => setSubmitError(""), 5000);
    } finally {
      setSubmittingAll(false);
    }
  };

  // ── AI feedback parsing ──
  const aiInsight = useMemo<string>(() => {
    if (!habit?.aiFeedback) return "";
    const cleaned = habit.aiFeedback
      .replace(/\*\*/g, "").replace(/\*/g, "")
      .replace(/###/g, "").replace(/#/g, "");
    const lines = cleaned.split("\n").filter((l: string) => l.trim() !== "");
    // Try to find a meaningful sentence
    const heyLine = lines.find((l: string) => l.toLowerCase().includes("hey "));
    if (heyLine) return heyLine.trim();
    // Fallback: first non-empty line
    return lines[0]?.trim() || "";
  }, [habit]);

  const aiLevel = useMemo<{ label: string; emoji: string; style: string }>(() => {
    if (!habit?.aiFeedback) return { label: "", emoji: "", style: "" };
    const cleaned = habit.aiFeedback.toLowerCase();
    const levelLine = cleaned.split("\n").find((l: string) => l.includes("productivity level"));
    if (!levelLine) return { label: "Moderate", emoji: "🟡", style: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" };
    if (levelLine.includes("high"))   return { label: "High",     emoji: "🟢", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    if (levelLine.includes("low"))    return { label: "Low",      emoji: "🔴", style: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" };
    return { label: "Moderate", emoji: "🟡", style: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" };
  }, [habit]);

  // ── 7-day chart data ──
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const label = i === 0 ? "Today" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const match = allHabits.find((h) => h.createdAt && new Date(h.createdAt).toDateString() === dayStr);
      days.push({
        date: label,
        score: match ? (match.disciplineScore ?? 0) : 0,
        study: match ? (match.studyHours ?? 0) : 0,
        sleep: match ? (match.sleepHours ?? 0) : 0,
        water: match ? (match.waterIntake ?? 0) : 0,
        hasData: Boolean(match),
      });
    }
    return days;
  }, [allHabits]);

  // ── Monthly summary ──
  const monthlyHabits = useMemo(() => {
    const now = new Date();
    return allHabits.filter((h) => {
      const d = new Date(h.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [allHabits]);

  const avg = (key: string) =>
    monthlyHabits.length
      ? (monthlyHabits.reduce((s, h) => s + (h[key] || 0), 0) / monthlyHabits.length).toFixed(1)
      : "0";

  const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  // ── Display first name only ──
  const firstName = userName ? userName.split(" ")[0] : "there";

  // ─── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-5 animate-pulse">
          <div className="h-7 w-52 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl h-72" />
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl h-32" />
              <div className="bg-card border border-border rounded-2xl h-32" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── GREETING HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's your discipline overview for today.
            </p>
          </div>
          <Link
            to="/add-habit"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm flex-shrink-0"
          >
            <Plus size={14} />
            Manage Habits
          </Link>
        </div>

        {/* ── ROW 1: QUICK SUBMIT (left) + RIGHT COLUMN (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

          {/* ── QUICK SUBMIT CARD ── */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="px-5 pt-5 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-emerald-500" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Quick Submit</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Review today's values and submit your progress.
              </p>
            </div>

            {/* Compact habit rows */}
            <div className="px-5 py-3">
              {activeHabitItems.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2">No habits configured yet.</p>
                  <Link to="/add-habit" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                    + Add your first habit
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Column labels */}
                  <div className="flex items-center justify-between px-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Habit</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 pr-12">Target Value</span>
                  </div>

                  {activeHabitItems.map((item) => {
                    const done = checkIsCompleted(item);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                          done
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-transparent border-border/60 hover:bg-muted/40"
                        }`}
                      >
                        {/* Left: icon + name */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Completion dot */}
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              done ? "bg-emerald-500" : "bg-muted-foreground/30"
                            }`}
                          />
                          {/* Icon */}
                          <div className={`h-7 w-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                            <item.Icon size={13} className={item.color} />
                          </div>
                          {/* Name */}
                          <span
                            className={`text-sm font-medium truncate ${
                              done ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Right: target value + edit */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold tabular-nums ${
                            done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          }`}>
                            {item.targetText}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/add-habit?edit=${encodeURIComponent(item.id)}`)}
                            title={`Edit ${item.label}`}
                            className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60 transition-colors"
                          >
                            <Pencil size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Single global submit button */}
            {activeHabitItems.length > 0 && (
              <div className="px-5 pb-5 pt-2">
                <button
                  type="button"
                  id="submit-today-progress-btn"
                  onClick={handleSubmitAll}
                  disabled={submittingAll}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    submitSuccess
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-[0.99]"
                  } ${submittingAll ? "opacity-70 cursor-wait" : ""}`}
                >
                  {submittingAll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Submitting…</span>
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCheck size={15} />
                      <span>Submitted! ✓</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck size={15} />
                      <span>Submit Today's Progress</span>
                    </>
                  )}
                </button>

                {/* Error message */}
                {submitError && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
                    ⚠️ {submitError}
                  </div>
                )}

                {/* Subtle link */}
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground/70">
                  <span>Detailed tracking?</span>
                  <Link
                    to="/add-habit"
                    className="flex items-center gap-0.5 hover:text-emerald-500 transition-colors"
                  >
                    Log with details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-4">

            {/* TODAY'S PROGRESS */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Today's Progress</p>

              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-bold text-foreground tabular-nums">{completedCount}</span>
                  <span className="text-sm text-muted-foreground font-medium"> / {totalActive} habits</span>
                </div>
                <span className={`text-lg font-bold tabular-nums ${
                  progressPercent === 100 ? "text-emerald-500" : "text-foreground"
                }`}>
                  {progressPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {progressPercent === 100 && totalActive > 0 && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles size={11} /> All done today! 🎉
                </p>
              )}
              {progressPercent === 0 && totalActive > 0 && (
                <p className="text-[11px] text-muted-foreground">Submit your progress above to track today.</p>
              )}
            </div>

            {/* AI COACH INSIGHT — always visible */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Brain size={12} className="text-violet-500" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">AI Coach</p>
                </div>
                {aiLevel.label && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aiLevel.style}`}>
                    {aiLevel.emoji} {aiLevel.label}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {aiInsight || "Submit today's habits to receive your personalised AI coaching insight."}
              </p>

              <Link
                to="/ai-chat"
                className="inline-flex items-center gap-0.5 text-[11px] text-violet-600 dark:text-violet-400 font-semibold hover:underline"
              >
                Chat with AI Coach →
              </Link>
            </div>

            {/* DISCIPLINE SCORE */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Discipline Score
                </p>
                {currentStreak > 0 ? (
                  <div className="flex items-center gap-1 bg-orange-500/10 rounded-full px-2 py-0.5 border border-orange-500/20">
                    <Flame size={11} className="text-orange-500 fill-orange-500" />
                    <span className="text-[10px] font-bold text-orange-500">{currentStreak}d streak</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-0.5">
                    <Flame size={11} className="text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground">No streak</span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-500 tabular-nums">
                  {habit?.disciplineScore ?? 0}
                </span>
                <span className="text-sm text-muted-foreground font-medium">/ 100</span>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${habit?.disciplineScore ?? 0}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">Based on your recent consistency</p>
            </div>

          </div>
        </div>

        {/* ── ROW 2: 7-DAY ANALYTICS ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" />
              <h2 className="text-sm font-bold text-foreground">7-Day Analytics</h2>
            </div>
            <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
              Past 7 Days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discipline Score Trend */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp size={11} className="text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-foreground">Discipline Score Trend</p>
              </div>
              <div className="h-[160px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7Days} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(15,23,42,0.95)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px", color: "#ffffff" }}
                      formatter={(val: any) => [`${val} / 100`, "Score"]}
                    />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} activeDot={{ r: 4 }} name="Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Habits Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 size={11} className="text-blue-500" />
                </div>
                <p className="text-xs font-semibold text-foreground">Habits Breakdown</p>
              </div>
              <div className="h-[160px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(15,23,42,0.95)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px", color: "#ffffff" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                    <Bar dataKey="study" fill="#3b82f6" name="Study (h)"  radius={[3,3,0,0]} />
                    <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep (h)"  radius={[3,3,0,0]} />
                    <Bar dataKey="water" fill="#06b6d4" name="Water (L)"  radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: MONTHLY SUMMARY ── */}
        {monthlyHabits.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-foreground mb-3">{monthName} Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: `${avg("disciplineScore")}`, suffix: "%", label: "Avg Score",   color: "text-emerald-500", bg: "bg-emerald-500/8" },
                { value: `${avg("studyHours")}`,     suffix: "h", label: "Avg Study",   color: "text-blue-500",   bg: "bg-blue-500/8"   },
                { value: `${avg("sleepHours")}`,     suffix: "h", label: "Avg Sleep",   color: "text-purple-500", bg: "bg-purple-500/8" },
                { value: `${avg("waterIntake")}`,    suffix: "L", label: "Avg Water",   color: "text-cyan-500",   bg: "bg-cyan-500/8"   },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3 border border-border/50 text-center">
                  <p className={`text-lg font-bold ${item.color} tabular-nums`}>{item.value}<span className="text-sm">{item.suffix}</span></p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2.5">
              Based on {monthlyHabits.length} entr{monthlyHabits.length === 1 ? "y" : "ies"} this month
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
