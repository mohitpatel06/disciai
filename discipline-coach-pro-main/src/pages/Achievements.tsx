import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Lock, CheckCircle } from "lucide-react";

const BADGES = [
    {
        id: "first_habit",
        icon: "🌱",
        title: "First Step",
        desc: "Log your first habit",
        category: "Getting Started",
        color: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-500" },
        check: (habits) => habits.length >= 1,
    },
    {
        id: "week_streak",
        icon: "🔥",
        title: "Week Warrior",
        desc: "Maintain a 7 day streak",
        category: "Streaks",
        color: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-500" },
        check: (habits) => habits.some((h) => h.streak >= 7),
    },
    {
        id: "month_streak",
        icon: "⚡",
        title: "Month Master",
        desc: "Maintain a 30 day streak",
        category: "Streaks",
        color: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-500" },
        check: (habits) => habits.some((h) => h.streak >= 30),
    },
    {
        id: "perfect_score",
        icon: "💯",
        title: "Perfect Score",
        desc: "Get 100% discipline score",
        category: "Excellence",
        color: { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-500" },
        check: (habits) => habits.some((h) => h.disciplineScore === 100),
    },
    {
        id: "study_champion",
        icon: "📚",
        title: "Study Champion",
        desc: "Study 8+ hours in a day",
        category: "Study",
        color: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-500" },
        check: (habits) => habits.some((h) => h.studyHours >= 8),
    },
    {
        id: "workout_warrior",
        icon: "💪",
        title: "Workout Warrior",
        desc: "Workout 60+ minutes in a day",
        category: "Fitness",
        color: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-500" },
        check: (habits) => habits.some((h) => h.workout >= 60),
    },
    {
        id: "hydration_hero",
        icon: "💧",
        title: "Hydration Hero",
        desc: "Drink 8+ glasses of water",
        category: "Health",
        color: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-500" },
        check: (habits) => habits.some((h) => h.waterIntake >= 8),
    },
    {
        id: "sleep_master",
        icon: "😴",
        title: "Sleep Master",
        desc: "Sleep 8+ hours",
        category: "Health",
        color: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-500" },
        check: (habits) => habits.some((h) => h.sleepHours >= 8),
    },
    {
        id: "no_junk",
        icon: "🥗",
        title: "Clean Eater",
        desc: "Avoid junk food 7 days in a row",
        category: "Health",
        color: { border: "border-lime-500/30", bg: "bg-lime-500/10", text: "text-lime-500" },
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
        category: "Consistency",
        color: { border: "border-indigo-500/30", bg: "bg-indigo-500/10", text: "text-indigo-500" },
        check: (habits) => habits.length >= 50,
    },
    {
        id: "great_mood",
        icon: "😄",
        title: "Good Vibes",
        desc: "Log 'great' mood 5 times",
        category: "Mindset",
        color: { border: "border-pink-500/30", bg: "bg-pink-500/10", text: "text-pink-500" },
        check: (habits) => habits.filter((h) => h.mood === "great").length >= 5,
    },
    {
        id: "legend",
        icon: "🏆",
        title: "DisciAI Legend",
        desc: "Earn all other badges",
        category: "Legendary",
        color: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-500" },
        check: (habits, earned) => earned >= 11,
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
    const progressPercent = Math.round((totalEarned / BADGES.length) * 100);

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
                            {totalEarned} <span className="text-muted-foreground font-normal">/ {BADGES.length}</span>
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
                            {totalEarned === BADGES.length
                                ? "🎉 All badges earned! You're a DisciAI Legend!"
                                : `${BADGES.length - totalEarned} badges remaining`}
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
                {BADGES.length - totalEarned > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Lock size={16} className="text-muted-foreground" />
                            <h2 className="text-base font-bold text-foreground">
                                Locked <span className="text-muted-foreground font-normal">({BADGES.length - totalEarned})</span>
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