import { useState, useRef, useEffect } from "react";
import { Brain, Sun, Moon, X, Send } from "lucide-react";
import Sidebar from "./Sidebar";
import { useTheme } from "../App";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { sharedMessages, setSharedMessages } from "../pages/AIChat";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const formatMessage = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/###\s?(.*)/g, "<strong>$1</strong>")
    .replace(/##\s?(.*)/g, "<strong>$1</strong>")
    .replace(/- /g, "• ");
};

// ✅ Notification permission maango aur schedule karo
const setupDailyReminder = async () => {
  if (!("Notification" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  // ✅ Check karo aaj already reminder set hua ya nahi
  const lastReminder = localStorage.getItem("lastReminderDate");
  const today = new Date().toDateString();

  if (lastReminder === today) return;

  // ✅ Aaj ka reminder set karo — raat 8 baje
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(20, 0, 0, 0); // 8:00 PM

  // Agar 8 baj gaye hain toh kal ke liye set karo
  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const delay = reminderTime.getTime() - now.getTime();

  setTimeout(() => {
    const notification = new Notification("DisciAI Reminder 🔥", {
      body: "Don't forget to log your habits today! Keep your streak alive! 💪",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    localStorage.setItem("lastReminderDate", new Date().toDateString());
  }, delay);

  localStorage.setItem("lastReminderDate", today);
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isAIChatPage = location.pathname === "/ai-chat";

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(sharedMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationAsked, setNotificationAsked] = useState(false);
  const bottomRef = useRef(null);

  // ✅ Notification setup — sirf ek baar
  useEffect(() => {
    const asked = localStorage.getItem("notificationAsked");
    if (!asked) {
      setNotificationAsked(true);
    }
  }, []);

  useEffect(() => {
    if (chatOpen) {
      setMessages([...sharedMessages]);
    }
  }, [chatOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEnableNotifications = async () => {
    await setupDailyReminder();
    localStorage.setItem("notificationAsked", "true");
    setNotificationAsked(false);
  };

  const handleDismissNotifications = () => {
    localStorage.setItem("notificationAsked", "true");
    setNotificationAsked(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setSharedMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://disciai-backend.onrender.com/api/ai/chat",
        {
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMessages = [
        ...updatedMessages,
        { role: "assistant", content: res.data.reply },
      ];
      setMessages(newMessages);
      setSharedMessages(newMessages);
    } catch (error) {
      const newMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I'm unavailable right now. Please try again! 🙏",
        },
      ];
      setMessages(newMessages);
      setSharedMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className={`w-64 h-full ${theme === "dark" ? "bg-[#0f172a]" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">

        {/* Mobile Top Bar */}
        <div className={`flex items-center justify-between p-4 border-b lg:hidden ${theme === "dark" ? "bg-gray-900 border-white/10" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-green-500" />
            <span className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              DisciAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-gray-600" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className={`text-2xl ${theme === "dark" ? "text-white" : "text-slate-900"}`}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Desktop Top Bar */}
        <div className={`hidden lg:flex items-center justify-end px-8 py-3 border-b ${theme === "dark" ? "bg-gray-900 border-white/10" : "bg-white border-slate-200"}`}>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-gray-600" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </button>
        </div>

        {/* ✅ Notification Banner */}
        {notificationAsked && (
          <div className={`px-4 py-3 flex items-center justify-between gap-4 ${theme === "dark"
              ? "bg-emerald-900/30 border-b border-emerald-800"
              : "bg-emerald-50 border-b border-emerald-200"
            }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <p className={`text-sm font-medium ${theme === "dark" ? "text-emerald-300" : "text-emerald-800"
                }`}>
                Get daily reminders to log your habits at 8:00 PM!
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleEnableNotifications}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold transition"
              >
                Enable
              </button>
              <button
                onClick={handleDismissNotifications}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${theme === "dark"
                    ? "text-gray-400 hover:bg-gray-800"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                Not now
              </button>
            </div>
          </div>
        )}

        <main className={`p-4 lg:p-8 min-h-screen ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"}`}>
          {children}
        </main>

      </div>

      {/* ✅ Floating AI Chat — AI Chat page par hide */}
      {!isAIChatPage && (
        <div className="fixed bottom-6 right-6 z-50">

          {/* Chat Window */}
          {chatOpen && (
            <div
              className={`mb-4 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${theme === "dark"
                  ? "bg-gray-900 border-white/10"
                  : "bg-white border-slate-200"
                }`}
              style={{ height: "480px" }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-500">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Brain size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">DisciAI Coach</p>
                    <p className="text-white/70 text-xs">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <Brain size={12} className="text-emerald-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                          ? "bg-emerald-500 text-white rounded-br-sm"
                          : theme === "dark"
                            ? "bg-gray-800 text-gray-100 rounded-bl-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      dangerouslySetInnerHTML={{
                        __html: msg.role === "assistant"
                          ? formatMessage(msg.content)
                          : msg.content,
                      }}
                    />
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mr-2 flex-shrink-0">
                      <Brain size={12} className="text-emerald-500" />
                    </div>
                    <div className={`px-3 py-2 rounded-2xl rounded-bl-sm ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className={`p-3 border-t flex gap-2 ${theme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className={`flex-1 px-3 py-2 rounded-xl text-sm outline-none border ${theme === "dark"
                      ? "bg-gray-800 border-white/10 text-white placeholder:text-gray-500"
                      : "bg-gray-50 border-slate-200 text-gray-900 placeholder:text-gray-400"
                    } focus:border-emerald-500 transition-all`}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Floating Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg px-5 py-3 transition-all hover:scale-105"
            style={{ boxShadow: "0 4px 25px rgba(16, 185, 129, 0.5)" }}
          >
            {chatOpen ? (
              <X size={20} />
            ) : (
              <>
                <Brain size={20} />
                <span className="text-sm font-bold">AI Coach</span>
              </>
            )}
          </button>

        </div>
      )}

    </div>
  );
};

export default DashboardLayout;