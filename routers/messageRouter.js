const express = require('express')
const { addMessage } = require('../controllers/messageController')
const verifyApiKey = require('../middlewares/verifyApiKey')
// const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

router.post('/add', verifyApiKey, addMessage)

module.exports = router