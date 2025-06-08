-- Add missing columns to profiles table if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS connection_mode VARCHAR(20) DEFAULT 'both';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free';

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('connection_mode', 'subscription_tier');

-- Output the result for debugging
