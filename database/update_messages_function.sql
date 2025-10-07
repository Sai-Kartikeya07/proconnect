-- Update the can_users_message function to use correct column names
-- Run this if you already created the messages table with the old function

DROP FUNCTION IF EXISTS can_users_message(VARCHAR(255), VARCHAR(255));

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