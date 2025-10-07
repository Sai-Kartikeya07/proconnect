import sql from "@/lib/neon";
import { IUser } from "@/types/user";
import { NextResponse } from "next/server";
import { sendEmailNotification, renderPostCommentedEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params;
    // Get comments for post from PostgreSQL
    const comments = await sql`SELECT * FROM comments WHERE post_id = ${post_id} ORDER BY created_at ASC;`;
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching comments" },
      { status: 500 }
    );
  }
}

export interface AddCommentRequestBody {
  user: IUser;
  text: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { user, text }: AddCommentRequestBody = await request.json();
  try {
    const { post_id } = await params;
    // Insert comment into PostgreSQL
    await sql`
      INSERT INTO comments (post_id, user_id, user_image, first_name, last_name, text)
      VALUES (${post_id}, ${user.userId}, ${user.userImage}, ${user.firstName}, ${user.lastName}, ${text});
    `;
    // Fetch post & owner info to send notification
    const postRows = await sql`SELECT id, user_id, first_name, last_name, text FROM posts WHERE id = ${post_id} LIMIT 1;`;
    const post = postRows[0];
    if (post && post.user_id !== user.userId) {
  const owner = await sql`SELECT email FROM users WHERE id = ${post.user_id} LIMIT 1;`.catch(() => [] as any);
      const ownerEmail = owner[0]?.email;
      if (ownerEmail) {
        const commenterName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;
        const html = renderPostCommentedEmail(post.first_name, commenterName, text.slice(0, 300), (post.text || '').slice(0, 160));
        sendEmailNotification({
          to: ownerEmail,
          subject: "New comment on your post",
          html,
        }).catch(err => console.warn('Failed to send comment notification email', err));
      }
    }
    return NextResponse.json({ message: "Comment added successfully" });
  } catch {
    return NextResponse.json(
      { error: "An error occurred while adding comment" },
      { status: 500 }
    );
  }
}