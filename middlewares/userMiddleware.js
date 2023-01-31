const getUserMiddleware = (req, res, next) => {
    if (req.params.id === 'me') next('route');
    else next();
};

module.exports = { getUserMiddleware };
