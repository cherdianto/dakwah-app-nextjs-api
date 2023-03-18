import bcrypt from 'bcrypt'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import crypto from 'crypto'

import User from "../models/User.js"
import Token from "../models/Token.js"
import gmailSend from "../utils/emailSender.js"
import response from '../utils/response.js'
import isEmailExist from '../utils/isEmailExist.js'
import isWhatsappExist from '../utils/isWhatsappExist.js'

const env = dotenv.config().parsed
const apiUrl = env.ENV === 'dev' ? env.URL_API_DEV : env.URL_API_PROD
const accessSecretKey = env.ACCESS_SECRET_KEY
const refreshSecretKey = env.REFRESH_SECRET_KEY
const accessExpiry = env.ACCESS_EXPIRY
const refreshExpiry = env.REFRESH_EXPIRY

function generateToken() {
    const buffer = crypto.randomBytes(32);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

const generateAccessToken = (payload) => {
    return jwt.sign(payload, accessSecretKey, {
        expiresIn: accessExpiry
    })
}

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, refreshSecretKey, {
        expiresIn: refreshExpiry
    })
}


export const register = asyncHandler(async (req, res) => {
    const {
        fullname,
        email,
        whatsapp,
        password
    } = req.body

    // INPUT VALIDATION
    if (!fullname) response(res, 400, false, "FULLNAME REQUIRED")
    if (!email) response(res, 400, false, "EMAIL REQUIRED")
    if (!whatsapp) response(res, 400, false, "WHATSAPP REQUIRED")
    if (!password) response(res, 400, false, "PASSWORD REQUIRED")

    const isDuplicateEmail = isEmailExist(email)
    if (isDuplicateEmail) response(res, 400, false, "EMAIL ALREADY EXIST")

    const isDuplicateWhatsapp = await isWhatsappExist(whatsapp)
    if (isDuplicateWhatsapp) response(res, 400, false, "WHATSAPP ALREADY EXIST")

    // ENCRIPT THE PASSWORD
    let salt = await bcrypt.genSalt(12)
    let hashedPassword = await bcrypt.hash(password, salt)

    // STORE TO DB
    try {
        const user = await User.create({
            fullname,
            email,
            whatsapp,
            password: hashedPassword
        })

        const {
            password,
            accessToken,
            refreshToken,
            ...rest
        } = user

        response(res, 200, true, "USER REGISTER SUCCESS", rest)

    } catch (error) {
        response(res, 500, 'USER REGISTRATION FAILED')
    }
})

export const login = asyncHandler(async (req, res) => {

    // SECURE CODE, PREVENT SQL INJECTION
    const email = req.body.email.toString()
    const password = req.body.password.toString()

    // INPUT VALIDATION
    if (!email) response(res, 400, false, 'EMAIL REQUIRED')
    if (!password) response(res, 400, false, 'PASSWORD REQUIRED')

    // USER CHECK BY EMAIL
    const isEmailRegistered = await isEmailExist(email)
    if (!isEmailRegistered) response(res, 400, false, 'EMAIL NOT REGISTERED')

    const user = isEmailRegistered

    // PASSWORD CHECK
    const isPasswordMatch = bcrypt.compareSync(password, user.password)
    if (!isPasswordMatch) response(res, 400, false, 'PASSWORD MISMATCH')

    // GENERATE ACCESS TOKEN
    const accessToken = generateAccessToken({
        id: user._id,
        role: user.role
    })

    // GENERATE REFRESH TOKEN
    const refreshToken = generateRefreshToken({
        id: user._id,
        role: user.role
    })

    // STORE TOKENS TO DB
    const updateDb = await User.updateOne({
        _id: user._id
    }, {
        $set: {
            refreshToken,
            accessToken
        }
    })

    if (!updateDb) response(res, 500, false, 'ERROR UPDATE DB')

    // SET COOKIES
    if (env.ENV === 'dev') {
        res.cookie('refreshToken', refreshToken, {
            maxAge: 90 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
    } else {
        res.cookie('refreshToken', refreshToken, {
            maxAge: 90 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            domain: 'cherdianto.site',
            path: '/'
        })
    }

    response(res, 200, true, "LOGIN SUCCESS", {
        fullname: user.fullname,
        whatsapp: user.whatsapp,
        email: user.email,
        role: user.role,
        language: user.language,
        accessToken
    })
})

export const updateProfile = asyncHandler(async (req, res) => {
    const {
        fullname,
        email,
        whatsapp,
        language
    } = req.body

    
    // INPUT VALIDATION
    if (!fullname) response(res, 400, false, "FULLNAME REQUIRED")
    if (!email) response(res, 400, false, "EMAIL REQUIRED")
    if (!whatsapp) response(res, 400, false, "WHATSAPP REQUIRED")
    if (!language) response(res, 400, false, "LANGUAGE REQUIRED")
    
    // GET USER DATA FROM VERIFYTOKEN MIDDLEWARE
    const user = req.user
    const userId = user._id

    // IS USER CHANGE WHATSAPP NUMBER?
    if (whatsapp != user.whatsapp) {
        const isDuplicateWhatsapp = await isWhatsappExist(whatsapp)
        if (isDuplicateWhatsapp) response(res, 400, false, "WHATSAPP ALREADY REGISTERED")
    }

    // UPDATE DATABASE
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                fullname,
                whatsapp,
                language,
                email
            }
        }, {
            new: true
        })

        response(res, 200, true, "UPDATE PROFILE SUCCESS", {
            fullname: updatedUser.fullname,
            whatsapp: updatedUser.whatsapp,
            language: updatedUser.language,
            email: updatedUser.email,
            role: updatedUser.role
        })

    } catch (error) {
        response(res, 500, false, "UPDATE PROFILE FAILED")
    }
})

