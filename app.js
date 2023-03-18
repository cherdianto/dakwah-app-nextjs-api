import express from 'express';
import dbConnection from './src/libraries/dbConnect.js'
import dotenv from 'dotenv'
const env = dotenv.config().parsed
import errorHandler from './src/middlewares/errorMiddleware.js'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import cors from 'cors'
// import routes
import authRouter from './src/routers/authRouter.js'
import materiRouter from './src/routers/materiRouter.js'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientUrl = env.ENV === 'dev' ? env.URL_DEV : env.URL_PROD

dbConnection();

// const fs = require('fs')
const app = express()
const PORT = env.PORT

app.set('views', path.join(__dirname, '/src', 'views'));
app.set('view engine', 'ejs')
// middlewares
app.use(cors({
    credentials: true, origin: clientUrl
}))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(morgan('dev'))

// routers
app.use('/auth', authRouter)
app.use('/api/materi', materiRouter )
app.use(errorHandler)

// server.listen(PORT, () => {
app.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});