import { rateLimit } from "express-rate-limit";

export const passwordResetLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: 'Anda telah mencapai batas maksimum permintaan reset password. Silakan ulangi lagi setelah 1 jam',
    statusCode: 429,
    header: true
})

export const loginFailedLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: 'Anda telah mencapai batas maksimum percobaan login. Silakan ulangi lagi setelah 1 jam',
    statusCode: 429,
    header: true
})
