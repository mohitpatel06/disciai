import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HabitForm = () => {
  const [studyHours, setStudyHours] = useState("");
  const [workout, setWorkout] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [junkFood, setJunkFood] = useState("");
  const [mood, setMood] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 VERY IMPORTANT
        },
        body: JSON.stringify({
          studyHours,
          workout,
          sleepHours,
          waterIntake,
          junkFood,
          mood,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit habits");
        return;
      }

      alert("Habits submitted successfully!");

      // Optional: clear form after submit
      setStudyHours("");
      setWorkout("");
      setSleepHours("");
      setWaterIntake("");
      setJunkFood("");
      setMood("");

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Today's Habits</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">

          <div className="space-y-2">
            <Label>Study Hours</Label>
            <Input
              type="number"
              value={studyHours}
              onChange={(e) => setStudyHours(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Workout (minutes)</Label>
            <Input
              type="number"
              value={workout}
              onChange={(e) => setWorkout(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Sleep Hours</Label>
            <Input
              type="number"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Water Intake</Label>
            <Input
              type="number"
              value={waterIntake}
              onChange={(e) => setWaterIntake(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Junk Food</Label>
            <Select value={junkFood} onValueChange={setJunkFood}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="great">Great</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="bad">Bad</SelectItem>
                <SelectItem value="terrible">Terrible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="w-full">
              Submit Habits
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};

export default HabitForm;