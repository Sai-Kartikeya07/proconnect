"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IConversation, IMessage } from "@/types/message";
import MessageBubble from "./MessageBubble";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import ReactTimeago from "react-timeago";

interface ConversationViewProps {
  conversation: IConversation;
  onBack: () => void;
  onConversationUpdate: (conversation: IConversation) => void;
}

export default function ConversationView({ 
  conversation, 
  onBack, 
  onConversationUpdate 
}: ConversationViewProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Derive a robust display name fallback (mirrors API fallback)
  const displayName = useMemo(() => {
    return conversation.other_user_name && conversation.other_user_name.trim().length > 0
      ? conversation.other_user_name
      : 'User';
  }, [conversation.other_user_name]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages/${conversation.other_user_id}`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setMessages(data.messages);
          }
          // If conversation object lacks name but API returned other_user, we could update parent (future enhancement)
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [conversation.other_user_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/messages/${conversation.other_user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          message_type: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage("");
        
        // Update conversation with new message
        const updatedConversation = {
          ...conversation,
          last_message_content: data.message.content,
          last_message_sender_id: data.message.sender_id,
          last_message_at: data.message.created_at,
          unread_count: 0
        };
        onConversationUpdate(updatedConversation);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#3f3f46] flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.other_user_image || undefined} />
          <AvatarFallback>
            {conversation.other_user_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="text-lg font-semibold text-white">
            {displayName}
          </h2>
          <p className="text-sm text-gray-400">
            Last seen <ReactTimeago date={new Date(conversation.last_message_at)} />
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 mb-2">No messages yet</p>
              <p className="text-gray-500 text-sm">Send the first message!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[#3f3f46]">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}