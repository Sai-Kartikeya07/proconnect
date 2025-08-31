import sql from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const postCountResult = await sql`SELECT COUNT(*) FROM posts WHERE user_id = ${userId};`;
    const commentCountResult = await sql`SELECT COUNT(*) FROM comments WHERE user_id = ${userId};`;
    const postCount = postCountResult[0].count || 0;
    const commentCount = commentCountResult[0].count || 0;
    return NextResponse.json({ postCount, commentCount });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
  }
}
