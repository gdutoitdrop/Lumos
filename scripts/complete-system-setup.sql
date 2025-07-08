-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.user_conversations CASCADE;
DROP TABLE IF EXISTS public.user_messages CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;
DROP TABLE IF EXISTS public.forum_threads CASCADE;
DROP TABLE IF EXISTS public.call_signals CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.forum_replies CASCADE;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    mental_health_badges TEXT[],
    current_mood TEXT,
    looking_for TEXT,
    mental_health_journey TEXT,
    gender TEXT,
    age INTEGER,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_id_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_score DECIMAL(3,2) DEFAULT 0.5,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'unmatched')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id_1, profile_id_2)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 65,
    connection_type TEXT DEFAULT 'friendship',
    preferred_badges TEXT[],
    preferred_genders TEXT[],
    location TEXT,
    max_distance INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum threads table
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call signals table for WebRTC
CREATE TABLE IF NOT EXISTS public.call_signals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    call_id TEXT NOT NULL,
    from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL,
    signal_data JSONB,
    call_type TEXT DEFAULT 'audio',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT 
USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT 
WITH CHECK (true);

-- Conversation participants policies
CREATE POLICY "Users can view conversation participants" ON public.conversation_participants FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can add participants" ON public.conversation_participants FOR INSERT 
WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT 
WITH CHECK (sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

-- Matches policies
CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT 
USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

CREATE POLICY "Users can create matches" ON public.matches FOR INSERT 
WITH CHECK (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

CREATE POLICY "Users can update matches involving them" ON public.matches FOR UPDATE 
USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE 
USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT 
WITH CHECK (profile_id = auth.uid());

-- Forum policies
CREATE POLICY "Anyone can view forum threads" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their threads" ON public.forum_threads FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view forum replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id);

-- Call signals policies
CREATE POLICY "Users can view their call signals" ON public.call_signals FOR SELECT 
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create call signals" ON public.call_signals FOR INSERT 
WITH CHECK (from_user_id = auth.uid());

-- Insert sample data
INSERT INTO public.profiles (id, username, full_name, bio, mental_health_badges, gender, age, location) VALUES
('22222222-2222-2222-2222-222222222222', 'test_user', 'Test User', 'A test user for messaging', ARRAY['Test Badge'], 'Other', 25, 'Test City'),
('550e8400-e29b-41d4-a716-446655440001', 'sarah_j', 'Sarah Johnson', 'Love hiking and coffee ☕ Always here to listen and support others on their mental health journey.', ARRAY['Anxiety Warrior', 'Mental Health Advocate'], 'Female', 28, 'San Francisco, CA'),
('550e8400-e29b-41d4-a716-446655440002', 'mike_chen', 'Mike Chen', 'Photographer and traveler 📸 Passionate about mindfulness and helping others find peace.', ARRAY['Depression Fighter', 'Mindfulness Practitioner'], 'Male', 32, 'Los Angeles, CA'),
('550e8400-e29b-41d4-a716-446655440003', 'alex_rivera', 'Alex Rivera', 'Artist and mental health advocate 🎨 Creating art to express emotions and heal.', ARRAY['Bipolar Warrior', 'Art Therapy'], 'Non-binary', 25, 'New York, NY'),
('550e8400-e29b-41d4-a716-446655440004', 'emma_davis', 'Emma Davis', 'Yoga instructor and wellness coach 🧘‍♀️ Helping others find balance and inner peace.', ARRAY['Anxiety Warrior', 'Yoga Practitioner'], 'Female', 30, 'Austin, TX'),
('550e8400-e29b-41d4-a716-446655440005', 'jordan_kim', 'Jordan Kim', 'Software developer and mental health advocate 💻 Building apps to help people connect.', ARRAY['ADHD Navigator', 'Tech for Good'], 'Male', 27, 'Seattle, WA')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.forum_threads (id, title, content, category, author_id, author_name) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Coping with social anxiety at work', 'I''ve been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?', 'anxiety', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson'),
('660e8400-e29b-41d4-a716-446655440002', 'Morning routines that help with depression', 'What morning routines have helped you manage depression? I''m looking for simple, achievable habits to start my day better.', 'depression', '550e8400-e29b-41d4-a716-446655440002', 'Mike Chen'),
('660e8400-e29b-41d4-a716-446655440003', 'Finding the right therapist', 'How do you know when you''ve found the right therapist? I''ve tried a few but haven''t felt that connection yet.', 'therapy', '550e8400-e29b-41d4-a716-446655440003', 'Alex Rivera')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.forum_replies (id, thread_id, content, author_id, author_name) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Try deep breathing exercises before meetings. They really help me calm down.', '550e8400-e29b-41d4-a716-446655440002', 'Mike Chen'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'I start with a 5-minute meditation followed by a gratitude journal. It sets a positive tone for the day.', '550e8400-e29b-41d4-a716-446655440003', 'Alex Rivera'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'It''s important to find someone who understands your specific needs. Don''t be afraid to ask questions.', '550e8400-e29b-41d4-a716-446655440004', 'Emma Davis')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.matches (profile_id_1, profile_id_2, match_score, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 0.85, 'accepted'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 0.75, 'pending'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 0.90, 'accepted')
ON CONFLICT (profile_id_1, profile_id_2) DO NOTHING;

-- Create sample conversations
INSERT INTO public.conversations (id) VALUES
('880e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Add conversation participants
INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Add sample messages
INSERT INTO public.messages (conversation_id, sender_id, content, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Hey Mike! How are you doing today?', NOW() - INTERVAL '2 hours'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hi Sarah! I''m doing well, thanks for asking. How about you?', NOW() - INTERVAL '1 hour'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Emma, I loved your yoga session yesterday!', NOW() - INTERVAL '3 hours'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Thank you Mike! I''m so glad you enjoyed it. Same time next week?', NOW() - INTERVAL '2 hours');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_profile_ids ON public.matches(profile_id_1, profile_id_2);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
