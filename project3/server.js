const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

// 设置 EJS 视图引擎
app.set('view engine', 'ejs');
app.use(express.static('public'));
// 解析 POST 请求中的数据
app.use(bodyParser.urlencoded({ extended: true }));

// 存储用户提交的报告文本（简单示例）
let userReports = [];
// 路由
app.get('/', (req, res) => {
    const videoId = 'aPf4qtCDRtE'; // 视频 ID
    const backgroundStory = "The Columbia River, one of the longest rivers in North America, has long been a vital waterway for the region\'s wildlife, particularly the salmon that rely on its waters for migration. However, over the years, human activity has taken a heavy toll on this critical ecosystem. From industrial waste to pollution runoff, the river\'s waters have become increasingly contaminated, posing severe threats to the salmon population. These majestic fish, known for their impressive journey from the ocean to their birthplace, are now facing unprecedented challenges as they struggle to navigate a river polluted by toxic chemicals, heavy metals, and excess nutrients.\n\nThe growing presence of factories along the riverbanks, the construction of dams, and urban expansion have all contributed to the degradation of water quality. As pollutants infiltrate the river, they disrupt the delicate balance of the ecosystem, making it harder for salmon to survive their long migration. Chemicals like pesticides and heavy metals accumulate in the water, harming the fish\'s reproductive capabilities and their ability to survive the grueling upstream journey. Additionally, rising water temperatures, exacerbated by pollution, further strain the salmon\'s ability to thrive.\n\nThe Columbia River\'s salmon are not just a part of the local ecosystem; they represent a vital piece of the cultural heritage and economy of the Pacific Northwest. For centuries, they have been integral to the livelihoods of Indigenous communities, local fishermen, and the broader environment. Yet, without urgent action to curb pollution and protect the river, these fish may soon disappear, leaving a devastating impact on both the ecosystem and the communities that depend on it.";
    const reportImage = 'salmon.jpg'; // 你的图像文件名
    const reportText = userReports[userReports.length - 1] || 'No report yet.'; // 显示最新的用户报告
    
    // 渲染视图并传递所有变量
    res.render('home', { videoId, backgroundStory, reportImage, reportText });
});
// 路由：接收用户提交的报告
app.post('/submit-report', (req, res) => {
    const reportText = req.body.reportText; // 获取用户输入的文本
    userReports.push(reportText); // 将文本存入数组（暂存）

    // 重定向回主页，显示最新的用户生成内容
    res.redirect('/');
});


app.get('/migration', (req, res) => {
    res.render('migration'); // 渲染 views/migration.ejs
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在: http://178.128.147.116:${port}`);
});



