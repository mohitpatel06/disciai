import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  LogOut,
  Brain,
  Calendar as CalendarIcon,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../App";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://disciai-backend.onrender.com/api/auth/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser({ name: res.data.name, email: res.data.email });
      } catch (error) {
        console.log("Error fetching user");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${location.pathname === path
      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
      : theme === "dark"
        ? "text-slate-400 hover:bg-white/5 hover:text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

  const sidebarBg = theme === "dark" ? "bg-[#0f172a] border-white/10" : "bg-white border-slate-200";
  const logoBorder = theme === "dark" ? "border-white/10" : "border-slate-200";
  const logoText = theme === "dark" ? "text-white" : "text-slate-900";
  const menuLabel = theme === "dark" ? "text-slate-500" : "text-slate-400";
  const logoutClass = theme === "dark" ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400" : "text-slate-600 hover:bg-red-50 hover:text-red-500";
  const profileBorder = theme === "dark" ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-50";
  const profileName = theme === "dark" ? "text-white" : "text-slate-900";
  const profileEmail = theme === "dark" ? "text-slate-500" : "text-slate-400";
  const bottomBorder = theme === "dark" ? "border-white/10" : "border-slate-200";

  return (
    <aside className={`w-64 h-screen sticky top-0 flex flex-col border-r overflow-hidden ${sidebarBg}`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-5 border-b flex-shrink-0 ${logoBorder}`}>
        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
          <Brain className="h-5 w-5 text-emerald-400" />
        </div>
        <span className={`text-xl font-bold ${logoText}`}>DisciAI</span>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
        <p className={`text-xs font-semibold uppercase tracking-wider px-4 mb-3 ${menuLabel}`}>
          Menu
        </p>

        <Link to="/dashboard" className={linkClass("/dashboard")}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link to="/add-habit" className={linkClass("/add-habit")}>
          <Plus size={18} />
          Add Habit
        </Link>

        <Link to="/report" className={linkClass("/report")}>
          <BarChart3 size={18} />
          Report
        </Link>

        <Link to="/calendar" className={linkClass("/calendar")}>
          <CalendarIcon size={18} />
          Calendar
        </Link>

        <Link to="/ai-chat" className={linkClass("/ai-chat")}>
          <MessageCircle size={18} />
          AI Coach
        </Link>

        {/* ✅ Achievements */}
        <Link to="/achievements" className={linkClass("/achievements")}>
          <Trophy size={18} />
          Achievements
        </Link>

      </nav>

      {/* Bottom Section */}
      <div className={`p-4 border-t flex-shrink-0 space-y-2 ${bottomBorder}`}>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${logoutClass}`}
        >
          <LogOut size={18} />
          Logout
        </button>

        <Link
          to="/profile"
          className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 border ${profileBorder}`}
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex-shrink-0">
            {avatarLetter}
          </div>
          <div className="overflow-hidden">
            <p className={`text-sm font-semibold truncate capitalize ${profileName}`}>
              {user.name || "User"}
            </p>
            <p className={`text-xs truncate ${profileEmail}`}>
              {user.email || ""}
            </p>
          </div>
        </Link>

      </div>
    </aside>
  );
};

export default Sidebar;