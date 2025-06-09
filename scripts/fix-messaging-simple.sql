-- Drop existing tables and recreate them simply
DROP TABLE IF EXISTS user_messages CASCADE;
DROP TABLE IF EXISTS user_conversations CASCADE;

-- Create simple conversations table
CREATE TABLE user_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID NOT NULL,
    participant_2 UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simple messages table
CREATE TABLE user_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES user_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_conversations_participants ON user_conversations(participant_1, participant_2);
CREATE INDEX idx_messages_conversation ON user_messages(conversation_id);
CREATE INDEX idx_messages_sender ON user_messages(sender_id);

-- Disable RLS completely for now
ALTER TABLE user_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL ON user_conversations TO authenticated;
GRANT ALL ON user_messages TO authenticated;
GRANT ALL ON user_conversations TO anon;
GRANT ALL ON user_messages TO anon;

-- Insert a test conversation for debugging
INSERT INTO user_conversations (id, participant_1, participant_2) 
VALUES ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Insert a test message
INSERT INTO user_messages (conversation_id, sender_id, receiver_id, message_text)
VALUES ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Hello! This is a test message.');
