import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/reset/service";
import { getEmailAdapter } from "@/lib/email";

const Schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const token = await createPasswordResetToken(parsed.data.email);

    // Always return 200 — never reveal whether the email exists
    if (token) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      const email = getEmailAdapter();
      await email.sendPasswordReset({
        to: parsed.data.email,
        resetUrl,
      }).catch((err) => console.error("[email] Password reset email failed:", err));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
