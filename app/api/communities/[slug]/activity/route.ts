import { auth } from '@clerk/nextjs/server';
import sql from '@/lib/neon';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

// POST create a new activity entry for a community.
export async function POST(req: Request, context: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const slug = context?.params?.slug as string;
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  // verify community exists
  const communityRows = await sql`SELECT id FROM communities WHERE slug = ${slug};`;
  if (!communityRows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const communityId = communityRows[0].id;

  const formData = await req.formData();
  const content = (formData.get('content') as string)?.trim();
  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });
  if (content.length > 500) return NextResponse.json({ error: 'Too long' }, { status: 400 });

  await sql`
    INSERT INTO community_activity (community_id, user_id, content)
    VALUES (${communityId}, ${userId}, ${content});
  `;

  redirect(`/communities/${slug}`);
}

// GET list activities (optional usage if needed by client fetch)
export async function GET(_req: Request, context: any) {
  const slug = context?.params?.slug as string;
  if (!slug) return NextResponse.json({ activities: [], error: 'Missing slug' });
  const rows = await sql`
    SELECT a.id, a.content, a.created_at, u.first_name, u.image_url
    FROM community_activity a
    JOIN communities c ON a.community_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE c.slug = ${slug}
    ORDER BY a.created_at DESC
    LIMIT 100;
  `;
  return NextResponse.json({ activities: rows });
}
