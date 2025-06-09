-- Check all tables and their data
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'user_conversations', COUNT(*) FROM user_conversations
UNION ALL
SELECT 'user_messages', COUNT(*) FROM user_messages
UNION ALL
SELECT 'forum_threads', COUNT(*) FROM forum_threads
UNION ALL
SELECT 'forum_replies', COUNT(*) FROM forum_replies
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'user_preferences', COUNT(*) FROM user_preferences;

-- Check for any missing foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema='public'
ORDER BY tc.table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
