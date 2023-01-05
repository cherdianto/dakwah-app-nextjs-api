const User = require('../models/User')
const Device = require('../models/Device')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const shortid = require('shortid')
const duplicateNumber = require('../libraries/duplicateNumber')
const activeDeviceId = require('../libraries/activeDeviceId')
const libsession = require('../session')

const addDevice = asyncHandler(async(req, res) => {
    // const userId = req.user._id
    const number = req.body.number
    
    if(!number) {
        res.status(400)
        throw new Error("UNAUTHORIZED")
    }

    const isDuplicateNumber = await Device.findOne({number: number})
    if(isDuplicateNumber) {
        res.status(400)
        throw new Error("NUMBER_ALREADY_EXIST")
    }

    const newDevice = await Device.create({
        userId: req.user._id,
        deviceName: req.body.deviceName || shortid.generate(),
        number
    })

    if(!newDevice){
        res.status(500)
        throw new Error("ADD_DEVICE_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "ADD_DEVICE_SUCCESS",
        device: newDevice
    })
})

const showDevices = asyncHandler(async(req, res) => {
    const userId = req.user._id

    const device = await Device.find({userId})

    res.status(200).json({
        status: true,
        message: "GET_USER_DEVICE_SUCCESS",
        device
    })
})

const scanQrcode = asyncHandler(async (req, res) => {
    // const jwtId = req.jwt.id 
    // console.log(req.sessions)
    let sessions = req.sessions
    let io = req.io
    const jwtId = req.params.userid
    const id = req.params.deviceid

    const user = await User.findById(jwtId)
    if (!user) {
        res.status(400)
        throw new Error("NO_USER_FOUND")
    }


    const isDeviceIdActive = await activeDeviceId(id, user)
    if (!isDeviceIdActive) {
        res.status(400)
        throw new Error("ACTIVE_DEVICE_NOT_FOUND")
    }

    console.log('scan ' + id)

    try {
        await libsession({
            io,
            id,
            sessions
        })
        res.render('index')
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'scan error ' + id
        })
    }
})

const destroy = asyncHandler(async (req, res) => {
    const id = req.params.deviceid
    console.log('destroy ' + id)

    try {
        const response = sessions[id].destroy()
        
        // if(response){
        //     await User.find
        // }

        res.status(200).json({
            status: true,
            message: "DESTROY_SUCCESS",
            id
        })
    } catch (error) {
        console.log('destroy failed ' + id)
        res.status(500)
        throw new Error("DESTROY_FAILED")
    }
})

const logout = asyncHandler(async (req, res) => {
    const id = req.params.deviceid
    console.log('logout ' + id)

    try {
        sessions[id].logout()
    
        res.status(200).json({
            status: true,
            message: "LOGOUT_SUCCESS",
            id
        })
    } catch (error) {
        console.log('logout failed ' + id)
        res.status(500)
        throw new Error("LOGOUT_FAILED")
    }
})

const getState = asyncHandler(async (req, res) => {
    const id = req.params.deviceid
    console.log('getState ' + id)

    try {
        const response = sessions[id].getState()
    
        res.status(200).json({
            status: true,
            message: "GET_STATE_SUCCESS",
            state: response
        })
    } catch (error) {
        console.log('getState failed ' + id)
        res.status(500)
        throw new Error("GET_STATE_FAILED")
    }
})

module.exports = {
    addDevice,
    showDevices,
    scanQrcode,
    destroy,
    logout,
    getState
}