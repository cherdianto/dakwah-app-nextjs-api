import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
const env = dotenv.config().parsed

export const accessTokenVerify = (token) => {
    const userId = ''
    jwt.verify(token, env.ACCESS_SECRET_KEY, (error, decoded) => {
        if (error) {
            // errors = invalid signature, jwt malformed, jwt must be provided, invalid token, jwt expired
            // res.status(401)
            throw new Error("INVALID_TOKEN")
        } else {
            userId = decoded.id
        }
    })

    return userId
}

export const refreshTokenVerify = (token) => {
    const userId = ''
    
    jwt.verify(token, env.REFRESH_SECRET_KEY, (error, decoded) => {
        if (error) {
            // errors = invalid signature, jwt malformed, jwt must be provided, invalid token, jwt expired
            res.status(401)
            throw new Error("INVALID_TOKEN")
        } else {
            userId = decoded.id
        }
    })

    return userId
}