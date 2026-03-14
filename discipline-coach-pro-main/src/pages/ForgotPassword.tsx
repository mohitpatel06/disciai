import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await axios.post(
                "https://disciai-backend.onrender.com/api/auth/forgot-password",
                { email }
            );
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 bg-background"
        >
            <div className="w-full max-w-md rounded-2xl p-8 bg-card border border-border shadow-xl">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl mb-4 bg-accent/10 border border-accent/20">
                        <Brain className="h-7 w-7 text-accent" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
                    <p className="text-sm mt-1 text-muted-foreground text-center">
                        Enter your email — we'll send you a reset link
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="text-5xl">📧</div>
                        <h2 className="text-xl font-bold text-foreground">Email Sent!</h2>
                        <p className="text-muted-foreground text-sm">
                            Check your inbox for the password reset link. It will expire in 1 hour.
                        </p>
                        <Link
                            to="/login"
                            className="block mt-4 text-accent font-medium hover:underline text-sm"
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

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 bg-accent disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
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