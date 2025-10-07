import Post from "./Post";
import React from "react";

function PostFeed({ posts }: { posts: any[] }) {
  return (
    <div className="space-y-2 pb-20">
      {posts.map((post, idx) => (
        <div
          key={String(post.id)}
          className="will-animate fade-up"
          style={{ animationDelay: `${Math.min(idx * 50, 450)}ms` }}
        >
          <Post post={post} />
        </div>
      ))}
    </div>
  );
}

export default PostFeed;
