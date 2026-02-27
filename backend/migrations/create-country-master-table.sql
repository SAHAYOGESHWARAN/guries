-- Create country_master table
CREATE TABLE IF NOT EXISTS country_master (
  id SERIAL PRIMARY KEY,
  country_name TEXT UNIQUE NOT NULL,
  iso_code TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL,
  default_language TEXT,
  allowed_for_backlinks BOOLEAN DEFAULT false,
  allowed_for_content_targeting BOOLEAN DEFAULT false,
  allowed_for_smm_targeting BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_country_master_status ON country_master(status);
CREATE INDEX IF NOT EXISTS idx_country_master_region ON country_master(region);
CREATE INDEX IF NOT EXISTS idx_country_master_iso_code ON country_master(iso_code);
