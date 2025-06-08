-- Complete messaging system fix
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- More permissive RLS policies for testing
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id 
      AND (user_id = auth.uid() OR profile_id IN (
        SELECT id FROM profiles WHERE auth_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp2 
      WHERE cp2.conversation_id = conversation_participants.conversation_id 
      AND (cp2.user_id = auth.uid() OR cp2.profile_id IN (
        SELECT id FROM profiles WHERE auth_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can add participants to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id 
      AND (user_id = auth.uid() OR profile_id IN (
        SELECT id FROM profiles WHERE auth_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (sender_id = auth.uid() OR profile_id IN (
      SELECT id FROM profiles WHERE auth_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid() OR 
    profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_profile ON conversation_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_profile ON messages(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create some sample conversations for testing
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    profile1_id UUID;
    profile2_id UUID;
    conv_id UUID;
BEGIN
    -- Get first two users and their profiles
    SELECT id INTO user1_id FROM auth.users LIMIT 1;
    SELECT id INTO user2_id FROM auth.users OFFSET 1 LIMIT 1;
    
    SELECT id INTO profile1_id FROM profiles LIMIT 1;
    SELECT id INTO profile2_id FROM profiles OFFSET 1 LIMIT 1;
    
    -- Only create if we have users
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- Create a sample conversation
        INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conv_id;
        
        -- Add participants
        INSERT INTO conversation_participants (conversation_id, user_id, profile_id) VALUES
        (conv_id, user1_id, profile1_id),
        (conv_id, user2_id, profile2_id);
        
        -- Add some sample messages
        INSERT INTO messages (conversation_id, sender_id, profile_id, content) VALUES
        (conv_id, user1_id, profile1_id, 'Hi! I saw we matched and wanted to say hello.'),
        (conv_id, user2_id, profile2_id, 'Hello! Nice to meet you. How are you doing today?'),
        (conv_id, user1_id, profile1_id, 'I''m doing well, thanks for asking! I love your profile.');
    END IF;
END $$;
