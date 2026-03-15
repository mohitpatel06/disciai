import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";

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
        { key: "studyHours", label: "Daily Study Hours", icon: "📚", unit: "hours", min: 1, max: 16, trackColor: "#3b82f6" },
        { key: "workout", label: "Daily Workout", icon: "💪", unit: "minutes", min: 10, max: 180, trackColor: "#ef4444" },
        { key: "sleepHours", label: "Daily Sleep", icon: "😴", unit: "hours", min: 4, max: 12, trackColor: "#8b5cf6" },
        { key: "waterIntake", label: "Daily Water Intake", icon: "💧", unit: "glasses", min: 4, max: 20, trackColor: "#06b6d4" },
    ];

    const getTextColor = (trackColor) => {
        const map = {
            "#3b82f6": "text-blue-500",
            "#ef4444": "text-red-500",
            "#8b5cf6": "text-purple-500",
            "#06b6d4": "text-cyan-500",
        };
        return map[trackColor] || "text-emerald-500";
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
                    <div className="h-8 w-36 bg-muted rounded"></div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-6">
                            <div className="h-4 w-32 bg-muted rounded mb-4"></div>
                            <div className="h-8 w-full bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">🎯 Daily Goals</h1>
                    <p className="text-muted-foreground mt-1">
                        Set your daily targets and track your progress
                    </p>
                </div>

                {/* Goals Cards */}
                <div className="space-y-4">
                    {goalItems.map((item) => {
                        const percent = ((goals[item.key] - item.min) / (item.max - item.min)) * 100;
                        return (
                            <div key={item.key} className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <p className="font-semibold text-foreground">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Target: {goals[item.key]} {item.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-bold ${getTextColor(item.trackColor)}`}>
                                        {goals[item.key]}
                                    </div>
                                </div>

                                {/* ✅ Custom Slider — dono themes mein sahi dikhega */}
                                <div className="relative w-full h-6 flex items-center">
                                    {/* Track background */}
                                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 relative">
                                        {/* Filled track */}
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: item.trackColor,
                                            }}
                                        ></div>
                                    </div>
                                    {/* Range input on top */}
                                    <input
                                        type="range"
                                        min={item.min}
                                        max={item.max}
                                        value={goals[item.key]}
                                        onChange={(e) =>
                                            setGoals({ ...goals, [item.key]: Number(e.target.value) })
                                        }
                                        className="absolute w-full h-2 opacity-0 cursor-pointer"
                                        style={{ zIndex: 2 }}
                                    />
                                    {/* Custom thumb */}
                                    <div
                                        className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md transition-all"
                                        style={{
                                            left: `calc(${percent}% - 10px)`,
                                            backgroundColor: item.trackColor,
                                            zIndex: 1,
                                        }}
                                    ></div>
                                </div>

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
                    disabled={saving}
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600"
                >
                    {saving ? "Saving..." : saved ? "✅ Goals Saved!" : "Save Goals"}
                </button>

            </div>
        </DashboardLayout>
    );
};

export default Goals;