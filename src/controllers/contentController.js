import Materi from '../models/Materi.js'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
const env = dotenv.config().parsed

export const addContent = asyncHandler( async( req, res) => {
    const materiId = req.params.materiid

    if(!materiId) {
        res.status(400)
        throw new Error("MATERI_ID_IS_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(materiId)){
        res.status(400)
        throw new Error("INVALID_MATERI_ID")
    }

    const newContent = {
        id: mongoose.Types.ObjectId(),
        matan: req.body.matan,
        subTitle: req.body.subTitle
    }

    const materi = await Materi.findByIdAndUpdate( materiId,
        {
            $push: { content: newContent }
        },
        { new: true })
    
    if(!materi){
        res.status(404)
        throw new Error('ADD_CONTENT_FAILED')
    }

    res.status(200).json({
        status: true,
        message: "ADD_CONTENT_SUCCESS",
        materi
    })
})

export const updateContent = asyncHandler( async(req, res) => {
    // url : /api/materi/:materiId/content/:contentId
    const userId = req.user._id
    const materiId = req.params.materiid
    const contentId = req.params.contentid

    if(!materiId) {
        res.status(400)
        throw new Error("MATERI_ID_IS_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(materiId)){
        res.status(400)
        throw new Error("INVALID_MATERI_ID")
    }

    if(!contentId) {
        res.status(400)
        throw new Error("CONTENT_ID_IS_REQUIRED")
    }

    if(!mongoose.Types.ObjectId.isValid(contentId)){
        res.status(400)
        throw new Error("INVALID_CONTENT_ID")
    }

    let field = {}
    if(req.body.hasOwnProperty('subTitle')){
        field['content.$[indexContent].subTitle'] = req.body.subTitle
    }
    
    if(req.body.hasOwnProperty('matan')){
        field['content.$[indexContent].matan'] = req.body.matan
    }

    // console.log(field)

    const content = await Materi.findByIdAndUpdate(
        materiId, 
        { $set: field }, 
        { arrayFilters: [{ 
            'indexContent.id': mongoose.Types.ObjectId(contentId) }], 
            new: true 
        })

        // console.log(content)

    if(!content){
        res.status(400)
        throw new Error("CONTENT_UPDATE_FAILED")
    }

    // console.log(content)

    res.status(200).json({
        status: true,
        message: "CONTENT_UPDATE_SUCCESS",
        content
    })
})

export const deleteContent = asyncHandler( async(req, res) => {
    const userId = req.user._id
    const materiId = req.params.materiid
    const contentId = req.params.contentid

    const content = await Materi.findByIdAndUpdate(
        materiId,
        { $pull: {
            content: { id: mongoose.Types.ObjectId(contentId)}
        }},
        {
            new: true    
        }
    )

    if(!content){
        res.status(400)
        throw new Error("DELETE_CONTENT_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "DELETE_CONTENT_SUCCESS",
        content
    })
})


export const showContent = asyncHandler( async(req, res) => {
    const materiId = req.params.materiid

    const materi = await Materi.findById(materiId).select('content')

    if(!materi){
        res.status(400)
        throw new Error("CONTENT_NOT_FOUND")
    }

    res.status(200). json({
        status: true,
        message:"CONTENT_FOUND",
        materi
    })
})
