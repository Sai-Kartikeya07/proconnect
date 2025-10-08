import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import sql from '@/lib/neon';
import { isSuperCommunityAdmin } from '@/lib/communityAdmin';

export async function GET(_req: Request, context: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const superAdmin = await isSuperCommunityAdmin(userId);
  if (!superAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const slug = context?.params?.slug as string;
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const url = new URL(_req.url);
  const q = (url.searchParams.get('q') || '').trim();

  const communityRows = await sql`SELECT id FROM communities WHERE slug = ${slug};`;
  if (!communityRows.length) return NextResponse.json({ users: [] });
  const communityId = communityRows[0].id;

  // Base query: members of community
  let rows;
  if (q) {
    const pattern = `%${q.toLowerCase()}%`;
    rows = await sql`
      SELECT u.id, u.first_name, u.last_name, u.image_url
      FROM community_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.community_id = ${communityId}
        AND (LOWER(u.first_name) LIKE ${pattern} OR LOWER(u.last_name) LIKE ${pattern})
      ORDER BY u.first_name ASC
      LIMIT 12;
    `;
  } else {
    rows = await sql`
      SELECT u.id, u.first_name, u.last_name, u.image_url
      FROM community_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.community_id = ${communityId}
      ORDER BY u.first_name ASC
      LIMIT 12;
    `;
  }
  return NextResponse.json({ users: rows });
}
