import asyncHandler from 'express-async-handler'

const allowedRole = (roleArray) => {
    const check = asyncHandler(async (req, res, next) => {
      if ( req.user && roleArray.includes(req.user.role)) {
        next()
      } else {
        res.status(404)
        throw new Error('Unauthorized')
      }
    })

    return check
}

export default allowedRole