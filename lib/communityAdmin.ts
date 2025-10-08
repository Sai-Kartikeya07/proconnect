export const SUPER_COMMUNITY_ADMIN_ID = 'user_323oHMTesX7PWAOqI82UxuFCNe6';

import sql from '@/lib/neon';

export async function isSuperCommunityAdmin(userId: string | null | undefined) {
  return !!userId && userId === SUPER_COMMUNITY_ADMIN_ID;
}

export async function isCommunityAdmin(communityId: number, userId: string | null | undefined) {
  if (!userId) return false;
  if (await isSuperCommunityAdmin(userId)) return true;
  const rows = await sql`SELECT 1 FROM community_admins WHERE community_id = ${communityId} AND user_id = ${userId} LIMIT 1;`;
  return rows.length > 0;
}

export async function grantCommunityAdmin(communityId: number, targetUserId: string, actingUserId: string) {
  // Only super admin can grant
  if (!(await isSuperCommunityAdmin(actingUserId))) throw new Error('Forbidden');
  await sql`INSERT INTO community_admins (community_id, user_id, granted_by) VALUES (${communityId}, ${targetUserId}, ${actingUserId}) ON CONFLICT DO NOTHING;`;
}

export async function revokeCommunityAdmin(communityId: number, targetUserId: string, actingUserId: string) {
  if (!(await isSuperCommunityAdmin(actingUserId))) throw new Error('Forbidden');
  await sql`DELETE FROM community_admins WHERE community_id = ${communityId} AND user_id = ${targetUserId};`;
}
