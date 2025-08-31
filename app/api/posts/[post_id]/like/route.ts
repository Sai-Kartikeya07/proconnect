import sql from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params;
    // Get likes from likes table
    const likes = await sql`SELECT user_id FROM likes WHERE post_id = ${post_id};`;
    return NextResponse.json(likes.map(like => like.user_id));
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching likes" },
      { status: 500 }
    );
  }
}

export interface LikePostRequestBody {
  userId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { userId }: LikePostRequestBody = await request.json();
  try {
    const { post_id } = await params;
    console.log('LIKE API:', { post_id, userId });
    // Check if user already liked
    const existing = await sql`SELECT * FROM likes WHERE post_id = ${post_id} AND user_id = ${userId};`;
    console.log('Existing likes:', existing);
    if (existing.length > 0) {
      await sql`DELETE FROM likes WHERE post_id = ${post_id} AND user_id = ${userId};`;
      console.log('Deleted like');
      return NextResponse.json({ message: "Post unliked successfully" });
    } else {
      await sql`INSERT INTO likes (post_id, user_id) VALUES (${post_id}, ${userId});`;
      console.log('Inserted like');
      return NextResponse.json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.error('LIKE API ERROR:', error);
    return NextResponse.json(
      { error: "An error occurred while liking the post" },
      { status: 500 }
    );
  }
}