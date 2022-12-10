//load dependecies
const express = require('express')
const https = require('https')
const fs = require('fs')
const otp = require('otp-generator')
const nodemailer = require('nodemailer') 
const MailListener = require('mail-listener2')
const cors = require('cors')
const app = express()
require('dotenv').config()

//env vars 
const key = process.env.KEY
const cert = process.env.CERT
const port = process.env.PORT || 8282
const sender = process.env.EMAIL
const senderPassword = process.env.EMAILPASS

/*global vars built for use in funcs later 
these vars can be tweaked for preference
but these are just some of the basic setups I plan to use 
for other projects
*/
//ssl certificates for https verification
const sslCert = {
  key: fs.readFileSync(key),
  cert: fs.readFileSync(cert)
  }
//smtp configuration im using outlook but you can use other 
//service providers each service has specific port, host, etc   
  let configs = {
    auth: {
    	user: sender,
    	pass: senderPassword,
		},
        service: "Outlook365",
        host: 'smtp-mail.outlook.com',
		port: process.env.SMTPPORT,
		secureConnection: false, //TLS require a secure connection to be false
    tls: {
        ciphers:'SSLv3'
    }
}
//email time stamp 
let emailDate = new Date().getTime();

//authenticated screen template
let verifiedHTML =  `
<div
  class="container"
  style="max-width: 90%; margin: auto; padding-top: 20px"
>
  <h2>Welcome to the club.</h2>
  <h4>You are officially In ✔</h4>
  <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
  <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;"></h1>
</div>
`
//specific code sent to a succesful username/password combo
let code = otp.generate(6, { upperCaseAlphabets: false, specialChars: false });

//function to send verification code to emails
const sendEmail = async (code, email) =>{
  let transporter = nodemailer.createTransport(configs)
  let mailOptions = {
   from: sender, //sender email
   to: email, //sender
   subject: 'Premier One-Time Verification Code',
   text: `Your verification code is ${code}.\nDo not share this code with anyone.\nSent: ${emailDate}.`,
  }

  let info = await transporter.sendMail(mailOptions)
  console.log(`Message sent ${emailDate}: %s`, info.messageId);
}

//server and fun happenings
let authenticated = false
app.use(cors())

app.get('/', (req,res,next)=>{
  if(authenticated == true){
    res.status(200).send(form)
  }else{
    res.status(401).json({"error": "not authorized"})
  }
})

const httpsServer = require('https').createServer(sslCert,app)
 .listen(port, ()=> (console.log(new Date() + `\n[HTTPS]: Server is listening on port ${[port]}`)))