-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- Create simpler, non-recursive policies for conversation_participants
CREATE POLICY "Users can view their own participations" ON conversation_participants
FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can create participations" ON conversation_participants
FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Create simpler policy for messages
CREATE POLICY "Users can view messages in conversations they participate in" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in conversations they participate in" ON messages
FOR INSERT WITH CHECK (
  profile_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.profile_id = auth.uid()
  )
);

-- Create policy for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (true);
