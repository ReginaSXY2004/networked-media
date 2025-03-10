const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;

// 设置 EJS 视图引擎
app.set('view engine', 'ejs');
app.use(express.static('public'));
// 解析 POST 请求中的数据
app.use(bodyParser.urlencoded({ extended: true }));

// 存储用户提交的报告文本和图片
let salmonReports = []; // 存储三文鱼报告


// 根路径，直接显示主页
app.get('/', (req, res) => {
    renderHomePage(req, res);
});
// /home 路径，也显示主页
app.get('/home', (req, res) => {
    renderHomePage(req, res);
});
// 封装渲染逻辑
function renderHomePage(req, res) {
    const videoId = 'aPf4qtCDRtE';
    const backgroundStory = "The Columbia River, one of the longest rivers in North America, has long been a vital waterway for the region's wildlife, particularly the salmon that rely on its waters for migration. However, over the years, human activity has taken a heavy toll on this critical ecosystem. From industrial waste to pollution runoff, the river's waters have become increasingly contaminated, posing severe threats to the salmon population. These majestic fish, known for their impressive journey from the ocean to their birthplace, are now facing unprecedented challenges as they struggle to navigate a river polluted by toxic chemicals, heavy metals, and excess nutrients.\n\nThe growing presence of factories along the riverbanks, the construction of dams, and urban expansion have all contributed to the degradation of water quality. As pollutants infiltrate the river, they disrupt the delicate balance of the ecosystem, making it harder for salmon to survive their long migration. Chemicals like pesticides and heavy metals accumulate in the water, harming the fish's reproductive capabilities and their ability to survive the grueling upstream journey. Additionally, rising water temperatures, exacerbated by pollution, further strain the salmon's ability to thrive.\n\nThe Columbia River's salmon are not just a part of the local ecosystem; they represent a vital piece of the cultural heritage and economy of the Pacific Northwest. For centuries, they have been integral to the livelihoods of Indigenous communities, local fishermen, and the broader environment. Yet, without urgent action to curb pollution and protect the river, these fish may soon disappear, leaving a devastating impact on both the ecosystem and the communities that depend on it.";
    const reportImage = 'salmon.jpg'; 
    const reportText = salmonReports[salmonReports.length - 1]?.text || 'No report yet.';
    console.log("Video ID:", videoId);
    // 渲染 home.ejs
    res.render('home', { videoId, backgroundStory, reportImage, reportText, userReports: salmonReports, aboutUsLink: 'https://example.com/about-us',
        contactLink: 'https://example.com/contact'});

}

// 路由：接收用户提交的报告
app.post('/submit-salmon-report', (req, res) => {
    const reportText = req.body.reportText; // 获取用户输入的文本
    const reportImage = req.body.reportImage || 'default.jpg'; // 获取用户上传的图像（假设是表单字段）
    
    // 将报告文本和图像存储在数组中
    salmonReports.push({ text: reportText, image: reportImage });
    
    // 重定向回主页，显示最新的用户生成内容
    res.redirect('/');
});


// 迁徙地图路由
app.get('/migration', (req, res) => {
    res.render('migration', {
        upstreamContent: "The upstream journey is arduous, with salmon leaping up waterfalls to reach their spawning grounds.",
        midstreamContent: "In the midstream, salmon face predators and obstacles but continue their migration with resilience.",
        downstreamContent: "Returning downstream, young salmon navigate currents and human-made structures to reach the ocean.",
        mapPlaceholder: '<img src="/images/migration-map.png" alt="Migration Map">'
    });
// 路由：接收污染报告
app.post('/submit-pollution-report', (req, res) => {
    const { lat, lng, text } = req.body;
    console.log(`Pollution report: ${text} at (${lat}, ${lng})`);
    res.status(200).send({ message: "Report submitted successfully!" });
});

});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在: http://178.128.147.116:${port}`);
});





