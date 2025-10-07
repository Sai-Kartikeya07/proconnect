import PostFeed from "@/components/PostFeed";
import CreatePost from "@/components/CreatePost";
import UserInformation from "@/components/UserInformation";
import JobsSection from "@/components/JobsSection";
import sql from "@/lib/neon";
import { loadSchemaFlags } from "@/lib/schemaIntrospection";
import AuthWrapper from "@/components/AuthWrapper";

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
    };
  }));

    return (
      <div className="main-layout">
        {/* Feed */}
        <section className="main-content space-y-6">
          <div className="will-animate fade-up" style={{animationDelay:'0ms'}}>
            <CreatePost />
          </div>
          <PostFeed posts={postsWithExtras}/>
        </section>

        {/* Right Sidebar */}
        <aside className="sidebar sidebar-content">
          <div className="will-animate fade-up" style={{animationDelay:'50ms'}}>
            <UserInformation />
          </div>
          <div className="will-animate fade-up" style={{animationDelay:'150ms'}}>
            <JobsSection />
          </div>
          {/* Add trending topics, community list, ads, etc. */}
        </aside>
      </div>
    );
}

