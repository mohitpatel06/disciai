import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import axios from "axios";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await axios.post(
                `https://disciai-backend.onrender.com/api/auth/reset-password/${token}`,
                { password }
            );
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md rounded-2xl p-8 bg-card border border-border shadow-xl">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl mb-4 bg-accent/10 border border-accent/20">
                        <Brain className="h-7 w-7 text-accent" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
                    <p className="text-sm mt-1 text-muted-foreground">
                        Enter your new password
                    </p>
                </div>

                {success ? (
                    <div className="text-center space-y-4">
                        <div className="text-5xl">✅</div>
                        <h2 className="text-xl font-bold text-foreground">Password Reset!</h2>
                        <p className="text-muted-foreground text-sm">
                            Your password has been reset successfully. Redirecting to login...
                        </p>
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
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl text-foreground text-sm outline-none transition-all bg-muted border border-input focus:border-accent"
                                placeholder="Confirm new password"
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
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default ResetPassword;