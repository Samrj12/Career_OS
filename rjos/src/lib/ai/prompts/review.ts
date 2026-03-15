export function buildWeeklyReviewPrompt(
  weekData: {
    activityLogs: Array<{ nodeTitle: string; timeSpent: number; date: string }>;
    habitLogs: Array<{ nodeTitle: string; completed: boolean; date: string }>;
    planCompletionRate: number;
    previousStats?: Record<string, number>;
  },
  weekStart: string,
  weekEnd: string
): string {
  const totalHours = weekData.activityLogs
    .reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60;

  const habitRate = weekData.habitLogs.length > 0
    ? weekData.habitLogs.filter((h) => h.completed).length / weekData.habitLogs.length
    : 0;

  return `Generate a weekly review report for RJ — week of ${weekStart} to ${weekEnd}.

RAW DATA:
- Total active time: ${totalHours.toFixed(1)} hours
- Activities logged: ${weekData.activityLogs.length}
- Habit completion rate: ${Math.round(habitRate * 100)}%
- Daily plan completion rate: ${Math.round(weekData.planCompletionRate * 100)}%

ACTIVITY BREAKDOWN:
${weekData.activityLogs.map((a) => `  ${a.date}: ${a.nodeTitle} (${a.timeSpent}min)`).join("\n") || "  No activities logged."}

HABIT LOG:
${weekData.habitLogs.map((h) => `  ${h.date}: ${h.nodeTitle} — ${h.completed ? "✓" : "✗"}`).join("\n") || "  No habit logs."}

${weekData.previousStats ? `LAST WEEK: ${JSON.stringify(weekData.previousStats)}` : ""}

REVIEW FORMAT:
Generate a structured weekly report with:
1. Stats summary (with vs-last-week comparisons if available)
2. 2-3 key strengths this week
3. 2-3 key weaknesses or missed opportunities
4. 3 specific recommendations for next week
5. One motivational closing thought from Krishna or the Mahabharata

Be honest and direct. Praise what deserves praise. Call out what needs work.`;
}
