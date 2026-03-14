import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const AI = () => {
    const [message, setMessage] = useState("");
    const [reply, setReply] = useState("");

    const handleSend = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first");
            return;
        }

        const res = await fetch("http://localhost:5000/api/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });

        const data = await res.json();
        setReply(data.reply || "No response from AI");
    };

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto space-y-4">
                <h1 className="text-2xl font-bold">AI Coach</h1>

                <textarea
                    className="w-full border p-2 rounded"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    onClick={handleSend}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Ask AI
                </button>

                {reply && (
                    <div className="p-3 bg-gray-100 rounded">
                        <strong>AI:</strong> {reply}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AI;