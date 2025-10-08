import PostFeed from "@/components/PostFeed";
import CreatePost from "@/components/CreatePost";
import UserInformation from "@/components/UserInformation";
import JobsSection from "@/components/JobsSection";
import sql from "@/lib/neon";
import { loadSchemaFlags } from "@/lib/schemaIntrospection";
import AuthWrapper from "@/components/AuthWrapper";
import CommunitiesCard from "@/components/CommunitiesCard";

export const revalidate = 0;

export default async function Home() {
  return (
    <AuthWrapper>
      <AuthenticatedHome />
    </AuthWrapper>
  );
}

async function AuthenticatedHome() {
  const { hasCommentNameCols } = await loadSchemaFlags();
  // Attempt to get current user (not fatal if unauthenticated)
  let currentUserId: string | null = null;
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const a = await auth();
    currentUserId = a.userId || null;
  } catch {}
  const posts = await sql`
    SELECT p.*, u.first_name as fresh_first_name, u.last_name as fresh_last_name, u.image_url as fresh_user_image
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC;
  `;
  const postsWithExtras = await Promise.all(posts.map(async (post: any) => {
    const likes = await sql`SELECT user_id FROM likes WHERE post_id = ${post.id};`;
    const dislikes = await sql`SELECT user_id FROM dislikes WHERE post_id = ${post.id};`;
    const rawComments = await sql`SELECT * FROM comments WHERE post_id = ${post.id} ORDER BY created_at ASC;`;
    let saved = false;
    if (currentUserId) {
      const savedRows = await sql`SELECT 1 FROM saved_posts WHERE user_id = ${currentUserId} AND post_id = ${post.id} LIMIT 1;`;
      saved = savedRows.length > 0;
    }
    let comments = rawComments;
    if (!hasCommentNameCols && rawComments.length > 0) {
      const userIds = Array.from(new Set(rawComments.map((c: any) => c.user_id)));
      if (userIds.length) {
        const nameRows = await sql`SELECT id, first_name, last_name, image_url FROM users WHERE id IN (${userIds});`;
        const nameMap = new Map(nameRows.map((r: any) => [r.id, r]));
        comments = rawComments.map((c: any) => {
          const nu = nameMap.get(c.user_id) || {};
          return { ...c, first_name: nu.first_name || null, last_name: nu.last_name || null, user_image: nu.image_url || c.user_image };
        });
      }
    }
    return {
      ...post,
      first_name: post.fresh_first_name ?? post.first_name ?? null,
      last_name: post.fresh_last_name ?? post.last_name ?? null,
      user_image: post.fresh_user_image ?? post.user_image ?? null,
      likes: likes.map((l: any) => l.user_id),
      dislikes: dislikes.map((d: any) => d.user_id),
      comments,
      saved,
    };
  }));

    return (
      <div className="balanced-grid max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Left Sidebar Communities */}
        <div className="left-col flex flex-col">
          <CommunitiesCard variant="sidebar" className="h-full flex flex-col" />
        </div>

        {/* Center Feed */}
        <div className="center-col flex flex-col space-y-6 min-h-full">
          <div className="will-animate fade-up" style={{animationDelay:'0ms'}}>
            <CreatePost />
          </div>
          <CommunitiesCard variant="inline" />
          <PostFeed posts={postsWithExtras} />
        </div>

        {/* Right Sidebar (Profile + Jobs) */}
        <div className="right-col flex flex-col justify-start space-y-6">
          <div className="will-animate fade-up" style={{animationDelay:'50ms'}}>
            <UserInformation />
          </div>
          <div className="will-animate fade-up" style={{animationDelay:'150ms'}}>
            <JobsSection />
          </div>
        </div>
      </div>
    );
}

