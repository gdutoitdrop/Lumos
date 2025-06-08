-- Complete forum fix with proper schema
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;

-- Create forum_threads table with all necessary columns
CREATE TABLE forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_threads (more permissive for testing)
CREATE POLICY "Anyone can view forum threads" ON forum_threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON forum_threads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own threads" ON forum_threads
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = profile_id);

CREATE POLICY "Authors can delete their own threads" ON forum_threads
  FOR DELETE USING (auth.uid() = author_id OR auth.uid() = profile_id);

-- RLS Policies for forum_replies (more permissive for testing)
CREATE POLICY "Anyone can view forum replies" ON forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own replies" ON forum_replies
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = profile_id);

CREATE POLICY "Authors can delete their own replies" ON forum_replies
  FOR DELETE USING (auth.uid() = author_id OR auth.uid() = profile_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_profile ON forum_threads(profile_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_profile ON forum_replies(profile_id);

-- Insert some sample forum threads for testing
INSERT INTO forum_threads (title, content, category, author_id, profile_id) VALUES
('Welcome to Mental Health Support', 'This is a safe space to share your mental health journey and connect with others who understand.', 'mental-health', 
 (SELECT id FROM auth.users LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1)),
('Tips for Managing Anxiety', 'What are your best strategies for dealing with anxiety? Share what works for you!', 'mental-health',
 (SELECT id FROM auth.users LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1)),
('Dating with Mental Health Challenges', 'How do you navigate dating while managing mental health? Let''s discuss our experiences.', 'relationships',
 (SELECT id FROM auth.users LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1));
