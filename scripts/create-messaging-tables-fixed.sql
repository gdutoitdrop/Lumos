-- Drop existing tables to start fresh
DROP TABLE IF EXISTS user_messages CASCADE;
DROP TABLE IF EXISTS user_conversations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    receiver_id UUID,
    content TEXT NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    message_type VARCHAR(20) DEFAULT 'text'
);

-- Create conversation participants table
CREATE TABLE conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- Disable RLS for now to avoid permission issues
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON conversations TO authenticated, anon;
GRANT ALL ON messages TO authenticated, anon;
GRANT ALL ON conversation_participants TO authenticated, anon;

-- Insert sample data for testing
DO $$
DECLARE
    test_conv_id UUID;
    user1_id UUID;
    user2_id UUID;
BEGIN
    -- Get first two users from auth.users
    SELECT id INTO user1_id FROM auth.users LIMIT 1;
    SELECT id INTO user2_id FROM auth.users OFFSET 1 LIMIT 1;
    
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- Create a test conversation
        INSERT INTO conversations DEFAULT VALUES RETURNING id INTO test_conv_id;
        
        -- Add participants
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES 
            (test_conv_id, user1_id),
            (test_conv_id, user2_id);
        
        -- Add sample messages
        INSERT INTO messages (conversation_id, sender_id, receiver_id, content, message_text) VALUES 
            (test_conv_id, user1_id, user2_id, 'Hello! How are you doing today?', 'Hello! How are you doing today?'),
            (test_conv_id, user2_id, user1_id, 'Hi there! I''m doing great, thanks for asking!', 'Hi there! I''m doing great, thanks for asking!'),
            (test_conv_id, user1_id, user2_id, 'That''s wonderful to hear! What have you been up to?', 'That''s wonderful to hear! What have you been up to?');
        
        RAISE NOTICE 'Test conversation created with ID: %', test_conv_id;
    ELSE
        RAISE NOTICE 'Not enough users found to create test conversation';
    END IF;
END $$;
