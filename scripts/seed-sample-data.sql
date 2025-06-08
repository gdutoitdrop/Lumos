-- Insert sample users and profiles for testing
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'charlie@example.com', NOW(), NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'diana@example.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample profiles
INSERT INTO profiles (id, username, full_name, bio, gender, age, location, connection_mode, mental_health_badges, subscription_tier)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'alice_wonder', 'Alice Johnson', 'Mental health advocate and yoga enthusiast. Looking for meaningful connections.', 'female', 28, 'San Francisco, CA', 'both', ARRAY['anxiety', 'mindfulness'], 'premium'),
  ('22222222-2222-2222-2222-222222222222', 'bob_builder', 'Bob Smith', 'Software engineer who believes in the power of community support.', 'male', 32, 'Austin, TX', 'connect', ARRAY['depression', 'therapy'], 'free'),
  ('33333333-3333-3333-3333-333333333333', 'charlie_artist', 'Charlie Brown', 'Artist and creative soul seeking romantic connections with understanding partners.', 'non-binary', 26, 'Portland, OR', 'date', ARRAY['bipolar', 'creativity'], 'premium'),
  ('44444444-4444-4444-4444-444444444444', 'diana_healer', 'Diana Prince', 'Therapist and wellness coach. Open to both friendships and dating.', 'female', 30, 'Seattle, WA', 'both', ARRAY['ptsd', 'healing'], 'free')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  gender = EXCLUDED.gender,
  age = EXCLUDED.age,
  location = EXCLUDED.location,
  connection_mode = EXCLUDED.connection_mode,
  mental_health_badges = EXCLUDED.mental_health_badges,
  subscription_tier = EXCLUDED.subscription_tier;

-- Insert sample user preferences
INSERT INTO user_preferences (user_id, connection_mode, age_min, age_max, preferred_genders, location, max_distance, preferred_badges)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'both', 25, 35, ARRAY['male', 'non-binary'], 'San Francisco, CA', 25, ARRAY['anxiety', 'mindfulness', 'therapy']),
  ('22222222-2222-2222-2222-222222222222', 'connect', 20, 40, ARRAY['any'], 'Austin, TX', 50, ARRAY['depression', 'support']),
  ('33333333-3333-3333-3333-333333333333', 'date', 24, 30, ARRAY['female', 'non-binary'], 'Portland, OR', 30, ARRAY['creativity', 'art']),
  ('44444444-4444-4444-4444-444444444444', 'both', 25, 40, ARRAY['male', 'female'], 'Seattle, WA', 40, ARRAY['healing', 'wellness'])
ON CONFLICT (user_id) DO UPDATE SET
  connection_mode = EXCLUDED.connection_mode,
  age_min = EXCLUDED.age_min,
  age_max = EXCLUDED.age_max,
  preferred_genders = EXCLUDED.preferred_genders,
  location = EXCLUDED.location,
  max_distance = EXCLUDED.max_distance,
  preferred_badges = EXCLUDED.preferred_badges;

-- Insert sample subscriptions
INSERT INTO user_subscriptions (user_id, plan_type, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'premium', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'premium', 'active')
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = EXCLUDED.plan_type,
  status = EXCLUDED.status;

-- Insert sample matches
INSERT INTO matches (user1_id, user2_id, status, match_score)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted', 0.85),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'pending', 0.92),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'accepted', 0.78)
ON CONFLICT (user1_id, user2_id) DO UPDATE SET
  status = EXCLUDED.status,
  match_score = EXCLUDED.match_score;

-- Insert sample forum threads
INSERT INTO forum_threads (title, content, category, author_id, is_pinned)
VALUES 
  ('Welcome to Anxiety Support', 'This is a safe space to discuss anxiety management techniques and share experiences.', 'anxiety', '11111111-1111-1111-1111-111111111111', true),
  ('Daily Check-in Thread', 'How are you feeling today? Share your mood and any wins or challenges.', 'general', '44444444-4444-4444-4444-444444444444', true),
  ('Art Therapy Benefits', 'I wanted to share how art has helped me process my emotions and cope with bipolar disorder.', 'creativity', '33333333-3333-3333-3333-333333333333', false),
  ('Finding the Right Therapist', 'Tips and experiences on finding a therapist who understands your needs.', 'therapy', '22222222-2222-2222-2222-222222222222', false)
ON CONFLICT DO NOTHING;
