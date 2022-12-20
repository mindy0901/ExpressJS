const express = require('express');
const router = express.Router();
const verifyRoles = require('../middlewares/verifyRoles');

const { getUsers, getUser } = require('../controllers/user');

router.get('/', verifyRoles('ADMIN', 'DIRECTOR'), getUsers);
router.get('/:id', getUser);

module.exports = router;
