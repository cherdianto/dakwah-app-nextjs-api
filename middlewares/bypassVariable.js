const bypassVariable = (io, sessions) => {
    const bypass = (req, res, next) => {
        req.sessions = sessions
        req.io = io
        next()
    }

    return bypass
}

module.exports = bypassVariable