const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/api/data', (req, res) => {
    try {
        const data = require('./assets/js/data.js');
        res.json({
            success: true,
            data: {
                weapons: data.weaponData,
                hotCodes: data.hotWeapons,
                manufacturing: data.manufacturingData,
                activities: data.activityData,
                siteInfo: data.siteInfo
            }
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/update', async (req, res) => {
    try {
        const { exec } = require('child_process');
        exec('node scraper.js', (error, stdout, stderr) => {
            if (error) {
                return res.json({ success: false, error: error.message });
            }
            res.json({ success: true, message: '数据更新成功' });
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 API 接口: http://localhost:${PORT}/api/data`);
    console.log(`🔄 更新接口: http://localhost:${PORT}/api/update`);
});
