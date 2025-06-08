-- This script will help debug the database schema issues

-- Check if forum_threads table exists and its columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forum_threads';

-- Check if profiles table exists and its columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check if messages table exists and its columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages';

-- Check if conversation_participants table exists and its columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversation_participants';

-- Check if conversations table exists and its columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations';

-- Check if matches table exists and its columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matches';

-- Check for any existing data in forum_threads
SELECT COUNT(*) FROM forum_threads;

-- Check for any existing data in messages
SELECT COUNT(*) FROM messages;

-- Check for any existing data in matches
SELECT COUNT(*) FROM matches;

-- Check for any existing data in conversations
SELECT COUNT(*) FROM conversations;

-- Check for any existing data in conversation_participants
SELECT COUNT(*) FROM conversation_participants;
