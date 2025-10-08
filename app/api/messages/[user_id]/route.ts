import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/neon";

// GET /api/messages/[user_id] - Get conversation with a specific user
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { user_id } = context.params;

    // Check if users can message each other
    const canMessage = await sql`
      SELECT (
        EXISTS (
          SELECT 1 FROM follows f1 
          WHERE f1.follower_id = ${userId} AND f1.following_id = ${user_id}
        ) AND EXISTS (
          SELECT 1 FROM follows f2 
          WHERE f2.follower_id = ${user_id} AND f2.following_id = ${userId}
        )
      ) as can_message;
    `;

    if (!canMessage[0]?.can_message) {
      return NextResponse.json(
        { error: "You can only message users you mutually follow" },
        { status: 403 }
      );
    }

    // Get messages between the two users
    const messages = await sql`
      SELECT 
        m.*,
        u1.first_name as sender_name,
        u1.image_url as sender_image,
        u2.first_name as receiver_name,
        u2.image_url as receiver_image
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = ${userId} AND m.receiver_id = ${user_id})
         OR (m.sender_id = ${user_id} AND m.receiver_id = ${userId})
      AND m.is_deleted_by_sender = false 
      AND m.is_deleted_by_receiver = false
      ORDER BY m.created_at ASC;
    `;

    // Mark messages as read
    await sql`
      SELECT mark_messages_as_read(${userId}, ${user_id});
    `;

    // Get other user's information
    const otherUser = await sql`
      SELECT 
        id, 
        COALESCE(NULLIF(TRIM(first_name), ''), NULLIF(TRIM(last_name), ''), split_part(email, '@', 1), 'User') AS first_name,
        image_url
      FROM users 
      WHERE id = ${user_id};
    `;

    return NextResponse.json({ 
      messages,
      other_user: otherUser[0] || null
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// POST /api/messages/[user_id] - Send message to specific user
export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { user_id } = context.params;
    const { content, message_type = 'text' } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check if users can message each other
    const canMessage = await sql`
      SELECT (
        EXISTS (
          SELECT 1 FROM follows f1 
          WHERE f1.follower_id = ${userId} AND f1.following_id = ${user_id}
        ) AND EXISTS (
          SELECT 1 FROM follows f2 
          WHERE f2.follower_id = ${user_id} AND f2.following_id = ${userId}
        )
      ) as can_message;
    `;

    if (!canMessage[0]?.can_message) {
      return NextResponse.json(
        { error: "You can only message users you mutually follow" },
        { status: 403 }
      );
    }

    // Create the message
    const newMessage = await sql`
      INSERT INTO messages (sender_id, receiver_id, content, message_type)
      VALUES (${userId}, ${user_id}, ${content}, ${message_type})
      RETURNING *;
    `;

    // Get the complete message with user information
    const messageWithUsers = await sql`
      SELECT 
        m.*,
        u1.first_name as sender_name,
        u1.image_url as sender_image,
        u2.first_name as receiver_name,
        u2.image_url as receiver_image
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.id = ${newMessage[0].id};
    `;

    return NextResponse.json({ 
      message: messageWithUsers[0],
      success: true 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}