import Post from "./Post";

function PostFeed({ posts }: { posts: any[] }) {
  return (
    <div className="space-y-2 pb-20">
      {posts.map((post) => (
        <Post key={String(post.id)} post={post} />
      ))}
    </div>
  );
}

export default PostFeed;
