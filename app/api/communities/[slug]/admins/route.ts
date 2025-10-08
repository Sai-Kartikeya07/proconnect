import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import sql from '@/lib/neon';
import { isSuperCommunityAdmin } from '@/lib/communityAdmin';

export async function POST(req: Request, context: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const slug: string | undefined = context?.params?.slug;
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const formData = await req.formData();
  const action = (formData.get('action') as string || '').trim();
  const targetUserId = (formData.get('targetUserId') as string || '').trim();

  const communityRows = await sql`SELECT id FROM communities WHERE slug = ${slug};`;
  if (!communityRows.length) return NextResponse.json({ error: 'Community not found' }, { status: 404 });
  const communityId = communityRows[0].id;

  const superAdmin = await isSuperCommunityAdmin(userId);
  if (!superAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!targetUserId) return NextResponse.json({ error: 'Missing target user' }, { status: 400 });
  if (targetUserId === userId && action === 'revoke') {
    return NextResponse.json({ error: 'Cannot revoke your own super admin role' }, { status: 400 });
  }

  // Ensure target is a member for grant
  if (action === 'grant') {
    const member = await sql`SELECT 1 FROM community_members WHERE community_id = ${communityId} AND user_id = ${targetUserId} LIMIT 1;`;
    if (!member.length) return NextResponse.json({ error: 'User must be a member first' }, { status: 400 });
    await sql`INSERT INTO community_admins (community_id, user_id, granted_by) VALUES (${communityId}, ${targetUserId}, ${userId}) ON CONFLICT DO NOTHING;`;
  } else if (action === 'revoke') {
    // Prevent revoking super admin constant directly (super admin not stored necessarily but safe guard)
    await sql`DELETE FROM community_admins WHERE community_id = ${communityId} AND user_id = ${targetUserId};`;
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.redirect(new URL(`/communities/${slug}`, req.url));
}
