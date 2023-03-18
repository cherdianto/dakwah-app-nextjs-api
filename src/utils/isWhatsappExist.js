import User from "../models/User.js"

const isWhatsappExist = async (whatsapp) => {
    const response = await User.findOne({
        whatsapp
    })

    return response
}

export default isWhatsappExist