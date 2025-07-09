-- Complete System Verification and Setup Script
-- This script ensures all tables exist with proper structure and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
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
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_id_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_score DECIMAL(3,2) DEFAULT 0.0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'unmatched')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id_1, profile_id_2)
);

-- Create forum_threads table
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_signals table for WebRTC
CREATE TABLE IF NOT EXISTS public.call_signals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    caller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    callee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate', 'end-call')),
    signal_data JSONB,
    call_type TEXT DEFAULT 'audio' CHECK (call_type IN ('audio', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_matches_profile_id_1 ON public.matches(profile_id_1);
CREATE INDEX IF NOT EXISTS idx_matches_profile_id_2 ON public.matches(profile_id_2);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON public.forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_caller_id ON public.call_signals(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_callee_id ON public.call_signals(callee_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles: Users can view all profiles, but only update their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Conversations: Users can only see conversations they participate in
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

-- Conversation participants: Users can see participants in their conversations
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can view conversation participants" ON public.conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp 
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can add conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can add conversation participants" ON public.conversation_participants
    FOR INSERT WITH CHECK (true);

-- Messages: Users can see messages in conversations they participate in
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- Matches: Users can see matches involving them
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
CREATE POLICY "Users can view their matches" ON public.matches
    FOR SELECT USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
CREATE POLICY "Users can create matches" ON public.matches
    FOR INSERT WITH CHECK (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;
CREATE POLICY "Users can update their matches" ON public.matches
    FOR UPDATE USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

-- Forum threads: Everyone can view, authenticated users can create
DROP POLICY IF EXISTS "Anyone can view forum threads" ON public.forum_threads;
CREATE POLICY "Anyone can view forum threads" ON public.forum_threads
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.forum_threads;
CREATE POLICY "Authenticated users can create threads" ON public.forum_threads
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their threads" ON public.forum_threads;
CREATE POLICY "Authors can update their threads" ON public.forum_threads
    FOR UPDATE USING (auth.uid() = author_id);

-- Forum replies: Everyone can view, authenticated users can create
DROP POLICY IF EXISTS "Anyone can view forum replies" ON public.forum_replies;
CREATE POLICY "Anyone can view forum replies" ON public.forum_replies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.forum_replies;
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Call signals: Users can see signals involving them
DROP POLICY IF EXISTS "Users can view their call signals" ON public.call_signals;
CREATE POLICY "Users can view their call signals" ON public.call_signals
    FOR SELECT USING (caller_id = auth.uid() OR callee_id = auth.uid());

DROP POLICY IF EXISTS "Users can create call signals" ON public.call_signals;
CREATE POLICY "Users can create call signals" ON public.call_signals
    FOR INSERT WITH CHECK (caller_id = auth.uid());

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update conversation timestamp when message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for conversation timestamp updates
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- Create function to update thread reply count
CREATE OR REPLACE FUNCTION public.update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_threads 
        SET reply_count = reply_count + 1,
            updated_at = NOW()
        WHERE id = NEW.thread_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_threads 
        SET reply_count = GREATEST(reply_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.thread_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for reply count updates
DROP TRIGGER IF EXISTS on_reply_created ON public.forum_replies;
CREATE TRIGGER on_reply_created
    AFTER INSERT ON public.forum_replies
    FOR EACH ROW EXECUTE FUNCTION public.update_thread_reply_count();

DROP TRIGGER IF EXISTS on_reply_deleted ON public.forum_replies;
CREATE TRIGGER on_reply_deleted
    AFTER DELETE ON public.forum_replies
    FOR EACH ROW EXECUTE FUNCTION public.update_thread_reply_count();

-- Insert some sample data for testing
INSERT INTO public.profiles (id, username, full_name, bio, mental_health_badges, current_mood, gender, age, location)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'sarah_j', 'Sarah Johnson', 'Mental health advocate and coffee lover ☕', ARRAY['Anxiety Warrior', 'Mental Health Advocate'], 'Feeling hopeful today', 'Female', 28, 'San Francisco, CA'),
    ('22222222-2222-2222-2222-222222222222', 'mike_chen', 'Mike Chen', 'Photographer and mindfulness practitioner 📸', ARRAY['Depression Fighter', 'Mindfulness Practitioner'], 'Peaceful and centered', 'Male', 32, 'Los Angeles, CA'),
    ('33333333-3333-3333-3333-333333333333', 'alex_rivera', 'Alex Rivera', 'Artist expressing emotions through creativity 🎨', ARRAY['Bipolar Warrior', 'Art Therapy'], 'Creative and inspired', 'Non-binary', 25, 'New York, NY')
ON CONFLICT (id) DO NOTHING;

-- Insert sample forum threads
INSERT INTO public.forum_threads (id, title, content, category, author_id, author_name, is_pinned, view_count, reply_count)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Welcome to Lumos Community!', 'Welcome to our supportive community! This is a safe space to share, learn, and grow together on our mental health journeys.', 'general', '11111111-1111-1111-1111-111111111111', 'Sarah Johnson', true, 156, 23),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Coping with social anxiety at work', 'I''ve been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?', 'anxiety', '22222222-2222-2222-2222-222222222222', 'Mike Chen', false, 45, 8),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Morning routines that help with depression', 'What morning routines have helped you manage depression? I''m looking for simple, achievable habits to start my day better.', 'depression', '33333333-3333-3333-3333-333333333333', 'Alex Rivera', false, 67, 12)
ON CONFLICT (id) DO NOTHING;

-- Insert sample matches
INSERT INTO public.matches (profile_id_1, profile_id_2, match_score, status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 0.85, 'accepted'),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 0.78, 'pending'),
    ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 0.92, 'accepted')
ON CONFLICT (profile_id_1, profile_id_2) DO NOTHING;

-- Create a sample conversation
INSERT INTO public.conversations (id)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (id) DO NOTHING;

-- Add participants to the conversation
INSERT INTO public.conversation_participants (conversation_id, user_id)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Add sample messages
INSERT INTO public.messages (conversation_id, sender_id, content, message_type)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Hey! Great to match with you 😊', 'text'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Hi there! Nice to meet you too!', 'text'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'How has your day been? I''d love to get to know you better!', 'text')
ON CONFLICT (id) DO NOTHING;

-- Verification queries to check everything is working
SELECT 'Profiles count:' as check_type, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Conversations count:', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'Messages count:', COUNT(*) FROM public.messages
UNION ALL
SELECT 'Matches count:', COUNT(*) FROM public.matches
UNION ALL
SELECT 'Forum threads count:', COUNT(*) FROM public.forum_threads;

-- Show table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'conversations', 'messages', 'matches', 'forum_threads')
ORDER BY table_name, ordinal_position;
