const Materi = require('../models/Materi')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const env = dotenv.config().parsed

const addMateri = asyncHandler( async( req, res) => {
    // @PENDING
    // LATER IT SHOULD BE PROTECTED BY RBAC (ONLY ADMIN CAN ADD MATERI)
    const { name, img, description, content } = req.body
    const newMateri = await Materi.create({
        name,
        img,
        description,
        content 
    })

    if(!newMateri){
        res.status(500)
        throw new Error("CREATE_NEW_MATERI_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "CREATE_NEW_MATERI_SUCCESS",
        newMateri
    })
})

const showMateri = asyncHandler( async(req, res) => {
    const materiId = req.params.materiid

    if(!materiId) {
        res.status(400)
        throw new Error("ID_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(materiId)){
        res.status(400)
        throw new Error("ID_INVALID")
    }

    const materi = await Materi.findById(materiId)

    if(!materi){
        res.status(500)
        throw new Error("MATERI_NOT_FOUND")
    }

    res.status(200).json({
        status: true,
        message: "SHOW_MATERI",
        materi
    })
})

const showAllMateri = asyncHandler( async(req, res) => {
    const allMateri = await Materi.find({})

    if(!allMateri){
        res.status(500)
        throw new Error("MATERI_NOT_FOUND")
    }

    res.status(200).json({
        status: true,
        message: "LIST_OF_MATERI",
        list: allMateri
    })
})


const deleteMateri = asyncHandler( async(req, res) => {
    // @PENDING
    // LATER IT SHOULD BE PROTECTED BY RBAC (ONLY ADMIN CAN DELETE MATERI)

    const materiId = req.params.materiid

    if(!materiId) {
        res.status(400)
        throw new Error("ID_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(materiId)){
        res.status(400)
        throw new Error("ID_INVALID")
    }

    const deletedMateri = await Materi.findByIdAndDelete(materiId)

    if(!deletedMateri){
        res.status(500)
        throw new Error("MATERI_DELETE_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "MATERI_DELETE_SUCCESS",
        deletedMateri
    })
})

const updateMateri = asyncHandler( async(req, res) => {
    // @PENDING
    // LATER IT SHOULD BE PROTECTED BY RBAC (ONLY ADMIN CAN UPDATE MATERI)

    const materiId = req.params.materiid

    if(!materiId) {
        res.status(400)
        throw new Error("ID_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(materiId)){
        res.status(400)
        throw new Error("ID_INVALID")
    }

    const updatedMateri = await Materi.findByIdAndUpdate(
        materiId,
        req.body,
        { new: true }
    )

    if(!updatedMateri){
        res.status(500)
        throw new Error("MATERI_UPDATE_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "MATERI_UPDATE_SUCCESS",
        updatedMateri
    })
})

module.exports = {
    addMateri,
    showMateri,
    showAllMateri,
    deleteMateri,
    updateMateri
}


// const deleteMateri = asyncHandler( async(req, res) => {
    // const deletedMateri = await Materi.findByIdAndDelete(materiId)

    // if(!deletedMateri){
    //     res.status(500)
    //     throw new Error("MATERI_DELETE_FAILED")
    // }

    // res.status(200).json({
    //     status: true,
    //     message: "MATERI_DELETE_SUCCESS",
    //     deletedMateri
    // })
// })