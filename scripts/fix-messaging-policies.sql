-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their participations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Disable RLS temporarily to avoid recursion issues
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Conversations: Users can see and create conversations
CREATE POLICY "conversations_select" ON conversations
    FOR SELECT USING (true);

CREATE POLICY "conversations_insert" ON conversations
    FOR INSERT WITH CHECK (true);

-- Conversation participants: Users can see their own participations and insert new ones
CREATE POLICY "participants_select" ON conversation_participants
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "participants_insert" ON conversation_participants
    FOR INSERT WITH CHECK (true);

-- Messages: Users can see and send messages
CREATE POLICY "messages_select" ON messages
    FOR SELECT USING (true);

CREATE POLICY "messages_insert" ON messages
    FOR INSERT WITH CHECK (profile_id = auth.uid());
