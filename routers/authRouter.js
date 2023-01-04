const express = require('express')
const { register, login, logout, refreshToken, changePassword } = require('../controllers/AuthController')
const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.post('/change-password', changePassword)
router.get('/refreshToken', verifyToken, refreshToken)

module.exports = router