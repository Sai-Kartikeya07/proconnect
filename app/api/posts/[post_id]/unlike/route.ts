import sql from "@/lib/neon";
import { NextResponse } from "next/server";

export interface UnlikePostRequestBody {
  userId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { userId }: UnlikePostRequestBody = await request.json();
  try {
    const { post_id } = await params;
    const rows = await sql`SELECT id, user_id FROM posts WHERE id = ${post_id} LIMIT 1;`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Remove like if exists
    await sql`DELETE FROM likes WHERE post_id = ${post_id} AND user_id = ${userId};`;
    return NextResponse.json({ message: "Post unliked successfully" });
  } catch (_e) {
    return NextResponse.json(
      { error: "An error occurred while unliking the post" },
      { status: 500 }
    );
  }
}