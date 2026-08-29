npm install @google/genai
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function askGemini(message) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't process that request.";
  }
}
import { useState } from "react";
import { askGemini } from "@/lib/gemini";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const result = await askGemini(message);
      setReply(result);
    } catch (error) {
      setReply("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask Buddy AI..."
      />

      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>

      <div>
        <strong>Buddy AI:</strong>
        <p>{reply}</p>
      </div>
    </div>
  );
}
