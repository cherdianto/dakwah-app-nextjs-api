const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    deviceId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    to: {
        type: Number,
        required: true
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        required: true
    },
    ref_id: {
        type: String
    },
    retry: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending','sent', 'read', 'failed'],
        default: 'pending'
    },
    time: {
        type: String,
        required: true,
        default: Math.floor(Date.now() / 1000)
    },
    createdAt: {
        type: Number
    },
    updatedAt: {
        type: Number
    }
}, {
    timestamps: {currentTime: () => Math.floor(Date.now() / 1000)}
    // strict: false
})

module.exports=mongoose.model('Message', Schema)