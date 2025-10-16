import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex items-start gap-4")}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 size-8 flex items-center justify-center rounded-full",
        isUser ? "bg-blue-500" : "bg-slate-800"
      )}>
        {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-slate-200" />}
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <p className="font-semibold text-slate-700 mb-2">
          {isUser ? "You" : "Assistant"}
        </p>
        <div className="prose prose-slate prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneLight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
