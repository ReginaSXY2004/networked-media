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
        
        return `Spell name: ${randomSpell.name}\nSpell description: ${randomSpell.description}`;
    } catch (error) {
        console.error("Failed to fetch Harry Potter spell:", error);
        return "The magic is fading...";
    }
}

// get character info from HP-API
async function getHarryPotterCharacterInfo(characterName) {
    try {
        const response = await fetch(`https://hp-api.onrender.com/api/characters?name=${characterName}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const characters = await response.json();
        if (characters.length > 0) {
            const character = characters[0];  
            
            return `
                Name: ${character.name}
                Alternate Names: ${character.alternate_names.join(", ")}
                Species: ${character.species}
                Gender: ${character.gender}
                House: ${character.house}
                Date of Birth: ${character.dateOfBirth}
                Ancestry: ${character.ancestry}
                Patronus: ${character.patronus}
                Actor: ${character.actor}
                Alive: ${character.alive ? "Yes" : "No"}
                Image: ${character.image}
            `;
        } else {
            return `Character "${characterName}" 404.`;
        }
    } catch (error) {
        console.error("Failed to fetch character information:", error);
        return "Could not fetch character information.";
    }
}

// post
async function makeStatus() {
    const spell = await getHarryPotterSpell();
    const status = await masto.v1.statuses.create({
        status: `${spell} 🪄🪄🪄 
        \nMay the magic be with you!
        \n#spell #HarryPotterSpell`,
        visibility: "public"
    });

    console.log("Post successfully created:", status.url);
}

// Reply with character info
async function reply() {
    const notificationSubscription = await stream.user.notification.subscribe();

    for await (let notif of notificationSubscription) {
        let acct = notif.payload.account.acct;
        let replyId = notif.payload.status.id;

        if (notif.payload.type === "mention") {
            const message = notif.payload.status.content;

            const match = message.match(/(?:character\s)?(\w+\s?\w+)/i);

            if (match) {
                const characterName = match[1];  // Extracts the character name from the message
                const roleInfo = await getHarryPotterCharacterInfo(characterName);

                // Reply to the user
                const status = await masto.v1.statuses.create({
                    status: `@${acct} Here's the information about ${characterName}: ${roleInfo}`,
                    visibility: "public",
                    in_reply_to_id: replyId,
                });

                console.log("Reply successfully created:", status.url);
            }
        }
    }
}

reply();

// **2h/post**
setInterval(makeStatus, 7200 * 1000);


makeStatus();
