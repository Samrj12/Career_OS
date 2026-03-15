import { db } from "@/db";
import { reports } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/dates";
import { GenerateReviewButton } from "@/components/GenerateReviewButton";

export default async function ReviewPage() {
  const latestReport = await db.query.reports.findFirst({
    orderBy: [desc(reports.createdAt)],
  });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Review</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            AI-generated analysis of your week&apos;s performance.
          </p>
        </div>
        <GenerateReviewButton />
      </div>

      {latestReport ? (
        <ReportView report={latestReport} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
            <p className="text-4xl">📊</p>
            <p className="font-medium">No review yet</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-sm">
              After a week of logging activities, generate your first weekly review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportView({ report }: { report: typeof reports.$inferSelect }) {
  const stats: Record<string, number> = JSON.parse(report.stats || "{}");
  const strengths: string[] = JSON.parse(report.strengths || "[]");
  const weaknesses: string[] = JSON.parse(report.weaknesses || "[]");
  const recommendations: string[] = JSON.parse(report.recommendations || "[]");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span>{formatDate(report.periodStart)} — {formatDate(report.periodEnd)}</span>
        <Badge variant="secondary">Week {getWeekNumber(report.periodStart)}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize mt-0.5">
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">💪 Strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {strengths.map((s, i) => (
              <p key={i} className="text-xs flex gap-1.5">
                <span className="text-green-400">✓</span> {s}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">🔧 Needs Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {weaknesses.map((w, i) => (
              <p key={i} className="text-xs flex gap-1.5">
                <span className="text-yellow-400">→</span> {w}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">🎯 Next Week Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[hsl(var(--primary))] font-bold text-sm">{i + 1}.</span>
                <p className="text-sm">{r}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getWeekNumber(timestamp: number): number {
  const d = new Date(timestamp);
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
}
