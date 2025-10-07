import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/neon";

// GET /api/education/[id] - Get specific education record
// In Next.js 15 Route Handlers, the second argument should be typed as
// { params: { <segments> } } but not a separate structural type if it conflicts.
// We keep it simple and allow any object shape while extracting 'id'.
export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = context.params;
    const education = await sql`
      SELECT * FROM education 
      WHERE id = ${id} AND user_id = ${userId};
    `;

    if (education.length === 0) {
      return NextResponse.json(
        { error: "Education record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ education: education[0] });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education record" },
      { status: 500 }
    );
  }
}

// PUT /api/education/[id] - Update education record
export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = context.params;
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

    const updatedEducation = await sql`
      UPDATE education 
      SET 
        institution = ${institution},
        degree = ${degree},
        field_of_study = ${field_of_study || null},
        start_date = ${start_date || null},
        end_date = ${finalEndDate},
        is_current = ${is_current},
        grade = ${grade || null},
        description = ${description || null},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *;
    `;

    if (updatedEducation.length === 0) {
      return NextResponse.json(
        { error: "Education record not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      education: updatedEducation[0],
      success: true 
    });
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { error: "Failed to update education record" },
      { status: 500 }
    );
  }
}

// DELETE /api/education/[id] - Delete education record
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = context.params;
    const deletedEducation = await sql`
      DELETE FROM education 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *;
    `;

    if (deletedEducation.length === 0) {
      return NextResponse.json(
        { error: "Education record not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { error: "Failed to delete education record" },
      { status: 500 }
    );
  }
}