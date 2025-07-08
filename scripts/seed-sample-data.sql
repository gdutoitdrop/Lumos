-- Insert sample profiles (these will be demo users)
INSERT INTO profiles (id, email, full_name, bio, age, location, interests, mode, is_premium) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alex@example.com', 'Alex Johnson', 'Love hiking and photography. Looking for someone to explore the city with!', 28, 'San Francisco, CA', ARRAY['hiking', 'photography', 'travel'], 'dating', false),
('550e8400-e29b-41d4-a716-446655440002', 'sam@example.com', 'Sam Wilson', 'Coffee enthusiast and book lover. Always up for deep conversations!', 25, 'New York, NY', ARRAY['reading', 'coffee', 'art'], 'friendship', true),
('550e8400-e29b-41d4-a716-446655440003', 'jordan@example.com', 'Jordan Smith', 'Fitness enthusiast and dog lover. Let\'s go on adventures together!', 30, 'Los Angeles, CA', ARRAY['fitness', 'dogs', 'outdoor'], 'dating', false),
('550e8400-e29b-41d4-a716-446655440004', 'taylor@example.com', 'Taylor Brown', 'Music producer and vinyl collector. Looking for concert buddies!', 26, 'Austin, TX', ARRAY['music', 'concerts', 'vinyl'], 'friendship', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample forum threads
INSERT INTO forum_threads (id, title, content, author_id, category) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Tips for great first dates?', 'Looking for creative first date ideas that aren''t too expensive but still memorable. What has worked for you?', '550e8400-e29b-41d4-a716-446655440001', 'dating'),
('660e8400-e29b-41d4-a716-446655440002', 'How to make friends as an adult?', 'Just moved to a new city and finding it hard to meet people. Any advice on making genuine friendships?', '550e8400-e29b-41d4-a716-446655440002', 'friendship'),
('660e8400-e29b-41d4-a716-446655440003', 'Coffee meetup this Saturday!', 'Organizing a casual coffee meetup downtown. All welcome! Let''s build our community.', '550e8400-e29b-41d4-a716-446655440003', 'events')
ON CONFLICT (id) DO NOTHING;

-- Insert sample forum replies
INSERT INTO forum_replies (thread_id, author_id, content) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'I love going to local farmers markets! It''s casual, lots to talk about, and you can grab coffee or food.'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Mini golf is always fun! It''s interactive and takes the pressure off conversation.'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Try joining hobby groups or classes! I met great friends through a photography club.'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Count me in! What time and which coffee shop?');
