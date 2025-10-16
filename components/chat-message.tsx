"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { User, Bot, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onCopy?: () => void;
}

export function ChatMessage({ role, content, onCopy }: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isUser = role === "user";

  // Trigger entrance animation
  useState(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    onCopy?.();
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 relative animate-message-enter",
        isVisible && "opacity-100"
      )}
      onMouseEnter={() => !isUser && setIsHovered(true)}
      onMouseLeave={() => !isUser && setIsHovered(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 size-8 flex items-center justify-center rounded-full transition-all duration-300",
          isUser ? "bg-blue-500 hover:bg-blue-600" : "bg-slate-800 hover:bg-slate-700",
          isHovered && !isUser && "scale-110"
        )}
      >
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-slate-200" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <p className="font-semibold text-slate-700 mb-2">
          {isUser ? "You" : "Assistant"}
        </p>
        <div className="prose prose-slate prose-sm max-w-none 
                        prose-headings:font-semibold prose-headings:text-slate-800
                        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                        prose-strong:text-slate-900 prose-strong:font-semibold
                        prose-ul:my-4 prose-ol:my-4 prose-li:text-slate-700
                        prose-li:mb-2 prose-li:leading-relaxed
                        prose-code:text-slate-800 prose-code:bg-slate-100 
                        prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-slate-50 prose-pre:border">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                return !isInline ? (
                  <SyntaxHighlighter
                    style={oneLight as { [key: string]: React.CSSProperties }}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`${className} bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm`} {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-4 ml-4 list-disc space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal space-y-2">{children}</ol>,
              li: ({ children }) => <li className="text-slate-700 leading-relaxed">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4">
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => <h1 className="text-xl font-semibold text-slate-800 mb-3 mt-6 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold text-slate-800 mb-2 mt-5">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-slate-800 mb-2 mt-4">{children}</h3>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Copy Button */}
      {!isUser && (isHovered || isCopied) && (
        <Button
          onClick={handleCopy}
          size="icon-sm"
          variant="ghost"
          className={cn(
            "absolute top-0 right-0 h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all duration-200 animate-scale-in button-smooth",
            isCopied && "text-green-600 hover:text-green-700"
          )}
        >
          {isCopied ? <Check size={14} className="animate-scale-in" /> : <Copy size={14} />}
        </Button>
      )}
    </div>
  );
}
