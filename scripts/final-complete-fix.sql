-- Final complete fix - drop everything and recreate with simple structure
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;

-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_threads table
CREATE TABLE forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author_id UUID NOT NULL,
  author_name VARCHAR(255),
  is_pinned BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for testing
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_forum_threads_category ON forum_threads(category);
CREATE INDEX idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);

-- Insert sample data for testing
DO $$
DECLARE
    sample_user1 UUID := '11111111-1111-1111-1111-111111111111';
    sample_user2 UUID := '22222222-2222-2222-2222-222222222222';
    conv_id UUID;
    thread_id UUID;
BEGIN
    -- Create sample conversation
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conv_id;
    
    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id) VALUES
    (conv_id, sample_user1),
    (conv_id, sample_user2);
    
    -- Add sample messages
    INSERT INTO messages (conversation_id, sender_id, content) VALUES
    (conv_id, sample_user1, 'Hi! How are you doing today?'),
    (conv_id, sample_user2, 'I''m doing well, thanks for asking!');
    
    -- Create sample forum threads
    INSERT INTO forum_threads (title, content, category, author_id, author_name) VALUES
    ('Welcome to Mental Health Support', 'This is a safe space to share your journey and connect with others.', 'mental-health', sample_user1, 'Sarah Chen'),
    ('Anxiety Management Tips', 'What techniques have helped you manage anxiety? Let''s share our experiences.', 'anxiety', sample_user2, 'Alex Rivera'),
    ('Daily Meditation Practice', 'Starting a daily meditation routine - looking for accountability partners!', 'mindfulness', sample_user1, 'Emma Thompson')
    RETURNING id INTO thread_id;
    
    -- Add sample replies
    INSERT INTO forum_replies (thread_id, author_id, author_name, content) VALUES
    (thread_id, sample_user2, 'Alex Rivera', 'Thank you for creating this space! I''m excited to connect with everyone.');
END $$;

-- Grant permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON forum_threads TO authenticated;
GRANT ALL ON forum_replies TO authenticated;

GRANT ALL ON conversations TO anon;
GRANT ALL ON conversation_participants TO anon;
GRANT ALL ON messages TO anon;
GRANT ALL ON forum_threads TO anon;
GRANT ALL ON forum_replies TO anon;
