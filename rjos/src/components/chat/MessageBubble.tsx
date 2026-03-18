"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 text-sm border border-[var(--border)] rounded-[2px]",
          isUser
            ? "bg-[var(--amber-light)] text-[var(--ink)] shadow-[var(--shadow-pin)]"
            : "bg-[#F8FBFF] text-[var(--ink)] shadow-[var(--shadow-card)]"
        )}
        style={isUser ? { transform: `rotate(${content.length % 2 === 0 ? 0.5 : -0.3}deg)` } : undefined}
      >
        {/* AI coach label with pushpin */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <img
              src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
              alt=""
              className="w-[10px] h-[10px]"
            />
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase text-[var(--pin-blue)] tracking-[0.08em]">Coach</span>
          </div>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-[var(--ink)] prose-p:leading-relaxed prose-pre:font-geist-mono">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        {isStreaming && (
          <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-current opacity-70" />
        )}
      </div>
    </div>
  );
}
