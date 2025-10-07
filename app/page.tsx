import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
import JobsSection from "@/components/JobsSection";
import sql from "@/lib/neon";
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
  const posts = await sql`SELECT * FROM posts ORDER BY created_at DESC;`;
  const postsWithExtras = await Promise.all(posts.map(async post => {
    const likes = await sql`SELECT user_id FROM likes WHERE post_id = ${post.id};`;
    const dislikes = await sql`SELECT user_id FROM dislikes WHERE post_id = ${post.id};`;
    const comments = await sql`SELECT * FROM comments WHERE post_id = ${post.id} ORDER BY created_at ASC;`;
    return {
      ...post,
      likes: likes.map(like => like.user_id),
      dislikes: dislikes.map(dislike => dislike.user_id),
      comments,
    };
  }));

    return (
      <div className="main-layout">
        {/* Feed */}
        <section className="main-content">
          <PostForm />
          <PostFeed posts={postsWithExtras}/>
        </section>

        {/* Right Sidebar */}
        <aside className="sidebar sidebar-content">
          <UserInformation />
          <JobsSection />
          {/* Add trending topics, community list, ads, etc. */}
        </aside>
      </div>
    );
}

