import { db } from "@/db";
import { reports } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils/dates";
import { GenerateReviewButton } from "@/components/GenerateReviewButton";

export default async function ReviewPage() {
  const latestReport = await db.query.reports.findFirst({
    orderBy: [desc(reports.createdAt)],
  });

  const periodStart = latestReport ? formatDate(latestReport.periodStart) : "This Week";
  const periodEnd = latestReport ? formatDate(latestReport.periodEnd) : "";

  return (
    <div className="max-w-[800px] mx-auto p-8 animate-fade-slide-up">
      <div className="flex items-start justify-between mb-[28px]">
        <div>
          {/* "WEEKLY REVIEW" stamped header */}
          <div className="inline-block mb-3 px-3 py-1.5 border-[2px] border-double border-[var(--amber)] opacity-80 -rotate-[3deg]">
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.15em] text-[var(--amber)]">
              WEEKLY REVIEW
            </span>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-[24px] text-[var(--ink)]">
            {latestReport ? `${periodStart} — ${periodEnd}` : 'Ready for review?'}
          </p>
        </div>
        {latestReport && <GenerateReviewButton />}
      </div>

      {latestReport ? (
        <ReportView report={latestReport} />
      ) : (
        <div className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-[40px] flex flex-col items-center justify-center space-y-4 min-h-[300px] overflow-hidden">
          {/* Folded map at 15% opacity */}
          <img
            src="/assets/maps/maps (2).png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.15] pointer-events-none select-none grayscale"
          />
          <div className="relative z-10 text-center">
            <p className="font-[family-name:var(--font-inter)] text-[15px] font-medium text-[var(--ink)] mb-6">Generate your first briefing</p>
            <GenerateReviewButton isFirst={true} />
          </div>
        </div>
      )}
    </div>
  );
}

function ReportView({ report }: { report: typeof reports.$inferSelect }) {
  const stats: Record<string, number> = JSON.parse(report.stats || "{}");
  const strengths: string[] = JSON.parse(report.strengths || "[]");
  const weaknesses: string[] = JSON.parse(report.weaknesses || "[]");
  const recommendations: string[] = JSON.parse(report.recommendations || "[]");

  const statEntries = Object.entries(stats);

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Stats — Playfair numbers, binder clip at top */}
      {statEntries.length > 0 && (
        <div className="flex flex-row flex-wrap sm:grid sm:grid-cols-4 gap-[16px]">
          {statEntries.map(([key, value], i) => (
            <div key={key} className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-[20px] flex-1 min-w-[140px]">
              {/* Binder clip on first card */}
              {i === 0 && (
                <img
                  src="/assets/stationary_elements/IZtPd7BuOJHldUCqNnSSAp9sA.png"
                  alt=""
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-[28px] h-auto pointer-events-none select-none"
                />
              )}
              <p className="font-[family-name:var(--font-playfair)] text-[40px] text-[var(--ink)] leading-none">{value}</p>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.05em] mt-[4px]">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Strengths — blue pushpin header, green left border, green sticker badge numbering */}
      {strengths.length > 0 && (
        <div className="bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-[20px]">
          <div className="flex items-center gap-2 border-b border-dashed border-[var(--border)] pb-[8px] mb-[12px]">
            <img
              src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
              alt=""
              className="w-[14px] h-[14px]"
            />
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">
              STRENGTHS
            </span>
          </div>
          <div className="flex flex-col gap-[8px]">
            {strengths.map((s, i) => (
              <div key={i} className="border-l-[3px] border-[var(--green)] pl-[12px] flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-full bg-[var(--green-bg)] font-[family-name:var(--font-geist-mono)] text-[9px] text-[var(--green)] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)] leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses — orange pushpin header, amber left border, dashed border */}
      {weaknesses.length > 0 && (
        <div className="bg-[var(--paper)] border border-dashed border-[var(--border-dark)] rounded-[2px] shadow-[var(--shadow-card)] p-[20px]">
          <div className="flex items-center gap-2 border-b border-dashed border-[var(--border)] pb-[8px] mb-[12px]">
            <img
              src="/assets/stationary_elements/Effx968261ztSs30esQUEHvmIsM (1).png"
              alt=""
              className="w-[14px] h-[14px]"
            />
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">
              WEAKNESSES
            </span>
          </div>
          <div className="flex flex-col gap-[8px]">
            {weaknesses.map((w, i) => (
              <div key={i} className="border-l-[3px] border-[var(--amber)] pl-[12px]">
                <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)] leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations — purple pushpin header, individually rotated cards with pushpins */}
      {recommendations.length > 0 && (
        <div className="bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-[20px]">
          <div className="flex items-center gap-2 border-b border-dashed border-[var(--border)] pb-[8px] mb-[12px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[var(--pin-purple)]" />
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">
              RECOMMENDATIONS
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            {/* Dashed route lines connecting cards */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-20 hidden sm:block" preserveAspectRatio="none">
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--border-dark)" strokeWidth="1.5" strokeDasharray="6 4" />
            </svg>
            {recommendations.map((r, i) => {
              const rotations = [0.8, -0.5, 1, -0.8];
              return (
                <div
                  key={i}
                  className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-4 pt-6"
                  style={{ transform: `rotate(${rotations[i % rotations.length]}deg)` }}
                >
                  <img
                    src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
                    alt=""
                    className="absolute -top-2 left-3 w-[14px] h-auto pointer-events-none select-none"
                  />
                  <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)] leading-relaxed">{r}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
