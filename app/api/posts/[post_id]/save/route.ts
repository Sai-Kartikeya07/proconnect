import { auth } from '@clerk/nextjs/server';
import sql from '@/lib/neon';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { post_id } = await params;

  try {
    // Toggle save: if exists remove, else insert
    const existing = await sql`SELECT 1 FROM saved_posts WHERE user_id = ${userId} AND post_id = ${post_id};`;
    if (existing.length) {
      await sql`DELETE FROM saved_posts WHERE user_id = ${userId} AND post_id = ${post_id};`;
      return NextResponse.json({ saved: false });
    } else {
      await sql`INSERT INTO saved_posts (user_id, post_id) VALUES (${userId}, ${post_id});`;
      return NextResponse.json({ saved: true });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to toggle save' }, { status: 500 });
  }
}
