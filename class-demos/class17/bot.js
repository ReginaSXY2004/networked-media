// import the installed libraries
require("dotenv").config()
const m = require("masto")

const masto = m.createRestAPIClient({
    url: "https://networked-media.itp.io/",
    accessToken: process.env.TOKEN
})

async function makeStatus(text){

    const status = await masto.v1.statuses.create({
        // the thing that will be posted
        status: text,
        // change the visibility for testing purposes
        visibility: "private"
    })

    console.log(status.url)
}

// makeStatus("hi")

setInterval ( () =>{
    let emoji = ["😭", "🤩", "💖"]

    let rand = Math.floor(Math.random() * emoji.length)

    let post = emoji[rand]

    makeStatus(post)
}, 5000)