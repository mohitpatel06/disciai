import API_BASE from "@/lib/apiBase";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, Dumbbell, Moon, Droplets, Smile, Brain,
  Plus, Trash2, X, Sparkles, Check, CheckCircle2,
  RotateCcw, Target, Calendar, Pencil,
} from "lucide-react";

// Focus Areas (optional)
const FOCUS_AREAS = [
  { id: "productivity", label: "Productivity" },
  { id: "health", label: "Health" },
  { id: "fitness", label: "Fitness" },
  { id: "learning", label: "Learning" },
  { id: "career", label: "Career" },
  { id: "mindfulness", label: "Mindfulness" },
];

const DEFAULT_HABIT_SPECS_MAP: Record<string, {
  name: string;
  description: string;
  target: number;
  unit: string;
  frequency: "daily" | "weekly";
  trackingType: "number" | "checkbox";
  category: string;
}> = {
  study: {
    name: "Study / Learning",
    description: "Daily study and learning session",
    target: 2,
    unit: "hrs",
    frequency: "daily",
    trackingType: "number",
    category: "Learning",
  },
  workout: {
    name: "Physical Activity / Workout",
    description: "Daily physical exercise or workout",
    target: 30,
    unit: "mins",
    frequency: "daily",
    trackingType: "number",
    category: "Fitness",
  },
  sleep: {
    name: "Sleep",
    description: "Nightly restful sleep",
    target: 8,
    unit: "hrs",
    frequency: "daily",
    trackingType: "number",
    category: "Health",
  },
  water: {
    name: "Water",
    description: "Daily water consumption",
    target: 3,
    unit: "litres",
    frequency: "daily",
    trackingType: "number",
    category: "Health",
  },
  meditation: {
    name: "Meditation / Mindfulness",
    description: "Meditation and mindfulness practice",
    target: 15,
    unit: "mins",
    frequency: "daily",
    trackingType: "number",
    category: "Mindfulness",
  },
};

// Broadly applicable default habits
interface DefaultHabitConfig {
  id: string;
  label: string;
  placeholder?: string;
  unit?: string;
  type?: "number" | "select";
  Icon: any;
  iconColor: string;
  bgColor: string;
}

