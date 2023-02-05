import dotenv from 'dotenv'
const env = dotenv.config().parsed

const errorHandler = (err, req, res, next) => {
    const statusCode = req.statusCode ? req.statusCode : 500

    res.status(statusCode)

    res.json({
        status: false,
        message: err.message,
        stack: env.ENV === 'dev' ? err.stack : null
    })
}

export default errorHandler