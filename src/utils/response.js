const response = ( res, statusCode = 200, success = false, message = '', data = {}) => {
    
    res.status(statusCode)

    if(!success){
        throw new Error(message)
    } else {
        res.json({
            success,
            message,
            data
        })
    }

    res.end()
}

export default response