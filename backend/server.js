const express = require('express')
const db = require('./config/database')
const app = express()

// Use express middleware
app.use(express.json())

// routes
const adminRegistrationRouter = require('./routers/admin_registration_router')
app.use('/auth/admin', adminRegistrationRouter)

app.get('/', (req, res) => {
    res.json({
        message: 'Ibimina API is running!'
    });
});

app.get('/api/test-db', (req, res) => {
    const tables = db.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
    `).all();

    res.json({
        message: 'Database connected successfully!',
        tables: tables
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});