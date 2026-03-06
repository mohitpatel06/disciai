import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {

  const [habit, setHabit] = useState<any>(null);

  useEffect(() => {

    const fetchLatestHabit = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/habits",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.length > 0) {
          setHabit(res.data[0]); // latest habit
        }

      } catch (error) {
        console.log("Error fetching habit");
      }

    };

    fetchLatestHabit();

  }, []);

  if (!habit) {
    return (
      <DashboardLayout>
        <p className="p-6">No habit data yet.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="space-y-8">

        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-2 gap-6">

          <div className="p-4 bg-white rounded shadow">
            Study Hours: {habit.studyHours}
          </div>

          <div className="p-4 bg-white rounded shadow">
            Workout: {habit.workout}
          </div>

          <div className="p-4 bg-white rounded shadow">
            Sleep Hours: {habit.sleepHours}
          </div>

          <div className="p-4 bg-white rounded shadow">
            Water Intake: {habit.waterIntake}
          </div>

          <div className="p-4 bg-white rounded shadow">
            Junk Food: {habit.junkFood ? "Yes" : "No"}
          </div>

          <div className="p-4 bg-white rounded shadow">
            Mood: {habit.mood}
          </div>

        </div>

      </div>

    </DashboardLayout>
  );

};

export default Dashboard;