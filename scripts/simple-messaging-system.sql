-- Drop existing tables to start fresh
DROP TABLE IF EXISTS call_signals CASCADE;
DROP TABLE IF EXISTS user_messages CASCADE;
DROP TABLE IF EXISTS user_conversations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create simple conversations table
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
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_type VARCHAR(20) DEFAULT 'text'
);

-- Create conversation participants table
CREATE TABLE conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- Disable RLS for simplicity
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON conversations TO authenticated, anon;
GRANT ALL ON messages TO authenticated, anon;
GRANT ALL ON conversation_participants TO authenticated, anon;

-- Create test data
DO $$
DECLARE
    test_conv_id UUID;
BEGIN
    -- Create a test conversation
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO test_conv_id;
    
    -- Add test participants (using existing user IDs if they exist)
    INSERT INTO conversation_participants (conversation_id, user_id)
    SELECT test_conv_id, id FROM auth.users LIMIT 2
    ON CONFLICT DO NOTHING;
    
    -- Add a welcome message
    INSERT INTO messages (conversation_id, sender_id, content)
    SELECT test_conv_id, id, 'Welcome to the messaging system! This is a test message.'
    FROM auth.users LIMIT 1;
    
    RAISE NOTICE 'Test conversation created with ID: %', test_conv_id;
END $$;
