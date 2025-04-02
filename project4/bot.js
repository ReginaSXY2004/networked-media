// import the .env file so that we can keep our password outside of our script
require("dotenv").config()

// importing the masto library to interface with our mastodon server
const m = require("masto")

const masto = m.createRestAPIClient({
    url: "https://networked-media.itp.io/",
    accessToken: process.env.TOKEN
});

const stream = m.createStreamingAPIClient({
    accessToken: process.env.TOKEN,
    streamingApiUrl: "wss://networked-media.itp.io",
  });

// get spell from HP-API
async function getHarryPotterSpell() {
    try {
        const response = await fetch("https://hp-api.onrender.com/api/spells");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const spells = await response.json();
        const randomSpell = spells[Math.floor(Math.random() * spells.length)];
        
        return `${randomSpell.name}: ${randomSpell.description}`;
    } catch (error) {
        console.error("Failed to fetch Harry Potter spell:", error);
        return "The magic is fading...";
    }
}

// post
async function makeStatus() {
    const spell = await getHarryPotterSpell();
    const status = await masto.v1.statuses.create({
        status: `Learn your spell: ${spell} 🪄🪄🪄 
        \nMay the magic be with you!
        \n#spell #HarryPotterSpell`,
        visibility: "private"
    });

    console.log("Post successfully created:", status.url);
}


async function replyToMentions() {
    const notificationSubscription = await stream.user.notification.subscribe();
  
    for await (let notif of notificationSubscription) {
        let acct = notif.payload.account.acct;
        let replyId = notif.payload.status.id;

        if (notif.payload.type === "mention") {      
            const roleInfo = "I can teach you Harry Potter spell!";
            
            const status = await masto.v1.statuses.create({
                status: `@${acct} ${roleInfo}`,
                visibility: "public",
                in_reply_to_id: replyId,
            });

            console.log("Reply successfully created:", status.url);
        }
    }
}




// **2h/post**
setInterval(makeStatus, 7200 * 1000);


makeStatus();
