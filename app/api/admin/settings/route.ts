import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveSettings } from "@/lib/settings/service";

export async function POST(request: Request) {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await saveSettings(body);
  return NextResponse.json({ ok: true });
}
