const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const upload = multer({ dest: 'public/uploads/' });
// salmon stories on community page
// 用于存储故事的数组
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

// submit salmon repoty
app.post('/submit-salmon-report', upload.single('reportImage'), (req, res) => {
    const reportText = req.body.reportText;
    const reportImage = req.file ? req.file.filename : 'default.jpg';

    salmonReports.push({ text: reportText, image: reportImage });

    res.redirect('/');
});



// Migration
app.get('/migration', (req, res) => {
    res.render('migration', {
        upstreamContent: "The upstream journey is arduous, with salmon leaping up waterfalls to reach their spawning grounds.",
        midstreamContent: "In the midstream, salmon face predators and obstacles but continue their migration with resilience.",
        downstreamContent: "Returning downstream, young salmon navigate currents and human-made structures to reach the ocean.",
        mapPlaceholder: '<img src="/images/migration-map.png" alt="Migration Map">'
    });
});

// 处理污染报告提交
app.post('/submit-pollution-report', upload.single('image'), (req, res) => {
    const { lat, lng, pollutionType } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const pollutionPoint = { lat, lng, pollutionType, imageUrl };
    console.log('污染报告:', pollutionPoint);

    res.status(200).send({ message: "报告提交成功！", data: pollutionPoint });
});


app.get('/community', (req, res) => {
    res.render('community', { stories });
});

// 处理故事提交
app.post('/submit-story', (req, res) => {
    const { title, description } = req.body;
    
    // 添加新故事到数组
    stories.push({ title, description });

    res.redirect('/community');
});

app.get('/aboutus', (req, res) => {
    res.render('aboutus');
});


app.listen(port, '0.0.0.0', () => {
    console.log(`server alive at: http://178.128.147.116:${port}`);
});





