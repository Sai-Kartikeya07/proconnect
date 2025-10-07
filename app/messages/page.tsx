import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/neon";
import AuthWrapper from "@/components/AuthWrapper";
import MessagesPageClient from "@/components/MessagesPageClient";

async function AuthenticatedMessagesPage() {
  const conversations = await sql`
    SELECT 
      c.*,
      CASE 
        WHEN c.user1_id = ${(await auth()).userId} THEN c.user2_id
        ELSE c.user1_id
      END as other_user_id,
      CASE 
        WHEN c.user1_id = ${(await auth()).userId} THEN u2.first_name
        ELSE u1.first_name
      END as other_user_name,
      CASE 
        WHEN c.user1_id = ${(await auth()).userId} THEN u2.image_url
        ELSE u1.image_url
      END as other_user_image,
      CASE 
        WHEN c.user1_id = ${(await auth()).userId} THEN c.user1_unread_count
        ELSE c.user2_unread_count
      END as unread_count,
      m.content as last_message_content,
      m.sender_id as last_message_sender_id
    FROM conversations c
    LEFT JOIN users u1 ON c.user1_id = u1.id
    LEFT JOIN users u2 ON c.user2_id = u2.id
    LEFT JOIN messages m ON c.last_message_id = m.id
    WHERE c.user1_id = ${(await auth()).userId} OR c.user2_id = ${(await auth()).userId}
    ORDER BY c.last_message_at DESC;
  `;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <MessagesPageClient initialConversations={conversations as any} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AuthWrapper>
      <AuthenticatedMessagesPage />
    </AuthWrapper>
  );
}