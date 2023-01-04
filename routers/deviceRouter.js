const express = require('express')
const { addDevice, showDevice } = require('../controllers/deviceController')
const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

router.post('/add', verifyToken, addDevice)
router.get('/show', verifyToken, showDevice) 
// router.post('/login', login)
// router.post('/change-password', changePassword)
// router.get('/refreshToken', verifyToken, refreshToken)

module.exports = router