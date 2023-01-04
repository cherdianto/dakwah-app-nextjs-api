const duplicateNumber = async (number, devices) => {
    let seen = new Set()

    return devices.some(device => {
        if(seen.has(device.number)){
            return true
        }

        seen.add(device.number)
        return false
    })
}

module.exports = duplicateNumber