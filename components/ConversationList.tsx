"use client";

import React from "react";
import { IConversation } from "@/types/message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ReactTimeago from "react-timeago";
import { MessageCircle } from "lucide-react";

interface ConversationListProps {
  conversations: IConversation[];
  onConversationSelect: (conversation: IConversation) => void;
  selectedConversation: IConversation | null;
}

export default function ConversationList({ 
  conversations, 
  onConversationSelect, 
  selectedConversation 
}: ConversationListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#3f3f46]">
        <h2 className="text-xl font-semibold text-white">Conversations</h2>
        <p className="text-gray-400 text-sm mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-[#27272a] ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-[#27272a] border border-blue-500/30' 
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={conversation.other_user_image || undefined} />
                    <AvatarFallback>
                      {conversation.other_user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">
                        {conversation.other_user_name}
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          <ReactTimeago date={new Date(conversation.last_message_at)} />
                        </span>
                      </div>
                    </div>
                    
                    {conversation.last_message_content && (
                      <p className="text-gray-400 text-sm truncate mt-1">
                        {conversation.last_message_sender_id === conversation.other_user_id 
                          ? '' 
                          : 'You: '
                        }
                        {conversation.last_message_content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}