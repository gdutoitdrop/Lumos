-- Create call signals table for WebRTC signaling
CREATE TABLE IF NOT EXISTS call_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id VARCHAR(255) NOT NULL,
  signal_type VARCHAR(50) NOT NULL,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  call_type VARCHAR(20) NOT NULL,
  signal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_signals_call_id ON call_signals(call_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_to_user ON call_signals(to_user_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_from_user ON call_signals(from_user_id);

-- Disable RLS for simplicity
ALTER TABLE call_signals DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON call_signals TO authenticated;
GRANT ALL ON call_signals TO anon;

-- Verify table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'call_signals'
ORDER BY ordinal_position;
