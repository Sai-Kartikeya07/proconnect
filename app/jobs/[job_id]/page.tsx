import { notFound } from "next/navigation";
import sql from "@/lib/neon";
import AuthWrapper from "@/components/AuthWrapper";
import JobDetailsClient from "@/components/JobDetailsClient";

interface JobPageParams { job_id: string }

// Using a loose any on the boundary to avoid Next.js route type inference issues seen in build.
async function AuthenticatedJobDetailsPage(props: any) {
  const { job_id } = (props.params as JobPageParams);

  // Get job details with user information
  const jobResult = await sql`
    SELECT 
      j.*,
      u.first_name as posted_by_name,
      u.image_url as posted_by_image
    FROM jobs j
    LEFT JOIN users u ON j.posted_by = u.id
    WHERE j.id = ${job_id} AND j.is_active = true;
  `;

  if (jobResult.length === 0) {
    notFound();
  }

  const job = jobResult[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <JobDetailsClient job={job as any} />
    </div>
  );
}

export default function JobDetailsPage(props: any) {
  const { params } = props;
  return (
    <AuthWrapper>
      <AuthenticatedJobDetailsPage params={params} />
    </AuthWrapper>
  );
}