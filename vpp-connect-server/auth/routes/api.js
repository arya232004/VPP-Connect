const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/apicontroller');

router.post('/login', googleLogin);

module.exports = router;