import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap, Briefcase, User,
  BookOpen, Dumbbell, Moon, Droplets,
  Apple, Smile, CheckCircle, Clock,
  Monitor, Brain, TreePine, BookMarked,
} from "lucide-react";

const USER_TYPES = [
  {
    id: "student",
    label: "Student",
    desc: "School, College or University",
    Icon: GraduationCap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  {
    id: "professional",
    label: "Professional",
    desc: "Corporate, Business or Work",
    Icon: Briefcase,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  {
    id: "general",
    label: "General",
    desc: "Personal growth & wellness",
    Icon: User,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
];

const HabitForm = () => {
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);

  // Common fields
  const [sleepHours, setSleepHours] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [workout, setWorkout] = useState("");
  const [mood, setMood] = useState("");
  const [junkFood, setJunkFood] = useState("");

  // Student fields
  const [studyHours, setStudyHours] = useState("");
  const [assignmentsDone, setAssignmentsDone] = useState("");
  const [revisionDone, setRevisionDone] = useState("");

  // Professional fields
  const [workHours, setWorkHours] = useState("");
  const [meetingsAttended, setMeetingsAttended] = useState("");
  const [screenTime, setScreenTime] = useState("");
  const [stressLevel, setStressLevel] = useState("");

  // General fields
  const [readingMinutes, setReadingMinutes] = useState("");
  const [meditationMinutes, setMeditationMinutes] = useState("");
  const [outdoorTime, setOutdoorTime] = useState("");

  const handleSubmit = async () => {
    if (!userType) { alert("Please select your user type!"); return; }

    const token = localStorage.getItem("token");
    if (!token) { alert("Please login first"); return; }

    setLoading(true);
    try {
      const body: any = {
        userType,
        sleepHours, waterIntake, workout, mood,
        junkFood: junkFood === "yes",
      };

      if (userType === "student") {
        body.studyHours = studyHours;
        body.assignmentsDone = assignmentsDone;
        body.revisionDone = revisionDone === "yes";
      } else if (userType === "professional") {
        body.workHours = workHours;
        body.meetingsAttended = meetingsAttended;
        body.screenTime = screenTime;
        body.stressLevel = stressLevel;
      } else {
        body.readingMinutes = readingMinutes;
        body.meditationMinutes = meditationMinutes;
        body.outdoorTime = outdoorTime;
      }

      const res = await fetch("https://disciai-backend.onrender.com/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { alert(data.message || "Failed to submit habits"); return; }

      alert("Habits submitted successfully! 🎉");

      // Reset
      setUserType("");
      setSleepHours(""); setWaterIntake(""); setWorkout("");
      setMood(""); setJunkFood("");
      setStudyHours(""); setAssignmentsDone(""); setRevisionDone("");
      setWorkHours(""); setMeetingsAttended(""); setScreenTime(""); setStressLevel("");
      setReadingMinutes(""); setMeditationMinutes(""); setOutdoorTime("");

    } catch (error) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, placeholder, Icon, iconColor }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon size={13} className={iconColor} />
        <Label className="text-xs font-medium text-foreground">{label}</Label>
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl text-sm h-10"
      />
    </div>
  );

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground">
          Log Today's Habits
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Select your type to get personalized tracking
        </p>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* ✅ Step 1 — User Type Select */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Who are you?
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {USER_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setUserType(type.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${userType === type.id
                    ? `${type.border} ${type.bg}`
                    : "border-border hover:border-muted-foreground/30"
                  }`}
              >
                <div className={`h-9 w-9 rounded-xl ${type.bg} flex items-center justify-center`}>
                  <type.Icon size={18} className={type.color} />
                </div>
                <span className={`text-xs font-bold ${userType === type.id ? type.color : "text-foreground"}`}>
                  {type.label}
                </span>
                <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
                  {type.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Step 2 — Fields after type selected */}
        {userType && (
          <>
            {/* User Type Specific Fields */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {userType === "student" ? "Academic Habits" : userType === "professional" ? "Work Habits" : "Wellness Habits"}
              </Label>
              <div className="grid grid-cols-2 gap-3">

                {userType === "student" && (
                  <>
                    <InputField label="Study Hours" value={studyHours} onChange={setStudyHours} placeholder="e.g. 6" Icon={BookOpen} iconColor="text-blue-500" />
                    <InputField label="Assignments Done" value={assignmentsDone} onChange={setAssignmentsDone} placeholder="e.g. 3" Icon={CheckCircle} iconColor="text-green-500" />
                    <div className="col-span-2 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <BookMarked size={13} className="text-purple-500" />
                        <Label className="text-xs font-medium text-foreground">Revision Done Today?</Label>
                      </div>
                      <Select value={revisionDone} onValueChange={setRevisionDone}>
                        <SelectTrigger className="rounded-xl text-sm h-10">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes ✅</SelectItem>
                          <SelectItem value="no">No ❌</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {userType === "professional" && (
                  <>
                    <InputField label="Work Hours" value={workHours} onChange={setWorkHours} placeholder="e.g. 8" Icon={Briefcase} iconColor="text-purple-500" />
                    <InputField label="Meetings" value={meetingsAttended} onChange={setMeetingsAttended} placeholder="e.g. 3" Icon={Clock} iconColor="text-blue-500" />
                    <InputField label="Screen Time (hrs)" value={screenTime} onChange={setScreenTime} placeholder="e.g. 5" Icon={Monitor} iconColor="text-orange-500" />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Brain size={13} className="text-red-500" />
                        <Label className="text-xs font-medium text-foreground">Stress Level</Label>
                      </div>
                      <Select value={stressLevel} onValueChange={setStressLevel}>
                        <SelectTrigger className="rounded-xl text-sm h-10">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low 😊</SelectItem>
                          <SelectItem value="medium">Medium 😐</SelectItem>
                          <SelectItem value="high">High 😰</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {userType === "general" && (
                  <>
                    <InputField label="Reading (mins)" value={readingMinutes} onChange={setReadingMinutes} placeholder="e.g. 30" Icon={BookOpen} iconColor="text-blue-500" />
                    <InputField label="Meditation (mins)" value={meditationMinutes} onChange={setMeditationMinutes} placeholder="e.g. 15" Icon={Brain} iconColor="text-purple-500" />
                    <div className="col-span-2">
                      <InputField label="Outdoor Time (mins)" value={outdoorTime} onChange={setOutdoorTime} placeholder="e.g. 45" Icon={TreePine} iconColor="text-green-500" />
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Daily Essentials
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Sleep (hrs)" value={sleepHours} onChange={setSleepHours} placeholder="e.g. 7" Icon={Moon} iconColor="text-purple-500" />
                <InputField label="Water (glasses)" value={waterIntake} onChange={setWaterIntake} placeholder="e.g. 8" Icon={Droplets} iconColor="text-cyan-500" />
                <InputField label="Workout (mins)" value={workout} onChange={setWorkout} placeholder="e.g. 30" Icon={Dumbbell} iconColor="text-red-500" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Apple size={13} className="text-red-400" />
                    <Label className="text-xs font-medium text-foreground">Junk Food</Label>
                  </div>
                  <Select value={junkFood} onValueChange={setJunkFood}>
                    <SelectTrigger className="rounded-xl text-sm h-10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Smile size={13} className="text-yellow-500" />
                    <Label className="text-xs font-medium text-foreground">Mood</Label>
                  </div>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="rounded-xl text-sm h-10">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="great">Great 😄</SelectItem>
                      <SelectItem value="good">Good 🙂</SelectItem>
                      <SelectItem value="neutral">Neutral 😐</SelectItem>
                      <SelectItem value="bad">Bad 😞</SelectItem>
                      <SelectItem value="terrible">Terrible 😢</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Habits"
              )}
            </button>
          </>
        )}

      </CardContent>
    </Card>
  );
};

export default HabitForm;