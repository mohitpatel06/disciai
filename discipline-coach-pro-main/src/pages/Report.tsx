import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Report = () => {

  const [habits, setHabits] = useState([]);

  useEffect(() => {

    const fetchHabits = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/habits", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHabits(res.data);

      } catch (error) {
        console.log("Error fetching habits");
      }

    };

    fetchHabits();

  }, []);

  return (
    <DashboardLayout>

      <div className="space-y-8 animate-fade-in">

        <div>
          <h1 className="text-3xl font-display font-bold">Report</h1>
          <p className="text-muted-foreground mt-1">
            AI analysis of your habits
          </p>
        </div>

        <Tabs defaultValue="weekly">

          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6">

            {habits.map((habit: any) => (

              <Card key={habit._id} className="shadow-[var(--shadow-soft)] mb-6">

                <CardHeader>
                  <CardTitle className="font-display">
                    {new Date(habit.createdAt).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">

                  <p><strong>Study Hours:</strong> {habit.studyHours}</p>
                  <p><strong>Workout:</strong> {habit.workout}</p>
                  <p><strong>Sleep:</strong> {habit.sleepHours}</p>
                  <p><strong>Water Intake:</strong> {habit.waterIntake}</p>
                  <p><strong>Discipline Score:</strong> {habit.disciplineScore}</p>

                  <div className="mt-4 p-4 bg-muted rounded">

                    <p className="font-semibold mb-2">AI Habit Analysis</p>

                    <pre className="text-sm whitespace-pre-wrap">
                      {habit.aiFeedback}
                    </pre>

                  </div>

                </CardContent>

              </Card>

            ))}

          </TabsContent>

          <TabsContent value="monthly" className="mt-6">

            <Card className="shadow-[var(--shadow-soft)]">

              <CardHeader>
                <CardTitle className="font-display">
                  Monthly Overview
                </CardTitle>
              </CardHeader>

              <CardContent>

                <p className="text-sm text-muted-foreground">
                  Monthly analytics coming soon.
                </p>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

    </DashboardLayout>
  );

};

export default Report;