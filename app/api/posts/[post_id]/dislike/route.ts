import sql from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {

  try {
    const { post_id } = await params;


      // Get dislikes from dislikes table
      const dislikes = await sql`SELECT user_id FROM dislikes WHERE post_id = ${post_id};`;
      return NextResponse.json(dislikes.map(dislike => dislike.user_id));
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching dislikes" },
      { status: 500 }
    );
  }
}

export interface DislikePostRequestBody {
  userId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {

  const { userId }: DislikePostRequestBody = await request.json();

  try {
    const { post_id } = await params;


    // Check if user already disliked
      const existing = await sql`SELECT * FROM dislikes WHERE post_id = ${post_id} AND user_id = ${userId};`;
      if (existing.length > 0) {
        await sql`DELETE FROM dislikes WHERE post_id = ${post_id} AND user_id = ${userId};`;
        return NextResponse.json({ message: "Post undisliked successfully" });
      }
      await sql`INSERT INTO dislikes (post_id, user_id) VALUES (${post_id}, ${userId});`;
      return NextResponse.json({ message: "Post disliked successfully" });
  } catch {
    return NextResponse.json(
      { error: "An error occurred while disliking the post" },
      { status: 500 }
    );
  }
}
