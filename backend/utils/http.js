// Small helpers so route handlers can stop with an HTTP error by throwing,
// instead of repeating `return res.status(...).json(...)` everywhere.
// Express 5 passes errors thrown in handlers to `errorHandler` below, which
// must be registered in server.js after all routes.

class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

// Stop the request with the given status and message.
function fail(status, message) {
    throw new HttpError(status, message);
}

// Stop the request with 400 and a list of what was wrong with the input.
function validationFailed(problems) {
    throw new HttpError(400, 'Validation failed!', problems);
}

// Turn a route parameter into a positive whole number, or stop with 400.
function parseId(raw, label = 'ID') {
    const id = Number(raw);
    if (!/^\d+$/.test(String(raw)) || !Number.isSafeInteger(id) || id <= 0) {
        fail(400, `Invalid ${label}.`);
    }
    return id;
}

// Express error middleware: turns errors into JSON responses.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof HttpError) {
        const body = { message: err.message };
        if (err.details) body.errors = err.details;
        return res.status(err.status).json(body);
    }
    // Malformed JSON body sent by the client
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Request body is not valid JSON.' });
    }
    console.error('Unhandled Error:', err);
    return res.status(500).json({ message: 'Internal Server Error!' });
}

module.exports = { HttpError, fail, validationFailed, parseId, errorHandler };
