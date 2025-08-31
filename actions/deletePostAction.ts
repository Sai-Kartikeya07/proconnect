"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { DeletePostRequestBody } from "@/app/api/posts/[post_id]/route";
import sql from "@/lib/neon";

export default async function deletePostAction(postId: string) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Check post ownership and existence
  const result = await sql`SELECT * FROM posts WHERE id = ${postId};`;
  const post = result[0];
  if (!post) {
    throw new Error("Post not found");
  }
  if (post.user_id !== user.id) {
    throw new Error("Post does not belong to the user");
  }

  try {
    await sql`DELETE FROM posts WHERE id = ${postId};`;
    revalidatePath("/");
  } catch (error) {
    throw new Error("An error occurred while deleting the post");
  }
}