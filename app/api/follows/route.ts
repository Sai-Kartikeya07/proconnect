import sql from "@/lib/neon";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { followingId } = await request.json();
  if (!followingId) {
    return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
  }
  
  try {
    // Check if already following
    const existingFollow = await sql`
      SELECT * FROM follows 
      WHERE follower_id = ${user.id} AND following_id = ${followingId};
    `;

    if (existingFollow.length > 0) {
      // Unfollow
      await sql`
        DELETE FROM follows 
        WHERE follower_id = ${user.id} AND following_id = ${followingId};
      `;
      return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      await sql`
        INSERT INTO follows (follower_id, following_id) 
        VALUES (${user.id}, ${followingId});
      `;
      return NextResponse.json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { followingId } = await request.json();
  if (!followingId) {
    return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
  }
  try {
    await sql`
      DELETE FROM follows WHERE follower_id = ${user.id} AND following_id = ${followingId};
    `;
    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 });
  }
}

export async function GET(_request: Request) {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const result = await sql`
      SELECT following_id FROM follows WHERE follower_id = ${user.id};
    `;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch follows" }, { status: 500 });
  }
}
