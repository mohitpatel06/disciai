import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  User,
  Brain,
  LogOut,
  Menu
} from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-habit", label: "Add Habit", icon: Plus },
  { to: "/report", label: "Report", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Top Navbar for Mobile */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-green-500" />
          <span className="font-bold text-lg">DisciAI</span>
        </div>

        <button onClick={() => setOpen(!open)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-[#0f1f3d] text-white transform transition-transform duration-300 z-50
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >

        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
          <Brain className="h-6 w-6 text-green-400" />
          <span className="text-lg font-bold">DisciAI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                  }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;