import API_BASE from "@/lib/apiBase";
import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Lock, CheckCircle } from "lucide-react";

const computeHabitStats = (habits) => {
    const stats = {
        total: habits.length,
        bestStreak: 0,
        perfectDays: 0,
        greatMood: 0,
        noJunkMaxStreak: 0,
        studyDays: 0,
        readingDays: 0,
        meditationDays: 0,
        outdoorDays: 0,
        balancedDays: 0,
        customCreated: 0,
        customCompleted: 0,
        focusAreaCounts: {},
    };

    let currentNoJunk = 0;

    habits.forEach((h) => {
        const streak = h.streak || 0;
        stats.bestStreak = Math.max(stats.bestStreak, streak);

        if (h.disciplineScore === 100) stats.perfectDays += 1;
        if (h.mood === "great") stats.greatMood += 1;

        if (!h.junkFood) {
            currentNoJunk += 1;
            stats.noJunkMaxStreak = Math.max(stats.noJunkMaxStreak, currentNoJunk);
        } else {
            currentNoJunk = 0;
        }

        if (h.studyHours >= 4) stats.studyDays += 1;
        if (h.readingMinutes >= 20) stats.readingDays += 1;
        if (h.meditationMinutes >= 10) stats.meditationDays += 1;
        if (h.outdoorTime >= 30) stats.outdoorDays += 1;

        if (Array.isArray(h.focusAreas)) {
            h.focusAreas.forEach((area) => {
                if (!area) return;
                stats.focusAreaCounts[area] = (stats.focusAreaCounts[area] || 0) + 1;
            });
        }

        if (Array.isArray(h.customHabits)) {
            stats.customCreated += h.customHabits.length;
            stats.customCompleted += h.customHabits.filter((habit) => habit.completed || habit.value >= habit.target).length;
        }

        const balancedChecks = [
            h.sleepHours >= 7,
            h.waterIntake >= 2.5,
            h.workout >= 20,
            !h.junkFood,
            h.mood !== "bad" && h.mood !== "terrible",
        ].filter(Boolean).length;

        if (balancedChecks >= 4) stats.balancedDays += 1;
    });

    return stats;
};

