const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, registerValidation, loginValidation } = require('../controllers/authController');
const validate = require('../middleware/validate');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPassword);

module.exports = router;
