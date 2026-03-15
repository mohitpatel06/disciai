import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";

const BADGES = [
    {
        id: "first_habit",
        icon: "🌱",
        title: "First Step",
        desc: "Log your first habit",
        color: "emerald",
        check: (habits) => habits.length >= 1,
    },
    {
        id: "week_streak",
        icon: "🔥",
        title: "Week Warrior",
        desc: "Maintain a 7 day streak",
        color: "orange",
        check: (habits) => habits.some((h) => h.streak >= 7),
    },
    {
        id: "month_streak",
        icon: "⚡",
        title: "Month Master",
        desc: "Maintain a 30 day streak",
        color: "yellow",
        check: (habits) => habits.some((h) => h.streak >= 30),
    },
    {
        id: "perfect_score",
        icon: "💯",
        title: "Perfect Score",
        desc: "Get 100% discipline score",
        color: "green",
        check: (habits) => habits.some((h) => h.disciplineScore === 100),
    },
    {
        id: "study_champion",
        icon: "📚",
        title: "Study Champion",
        desc: "Study 8+ hours in a day",
        color: "blue",
        check: (habits) => habits.some((h) => h.studyHours >= 8),
    },
    {
        id: "workout_warrior",
        icon: "💪",
        title: "Workout Warrior",
        desc: "Workout 60+ minutes in a day",
        color: "red",
        check: (habits) => habits.some((h) => h.workout >= 60),
    },
    {
        id: "hydration_hero",
        icon: "💧",
        title: "Hydration Hero",
        desc: "Drink 8+ glasses of water",
        color: "cyan",
        check: (habits) => habits.some((h) => h.waterIntake >= 8),
    },
    {
        id: "sleep_master",
        icon: "😴",
        title: "Sleep Master",
        desc: "Sleep 8+ hours",
        color: "purple",
        check: (habits) => habits.some((h) => h.sleepHours >= 8),
    },
    {
        id: "no_junk",
        icon: "🥗",
        title: "Clean Eater",
        desc: "Avoid junk food 7 days in a row",
        color: "lime",
        check: (habits) => {
            let count = 0;
            for (const h of habits) {
                if (!h.junkFood) count++;
                else count = 0;
                if (count >= 7) return true;
            }
            return false;
        },
    },
    {
        id: "consistency_50",
        icon: "🎯",
        title: "Half Century",
        desc: "Log habits 50 times",
        color: "indigo",
        check: (habits) => habits.length >= 50,
    },
    {
        id: "great_mood",
        icon: "😄",
        title: "Good Vibes",
        desc: "Log 'great' mood 5 times",
        color: "pink",
        check: (habits) => habits.filter((h) => h.mood === "great").length >= 5,
    },
    {
        id: "legend",
        icon: "🏆",
        title: "DisciAI Legend",
        desc: "Earn all other badges",
        color: "gold",
        check: (habits, earned) => earned >= 11,
    },
];

const colorMap = {
    emerald: "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
    orange: "border-orange-400 bg-orange-50 dark:bg-orange-900/20",
    yellow: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
    green: "border-green-400 bg-green-50 dark:bg-green-900/20",
    blue: "border-blue-400 bg-blue-50 dark:bg-blue-900/20",
    red: "border-red-400 bg-red-50 dark:bg-red-900/20",
    cyan: "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20",
    purple: "border-purple-400 bg-purple-50 dark:bg-purple-900/20",
    lime: "border-lime-400 bg-lime-50 dark:bg-lime-900/20",
    indigo: "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
    pink: "border-pink-400 bg-pink-50 dark:bg-pink-900/20",
    gold: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
};

const Achievements = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "https://disciai-backend.onrender.com/api/habits",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setHabits(res.data);
            } catch (error) {
                console.log("Error fetching habits");
            } finally {
                setLoading(false);
            }
        };
        fetchHabits();
    }, []);

    const earnedCount = BADGES.slice(0, 11).filter((b) => b.check(habits, 0)).length;
    const badgeResults = BADGES.map((b) => ({
        ...b,
        earned: b.id === "legend" ? b.check(habits, earnedCount) : b.check(habits, 0),
    }));
    const totalEarned = badgeResults.filter((b) => b.earned).length;

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-8 animate-pulse max-w-4xl mx-auto">
                    <div className="h-8 w-48 bg-muted rounded"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-36 bg-muted rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">🏆 Achievements</h1>
                    <p className="text-muted-foreground mt-1">
                        Earn badges by building great habits
                    </p>
                </div>

                {/* Progress */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-foreground text-lg">Your Progress</h2>
                        <span className="text-2xl font-bold text-emerald-500">
                            {totalEarned}/{BADGES.length}
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4">
                        <div
                            className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${(totalEarned / BADGES.length) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {totalEarned === BADGES.length
                            ? "🎉 You've earned all badges! You're a DisciAI Legend!"
                            : `${BADGES.length - totalEarned} badges remaining — keep going!`}
                    </p>
                </div>

                {/* Earned Badges */}
                {totalEarned > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-4">
                            ✅ Earned ({totalEarned})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {badgeResults.filter((b) => b.earned).map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`rounded-2xl border-2 p-4 text-center transition-all ${colorMap[badge.color]}`}
                                >
                                    <div className="text-4xl mb-2">{badge.icon}</div>
                                    <p className="font-bold text-foreground text-sm">{badge.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
                                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                        ✅ Earned!
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Badges */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        🔒 Locked ({BADGES.length - totalEarned})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {badgeResults.filter((b) => !b.earned).map((badge) => (
                            <div
                                key={badge.id}
                                className="rounded-2xl border-2 border-border bg-muted/30 p-4 text-center opacity-50"
                            >
                                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                                <p className="font-bold text-foreground text-sm">{badge.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
                                <div className="mt-2 text-xs text-muted-foreground font-semibold">
                                    🔒 Locked
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Achievements;