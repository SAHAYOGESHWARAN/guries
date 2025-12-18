-- Create Asset Type Master Table
CREATE TABLE IF NOT EXISTS asset_type_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(255) NOT NULL,
    asset_type_name VARCHAR(255) NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand, asset_type_name)
);

-- Insert default asset types for each brand
INSERT OR IGNORE INTO asset_type_master (brand, asset_type_name, word_count) VALUES
('Pubrica', 'Research Paper', 800),
('Pubrica', 'Review Article', 600),
('Pubrica', 'Case Study', 500),
('Pubrica', 'Technical Report', 700),
('Stats work', 'Analysis Report', 400),
('Stats work', 'Data Summary', 300),
('Stats work', 'Statistical Guide', 500),
('Food Research lab', 'Test Report', 350),
('Food Research lab', 'Safety Analysis', 450),
('Food Research lab', 'Quality Certificate', 250),
('PhD assistance', 'Thesis Chapter', 1000),
('PhD assistance', 'Literature Review', 800),
('PhD assistance', 'Research Proposal', 600),
('tutors India', 'Study Material', 400),
('tutors India', 'Practice Questions', 200),
('tutors India', 'Tutorial Guide', 500);