const activeSession = async (sessions, id) => {
    if(sessions.hasOwnProperty(id)){
        return true
    }

    return false
}

module.exports = activeSession