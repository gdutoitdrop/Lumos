-- Create a simple messaging table without complex RLS policies
CREATE TABLE IF NOT EXISTS simple_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS simple_messages_sender_receiver_idx ON simple_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS simple_messages_created_at_idx ON simple_messages(created_at);

-- Simple RLS policies that won't cause recursion
ALTER TABLE simple_messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages they sent or received
CREATE POLICY "Users can view their messages" ON simple_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages" ON simple_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
