import sql from "@/lib/neon";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const email = user.emailAddresses?.[0]?.emailAddress || null;
    await sql`
      INSERT INTO users (id, first_name, last_name, email, image_url)
      VALUES (${user.id}, ${user.firstName}, ${user.lastName}, ${email}, ${user.imageUrl})
      ON CONFLICT (id) DO NOTHING;
    `;
    return NextResponse.json({ message: "User synced to DB" });
  } catch {
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
