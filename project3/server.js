const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const upload = multer({ dest: 'public/uploads/' });

const stories = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));


let salmonReports = [];




app.get('/', (req, res) => {
    renderHomePage(req, res);
});

app.get('/home', (req, res) => {
    renderHomePage(req, res);
});

function renderHomePage(req, res) {
    const videoId = 'aPf4qtCDRtE';
    const backgroundStory = "The Columbia River, one of the longest rivers in North America, has long been a vital waterway for the region's wildlife, particularly the salmon that rely on its waters for migration. However, over the years, human activity has taken a heavy toll on this critical ecosystem. From industrial waste to pollution runoff, the river's waters have become increasingly contaminated, posing severe threats to the salmon population. These majestic fish, known for their impressive journey from the ocean to their birthplace, are now facing unprecedented challenges as they struggle to navigate a river polluted by toxic chemicals, heavy metals, and excess nutrients.\n\nThe growing presence of factories along the riverbanks, the construction of dams, and urban expansion have all contributed to the degradation of water quality. As pollutants infiltrate the river, they disrupt the delicate balance of the ecosystem, making it harder for salmon to survive their long migration. Chemicals like pesticides and heavy metals accumulate in the water, harming the fish's reproductive capabilities and their ability to survive the grueling upstream journey. Additionally, rising water temperatures, exacerbated by pollution, further strain the salmon's ability to thrive.\n\nThe Columbia River's salmon are not just a part of the local ecosystem; they represent a vital piece of the cultural heritage and economy of the Pacific Northwest. For centuries, they have been integral to the livelihoods of Indigenous communities, local fishermen, and the broader environment. Yet, without urgent action to curb pollution and protect the river, these fish may soon disappear, leaving a devastating impact on both the ecosystem and the communities that depend on it.";
    const reportImage = 'salmon.jpg'; 
    const reportText = salmonReports[salmonReports.length - 1]?.text || 'No report yet.';
    console.log("Video ID:", videoId);

    res.render('home', { videoId, backgroundStory, reportImage, reportText, userReports: salmonReports, aboutUsLink: '/aboutus',});

}

// submit salmon report
app.post('/submit-salmon-report', upload.single('reportImage'), (req, res) => {
    const reportText = req.body.reportText;
    const reportImage = req.file ? req.file.filename : 'default.jpg';

    salmonReports.push({ text: reportText, image: reportImage });

    res.redirect('/');
});



// Migration
app.get('/migration', (req, res) => {
    res.render('migration', {
        upstreamContent: "When mature, salmon embark on their return to their natal rivers to spawn. Using their keen sense of smell to detect the unique chemical signature of their birthplace, they navigate back upstream, leaping over rapids and dams, enduring physical exhaustion, and often sustaining injuries. This final journey is fueled by their stored energy, as they cease feeding once they re-enter freshwater. After spawning, most salmon species complete their life cycle, enriching the river ecosystem with nutrients as their bodies decompose.",
        midstreamContent: "In the midstream, salmon face predators and obstacles but continue their migration with resilience.",
        downstreamContent: "Born in freshwater headwaters, young salmon, known as fry, gradually grow into smolts. They begin their downstream journey toward the ocean, adapting to the changing environment as they transition from freshwater to saltwater. Along the way, they rely on natural currents and instinct to navigate through rivers and estuaries, facing threats like predators and human-made barriers.",
        mapPlaceholder: '<img src="/images/migration-map.png" alt="Migration Map">'
    });
});

// submit-pollution-report
app.post('/submit-pollution-report', upload.single('image'), (req, res) => {
    const { lat, lng, pollutionType } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const pollutionPoint = { lat, lng, pollutionType, imageUrl };
    console.log('Pollution report:', pollutionPoint);

    res.status(200).send({ message: "Thanks for your submition.", data: pollutionPoint });
});


app.get('/community', (req, res) => {
    res.render('community', { stories });
});

// submit storys on community page
app.post('/submit-story', (req, res) => {
    const { title, description } = req.body;
    

    stories.push({ title, description });

    res.redirect('/community');
});



app.get('/aboutus', (req, res) => {
    res.render('aboutus');
});


app.listen(port, '0.0.0.0', () => {
    console.log(`server alive at: http://178.128.147.116:${port}`);
});





