// ...existing code up to first GET function...
import sql from "@/lib/neon";
import { loadSchemaFlags } from "@/lib/schemaIntrospection";
import { IUser } from "@/types/user";
import { NextResponse } from "next/server";
import { sendEmailNotification, renderPostCreatedEmail } from "@/lib/email";

export interface AddPostRequestBody {
  user: IUser;
  text: string;
  imageUrl?: string | null;
}

export async function POST(request: Request) {
  //  auth().protect();
  const { user, text, imageUrl }: AddPostRequestBody = await request.json();

  try {
    // Insert post (keep legacy name columns if they exist, else omit them)
    const { hasPostNameCols } = await loadSchemaFlags();
    let insertedPost: any;
    if (hasPostNameCols) {
      const inserted = await sql`
        INSERT INTO posts (user_id, user_image, first_name, last_name, text, image_url)
        VALUES (${user.userId}, ${user.userImage}, ${user.firstName}, ${user.lastName}, ${text}, ${imageUrl ?? null})
        RETURNING *;
      `;
      insertedPost = inserted[0];
    } else {
      const inserted = await sql`
        INSERT INTO posts (user_id, user_image, text, image_url)
        VALUES (${user.userId}, ${user.userImage}, ${text}, ${imageUrl ?? null})
        RETURNING *;
      `;
      insertedPost = inserted[0];
    }

    // Always fetch current canonical user names from users table
    const freshUserRows = await sql`SELECT first_name, last_name FROM users WHERE id = ${user.userId} LIMIT 1;`;
    const freshUser = freshUserRows[0] || { first_name: user.firstName, last_name: user.lastName };
    const post = { ...insertedPost, first_name: freshUser.first_name, last_name: freshUser.last_name };

    // Attempt to send email notification (best-effort, non-blocking failure)
    if ((user as any).email) {
      const html = renderPostCreatedEmail(user.firstName, text.slice(0, 280));
      sendEmailNotification({
        to: (user as any).email,
        subject: "Your post is live",
        html,
      }).catch(err => console.warn('Failed to queue post created email', err));
    } else {
      // Fallback: look up in users table (PK = id)
      const rows = await sql`SELECT email, first_name FROM users WHERE id = ${user.userId} LIMIT 1;`.catch(() => [] as any);
      const email = rows[0]?.email;
      if (email) {
        const html = renderPostCreatedEmail(rows[0].first_name || user.firstName, text.slice(0, 280));
        sendEmailNotification({
          to: email,
          subject: "Your post is live",
          html,
        }).catch(err => console.warn('Failed to queue post created email (fallback)', err));
      }
    }
    return NextResponse.json({ message: "Post created successfully", post });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while creating the post ${error}` },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const { hasPostNameCols, hasCommentNameCols } = await loadSchemaFlags();
    // Base post query with fresh names via join
    const posts = await sql`
      SELECT 
        p.*, 
        u.first_name as fresh_first_name, 
        u.last_name as fresh_last_name,
        u.image_url as fresh_user_image
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC;
    `;
    const postsWithExtras = await Promise.all(posts.map(async (post: any) => {
      const likes = await sql`SELECT user_id FROM likes WHERE post_id = ${post.id};`;
      const dislikes = await sql`SELECT user_id FROM dislikes WHERE post_id = ${post.id};`;
      // Fetch comments and if legacy columns missing, overlay names from users
      const rawComments = await sql`SELECT * FROM comments WHERE post_id = ${post.id} ORDER BY created_at ASC;`;
      let comments = rawComments;
      if (!hasCommentNameCols && rawComments.length > 0) {
        // Map user ids to names in a single query
        const userIds = Array.from(new Set(rawComments.map((c: any) => c.user_id)));
        if (userIds.length > 0) {
          const nameRows = await sql`SELECT id, first_name, last_name, image_url FROM users WHERE id IN (${userIds});`;
          const nameMap = new Map(nameRows.map((r: any) => [r.id, r]));
          comments = rawComments.map((c: any) => {
            const nu = nameMap.get(c.user_id) || {};
            return { ...c, first_name: nu.first_name || null, last_name: nu.last_name || null, user_image: nu.image_url || c.user_image };
          });
        }
      }
      return {
        ...post,
        first_name: post.fresh_first_name ?? post.first_name ?? null,
        last_name: post.fresh_last_name ?? post.last_name ?? null,
        user_image: post.fresh_user_image ?? post.user_image ?? null,
        likes: likes.map((l: any) => l.user_id),
        dislikes: dislikes.map((d: any) => d.user_id),
        comments,
      };
    }));
    return NextResponse.json(postsWithExtras);
  } catch (e) {
    console.error('Posts fetch error', e);
    return NextResponse.json({ error: 'An error occurred while fetching posts' }, { status: 500 });
  }
}