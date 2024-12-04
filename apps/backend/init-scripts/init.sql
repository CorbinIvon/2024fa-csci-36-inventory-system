CREATE TABLE nodePoint (
    id SERIAL PRIMARY KEY,
    parent INTEGER REFERENCES nodePoint(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data JSONB,
    version INTEGER DEFAULT 1 NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT unique_title_per_parent UNIQUE (parent, title)
);
CREATE TABLE nodePointHistory (
    id SERIAL PRIMARY KEY,
    nodePointId INTEGER REFERENCES nodePoint(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data JSONB,
    action VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
