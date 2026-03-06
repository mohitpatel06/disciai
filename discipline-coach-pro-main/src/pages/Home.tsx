// Home.tsx - Landing page for DisciAI
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Target, Zap, BarChart3 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Target,
    title: "Track Daily Habits",
    description: "Log your study, workout, sleep, water intake and more every day.",
  },
  {
    icon: Brain,
    title: "AI-Powered Feedback",
    description: "Get personalized discipline scores and coaching from our AI engine.",
  },
  {
    icon: BarChart3,
    title: "Visual Reports",
    description: "See your progress over time with beautiful charts and analytics.",
  },
  {
    icon: Zap,
    title: "Build Discipline",
    description: "Transform your daily routine into lasting habits with consistency tracking.",
  },
];

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 container text-center px-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10">
            <Brain className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">AI-Powered Discipline Coach</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6">
            Master Your Habits.
            <br />
            <span className="text-gradient">Build Discipline.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            Track your daily habits, get AI-driven insights, and build the discipline
            you need to achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent text-base px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need to Stay Disciplined
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete toolkit designed to help you build lasting habits.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-xl bg-card border border-border hover:glow-accent transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4 group-hover:bg-accent/20 transition-colors">
                  <f.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 hero-gradient">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Start Building Better Habits Today
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg mx-auto">
            Join DisciAI and let AI help you stay on track.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent text-base px-10">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 DisciAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
