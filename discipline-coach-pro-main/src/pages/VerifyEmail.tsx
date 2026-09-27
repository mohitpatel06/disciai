import API_BASE from "@/lib/apiBase";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Brain } from "lucide-react";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-email/${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Server error occurred");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-2xl p-8 bg-card border border-border shadow-xl text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl mb-4 bg-accent/10 border border-accent/20">
            <Brain className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Email Verification</h1>
        </div>

        {status === "verifying" && (
          <p className="text-muted-foreground">Verifying your email, please wait...</p>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-green-500 font-medium">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 bg-accent"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-red-500 font-medium">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl font-semibold text-foreground transition-all hover:opacity-90 bg-muted border border-border"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
