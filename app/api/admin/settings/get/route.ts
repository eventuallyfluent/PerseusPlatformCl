import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings/service";

export async function GET() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getAllSettings();
  return NextResponse.json(settings);
}
