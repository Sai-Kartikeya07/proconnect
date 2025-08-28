import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  await connectDB();

  try {
    const { post_id } = await params;
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const dislikes = post.dislikes;
    return NextResponse.json(dislikes);
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching dislikes" },
      { status: 500 }
    );
  }
}

export interface DislikePostRequestBody {
  userId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  await connectDB();

  const { userId }: DislikePostRequestBody = await request.json();

  try {
    const { post_id } = await params;
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already disliked
    const isDisliked = post.dislikes?.includes(userId);
    
    if (isDisliked) {
      await post.undislikePost(userId);
      return NextResponse.json({ message: "Post undisliked successfully" });
    } else {
      await post.dislikePost(userId);
      return NextResponse.json({ message: "Post disliked successfully" });
    }
  } catch {
    return NextResponse.json(
      { error: "An error occurred while disliking the post" },
      { status: 500 }
    );
  }
}
