// library imports
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const nedbSessionStore = require("nedb-promises-session-store");
const bcrypt = require("bcrypt");
const nedb = require("@seald-io/nedb");
const cron = require("node-cron");

const app = express();
const encodedParser = bodyParser.urlencoded({ extended: true });
const uploadProcessor = multer({ dest: "public/uploads" });

// database setup
let userdb = new nedb({ filename: "userdb.txt", autoload: true });
let fortunedb = new nedb({ filename: "fortunedb.txt", autoload: true });
let omendb = new nedb({ filename: "omendb.txt", autoload: true });
let swapdb = new nedb({ filename: "swapdb.txt", autoload: true });

// middleware setup for express application
app.use(express.static("public"));
app.use(encodedParser);
app.use(cookieParser());

// setting up middleware libraries for auth
const nedbSessionInit = nedbSessionStore({
  connect: expressSession,
  filename: "sessions.txt",
});

app.use(
  expressSession({
    store: nedbSessionInit,
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000,
    },
    secret: "shrineFortunes123",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");

// creating custom middleware
function requiresAuthentication(req, res, next) {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect("/login?err=userNotLoggedIn");
  }
}

// All functions

// CHeck if user has drawn a fortune ticket today
function hasDrawnToday(lastDrawTime) {
  if (!lastDrawTime) return false;

  const lastDraw = new Date(lastDrawTime);
  const now = new Date();

  return (
    lastDraw.getDate() === now.getDate() &&
    lastDraw.getMonth() === now.getMonth() &&
    lastDraw.getFullYear() === now.getFullYear()
  );
}

// Get Current Fortune
function getCurrentFortune(username, callback) {
    userdb.findOne({ username: username }, (err, user) => {
      if (err || !user || !user.currentFortuneId) {
        callback(null);
        return;
      }
      
      fortunedb.findOne({ _id: user.currentFortuneId }, (err, fortune) => {
        if (err || !fortune) {
          callback(null);
          return;
        }
        callback(fortune);
      });
    });
  }

// Get today's Omen
function getDailyOmen(callback) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    omendb
      .findOne({
        createdAt: { $gte: today },
      })
      .sort({ createdAt: -1 })
      .exec((err, omen) => {
        if (err || !omen) {
          // generate an omen
          generateDailyOmen((newOmen) => {
            callback(newOmen);
          });
        } else {
          callback(omen);
        }
      });
  }

// Generate Daily Omen
function generateDailyOmen(callback) {
  const omens = [
    {
      name: "putrid Winds",
      description:
        "A decaying wind surrounds the shrine, bringing ominous premonitions.",
      effect: "Unfortunate fortunes become more intense.",
    },
    {
      name: "Night of Ghost Drums",
      description:
        "Mysterious drum sounds echo through the night, their source unknown to all.",
      effect:
        "Every fortune—be it blessing or curse—is rendered more profound.",
    },
    {
      name: "White Deer Apparition",
      description:
        "A mystical white deer has appeared near the shrine, regarded as a messenger of the divine.",
      effect: "Good fortune becomes more pronounced",
    },
    {
      name: "Ashen Eclipse",
      description: "The moon is veiled by a gray shadow, as if covered in ash.",
      effect: "The meanings of all fortunes become more ambiguous.",
    },
    {
      name: "Crimson Moonlight",
      description:
        "An unnatural blood-red moonlight bathes every corner of the shrine.",
      effect: "All inauspicious fortunes become more potent.",
    },
  ];

  const randomOmen = omens[Math.floor(Math.random() * omens.length)];
  randomOmen.createdAt = new Date();

  omendb.insert(randomOmen, (err, newOmen) => {
    if (err) {
      console.error("Error generating omen:", err);
      callback(null);
    } else {
      callback(newOmen);
    }
  });
}




