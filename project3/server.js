const express = require('express');
const app = express();
const port = 3000;

// 设置 EJS 视图引擎
app.set('view engine', 'ejs');
app.use(express.static('public'));

// 路由
app.get('/', (req, res) => {
    const videoId = 'aPf4qtCDRtE'; // 视频 ID
    const backgroundStory = "The Columbia River, one of the longest rivers in North America, has long been a vital waterway for the region\'s wildlife, particularly the salmon that rely on its waters for migration. However, over the years, human activity has taken a heavy toll on this critical ecosystem. From industrial waste to pollution runoff, the river\'s waters have become increasingly contaminated, posing severe threats to the salmon population. These majestic fish, known for their impressive journey from the ocean to their birthplace, are now facing unprecedented challenges as they struggle to navigate a river polluted by toxic chemicals, heavy metals, and excess nutrients.\n\nThe growing presence of factories along the riverbanks, the construction of dams, and urban expansion have all contributed to the degradation of water quality. As pollutants infiltrate the river, they disrupt the delicate balance of the ecosystem, making it harder for salmon to survive their long migration. Chemicals like pesticides and heavy metals accumulate in the water, harming the fish\'s reproductive capabilities and their ability to survive the grueling upstream journey. Additionally, rising water temperatures, exacerbated by pollution, further strain the salmon\'s ability to thrive.\n\nThe Columbia River\'s salmon are not just a part of the local ecosystem; they represent a vital piece of the cultural heritage and economy of the Pacific Northwest. For centuries, they have been integral to the livelihoods of Indigenous communities, local fishermen, and the broader environment. Yet, without urgent action to curb pollution and protect the river, these fish may soon disappear, leaving a devastating impact on both the ecosystem and the communities that depend on it.";
    const reportImage = 'salmon.jpg'; // 你的图像文件名
    const reportText = 'Report text about the salmon\'s journey...'; // 你想展示的文本内容
    
    // 渲染视图并传递所有变量
    res.render('home', { videoId, backgroundStory, reportImage, reportText });
});



app.get('/migration', (req, res) => {
    res.render('migration'); // 渲染 views/migration.ejs
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在: http://178.128.147.116:${port}`);
});



