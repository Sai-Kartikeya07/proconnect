import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/neon";

// GET /api/education - Get education records for current user
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const education = await sql`
      SELECT * FROM education 
      WHERE user_id = ${userId}
      ORDER BY is_current DESC, start_date DESC;
    `;

    return NextResponse.json({ education });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}

// POST /api/education - Add new education record
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      institution,
      degree,
      field_of_study,
      start_date,
      end_date,
      is_current = false,
      grade,
      description
    } = await request.json();

    if (!institution || !degree) {
      return NextResponse.json(
        { error: "Institution and degree are required" },
        { status: 400 }
      );
    }

    // If this is current education, set end_date to null
    const finalEndDate = is_current ? null : end_date;

    const newEducation = await sql`
      INSERT INTO education (
        user_id, institution, degree, field_of_study, 
        start_date, end_date, is_current, grade, description
      )
      VALUES (
        ${userId}, ${institution}, ${degree}, ${field_of_study || null},
        ${start_date || null}, ${finalEndDate}, ${is_current}, 
        ${grade || null}, ${description || null}
      )
      RETURNING *;
    `;

    return NextResponse.json({ 
      education: newEducation[0],
      success: true 
    });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { error: "Failed to create education record" },
      { status: 500 }
    );
  }
}