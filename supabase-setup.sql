-- Create the app_storage table for storing all collections
CREATE TABLE IF NOT EXISTS app_storage (
    key TEXT PRIMARY KEY,
    data JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_storage_key ON app_storage(key);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE app_storage ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations" ON app_storage FOR ALL USING (true) WITH CHECK (true);
