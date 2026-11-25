// Date helpers. Same rules as frontend/src/lib/validation.ts and format.ts.

// Today's date in Rwanda as YYYY-MM-DD. Using Kigali time (UTC+2) matters:
// with UTC, 00:00–02:00 local time would still count as yesterday.
function today() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Kigali',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}

// A real calendar date written as YYYY-MM-DD (rejects 2026-02-30).
function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// A 24-hour time written as HH:MM, e.g. 16:00.
function isValidMeetingTime(value) {
    return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

module.exports = { today, isValidDate, isValidMeetingTime };
