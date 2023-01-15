const Message = require('../models/Message')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const shortid = require('shortid')
const duplicateNumber = require('../libraries/duplicateNumber')
const { response } = require('express')
const User = require('../models/User')
const activeDeviceId = require('../libraries/activeDeviceId')

// @usage: external API
// @required params : apiKey, message, to
const addMessage = asyncHandler(async(req, res) => {
    // const to = req.body.to || req.query.to
    // const message = req.body.message || req.query.message
    const device = req.device
    const user = req.user

    const {
        to = req.query.to,
        message = req.query.message,
        isGroup = req.query.isGroup,
        ref_id = req.query.ref_id,
        retry = req.query.retry,
        priority = req.query.priority,
    } = req.body

    console.log(isGroup)

    if(!to) {
        res.status(400)
        throw new Error("TO_REQUIRED")
    }

    if(!message) {
        res.status(400)
        throw new Error("MESSAGE_REQUIRED")
    }

    // const isDeviceIdActive = await activeDeviceId(req.body.deviceId, user)
    // console.log(isDeviceIdActive)
    if(!device.status === false){
        res.status(400)
        throw new Error("INACTIVE_DEVICE")
    }

    const sendMsg = await Message.create(
        {   
            userId: user._id,
            deviceId: device._id,
            message,
            to,
            isGroup,
            retry,
            priority,
            ref_id
        }
    )

    if(!sendMsg){
        res.status(500)
        throw new Error("CREATE_MESSAGE_TASK_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "CREATE_MESSAGE_TASK_SUCCESS",
        sendMsg
    })
    
})

module.exports = {
    addMessage
}