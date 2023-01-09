const express = require('express');
const router = express.Router();

const verifyJWT = require('../middlewares/verifyJWT');
const verifyRoles = require('../middlewares/verifyRoles');
const { getUser, getUsers } = require('../controllers/user');

router.use(verifyJWT);
// GET USERS
router.get('/', getUsers);

// GET USER
router.get('/:id', getUser);

module.exports = router;
