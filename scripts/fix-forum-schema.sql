-- Add missing author_name column to forum_threads
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Update existing threads to have author names
UPDATE public.forum_threads 
SET author_name = COALESCE(
  (SELECT full_name FROM public.profiles WHERE id = forum_threads.author_id),
  (SELECT username FROM public.profiles WHERE id = forum_threads.author_id),
  'Anonymous User'
)
WHERE author_name IS NULL;

-- Add some sample forum data for testing
INSERT INTO public.forum_threads (title, content, category, author_id, author_name) VALUES
('Welcome to the Anxiety Support Group', 'This is a safe space to share your experiences with anxiety. Feel free to ask questions and support each other.', 'anxiety', '22222222-2222-2222-2222-222222222222', 'Test User'),
('Coping Strategies That Work', 'What are some coping strategies that have helped you manage anxiety? Share your tips here.', 'anxiety', '22222222-2222-2222-2222-222222222222', 'Test User'),
('Daily Check-in Thread', 'How are you feeling today? Share your thoughts and get support from the community.', 'general', '22222222-2222-2222-2222-222222222222', 'Test User')
ON CONFLICT DO NOTHING;