export const logout = asyncHandler(async (req, res) => {
    // GET COOKIE FROM REQ HEADERS
    const userRefreshToken = req.cookies.refreshToken

    // NO REFRESH TOKEN FOUND = FORCE TO LOGOUT
    if (!userRefreshToken) {
        res.status(204)
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            domain: 'cherdianto.site',
            path: '/'
        })
        
        return response(res, 200, true, "LOGOUT SUCCESS")
    }
    
    // REFRESH TOKEN FOUND
    jwt.verify(userRefreshToken, refreshSecretKey, async (error, decoded) => {

        // FORCE CLEAR COOKIE
        if (env.ENV === 'dev') {
            res.clearCookie('refreshToken')
        } else {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                domain: 'cherdianto.site',
                path: '/'
            })
        }

        if (decoded) {
            const user = await User.findById(decoded.id)
            
            // IF USER NOT FO
            if (user) {
                // REMOVE TOKENS FROM DATABASE
                const updateDb = await User.updateOne({
                    _id: user._id
                }, {
                    $set: {
                        refreshToken: '',
                        accessToken: ''
                    }
                })
            }
        }

        return  response(res, 200, true, "LOGOUT SUCCESS")
    })

})

export const changePassword = asyncHandler(async (req, res) => {
    // form : email, oldpassword, newpassword

    const {
        email,
        oldPassword,
        newPassword
    } = req.body

    const user = req.user

    if (!email || email == '') {
        res.status(400)
        throw new Error("EMAIL_REQUIRED")
    }

    // if(!oldPassword || oldPassword == ''){
    //     res.status(400)
    //     throw new Error("OLD_PASSWORD_REQUIRED")
    // }

    if (!newPassword || newPassword == '') {
        res.status(400)
        throw new Error("NEW_PASSWORD_REQUIRED")
    }

    if (newPassword.trim().length === 0 || newPassword.includes(" ")) {
        res.status(400)
        throw new Error("PASSWORD_CONTAIN_SPACE")
    }

    if (email !== user.email) {
        res.status(400)
        throw new Error("EMAIL_NOT_FOUND")
    }

    const oldUserData = await User.findOne({
        email
    })
    if (!oldUserData) {
        res.status(400)
        throw new Error("USER_NOT_FOUND")
    }

    const isMatch = bcrypt.compareSync(oldPassword, oldUserData.password)
    if (!isMatch) {
        res.status(400)
        throw new Error("WRONG_PASSWORD")
    }

    // make salt
    let salt = await bcrypt.genSalt(12)
    // hash the password
    let hashedPassword = await bcrypt.hash(newPassword, salt)

    // update db
    const updateDb = await User.updateOne({
        _id: user._id
    }, {
        $set: {
            password: hashedPassword
        }
    })

    if (!updateDb) {
        res.status(500)
        throw new Error("PASSWORD_CHANGE_FAILED")
    }

    res.status(200).json({
        status: true,
        message: "PASSWORD_CHANGE_SUCCESS"
    })
})