// Route
app.get("/", requiresAuthentication, (req, res) => {
  getUserByUsername(req.session.loggedInUser, (user) => {
    // check if the user exist
    if (!user) {
        delete req.session.loggedInUser;
        return res.redirect("/login?err=userSessionInvalid");
    }

    // 1. Check birth info
    if (!user.birthInfo) {
      return res.redirect("/birth-input");
    }

    // 2. check if drawn fortune today
    if (!hasDrawnToday(user.lastDrawTime)) {
      return res.redirect("/draw-fortune");
    }

    // 3. draw a fortune-- go to fortune result
    if (user.currentFortuneId) {
      return res.redirect("/fortune-result/" + user.currentFortuneId);
    }

    // if error
    return res.redirect("/draw-fortune");
  });
});

// log in
app.get("/login", (req, res) => {
  res.render("login.ejs", { error: req.query.err });
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/signup", (req, res) => {
  // Password
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);

  // Create new user
  let newUser = {
    username: req.body.username,
    fullname: req.body.fullname || req.body.username,
    password: hashedPassword,

    birthInfo: null,
    lastDrawTime: null,
    currentFortuneId: null,
    swapsRemaining: 1,
    createdAt: new Date(),
  };

  userdb.insert(newUser, (err, insertedUser) => {
    if (err) {
      return res.redirect("/register?err=registrationFailed");
    }
    res.redirect("/login?success=registered");
  });
});

app.post("/authenticate", (req, res) => {
  const searchQuery = {
    username: req.body.username,
  };

  userdb.findOne(searchQuery, (err, user) => {
    if (err || !user) {
      return res.redirect("/login?err=userNotFound");
    }

    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.loggedInUser = user.username;

      // If user havn't input birth info, redirect to birth input
      if (!user.birthInfo || !user.birthInfo.date) {
        return res.redirect("/birth-input");
      }

      // Check lastDrawTime(debug)
      if (user.lastDrawTime && hasDrawnToday(user.lastDrawTime)) {
        // if already got a result
        if (user.currentFortuneId) {
          return res.redirect("/fortune-result/" + user.currentFortuneId);
        } else {
          return res.redirect("/"); 
        }
      } else {
        // if havn't got a result
        return res.redirect("/draw-fortune");
      }
    } else {
      res.redirect("/login?err=wrongPassword");
    }
  });
});
app.get("/logout", requiresAuthentication, (req, res) => {
  delete req.session.loggedInUser;
  res.redirect("/login");
});


app.get("/birth-input", requiresAuthentication, (req, res) => {
  res.render("birthInput.ejs");
});

// save birth info
app.post("/save-birth-info", requiresAuthentication, (req, res) => {
  const birthInfo = {
    date: req.body.birthdate,
    time: req.body.birthtime || null,
    place: req.body.birthplace || null,
  };

  userdb.update(
    { username: req.session.loggedInUser },
    { $set: { birthInfo: birthInfo } },
    {},
    (err) => {
      if (err) {
        return res.redirect("/birth-input?err=save failed, please try again");
      }
      res.redirect("/draw-fortune"); 
    }
  );
});

