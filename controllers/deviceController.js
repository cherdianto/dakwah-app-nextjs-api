const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const shortid = require('shortid')
const duplicateNumber = require('../libraries/duplicateNumber')

const addDevice = asyncHandler(async(req, res) => {
    // url = doman/device/userId/
    // const userId = req.params.userId
    const jwtId = req.jwt.id
    const number = req.body.number
    
    if(!number) {
        res.status(400)
        throw new Error("UNAUTHORIZED")
    }

    if(!jwtId) {
        res.status(400)
        throw new Error("USERID_IS_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(jwtId)){
        res.status(400)
        throw new Error("INVALID_USERID")
    }

    const user = await User.findById(jwtId)

    const isDuplicateNumber = await duplicateNumber(number, user.device)
    if(isDuplicateNumber) {
        res.status(400)
        throw new Error("NUMBER_ALREADY_EXIST")
    }

    const newDevice = {
        id: mongoose.Types.ObjectId(),
        deviceId: req.body.deviceName || shortid.generate(),
        number,
        status: true,
        qrCode: ''
    }

    user.device.push(newDevice)
    user.save()

    if(!user){
        res.status(404)
        throw new Error('ADD_DEVICE_FAILED')
    }

    res.status(200).json({
        status: true,
        message: "ADD_DEVICE_SUCCESS",
        user: user.device
    })
})

const showDevice = asyncHandler(async(req, res) => {
    // url = doman/device/userId/
    // const userId = req.params.userId
    const jwtId = req.jwt.id
    
    
    
    if(!jwtId) {
        res.status(400)
        throw new Error("USERID_IS_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(jwtId)){
        res.status(400)
        throw new Error("INVALID_USERID")
    }

    const user = await User.findById(jwtId)
    
    if(!user){
        res.status(404)
        throw new Error('USER_NOT_FOUND')
    }

    res.status(200).json({
        status: true,
        message: "GET_USER_DEVICE_SUCCESS",
        user: {
            id: user.id,
            device: user.device
        }
    })
})

module.exports = {
    addDevice,
    showDevice
}