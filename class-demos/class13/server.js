//1. library imports
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')

//2.app settings
const app = express()
const encodedParser = bodyParser.urlencoded({extended: true})
const uploadProcessor = multer({dest:"public/upload"})

app.use(express.static('public'))

app.use(encodedParser)
app.use(express.static('public'))
app.use(encodedParser)
app.set("view engine","ejs")

//3.routes
app.get('/',(req,res)=>{
    res.render('indexed.ejs')
})

//4. listen
app.listen()