const { Client, LocalAuth, RemoteAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');
const dbConnection = require('./libraries/dbConnect')
const dotenv = require('dotenv')
const env = dotenv.config().parsed

// const fs = require('fs')
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const PORT = env.PORT

dbConnection();

let sessions = {}
let rooms = []

const session = (id) => {

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
                '--disable-gpu'
            ]
        },
        authStrategy: new LocalAuth({
            clientId: id
        }),
    }

    sessions[id] = new Client(pptOptions)

    sessions[id].initialize()

    let statusConnection = {}
    io.on('connection', (socket) => {
        let now = new Date().toLocaleString();
        statusConnection[id] = 'initializing'
        console.log(rooms)

        if(id == undefined || id === ""){
            return false
        }

        if(!rooms.includes(`${id}`)){
            rooms.push(`${id}`)

            console.log('joining')
            socket.join(`${id}`)
            io.sockets.in(`${id}`).emit('message', `${now} socket.io is Connected at room ` + id);
            io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id])
        }

        socket.on('disconnect', async function () {
            // if (statusConnection !== 'connected') {
            //     console.log('close without connecting')
            //     await whatsapp.destroy()
            // }
            console.log('???')
            console.log(socket)
        })


        sessions[`${id}`].on('qr', (qr) => {
            console.log('rooms ??? ' +rooms)
            // console.log(whatsapp)
            now = new Date().toLocaleString();
            statusConnection[id] = 'qr';
            qrcode.toDataURL(qr, (err, url) => {
                qrCodeString = url;
                io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
                io.sockets.in(`${id}`).emit("qr", url);
                io.sockets.in(`${id}`).emit('message', `${now} QR Code received`);
                console.log(id + ' scan qr code')
            });
        });

        sessions[id].on('message', msg => {
            console.log('MESSAGE session : ' + id)
            // console.log(msg)
            if (msg.body == '!ping') {
                setTimeout(() => {
                    msg.reply('pong');
                }, 2000)
            }
        });

        sessions[id].on('ready', () => {
            now = new Date().toLocaleString();
            statusConnection[id] = 'connected';
            io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
            io.sockets.in(`${id}`).emit('message', `${now} WhatsApp is ready!`);
            console.log(id + ' whatsapp ready')
        });

        sessions[id].on('authenticated', (session) => {
            now = new Date().toLocaleString();
            statusConnection[id] = 'authenticated'
            io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
            io.sockets.in(`${id}`).emit('message', `${now} Whatsapp is authenticated!`);
            console.log(id + ' is auth-ed')
        });

        sessions[id].on('auth_failure', function (session) {
            now = new Date().toLocaleString();
            statusConnection[id] = 'auth_failure'
            io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
            io.sockets.in(`${id}`).emit('message', `${now} Auth failure, restarting...`);

            console.log(id + ' if fail')
        });

        sessions[id].on('disconnected', async function () {
            now = new Date().toLocaleString();
            statusConnection[id] = 'disconnected'
            io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
            io.sockets.in(`${id}`).emit('message', `${now} Disconnected`);

            console.log(id + ' is disconnectd')
            await sessions[id].destroy();

        });

    })

    return sessions[id]
}



// index routing and middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// whatsapp.initialize();

app.get('/scan', async (req, res) => {
    const id = req.body.id || req.query.id
    console.log('scan ' + id)

    try {
        console.log('135')
        const response = await session(id)
        console.log(response)
        
        res.sendFile('index.html', {
            root: __dirname
        });
    } catch (error) {
        res.status(500).json({
            msg: 'scan error ' + id
        })
    }
});

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

// app.get('/device/logout', async (req, res) => {
//     try {
//         await whatsapp.logout()
//         await whatsapp.destroy()
//         res.status(200).json(response)
//     } catch (error) {
//         res.status(500).json({error})
//         // throw new Error(error)
//     }
// })

// // initialize whatsapp and the example event
// whatsapp.on('message', msg => {
//     console.log(msg)
//     if (msg.body == '!ping') {
//         setTimeout(() => {
//             msg.reply('pong');
//         }, 2000)
//     }
// });


// // whatsapp.initialize();

// let statusConnection = 'initializing'
// // .then((res) => {
// //     console.log(res)
// // }).catch(err => console.log(err)) //connected, disconnected, waiting
// // console.log(statusConnection)
// let qrCodeString = ''

// // socket connection
// let today = new Date();
// let now = today.toLocaleString();
// io.on('connection', (socket) => {
//     socket.emit('message', `${now} socket.io is Connected`);
//     socket.emit('statusConnection', statusConnection)

//     socket.on('disconnect', async function(){
//         if(statusConnection !== 'connected'){
//             console.log('close without connecting')
//             await whatsapp.destroy()
//         }
//     })

//     whatsapp.on('qr', (qr) => {
//         // console.log(whatsapp)
//         now = new Date().toLocaleString();
//         statusConnection = 'qr';
//         qrcode.toDataURL(qr, (err, url) => {
//             qrCodeString = url;
//             socket.emit('statusConnection', statusConnection);
//             socket.emit("qr", url);
//             socket.emit('message', `${now} QR Code received`);
//             console.log('scan qr code')
//         });
//     });

//     whatsapp.on('ready', () => {
//         now = new Date().toLocaleString();
//         statusConnection = 'connected';
//         socket.emit('statusConnection', statusConnection);
//         socket.emit('message', `${now} WhatsApp is ready!`);
//         console.log('whatsapp ready')
//     });

//     whatsapp.on('authenticated', (session) => {
//         now = new Date().toLocaleString();
//         statusConnection = 'authenticated'
//         socket.emit('statusConnection', statusConnection);
//         socket.emit('message', `${now} Whatsapp is authenticated!`);
//         console.log('is auth-ed')
//     });

//     whatsapp.on('auth_failure', function (session) {
//         now = new Date().toLocaleString();
//         statusConnection='auth_failure'
//         socket.emit('statusConnection', statusConnection);
//         socket.emit('message', `${now} Auth failure, restarting...`);

//         console.log('if fail')
//     });

//     whatsapp.on('disconnected', async function () {
//         now = new Date().toLocaleString();
//         statusConnection = 'disconnected'
//         socket.emit('statusConnection', statusConnection);
//         socket.emit('message', `${now} Disconnected`);

//         console.log('is disconnectd')
//         await whatsapp.destroy();
//         // whatsapp.initialize();
//         // }
//     });
// });


// // send message routing
// app.post('/send', (req, res) => {
//     const phone = req.body.phone;
//     const message = req.body.message;

//     whatsapp.sendMessage(phone, message)
//         .then(response => {
//             res.status(200).json({
//                 error: false,
//                 data: {
//                     message: 'Pesan terkirim',
//                     meta: response,
//                 },
//             });
//         })
//         .catch(error => {
//             res.status(200).json({
//                 error: true,
//                 data: {
//                     message: 'Error send message',
//                     meta: error,
//                 },
//             });
//         });
// });

server.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});