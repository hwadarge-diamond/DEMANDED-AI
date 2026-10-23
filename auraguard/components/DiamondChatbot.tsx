"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  RotateCcw,
  Minimize2,
  Maximize2,
  ChevronDown,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  domain?: string;
  engine?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    sender: "bot",
    text: "Greetings. I am the **DIAMOND AI Copilot**, your autonomous intelligence guide across Healthcare, Food Security, Business ESG, Education, and the Multi-Agent Swarm.\n\nHow can I assist your planetary resilience mission today?",
    timestamp: "Online",
    domain: "Diamond Autonomous Core",
    engine: "Swarm-v2.4",
  },
];

const SUGGESTIONS = [
  "🚨 Check OSHA heat liability for 200 workers",
  "🍎 Verify HACCP food danger zone rules",
  "🏥 Assess clinical asthma risk at 180 AQI",
  "🎓 Simulate hospital ER surge during 42°C heatwave",
  "🔐 Explain SHA-256 cryptographic ledger audit",
];

export default function DiamondChatbot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: "u-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) {
        throw new Error("Chat request returned " + res.status);
      }

      const data = await res.json();
      const botMsg: Message = {
        id: "b-" + Date.now(),
        sender: "bot",
        text: data.reply || "Agent response verified.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        domain: data.domain,
        engine: data.engine,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: "err-" + Date.now(),
        sender: "bot",
        text: "Autonomous Agent Connection Advisory: The local intelligence engine is operating in deterministic offline mode. Please verify network connectivity.",
        timestamp: "Diagnostic",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* 1. Closed State: Floating Faceted Diamond Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-3 p-2.5 pr-4 rounded-full bg-[#040810]/90 backdrop-blur-2xl border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:border-cyan-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95"
          aria-label="Open Diamond AI Chatbot"
        >
          {/* Pulsing Crystalline Glow Orb */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-violet-500/30 rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Faceted Diamond Icon Box */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-400 to-indigo-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#040810] rounded-full flex items-center justify-center text-cyan-300">
              <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
                <polygon points="22,12 42,12 36,22 28,22" fill="#ffffff" />
                <polygon points="8,24 22,12 28,22" fill="#06b6d4" />
                <polygon points="42,12 56,24 36,22" fill="#818cf8" />
                <polygon points="22,24 42,24 32,54" fill="#38bdf8" />
                <polygon points="8,24 22,24 32,54" fill="#0891b2" />
                <polygon points="42,24 56,24 32,54" fill="#6366f1" />
              </svg>
            </div>
            {/* Live Green Beacon */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#040810] animate-pulse" />
          </div>

          <div className="relative text-left">
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>DIAMOND</span>
              <span className="text-cyan-400">COPILOT</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono">5-Domain Swarm Online</div>
          </div>
        </button>
      )}

      {/* 2. Expanded State: Futuristic Crystalline Chat Window */}
      {isOpen && (
        <div className="relative w-[360px] sm:w-[410px] h-[550px] max-h-[85vh] rounded-3xl bg-[#040912]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top Glass Header */}
          <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/60 via-[#06121d] to-[#040912] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
                <div className="w-full h-full bg-[#040810] rounded-[10px] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
                    <polygon points="22,12 42,12 36,22 28,22" fill="#ffffff" />
                    <polygon points="8,24 22,12 28,22" fill="#06b6d4" />
                    <polygon points="42,12 56,24 36,22" fill="#818cf8" />
                    <polygon points="22,24 42,24 32,54" fill="#38bdf8" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <span>DIAMOND AI COPILOT</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    LIVE
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Autonomous Multi-Agent Mesh</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-white/5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Suggestion Ribbon */}
          <div className="p-2 border-b border-white/5 bg-black/40 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400/50 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Scrollable Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-sans">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-none shadow-[0_0_15px_rgba(6,182,212,0.3)] font-medium"
                        : "bg-[#091522] border border-cyan-500/25 text-gray-200 rounded-bl-none shadow-md"
                    }`}
                  >
                    {m.text}
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-gray-500">
                    <span>{m.timestamp}</span>
                    {m.domain && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400/80">{m.domain}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#091522] border border-cyan-500/25 max-w-[70%]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono text-cyan-300">
                  Swarm agents reasoning...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-cyan-500/20 bg-black/60 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Diamond Copilot about clinical risk, HACCP, ESG..."
              className="flex-1 bg-[#06101a] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-black hover:opacity-90 transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
