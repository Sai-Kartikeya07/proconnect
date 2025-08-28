import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
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
  await connectDB();
  const posts = await Post.getAllPosts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 sm:px-5">
      {/* Feed */}
      <section className="md:col-span-2 w-full max-w-2xl mx-auto">
        <PostForm />
        <PostFeed posts={posts}/>
      </section>

      {/* Right Sidebar */}
      <aside className="hidden md:block md:col-span-1 space-y-4">
        <UserInformation />
        {/* Add trending topics, community list, ads, etc. */}
      </aside>
    </div>
  );
}

