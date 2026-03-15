import { ChatInterface } from "@/components/chat/ChatInterface";

export default function MeetPage() {
  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-[hsl(var(--border))] px-6 py-4">
        <h1 className="text-xl font-bold">Meet Your AI Coach</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Ask anything about your career, get strategic advice, or discuss what&apos;s on your mind.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          endpoint="/api/ai/chat"
          placeholder="How's my progress this week? What should I focus on?"
          showVoice
          initialMessage="Hey RJ 👋 What's on your mind? We can review your progress, talk strategy, or just check in. What do you want to work on today?"
        />
      </div>
    </div>
  );
}
