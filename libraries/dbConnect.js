const mongoose = require("mongoose")
const dotenv = require('dotenv')

const env = dotenv.config().parsed

function dbConnection(){
        mongoose.connect(env.LOCAL_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    const db = mongoose.connection
    db.on('error', () => console.log(error))
    db.once('open', () => console.log('database connected'))
}

module.exports=dbConnection