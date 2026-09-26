import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FOCUS_AREAS = [
  { id: "productivity", label: "Productivity", icon: "🎯" },
  { id: "fitness", label: "Fitness", icon: "💪" },
  { id: "sleep", label: "Better Sleep", icon: "😴" },
  { id: "mental-wellness", label: "Mental Wellness", icon: "🧠" },
  { id: "focus", label: "Focus", icon: "🔍" },
  { id: "discipline", label: "Discipline", icon: "⚡" },
  { id: "health", label: "Health", icon: "🏥" },
  { id: "work-life-balance", label: "Work-Life Balance", icon: "⚖️" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleArea = (id: string) => {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedAreas.length === 0) {
      alert("Please select at least one focus area");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/api/auth/onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ focusAreas: selectedAreas }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Onboarding failed");
        return;
      }

      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl mb-6 bg-accent/10 border border-accent/20">
            <Brain className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            What areas do you want to improve?
          </h1>
          <p className="text-base text-muted-foreground max-w-lg">
            Select one or more focus areas that matter most to you. We'll personalize your habit tracking based on your goals.
          </p>
        </div>

        {/* Focus Areas Grid */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area.id}
                  onClick={() => toggleArea(area.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedAreas.includes(area.id)
                      ? "border-accent bg-accent/10"
                      : "border-input bg-muted hover:border-accent/50"
                  }`}
                >
                  <div className="text-2xl mb-2">{area.icon}</div>
                  <div className="text-sm font-medium text-foreground">
                    {area.label}
                  </div>
                  {selectedAreas.includes(area.id) && (
                    <div className="mt-2 flex justify-center">
                      <Check className="h-4 w-4 text-accent" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mb-6 border-accent/20 bg-accent/5 mb-8">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              💡 <span className="font-medium">Tip:</span> You can change your focus areas anytime from your profile settings. We'll suggest habits tailored to your selections.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={loading}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={loading || selectedAreas.length === 0}
            className="flex-1 gap-2"
          >
            {loading ? "Setting up..." : "Continue"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Selected Count */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {selectedAreas.length > 0
            ? `${selectedAreas.length} area${selectedAreas.length > 1 ? "s" : ""} selected`
            : "Select at least one area to continue"}
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
