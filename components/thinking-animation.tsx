"use client";

import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThinkingAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-4 animate-message-enter", className)}>
      {/* Avatar with pulse effect */}
      <div className="flex-shrink-0 size-8 flex items-center justify-center rounded-full bg-slate-800 animate-thinking-pulse">
        <Bot size={18} className="text-slate-200" />
      </div>

      {/* Thinking Content */}
      <div className="flex-1 pt-0.5">
        <p className="font-semibold text-slate-700 mb-2">Assistant</p>
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg p-4 border border-slate-200 relative overflow-hidden">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 animate-shimmer opacity-30"></div>
          
          <div className="flex items-center gap-3 text-slate-600 relative z-10">
            {/* Sophisticated wave animation */}
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-thinking-wave shadow-sm [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-thinking-wave shadow-sm [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-thinking-wave shadow-sm"></div>
            </div>
            
            <span className="text-sm font-medium">Thinking...</span>
            
            {/* Sparkles icon with subtle animation */}
            <Sparkles size={14} className="text-blue-500 animate-pulse ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

