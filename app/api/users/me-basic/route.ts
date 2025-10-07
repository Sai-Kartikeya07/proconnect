import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import sql from '@/lib/neon';

// GET /api/users/me-basic
// Ensures the user exists in the DB (sync) and returns minimal name info
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const existing = await sql`SELECT id, first_name, last_name FROM users WHERE id = ${userId};`;
    if (existing.length === 0) {
      const user = await currentUser();
      await sql`INSERT INTO users (id, first_name, last_name, email, image_url) VALUES (${userId}, ${user?.firstName || null}, ${user?.lastName || null}, ${user?.emailAddresses?.[0]?.emailAddress || null}, ${user?.imageUrl || null}) ON CONFLICT (id) DO NOTHING;`;
      return NextResponse.json({ first_name: user?.firstName || null, last_name: user?.lastName || null, needs_name: !user?.firstName });
    }
    const row = existing[0];
    return NextResponse.json({ first_name: row.first_name, last_name: row.last_name, needs_name: !row.first_name });
  } catch (e) {
    console.error('me-basic error', e);
    return NextResponse.json({ error: 'Failed to load profile basics' }, { status: 500 });
  }
}
