import { NextResponse } from 'next/server';
import sql from '@/lib/neon';

// GET /api/users/search?q=term
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let q = (searchParams.get('q') || '').trim();

    if (!q) {
      return NextResponse.json({ users: [] });
    }

    // Basic length/rate limiting guard
    if (q.length > 60) {
      q = q.slice(0, 60);
    }

    // Prepare pattern for ILIKE; escape % and _
    const escaped = q.replace(/[%_]/g, ch => `\\${ch}`);
    const pattern = `%${escaped}%`;

    // Search by first or last name (case-insensitive)
    const users = await sql`
      SELECT id, first_name, last_name, image_url
      FROM users
      WHERE (first_name ILIKE ${pattern} OR last_name ILIKE ${pattern})
      ORDER BY created_at DESC
      LIMIT 10;
    `;

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('User search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
