const Message = require('../models/Message')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const shortid = require('shortid')
const duplicateNumber = require('../libraries/duplicateNumber')
const { response } = require('express')
const User = require('../models/User')
const activeDeviceId = require('../libraries/activeDeviceId')

const addMessage = asyncHandler(async(req, res) => {
    const jwtId = req.jwt.id

    if(!jwtId) {
        res.status(400)
        throw new Error("UNAUTHORIZED")
    }

    if(!req.body.deviceId) {
        res.status(400)
        throw new Error("DEVICE_ID_REQUIRED")
    }

    if(!req.body.to) {
        res.status(400)
        throw new Error("TO_REQUIRED")
    }

    if(!req.body.message) {
        res.status(400)
        throw new Error("MESSAGE_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(jwtId)){
        res.status(400)
        throw new Error("INVALID_ID")
    }

    if(!mongoose.Types.ObjectId.isValid(jwtId) || !mongoose.Types.ObjectId.isValid(req.body.deviceId)){
        res.status(400)
        throw new Error("INVALID_ID")
    }

    const user = await User.findById(jwtId)
    if(!user){
        res.status(400)
        throw new Error("NO_USER_FOUND")
    }

    const isDeviceIdActive = await activeDeviceId(req.body.deviceId, user)
    // console.log(isDeviceIdActive)
    if(!isDeviceIdActive){
        res.status(400)
        throw new Error("ACTIVE_DEVICE_NOT_FOUND")
    }

    const message = await Message.create(
        {   
            userId: jwtId,
            ...req.body
        }
    )

    if(!message){
        res.status(500)
        throw new Error("CREATE_MESSAGE_TASK_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "CREATE_MESSAGE_TASK_SUCCESS",
        message
    })
    
})

module.exports = {
    addMessage
}