const DEFAULT_HABITS: DefaultHabitConfig[] = [
  {
    id: "study",
    label: "Study / Learning",
    placeholder: "e.g. 2 hrs",
    unit: "hrs",
    type: "number",
    Icon: BookOpen,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "sleep",
    label: "Sleep",
    placeholder: "e.g. 8 hrs",
    unit: "hrs",
    type: "number",
    Icon: Moon,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "water",
    label: "Water",
    placeholder: "e.g. 2.5 L",
    unit: "litres",
    type: "number",
    Icon: Droplets,
    iconColor: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: "workout",
    label: "Physical Activity / Workout",
    placeholder: "e.g. 30 mins",
    unit: "mins",
    type: "number",
    Icon: Dumbbell,
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    id: "mood",
    label: "Mood",
    type: "select",
    Icon: Smile,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "meditation",
    label: "Meditation / Mindfulness",
    placeholder: "e.g. 15 mins",
    unit: "mins",
    type: "number",
    Icon: Brain,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

// Quick suggestions for creating custom habits
const SUGGESTIONS = [
  { name: "Assignments", category: "Learning", trackingType: "number" as const, target: 3, unit: "tasks" },
  { name: "Revision", category: "Learning", trackingType: "checkbox" as const, target: 1, unit: "session" },
  { name: "Coding", category: "Career", trackingType: "number" as const, target: 60, unit: "mins" },
  { name: "Reading", category: "Mindfulness", trackingType: "number" as const, target: 30, unit: "mins" },
  { name: "Running", category: "Fitness", trackingType: "number" as const, target: 5, unit: "km" },
  { name: "Walking", category: "Health", trackingType: "number" as const, target: 5000, unit: "steps" },
  { name: "No Junk Food", category: "Health", trackingType: "checkbox" as const, target: 1, unit: "day" },
];

export interface CustomHabitDef {
  id: string;
  name: string;
  description?: string;
  category?: string;
  frequency: "daily" | "weekly";
  trackingType: "number" | "checkbox";
  target: number;
  unit: string;
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
  } catch (e) {
    // fallback
  }
  return "default";
};

interface HabitFormProps {
  editId?: string;
}

const HabitForm = ({ editId: propEditId }: HabitFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetEditId = propEditId || searchParams.get("edit");
  const isEditMode = Boolean(targetEditId);

  const userId = getUserId();
  const customHabitsKey = `disciai_custom_habits_${userId}`;
  const enabledDefaultsKey = `disciai_enabled_defaults_${userId}`;
  const defaultConfigsKey = `disciai_default_configs_${userId}`;

  // Edit Mode state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("Productivity");
  const [editFrequency, setEditFrequency] = useState<"daily" | "weekly">("daily");
  const [editType, setEditType] = useState<"number" | "checkbox">("number");
  const [editTarget, setEditTarget] = useState("30");
  const [editUnit, setEditUnit] = useState("mins");

  // Optional Focus Areas
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Enabled default habits (user can disable/remove any they don't track)
  const [enabledDefaults, setEnabledDefaults] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(enabledDefaultsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_HABITS.map((h) => h.id);
  });

  // Default habit daily log values
  const [studyHours, setStudyHours] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [workout, setWorkout] = useState("");
  const [mood, setMood] = useState("");
  const [meditationMinutes, setMeditationMinutes] = useState("");

  // Custom habits saved for this user
  const [customHabits, setCustomHabits] = useState<CustomHabitDef[]>(() => {
    try {
      const saved = localStorage.getItem(customHabitsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const hiddenDefaults = DEFAULT_HABITS.filter((h) => !enabledDefaults.includes(h.id));
  const totalActiveHabits = enabledDefaults.length + customHabits.length;

  // Daily values for custom habits
  const [customValues, setCustomValues] = useState<
    Record<string, { value: string | number; completed: boolean }>
  >({});

  // Form state for creating a custom habit
  const [isCreating, setIsCreating] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("Productivity");
  const [newHabitFrequency, setNewHabitFrequency] = useState<"daily" | "weekly">("daily");
  const [newHabitType, setNewHabitType] = useState<"number" | "checkbox">("number");
  const [newHabitTarget, setNewHabitTarget] = useState("30");
  const [newHabitUnit, setNewHabitUnit] = useState("mins");

  // Pre-fill edit mode fields
  useEffect(() => {
    if (!targetEditId) return;

    // 1. Check custom habits
    const foundCustom = customHabits.find(
      (ch) =>
        ch.id === targetEditId ||
        ch.name.toLowerCase() === targetEditId.toLowerCase() ||
        ("custom_" + ch.name.toLowerCase()) === targetEditId.toLowerCase() ||
        targetEditId.toLowerCase().includes(ch.name.toLowerCase())
    );

    if (foundCustom) {
      setEditName(foundCustom.name);
      setEditDesc(foundCustom.description || "");
      setEditCategory(foundCustom.category || "General");
      setEditFrequency(foundCustom.frequency || "daily");
      setEditType(foundCustom.trackingType || "number");
      setEditTarget(String(foundCustom.target || 1));
      setEditUnit(foundCustom.unit || (foundCustom.trackingType === "checkbox" ? "done" : "times"));
      return;
    }

    // 2. Check default habits
    const defaultKey = Object.keys(DEFAULT_HABIT_SPECS_MAP).find(
      (k) =>
        k === targetEditId.toLowerCase() ||
        targetEditId.toLowerCase().includes(k) ||
        DEFAULT_HABIT_SPECS_MAP[k].name.toLowerCase() === targetEditId.toLowerCase()
    );

    if (defaultKey) {
      let savedConfigs: Record<string, any> = {};
      try {
        const raw = localStorage.getItem(defaultConfigsKey);
        if (raw) savedConfigs = JSON.parse(raw);
      } catch (e) {}

      const base = {
        ...DEFAULT_HABIT_SPECS_MAP[defaultKey],
        ...(savedConfigs[defaultKey] || {}),
      };

      setEditName(base.name);
      setEditDesc(base.description || "");
      setEditCategory(base.category || "General");
      setEditFrequency(base.frequency || "daily");
      setEditType(base.trackingType || "number");
      setEditTarget(String(base.target || 1));
      setEditUnit(base.unit || "hrs");
    }
  }, [targetEditId, customHabits, defaultConfigsKey]);

  const handleUpdateHabit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) {
      alert("Please enter a habit name");
      return;
    }

    // Check custom habits
    const foundCustom = customHabits.find(
      (ch) =>
        ch.id === targetEditId ||
        ch.name.toLowerCase() === targetEditId.toLowerCase() ||
        ("custom_" + ch.name.toLowerCase()) === targetEditId.toLowerCase() ||
        targetEditId.toLowerCase().includes(ch.name.toLowerCase())
    );

    if (foundCustom) {
      const updated = customHabits.map((item) => {
        if (item.id === foundCustom.id || item.name.toLowerCase() === foundCustom.name.toLowerCase()) {
          return {
            ...item,
            name: trimmed,
            description: editDesc.trim() || undefined,
            category: editCategory,
            frequency: editFrequency,
            trackingType: editType,
            target: editType === "number" ? Math.max(1, Number(editTarget) || 1) : 1,
            unit: editType === "number" ? editUnit.trim() || "times" : "done",
          };
        }
        return item;
      });
      setCustomHabits(updated);
      try {
        localStorage.setItem(customHabitsKey, JSON.stringify(updated));
      } catch (e) {}
    } else {
      const defaultKey = Object.keys(DEFAULT_HABIT_SPECS_MAP).find(
        (k) =>
          k === targetEditId.toLowerCase() ||
          targetEditId.toLowerCase().includes(k) ||
          DEFAULT_HABIT_SPECS_MAP[k].name.toLowerCase() === targetEditId.toLowerCase()
      ) || targetEditId.toLowerCase();

      let savedConfigs: Record<string, any> = {};
      try {
        const raw = localStorage.getItem(defaultConfigsKey);
        if (raw) savedConfigs = JSON.parse(raw);
      } catch (e) {}

      savedConfigs[defaultKey] = {
        name: trimmed,
        description: editDesc.trim() || undefined,
        category: editCategory,
        frequency: editFrequency,
        trackingType: editType,
        target: editType === "number" ? Math.max(1, Number(editTarget) || 1) : 1,
        unit: editType === "number" ? editUnit.trim() || "times" : "done",
      };

      try {
        localStorage.setItem(defaultConfigsKey, JSON.stringify(savedConfigs));
      } catch (e) {}
    }

    // Return to dashboard
    navigate("/dashboard");
  };

  // Save enabled defaults to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(enabledDefaultsKey, JSON.stringify(enabledDefaults));
    } catch (e) {}
  }, [enabledDefaults, enabledDefaultsKey]);

  // Save custom habits definitions to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(customHabitsKey, JSON.stringify(customHabits));
    } catch (e) {}
  }, [customHabits, customHabitsKey]);

  const toggleFocusArea = (id: string) => {
    setFocusAreas((current) =>
      current.includes(id) ? current.filter((area) => area !== id) : [...current, id]
    );
  };

  const removeDefaultHabit = (id: string) => {
    setEnabledDefaults((current) => current.filter((habitId) => habitId !== id));
  };

  const restoreDefaultHabit = (id: string) => {
    if (!enabledDefaults.includes(id)) {
      setEnabledDefaults((current) => [...current, id]);
    }
  };

  const restoreAllDefaults = () => {
    setEnabledDefaults(DEFAULT_HABITS.map((h) => h.id));
  };

  const handleCreateCustomHabit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = newHabitName.trim();
    if (!trimmedName) {
      alert("Please enter a habit name");
      return;
    }

    const newHabit: CustomHabitDef = {
      id: "ch_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: trimmedName,
      description: newHabitDesc.trim() || undefined,
      category: newHabitCategory || "General",
      frequency: newHabitFrequency,
      trackingType: newHabitType,
      target: newHabitType === "number" ? Math.max(1, Number(newHabitTarget) || 1) : 1,
      unit: newHabitType === "number" ? newHabitUnit.trim() || "times" : "done",
    };

    setCustomHabits((prev) => [...prev, newHabit]);
    setIsCreating(false);
    // Reset create fields
    setNewHabitName("");
    setNewHabitDesc("");
    setNewHabitCategory("Productivity");
    setNewHabitFrequency("daily");
    setNewHabitType("number");
    setNewHabitTarget("30");
    setNewHabitUnit("mins");
  };

  const handleDeleteCustomHabit = (id: string) => {
    setCustomHabits((prev) => prev.filter((h) => h.id !== id));
    setCustomValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const applySuggestion = (s: typeof SUGGESTIONS[number]) => {
    setNewHabitName(s.name);
    setNewHabitCategory(s.category);
    setNewHabitType(s.trackingType);
    setNewHabitTarget(String(s.target));
    setNewHabitUnit(s.unit);
  };

  const updateCustomHabitValue = (id: string, value: string | number, completed?: boolean) => {
    setCustomValues((prev) => ({
      ...prev,
      [id]: {
        value,
        completed: completed !== undefined ? completed : prev[id]?.completed || false,
      },
    }));
  };

  const toggleCustomHabitCompleted = (id: string) => {
    setCustomValues((prev) => {
      const current = prev[id] || { value: 0, completed: false };
      const nextCompleted = !current.completed;
      return {
        ...prev,
        [id]: {
          value: nextCompleted ? 1 : 0,
          completed: nextCompleted,
        },
      };
    });
  };

  const handleSubmit = async () => {
    const rawToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const normalizedToken = rawToken ? String(rawToken).trim().replace(/^\"|\"$/g, "") : "";
    const token = normalizedToken && normalizedToken !== "null" && normalizedToken !== "undefined" ? normalizedToken : null;
    if (!token) {
      alert("Please login first");
      return;
    }

    setLoading(true);
    try {
      // Build custom habits array matching backend schema
      const formattedCustomHabits = customHabits.map((ch) => {
        const val = customValues[ch.id] || { value: 0, completed: false };
        const numVal = Number(val.value) || 0;
        const targetVal = Number(ch.target) || 1;
        const isDone = ch.trackingType === "checkbox" ? Boolean(val.completed) : numVal >= targetVal;

        return {
          name: ch.name,
          category: ch.category || "General",
          target: targetVal,
          unit: ch.unit || (ch.trackingType === "checkbox" ? "done" : ""),
          value: ch.trackingType === "checkbox" ? (isDone ? 1 : 0) : numVal,
          completed: isDone,
        };
      });

      // Include ONLY enabled habits so unselected habits are NEVER treated as failed
      const body: any = {
        userType: "general",
        focusAreas,
        customHabits: formattedCustomHabits,
      };

      if (enabledDefaults.includes("study") && studyHours !== "") {
        body.studyHours = Number(studyHours);
      }
      if (enabledDefaults.includes("sleep") && sleepHours !== "") {
        body.sleepHours = Number(sleepHours);
      }
      if (enabledDefaults.includes("water") && waterIntake !== "") {
        body.waterIntake = Number(waterIntake);
      }
      if (enabledDefaults.includes("workout") && workout !== "") {
        body.workout = Number(workout);
      }
      if (enabledDefaults.includes("mood") && mood !== "") {
        body.mood = mood;
      }
      if (enabledDefaults.includes("meditation") && meditationMinutes !== "") {
        body.meditationMinutes = Number(meditationMinutes);
      }

      
      const url = `${API_BASE}/api/habits`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to submit habits");
        return;
      }

      alert("Habits submitted successfully! 🎉");

      // Reset today's inputs while preserving habit definitions
      setFocusAreas([]);
      setStudyHours("");
      setSleepHours("");
      setWaterIntake("");
      setWorkout("");
      setMood("");
      setMeditationMinutes("");
      setCustomValues({});
    } catch (error) {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render Edit Mode view if editing an existing habit
  if (isEditMode) {
    return (
      <Card className="rounded-2xl border border-border shadow-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Pencil size={15} className="text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Edit Habit: {editName || "Habit"}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your habit configuration, target, and tracking preferences.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Edit Mode
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          {/* 1. Habit Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Habit Name *
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Study / Learning, Workout, Reading..."
                className="rounded-xl text-xs h-9 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Description (Optional)
              </Label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="e.g. 2 hours of deep focus study"
                className="rounded-xl text-xs h-9 bg-background"
              />
            </div>
          </div>

          {/* 2. Focus Area / Category & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Focus Area / Category
              </Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="rounded-xl text-xs h-9 bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="Career">Career</SelectItem>
                  <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Frequency
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditFrequency("daily")}
                  className={`h-9 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    editFrequency === "daily"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  <Calendar size={13} /> Daily
                </button>
                <button
                  type="button"
                  onClick={() => setEditFrequency("weekly")}
                  className={`h-9 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    editFrequency === "weekly"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  <Target size={13} /> Weekly
                </button>
              </div>
            </div>
          </div>

          {/* 3. Tracking Type & Target Amount */}
          <div className="space-y-2.5">
            <Label className="text-xs font-medium text-foreground">
              Tracking Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditType("number")}
                className={`h-9 rounded-xl text-xs font-medium border transition ${
                  editType === "number"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                Numeric Target (hours, mins, litres...)
              </button>
              <button
                type="button"
                onClick={() => setEditType("checkbox")}
                className={`h-9 rounded-xl text-xs font-medium border transition ${
                  editType === "checkbox"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                Yes / No Checkbox (Done)
              </button>
            </div>

            {editType === "number" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Target Amount</Label>
                  <Input
                    type="number"
                    min="1"
                    step="any"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    placeholder="e.g. 2"
                    className="rounded-xl text-xs h-9 mt-1 bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Unit</Label>
                  <Input
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="e.g. hrs, mins, litres"
                    className="rounded-xl text-xs h-9 mt-1 bg-background"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateHabit}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-sm"
            >
              Update Habit
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Log Today's Habits
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select focus areas, track your active habits, or add personal custom habits.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {totalActiveHabits} Active Habit{totalActiveHabits === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">

        {/* 1. FOCUS AREAS (OPTIONAL) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Focus Areas (Optional)
            </Label>
            {focusAreas.length > 0 && (
              <button
                type="button"
                onClick={() => setFocusAreas([])}
                className="text-[11px] text-muted-foreground hover:text-foreground transition underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => {
              const isSelected = focusAreas.includes(area.id);
              return (
                <button
                  type="button"
                  key={area.id}
                  onClick={() => toggleFocusArea(area.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  {isSelected && <Check size={12} className="stroke-[3]" />}
                  {area.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. DAILY HABITS */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Daily Habits
            </Label>
            {hiddenDefaults.length > 0 && (
              <button
                type="button"
                onClick={restoreAllDefaults}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw size={11} /> Restore All Defaults
              </button>
            )}
          </div>

          {/* Hidden defaults restore chips */}
          {hiddenDefaults.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
              <span className="text-muted-foreground text-[11px]">Hidden habits:</span>
              {hiddenDefaults.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => restoreDefaultHabit(h.id)}
                  className="px-2 py-0.5 rounded-md bg-background border border-border hover:border-emerald-500 hover:text-emerald-500 text-[11px] font-medium flex items-center gap-1 transition"
                >
                  <Plus size={10} /> {h.label}
                </button>
              ))}
            </div>
          )}

          {/* Default habits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFAULT_HABITS.map((habit) => {
              if (!enabledDefaults.includes(habit.id)) return null;

              return (
                <div
                  key={habit.id}
                  className="p-3.5 rounded-xl border border-border bg-card/60 hover:border-border/80 transition-all space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-lg ${habit.bgColor} flex items-center justify-center`}>
                        <habit.Icon size={14} className={habit.iconColor} />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {habit.label}
                      </span>
                    </div>

                    {/* Remove default habit button */}
                    <button
                      type="button"
                      onClick={() => removeDefaultHabit(habit.id)}
                      title="Remove habit from daily tracker"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1 rounded-md transition"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {habit.type === "select" ? (
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="rounded-xl text-xs h-9 bg-background">
                        <SelectValue placeholder="Select today's mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="great">Great 😄</SelectItem>
                        <SelectItem value="good">Good 🙂</SelectItem>
                        <SelectItem value="neutral">Neutral 😐</SelectItem>
                        <SelectItem value="bad">Bad 😞</SelectItem>
                        <SelectItem value="terrible">Terrible 😢</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={
                          habit.id === "study"
                            ? studyHours
                            : habit.id === "sleep"
                            ? sleepHours
                            : habit.id === "water"
                            ? waterIntake
                            : habit.id === "workout"
                            ? workout
                            : meditationMinutes
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (habit.id === "study") setStudyHours(val);
                          else if (habit.id === "sleep") setSleepHours(val);
                          else if (habit.id === "water") setWaterIntake(val);
                          else if (habit.id === "workout") setWorkout(val);
                          else if (habit.id === "meditation") setMeditationMinutes(val);
                        }}
                        placeholder={habit.placeholder}
                        className="rounded-xl text-xs h-9 pr-14 bg-background"
                      />
                      {habit.unit && (
                        <span className="absolute right-3 top-2.5 text-[11px] text-muted-foreground pointer-events-none">
                          {habit.unit}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User's Custom Habits list */}
          {customHabits.length > 0 && (
            <div className="pt-2 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={12} className="text-emerald-500" />
                Custom Habits ({customHabits.length})
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customHabits.map((ch) => {
                  const currentVal = customValues[ch.id] || { value: "", completed: false };

                  return (
                    <div
                      key={ch.id}
                      className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/30 transition-all space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground">
                            {ch.name}
                          </span>
                          {ch.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                              {ch.category}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground capitalize">
                            • {ch.frequency}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCustomHabit(ch.id)}
                          title="Delete custom habit"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1 rounded-md transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {ch.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {ch.description}
                        </p>
                      )}

                      {ch.trackingType === "checkbox" ? (
                        <button
                          type="button"
                          onClick={() => toggleCustomHabitCompleted(ch.id)}
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition ${
                            currentVal.completed
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                          }`}
                        >
                          {currentVal.completed ? (
                            <>
                              <CheckCircle2 size={14} /> Completed Today
                            </>
                          ) : (
                            "Mark as Done"
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              value={currentVal.value}
                              onChange={(e) => updateCustomHabitValue(ch.id, e.target.value)}
                              placeholder={`Target: ${ch.target} ${ch.unit}`}
                              className="rounded-xl text-xs h-9 pr-14 bg-background"
                            />
                            {ch.unit && (
                              <span className="absolute right-3 top-2.5 text-[11px] text-muted-foreground pointer-events-none">
                                {ch.unit}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            / {ch.target} {ch.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. + CREATE CUSTOM HABIT */}
        <div className="pt-1">
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Plus size={16} /> + Create Custom Habit
            </button>
          ) : (
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-card shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Sparkles size={13} className="text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Create Custom Habit</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md transition"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Quick suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => applySuggestion(s)}
                      className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-[11px] font-medium border border-border/60 transition"
                    >
                      + {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Habit Name & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Habit Name *
                  </Label>
                  <Input
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Coding, Running, Revision..."
                    className="rounded-xl text-xs h-9 bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Optional Description
                  </Label>
                  <Input
                    value={newHabitDesc}
                    onChange={(e) => setNewHabitDesc(e.target.value)}
                    placeholder="e.g. 2 LeetCode problems or 30-min walk"
                    className="rounded-xl text-xs h-9 bg-background"
                  />
                </div>
              </div>

              {/* Category & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Category (Optional)
                  </Label>
                  <Select value={newHabitCategory} onValueChange={setNewHabitCategory}>
                    <SelectTrigger className="rounded-xl text-xs h-9 bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Career">Career</SelectItem>
                      <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Frequency
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewHabitFrequency("daily")}
                      className={`h-9 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                        newHabitFrequency === "daily"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      <Calendar size={13} /> Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewHabitFrequency("weekly")}
                      className={`h-9 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                        newHabitFrequency === "weekly"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      <Target size={13} /> Weekly
                    </button>
                  </div>
                </div>
              </div>

              {/* Tracking Type: Number vs Checkbox */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">
                  Tracking Value
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewHabitType("number")}
                    className={`h-9 rounded-xl text-xs font-medium border transition ${
                      newHabitType === "number"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    Numeric Target (mins, kms, pages...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHabitType("checkbox")}
                    className={`h-9 rounded-xl text-xs font-medium border transition ${
                      newHabitType === "checkbox"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    Yes / No Checkbox (Done)
                  </button>
                </div>

                {newHabitType === "number" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Target Amount</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newHabitTarget}
                        onChange={(e) => setNewHabitTarget(e.target.value)}
                        placeholder="e.g. 30"
                        className="rounded-xl text-xs h-9 mt-1 bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Unit</Label>
                      <Input
                        value={newHabitUnit}
                        onChange={(e) => setNewHabitUnit(e.target.value)}
                        placeholder="e.g. mins, pages, km"
                        className="rounded-xl text-xs h-9 mt-1 bg-background"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCustomHabit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-sm"
                >
                  Save Habit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. SUBMIT BUTTON */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)" }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting Habits...
            </>
          ) : (
            "Submit Habits"
          )}
        </button>

      </CardContent>
    </Card>
  );
};

export default HabitForm;