const getBadgeDefinitions = (stats) => [
    {
        id: "first_habit",
        icon: "🌱",
        title: "First Step",
        desc: "Log your first habit entry.",
        category: "Getting Started",
        color: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-500" },
        check: () => stats.total >= 1,
    },
    {
        id: "week_streak",
        icon: "🔥",
        title: "Week Warrior",
        desc: "Keep a 7-day streak going.",
        category: "Streaks",
        color: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-500" },
        check: () => stats.bestStreak >= 7,
    },
    {
        id: "month_streak",
        icon: "⚡",
        title: "Month Master",
        desc: "Build a 30-day streak.",
        category: "Streaks",
        color: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-500" },
        check: () => stats.bestStreak >= 30,
    },
    {
        id: "perfect_score",
        icon: "💯",
        title: "Perfect Score",
        desc: "Hit a 100% discipline score day.",
        category: "Excellence",
        color: { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-500" },
        check: () => stats.perfectDays >= 1,
    },
    {
        id: "focus_health",
        icon: "💚",
        title: "Health Focus",
        desc: "Log health-focused habits 3 times.",
        category: "Focus",
        color: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-500" },
        check: () => stats.focusAreaCounts.health >= 3,
    },
    {
        id: "focus_productivity",
        icon: "🚀",
        title: "Productivity Focus",
        desc: "Log productivity-focused habits 3 times.",
        category: "Focus",
        color: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-500" },
        check: () => stats.focusAreaCounts.productivity >= 3,
    },
    {
        id: "focus_learning",
        icon: "📘",
        title: "Learning Focus",
        desc: "Log learning-focused habits 3 times.",
        category: "Focus",
        color: { border: "border-violet-500/30", bg: "bg-violet-500/10", text: "text-violet-500" },
        check: () => stats.focusAreaCounts.learning >= 3,
    },
    {
        id: "focus_mindfulness",
        icon: "🧘‍♂️",
        title: "Mindfulness Focus",
        desc: "Log mindfulness-focused habits 3 times.",
        category: "Focus",
        color: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-500" },
        check: () => stats.focusAreaCounts.mindfulness >= 3,
    },
    {
        id: "custom_starter",
        icon: "🛠️",
        title: "Custom Habit Creator",
        desc: "Create at least one custom habit.",
        category: "Custom",
        color: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-500" },
        check: () => stats.customCreated >= 1,
    },
    {
        id: "custom_finisher",
        icon: "✅",
        title: "Custom Habit Finisher",
        desc: "Complete a custom habit goal.",
        category: "Custom",
        color: { border: "border-violet-500/30", bg: "bg-violet-500/10", text: "text-violet-500" },
        check: () => stats.customCompleted >= 1,
    },
    {
        id: "balanced_day",
        icon: "⚖️",
        title: "Balanced Day",
        desc: "Have 3 days with strong core habits.",
        category: "Wellness",
        color: { border: "border-indigo-500/30", bg: "bg-indigo-500/10", text: "text-indigo-500" },
        check: () => stats.balancedDays >= 3,
    },
    {
        id: "good_vibes",
        icon: "😄",
        title: "Good Vibes",
        desc: "Log a great mood 5 times.",
        category: "Mindset",
        color: { border: "border-pink-500/30", bg: "bg-pink-500/10", text: "text-pink-500" },
        check: () => stats.greatMood >= 5,
    },
    {
        id: "no_junk",
        icon: "🥗",
        title: "Clean Eater",
        desc: "Avoid junk food for 7 consecutive days.",
        category: "Health",
        color: { border: "border-lime-500/30", bg: "bg-lime-500/10", text: "text-lime-500" },
        check: () => stats.noJunkMaxStreak >= 7,
    },
    {
        id: "consistency_50",
        icon: "🎯",
        title: "Half Century",
        desc: "Log habits 50 times.",
        category: "Consistency",
        color: { border: "border-indigo-500/30", bg: "bg-indigo-500/10", text: "text-indigo-500" },
        check: () => stats.total >= 50,
    },
    {
        id: "legend",
        icon: "🏆",
        title: "DisciAI Legend",
        desc: "Earn all other badges.",
        category: "Legendary",
        color: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-500" },
        check: (_, earnedCount, totalCount) => earnedCount >= totalCount - 1,
    },
];

const BadgeCard = ({ badge, earned }: { badge: any; earned: boolean }) => (
    <div className={`relative bg-card rounded-2xl border p-4 transition-all duration-200 ${earned
            ? `${badge.color.border} hover:shadow-md`
            : "border-border opacity-50"
        }`}>

        {/* Earned checkmark */}
        {earned && (
            <div className="absolute top-3 right-3">
                <CheckCircle size={14} className="text-emerald-500" />
            </div>
        )}

        {/* Lock icon */}
        {!earned && (
            <div className="absolute top-3 right-3">
                <Lock size={12} className="text-muted-foreground" />
            </div>
        )}

        {/* Icon */}
        <div className={`h-12 w-12 rounded-xl ${earned ? badge.color.bg : "bg-muted"} flex items-center justify-center mb-3 text-2xl ${!earned ? "grayscale" : ""}`}>
            {badge.icon}
        </div>

        {/* Category tag */}
        <div className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium ${earned ? `${badge.color.bg} ${badge.color.text}` : "bg-muted text-muted-foreground"
            }`}>
            {badge.category}
        </div>

        <p className="font-bold text-foreground text-sm leading-tight">{badge.title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{badge.desc}</p>

        {earned && (
            <p className={`text-xs font-semibold mt-2 ${badge.color.text}`}>
                Earned ✓
            </p>
        )}
    </div>
);

const Achievements = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    API_BASE + "/api/habits",
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

    const stats = computeHabitStats(habits);
    const badgeDefinitions = getBadgeDefinitions(stats);
    const earnedBase = badgeDefinitions
        .filter((badge) => badge.id !== "legend")
        .filter((badge) => badge.check(stats, 0, badgeDefinitions.length)).length;

    const badgeResults = badgeDefinitions.map((badge) => ({
        ...badge,
        earned: badge.id === "legend"
            ? badge.check(stats, earnedBase, badgeDefinitions.length)
            : badge.check(stats, earnedBase, badgeDefinitions.length),
    }));

    const totalEarned = badgeResults.filter((b) => b.earned).length;
    const progressPercent = Math.round((totalEarned / badgeDefinitions.length) * 100);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
                    <div className="h-8 w-48 bg-muted rounded-lg"></div>
                    <div className="bg-card border border-border rounded-2xl p-6 h-28"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-40 bg-muted rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Earn badges by building great habits
                    </p>
                </div>

                {/* Progress Card */}
                <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Trophy size={16} className="text-yellow-500" />
                            <p className="font-semibold text-foreground text-sm">Overall Progress</p>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                            {totalEarned} <span className="text-muted-foreground font-normal">/ {badgeDefinitions.length}</span>
                        </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 mt-3 mb-2">
                        <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {totalEarned === badgeDefinitions.length
                                ? "🎉 All badges earned! You're a DisciAI Legend!"
                                : `${badgeDefinitions.length - totalEarned} badges remaining`}
                        </p>
                        <p className="text-xs font-bold text-emerald-500">{progressPercent}%</p>
                    </div>
                </div>

                {/* Earned Badges */}
                {totalEarned > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <h2 className="text-base font-bold text-foreground">
                                Earned <span className="text-muted-foreground font-normal">({totalEarned})</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {badgeResults.filter((b) => b.earned).map((badge) => (
                                <BadgeCard key={badge.id} badge={badge} earned={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Badges */}
                {badgeDefinitions.length - totalEarned > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Lock size={16} className="text-muted-foreground" />
                            <h2 className="text-base font-bold text-foreground">
                                Locked <span className="text-muted-foreground font-normal">({badgeDefinitions.length - totalEarned})</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {badgeResults.filter((b) => !b.earned).map((badge) => (
                                <BadgeCard key={badge.id} badge={badge} earned={false} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Achievements;
