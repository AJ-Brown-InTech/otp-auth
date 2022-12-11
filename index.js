//load dependecies

const express = require('express')
const https = require('https')
const fs = require('fs')
const otp = require('otp-generator')
const nodemailer = require('nodemailer') 
const MailListener = require('mail-listener2')
const crypto = require('crypto')
const cors = require('cors')
const store = require('store')
const app = express()
require('dotenv').config()
app.use(express.json())
//env vars 
const key = process.env.KEY
const cert = process.env.CERT
const port = process.env.PORT || 8282
const sender = process.env.EMAIL
const senderPassword = process.env.EMAILPASS

let globalOTP
let timeout = new Date().getTime() + .5*60*1000; //add 15 minutes;
let now = new Date().getTime()
var distance = timeout - now
let code = otp.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false, digits: true, })
let token = crypto.randomBytes(64).toString('hex')
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
let emailDate = new Date()

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

//server and routes
let authenticated = false
let dummyData = 'ajalantbrown@gmail.com' //this is just for an example but typicaly youd run a query to the db 
app.options('*', cors()) //allows crud methods 

app.get('/', (req,res,next)=>{
  if(store.get('session_token') === true && today > store.get('expiration')){
   return res.redirect('/authenticated')
  }else{
   return res.status(401).json({"error": "not authorized. Send email to '/' for authorization. JSON ex. {email: example@email.com} "})
  }
})

app.post('/', (req,res,next)=>{
  //Example below used in terminal to test POST METHOD
  // curl --header "Content-Type: application/json" \
  // --request POST \
  // --data '{"email":"ajalantbrown@gmail.com"}' \
  // -k https://localhost:8181/
  let data = req.body.email
  console.log(req.body)
  console.log(data)
  if(data == dummyData){
    authenticated = true
    //send email
    globalOTP = code
   sendEmail(globalOTP, data,).catch(console.error);
    return res.redirect('/auth')
  } else {
    authenticated = false
    return res.status(401).json({"error": "Email invalid or not authorized. "})
  }
})

app.get('/auth', (req,res)=>{
if(now > timeout){
     globalOTP = null
     authenticated = false
     return res.json({"expiration": "Your verification code has expired, try again."})
 } else{
  res.status(200).json({"message": "You are authorized, to get authenticated please send POST method to '/auth/send' with email verification code before the timer expires. JSON ex. '{code:123456}'"})
 }
})

app.post('/auth/send', (req,res,next)=>{
  let data = req.body.code
  if(data == globalOTP){
    //store a session token
    store.set('session_token', { "token" : `${token}` })
    store.set('expiration',{"expire": `${timeout}`})
    res.redirect('/authenticated')
  }
})

app.get('/authenticated', (req,res,next)=>{
  if(store.get('session_token') === true && today > store.get('expiration') ){
    store.set('expiration',{"expire": `${timeout}`})
    res.status(200).send(verifiedHTML)
  }else if(store.get('session_token') === true && today < timeout){
    store.clearAll()
    res.status(401).json({"error": "Your session has expired. Reverify to access."})
  }else{
    store.clearAll()
    res.status(401).json({"error": "Your are not authorized to access"})
  }
})

const httpsServer = require('http').createServer(app)
 .listen(port, ()=> (console.log(emailDate + `\n[HTTPS]: Server is listening on port ${[port]}`)))