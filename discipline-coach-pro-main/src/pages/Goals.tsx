import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Dumbbell, Moon, Droplets, CheckCircle } from "lucide-react";

const Goals = () => {
    const [goals, setGoals] = useState({
        studyHours: 6,
        workout: 30,
        sleepHours: 8,
        waterIntake: 8,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "https://disciai-backend.onrender.com/api/auth/goals",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setGoals(res.data);
            } catch (error) {
                console.log("Error fetching goals");
            } finally {
                setLoading(false);
            }
        };
        fetchGoals();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                "https://disciai-backend.onrender.com/api/auth/goals",
                goals,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.log("Error saving goals");
        } finally {
            setSaving(false);
        }
    };

    const goalItems = [
        {
            key: "studyHours",
            label: "Study Hours",
            sublabel: "Daily study target",
            Icon: BookOpen,
            unit: "hrs",
            min: 1,
            max: 16,
            trackColor: "#3b82f6",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            textColor: "text-blue-500",
        },
        {
            key: "workout",
            label: "Workout",
            sublabel: "Daily exercise target",
            Icon: Dumbbell,
            unit: "min",
            min: 10,
            max: 180,
            trackColor: "#ef4444",
            iconBg: "bg-red-500/10",
            iconColor: "text-red-500",
            textColor: "text-red-500",
        },
        {
            key: "sleepHours",
            label: "Sleep",
            sublabel: "Daily sleep target",
            Icon: Moon,
            unit: "hrs",
            min: 4,
            max: 12,
            trackColor: "#8b5cf6",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
            textColor: "text-purple-500",
        },
        {
            key: "waterIntake",
            label: "Water Intake",
            sublabel: "Daily hydration target",
            Icon: Droplets,
            unit: "gl",
            min: 4,
            max: 20,
            trackColor: "#06b6d4",
            iconBg: "bg-cyan-500/10",
            iconColor: "text-cyan-500",
            textColor: "text-cyan-500",
        },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
                    <div className="h-8 w-36 bg-muted rounded-lg"></div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-2xl p-5 h-28"></div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Daily Goals</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Set your daily targets — progress resets each day
                    </p>
                </div>

                {/* Goal Cards */}
                <div className="space-y-3">
                    {goalItems.map((item) => {
                        const percent = ((goals[item.key] - item.min) / (item.max - item.min)) * 100;
                        return (
                            <div
                                key={item.key}
                                className="bg-card border border-border rounded-2xl p-5"
                            >
                                {/* Top Row */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                                            <item.Icon size={18} className={item.iconColor} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-bold tabular-nums ${item.textColor}`}>
                                        {goals[item.key]}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">{item.unit}</span>
                                    </div>
                                </div>

                                {/* Slider */}
                                <div className="relative w-full h-5 flex items-center">
                                    {/* Track */}
                                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                                        <div
                                            className="h-1.5 rounded-full transition-all duration-150"
                                            style={{ width: `${percent}%`, backgroundColor: item.trackColor }}
                                        ></div>
                                    </div>
                                    {/* Hidden input */}
                                    <input
                                        type="range"
                                        min={item.min}
                                        max={item.max}
                                        value={goals[item.key]}
                                        onChange={(e) =>
                                            setGoals({ ...goals, [item.key]: Number(e.target.value) })
                                        }
                                        className="absolute w-full opacity-0 cursor-pointer h-5"
                                        style={{ zIndex: 2 }}
                                    />
                                    {/* Thumb */}
                                    <div
                                        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-150 pointer-events-none"
                                        style={{
                                            left: `calc(${percent}% - 8px)`,
                                            backgroundColor: item.trackColor,
                                            zIndex: 1,
                                        }}
                                    ></div>
                                </div>

                                {/* Min Max Labels */}
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>{item.min} {item.unit}</span>
                                    <span>{item.max} {item.unit}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`w-full py-3.5 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${saved
                            ? "bg-emerald-500 cursor-default"
                            : "bg-emerald-500 hover:bg-emerald-600 active:scale-95"
                        } disabled:opacity-70`}
                    style={{ boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)" }}
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <CheckCircle size={16} />
                            Goals Saved!
                        </>
                    ) : (
                        "Save Goals"
                    )}
                </button>

            </div>
        </DashboardLayout>
    );
};

export default Goals;