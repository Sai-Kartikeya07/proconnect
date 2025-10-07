-- Create messages table for ProConnect messaging system
-- Users can only message if they are following each other

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    is_read BOOLEAN DEFAULT false,
    is_deleted_by_sender BOOLEAN DEFAULT false,
    is_deleted_by_receiver BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Prevent users from messaging themselves
    CONSTRAINT check_different_users CHECK (sender_id != receiver_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = false;

-- Create a composite index for efficient conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_both_ways ON messages(
    LEAST(sender_id, receiver_id), 
    GREATEST(sender_id, receiver_id), 
    created_at DESC
);

-- Create conversations table to track conversation metadata
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id VARCHAR(255) NOT NULL,
    user2_id VARCHAR(255) NOT NULL,
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user1_unread_count INTEGER DEFAULT 0,
    user2_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_user1 FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user2 FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_last_message FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    
    -- Ensure user1_id is always less than user2_id for consistency
    CONSTRAINT check_user_order CHECK (user1_id < user2_id),
    -- Prevent duplicate conversations
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Function to check if users are following each other
CREATE OR REPLACE FUNCTION can_users_message(sender_id VARCHAR(255), receiver_id VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if both users are following each other
    RETURN EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = sender_id AND following_id = receiver_id
    ) AND EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = receiver_id AND following_id = sender_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation metadata when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
    conv_user1_id VARCHAR(255);
    conv_user2_id VARCHAR(255);
    conv_id UUID;
BEGIN
    -- Determine user1 and user2 for conversation (user1_id < user2_id)
    IF NEW.sender_id < NEW.receiver_id THEN
        conv_user1_id := NEW.sender_id;
        conv_user2_id := NEW.receiver_id;
    ELSE
        conv_user1_id := NEW.receiver_id;
        conv_user2_id := NEW.sender_id;
    END IF;
    
    -- Insert or update conversation
    INSERT INTO conversations (user1_id, user2_id, last_message_id, last_message_at)
    VALUES (conv_user1_id, conv_user2_id, NEW.id, NEW.created_at)
    ON CONFLICT (user1_id, user2_id) 
    DO UPDATE SET 
        last_message_id = NEW.id,
        last_message_at = NEW.created_at,
        updated_at = NOW();
    
    -- Update unread count for receiver
    IF NEW.sender_id = conv_user1_id THEN
        UPDATE conversations 
        SET user2_unread_count = user2_unread_count + 1
        WHERE user1_id = conv_user1_id AND user2_id = conv_user2_id;
    ELSE
        UPDATE conversations 
        SET user1_unread_count = user1_unread_count + 1
        WHERE user1_id = conv_user1_id AND user2_id = conv_user2_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation on new message
CREATE TRIGGER trigger_update_conversation_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_new_message();

-- Function to mark messages as read and update unread count
CREATE OR REPLACE FUNCTION mark_messages_as_read(user_id VARCHAR(255), other_user_id VARCHAR(255))
RETURNS INTEGER AS $$
DECLARE
    messages_updated INTEGER;
    conv_user1_id VARCHAR(255);
    conv_user2_id VARCHAR(255);
BEGIN
    -- Update messages as read
    UPDATE messages 
    SET is_read = true, updated_at = NOW()
    WHERE receiver_id = user_id 
      AND sender_id = other_user_id 
      AND is_read = false;
    
    GET DIAGNOSTICS messages_updated = ROW_COUNT;
    
    -- Update conversation unread count
    IF user_id < other_user_id THEN
        conv_user1_id := user_id;
        conv_user2_id := other_user_id;
        UPDATE conversations 
        SET user1_unread_count = 0
        WHERE user1_id = conv_user1_id AND user2_id = conv_user2_id;
    ELSE
        conv_user1_id := other_user_id;
        conv_user2_id := user_id;
        UPDATE conversations 
        SET user2_unread_count = 0
        WHERE user1_id = conv_user1_id AND user2_id = conv_user2_id;
    END IF;
    
    RETURN messages_updated;
END;
$$ LANGUAGE plpgsql;

-- Add some sample data constraints and comments
COMMENT ON TABLE messages IS 'Messages between users who follow each other';
COMMENT ON TABLE conversations IS 'Conversation metadata and unread counts';
COMMENT ON FUNCTION can_users_message IS 'Check if two users can message each other (must be mutual followers)';
COMMENT ON FUNCTION mark_messages_as_read IS 'Mark messages as read and update unread counts';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON messages TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON conversations TO your_app_user;