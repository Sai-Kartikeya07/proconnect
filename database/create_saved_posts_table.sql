-- Table to store user-saved (bookmarked) posts
CREATE TABLE IF NOT EXISTS saved_posts (
    user_id VARCHAR(255) NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Helpful indexes (PK already covers user_id+post_id lookups)
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON saved_posts(created_at DESC);

COMMENT ON TABLE saved_posts IS 'Mapping of users to posts they have saved (bookmarked)';
