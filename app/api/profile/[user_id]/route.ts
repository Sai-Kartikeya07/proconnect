import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/neon";

// GET /api/profile/[user_id] - Get user profile with education
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { userId: currentUserId } = await auth();
    const { user_id } = context.params;

    // Get user basic information
    const userResult = await sql`
      SELECT id, first_name, image_url, email, created_at
      FROM users 
      WHERE id = ${user_id};
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Get user's education
    const education = await sql`
      SELECT * FROM education 
      WHERE user_id = ${user_id}
      ORDER BY is_current DESC, start_date DESC;
    `;

    // Get user stats
    const statsResult = await sql`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = ${user_id}) as posts_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = ${user_id}) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ${user_id}) as following_count;
    `;

    const stats = statsResult[0] || { posts_count: 0, followers_count: 0, following_count: 0 };

    // Check if current user is following this user (if authenticated)
    let isFollowing = false;
    let canMessage = false;

    if (currentUserId && currentUserId !== user_id) {
      const followResult = await sql`
        SELECT 1 FROM follows 
        WHERE follower_id = ${currentUserId} AND following_id = ${user_id};
      `;
      isFollowing = followResult.length > 0;

      // Check if they can message (mutual follow)
      if (isFollowing) {
        const mutualFollowResult = await sql`
          SELECT can_users_message(${currentUserId}, ${user_id}) as can_message;
        `;
        canMessage = mutualFollowResult[0]?.can_message || false;
      }
    }

    const profile = {
      ...user,
      education,
      posts_count: parseInt(stats.posts_count),
      followers_count: parseInt(stats.followers_count),
      following_count: parseInt(stats.following_count),
      is_following: isFollowing,
      can_message: canMessage
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}