const {
    Client,
    LocalAuth,
    RemoteAuth
} = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');
const dbConnection = require('./libraries/dbConnect')
const {
    MongoStore
} = require('wwebjs-mongo')
const mongoose = require('mongoose')
// const ejs = require('ejs')
const path = require('path')
const asyncHandler = require('express-async-handler')
const dotenv = require('dotenv')
const env = dotenv.config().parsed

const errorHandler = require('./middlewares/errorMiddleware')
const authRouter = require('./routers/authRouter')
const deviceRouter = require('./routers/deviceRouter')
const messageRouter = require('./routers/messageRouter')
const verifyToken = require('./middlewares/verifyToken');
const activeDeviceId = require('./libraries/activeDeviceId');
const User = require('./models/User');
const libsession = require('./session');
// const asyncHandler = require('express-async-handler')

// const fs = require('fs')
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const PORT = env.PORT

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

dbConnection();
// const store = new MongoStore({mongoose: mongoose})

let sessions = {}
// let rooms = []
console.log(sessions)

const restoreActiveUserSessions = asyncHandler(async () => {
    // get all active users
    let users = await User.find({
        $and: [{
            device: {
                $exists: true,
                $ne: []
            }
        }, {
            status: 'active'
        }]
    })

    // get all active devices from active users
    let activeDevices = []
    users.forEach(user => {
        user.device.forEach(chd => {
            if (chd.status === true) {
                activeDevices.push(chd.id.valueOf())
            }
        })
    })

    // restore each client
    activeDevices.forEach((id, index) => {
        setTimeout(() => {
            console.log('run id number ' + id)
            const pptOptions = {
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--disable-session-crashed-bubble',
                        '--disable-infobars'
                    ]
                },

                authStrategy: new LocalAuth({
                    clientId: id,
                }),
            }

            sessions[id] = new Client(pptOptions)

            sessions[id].initialize()

            // activate the listeners
            sessions[`${id}`].on('qr', (qr) => {
                now = new Date().toLocaleString();
                qrcode.toDataURL(qr, (err, url) => {
                    qrCodeString = url;
                    console.log(id + ' scan qr code')
                });
            });

            sessions[id].on('authenticated', (session) => {
                now = new Date().toLocaleString();
                console.log(id + ' is auth-ed')
            });
            
            sessions[id].on('ready', () => {
                now = new Date().toLocaleString();
                console.log(id + ' whatsapp ready')
            });
            
            sessions[id].on('auth_failure', function (session) {
                now = new Date().toLocaleString();

                console.log(id + ' is fail')
            });

            sessions[id].on('message', msg => {
                console.log('MESSAGE session : ' + id)
                if (msg.body == '!ping') {
                    setTimeout(() => {
                        msg.reply('pong');
                    }, 2000)
                }
            });

            sessions[id].on('disconnected', async function () {
                now = new Date().toLocaleString();
                console.log(id + ' is disconnectd')
                await sessions[id].destroy();
            });
            // end of activate listeners

        }, index * 10000)
    })
})

restoreActiveUserSessions()

// index routing and middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// routers
app.use('/auth', authRouter)
app.use('/device', deviceRouter)
app.use('/message', messageRouter)

// HARUSNYA UNDER /DEVICE/SCAN/
app.get('/scan/:userid/users/:deviceId', asyncHandler(async (req, res) => {
    // const jwtId = req.jwt.id 
    const jwtId = req.params.userid
    const id = req.params.deviceId

    const user = await User.findById(jwtId)
    if (!user) {
        res.status(400)
        throw new Error("NO_USER_FOUND")
    }


    const isDeviceIdActive = await activeDeviceId(id, user)
    if (!isDeviceIdActive) {
        res.status(400)
        throw new Error("ACTIVE_DEVICE_NOT_FOUND")
    }

    console.log('scan ' + id)

    try {
        await libsession({
            io,
            id,
            sessions
        })
        res.render('index')
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'scan error ' + id
        })
    }
}));

app.get('/init', async (req, res) => {
    const id = req.body.id
    console.log('init ' + id)
    session(id)

    res.status(200).json({
        msg: `init ${id} OK`
    })
})

app.get('/destroy', async (req, res) => {
    const id = req.body.id
    console.log('destroy ' + id)

    sessions[id].destroy()

    res.status(200).json({
        msg: `destroy ${id} OK`
    })
})

app.get('/logout', async (req, res) => {
    const id = req.body.id
    console.log('logout ' + id)
    sessions[id].logout()

    res.status(200).json({
        msg: `logout ${id} OK`
    })
})

app.get('/get-state', async (req, res) => {
    const id = req.body.id
    console.log('getState ' + id)

    try {
        const response = await sessions[id].getState()

        res.status(200).json({
            msg: `getState ${id} OK`,
            state: response
        })
    } catch (error) {
        res.status(500).json({
            msg: 'getState ' + id + ' error',
            state: 'session not found'
        })
    }

})

app.use(errorHandler)

// server.listen(PORT, () => {
server.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});