const express = require('express');
const router = express.Router();

const verifyJWT = require('../middlewares/verifyJWT');
const { getUser, getUsers, getMe } = require('../controllers/user');
const { getUserMiddleware } = require('../middlewares/userMiddleware');

router.use(verifyJWT);

// GET USERS
router.get('/', getUsers);

// GET USER
router.get('/:id', getUserMiddleware, getUser);

// GET ME
router.get('/:id', getMe);

module.exports = router;
