const {
    Client,
    LocalAuth
} = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');

const PORT = 3030
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const whatsapp = new Client({
    // restartOnAuthFail: true,
    puppeteer: {
        // headless: false,
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
        clientId: 'whatsapp'
    }),
})

const whatsapp1 = new Client({
    // restartOnAuthFail: true,
    puppeteer: {
        // headless: false,
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
        clientId: 'whatsapp1'
    }),
})

// index routing and middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

whatsapp.initialize();
whatsapp1.initialize();

app.get('/device/scan', async (req, res) => {
    // whatsapp.destroy();
    // await whatsapp.initialize();
    // await whatsapp1.initialize();
    res.sendFile('index.html', {
        root: __dirname
    });
});

app.get('/device/logout', async (req, res) => {
    try {
        await whatsapp.logout()
        await whatsapp.destroy()
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error})
        // throw new Error(error)
    }
})

// initialize whatsapp and the example event
whatsapp.on('message', msg => {
    console.log(msg)
    if (msg.body == '!ping') {
        setTimeout(() => {
            msg.reply('pong');
        }, 2000)
    }
});


// whatsapp.initialize();

let statusConnection = 'initializing'
// .then((res) => {
//     console.log(res)
// }).catch(err => console.log(err)) //connected, disconnected, waiting
// console.log(statusConnection)
let qrCodeString = ''

// socket connection
let today = new Date();
let now = today.toLocaleString();
io.on('connection', (socket) => {
    socket.emit('message', `${now} socket.io is Connected`);
    socket.emit('statusConnection', statusConnection)

    socket.on('disconnect', async function(){
        if(statusConnection !== 'connected'){
            console.log('close without connecting')
            await whatsapp.destroy()
        }
    })

    whatsapp.on('qr', (qr) => {
        // console.log(whatsapp)
        now = new Date().toLocaleString();
        statusConnection = 'qr';
        qrcode.toDataURL(qr, (err, url) => {
            qrCodeString = url;
            socket.emit('statusConnection', statusConnection);
            socket.emit("qr", url);
            socket.emit('message', `${now} QR Code received`);
            console.log('scan qr code')
        });
    });

    whatsapp.on('ready', () => {
        now = new Date().toLocaleString();
        statusConnection = 'connected';
        socket.emit('statusConnection', statusConnection);
        socket.emit('message', `${now} WhatsApp is ready!`);
        console.log('whatsapp ready')
    });

    whatsapp.on('authenticated', (session) => {
        now = new Date().toLocaleString();
        statusConnection = 'authenticated'
        socket.emit('statusConnection', statusConnection);
        socket.emit('message', `${now} Whatsapp is authenticated!`);
        console.log('is auth-ed')
    });

    whatsapp.on('auth_failure', function (session) {
        now = new Date().toLocaleString();
        statusConnection='auth_failure'
        socket.emit('statusConnection', statusConnection);
        socket.emit('message', `${now} Auth failure, restarting...`);

        console.log('if fail')
    });

    whatsapp.on('disconnected', async function () {
        now = new Date().toLocaleString();
        statusConnection = 'disconnected'
        socket.emit('statusConnection', statusConnection);
        socket.emit('message', `${now} Disconnected`);

        console.log('is disconnectd')
        await whatsapp.destroy();
        // whatsapp.initialize();
        // }
    });
});


// send message routing
app.post('/send', (req, res) => {
    const phone = req.body.phone;
    const message = req.body.message;

    whatsapp.sendMessage(phone, message)
        .then(response => {
            res.status(200).json({
                error: false,
                data: {
                    message: 'Pesan terkirim',
                    meta: response,
                },
            });
        })
        .catch(error => {
            res.status(200).json({
                error: true,
                data: {
                    message: 'Error send message',
                    meta: error,
                },
            });
        });
});

server.listen(PORT, () => {
    console.log('App listen on port ', PORT);
});