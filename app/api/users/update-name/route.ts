import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import sql from '@/lib/neon';

// POST /api/users/update-name { first_name: string, last_name?: string }
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const body = await req.json();
    let { first_name, last_name } = body || {};
    if (typeof first_name !== 'string' || !first_name.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    first_name = first_name.trim().slice(0, 60);
    if (last_name && typeof last_name === 'string') {
      last_name = last_name.trim().slice(0, 60);
    } else {
      last_name = null;
    }

    await sql`UPDATE users SET first_name = ${first_name}, last_name = ${last_name} WHERE id = ${userId};`;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('update-name error', e);
    return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
  }
}
