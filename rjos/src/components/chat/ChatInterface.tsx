"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { VoiceInput } from "./VoiceInput";
import type { GeneratedGraph } from "@/lib/ai/schemas/graph";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  endpoint: string;
  onGraphGenerated?: (graph: GeneratedGraph) => void;
  placeholder?: string;
  initialMessage?: string;
  showVoice?: boolean;
}

export function ChatInterface({
  endpoint,
  onGraphGenerated,
  placeholder = "Type a message...",
  initialMessage,
  showVoice = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessage ? [{ role: "assistant", content: initialMessage }] : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (!initialMessage && messages.length === 0) {
      sendMessage("", true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (text: string, isAutoStart = false) => {
      const content = text.trim();
      if (!content && !isAutoStart) return;
      if (isLoading) return;

      const newMessages: ChatMessage[] = isAutoStart
        ? []
        : [...messages, { role: "user" as const, content }];

      if (!isAutoStart) {
        setMessages(newMessages);
        setInput("");
      }

      setIsLoading(true);
      setStreamingContent("");

      try {
        const apiMessages = isAutoStart
          ? [{ role: "user", content: "Hello, let's begin." }]
          : newMessages.map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!res.ok) throw new Error("API error");

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "text" || parsed.text) {
                accumulated += parsed.text || "";
                setStreamingContent(accumulated);
              }
              if (parsed.type === "graph_generated" && onGraphGenerated) {
                onGraphGenerated(parsed.graph);
              }
            } catch {}
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulated },
        ]);
        setStreamingContent("");
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
        setStreamingContent("");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, endpoint, onGraphGenerated]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-full flex-col font-inter">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {streamingContent && (
          <MessageBubble role="assistant" content={streamingContent} isStreaming />
        )}
        {isLoading && !streamingContent && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#F8FBFF] rounded-[2px] border border-[var(--border)] shadow-[var(--shadow-card)] px-4 py-3">
              {/* Typewriter-style dashes */}
              <div className="flex gap-1.5 items-center h-[20px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="font-[family-name:var(--font-geist-mono)] text-[var(--ink-3)] text-lg animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    —
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 pt-2">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent border-b-2 border-t-0 border-x-0 border-[var(--border-dark)] rounded-none px-2 py-2 text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-b-[var(--amber)] focus:ring-0 disabled:opacity-50 min-h-[38px] max-h-32 overflow-y-auto font-inter text-base transition-colors"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 128) + "px";
            }}
          />
          {showVoice && (
            <VoiceInput
              disabled={isLoading}
              onTranscript={(text) => setInput((prev) => prev + (prev ? " " : "") + text)}
            />
          )}
          <Button
            size="icon"
            variant="default"
            disabled={isLoading || !input.trim()}
            onClick={() => sendMessage(input)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)]">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
