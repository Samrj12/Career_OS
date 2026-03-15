import { NextRequest, NextResponse } from "next/server";
import { saveActivityLog } from "@/actions/activities";

export async function POST(req: NextRequest) {
  try {
    const { rawInput, extraction, nodeId } = await req.json();
    const log = await saveActivityLog({ nodeId, rawInput, extraction });
    return NextResponse.json({ success: true, logId: log.id });
  } catch (err) {
    console.error("Save log error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
