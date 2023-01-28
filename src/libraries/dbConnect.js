import mongoose from "mongoose"
import dotenv from 'dotenv'

const env = dotenv.config().parsed
const dbUrl = env.ENV === 'dev' ? 'mongodb://127.0.0.1:27017/dakwahbot' : env.ATLAS_DB
// console.log(dbUrl)

function dbConnection(){
        mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    const db = mongoose.connection
    db.on('error', (error) => console.log(error))
    db.once('open', () => console.log('database connected'))
}

export default dbConnection