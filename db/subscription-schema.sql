-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "Users can read their own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- Only the system can insert/update/delete subscriptions
CREATE POLICY "Only the system can insert subscriptions"
ON subscriptions FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only the system can update subscriptions"
ON subscriptions FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Only the system can delete subscriptions"
ON subscriptions FOR DELETE
TO service_role
USING (true);

-- Only the system can read/insert/update/delete email queue
CREATE POLICY "Only the system can read email queue"
ON email_queue FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Only the system can insert email queue"
ON email_queue FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only the system can update email queue"
ON email_queue FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Only the system can delete email queue"
ON email_queue FOR DELETE
TO service_role
USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_profile_id ON email_queue(profile_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
