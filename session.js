const { Client, LocalAuth,  RemoteAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');
const dbConnection = require('./libraries/dbConnect')
const {MongoStore} = require('wwebjs-mongo')
const mongoose = require('mongoose')
// const ejs = require('ejs')
const path = require('path')
// const asyncHandler = require('express-async-handler')
const dotenv = require('dotenv')
const env = dotenv.config().parsed
const app = express()
// const server = http.createServer(app)
// const io = socketIO(server)

// const PORT = env.PORT

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// dbConnection();
// const store = new MongoStore({mongoose: mongoose})


// let sessions = {}
let rooms = []

const session = ({io, id, sessions}) => {

    const pptOptions = {
        puppeteer: {
            headless: false,
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
        // authStrategy: new RemoteAuth({
        //     store: store,
        //     clientId: id,
        //     backupSyncIntervalMs: 300000
        // }),
        authStrategy: new LocalAuth({
            clientId: id,
        }),
    }

    sessions[id] = new Client(pptOptions)

    sessions[id].initialize()

    console.log(sessions)
    console.log(io)

    // let statusConnection = {}
    // io.on('connection', (socket) => {
    //     let now = new Date().toLocaleString();
    //     statusConnection[id] = 'initializing'
    //     console.log(rooms)

    //     if(id == undefined || id === ""){
    //         return false
    //     }

    //     if(!rooms.includes(`${id}`)){
    //         rooms.push(`${id}`)

    //         console.log('joining')
    //         socket.join(`${id}`)
    //         io.sockets.in(`${id}`).emit('message', `${now} socket.io is Connected at room ` + id);
    //         io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id])
    //     }

    //     socket.on('disconnect', async function () {
    //         // if (statusConnection !== 'connected') {
    //         //     console.log('close without connecting')
    //         //     await whatsapp.destroy()
    //         // }
    //         console.log('???')
    //         console.log(socket)
    //     })

    //     sessions[`${id}`].on('qr', (qr) => {
    //         console.log('rooms ??? ' + id + ' ' + rooms)
    //         // console.log(whatsapp)
    //         now = new Date().toLocaleString();
    //         statusConnection[id] = 'qr';
    //         qrcode.toDataURL(qr, (err, url) => {
    //             qrCodeString = url;
    //             io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
    //             io.sockets.in(`${id}`).emit("qr", url);
    //             io.sockets.in(`${id}`).emit('message', `${now} QR Code received`);
    //             console.log(id + ' scan qr code')
    //         });
    //     });

    //     sessions[id].on('message', msg => {
    //         console.log('MESSAGE session : ' + id)
    //         // console.log(msg)
    //         if (msg.body == '!ping') {
    //             setTimeout(() => {
    //                 msg.reply('pong');
    //             }, 2000)
    //         }
    //     });

    //     sessions[id].on('ready', () => {
    //         now = new Date().toLocaleString();
    //         statusConnection[id] = 'connected';
    //         io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
    //         io.sockets.in(`${id}`).emit('message', `${now} WhatsApp is ready!`);
    //         console.log(id + ' whatsapp ready')
    //     });

    //     sessions[id].on('authenticated', (session) => {
    //         now = new Date().toLocaleString();
    //         statusConnection[id] = 'authenticated'
    //         io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
    //         io.sockets.in(`${id}`).emit('message', `${now} Whatsapp is authenticated!`);
    //         console.log(id + ' is auth-ed')
    //     });

    //     sessions[id].on('auth_failure', function (session) {
    //         now = new Date().toLocaleString();
    //         statusConnection[id] = 'auth_failure'
    //         io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
    //         io.sockets.in(`${id}`).emit('message', `${now} Auth failure, restarting...`);

    //         console.log(id + ' if fail')
    //     });

    //     sessions[id].on('disconnected', async function () {
    //         now = new Date().toLocaleString();
    //         statusConnection[id] = 'disconnected'
    //         io.sockets.in(`${id}`).emit('statusConnection', statusConnection[id]);
    //         io.sockets.in(`${id}`).emit('message', `${now} Disconnected`);

    //         console.log(id + ' is disconnectd')
    //         await sessions[id].destroy();

    //     });

    // })

    return sessions[id]
}

module.exports = session