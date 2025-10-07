import sql from "@/lib/neon";
import { NextResponse } from "next/server";
import { sendEmailNotification, renderPostLikedEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params;
    // Get likes from likes table
    const likes = await sql`SELECT user_id FROM likes WHERE post_id = ${post_id};`;
    return NextResponse.json(likes.map(like => like.user_id));
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching likes" },
      { status: 500 }
    );
  }
}

export interface LikePostRequestBody {
  userId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { userId }: LikePostRequestBody = await request.json();
  try {
    const { post_id } = await params;
    console.log('LIKE API:', { post_id, userId });
    // Check if user already liked
    const existing = await sql`SELECT * FROM likes WHERE post_id = ${post_id} AND user_id = ${userId};`;
    console.log('Existing likes:', existing);
    if (existing.length > 0) {
      await sql`DELETE FROM likes WHERE post_id = ${post_id} AND user_id = ${userId};`;
      console.log('Deleted like');
      return NextResponse.json({ message: "Post unliked successfully" });
    } else {
      await sql`INSERT INTO likes (post_id, user_id) VALUES (${post_id}, ${userId});`;
      console.log('Inserted like');
      // Fetch post & owner info
      const postRows = await sql`SELECT id, user_id, first_name, last_name, text FROM posts WHERE id = ${post_id} LIMIT 1;`;
      const post = postRows[0];
      // Fetch liker user name (if stored anywhere)
  // Users table uses 'id' as PK (not user_id)
  const liker = await sql`SELECT first_name, last_name, email FROM users WHERE id = ${userId} LIMIT 1;`.catch(() => [] as any);
      const likerName = liker[0] ? `${liker[0].first_name}${liker[0].last_name ? ' ' + liker[0].last_name : ''}` : 'Someone';
      // Owner email
  const owner = await sql`SELECT email FROM users WHERE id = ${post.user_id} LIMIT 1;`.catch(() => [] as any);
      const ownerEmail = owner[0]?.email;
      if (ownerEmail && post.user_id !== userId) {
        const html = renderPostLikedEmail(post.first_name, likerName, (post.text || '').slice(0, 180));
        sendEmailNotification({
          to: ownerEmail,
          subject: "Your post got a like",
          html,
        }).catch(err => console.warn('Failed to send like notification email', err));
      }
      return NextResponse.json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.error('LIKE API ERROR:', error);
    return NextResponse.json(
      { error: "An error occurred while liking the post" },
      { status: 500 }
    );
  }
}