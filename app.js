const express = require('express');
const dbConnection = require('./libraries/dbConnect')
const dotenv = require('dotenv')
const env = dotenv.config().parsed
const errorHandler = require('./middlewares/errorMiddleware')
const authRouter = require('./routers/authRouter')
// const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

dbConnection();

// const fs = require('fs')
const app = express()
const PORT = env.PORT

// index routing and middleware
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(morgan('dev'))

// routers
app.use('/auth', authRouter)
app.use(errorHandler)

// server.listen(PORT, () => {
app.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});