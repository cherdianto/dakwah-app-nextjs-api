const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true,
        default: 'https://i.ibb.co/4m50NPZ/asparagus.jpg'
    },
    rating: Number,
    student: String,
    label: Array,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    description: String,
    content: Array,
    createdAt: Number,
    updatedAt: Number
}, {
    timestamps: {currentTime: () => Math.floor(Date.now() / 1000)}
})

module.exports=mongoose.model('Materi', Schema)