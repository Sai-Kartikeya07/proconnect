{/*
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
import Image from "next/image";

export default function Home() {
  return (
      <div className="grid grid-cols-8 mt-5 sm:px-5">
        <section className="hidden md:inline md:col-span-2">
          <UserInformation />
        </section>


        <section className="col-span-full md:col-span-6 xl:col-span-4 xl:max-w-xl mx-auto w-full">
          <PostForm  />
        </section>


        <section className="hidden xl:inline justify-center col-span-2">

        </section>

      </div>
  );
}
  */}
  
import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { SignedIn } from "@clerk/nextjs";

export const revalidate = 0;

export default async function Home() {
  await connectDB();
  const posts = await Post.getAllPosts();

  console.log(posts);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 sm:px-5">
      {/* Feed */}
      <section className="md:col-span-2 w-full max-w-2xl mx-auto">
        <SignedIn>
          <PostForm />
        </SignedIn>

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

