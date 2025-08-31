// ...existing code up to first GET function...
import sql from "@/lib/neon";
import { IUser } from "@/types/user";
import { NextResponse } from "next/server";

export interface AddPostRequestBody {
  user: IUser;
  text: string;
  imageUrl?: string | null;
}

export async function POST(request: Request) {
  //  auth().protect();
  const { user, text, imageUrl }: AddPostRequestBody = await request.json();

  try {
    // Insert post into PostgreSQL
    const result = await sql`
      INSERT INTO posts (user_id, user_image, first_name, last_name, text, image_url)
      VALUES (${user.userId}, ${user.userImage}, ${user.firstName}, ${user.lastName}, ${text}, ${imageUrl ?? null})
      RETURNING *;
    `;
    const post = result[0];
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
    // Get all posts from PostgreSQL
    const posts = await sql`SELECT * FROM posts ORDER BY created_at DESC;`;
    // For each post, fetch likes, dislikes, and comments
    const postsWithExtras = await Promise.all(posts.map(async post => {
      const likes = await sql`SELECT user_id FROM likes WHERE post_id = ${post.id};`;
      const dislikes = await sql`SELECT user_id FROM dislikes WHERE post_id = ${post.id};`;
      const comments = await sql`SELECT * FROM comments WHERE post_id = ${post.id} ORDER BY created_at ASC;`;
      return {
        ...post,
        likes: likes.map(like => like.user_id),
        dislikes: dislikes.map(dislike => dislike.user_id),
        comments,
      };
    }));
    return NextResponse.json(postsWithExtras);
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}