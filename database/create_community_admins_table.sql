-- Community admins table
CREATE TABLE IF NOT EXISTS community_admins (
  community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_admins_user ON community_admins(user_id);
COMMENT ON TABLE community_admins IS 'Users with admin rights per community (can manage events, moderation, etc.)';
