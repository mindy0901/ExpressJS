const logErrors = (err, req, res, next) => {
    console.log(err.stack);
    next(err);
};

const clientErrorHandler = (err, req, res, next) => {
    if (req.xhr) {
        res.status(500).json({ error: 'Client error' });
    } else {
        next(err);
    }
};

const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.status(500).json({ error: err });
};

module.exports = { logErrors, clientErrorHandler, errorHandler };
