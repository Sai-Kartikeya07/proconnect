"use client";

import React from "react";
import { IMessage } from "@/types/message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactTimeago from "react-timeago";

interface MessageBubbleProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={message.sender_image || undefined} />
            <AvatarFallback>
              {message.sender_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 rounded-2xl max-w-full break-words ${
              isOwnMessage
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-[#27272a] text-white rounded-bl-sm'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          
          <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <ReactTimeago date={new Date(message.created_at)} />
            {isOwnMessage && (
              <span className={message.is_read ? 'text-blue-400' : 'text-gray-500'}>
                {message.is_read ? 'Read' : 'Sent'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}