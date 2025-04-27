// import express
const express = require('express')

// initialize the express app
const app = express()

app.use(express.static('public'))

app.listen(5555, ()=>{
    console.log('http://127.0.0.1:5555')
})