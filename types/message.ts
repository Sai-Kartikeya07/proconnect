export interface IMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  is_deleted_by_sender: boolean;
  is_deleted_by_receiver: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data from users table
  sender_name?: string;
  sender_image?: string;
  receiver_name?: string;
  receiver_image?: string;
}

export interface ICreateMessage {
  receiver_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
}

export interface IConversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_id?: string;
  last_message_at: string;
  user1_unread_count: number;
  user2_unread_count: number;
  created_at: string;
  updated_at: string;
  
  // Joined data
  other_user_id?: string;
  other_user_name?: string;
  other_user_image?: string;
  last_message_content?: string;
  last_message_sender_id?: string;
  unread_count?: number;
}

export interface IConversationWithMessages extends IConversation {
  messages: IMessage[];
}

export type MessageType = 'text' | 'image' | 'file';