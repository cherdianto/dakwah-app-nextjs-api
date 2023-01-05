const express = require('express')
const { addDevice, showDevices, scanQrcode, destroy, logout } = require('../controllers/deviceController')
const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

router.post('/add', verifyToken, addDevice)
router.get('/show-devices', verifyToken, showDevices) 
router.get('/destroy/:deviceid', verifyToken, destroy) 
router.get('/logout/:deviceid', verifyToken, logout) 
router.get('/scan/:userid/users/:deviceid', scanQrcode)

module.exports = router