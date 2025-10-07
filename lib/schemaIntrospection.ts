import sql from '@/lib/neon';

const cached: { checked: boolean; hasPostNameCols: boolean; hasCommentNameCols: boolean } = {
  checked: false,
  hasPostNameCols: true,
  hasCommentNameCols: true,
};

export async function loadSchemaFlags() {
  if (cached.checked) return cached;
  try {
    const postCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'posts';`;
    const commentCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'comments';`;
    const postNames = postCols.map((r: any) => r.column_name);
    const commentNames = commentCols.map((r: any) => r.column_name);
    cached.hasPostNameCols = postNames.includes('first_name') && postNames.includes('last_name');
    cached.hasCommentNameCols = commentNames.includes('first_name') && commentNames.includes('last_name');
  } catch (_e) {
    // If introspection fails, assume legacy to avoid breaking writes.
    cached.hasPostNameCols = true;
    cached.hasCommentNameCols = true;
  } finally {
    cached.checked = true;
  }
  return cached;
}
