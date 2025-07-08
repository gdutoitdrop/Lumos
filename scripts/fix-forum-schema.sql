-- Add missing author_name column to forum_threads
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Update existing threads to have author names
UPDATE public.forum_threads 
SET author_name = profiles.full_name 
FROM public.profiles 
WHERE forum_threads.author_id = profiles.id AND forum_threads.author_name IS NULL;

-- Insert some sample forum data for testing
INSERT INTO public.forum_threads (title, content, category, author_id, author_name) VALUES
('Welcome to Anxiety Support', 'This is a safe space to discuss anxiety and share coping strategies.', 'anxiety', '22222222-2222-2222-2222-222222222222', 'Test User'),
('Daily Check-in Thread', 'How are you feeling today? Share your thoughts and support others.', 'anxiety', '22222222-2222-2222-2222-222222222222', 'Test User'),
('Meditation Tips', 'Share your favorite meditation techniques and mindfulness practices.', 'wellness', '22222222-2222-2222-2222-222222222222', 'Test User')
ON CONFLICT DO NOTHING;
