import { useState, useRef, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Send, Brain } from "lucide-react";

export let sharedMessages = [
    {
        role: "assistant",
        content: "Hey! I'm your DisciAI coach 🤖 How can I help you today? You can ask me anything about your habits, discipline, or productivity!",
    },
];

export const setSharedMessages = (msgs) => {
    sharedMessages = msgs;
};

const formatMessage = (text: string) => {
    if (!text) return "";
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/###\s?(.*)/g, "<strong>$1</strong>")
        .replace(/##\s?(.*)/g, "<strong>$1</strong>")
        .replace(/- /g, "• ");
};

const AIChat = () => {
    const [messages, setMessages] = useState(sharedMessages);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
                    content: "Sorry, I'm unavailable right now. Please try again later! 🙏",
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
        <DashboardLayout>
            <div className="flex flex-col h-[85vh] max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">AI Coach</h1>
                        <p className="text-muted-foreground text-sm">
                            Chat with your personal AI discipline coach
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {/* ✅ Official Brain Icon */}
                            {msg.role === "assistant" && (
                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <Brain size={14} className="text-emerald-500" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-emerald-500 text-white rounded-br-sm"
                                    : "bg-card border border-border text-foreground rounded-bl-sm"
                                    }`}
                                dangerouslySetInnerHTML={{
                                    __html: msg.role === "assistant"
                                        ? formatMessage(msg.content)
                                        : msg.content,
                                }}
                            />
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mr-2 flex-shrink-0">
                                <Brain size={14} className="text-emerald-500" />
                            </div>
                            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
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
                <div className="mt-4 flex gap-3 items-end">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask your AI coach anything..."
                        rows={1}
                        className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm outline-none resize-none focus:border-emerald-500 transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all"
                    >
                        <Send size={18} />
                    </button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-2">
                    Press Enter to send • Shift+Enter for new line
                </p>

            </div>
        </DashboardLayout>
    );
};

export default AIChat;