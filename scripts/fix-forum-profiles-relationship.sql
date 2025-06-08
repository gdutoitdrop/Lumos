-- Fix the relationship between forum_threads and profiles
-- This ensures the forum system works with the actual database schema

-- First, let's check if we need to update the profiles table to match auth.users
DO $$
BEGIN
    -- Add user_id column to profiles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);
        
        -- Update existing profiles to link with auth.users
        UPDATE profiles SET user_id = id WHERE user_id IS NULL;
    END IF;
    
    -- Ensure forum_threads has proper author_id reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'forum_threads' AND column_name = 'author_id') THEN
        ALTER TABLE forum_threads ADD COLUMN author_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create some sample forum threads if none exist
INSERT INTO forum_threads (title, content, category, author_id, is_pinned)
SELECT 
    'Welcome to ' || category_name || ' Support',
    'This is a safe space to share your experiences and support each other on your mental health journey. Feel free to share your thoughts, ask questions, or offer encouragement to others.',
    category_slug,
    (SELECT id FROM auth.users LIMIT 1),
    true
FROM (VALUES 
    ('Anxiety Support', 'anxiety'),
    ('Depression Support', 'depression'),
    ('General Mental Health', 'general'),
    ('Success Stories', 'success-stories'),
    ('Resources & Tips', 'resources')
) AS categories(category_name, category_slug)
WHERE NOT EXISTS (
    SELECT 1 FROM forum_threads WHERE category = category_slug
)
AND EXISTS (SELECT 1 FROM auth.users);

-- Add some sample replies
INSERT INTO forum_replies (thread_id, author_id, content)
SELECT 
    ft.id,
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1 OFFSET 1),
    'Thank you for creating this supportive community space. Looking forward to connecting with others who understand the journey.'
FROM forum_threads ft
WHERE NOT EXISTS (
    SELECT 1 FROM forum_replies WHERE thread_id = ft.id
)
AND EXISTS (SELECT 1 FROM auth.users HAVING COUNT(*) > 1);

-- Update reply counts
UPDATE forum_threads 
SET reply_count = (
    SELECT COUNT(*) 
    FROM forum_replies 
    WHERE thread_id = forum_threads.id
);
