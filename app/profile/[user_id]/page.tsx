import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import sql from "@/lib/neon";
import AuthWrapper from "@/components/AuthWrapper";
import UserProfileClient from "@/components/UserProfileClient";

async function AuthenticatedUserProfilePage({ params }: { params: { user_id: string } }) {
  const { userId: currentUserId } = await auth();
  const { user_id } = params;

  // Get user basic information
  const userResult = await sql`
    SELECT id, first_name, image_url, email, created_at
    FROM users 
    WHERE id = ${user_id};
  `;

  if (userResult.length === 0) {
    notFound();
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

  // Check if current user is following this user
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
    education: education as any,
    posts_count: parseInt(stats.posts_count),
    followers_count: parseInt(stats.followers_count),
    following_count: parseInt(stats.following_count),
    is_following: isFollowing,
    can_message: canMessage
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <UserProfileClient 
        profile={profile} 
        isOwnProfile={currentUserId === user_id}
        currentUserId={currentUserId}
      />
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { user_id: string } }) {
  return (
    <AuthWrapper>
      <AuthenticatedUserProfilePage params={params} />
    </AuthWrapper>
  );
}