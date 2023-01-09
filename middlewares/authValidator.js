const { body } = require('express-validator');

const signupValidator = () => {
    return [
        body('username', 'The username must be 6+ chars long and not contain special words')
            .not()
            .isEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3 }),

        body('password', 'The password must be 6+ chars long')
            .not()
            .isEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 }),

        body('email', 'The email invalid').not().isEmpty().withMessage('Email is required').isEmail(),

        body('role').not().isEmpty().withMessage('Role is required'),
    ];
};

const signinValidator = () => {
    return [
        body('username').not().isEmpty().withMessage('Username is required'),

        body('password').not().isEmpty().withMessage('Password is required'),
    ];
};

const refreshValidator = () => {
    return [body('refresh_token').not().isEmpty().withMessage('Refresh token is required').isString()];
};

module.exports = { signinValidator, signupValidator, refreshValidator };
