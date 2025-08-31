import sql from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await sql`SELECT id, first_name, last_name, image_url FROM users ORDER BY created_at DESC;`;
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
