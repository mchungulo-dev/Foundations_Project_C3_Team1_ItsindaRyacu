require('dotenv').config();

const express = require('express')
const cors = require('cors')
const db = require('./config/database')
const app = express()

// Use express middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : true,
  })
)
app.use(express.json())

// routes
const adminRegistrationRouter = require('./routers/admin_registration_router');
const loginRouter = require('./routers/login-router');
const manageMembersRouter = require('./routers/manage_members-router');
const savingsRouter = require('./routers/savings_router');
const cyclesRouter = require('./routers/cycles-router');
const sharesOutRouter = require('./routers/share-out-router');
const meetingsRouter = require('./routers/meetingsRoutes');
const loansRouter = require('./routers/loans-router');

app.use('/auth/admin', adminRegistrationRouter);
app.use('/auth/', loginRouter);
app.use('/admin', manageMembersRouter);
app.use('/savings', savingsRouter);
app.use('/cycles', cyclesRouter);
app.use('/share-out', sharesOutRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/loans', loansRouter);

// Check whether the DB is running.
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
console.log('JWT Secret loaded:', !!process.env.JWT_SECRET);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});