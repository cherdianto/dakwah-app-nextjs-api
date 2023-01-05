const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    // device: [{
    //     type: mongoose.Types.ObjectId,
    //     ref: 'Device'
    // }],
    refreshToken: {
        type: String
    },
    salt: {
        type: String
    },
    createdAt: {
        type: Number
    },
    updatedAt: {
        type: Number
    }
}, {
    timestamps: {currentTime: () => Math.floor(Date.now() / 1000)}
})

module.exports=mongoose.model('User', Schema)