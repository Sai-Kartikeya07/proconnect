import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/neon";

// GET /api/messages - Get all conversations for the current user
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations for the user with last message details
    // Ensure a conversation row exists for every mutual follow pair even if no messages yet
    await sql`
      WITH mutuals AS (
        SELECT u.id AS other_id
        FROM users u
        JOIN follows f1 ON f1.following_id = u.id AND f1.follower_id = ${userId}
        JOIN follows f2 ON f2.follower_id = u.id AND f2.following_id = ${userId}
        WHERE u.id != ${userId}
      )
      INSERT INTO conversations (user1_id, user2_id)
      SELECT DISTINCT LEAST(${userId}, m.other_id), GREATEST(${userId}, m.other_id)
      FROM mutuals m
      WHERE NOT EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.user1_id = LEAST(${userId}, m.other_id)
          AND c.user2_id = GREATEST(${userId}, m.other_id)
      )
      ON CONFLICT DO NOTHING;
    `;

    const conversations = await sql`
      SELECT 
        c.*,
        CASE 
          WHEN c.user1_id = ${userId} THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        -- Robust name fallback: first_name -> last_name -> email prefix -> 'User'
        CASE 
          WHEN c.user1_id = ${userId} THEN
            COALESCE(NULLIF(TRIM(u2.first_name), ''), NULLIF(TRIM(u2.last_name), ''), split_part(u2.email, '@', 1), 'User')
          ELSE
            COALESCE(NULLIF(TRIM(u1.first_name), ''), NULLIF(TRIM(u1.last_name), ''), split_part(u1.email, '@', 1), 'User')
        END as other_user_name,
        CASE 
          WHEN c.user1_id = ${userId} THEN u2.image_url
          ELSE u1.image_url
        END as other_user_image,
        CASE 
          WHEN c.user1_id = ${userId} THEN c.user1_unread_count
          ELSE c.user2_unread_count
        END as unread_count,
        m.content as last_message_content,
        m.sender_id as last_message_sender_id
      FROM conversations c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
      ORDER BY c.last_message_at DESC;
    `;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiver_id, content, message_type = 'text' } = await request.json();

    if (!receiver_id || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    // Check if users can message each other (both must be following)
    const canMessage = await sql`
      SELECT (
        EXISTS (
          SELECT 1 FROM follows f1 
          WHERE f1.follower_id = ${userId} AND f1.following_id = ${receiver_id}
        ) AND EXISTS (
          SELECT 1 FROM follows f2 
          WHERE f2.follower_id = ${receiver_id} AND f2.following_id = ${userId}
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
      VALUES (${userId}, ${receiver_id}, ${content}, ${message_type})
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