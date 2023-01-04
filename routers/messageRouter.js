const express = require('express')
const { addMessage } = require('../controllers/messageController')
const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

router.post('/add', verifyToken, addMessage)
// router.post('/login', login)
// router.get('/logout', logout)
// router.post('/change-password', changePassword)
// router.get('/refreshToken', verifyToken, refreshToken)

module.exports = router