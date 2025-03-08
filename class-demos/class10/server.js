// /////////////////////////////////
//  1. library imports
// /////////////////////////////////
const express = require('express')
const parser = require('body-parser')
const multer = require('multer')

// /////////////////////////////////
// 2. app setting
// /////////////////////////////////
const app = express()
const encodedParser = parser.urlencoded({extended: true})
const uploadProcessor = multer({dest: "public/upload"})

app.use(express.static('public'))   // serves all the static files from the public folder
app.use(encodedParser)
app.set("view engine", "ejs")

let totalPosts = []

// /////////////////////////////////
// 3. routes
// /////////////////////////////////
app.get('/', (req, res)=>{
    // res.send('hello')
    const data = { allposts: totalPosts}

    res.render('home.ejs', data)
})

app.get('/form', (req, res)=>{
    res.render('form.ejs')
})

// handles the data coming in from the form
// redirects back to the home page once the data has been processed 
app.post('/submit', uploadProcessor.single("img"), (req, res)=>{
    // messages.push({
    //     user: req.body.username,
    //     color: req.body.color
    // })

    // creating variable that is storing the same object
    let receivedData = {
        user: req.body.username,
        color: req.body.color
    }

    // check if file exists
    if(req.file){
        // creating the path at which the file will exist in my uploads folder
        post.imgSrc = "upload/"+req.file.filename
    }
    console.log(req.body)
    totalPosts.push(receivedData)
    res.redirect('/')
})

app.get('/allpostsinjson', (req, res)=>{
    let jsonDataFormat = JSON.stringify(totalPosts)
    res.json(jsonDataFormat)
})
// /////////////////////////////////
// 4. listen 
// /////////////////////////////////
app.listen(5555, ()=>{
    console.log('server is live at http://127.0.0.1:5555')
})