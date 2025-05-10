-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" 
ON subscriptions FOR SELECT 
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all subscriptions" 
ON subscriptions FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Service role can manage subscriptions" 
ON subscriptions FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Email notifications policies
CREATE POLICY "Users can view their own email notifications" 
ON email_notifications FOR SELECT 
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all email notifications" 
ON email_notifications FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Service role can manage email notifications" 
ON email_notifications FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to create email notification when a new match is created
CREATE OR REPLACE FUNCTION create_match_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the matched user's name
  DECLARE
    matched_user_name TEXT;
  BEGIN
    SELECT full_name INTO matched_user_name FROM profiles WHERE id = NEW.profile_id_1;
    
    -- Create email notification for the matched user
    INSERT INTO email_notifications (profile_id, type, data, is_sent)
    VALUES (
      NEW.profile_id_2,
      'match_created',
      json_build_object(
        'match_id', NEW.id,
        'match_name', matched_user_name,
        'match_score', NEW.match_score
      ),
      FALSE
    );
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new matches
CREATE TRIGGER on_match_created
AFTER INSERT ON matches
FOR EACH ROW
EXECUTE FUNCTION create_match_notification();

-- Create function to create email notification when a new message is created
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the recipient is not the sender
  IF EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
    AND profile_id != NEW.profile_id
  ) THEN
    -- Get the sender's name
    DECLARE
      sender_name TEXT;
      recipient_id UUID;
      message_preview TEXT;
    BEGIN
      SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.profile_id;
      
      -- Get the recipient's ID
      SELECT profile_id INTO recipient_id 
      FROM conversation_participants
      WHERE conversation_id = NEW.conversation_id
      AND profile_id != NEW.profile_id
      LIMIT 1;
      
      -- Truncate message for preview
      message_preview := substring(NEW.content from 1 for 50);
      IF length(NEW.content) > 50 THEN
        message_preview := message_preview || '...';
      END IF;
      
      -- Create email notification for the recipient
      INSERT INTO email_notifications (profile_id, type, data, is_sent)
      VALUES (
        recipient_id,
        'new_message',
        json_build_object(
          'conversation_id', NEW.conversation_id,
          'sender_name', sender_name,
          'message_preview', message_preview
        ),
        FALSE
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
CREATE TRIGGER on_message_created
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION create_message_notification();
