import React, { useMemo, useRef, useState } from "react";
import { api } from "../api";
import "../Styles/ChatWidget.css";

function extractAssistantMessage(response) {
  const candidates = [
    response?.data?.reply,
    response?.data?.reply?.content,
    response?.reply,
    response?.reply?.content,
    response?.data?.message,
    response?.message,
    response?.data?.content,
    response?.content,
    response?.data?.choices?.[0]?.message?.content,
    response?.choices?.[0]?.message?.content,
  ];

  const text = candidates.find((item) => typeof item === "string" && item.trim());
  return text ? text.trim() : null;
}

function normalizeChatError(error) {
  const raw = String(error?.message || "").toLowerCase();

  if (
    raw.includes("groq_api_key") ||
    raw.includes("status: 500") ||
    raw.includes("invalid response format from server")
  ) {
    return "Le service de chat est temporairement indisponible. Merci de réessayer plus tard.";
  }

  if (raw.includes("network") || raw.includes("failed to fetch")) {
    return "Problème de connexion au serveur. Vérifiez votre réseau et réessayez.";
  }

  return error?.message || "Erreur lors de l'envoi du message.";
}

function ChatWidget({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const bodyRef = useRef(null);

  const visibleMessages = useMemo(
    () => messages.filter((msg) => msg.role !== "system"),
    [messages]
  );

  const scrollToBottom = () => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setErrorText("");
    setLoading(true);
    setTimeout(scrollToBottom, 0);

    try {
      const response = await api.chat({
        model: "llama-3.3-70b-versatile",
        messages: newMessages,
        temperature: 0.2,
        max_tokens: 700,
      });

      const aiText = extractAssistantMessage(response) || "Je n’ai pas pu générer une réponse claire pour le moment.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
      setTimeout(scrollToBottom, 0);
    } catch (error) {
      console.error("Erreur chat widget:", error);
      setErrorText(normalizeChatError(error));
    } finally {
      setLoading(false);
    }
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget-overlay" onClick={onClose}>
      <div className="chat-widget-card" onClick={(e) => e.stopPropagation()}>
        <div className="chat-widget-header">
          <h3>Chat en direct</h3>
          <button type="button" className="chat-widget-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-widget-body" ref={bodyRef}>
          {visibleMessages.length === 0 && (
            <p className="chat-widget-empty">Pose ta question pour démarrer.</p>
          )}

          {visibleMessages.map((msg, index) => {
            const role = msg.role === "user" ? "user" : "assistant";
            return (
              <div key={`${role}-${index}`} className={`chat-widget-row ${role}`}>
                <div className="chat-widget-bubble">{msg.content}</div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-widget-row assistant">
              <div className="chat-widget-bubble">...</div>
            </div>
          )}
        </div>

        {errorText && <p className="chat-widget-error">{errorText}</p>}

        <div className="chat-widget-footer">
          <textarea
            className="chat-widget-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Écris ton message..."
            disabled={loading}
          />
          <button
            type="button"
            className="chat-widget-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWidget;
