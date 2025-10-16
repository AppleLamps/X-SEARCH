import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
          role === "user"
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-900 border border-slate-200"
        )}
      >
        <div className="text-sm font-medium mb-1">
          {role === "user" ? "You" : "Assistant"}
        </div>
        {role === "user" ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
