import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://disciai-backend.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }
      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      console.log("Register Error:", error);
      alert("Server error. Please try again.");
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
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Start your discipline journey with DisciAI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-foreground text-sm outline-none transition-all bg-muted border border-input focus:border-accent"
              placeholder="Enter your full name"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 mt-2 bg-accent"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;