import sql from "@/lib/neon";
import { NextResponse } from "next/server";
export async function DELETE(request: Request, context: { params: { post_id: string; comment_id: string } }) {
  try {
    const params = await context.params;
    const { post_id, comment_id } = params;
    const { userId } = await request.json();
    // Find the comment
    const result = await sql`SELECT * FROM comments WHERE id = ${comment_id} AND post_id = ${post_id};`;
    if (result.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    // Only allow author to delete
    if (result[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await sql`DELETE FROM comments WHERE id = ${comment_id} AND post_id = ${post_id};`;
    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred while deleting comment" }, { status: 500 });
  }
}
