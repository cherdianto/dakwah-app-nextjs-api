import User from "../models/User.js"

const isEmailExist = async (email) => {
    const response = await User.findOne({
        email: email
    })
    
    return response
}

export default isEmailExist