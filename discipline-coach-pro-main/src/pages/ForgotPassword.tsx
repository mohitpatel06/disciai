import API_BASE from "@/lib/apiBase";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Password reset email sent.");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send reset email");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Server error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-2xl p-8 bg-card border border-border shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl mb-4 bg-accent/10 border border-accent/20">
            <Brain className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-4 text-center">
            <p className="text-green-500 font-medium">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 bg-accent"
            >
              Back to Login
            </Link>
          </div>
        ) : (
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

            {status === "error" && (
              <p className="text-red-500 text-sm font-medium">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 bg-accent disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
            
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-accent font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
