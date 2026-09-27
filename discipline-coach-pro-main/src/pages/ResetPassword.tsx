import API_BASE from "@/lib/apiBase";
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to reset password");
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
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-4 text-center">
            <p className="text-green-500 font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-foreground text-sm outline-none transition-all bg-muted border border-input focus:border-accent"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-foreground text-sm outline-none transition-all bg-muted border border-input focus:border-accent"
                placeholder="Confirm new password"
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
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