// Get user info
function getUserByUsername(username, next) {
    userdb.findOne({ username: username }, (err, user) => {
      if (err) {
        next(null);
      } else {
        next(user);
      }
    });
  }

  app.get("/draw-fortune", requiresAuthentication, (req, res) => {
    getUserByUsername(req.session.loggedInUser, (user) => {
      // check if already drawn
      if (hasDrawnToday(user.lastDrawTime)) {
        return res.redirect("/?err=alreadyDrawn");
      }
  
      res.render("drawFortune.ejs", {
        error: req.query.err,
      });
    });
  });

  // When saving a fortune, also assign a random Seeker number
  app.post("/draw-fortune", requiresAuthentication, (req, res) => {
    console.log("Stick index:", req.body.stickIndex);
    const stickIndex = req.body.stickIndex; // Stick index of user
    
    getUserByUsername(req.session.loggedInUser, (user) => {
      console.log("User found:", user ? user.username : "none");
  
      // check if already draw a fortune
      if (hasDrawnToday(user.lastDrawTime)) {
        console.log("User already drew today");
        return res.redirect("/?err=alreadyDrawn");
      }
      console.log("User has not drawn today");
  
      // get today's omen
      getDailyOmen((omen) => {
        console.log("Today's omen:", omen.name);
  
        // determine fortune type
        const fortuneType = determineFortuneType(user.birthInfo, omen, stickIndex);
        console.log("Fortune type determined:", fortuneType);

        // Generate a random Seeker number (1-28)
        const seekerNumber = Math.floor(Math.random() * 28) + 1;
  
        // generate foutune content
        generateFortuneContent(fortuneType, user.birthInfo, omen, (fortune) => {
          // Add the Seeker number to the fortune record
          fortune.seekerNumber = seekerNumber;
          console.log("Fortune content generated");
    // save fortune to database
    fortunedb.insert(fortune, (err, savedFortune) => {
      if (err) {
        console.error("fortune saving error:", err);
        return res.redirect("/draw-fortune?err=drawFailed");
      }
      console.log("Fortune saved with ID:", savedFortune._id);

      // update user
      userdb.update(
        { username: req.session.loggedInUser },
        {
          $set: {
            lastDrawTime: new Date(),
            currentFortuneId: savedFortune._id,
          },
        },
        {},
        (err) => {
          if (err) {
            console.error("failed to update user:", err);
            return res.redirect("/draw-fortune?err=updateFailed");
          }
          res.redirect("/fortune-result/" + savedFortune._id);
        });
      });
    });
  });
});
});

app.get("/fortune-result/:id", requiresAuthentication, (req, res) => {
  const fortuneId = req.params.id;
  const username = req.session.loggedInUser;
  
  getUserByUsername(username, (user) => {
    if (!user) {
      delete req.session.loggedInUser;
      return res.redirect("/login?err=userSessionInvalid");
    }

    // get the fortune content
    fortunedb.findOne({ _id: fortuneId }, (err, fortune) => {
      if (err || !fortune) {
        console.error("cannot find fortune:", err);
        return res.redirect("/?err=fortuneNotFound");
      }

      // get today's omen
      getDailyOmen((omen) => {
        res.render("fortuneResult.ejs", {
          fortune: fortune,
          omen: omen,
          user: user,
          swapSuccess: req.query.success === 'swapCompleted',
          swapPartner: req.query.partner || null,
          keepMine: req.query.keep === 'true'
        });
      });
    });
  });
});

