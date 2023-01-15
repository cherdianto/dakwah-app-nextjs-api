const mongoose = require("mongoose")
const dotenv = require('dotenv')

const env = dotenv.config().parsed

function dbConnection(){
        mongoose.connect('mongodb://127.0.0.1:27017/dakwahbot', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    const db = mongoose.connection
    db.on('error', (error) => console.log(error))
    db.once('open', () => console.log('database connected'))
}

module.exports=dbConnection