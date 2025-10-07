"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { IConversation } from "@/types/message";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";
import { MessageCircle, Users } from "lucide-react";

interface MessagesPageClientProps {
  initialConversations: IConversation[];
}

export default function MessagesPageClient({ initialConversations }: MessagesPageClientProps) {
  const { user } = useUser();
  const [conversations, setConversations] = useState<IConversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

  const handleConversationSelect = (conversation: IConversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const updateConversation = (updatedConversation: IConversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <MessageCircle className="h-10 w-10 text-blue-500" />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
            <p className="text-gray-400 text-lg">Connect with people you follow</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>Only mutual followers can message</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-[#18181b] rounded-xl border border-[#3f3f46] overflow-hidden min-h-[600px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className={`lg:col-span-1 border-r border-[#3f3f46] ${selectedConversation ? 'hidden lg:block' : ''}`}>
            <ConversationList 
              conversations={conversations}
              onConversationSelect={handleConversationSelect}
              selectedConversation={selectedConversation}
            />
          </div>

          {/* Conversation View */}
          <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
            {selectedConversation ? (
              <ConversationView 
                conversation={selectedConversation}
                onBack={handleBackToList}
                onConversationUpdate={updateConversation}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-400">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {conversations.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle className="h-20 w-20 text-gray-500 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-white mb-3">
            No conversations yet
          </h3>
          <p className="text-gray-400 mb-6 text-lg max-w-md mx-auto">
            Start messaging by visiting someone's profile and sending them a message. 
            Remember, you can only message people you mutually follow.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base h-12"
          >
            <Users className="h-5 w-5 mr-3" />
            Find People to Follow
          </Button>
        </div>
      )}
    </div>
  );
}