// Decide the fortune based on Birth, omen and stick index
function determineFortuneType(birthInfo, omen, stickIndex) {
  console.log("Determine the signature type, parameters:", {
    birthDate: birthInfo ? birthInfo.date : null,
    omenName: omen ? omen.name : null,
    stickIndex,
  });
  // basic weight of each fortune type
  const fortuneTypes = [
    { type: "大吉", weight: 0.1 }, //Great Fortune 10%
    { type: "中吉", weight: 0.15 }, //Good Fortune 10%
    { type: "小吉", weight: 0.2 }, //Minor Good Fortune 25%
    { type: "平", weight: 0.25 }, //Natural Fortune 25%
    { type: "末吉", weight: 0.15 }, //Uncertain Fortune 15%
    { type: "凶", weight: 0.1 }, //Bad Fortune 15%
    { type: "大凶", weight: 0.05 }, //Great Misfortune 5%
  ];

  // Apply omen effects
  if (omen) {
    // Each omen has different effects on fortune distribution
    if (omen.name === "Putrid Winds") {
      // Increases bad fortunes
      adjustFortuneWeight(fortuneTypes, "凶", 0.05);
      adjustFortuneWeight(fortuneTypes, "大凶", 0.05);
      adjustFortuneWeight(fortuneTypes, "大吉", -0.03);
    } else if (omen.name === "Night of Ghost Drums") {
      // Amplifies extreme fortunes (both good and bad)
      adjustFortuneWeight(fortuneTypes, "大吉", 0.04);
      adjustFortuneWeight(fortuneTypes, "大凶", 0.04);
      adjustFortuneWeight(fortuneTypes, "平", -0.08);
    } else if (omen.name === "White Deer Apparition") {
      // Improves good fortunes
      adjustFortuneWeight(fortuneTypes, "大吉", 0.07);
      adjustFortuneWeight(fortuneTypes, "中吉", 0.03);
      adjustFortuneWeight(fortuneTypes, "凶", -0.05);
      adjustFortuneWeight(fortuneTypes, "大凶", -0.05);
    } else if (omen.name === "Ashen Eclipse") {
      // Makes fortunes more uncertain/mediocre
      adjustFortuneWeight(fortuneTypes, "平", 0.1);
      adjustFortuneWeight(fortuneTypes, "末吉", 0.05);
      adjustFortuneWeight(fortuneTypes, "大吉", -0.05);
      adjustFortuneWeight(fortuneTypes, "大凶", -0.05);
    } else if (omen.name === "Crimson Moonlight") {
      // Increases extreme bad fortunes significantly
      adjustFortuneWeight(fortuneTypes, "大凶", 0.1);
      adjustFortuneWeight(fortuneTypes, "凶", 0.05);
      adjustFortuneWeight(fortuneTypes, "大吉", -0.05);
    }
  }

  // Make adjustments based on the index of the randomly selected stick
  if (stickIndex) {
    const seed = parseInt(stickIndex) % 28;
    // The number of the stick affects one's fortune, but it is not fixed; only the weight is slightly adjusted
    const adjustmentValue = 0.02;

    // Each stick has its own "fortune tendency".
    if (seed % 7 === 0) {
      adjustFortuneWeight(fortuneTypes, "大吉", adjustmentValue);
    } else if (seed % 7 === 1) {
      adjustFortuneWeight(fortuneTypes, "中吉", adjustmentValue);
    } else if (seed % 7 === 2) {
      adjustFortuneWeight(fortuneTypes, "小吉", adjustmentValue);
    } else if (seed % 7 === 3) {
      adjustFortuneWeight(fortuneTypes, "平", adjustmentValue);
    } else if (seed % 7 === 4) {
      adjustFortuneWeight(fortuneTypes, "末吉", adjustmentValue);
    } else if (seed % 7 === 5) {
      adjustFortuneWeight(fortuneTypes, "凶", adjustmentValue);
    } else if (seed % 7 === 6) {
      adjustFortuneWeight(fortuneTypes, "大凶", adjustmentValue);
    }
  }

  // Ensure that the total weight is 1
  normalizeWeights(fortuneTypes);

  // The adjusted weight distribution
  console.log(
    "The adjusted weight distribution:",
    fortuneTypes.map((f) => `${f.type}: ${f.weight.toFixed(3)}`).join(", ")
  );

  // Weighted random selection
  const selectedType = weightedRandomSelect(fortuneTypes);
  console.log("Selected Fortune type:", selectedType);
  return selectedType;
}

// total weight is 1
function normalizeWeights(fortuneTypes) {
  const totalWeight = fortuneTypes.reduce((sum, item) => sum + item.weight, 0);

  // if total weight is not 1, turns to 1
  if (Math.abs(totalWeight - 1) > 0.0001) {
    for (const fortune of fortuneTypes) {
      fortune.weight = fortune.weight / totalWeight;
    }
  }
}

// Helper function to adjust weights of fortune types
function adjustFortuneWeight(fortuneTypes, type, adjustment) {
  const fortune = fortuneTypes.find((f) => f.type === type);
  if (fortune) {
    fortune.weight = Math.max(0.01, fortune.weight + adjustment); // Ensure weight never goes below 0.01
  }
}

// Performs weighted random selection from items
function weightedRandomSelect(items) {
  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  // Generate random value between 0 and totalWeight
  let random = Math.random() * totalWeight;
  // Find the item that corresponds to the random value
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.type;
    }
  }
  // Fallback (should not reach here unless there's an error)
  return items[0].type;
}

