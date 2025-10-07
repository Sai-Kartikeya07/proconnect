-- Create education table for user profiles
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    grade VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_education_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensure end_date is after start_date if both are provided
    CONSTRAINT check_date_order CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_education_start_date ON education(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_education_is_current ON education(is_current) WHERE is_current = true;

-- Add comments
COMMENT ON TABLE education IS 'Educational background information for users';
COMMENT ON COLUMN education.is_current IS 'True if this is the users current education';
COMMENT ON COLUMN education.grade IS 'GPA, percentage, or other grade information';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON education TO your_app_user;