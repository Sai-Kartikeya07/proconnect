import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { job_id: string } }
): Promise<Metadata> {
  const { job_id } = params;
  
  try {
    // This would typically fetch the job data for SEO metadata
    return {
      title: `Job Details - ProConnect`,
      description: `View job details and apply for this position on ProConnect`,
    };
  } catch {
    return {
      title: 'Job Not Found - ProConnect',
      description: 'The requested job posting could not be found.',
    };
  }
}