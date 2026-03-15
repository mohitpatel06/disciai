import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Report = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatAIText = (text) => {
    if (!text) return [];
    const lines = text
      .replace(/###/g, "")
      .replace(/\*\*/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      const isHeading =
        line.toLowerCase().includes("productivity level") ||
        line.toLowerCase().includes("what you did well") ||
        line.toLowerCase().includes("what needs improvement") ||
        line.toLowerCase().includes("today's suggestions") ||
        line.toLowerCase().includes("discipline score:") ||
        line.toLowerCase().includes("hey ");

      if (isHeading) {
        if (currentSection) sections.push(currentSection);
        currentSection = { heading: line, items: [] };
      } else if (currentSection) {
        currentSection.items.push(line);
      } else {
        sections.push({ heading: line, items: [] });
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

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

  const weeklyHabits = habits.filter((habit) => {
    const habitDate = new Date(habit.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return habitDate >= sevenDaysAgo;
  });

  const monthlyHabits = habits.filter((habit) => {
    const habitDate = new Date(habit.createdAt);
    const now = new Date();
    return (
      habitDate.getMonth() === now.getMonth() &&
      habitDate.getFullYear() === now.getFullYear()
    );
  });

  const avgStudyHours = monthlyHabits.length
    ? (monthlyHabits.reduce((sum, h) => sum + h.studyHours, 0) / monthlyHabits.length).toFixed(1)
    : 0;
  const avgSleep = monthlyHabits.length
    ? (monthlyHabits.reduce((sum, h) => sum + h.sleepHours, 0) / monthlyHabits.length).toFixed(1)
    : 0;
  const avgWater = monthlyHabits.length
    ? (monthlyHabits.reduce((sum, h) => sum + h.waterIntake, 0) / monthlyHabits.length).toFixed(1)
    : 0;
  const avgScore = monthlyHabits.length
    ? (monthlyHabits.reduce((sum, h) => sum + h.disciplineScore, 0) / monthlyHabits.length).toFixed(1)
    : 0;

  const getHeadingStyle = (heading) => {
    const h = heading.toLowerCase();
    if (h.includes("what you did well"))
      return "text-green-600 dark:text-green-400 font-bold text-base";
    if (h.includes("what needs improvement"))
      return "text-orange-500 dark:text-orange-400 font-bold text-base";
    if (h.includes("today's suggestions"))
      return "text-blue-600 dark:text-blue-400 font-bold text-base";
    if (h.includes("productivity level"))
      return "text-purple-600 dark:text-purple-400 font-semibold text-sm";
    if (h.includes("discipline score"))
      return "text-emerald-600 dark:text-emerald-400 font-semibold text-sm";
    if (h.includes("hey "))
      return "text-foreground font-semibold text-base";
    return "text-foreground font-medium text-sm";
  };

  // ✅ Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Report</h1>
            <p className="text-muted-foreground">AI analysis of your habits</p>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-9 w-20 bg-muted rounded-lg animate-pulse"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="mb-6 animate-pulse">
              <CardHeader>
                <div className="h-5 w-24 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-muted rounded"></div>
                ))}
                <div className="col-span-2 h-4 bg-muted rounded w-full mt-2"></div>
              </CardContent>
              <div className="p-4 m-4 bg-muted rounded-xl">
                <div className="h-4 w-32 bg-muted rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                  <div className="h-3 bg-muted rounded w-3/5"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const HabitCard = ({ habit }) => {
    const sections = formatAIText(habit.aiFeedback);
    return (
      <Card className="mb-6 bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            {new Date(habit.createdAt).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-foreground"><strong>Study Hours:</strong> {habit.studyHours}</p>
          <p className="text-foreground"><strong>Workout:</strong> {habit.workout}</p>
          <p className="text-foreground"><strong>Sleep:</strong> {habit.sleepHours}</p>
          <p className="text-foreground"><strong>Water Intake:</strong> {habit.waterIntake}</p>
          <div className="col-span-1 md:col-span-2">
            <p className="font-semibold text-foreground">
              Discipline Score: {habit.disciplineScore}%
            </p>
            <div className="w-full bg-muted rounded-full h-4 mt-2">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: habit.disciplineScore + "%" }}
              ></div>
            </div>
          </div>
        </CardContent>

        <div className="p-4 m-4 bg-muted border border-border rounded-xl">
          <p className="font-bold mb-4 text-lg text-foreground">
            🤖 AI Habit Analysis
          </p>
          {sections.map((section, idx) => (
            <div key={idx} className="mb-3">
              <p className={getHeadingStyle(section.heading)}>
                {section.heading}
              </p>
              {section.items.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground leading-relaxed pl-2 border-l-2 border-border"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Report</h1>
          <p className="text-muted-foreground">AI analysis of your habits</p>
        </div>

        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6">
            {weeklyHabits.length === 0 ? (
              <p className="text-muted-foreground">No habits found for this week.</p>
            ) : (
              weeklyHabits.map((habit) => <HabitCard key={habit._id} habit={habit} />)
            )}
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            {monthlyHabits.length === 0 ? (
              <p className="text-muted-foreground">No habits found for this month.</p>
            ) : (
              <>
                <Card className="mb-6 bg-card border border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      📊 {new Date().toLocaleString("default", { month: "long", year: "numeric" })} Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">{avgStudyHours}</p>
                      <p className="text-sm text-muted-foreground">Avg Study Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-500">{avgSleep}</p>
                      <p className="text-sm text-muted-foreground">Avg Sleep Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cyan-500">{avgWater}</p>
                      <p className="text-sm text-muted-foreground">Avg Water Intake</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{avgScore}%</p>
                      <p className="text-sm text-muted-foreground">Avg Discipline Score</p>
                    </div>
                  </CardContent>
                </Card>
                {monthlyHabits.map((habit) => <HabitCard key={habit._id} habit={habit} />)}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Report;