-- Drop all existing messaging and calling tables
DROP TABLE IF EXISTS call_signals CASCADE;
DROP TABLE IF EXISTS user_messages CASCADE;
DROP TABLE IF EXISTS user_conversations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_type VARCHAR(20) DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group'))
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'call_start', 'call_end')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_by JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create call_signals table for WebRTC signaling
CREATE TABLE call_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id VARCHAR(255) NOT NULL,
    signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate', 'call-start', 'call-end', 'call-accept', 'call-reject')),
    from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('audio', 'video')),
    signal_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create indexes for performance
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_call_signals_call_id ON call_signals(call_id);
CREATE INDEX idx_call_signals_to_user ON call_signals(to_user_id);
CREATE INDEX idx_call_signals_from_user ON call_signals(from_user_id);
CREATE INDEX idx_call_signals_created_at ON call_signals(created_at DESC);

-- Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp when message is added
CREATE TRIGGER update_conversation_timestamp_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Create function to clean up expired call signals
CREATE OR REPLACE FUNCTION cleanup_expired_call_signals()
RETURNS void AS $$
BEGIN
    DELETE FROM call_signals WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Disable RLS for simplicity (enable in production with proper policies)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON conversations TO authenticated, anon;
GRANT ALL ON conversation_participants TO authenticated, anon;
GRANT ALL ON messages TO authenticated, anon;
GRANT ALL ON call_signals TO authenticated, anon;

-- Create test users if they don't exist (for development)
DO $$
BEGIN
    -- Insert test user 1
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        'testuser1@example.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Test User One", "username": "testuser1"}'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Insert test user 2
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
    VALUES (
        '22222222-2222-2222-2222-222222222222',
        'testuser2@example.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Test User Two", "username": "testuser2"}'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not create test users: %', SQLERRM;
END $$;

-- Create profiles for test users
INSERT INTO profiles (
    id, 
    username, 
    full_name, 
    bio, 
    created_at, 
    updated_at
)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'testuser1',
        'Test User One',
        'This is a test user for messaging and calling',
        NOW(),
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'testuser2',
        'Test User Two',
        'Another test user for messaging and calling',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- Create a test conversation
DO $$
DECLARE
    conv_id UUID;
BEGIN
    -- Insert test conversation
    INSERT INTO conversations (conversation_type)
    VALUES ('direct')
    RETURNING id INTO conv_id;

    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
        (conv_id, '11111111-1111-1111-1111-111111111111'),
        (conv_id, '22222222-2222-2222-2222-222222222222');

    -- Add a welcome message
    INSERT INTO messages (conversation_id, sender_id, content, message_type)
    VALUES (conv_id, '22222222-2222-2222-2222-222222222222', 'Welcome to the test conversation! You can now send messages, make voice calls, and video calls.', 'text');

    RAISE NOTICE 'Test conversation created with ID: %', conv_id;
END $$;
