import express from 'express'
import verifyToken from '../middlewares/verifyToken.js'
import { register, login, logout, refreshToken, changePassword, getUser, resetPassword, validateResetLink, updateProfile, newPasswordFromReset } from '../controllers/authController.js'
import { loginFailedLimiter, passwordResetLimiter }  from '../utils/rateLimiter.js'
const router = express.Router()

router.post('/register', register)
router.post('/login', loginFailedLimiter, login)
router.get('/change-password', verifyToken, changePassword)
router.get('/user', verifyToken, getUser)
router.put('/update-profile', verifyToken, updateProfile)
router.get('/logout', logout)
router.get('/refreshToken', refreshToken)

// CHANGE PASSWORD
router.post('/change-password', verifyToken, changePassword)
router.get('/reset-password', passwordResetLimiter, resetPassword)
router.get('/rst', validateResetLink)
router.post('/new-password', newPasswordFromReset)

export default router