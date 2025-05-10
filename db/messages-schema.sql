-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_profile_id ON messages(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read messages in their conversations"
ON messages FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
TO authenticated
USING (profile_id = auth.uid());
