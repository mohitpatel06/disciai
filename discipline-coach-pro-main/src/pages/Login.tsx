import API_BASE from "@/lib/apiBase";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Brain } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(location.state?.needsVerification || false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Login failed");
        if (data.needsVerification) {
          setShowResend(true);
        }
        return;
      }
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleResend = async () => {
    if (!email) {
      alert("Please enter your email address to resend verification.");
      return;
    }
    setResending(true);
    try {
      const response = await fetch(API_BASE + "/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      alert(data.message || (response.ok ? "Verification email sent!" : "Failed to send"));
    } catch (error) {
      alert("Server error occurred");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-2xl p-8 bg-card border border-border shadow-xl">

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl mb-4 bg-accent/10 border border-accent/20">
            <Brain className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Login</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Welcome back to DisciAI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-foreground text-sm outline-none transition-all bg-muted border border-input focus:border-accent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-foreground text-sm outline-none transition-all bg-muted border border-input focus:border-accent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 bg-accent"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Register
          </Link>
        </p>

        <div className="flex justify-between items-center mt-4 pb-2">
          <Link to="/forgot-password" className="text-sm text-accent hover:underline">
            Forgot Password?
          </Link>
          {showResend && (
            <button 
              type="button" 
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-accent hover:underline bg-transparent border-none p-0 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Verification"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;
