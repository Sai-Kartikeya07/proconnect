import { auth } from '@clerk/nextjs/server';
import sql from '@/lib/neon';
import { notFound } from 'next/navigation';
import AuthWrapper from '@/components/AuthWrapper';
import Link from 'next/link';
import React from 'react';

interface Params { slug: string }

async function CommunityInner(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const { userId } = await auth();
  const rows = await sql`SELECT id, name, slug, description, created_at FROM communities WHERE slug = ${slug};`;
  if (!rows.length) notFound();
  const c = rows[0];
  let isMember = false;
  if (userId) {
    const m = await sql`SELECT 1 FROM community_members WHERE community_id = ${c.id} AND user_id = ${userId};`;
    isMember = m.length > 0;
  }
  // Stats & related data
  const [countsRow] = await sql`
    SELECT 
      (SELECT COUNT(*) FROM community_members WHERE community_id = ${c.id})::int AS members_count,
      (SELECT COUNT(*) FROM community_activity WHERE community_id = ${c.id})::int AS activities_count,
      (SELECT MAX(created_at) FROM community_activity WHERE community_id = ${c.id}) AS last_activity_at
  `;

  const topMembers = await sql`
    SELECT u.id, u.first_name, u.image_url, COUNT(a.id)::int AS activity_count
    FROM community_activity a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.community_id = ${c.id}
    GROUP BY u.id, u.first_name, u.image_url
    ORDER BY activity_count DESC
    LIMIT 5;
  `;

  // Load existing activities (latest first) for both main feed & recent widget
  const activities = await sql`
    SELECT a.id, a.content, a.created_at, u.first_name, u.image_url
    FROM community_activity a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.community_id = ${c.id}
    ORDER BY a.created_at DESC
    LIMIT 50;
  `;

  // Theming based on slug
  const themeMap: Record<string, { gradient: string; accent: string; banner?: string; rules: string[] }> = {
    'adventure-seekers': {
      gradient: 'from-indigo-600/70 via-purple-600/60 to-fuchsia-600/60',
      accent: 'text-purple-300',
      banner: undefined,
      rules: [
        'Respect all members',
        'No spam or self-promo without permission',
        'Stay on topic: travel, exploration & gear',
        'Use content warnings where appropriate'
      ]
    },
    'food-lovers': {
      gradient: 'from-rose-600/70 via-pink-600/60 to-amber-500/60',
      accent: 'text-rose-300',
      rules: [
        'Credit original recipes',
        'No diet shaming',
        'Tag allergens clearly',
        'Keep photography original'
      ]
    },
    'book-club': {
      gradient: 'from-amber-600/70 via-amber-500/60 to-orange-500/60',
      accent: 'text-amber-300',
      rules: [
        'Use spoiler tags for recent releases',
        'Be courteous in critiques',
        'No pirated content links',
        'One recommendation thread per week'
      ]
    },
    'fitness-zone': {
      gradient: 'from-emerald-600/70 via-green-600/60 to-lime-500/60',
      accent: 'text-green-300',
      rules: [
        'No harmful medical advice',
        'Encourage safely & supportively',
        'Tag transformation photos',
        'Respect privacy'
      ]
    }
  };
  const theme = themeMap[c.slug] || themeMap['adventure-seekers'];

  // Real events from DB
  const events = await sql`
    SELECT id, title, event_date, description, created_at
    FROM community_events
    WHERE community_id = ${c.id}
    ORDER BY event_date ASC
    LIMIT 25;
  `;

  const recentActivities = activities.slice(0, 5);

  const lastActive = countsRow?.last_activity_at ? new Date(countsRow.last_activity_at) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Unified Header + About + Stats + Join */}
          <div className="overflow-hidden rounded-xl border border-[#2c2c30] bg-[#1a1a1d] shadow relative">
            <div className={`h-40 bg-gradient-to-r ${theme.gradient} relative`}>
              <div className="absolute inset-0 backdrop-brightness-[0.85]" />
              <div className="absolute bottom-0 left-0 p-6 flex flex-col md:flex-row md:items-end md:justify-between w-full">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">{c.name}</h1>
                  {lastActive && (
                    <p className="text-xs text-gray-200 mt-1">Last active {lastActive.toLocaleString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/" className="text-xs text-white/80 hover:text-white underline">Home</Link>
                  <form action={`/api/communities/${c.slug}/join`} method="post">
                    <button type="submit" disabled={!userId} className={`px-5 py-2.5 rounded-md text-sm font-medium pressable shadow ${isMember ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                      {isMember ? 'Leave' : 'Join'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            {/* About & Stats */}
            <div className="p-6 space-y-8">
              <section>
                <h2 className="text-lg font-semibold text-white mb-2">About</h2>
                {c.description && <p className="text-sm text-gray-300 leading-relaxed mb-4 whitespace-pre-line">{c.description}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-md bg-[#222226] border border-[#2e2e33]">
                    <p className="text-xs text-gray-400">Members</p>
                    <p className="text-base font-semibold text-white mt-0.5">{countsRow?.members_count ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-md bg-[#222226] border border-[#2e2e33]">
                    <p className="text-xs text-gray-400">Activities</p>
                    <p className="text-base font-semibold text-white mt-0.5">{countsRow?.activities_count ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-md bg-[#222226] border border-[#2e2e33]">
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="text-base font-semibold text-white mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 rounded-md bg-[#222226] border border-[#2e2e33]">
                    <p className="text-xs text-gray-400">Last Active</p>
                    <p className="text-base font-semibold text-white mt-0.5">{lastActive ? lastActive.toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-white mb-2">Rules</h3>
                <ul className="space-y-1 text-xs text-gray-300 list-disc ml-5">
                  {theme.rules.map(r => <li key={r}>{r}</li>)}
                </ul>
              </section>
              {/* Activity Composer & Feed */}
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Activity</h2>
                </div>
                <form action={`/api/communities/${c.slug}/activity`} method="post" className="space-y-3">
                  <textarea name="content" required maxLength={500} placeholder="Share something with the community..." className="w-full bg-[#27272a] border border-[#3f3f46] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-24" />
                  <div className="flex justify-end">
                    <button type="submit" disabled={!userId} className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed pressable">
                      Post Activity
                    </button>
                  </div>
                </form>
                <div className="space-y-4">
                  {activities.length === 0 && (
                    <p className="text-gray-500 text-sm">No activity yet. Be the first!</p>
                  )}
                  {activities.map((a: any) => (
                    <div key={a.id} className="border border-[#2d2d31] rounded-md p-4 bg-[#1b1b1f]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-[#27272a] overflow-hidden flex items-center justify-center text-xs text-gray-300">
                          {a.image_url ? <img src={a.image_url} alt="" className="h-full w-full object-cover" /> : (a.first_name?.charAt(0) || 'U')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-white font-medium">{a.first_name || 'User'}</span>
                          <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{a.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <aside className="space-y-6 lg:sticky lg:top-6 h-fit">
          {/* Top Members */}
          <div className="bg-[#1f1f23] border border-[#2d2d30] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Top Members</h3>
            <ul className="space-y-3">
              {topMembers.length === 0 && <li className="text-xs text-gray-500">No active members yet.</li>}
              {topMembers.map((m: any) => (
                <li key={m.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#27272a] overflow-hidden flex items-center justify-center text-[10px] text-gray-300">
                    {m.image_url ? <img src={m.image_url} alt="" className="h-full w-full object-cover" /> : (m.first_name?.charAt(0) || 'U')}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white font-medium leading-tight">{m.first_name || 'User'}</p>
                    <p className="text-[10px] text-gray-500">{m.activity_count} activities</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Upcoming Events */}
          <div className="bg-[#1f1f23] border border-[#2d2d30] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
              {isMember && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-400 hover:text-blue-300 select-none">Add</summary>
                  <form action={`/api/communities/${c.slug}/events`} method="post" className="mt-3 space-y-2 w-56">
                    <input name="title" required maxLength={200} placeholder="Title" className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                    <input type="date" name="event_date" required className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500" />
                    <textarea name="description" rows={3} maxLength={600} placeholder="Description (optional)" className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-1.5 text-xs font-medium">Create</button>
                  </form>
                </details>
              )}
            </div>
            <ul className="space-y-4">
              {events.length === 0 && <li className="text-xs text-gray-500">No scheduled events.</li>}
              {events.map(ev => (
                <li key={ev.id} className="text-xs">
                  <p className="text-white font-medium leading-tight">{ev.title}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{new Date(ev.event_date).toLocaleDateString()}</p>
                  {ev.description && <p className="text-[11px] text-gray-300 mt-1 leading-snug">{ev.description}</p>}
                </li>
              ))}
            </ul>
          </div>
          {/* Recent Posts (Activities) */}
          <div className="bg-[#1f1f23] border border-[#2d2d30] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Posts</h3>
            <ul className="space-y-3">
              {recentActivities.length === 0 && <li className="text-xs text-gray-500">Nothing posted yet.</li>}
              {recentActivities.map(a => (
                <li key={a.id} className="border border-[#2d2d31] rounded p-3 bg-[#1b1b1f]">
                  <p className="text-[11px] text-gray-300 line-clamp-3">{a.content}</p>
                  <p className="mt-1 text-[10px] text-gray-500">{new Date(a.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CommunityPage(props: { params: Promise<Params> }) {
  return (
    <AuthWrapper>
      <CommunityInner params={props.params} />
    </AuthWrapper>
  );
}
