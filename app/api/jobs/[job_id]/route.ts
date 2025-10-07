import sql from "@/lib/neon";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ICreateJob } from "@/types/job";

// GET - Fetch a specific job
export async function GET(
  request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const { job_id } = await params;
    
    const jobs = await sql`
      SELECT 
        j.*,
        u.first_name as posted_by_name,
        u.image_url as posted_by_image
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.id = ${job_id} AND j.is_active = true;
    `;

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(jobs[0]);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// PUT - Update a job
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { job_id } = await params;
    const jobData: ICreateJob = await request.json();

    // Check if user owns the job
    const existingJob = await sql`
      SELECT * FROM jobs WHERE id = ${job_id} AND posted_by = ${user.id};
    `;

    if (existingJob.length === 0) {
      return NextResponse.json(
        { error: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    const result = await sql`
      UPDATE jobs SET 
        title = ${jobData.title},
        company = ${jobData.company},
        location = ${jobData.location},
        type = ${jobData.type},
        description = ${jobData.description},
        requirements = ${jobData.requirements || ''},
        salary_range = ${jobData.salary_range || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${job_id} AND posted_by = ${user.id}
      RETURNING *;
    `;

    return NextResponse.json({
      message: "Job updated successfully",
      job: result[0]
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a job
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { job_id } = await params;

    // Check if user owns the job
    const existingJob = await sql`
      SELECT * FROM jobs WHERE id = ${job_id} AND posted_by = ${user.id};
    `;

    if (existingJob.length === 0) {
      return NextResponse.json(
        { error: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    await sql`
      UPDATE jobs SET 
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${job_id} AND posted_by = ${user.id};
    `;

    return NextResponse.json({
      message: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}