-- Community events table
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    created_by VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_events_community_date
  ON community_events(community_id, event_date ASC);

COMMENT ON TABLE community_events IS 'Scheduled events for a community';
COMMENT ON COLUMN community_events.event_date IS 'Calendar date of the event (no time)';
