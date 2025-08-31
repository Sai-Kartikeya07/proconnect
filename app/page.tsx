import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 sm:px-5">
      {/* Feed */}
      <section className="md:col-span-2 w-full max-w-2xl mx-auto">
        <PostForm />
        <PostFeed posts={postsWithExtras}/>
      </section>

      {/* Right Sidebar */}
      <aside className="hidden md:block md:col-span-1 space-y-4">
        <UserInformation />
        {/* Add trending topics, community list, ads, etc. */}
      </aside>
    </div>
  );
}

