const express = require('express');
const router = express.Router();

const { signupValidator, signinValidator, refreshValidator } = require('../middlewares/authValidator');
const { signup, signin, refreshToken, signout } = require('../controllers/auth');
const verifyJWT = require('../middlewares/verifyJWT');

router.post('/signup', signupValidator(), signup);
router.post('/signin', signinValidator(), signin);
router.post('/refresh', refreshValidator(), refreshToken);
router.get('/signout', verifyJWT, signout);

module.exports = router;
