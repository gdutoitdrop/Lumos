-- Drop and recreate the messaging tables with the correct schema
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
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (conversation_id, profile_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id AND profile_id IN (
        SELECT id FROM profiles WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE auth_id = auth.uid() AND id IN (
        SELECT profile_id FROM conversation_participants 
        WHERE conversation_id = conversation_participants.conversation_id
      )
    )
  );

CREATE POLICY "Users can add participants to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id AND profile_id IN (
        SELECT id FROM profiles WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE auth_id = auth.uid() AND id = messages.profile_id
    ) AND
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id AND profile_id = messages.profile_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_profile ON conversation_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_profile ON messages(profile_id);
