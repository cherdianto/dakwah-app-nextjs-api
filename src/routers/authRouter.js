import express from 'express'
import verifyToken from '../middlewares/verifyToken.js'
import { register, login, logout, refreshToken, changePassword, getUser, resetPassword, validateResetLink, updateProfile, newPasswordFromReset } from '../controllers/authController.js'
import { loginFailedLimiter, passwordResetLimiter }  from '../utils/rateLimiter.js'
const router = express.Router()

router.get('/user', verifyToken, getUser)
router.get('/logout', logout)
router.get('/refreshToken', refreshToken)
router.post('/register', register)
router.post('/login', loginFailedLimiter, login)
router.put('/update-profile', verifyToken, updateProfile)

// CHANGE PASSWORD
router.get('/change-password', verifyToken, changePassword)
router.get('/rst', validateResetLink)
router.get('/reset-password', passwordResetLimiter, resetPassword)
router.post('/change-password', verifyToken, changePassword)
router.post('/new-password', newPasswordFromReset)

export default router