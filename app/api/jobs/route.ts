import sql from "@/lib/neon";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ICreateJob } from "@/types/job";

// GET - Fetch all jobs
export async function GET() {
  try {
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
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST - Create a new job
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const jobData: ICreateJob = await request.json();
    
    // Validate required fields
    if (!jobData.title || !jobData.company || !jobData.location || !jobData.type || !jobData.description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO jobs (
        title, company, location, type, description, requirements, 
        salary_range, posted_by, created_at, updated_at, is_active
      )
      VALUES (
        ${jobData.title}, ${jobData.company}, ${jobData.location}, 
        ${jobData.type}, ${jobData.description}, ${jobData.requirements || ''},
        ${jobData.salary_range || null}, ${user.id}, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
      )
      RETURNING *;
    `;

    return NextResponse.json({
      message: "Job created successfully",
      job: result[0]
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}