import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/neon';

export async function POST(request: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL('/sign-in', request.url));
    const { slug } = context.params;
    const rows = await sql`SELECT id FROM communities WHERE slug = ${slug};`;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const communityId = rows[0].id;
    const existing = await sql`SELECT 1 FROM community_members WHERE community_id = ${communityId} AND user_id = ${userId};`;
    if (existing.length) {
      await sql`DELETE FROM community_members WHERE community_id = ${communityId} AND user_id = ${userId};`;
    } else {
      await sql`INSERT INTO community_members (community_id, user_id) VALUES (${communityId}, ${userId});`;
    }
    return NextResponse.redirect(new URL(`/communities/${slug}`, request.url));
  } catch (e) {
    console.error('Community join error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
