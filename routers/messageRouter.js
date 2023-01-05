const express = require('express')
const { addMessage } = require('../controllers/messageController')
const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

router.post('/add', verifyToken, addMessage)

module.exports = router