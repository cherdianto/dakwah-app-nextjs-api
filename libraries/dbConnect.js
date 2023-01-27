const mongoose = require("mongoose")
const dotenv = require('dotenv')

const env = dotenv.config().parsed
const dbUrl = env.ENV === 'dev' ? env.ATLAS_DB : 'mongodb://127.0.0.1:27017/dakwahbot'
console.log(dbUrl)

function dbConnection(){
        mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    const db = mongoose.connection
    db.on('error', (error) => console.log(error))
    db.once('open', () => console.log('database connected'))
}

module.exports=dbConnection