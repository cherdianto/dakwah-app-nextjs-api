const express = require('express');
const dbConnection = require('./libraries/dbConnect')
const dotenv = require('dotenv')
const env = dotenv.config().parsed
const errorHandler = require('./middlewares/errorMiddleware')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')
// import routes
const authRouter = require('./routers/authRouter')
const materiRouter = require('./routers/materiRouter')

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