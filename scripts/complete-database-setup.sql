-- Enable RLS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_replies ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    mental_health_badges TEXT[],
    current_mood TEXT,
    looking_for TEXT,
    mental_health_journey TEXT,
    gender TEXT,
    age INTEGER,
    location TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
    profile_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_score DECIMAL(3,2) DEFAULT 0.0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'unmatched')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id_1, profile_id_2)
);

-- Create forum_threads table
CREATE TABLE forum_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE forum_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_matches_profile_id_1 ON matches(profile_id_1);
CREATE INDEX idx_matches_profile_id_2 ON matches(profile_id_2);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_forum_threads_category ON forum_threads(category);
CREATE INDEX idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX idx_forum_threads_created_at ON forum_threads(created_at);
CREATE INDEX idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT 
USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);

-- Conversation participants policies
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can add participants to conversations" ON conversation_participants FOR INSERT WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can send messages to their conversations" ON messages FOR INSERT 
WITH CHECK (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE 
USING (sender_id = auth.uid());

-- Matches policies
CREATE POLICY "Users can view their matches" ON matches FOR SELECT 
USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

CREATE POLICY "Users can create matches" ON matches FOR INSERT 
WITH CHECK (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

CREATE POLICY "Users can update their matches" ON matches FOR UPDATE 
USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

-- Forum threads policies
CREATE POLICY "Anyone can view forum threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own threads" ON forum_threads FOR UPDATE USING (auth.uid() = author_id);

-- Forum replies policies
CREATE POLICY "Anyone can view forum replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own replies" ON forum_replies FOR UPDATE USING (auth.uid() = author_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation updated_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_new_message 
AFTER INSERT ON messages 
FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Function to update thread reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE forum_threads 
        SET reply_count = reply_count + 1,
            updated_at = NOW()
        WHERE id = NEW.thread_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_threads 
        SET reply_count = reply_count - 1,
            updated_at = NOW()
        WHERE id = OLD.thread_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_thread_reply_count_trigger
AFTER INSERT OR DELETE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();
