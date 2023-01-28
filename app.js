import express from 'express';
import dbConnection from './libraries/dbConnect.js'
import dotenv from 'dotenv'
const env = dotenv.config().parsed
import errorHandler from './middlewares/errorMiddleware.js'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
// import routes
import authRouter from './routers/authRouter.js'
import materiRouter from './routers/materiRouter.js'

dbConnection();

// const fs = require('fs')
const app = express()
const PORT = env.PORT

// middlewares
app.use(cors({
    credentials: true, origin: 'http://localhost:3000'
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