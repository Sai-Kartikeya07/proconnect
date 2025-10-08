import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import sql from "@/lib/neon";
import AuthWrapper from "@/components/AuthWrapper";
import UserProfileClient from "@/components/UserProfileClient";
import { IEducation, IUserProfile } from "@/types/profile";

interface ProfilePageParams { user_id: string }

// Next.js 15+ provides params as an async value; await before usage.
async function AuthenticatedUserProfilePage(props: { params: Promise<ProfilePageParams> }) {
  const { userId: currentUserId } = await auth();
  const { user_id } = await props.params;

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
  const educationRaw = await sql`
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
        SELECT (
          EXISTS (
            SELECT 1 FROM follows f1 
            WHERE f1.follower_id = ${currentUserId} AND f1.following_id = ${user_id}
          ) AND EXISTS (
            SELECT 1 FROM follows f2 
            WHERE f2.follower_id = ${user_id} AND f2.following_id = ${currentUserId}
          )
        ) as can_message;
      `;
      canMessage = !!mutualFollowResult[0]?.can_message;
    }
  }

  const education: IEducation[] = educationRaw.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    institution: row.institution,
    degree: row.degree,
    field_of_study: row.field_of_study ?? undefined,
    start_date: row.start_date ?? undefined,
    end_date: row.end_date ?? undefined,
    is_current: row.is_current,
    grade: row.grade ?? undefined,
    description: row.description ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  const profile: IUserProfile = {
    id: user.id,
    first_name: user.first_name,
    image_url: user.image_url || undefined,
    email: user.email || undefined,
    created_at: user.created_at,
    education,
    posts_count: Number(stats.posts_count) || 0,
    followers_count: Number(stats.followers_count) || 0,
    following_count: Number(stats.following_count) || 0,
    is_following: isFollowing,
    can_message: canMessage,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <UserProfileClient 
        profile={profile} 
        isOwnProfile={currentUserId === user_id}
        currentUserId={currentUserId || undefined}
      />
    </div>
  );
}

export default function UserProfilePage(props: { params: Promise<ProfilePageParams> }) {
  return (
    <AuthWrapper>
      <AuthenticatedUserProfilePage params={props.params} />
    </AuthWrapper>
  );
}