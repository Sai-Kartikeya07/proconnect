import sql from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    const posts = await sql`SELECT id, user_id FROM posts;`;
    const comments = await sql`SELECT id, user_id FROM comments;`;
    return NextResponse.json({ posts, comments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch debug info" }, { status: 500 });
  }
}
