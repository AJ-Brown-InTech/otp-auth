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
const fs = requrie('fs')


//ssl cert & its private key
const key = fs.readFileSync('ssl/key.pem')



