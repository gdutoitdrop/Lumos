-- Insert sample profiles
INSERT INTO profiles (id, username, full_name, bio, mental_health_badges, age, location, gender, current_mood, looking_for) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sarah_j', 'Sarah Johnson', 'Love hiking and coffee ☕ Always here to listen and support others on their mental health journey.', ARRAY['Anxiety Warrior', 'Mental Health Advocate'], 28, 'San Francisco, CA', 'female', 'hopeful', 'friendship'),
('550e8400-e29b-41d4-a716-446655440002', 'mike_chen', 'Mike Chen', 'Photographer and traveler 📸 Passionate about mindfulness and helping others find peace.', ARRAY['Depression Fighter', 'Mindfulness Practitioner'], 32, 'Los Angeles, CA', 'male', 'calm', 'support'),
('550e8400-e29b-41d4-a716-446655440003', 'alex_rivera', 'Alex Rivera', 'Artist and mental health advocate 🎨 Creating art to express emotions and heal.', ARRAY['Bipolar Warrior', 'Art Therapy'], 25, 'New York, NY', 'non-binary', 'creative', 'community'),
('550e8400-e29b-41d4-a716-446655440004', 'emma_davis', 'Emma Davis', 'Yoga instructor and wellness coach 🧘‍♀️ Helping others find balance and inner peace.', ARRAY['Anxiety Warrior', 'Yoga Practitioner'], 30, 'Austin, TX', 'female', 'peaceful', 'mentorship'),
('550e8400-e29b-41d4-a716-446655440005', 'jordan_kim', 'Jordan Kim', 'Writer and mental health blogger ✍️ Sharing stories to help others feel less alone.', ARRAY['PTSD Survivor', 'Writing Therapy'], 27, 'Seattle, WA', 'male', 'reflective', 'connection');

-- Insert sample forum threads
INSERT INTO forum_threads (id, title, content, category, author_id, author_name, is_pinned, view_count, reply_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Welcome to Lumos Community!', 'Welcome to our supportive community! This is a safe space to share, learn, and grow together on our mental health journeys. Please be kind and respectful to everyone.', 'general', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', true, 156, 23),
('660e8400-e29b-41d4-a716-446655440002', 'Coping with social anxiety at work', 'I''ve been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?', 'anxiety', '550e8400-e29b-41d4-a716-446655440002', 'Mike Chen', false, 45, 8),
('660e8400-e29b-41d4-a716-446655440003', 'Morning routines that help with depression', 'What morning routines have helped you manage depression? I''m looking for simple, achievable habits to start my day better.', 'depression', '550e8400-e29b-41d4-a716-446655440003', 'Alex Rivera', false, 67, 12),
('660e8400-e29b-41d4-a716-446655440004', 'Finding the right therapist', 'How do you know when you''ve found the right therapist? I''ve tried a few but haven''t felt that connection yet. Any advice?', 'therapy', '550e8400-e29b-41d4-a716-446655440004', 'Emma Davis', false, 89, 15);

-- Insert sample forum replies
INSERT INTO forum_replies (thread_id, content, author_id, author_name) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Thank you for creating this space! I''m excited to be part of this community.', '550e8400-e29b-41d4-a716-446655440002', 'Mike Chen'),
('660e8400-e29b-41d4-a716-446655440001', 'This is exactly what I needed. Looking forward to connecting with everyone!', '550e8400-e29b-41d4-a716-446655440003', 'Alex Rivera'),
('660e8400-e29b-41d4-a716-446655440002', 'I can relate to this so much. What helped me was preparing talking points before meetings and practicing deep breathing exercises.', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson'),
('660e8400-e29b-41d4-a716-446655440002', 'Have you tried the 5-4-3-2-1 grounding technique? It really helps me in stressful situations.', '550e8400-e29b-41d4-a716-446655440004', 'Emma Davis'),
('660e8400-e29b-41d4-a716-446655440003', 'Starting with just 5 minutes of journaling each morning has been a game-changer for me.', '550e8400-e29b-41d4-a716-446655440005', 'Jordan Kim'),
('660e8400-e29b-41d4-a716-446655440003', 'I love the idea of gentle movement. Even just stretching for a few minutes helps set a positive tone.', '550e8400-e29b-41d4-a716-446655440004', 'Emma Davis');

-- Insert sample matches
INSERT INTO matches (profile_id_1, profile_id_2, match_score, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 0.85, 'accepted'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 0.78, 'accepted'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 0.82, 'accepted'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 0.91, 'accepted');

-- Insert sample conversations
INSERT INTO conversations (id) VALUES
('770e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003');

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004');

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Hey Mike! Great to connect with you. How are you doing today?'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hi Sarah! I''m doing well, thanks for asking. I love your approach to mental health advocacy.'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Thank you! I believe we''re stronger when we support each other. What brings you to Lumos?'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Hi Alex! I saw your art therapy badge - that''s so interesting. How did you get into that?'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Hey Sarah! Art has always been my way of processing emotions. It''s amazing how creative expression can be so healing.'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Hi Emma! I''ve been following your mindfulness posts. Do you have any beginner-friendly meditation recommendations?'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Hi Mike! I''d recommend starting with just 5 minutes of breath awareness. The Headspace app has some great beginner sessions too.');
