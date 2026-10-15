import React, { useMemo, useRef, useState } from "react";
import { api } from "../api";
import BackButton from "../Components/BackButton";
import "../Styles/Chat.css";

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

  return error?.message || "Une erreur est survenue lors de l'envoi du message.";
}

function Chat() {
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
        max_tokens: 1000,
      });

      const aiText = extractAssistantMessage(response) || "Je n’ai pas pu générer une réponse claire pour le moment.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
      setTimeout(scrollToBottom, 0);
    } catch (error) {
      console.error("Erreur chat:", error);
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
    <div className="chat-page">
      <BackButton />
      <div className="chat-card">
        <header className="chat-header">
          <h2>Chat en direct</h2>
          <p>Discutez avec notre assistant médical virtuel</p>
        </header>

        <div className="chat-body" ref={bodyRef}>
          {visibleMessages.length === 0 && (
            <p className="chat-empty">
              Commencez la conversation en envoyant votre premier message.
            </p>
          )}

          {visibleMessages.map((msg, index) => {
            const role = msg.role === "user" ? "user" : "assistant";
            return (
              <div key={`${role}-${index}`} className={`chat-row ${role}`}>
                <div className="chat-bubble">{msg.content}</div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-row assistant">
              <div className="chat-bubble">
                <span className="chat-typing">...</span>
              </div>
            </div>
          )}
        </div>

        {errorText && <p className="chat-error">{errorText}</p>}

        <footer className="chat-footer">
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Écrivez votre message ici..."
              disabled={loading}
            />
            <button className="chat-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
          <p className="chat-hint">Entrée pour envoyer • Shift+Entrée pour une nouvelle ligne</p>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
