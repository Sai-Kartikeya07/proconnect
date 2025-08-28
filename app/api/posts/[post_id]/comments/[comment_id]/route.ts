import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { Comment } from "@/mongodb/models/comment";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export interface DeleteCommentRequestBody {
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ post_id: string; comment_id: string }> }
) {
  await connectDB();

  try {
    const { post_id, comment_id } = await params;
    const { userId } = await request.json();

    console.log("Delete comment request:", { post_id, comment_id, userId });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      console.log("Invalid comment ID format:", comment_id);
      return NextResponse.json({ error: "Invalid comment ID format" }, { status: 400 });
    }

    // Find the comment
    const comment = await Comment.findById(comment_id);
    
    console.log("Found comment:", comment ? "Yes" : "No");
    
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user is the author of the comment
    if (comment.user.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
    }

    // Delete the comment
    await Comment.deleteCommentById(comment_id);

    // Remove comment reference from post
    const post = await Post.findById(post_id);
    if (post && post.comments) {
      // Use pull to remove the comment reference from the array
      await post.updateOne({ $pull: { comments: comment_id } });
    }

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error in delete comment route:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the comment" },
      { status: 500 }
    );
  }
}
