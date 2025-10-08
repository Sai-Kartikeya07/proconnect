import { auth } from '@clerk/nextjs/server';
import sql from '@/lib/neon';
import { NextResponse } from 'next/server';
import { isCommunityAdmin, isSuperCommunityAdmin } from '@/lib/communityAdmin';

// GET events for a community
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const communityRows = await sql`SELECT id FROM communities WHERE slug = ${slug};`;
  if (!communityRows.length) return NextResponse.json({ events: [] });
  const communityId = communityRows[0].id;
  const events = await sql`
    SELECT id, title, event_date, description, created_at
    FROM community_events
    WHERE community_id = ${communityId}
    ORDER BY event_date ASC
    LIMIT 50;
  `;
  return NextResponse.json({ events });
}

// POST create a new event
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const formData = await req.formData();
  const title = (formData.get('title') as string || '').trim();
  const eventDate = (formData.get('event_date') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  if (!title || !eventDate) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const communityRows = await sql`SELECT id FROM communities WHERE slug = ${slug};`;
  if (!communityRows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const communityId = communityRows[0].id;

  // Require admin (either super or community admin). If none present, allow super admin to bootstrap by granting later.
  const admin = await isCommunityAdmin(communityId, userId);
  if (!admin) {
    return NextResponse.json({ error: 'Admin rights required to create events' }, { status: 403 });
  }

  await sql`
    INSERT INTO community_events (community_id, created_by, title, event_date, description)
    VALUES (${communityId}, ${userId}, ${title}, ${eventDate}, ${description || null});
  `;
  return NextResponse.json({ ok: true });
}
