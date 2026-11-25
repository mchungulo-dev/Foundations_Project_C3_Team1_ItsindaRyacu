require('dotenv').config();

const express = require('express')
const cors = require('cors')
const db = require('./config/database')
const app = express()
const invitationService = require('./utils/invitationService.js');

// Use express middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : true,
  })
)
app.use(express.json())
// USSD gateways (e.g. Africa's Talking) POST form-encoded bodies
app.use(express.urlencoded({ extended: false }))

// routes
const adminRegistrationRouter = require('./routers/admin_registration_router');
const loginRouter = require('./routers/login-router');
const manageMembersRouter = require('./routers/manage_members-router');
const savingsRouter = require('./routers/savings_router');
const cyclesRouter = require('./routers/cycles-router');
const sharesOutRouter = require('./routers/share-out-router');
const meetingsRouter = require('./routers/meetingsRoutes');
const loansRouter = require('./routers/loans-router');
const invitationRouter = require('./routers/invitation-router.js');
const ussdRouter = require('./routers/ussd-router');

app.use('/auth/admin', adminRegistrationRouter);
app.use('/auth/', loginRouter);
app.use('/admin', manageMembersRouter);
app.use('/savings', savingsRouter);
app.use('/cycles', cyclesRouter);
app.use('/share-out', sharesOutRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/loans', loansRouter);
app.use('/invitation', invitationRouter);
app.use('/ussd', ussdRouter);

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

// Schedule daily cleanup of expired and unused invitation tokens
const scheduleCleanUp = () => {
    const now = new Date();
    const nightTime = new Date(
        now.getFullYear(), now.getMonth(), now.getDate() +1,0,0,0
    );
    const milliSecondsToMidnight = nightTime.getTime() - now.getTime();

    setInterval(async () => {
        try{
            const results = await invitationService.deleteExpiredInvites();
            console.log(`System cleanup executed. Cleaned up ${results.CleanedUpRecords}`);
        } catch (err) {
            console.error('Clean up failed: ', err);
        }
        setInterval(async () => {
            await invitationService.deleteExpiredInvites();
        }, 24 * 60 * 60 * 1000);
    }, milliSecondsToMidnight);
};

scheduleCleanUp();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});