import sql from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params;
    const rows = await sql`SELECT * FROM posts WHERE id = ${post_id} LIMIT 1;`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const post = rows[0];
    // Enrich with likes, dislikes, comments similar to /api/posts
    const likes = await sql`SELECT user_id FROM likes WHERE post_id = ${post_id};`;
    const dislikes = await sql`SELECT user_id FROM dislikes WHERE post_id = ${post_id};`;
    const comments = await sql`SELECT * FROM comments WHERE post_id = ${post_id} ORDER BY created_at ASC;`;
    return NextResponse.json({
      ...post,
      likes: likes.map((l: any) => l.user_id),
      dislikes: dislikes.map((d: any) => d.user_id),
      comments,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "An error occurred while fetching the post" },
      { status: 500 }
    );
  }
}

export interface DeletePostRequestBody {
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { userId }: DeletePostRequestBody = await request.json();
  try {
    const { post_id } = await params;
    const rows = await sql`SELECT user_id FROM posts WHERE id = ${post_id} LIMIT 1;`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (rows[0].user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await sql`DELETE FROM posts WHERE id = ${post_id};`;
    // Also cascade delete likes/dislikes/comments (if no FK with ON DELETE CASCADE)
    await sql`DELETE FROM likes WHERE post_id = ${post_id};`;
    await sql`DELETE FROM dislikes WHERE post_id = ${post_id};`;
    await sql`DELETE FROM comments WHERE post_id = ${post_id};`;
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (e) {
    return NextResponse.json(
      { error: "An error occurred while deleting the post" },
      { status: 500 }
    );
  }
}