import { Link, useLocation } from "react-router-dom";
import { Brain, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "../App";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isAuthenticated = false;

  const navLinks = isAuthenticated
    ? [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/add-habit", label: "Add Habit" },
      { to: "/report", label: "Report" },
      { to: "/profile", label: "Profile" },
    ]
    : [
      { to: "/", label: "Home" },
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b">
      <div className="container flex h-16 items-center justify-between">

        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Brain className="h-7 w-7 text-accent" />
          DisciAI
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {link.label}
            </Link>
          ))}

          {/* ✅ Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-lg transition-colors hover:bg-muted"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </button>
        </div>

        {/* Mobile buttons */}
        <div className="flex items-center gap-2 md:hidden">

          {/* ✅ Theme Toggle Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors hover:bg-muted"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;