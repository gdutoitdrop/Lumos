-- Create call signals table for WebRTC signaling
CREATE TABLE IF NOT EXISTS call_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id VARCHAR(255) NOT NULL,
  signal_type VARCHAR(50) NOT NULL,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  call_type VARCHAR(10) NOT NULL,
  signal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_call_signals_to_user ON call_signals(to_user_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_call_id ON call_signals(call_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_created_at ON call_signals(created_at);

-- Disable RLS for simplicity
ALTER TABLE call_signals DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON call_signals TO authenticated;
GRANT ALL ON call_signals TO anon;

-- Clean up old signals (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_call_signals()
RETURNS void AS $$
BEGIN
  DELETE FROM call_signals 
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old signals (if pg_cron is available)
-- SELECT cron.schedule('cleanup-call-signals', '0 * * * *', 'SELECT cleanup_old_call_signals();');
