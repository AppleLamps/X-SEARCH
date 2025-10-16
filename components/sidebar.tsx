"use client";

import { cn } from "@/lib/utils";
import { MessageSquarePlus, MessageSquare, Trash2, Edit2, Menu, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  conversations: { id: string; title: string }[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSwitchChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onRenameChat,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 w-64 transform transition-transform duration-200 ease-in-out lg:transform-none shadow-lg lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">X Intelligence</h2>
          <Button
            onClick={onMobileClose}
            size="icon-sm"
            variant="ghost"
            className="lg:hidden text-slate-600 hover:text-slate-900 button-smooth"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-shrink-0 p-4 pt-3">
          <Button
            onClick={() => {
              onNewChat();
              onMobileClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-900/10 hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-md hover-lift button-smooth hover:shadow-lg"
            variant="outline"
          >
            <MessageSquarePlus size={16} className="flex-shrink-0" />
            <span>New Chat</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <Clock size={14} className="text-slate-500 flex-shrink-0" />
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Recent Chats
            </h3>
          </div>
          
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <nav className="flex flex-col gap-1.5 pb-4">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className={cn(
                    "group relative flex items-center w-full rounded-lg transition-all duration-200 animate-fade-in overflow-hidden",
                    activeConversationId === convo.id
                      ? "bg-white shadow-sm ring-1 ring-slate-200"
                      : "hover:bg-white/60 hover:shadow-sm"
                  )}
                >
                  {editingId === convo.id ? (
                    <div className="flex items-center gap-1 w-full px-2 py-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(convo.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        placeholder="Conversation title"
                        className="flex-1 px-2 py-1.5 text-sm bg-white border border-blue-300 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        onBlur={() => handleSaveEdit(convo.id)}
                        aria-label="Edit conversation title"
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onSwitchChat(convo.id);
                          onMobileClose();
                        }}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left px-3 py-2.5 text-sm text-slate-700 transition-colors duration-200"
                        title={convo.title}
                      >
                        <MessageSquare 
                          size={16} 
                          className={cn(
                            "flex-shrink-0 transition-all duration-200",
                            activeConversationId === convo.id 
                              ? "text-blue-600" 
                              : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"
                          )}
                        />
                        <span
                          className={cn(
                            "truncate block transition-all duration-200 leading-snug",
                            activeConversationId === convo.id 
                              ? "font-semibold text-slate-900" 
                              : "text-slate-700"
                          )}
                        >
                          {convo.title}
                        </span>
                      </button>
                      <div className="flex items-center gap-0.5 pr-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(convo.id, convo.title);
                          }}
                          size="icon-sm"
                          variant="ghost"
                          className="h-7 w-7 text-slate-400 hover:text-slate-700 button-smooth hover:bg-slate-200"
                          title="Rename"
                        >
                          <Edit2 size={13} />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(convo.id);
                          }}
                          size="icon-sm"
                          variant="ghost"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 button-smooth hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}

