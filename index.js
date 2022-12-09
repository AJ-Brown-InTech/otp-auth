/*
    1. input a phone number
    2. check is number exist
    3. if number exit send a random 6 digit code
    4. if user input equals 6 digit code authorize
    5. else throw an error/try again 
*/
const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
const otp = require('otp-generator')
require('dotenv').config()
const nodemailer = require('nodemailer') 
const MailListener = require('mail-listener2');
//env vars
const key = process.env.KEY
const cert = process.env.CERT
const port = process.env.PORT || 8282
let emailDate = new Date().getTime();
let configs = {
    auth: {
    	username: process.env.USERNAME,
    	user: process.env.EMAIL,
    	pass: process.env.EMAILPASS,
		},
    host: 'smtp-mail.outlook.com',
    service: 'outlook',
		port: 587,
		secure: true,
        to: 'ajalantbrown@gmail.com'
    } 

//transport emails to phone numbers
const transport = async () =>{
    
    let transporter = nodemailer.createTransport(configs)
    
    let mailOptions = {
     from: process.env.EMAIL, //sender email
     to: configs.to, //sender
     subject: 'Premier One-Time Verification Code',
     text: `Your verification code is 123.\nDo not share this code with anyone.`,
    }

    let info = await transporter.sendMail(mailOptions)
    console.log('Message sent: %s', info.messageId);
}

//emial listener
var mailListener = new MailListener({
    username: configs.username,
    password: configs.pass,
    host: 'outlook.office365.com',
    port: 993,
    tls: false,
    
    connTimeout: 10000,
    authTimeout: 5000,
    debug: console.log,
    tlsOptions: { rejectUnauthorized: false },
    mailbox: "INBOX",
    searchFilter: ["UNSEEN", ["SINCE", emailDate]],
    markSeen: true,
    fetchUnreadOnStart: false,
    mailParserOptions: {streamAttachments: true},
    attachments: true,
    attachmentOptions: { directory: "attachments/" }
  });
  mailListener.start();
  mailListener.on("mail", function(mail, seqno, attributes){
	console.log('new mail: ', mail);
});

mailListener.on("attachment", function(attachment){
  console.log("*************");
  console.log(attachment.path);
});

const options = {
key: fs.readFileSync(key),
cert: fs.readFileSync(cert)
}

const router =  (req, res)=>{
    res.writeHead(200);
    res.end("hello world\n");
};

transport().catch("pigs",console.error);
// app.use(express.json())
// const httpsServer = require('https').createServer(options,router)
// .listen(port, ()=> (console.log(new Date() + `\n[HTTPS]: Server is listening on port ${[port]}`)))




