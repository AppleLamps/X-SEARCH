"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { Sidebar } from "./sidebar";
import { ToastContainer } from "./toast";
import { ThinkingAnimation } from "./thinking-animation";
import { Send, Sparkles, Menu, Search, TrendingUp, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("x-intelligence-conversations");
    const savedActiveId = localStorage.getItem("x-intelligence-active-id");
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (e) {
        console.error("Failed to parse saved conversations:", e);
      }
    }
    
    if (savedActiveId) {
      setActiveConversationId(savedActiveId);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("x-intelligence-conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save active conversation ID
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("x-intelligence-active-id", activeConversationId);
    }
  }, [activeConversationId]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) ?? null;
  }, [conversations, activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const addToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNewChat = () => {
    const newConversationId = `convo-${Date.now()}`;
    const newConversation: Conversation = {
      id: newConversationId,
      title: "New Conversation",
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);
  };

  const handleSwitchChat = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteChat = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    addToast("Conversation deleted", "info");
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
    addToast("Conversation renamed", "success");
  };

  const handleCopyMessage = () => {
    addToast("Copied to clipboard", "success");
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let currentConvoId = activeConversationId;
    const userMessageContent = input.trim();
    setInput("");

    // Create a new chat if none exists
    if (!currentConvoId) {
      const newId = `convo-${Date.now()}`;
      const title = userMessageContent.substring(0, 40) + (userMessageContent.length > 40 ? "..." : "");
      const newConversation: Conversation = {
        id: newId,
        title,
        messages: [{ role: "user", content: userMessageContent }],
      };
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(newId);
      currentConvoId = newId;
    } else {
      // Add user message to existing chat
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConvoId) {
            // Update title if this is the first user message
            const updatedTitle = c.messages.length === 0
              ? userMessageContent.substring(0, 40) + (userMessageContent.length > 40 ? "..." : "")
              : c.title;
            return {
              ...c,
              title: updatedTitle === "New Conversation" ? userMessageContent.substring(0, 40) + (userMessageContent.length > 40 ? "..." : "") : updatedTitle,
              messages: [...c.messages, { role: "user", content: userMessageContent }],
            };
          }
          return c;
        })
      );
    }

    setIsLoading(true);

    // Add empty assistant message that we'll update
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConvoId
          ? { ...c, messages: [...c.messages, { role: "assistant", content: "" }] }
          : c
      )
    );

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessageContent }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvoId) {
              const newMessages = [...c.messages];
              newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
              return { ...c, messages: newMessages };
            }
            return c;
          })
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConvoId) {
            const newMessages = [...c.messages];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: "Sorry, I encountered an error. Please try again.",
            };
            return { ...c, messages: newMessages };
          }
          return c;
        })
      );
      addToast("Failed to get response", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations.map((c) => ({ id: c.id, title: c.title }))}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSwitchChat={handleSwitchChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-30 animate-scale-in">
          <Button
            onClick={() => setIsMobileSidebarOpen(true)}
            size="icon"
            variant="outline"
            className="bg-white shadow-lg hover-lift button-smooth"
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-4xl px-4 pt-8 pb-24 lg:pt-8">
            {!activeConversation ? (
              // State 1: No conversation selected
              <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="bg-slate-900 p-4 rounded-full mb-4 border border-slate-200 animate-scale-in hover-lift transition-all duration-300 hover:shadow-lg">
                  <Sparkles size={28} className="text-white animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 animate-fade-in">X Intelligence</h1>
                <p className="text-slate-500 mt-2 animate-slide-up">
                  {conversations.length === 0
                    ? "Ask anything about X. Get real-time, AI-powered insights."
                    : "Select a conversation or start a new chat."}
                </p>
              </div>
            ) : activeConversation.messages.filter((m) => m.content.trim() !== "").length === 0 ? (
              // State 2: Active conversation but no messages (empty new chat)
              <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
                <div className="max-w-2xl space-y-8 w-full">
                  {/* Header with icon */}
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-slate-900 p-4 rounded-full mb-4 border border-slate-200 animate-scale-in hover-lift transition-all duration-300 hover:shadow-lg mx-auto w-fit">
                      <svg
                        className="w-7 h-7 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">
                      What can I help you with?
                    </h1>
                    <p className="text-slate-500">
                      Get real-time insights about X, powered by xAI
                    </p>
                  </div>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSuggestionClick("What's trending on X right now?")}
                      className="group p-4 text-left bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 hover-lift button-smooth animate-slide-up"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 mb-1">Trending Topics</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">What's trending on X right now?</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSuggestionClick("Search for recent posts about AI and technology")}
                      className="group p-4 text-left bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 hover-lift button-smooth animate-slide-up"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <Search size={20} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 mb-1">Search Posts</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">Search for recent posts about AI and technology</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSuggestionClick("Analyze sentiment around the latest SpaceX launch")}
                      className="group p-4 text-left bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 hover-lift button-smooth animate-slide-up"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <MessageSquare size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 mb-1">Analyze Sentiment</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">Analyze sentiment around the latest SpaceX launch</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSuggestionClick("Find influential users discussing climate change")}
                      className="group p-4 text-left bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 hover-lift button-smooth animate-slide-up"
                      style={{ animationDelay: "0.4s" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                          <Users size={20} className="text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 mb-1">Find Influencers</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">Find influential users discussing climate change</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // State 3: Active conversation with messages
              <div className="space-y-6 mt-12 lg:mt-0">
                {activeConversation.messages
                  .filter((message) => message.content.trim() !== "")
                  .map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                      onCopy={handleCopyMessage}
                    />
                  ))}
                {isLoading && <ThinkingAnimation />}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
          <div className="container mx-auto max-w-4xl px-4 pb-4">
            <div className="relative">
              <form onSubmit={handleSubmit}>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about X..."
                  disabled={isLoading}
                  className={cn(
                    "w-full h-14 pl-4 pr-16 rounded-2xl bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 shadow-lg input-focus transition-all duration-200",
                    isLoading && "opacity-75"
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 rounded-lg transition-all duration-200 button-smooth",
                    isLoading 
                      ? "bg-slate-600 cursor-not-allowed animate-pulse" 
                      : "bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 hover:shadow-lg hover:scale-105",
                    !isLoading && input.trim() && "animate-glow-pulse"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Send size={18} className="text-white" />
                  )}
                </Button>
              </form>
            </div>
            <p className="text-center text-xs text-slate-500 mt-3 animate-fade-in">
              X Intelligence may produce inaccurate information. Powered by xAI.
            </p>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