// Use OpenAI to generate content
async function generateFortuneContent(fortuneType, birthInfo, omen, callback) {
  // Select appropriate tone and emphasis based on fortune type
  let tone, emphasis;

  if (fortuneType === "大吉") {
    tone = "very positive and full of hope";
    emphasis = "highlight significant luck and success";
  } else if (fortuneType === "中吉") {
    tone = "positive and optimistic";
    emphasis = "emphasize steady fortune and smooth progress";
  } else if (fortuneType === "小吉") {
    tone = "gently positive, with a touch of caution";
    emphasis = "highlight minor blessings and offer prudent advice";
  } else if (fortuneType === "平") {
    tone = "neutral and peaceful";
    emphasis = "emphasize balance and stability, avoiding extremes";
  } else if (fortuneType === "末吉") {
    tone = "cautiously optimistic, with warnings";
    emphasis = "stress the need for care, while acknowledging potential hope";
  } else if (fortuneType === "凶") {
    tone = "serious and warning";
    emphasis = "highlight the need for extra caution and endurance";
  } else if (fortuneType === "大凶") {
    tone = "severe, but with hope and wisdom";
    emphasis = "highlight difficulties, but provide strategies for overcoming them";
  }

  // Check for OpenAI API key
  if (process.env.OPENAI_API_KEY) {
    console.log("OpenAI API generating");

    try {
      const { OpenAI } = require("openai");

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `
Create a shrine-style fortune of type ${fortuneType} for an individual born on ${birthInfo.date}.
Current shrine omen: ${omen.name} - ${omen.description}

Use a tone that is ${tone}, and ${emphasis}.
Incorporate astrological insights based on this birthdate, and weave in the influence of the current shrine omen to craft a meaningful and layered fortune.

The fortune should include:
- A short English name of FortuneType
- A very personalized interpretation based on their birthdate
- A poetic one-line summary of their overall luck
- A short forecast and advice for career or studies (1-2 sentences)
- Guidance for interpersonal relationships in the near term (1-2 sentences)
- A concluding proverb or aphorism

Use elegant, poetic language with a sense of mysticism. Keep the entire message under 150 characters.
Avoid modern terminology—favor traditional, arcane expressions. Do not use numbered or explicitly segmented parts; let the writing flow naturally.
      `;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo", // Model
          messages: [
            {
              role: "system",
              content:
                "You are a master of traditional Japanese shrine fortune writing. Your words are elegant, spiritual, and poetic.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        const generatedContent = completion.choices[0].message.content.trim();
        console.log("OpenAI API successfully generated");

        callback({
          type: fortuneType,
          content: generatedContent,
          interpretation: getFortuneInterpretation(fortuneType),
          createdAt: new Date(),
        });
      } catch (apiError) {
        console.error("OpenAI API error:", apiError.message);
        console.log("Use the preset content as the fallback plan");
        callback(getFallbackFortune(fortuneType, omen));
      }
    } catch (error) {
      console.error("OpenAI module error:", error.message);
      callback(getFallbackFortune(fortuneType, omen));
    }
  } else {
    console.log("The OpenAI API key has not been set. Use the preset content");
    callback(getFallbackFortune(fortuneType, omen));
  }
}

function getFortuneInterpretation(fortuneType) {
  if (fortuneType === "大吉") {
    return "This is a most auspicious fortune. All things will go smoothly, and divine favor is upon you. Act boldly.";
  } else if (fortuneType === "中吉") {
    return "A good fortune indeed—not the best, but with steady positivity. Maintain optimism and proceed carefully.";
  } else if (fortuneType === "小吉") {
    return "A mild blessing—hidden perils may exist. A calm and cautious heart will reveal the light.";
  } else if (fortuneType === "平") {
    return "A neutral fortune. Nothing extreme will occur. Let things flow naturally, and peace will follow.";
  } else if (fortuneType === "末吉") {
    return "A faint blessing that calls for caution. Think carefully before acting, and await the right moment.";
  } else if (fortuneType === "凶") {
    return "An ominous fortune. Misfortune may arise—act with great caution and avoid unnecessary risk.";
  } else if (fortuneType === "大凶") {
    return "This is a dire fortune. Obstacles are many. Avoid major decisions and wait for a better time.";
  } else {
    return "This fortune carries deeper meaning—contemplate it carefully. Harmony with fate brings resolution.";
  }
}


function getFallbackFortune(fortuneType, omen) {
  const fortunes = {
    大吉: {
      content:
        "Clear skies and auspicious clouds. Career rises like the midday sun, aided by noble helpers. Relationships are harmonious, and joy is abundant. Remember: walk calmly with sincerity, and blessings will follow.",
    },
    中吉: {
      content:
        "The clouds part to reveal the moon—hope is near. With patience, your work or studies will bear fruit. True feelings bring warmth in relationships. Remember: serenity leads to far-reaching success.",
    },
    小吉: {
      content:
        "Gentle breeze, soft rain. Though minor challenges arise, stay composed to turn risk into opportunity. Sincerity builds long-lasting trust. Remember: kindness invites good fortune.",
    },
    平: {
      content:
        "Still waters, undisturbed. Daily life moves steadily, with no great highs or lows. Social ties remain peaceful and balanced. Remember: go with the flow and stay grounded.",
    },
    末吉: {
      content:
        "Thin clouds dim the sun, shadows shift. Career paths face delay—patience is key. Step back in relationships to gain clarity. Remember: cultivate virtue, and blessings will arrive.",
    },
    凶: {
      content:
        "Dark clouds gather, thunder rumbles. Obstacles emerge in work or study—proceed with care. Avoid conflict in relationships; solitude and reflection are wise. Remember: endure the storm, and light will follow.",
    },
    大凶: {
      content:
        "Storms rage, lightning strikes. Everything is at a standstill—stay still, not rash. Tensions rise in social matters; steer clear of strife. Remember: conceal your light, and await your moment.",
    },
  };

// Add omen effect text based on current shrine omen
let omenEffect = "";

if (omen) {
  if (omen.name === "Putrid Winds") {
    if (fortuneType.includes("凶")) {
      omenEffect = "A rotting wind encircles the shrine, intensifying the aura of misfortune.";
    } else {
      omenEffect = "A rotting wind encircles the shrine, slightly dulling the auspicious energy.";
    }
  } else if (omen.name === "Night of Ghost Drums") {
    if (fortuneType === "大吉" || fortuneType === "大凶") {
      omenEffect = "Ghostly drums echo through the night, amplifying the extremes of fate.";
    } else {
      omenEffect = "Ghostly drums echo through the night, making one's destiny more turbulent.";
    }
  } else if (omen.name === "White Deer Apparition") {
    if (fortuneType.includes("吉")) {
      omenEffect = "The white deer appears, enhancing the auspicious flow of fortune.";
    } else {
      omenEffect = "The white deer appears, bringing a glimmer of hope to inauspicious signs.";
    }
  } else if (omen.name === "Ashen Eclipse") {
    omenEffect = "Under the influence of the ashen eclipse, fate becomes hazy and hard to discern—read with care.";
  } else if (omen.name === "Crimson Moonlight") {
    if (fortuneType.includes("凶")) {
      omenEffect = "Bathed in crimson moonlight, signs of misfortune become ever more pronounced.";
    } else {
      omenEffect = "Bathed in crimson moonlight, the veil of mystery shrouds even good fortune.";
    }
  }
}


  // 平if unkown type of fortune
  if (!fortunes[fortuneType]) {
    console.log("Unkown fortune type, use平签");
    fortuneType = "平";
  }

  // get a basic fortune
  const fortune = fortunes[fortuneType];

  // adjust content based on omen
  let finalContent = fortune.content;
  if (omenEffect) {
    finalContent += " " + omenEffect;
  }

  return {
    type: fortuneType,
    content: finalContent,
    interpretation: getFortuneInterpretation(fortuneType),
    createdAt: new Date(),
  };
}



 

// Fortune swap route
app.post("/swap-fortune", requiresAuthentication, (req, res) => {
  // Get current user
  getUserByUsername(req.session.loggedInUser, (currentUser) => {
    // Check if user has any swaps remaining
    if (currentUser.swapsRemaining <= 0) {
      return res.redirect(
        "/fortune-result/" +
          currentUser.currentFortuneId +
          "?err=noSwapsRemaining"
      );
    }

    // Get current user's fortune
    getCurrentFortune(req.session.loggedInUser, (currentFortune) => {
      if (!currentFortune) {
        return res.redirect("/?err=noFortuneToSwap");
      }

      // Find all other users who have already drawn fortunes
      userdb.find(
        {
          username: { $ne: req.session.loggedInUser },
          currentFortuneId: { $exists: true, $ne: null },
        },
        (err, otherUsers) => {
          if (err || otherUsers.length === 0) {
            return res.redirect(
              "/fortune-result/" +
                currentUser.currentFortuneId +
                "?err=noOtherUsers"
            );
          }

          // Randomly select a user
          const randomUser =
            otherUsers[Math.floor(Math.random() * otherUsers.length)];
          const targetUsername = randomUser.username;

          // Get target user's fortune
          getCurrentFortune(targetUsername, (targetFortune) => {
            if (!targetFortune) {
              return res.redirect(
                "/fortune-result/" +
                  currentUser.currentFortuneId +
                  "?err=targetNoFortune"
              );
            }

                  // Store the original Seeker numbers
      const initiatorSeekerNumber = currentFortune.seekerNumber;
      const targetSeekerNumber = targetFortune.seekerNumber;

            // Record swap operation
            const swapRecord = {
              initiatorUsername: req.session.loggedInUser,
              targetUsername: targetUsername,
              initiatorFortuneId: currentFortune._id,
              targetFortuneId: targetFortune._id,
              initiatorSeekerNumber: initiatorSeekerNumber,
              targetSeekerNumber: targetSeekerNumber,
              swapDate: new Date(),
              isSecretSwap: true,
            };

            swapdb.insert(swapRecord, (err, newSwap) => {
              if (err) {
                return res.redirect(
                  "/fortune-result/" +
                    currentUser.currentFortuneId +
                    "?err=swapFailed"
                );
              }
                       // Update fortunes, but preserve original Seeker numbers
        
        // Create a copy of target fortune with initiator's Seeker number
        const initiatorNewFortune = {...targetFortune};
        initiatorNewFortune.seekerNumber = initiatorSeekerNumber;
        delete initiatorNewFortune._id; 
        
        // Create a copy of initiator fortune with target's Seeker number
        const targetNewFortune = {...currentFortune};
        targetNewFortune.seekerNumber = targetSeekerNumber;
        delete targetNewFortune._id;

              // Update both users' fortunes (swap them)
              updateUserFortune(req.session.loggedInUser, targetFortune._id, (err) => {
                if (err) {
                  console.error("Error updating initiator's fortune:", err);
                  return res.redirect(
                    "/fortune-result/" +
                      currentUser.currentFortuneId +
                      "?err=swapFailed"
                  );
                }

                updateUserFortune(targetUsername, currentFortune._id, (err) => {
                  if (err) {
                    console.error("Error updating target's fortune:", err);
                    return res.redirect(
                      "/fortune-result/" +
                        currentUser.currentFortuneId +
                        "?err=swapFailed"
                    );
                  }

                  // Decrement current user's remaining swaps
                  userdb.update(
                    { username: req.session.loggedInUser },
                    { $inc: { swapsRemaining: -1 } },
                    {},
                    (err) => {
                      if (err) {
                        console.error("Error updating swaps remaining:", err);
                      }

                      // Assign a random seeker number (for display purposes)
                      const seekerNumber = Math.floor(Math.random() * 10) + 1;

                      // Redirect to fortune result page with success message
                      res.redirect(
                        "/fortune-result/" +
                          targetFortune._id +
                          "?success=swapCompleted&partner=" +
                          seekerNumber
                      );
                    }
                  );
                });
              });
            });
          });
        }
      );
    });
  });
});


function updateUserFortune(username, fortuneId, callback) {
  userdb.update(
    { username: username },
    { $set: { currentFortuneId: fortuneId } },
    {},
    (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  );
}

// Every day new omen
cron.schedule("0 0 * * *", () => {
  console.log("Running daily tasks at midnight");
  generateDailyOmen((newOmen) => {
    console.log("Generated new daily omen:", newOmen.name);
  });
});

app.listen(1324,  () => {
  console.log(`server alive at: http://178.128.147.116:1324`);
});
