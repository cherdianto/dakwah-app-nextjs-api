import asyncHandler from 'express-async-handler'

const allowedRole = (roleArray) => {
    const check = asyncHandler(async (req, res, next) => {
        console.log(roleArray)
        console.log(req.user.role)
        console.log(roleArray.includes(req.user.role))
      if ( req.user && roleArray.includes(req.user.role)) {
        console.log('role OK')
        next()
      } else {
        res.status(404)
        throw new Error('Unauthorized')
      }
    })

    return check
}

export default allowedRole