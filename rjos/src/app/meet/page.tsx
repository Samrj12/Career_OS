import { ChatInterface } from "@/components/chat/ChatInterface";

export default function MeetPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] py-8 px-4 items-center animate-fade-slide-up">
      <div className="w-full max-w-[700px]">
        <h1 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em] mb-[16px]">
          MEET YOUR AI COACH
        </h1>

        <div
          className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] flex flex-col w-full h-[calc(100vh-150px)] overflow-hidden"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, var(--border) 27px, var(--border) 28px)",
            backgroundSize: "100% 28px",
            transform: "perspective(1200px) rotateY(-1deg)",
          }}
        >
          {/* Spiral binding on left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-[20px] flex flex-col justify-start pt-4 gap-[16px] pointer-events-none z-20">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-full border-2 border-[var(--border-dark)] bg-[var(--paper-alt)] mx-auto" />
            ))}
          </div>

          {/* Amber margin line (not red — differentiates from ruled) */}
          <div className="absolute left-[40px] top-0 bottom-0 border-l-2 border-[var(--amber-border)] opacity-40 pointer-events-none" />

          {/* Paper clip at top-right */}
          <img
            src="/assets/stationary_elements/xSXenWs1UJkTy0XAXVlAQAAwlE.png"
            alt=""
            className="absolute top-0 right-4 w-[28px] h-auto pointer-events-none select-none z-20 rotate-[5deg]"
          />

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col pl-[56px] relative z-10 w-full overflow-hidden h-full">
            <ChatInterface
              endpoint="/api/ai/chat"
              placeholder="How's my progress this week? What should I focus on?"
              showVoice
              initialMessage="Hey RJ! What's on your mind? We can review your progress, talk strategy, or just check in. What do you want to work on today?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
