-- Drop and recreate the forum_threads table with the correct schema
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;

-- Create forum_threads table with proper author_id column
CREATE TABLE forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_threads
CREATE POLICY "Anyone can view forum threads" ON forum_threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON forum_threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own threads" ON forum_threads
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own threads" ON forum_threads
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view forum replies" ON forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own replies" ON forum_replies
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own replies" ON forum_replies
  FOR DELETE USING (auth.uid() = author_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);
