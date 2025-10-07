import sql from "@/lib/neon";
import { NextResponse } from "next/server";

// DELETE /api/posts/[post_id]/comments/[comment_id]
export async function DELETE(request: Request, context: any) {
  try {
    const { post_id, comment_id } = context.params;
    const { userId } = await request.json();
    const result = await sql`SELECT * FROM comments WHERE id = ${comment_id} AND post_id = ${post_id};`;
    if (result.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (result[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await sql`DELETE FROM comments WHERE id = ${comment_id} AND post_id = ${post_id};`;
    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch {
    return NextResponse.json({ error: "An error occurred while deleting comment" }, { status: 500 });
  }
}