export const refreshToken = asyncHandler(async (req, res) => {
    const userRefreshToken = req.cookies.refreshToken

    if (!userRefreshToken) response(res, 401, false, "REFRESH TOKEN NOT FOUND")

    // const user = await User.findOne({
    //     refreshToken: userRefreshToken
    // })

    // if (!user) {
    //     res.status(401)
    //     throw new Error("USER_NOT_LOGGED_IN")
    // }

    jwt.verify(userRefreshToken, refreshSecretKey, async (error, decoded) => {
        if (error) response(res, 401, false, "INVALID REFRESH TOKEN")

        const user = await User.findById(decoded.id)

        if (!user) response(res, 401, false, "USER NOT FOUND")

        const accessToken = generateAccessToken({
            id: user._id,
            role: user.role
        })

        response(res, 200, true, "ACCESS TOKEN SUCCESS", {accessToken})
    })
})

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -refreshToken')
    response(res, 200, true, "GET USER SUCCESS", user)
})

export const resetPassword = asyncHandler(async (req, res) => {
    const email = req.query.email
    if (!email) response(res, 400, false, "EMAIL REQUIRED")

    const isEmailRegistered = await isEmailExist(email)
    if (!isEmailRegistered) response(res, 400, false, "EMAIL NOT FOUND")

    // SET TOKEN EXPIRATION
    let expiryAt = new Date()
    expiryAt.setMinutes(expiryAt.getMinutes() + 15)

    const newToken = await Token.create({
        email,
        token: generateToken(),
        expiryAt
    })

    if (!newToken) {
        res.status(400)
        throw new Error("RESET_LINK_FAILED")
    }

    // SEND NOTIFICATION TO USER EMAIL
    const sendEmail = await gmailSend({
        to: email,
        subject: 'Password Reset Request',
        html: `<p>Berikut link untuk melakukan pengubahan password</p><p></p><p>${apiUrl}/auth/rst?token=${newToken.token}</p><p>Berlaku 15 menit</p><p></p><p>Abaikan jika Anda tidak melakukan permintaan permohonan pengubahan password.</p>`
    })

    if (sendEmail === 'error') response(res, 400, false, "SEND EMAIL FAILED")

    response(res, 200, true, "LINK RESET PASSWORD SUCCESS")
})

export const validateResetLink = asyncHandler(async (req, res) => {
    const token = req.query.token

    const isValid = await Token.findOne({
        token
    })

    if (!isValid) response(res, 400, false, "INVALID TOKEN OR HAS BEEN USED")

    if (new Date(isValid.expiryAt) < Date.now()) {
        res.status(400)
        // throw new Error("EXPIRED")
        res.render('tokenExpired')
    }

    // res.status(200).json("LINK ACTIVE, PROVIDE A FORM(NEW PWD, NEW PWD CONFIRM) TO USER VIA EJS")
    res.render('inputPassword', {
        token
    })
})

export const newPasswordFromReset = asyncHandler(async (req, res) => {
    const {
        token,
        new_password,
        confirm_new_password
    } = req.body

    if (!token || token == '') response(res, 400, false, "TOKEN REQUIRED")
    if (!new_password || new_password == '') response(res, 400, false, "NEW PASSWORD REQUIRED")
    if (!confirm_new_password || confirm_new_password == '') response(res, 400, false, "CONFIRM NEW PASSWORD REQUIRED")
    if (new_password !== confirm_new_password) response(res, 400, false, "PASSWORDS NOT MATCH")
    if (new_password.trim().length === 0 || new_password.includes(" ")) response(res, 400, false, "PASSWORD CONTAIN SPACE")

    const isTokenValid = await Token.findOne({
        token
    })

    if (!isTokenValid) response(res, 400, false, "INVALID TOKEN")

    if (new Date(isTokenValid.expiryAt) < Date.now()) {
        res.status(400)
        // throw new Error("EXPIRED")
        res.render('tokenExpired')
    }

    const user = await User.findOne({
        email: isTokenValid.email
    })

    if (!user) response(res, 400, false, "INVALID TOKEN")

    // make salt
    let salt = await bcrypt.genSalt(12)
    // hash the password
    let hashedPassword = await bcrypt.hash(new_password, salt)

    // update db
    const updateDb = await User.updateOne({
        _id: user._id
    }, {
        $set: {
            password: hashedPassword
        }
    })

    if (!updateDb) response(res, 400, false, "PASSWORD CHANGE FAILED")

    const deleteTokenDb = await Token.findOneAndDelete({
        token
    })

    if (!deleteTokenDb) response(res, 400, false, "DELETE TOKEN FAILED")

    res.render('passwordSuccess')
})