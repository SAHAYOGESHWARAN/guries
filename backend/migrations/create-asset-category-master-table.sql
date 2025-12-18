-- Create Asset Category Master Table
CREATE TABLE IF NOT EXISTS asset_category_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand, category_name)
);

-- Insert default categories for each brand
INSERT OR IGNORE INTO asset_category_master (brand, category_name, word_count) VALUES
('Pubrica', 'Research Articles', 500),
('Pubrica', 'Academic Writing', 300),
('Pubrica', 'Publication Support', 400),
('Stats work', 'Statistical Analysis', 350),
('Stats work', 'Data Visualization', 250),
('Stats work', 'Research Methodology', 450),
('Food Research lab', 'Food Safety', 400),
('Food Research lab', 'Nutritional Analysis', 350),
('Food Research lab', 'Quality Testing', 300),
('PhD assistance', 'Dissertation Help', 600),
('PhD assistance', 'Research Guidance', 400),
('PhD assistance', 'Academic Support', 350),
('tutors India', 'Online Tutoring', 300),
('tutors India', 'Subject Expertise', 250),
('tutors India', 'Learning Resources', 400);