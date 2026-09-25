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
  TrendingUp, Brain, Flame, Smile, Apple, CheckCircle,
  Check, Zap, ChevronRight, Sparkles, BarChart3, Pencil,
  CheckCheck,
} from "lucide-react";

interface CustomHabitItem {
  id?: string;
  name: string;
  category?: string;
  target?: number;
  unit?: string;
  value?: number;
  completed?: boolean;
}

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

const DEFAULT_HABIT_SPECS = [
  { id: "study", field: "studyHours", label: "Study / Learning", Icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", defaultTarget: 2, unit: "h" },
  { id: "workout", field: "workout", label: "Physical Activity / Workout", Icon: Dumbbell, color: "text-red-500", bg: "bg-red-500/10", defaultTarget: 30, unit: "min" },
  { id: "sleep", field: "sleepHours", label: "Sleep", Icon: Moon, color: "text-purple-500", bg: "bg-purple-500/10", defaultTarget: 8, unit: "h" },
  { id: "water", field: "waterIntake", label: "Water", Icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500/10", defaultTarget: 3, unit: "L" },
  { id: "meditation", field: "meditationMinutes", label: "Meditation / Mindfulness", Icon: Brain, color: "text-emerald-500", bg: "bg-emerald-500/10", defaultTarget: 15, unit: "min" },
];

const Dashboard = () => {
  const [habit, setHabit] = useState<any>(null);
  const [allHabits, setAllHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingHabitId, setTogglingHabitId] = useState<string | null>(null);
  const [submittingAll, setSubmittingAll] = useState(false);
  const navigate = useNavigate();

  const userId = getUserId();
  const customHabitsKey = `disciai_custom_habits_${userId}`;
  const enabledDefaultsKey = `disciai_enabled_defaults_${userId}`;
  const defaultConfigsKey = `disciai_default_configs_${userId}`;

  // Read saved overrides for default habits (target, unit, name, etc.)
  const savedDefaultConfigs = useMemo<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(defaultConfigsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }, [defaultConfigsKey]);

  // Read saved habit definitions from localStorage
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const envApiBase = import.meta.env.VITE_API_BASE_URL || "";
        const apiBase = envApiBase ? envApiBase.replace(/\/$/, "") : "https://disciai-backend.onrender.com";

        const habitsRes = await axios.get(`${apiBase}/api/habits`, { headers, timeout: 5000 });

        if (habitsRes.data && habitsRes.data.length > 0) {
          setHabit(habitsRes.data[0]);
          setAllHabits(habitsRes.data);
        }
      } catch (error) {
        console.log("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Today check
  const isFilledToday = useMemo(() => {
    if (!habit?.createdAt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastHabitDate = new Date(habit.createdAt);
    lastHabitDate.setHours(0, 0, 0, 0);
    return lastHabitDate.getTime() === today.getTime();
  }, [habit]);

  // Real streak calculation
  const currentStreak = useMemo(() => {
    if (!habit) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const lastHabitDate = new Date(habit.createdAt);
    lastHabitDate.setHours(0, 0, 0, 0);

    if (lastHabitDate.getTime() === today.getTime()) return habit.streak || 1;
    if (lastHabitDate.getTime() === yesterday.getTime()) return habit.streak || 1;
    return 0;
  }, [habit]);

  // Build active habits list (enabled defaults + custom habits)
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

    // 1. Defaults
    DEFAULT_HABIT_SPECS.forEach((spec) => {
      if (savedEnabledDefaults.includes(spec.id)) {
        const customCfg = savedDefaultConfigs[spec.id];
        const targetVal = customCfg?.target ?? spec.defaultTarget;
        const unit = customCfg?.unit || spec.unit;
        const label = customCfg?.name || spec.label;

        list.push({
          id: spec.id,
          field: spec.field,
          label: label,
          isCustom: false,
          Icon: spec.Icon,
          color: spec.color,
          bg: spec.bg,
          targetText: `${targetVal} ${unit}`,
          targetVal,
        });
      }
    });

    // 2. Custom habits from localStorage & today's habit record
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
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        targetText: ch.target ? `${ch.target} ${ch.unit || ""}` : "Daily habit",
        targetVal: ch.target || 1,
      });
    });

    return list;
  }, [savedEnabledDefaults, savedCustomHabits, savedDefaultConfigs, habit]);

  // Check if a habit is completed today
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

  // Completed count and progress
  const completedCount = useMemo(() => {
    return activeHabitItems.filter(checkIsCompleted).length;
  }, [activeHabitItems, habit, isFilledToday]);

  const totalActive = activeHabitItems.length;
  const progressPercent = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  // Single Tap Quick Submit: instantly completes or uncompletes a habit for today
  const handleToggleHabit = async (item: (typeof activeHabitItems)[number]) => {
    const wasCompleted = checkIsCompleted(item);
    const willComplete = !wasCompleted;
    setTogglingHabitId(item.id);

    // 1. Optimistic Local State Update (Instant zero-delay response)
    const previousHabit = habit;
    const optimisticHabit = previousHabit
      ? { ...previousHabit }
      : {
          disciplineScore: willComplete ? 30 : 0,
          streak: willComplete ? 1 : 0,
          createdAt: new Date().toISOString(),
          studyHours: 0,
          workout: 0,
          sleepHours: 0,
          waterIntake: 0,
          meditationMinutes: 0,
          mood: "good",
          junkFood: false,
          customHabits: [],
        };

    if (item.isCustom) {
      const existingCustom = Array.isArray(optimisticHabit.customHabits)
        ? [...optimisticHabit.customHabits]
        : [];
      const idx = existingCustom.findIndex(
        (c: CustomHabitItem) => c.name.toLowerCase() === item.label.toLowerCase()
      );
      const customPayload: CustomHabitItem = {
        name: item.label,
        category: item.customData?.category || "General",
        target: item.targetVal,
        unit: item.customData?.unit || "",
        value: willComplete ? item.targetVal : 0,
        completed: willComplete,
      };

      if (idx >= 0) existingCustom[idx] = customPayload;
      else existingCustom.push(customPayload);
      optimisticHabit.customHabits = existingCustom;
    } else if (item.field) {
      optimisticHabit[item.field] = willComplete ? item.targetVal : 0;
    }

    setHabit(optimisticHabit);

    // 2. Background API Call to existing POST /api/habits
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const envApiBase = import.meta.env.VITE_API_BASE_URL || "";
      const apiBase = envApiBase ? envApiBase.replace(/\/$/, "") : "https://disciai-backend.onrender.com";

      const body: any = {
        userType: optimisticHabit.userType || "general",
        focusAreas: optimisticHabit.focusAreas || [],
        studyHours: optimisticHabit.studyHours || 0,
        workout: optimisticHabit.workout || 0,
        sleepHours: optimisticHabit.sleepHours || 0,
        waterIntake: optimisticHabit.waterIntake || 0,
        meditationMinutes: optimisticHabit.meditationMinutes || 0,
        mood: optimisticHabit.mood || "good",
        junkFood: Boolean(optimisticHabit.junkFood),
        customHabits: optimisticHabit.customHabits || [],
      };

      const res = await axios.post(`${apiBase}/api/habits`, body, { headers });
      if (res.data) {
        setHabit(res.data);
        setAllHabits((prev) => {
          const todayStr = new Date().toDateString();
          const rest = prev.filter((h) => new Date(h.createdAt).toDateString() !== todayStr);
          return [res.data, ...rest];
        });
      }
    } catch (err) {
      console.error("Quick submit error:", err);
      // Revert optimistic state on failure
      setHabit(previousHabit);
    } finally {
      setTogglingHabitId(null);
    }
  };

  // Single separate button to submit all habits at once
  const handleSubmitAllHabits = async () => {
    if (submittingAll) return;
    setSubmittingAll(true);

    const previousHabit = habit;

    // 1. Build complete optimistic state with all active habits marked done at their targets
    const optimisticHabit = previousHabit
      ? { ...previousHabit }
      : {
          disciplineScore: 100,
          streak: 1,
          createdAt: new Date().toISOString(),
          studyHours: 0,
          workout: 0,
          sleepHours: 0,
          waterIntake: 0,
          meditationMinutes: 0,
          mood: "great",
          junkFood: false,
          customHabits: [],
        };

    // Defaults: set to their target value (or keep if already higher)
    DEFAULT_HABIT_SPECS.forEach((spec) => {
      if (savedEnabledDefaults.includes(spec.id)) {
        const customCfg = savedDefaultConfigs[spec.id];
        const targetVal = customCfg?.target ?? spec.defaultTarget;
        const currentVal = Number(optimisticHabit[spec.field] || 0);
        optimisticHabit[spec.field] = Math.max(currentVal, targetVal);
      }
    });

    // Custom habits: mark each as completed with target value
    const mergedCustom: CustomHabitItem[] = [...savedCustomHabits];
    if (Array.isArray(optimisticHabit.customHabits)) {
      optimisticHabit.customHabits.forEach((ch: CustomHabitItem) => {
        if (!mergedCustom.some((m) => m.name.toLowerCase() === ch.name.toLowerCase())) {
          mergedCustom.push(ch);
        }
      });
    }

    optimisticHabit.customHabits = mergedCustom.map((ch) => ({
      name: ch.name,
      category: ch.category || "General",
      target: ch.target || 1,
      unit: ch.unit || "",
      value: ch.target || 1,
      completed: true,
    }));

    optimisticHabit.disciplineScore = 100;
    setHabit(optimisticHabit);

    // 2. Background API call to POST /api/habits
    try {
      const rawToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      const normalizedToken = rawToken ? String(rawToken).trim().replace(/^\"|\"$/g, "") : "";
      const token = normalizedToken && normalizedToken !== "null" && normalizedToken !== "undefined" ? normalizedToken : null;
      const headers = { Authorization: `Bearer ${token}` };
      const envApiBase = import.meta.env.VITE_API_BASE_URL || "";
      const apiBase = envApiBase ? envApiBase.replace(/\/$/, "") : "https://disciai-backend.onrender.com";

      const body: any = {
        userType: optimisticHabit.userType || "general",
        focusAreas: optimisticHabit.focusAreas || [],
        studyHours: optimisticHabit.studyHours || 0,
        workout: optimisticHabit.workout || 0,
        sleepHours: optimisticHabit.sleepHours || 0,
        waterIntake: optimisticHabit.waterIntake || 0,
        meditationMinutes: optimisticHabit.meditationMinutes || 0,
        mood: optimisticHabit.mood || "great",
        junkFood: false,
        customHabits: optimisticHabit.customHabits || [],
      };

      const res = await axios.post(`${apiBase}/api/habits`, body, { headers });
      if (res.data) {
        setHabit(res.data);
        setAllHabits((prev) => {
          const todayStr = new Date().toDateString();
          const rest = prev.filter((h) => new Date(h.createdAt).toDateString() !== todayStr);
          return [res.data, ...rest];
        });
      }
    } catch (err) {
      console.error("Submit all habits error:", err);
      // Revert optimistic state on failure
      setHabit(previousHabit);
      alert("Failed to submit all habits. Please try again.");
    } finally {
      setSubmittingAll(false);
    }
  };

  // 7 Days Chart Data - Generates 7 consecutive calendar days (past 6 days + today)
  const last7Days = useMemo(() => {
    const days: Array<{
      date: string;
      rawDate: string;
      score: number;
      study: number;
      sleep: number;
      water: number;
      workout: number;
      meditation: number;
      hasData: boolean;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayDateStr = d.toDateString();
      const label =
        i === 0
          ? "Today"
          : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

      // Find the most recent habit record matching this calendar day
      const match = allHabits.find(
        (h) => h.createdAt && new Date(h.createdAt).toDateString() === dayDateStr
      );

      days.push({
        date: label,
        rawDate: dayDateStr,
        score: match ? (match.disciplineScore ?? 0) : 0,
        study: match ? (match.studyHours ?? 0) : 0,
        sleep: match ? (match.sleepHours ?? 0) : 0,
        water: match ? (match.waterIntake ?? 0) : 0,
        workout: match ? (match.workout ?? 0) : 0,
        meditation: match ? (match.meditationMinutes ?? 0) : 0,
        hasData: Boolean(match),
      });
    }

    return days;
  }, [allHabits]);

  // Monthly summary
  const monthlyHabits = useMemo(() => {
    const now = new Date();
    return allHabits.filter((h) => {
      const d = new Date(h.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [allHabits]);

  const avg = (key: string) =>
    monthlyHabits.length
      ? (monthlyHabits.reduce((sum, h) => sum + (h[key] || 0), 0) / monthlyHabits.length).toFixed(1)
      : "0";

  const avgScore = avg("disciplineScore");
  const avgStudy = avg("studyHours");
  const avgSleep = avg("sleepHours");
  const avgWater = avg("waterIntake");

  const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const getAISummary = (feedback: string) => {
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

  const getMoodIcon = (mood: string) => {
    const map: Record<string, string> = { great: "😄", good: "🙂", neutral: "😐", bad: "😞", terrible: "😢" };
    return map[mood] || "😐";
  };

  // Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-44 bg-muted rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl h-64"></div>
            <div className="bg-card border border-border rounded-2xl h-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl h-48"></div>
            <div className="bg-card border border-border rounded-2xl h-48"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Daily Control Center • Track your consistency and build lasting discipline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/add-habit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm"
            >
              + Manage Habits
            </Link>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ROW 1: QUICK SUBMIT + TODAY'S PROGRESS (HERO CONTROL CENTER) */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* Quick Submit & Today's Progress Card (7 Cols) */}
          <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* 1. Today's Progress - Single Clean Display (No Duplicate) */}
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-semibold text-sm">Today's Progress</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  {completedCount} / {totalActive} habits completed · {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {progressPercent === 100 && totalActive > 0 && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                  <Sparkles size={12} /> All habits completed today! Keep the streak going! 🎉
                </p>
              )}
            </div>

            {/* 2. Quick Submit Header (Primary Daily Action) */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Zap size={16} className="text-emerald-500 fill-emerald-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Quick Submit</h2>
                <p className="text-xs text-muted-foreground">Tap a habit to mark it complete for today.</p>
              </div>
            </div>

            {/* Active Habits List - Whole card clickable for one-tap completion */}
            <div className="space-y-2">
              {activeHabitItems.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2">No active habits tracked yet</p>
                  <Link
                    to="/add-habit"
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    + Add your first habit
                  </Link>
                </div>
              ) : (
                activeHabitItems.map((item) => {
                  const done = checkIsCompleted(item);
                  const isBusy = togglingHabitId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group min-h-[56px] select-none ${
                        done
                          ? "bg-emerald-500/[0.08] border-emerald-500/35 hover:bg-emerald-500/[0.13]"
                          : "bg-card border-border hover:border-emerald-500/40 hover:bg-accent/40"
                      } ${isBusy ? "opacity-70 cursor-wait" : ""}`}
                    >
                      {/* Clickable habit area for ONE-TAP completion & undo */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => !isBusy && handleToggleHabit(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            !isBusy && handleToggleHabit(item);
                          }
                        }}
                        className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer outline-none"
                      >
                        {/* Interactive Circle: ○ when pending, ✓ when completed */}
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            done
                              ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20"
                              : "border-2 border-muted-foreground/35 text-transparent group-hover:border-emerald-500"
                          }`}
                        >
                          <Check size={13} className={`stroke-[3] ${done ? "opacity-100" : "opacity-0"}`} />
                        </div>

                        {/* Habit Icon */}
                        <div className={`h-9 w-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                          <item.Icon size={16} className={item.color} />
                        </div>

                        {/* Habit Details */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold truncate ${
                              done ? "text-emerald-700 dark:text-emerald-300 font-bold" : "text-foreground"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {done ? "Completed today" : `Tap to complete • Target: ${item.targetText}`}
                          </p>
                        </div>
                      </div>

                      {/* Small Edit Button on right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/add-habit?edit=${encodeURIComponent(item.id)}`);
                        }}
                        title={`Edit ${item.label}`}
                        className="ml-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent hover:border-border transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Pencil size={12} />
                        <span className="text-[11px] font-medium">Edit</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* 3. Single Separate Button to Submit All Habits at Once */}
            {activeHabitItems.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  id="submit-all-habits-btn"
                  onClick={handleSubmitAllHabits}
                  disabled={submittingAll}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                    completedCount === totalActive && totalActive > 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-[0.99]"
                  } ${submittingAll ? "opacity-70 cursor-wait" : ""}`}
                >
                  {submittingAll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Submitting All Habits...</span>
                    </>
                  ) : completedCount === totalActive && totalActive > 0 ? (
                    <>
                      <CheckCheck size={16} />
                      <span>✓ All Habits Completed Today • Click to Resubmit</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck size={16} />
                      <span>
                        Submit All Habits at Once
                        {totalActive > completedCount && ` (${totalActive - completedCount} pending)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Link to Detailed Logs (Secondary Action) */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-muted-foreground/80">Looking for detailed tracking?</span>
              <Link
                to="/add-habit"
                className="text-xs text-muted-foreground hover:text-emerald-500 transition font-medium flex items-center gap-1"
              >
                Log with details <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right Column: 3. AI Coach Insight + 4. Discipline Score (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 3. AI Coach Insight */}
            {aiSummary && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Brain size={14} className="text-purple-500" />
                    </div>
                    <p className="text-sm font-bold text-foreground">AI Coach Insight</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      aiSummary.level.toLowerCase().includes("high")
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : aiSummary.level.toLowerCase().includes("low")
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    }`}
                  >
                    {aiSummary.emoji} {aiSummary.level}
                  </span>
                </div>

                {aiSummary.summary ? (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {aiSummary.summary}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Tap habits in Quick Submit to log for today and receive personalized AI guidance.
                  </p>
                )}

                <div className="pt-1">
                  <Link
                    to="/report"
                    className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  >
                    View Full Analysis →
                  </Link>
                </div>
              </div>
            )}

            {/* 4. Discipline Score & Consistency */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Discipline Score
                  </p>
                </div>

                {/* Real Streak display */}
                {currentStreak > 0 ? (
                  <div className="flex items-center gap-1.5 bg-orange-500/10 rounded-full px-2.5 py-1 border border-orange-500/20">
                    <Flame size={13} className="text-orange-500 fill-orange-500" />
                    <span className="text-xs font-bold text-orange-500">{currentStreak} Day Streak</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1">
                    <Flame size={13} className="text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Start Streak Today</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold text-emerald-500 tracking-tight">
                    {habit?.disciplineScore ?? 0}
                  </span>
                  <span className="text-lg text-muted-foreground font-medium">/ 100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your recent consistency
                </p>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${habit?.disciplineScore ?? 0}%` }}
                ></div>
              </div>

              {!isFilledToday && (
                <div className="pt-1">
                  <div className="flex items-center gap-2 text-xs text-orange-500 font-medium bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2">
                    <Flame size={13} className="flex-shrink-0" />
                    <span>Tap habits in Quick Submit to log for today</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ROW 2: 7-DAY TREND CHARTS (ALWAYS VISIBLE) */}
        {/* ========================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <h2 className="text-base font-bold text-foreground">7-Day Consistency & Trends</h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
              Past 7 Days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Discipline Score Trend */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp size={13} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Discipline Score Trend</p>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Target: 80+</span>
              </div>

              <div className="h-[180px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#ffffff",
                      }}
                      formatter={(val: any) => [`${val} / 100`, "Score"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: "#10b981", r: 3, strokeWidth: 2, stroke: "#ffffff" }}
                      activeDot={{ r: 5, fill: "#10b981" }}
                      name="Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Habits Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 size={13} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Habits Breakdown</p>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Daily metrics</span>
              </div>

              <div className="h-[180px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#ffffff",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                    <Bar dataKey="study" fill="#3b82f6" name="Study (h)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep (h)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="water" fill="#06b6d4" name="Water (L)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ROW 3: MONTHLY SUMMARY */}
        {/* ========================================================== */}
        {monthlyHabits.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-4">{monthName} Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: `${avgScore}%`, label: "Avg Discipline Score", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { value: `${avgStudy}h`, label: "Avg Study / Day", color: "text-blue-500", bg: "bg-blue-500/10" },
                { value: `${avgSleep}h`, label: "Avg Sleep / Day", color: "text-purple-500", bg: "bg-purple-500/10" },
                { value: `${avgWater}L`, label: "Avg Water / Day", color: "text-cyan-500", bg: "bg-cyan-500/10" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3.5 text-center`}>
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

        {/* ========================================================== */}
        {/* ROW 4: TODAY'S LOG DETAILED VIEW */}
        {/* ========================================================== */}
        {habit && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              {isFilledToday ? "Today's Detailed Log" : "Last Entry Recorded"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { Icon: BookOpen, label: "Study", value: `${habit.studyHours}h`, color: "text-blue-500", bg: "bg-blue-500/10", show: (habit.studyHours || 0) > 0 },
                { Icon: Dumbbell, label: "Workout", value: `${habit.workout}min`, color: "text-red-500", bg: "bg-red-500/10", show: (habit.workout || 0) > 0 },
                { Icon: Moon, label: "Sleep", value: `${habit.sleepHours}h`, color: "text-purple-500", bg: "bg-purple-500/10", show: (habit.sleepHours || 0) > 0 },
                { Icon: Droplets, label: "Water", value: `${habit.waterIntake}L`, color: "text-cyan-500", bg: "bg-cyan-500/10", show: (habit.waterIntake || 0) > 0 },
                { Icon: Brain, label: "Meditation", value: `${habit.meditationMinutes}m`, color: "text-emerald-500", bg: "bg-emerald-500/10", show: (habit.meditationMinutes || 0) > 0 },
                { Icon: Smile, label: "Mood", value: `${getMoodIcon(habit.mood)} ${habit.mood}`, color: "text-yellow-500", bg: "bg-yellow-500/10", show: Boolean(habit.mood) },
                { Icon: Apple, label: "Junk Food", value: habit.junkFood ? "Yes" : "No", color: habit.junkFood ? "text-red-500" : "text-emerald-500", bg: habit.junkFood ? "bg-red-500/10" : "bg-emerald-500/10", show: habit.junkFood !== undefined },
              ].filter((item) => item.show).map((item) => (
                <div key={item.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                  <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                    <item.Icon size={14} className={item.color} />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-foreground text-sm capitalize mt-0.5">{item.value}</p>
                </div>
              ))}

              {Array.isArray(habit.customHabits) &&
                habit.customHabits.map((custom: CustomHabitItem, idx: number) => (
                  <div
                    key={custom.name || idx}
                    className="bg-card border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl p-4 shadow-sm"
                  >
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs text-muted-foreground">{custom.name}</p>
                      {custom.category && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {custom.category}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-foreground text-sm capitalize mt-0.5">
                      {custom.completed
                        ? "Done ✅"
                        : `${custom.value || 0}${custom.unit ? ` ${custom.unit}` : ""}`}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;