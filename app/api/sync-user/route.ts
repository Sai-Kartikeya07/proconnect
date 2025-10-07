import sql from "@/lib/neon";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmailNotification, renderWelcomeEmail } from "@/lib/email";

export async function POST() {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const email = user.emailAddresses?.[0]?.emailAddress || null;
    const inserted = await sql`
      INSERT INTO users (id, first_name, last_name, email, image_url)
      VALUES (${user.id}, ${user.firstName}, ${user.lastName}, ${email}, ${user.imageUrl})
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `;

    if (inserted.length > 0 && email) {
      // Fire-and-forget welcome email
      sendEmailNotification({
        to: email,
        subject: "Welcome to ProConnect",
        html: renderWelcomeEmail(user.firstName || ""),
      }).catch(err => console.warn("Failed to send welcome email", err));
    }
    return NextResponse.json({ message: "User synced to DB", isNew: inserted.length > 0 });
  } catch {
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
