import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";

const Calendar = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const filledDates = new Set(
        habits.map((h) => {
            const d = new Date(h.createdAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    );

    const filledUniqueDays = new Set(
        habits
            .filter((h) => {
                const d = new Date(h.createdAt);
                return d.getMonth() === month && d.getFullYear() === year;
            })
            .map((h) => new Date(h.createdAt).getDate())
    );

    const filledThisMonth = filledUniqueDays.size;
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const totalDaysSoFar = isCurrentMonth ? today.getDate() : daysInMonth;

    let missedDays = 0;
    for (let d = 1; d <= totalDaysSoFar; d++) {
        const dateKey = `${year}-${month}-${d}`;
        if (!filledDates.has(dateKey)) missedDays++;
    }

    const consistency = totalDaysSoFar > 0
        ? Math.round((filledThisMonth / totalDaysSoFar) * 100)
        : 0;

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // ✅ Loading state
    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto space-y-8">
                    <div>
                        {/* ✅ Fixed emoji */}
                        <h1 className="text-3xl font-bold text-foreground">🗓️ Habit Calendar</h1>
                        <p className="text-muted-foreground mt-1">Track which days you filled your habits</p>
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-xl p-4 text-center animate-pulse">
                                <div className="h-8 w-12 bg-muted rounded mx-auto mb-2"></div>
                                <div className="h-3 w-16 bg-muted rounded mx-auto"></div>
                            </div>
                        ))}
                    </div>

                    {/* Calendar Skeleton */}
                    <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
                        <div className="h-6 w-32 bg-muted rounded mx-auto mb-6"></div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-10 bg-muted rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-2xl mx-auto">

                <div>
                    {/* ✅ Fixed emoji */}
                    <h1 className="text-3xl font-bold text-foreground">🗓️ Habit Calendar</h1>
                    <p className="text-muted-foreground mt-1">
                        Track which days you filled your habits
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{filledThisMonth}</p>
                        <p className="text-xs text-muted-foreground mt-1">Days Filled</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-red-500">{missedDays}</p>
                        <p className="text-xs text-muted-foreground mt-1">Days Missed</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-500">{consistency}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Consistency</p>
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-card border border-border rounded-xl p-6">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={prevMonth}
                            className="p-2 rounded-lg hover:bg-muted transition text-foreground font-bold text-lg"
                        >
                            ←
                        </button>
                        <h2 className="text-xl font-bold text-foreground">{monthName}</h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 rounded-lg hover:bg-muted transition text-foreground font-bold text-lg"
                        >
                            →
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 mb-2">
                        {days.map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-10" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateKey = `${year}-${month}-${day}`;
                            const isFilled = filledDates.has(dateKey);
                            const isToday =
                                today.getDate() === day &&
                                today.getMonth() === month &&
                                today.getFullYear() === year;
                            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            const isFuture = new Date(year, month, day) > today;

                            return (
                                <div
                                    key={day}
                                    className={`h-10 w-full rounded-lg flex items-center justify-center text-sm font-medium transition-all ${isToday ? "ring-2 ring-emerald-500" : ""
                                        } ${isFilled
                                            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                            : isFuture
                                                ? "text-muted-foreground/40"
                                                : isPast
                                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                    : "text-foreground"
                                        }`}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-6 justify-center flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                            <span className="text-xs text-muted-foreground">Habit Filled ✅</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-red-500/10 border border-red-500/20"></div>
                            <span className="text-xs text-muted-foreground">Missed ❌</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded ring-2 ring-emerald-500"></div>
                            <span className="text-xs text-muted-foreground">Today</span>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Calendar;