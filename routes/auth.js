const express = require('express');
const router = express.Router();

const { signup, signin, refreshToken, signout } = require('../controllers/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', signout);
router.get('/refresh', refreshToken);

module.exports = router;
