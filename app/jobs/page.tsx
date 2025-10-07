import AuthWrapper from "@/components/AuthWrapper";
import JobsPageClient from "@/components/JobsPageClient";
import sql from "@/lib/neon";

export const revalidate = 0;

export default async function JobsPage() {
  return (
    <AuthWrapper>
      <AuthenticatedJobsPage />
    </AuthWrapper>
  );
}

async function AuthenticatedJobsPage() {
  const jobs = await sql`
    SELECT 
      j.*,
      u.first_name as posted_by_name,
      u.image_url as posted_by_image
    FROM jobs j
    LEFT JOIN users u ON j.posted_by = u.id
    WHERE j.is_active = true
    ORDER BY j.created_at DESC;
  `;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <JobsPageClient initialJobs={jobs as any} />
    </div>
  );
}