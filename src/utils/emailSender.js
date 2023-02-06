// reference : https://miracleio.me/snippets/use-gmail-with-nodemailer/

import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
const env = dotenv.config().parsed


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'moslemguideapp@gmail.com',
        pass: env.GMAIL_APP_PWD
    }
});

const gmailSend = async ({to, subject, html}) => {
    let response = null
    const mailOptions = {
        from: 'moslemguideapp@gmail.com',
        to,
        subject,
        html
    }


    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            response = 'error'
        } else {
            response = info.response
        }
    })

    return response
}

export default gmailSend