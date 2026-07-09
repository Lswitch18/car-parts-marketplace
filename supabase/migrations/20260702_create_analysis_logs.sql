-- Migration: create analysis_logs table for audit and quality tracking
CREATE TABLE IF NOT EXISTS analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_image_hash TEXT,
  part_number_detected TEXT,
  brand_detected TEXT,
  confidence NUMERIC NOT NULL,
  source TEXT NOT NULL,
  brand_mismatch BOOLEAN DEFAULT false NOT NULL,
  was_fallback_used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS (TODO(security): Row Level Security for audit logs)
ALTER TABLE analysis_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert logs and read logs (or only admin/service_role depending on need.
-- Here, since we call it from an Edge Function using the service role / global client, it will bypass RLS.
-- But let's add RLS policies just in case or allow authenticated users to read their own logs or insert.
CREATE POLICY "Allow service role insert and select" ON analysis_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
