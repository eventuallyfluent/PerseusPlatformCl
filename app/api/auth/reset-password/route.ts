import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { validateResetToken, consumeResetToken } from "@/lib/reset/service";

const Schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Validate token before hashing (cheap check first)
    const validation = await validateResetToken(token);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const consumed = await consumeResetToken(token, passwordHash);

    if (!consumed) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Reset failed. Please try again." }, { status: 500 });
  }
}
