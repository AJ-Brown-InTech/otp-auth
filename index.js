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

//otp service


//ssl cert & its private key
const key = process.env.KEY
const cert = process.env.CERT

//https server listener
const options = {
key: fs.readFileSync(process.env.KEY),
cert: fs.readFileSync(process.env.CERT)
}
const port = process.env.PORT || 8282
app.use(express.json())
const router =  (req, res)=>{
    res.writeHead(200);
    res.end("hello world\n");
};
const httpsServer = require('https').createServer(options,router)
.listen(port, ()=> (console.log(new Date() + `\n[HTTP]: Server is listening on port ${[port]}`)))





