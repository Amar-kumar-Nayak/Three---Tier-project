const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
async function initDB() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS pastes (
                id VARCHAR(10) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                max_views INTEGER,
                views INTEGER DEFAULT 0
            );
            
            CREATE INDEX IF NOT EXISTS idx_expires_at ON pastes(expires_at);
        `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        client.release();
    }
}

initDB();

// Generate random ID
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

// Calculate expiry date
function calculateExpiry(expiryOption) {
    if (!expiryOption) return null;
    
    const now = new Date();
    switch (expiryOption) {
        case '10min':
            return new Date(now.getTime() + 10 * 60 * 1000);
        case '1hour':
            return new Date(now.getTime() + 60 * 60 * 1000);
        case '1day':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case '1week':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        default:
            return null;
    }
}

// API Routes

// Create paste
app.post('/api/paste', async (req, res) => {
    try {
        const { title, content, expiry, maxViews } = req.body;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Content is required' });
        }
        
        const id = generateId();
        const expiresAt = calculateExpiry(expiry);
        
        await pool.query(
            'INSERT INTO pastes (id, title, content, expires_at, max_views) VALUES ($1, $2, $3, $4, $5)',
            [id, title || 'Untitled', content, expiresAt, maxViews]
        );
        
        res.json({ id, message: 'Paste created successfully' });
    } catch (err) {
        console.error('Error creating paste:', err);
        res.status(500).json({ error: 'Failed to create paste' });
    }
});

// Get paste
app.get('/api/paste/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM pastes WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paste not found' });
        }
        
        const paste = result.rows[0];
        
        // Check if expired
        if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
            await pool.query('DELETE FROM pastes WHERE id = $1', [id]);
            return res.status(410).json({ error: 'This paste has expired' });
        }
        
        // Check max views
        if (paste.max_views && paste.views >= paste.max_views) {
            await pool.query('DELETE FROM pastes WHERE id = $1', [id]);
            return res.status(410).json({ error: 'This paste has reached its maximum view limit' });
        }
        
        // Increment views
        await pool.query(
            'UPDATE pastes SET views = views + 1 WHERE id = $1',
            [id]
        );
        
        res.json({
            id: paste.id,
            title: paste.title,
            content: paste.content,
            createdAt: paste.created_at,
            expiresAt: paste.expires_at,
            maxViews: paste.max_views,
            views: paste.views + 1
        });
    } catch (err) {
        console.error('Error retrieving paste:', err);
        res.status(500).json({ error: 'Failed to retrieve paste' });
    }
});

// Cleanup expired pastes (run periodically)
async function cleanupExpired() {
    try {
        await pool.query('DELETE FROM pastes WHERE expires_at < NOW()');
    } catch (err) {
        console.error('Error cleaning up expired pastes:', err);
    }
}

// Run cleanup every hour
setInterval(cleanupExpired, 60 * 60 * 1000);

// Serve frontend
app.get('/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
