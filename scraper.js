const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://g.aitags.cn/';
const OUTPUT_FILE = path.join(__dirname, 'assets', 'js', 'data.js');

async function scrapeWebsite() {
    console.log('🚀 开始爬取数据...');
    console.log(`📡 目标网站: ${SOURCE_URL}`);
    
    try {
        console.log('📥 正在获取页面...');
        const response = await axios.get(SOURCE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            },
            timeout: 30000
        });

        console.log('✅ 页面获取成功');
        const $ = cheerio.load(response.data);
        
        const data = {
            updateTime: new Date().toLocaleString('zh-CN'),
            weapons: [],
            hotCodes: [],
            manufacturing: [],
            activities: []
        };

        console.log('🔍 正在解析数据...');

        const rows = $('table tbody tr');
        rows.each((index, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 5) {
                const name = $(cols[0]).text().trim();
                const code = $(cols[1]).text().trim();
                const description = $(cols[2]).text().trim();
                const value = $(cols[3]).text().trim();
                const copyCount = $(cols[4]).text().trim();

                if (name && code) {
                    const category = detectCategory(name);
                    data.weapons.push({
                        name,
                        code,
                        description,
                        value,
                        category,
                        copyCount: parseInt(copyCount.replace(/\D/g, '')) || 0
                    });
                }
            }
        });

        console.log(`📊 解析到 ${data.weapons.length} 个武器数据`);

        const hotSection = $('section').filter((i, el) => $(el).text().includes('热门改枪码')).first();
        hotSection.find('table tbody tr').each((index, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 5) {
                const name = $(cols[0]).text().trim();
                const code = $(cols[1]).text().trim();
                const description = $(cols[2]).text().trim();
                const value = $(cols[3]).text().trim();
                const copyCount = $(cols[4]).text().trim();

                if (name && code) {
                    data.hotCodes.push({
                        name,
                        code,
                        description,
                        value,
                        copyCount: parseInt(copyCount.replace(/\D/g, '')) || 0
                    });
                }
            }
        });

        console.log(`🔥 解析到 ${data.hotCodes.length} 个热门改枪码`);

        const manufacturingSection = $('section').filter((i, el) => $(el).text().includes('特勤处制造')).first();
        manufacturingSection.find('.manufacturing-card, .card').each((index, el) => {
            const name = $(el).find('h3, .title').text().trim();
            const profitText = $(el).find('.profit-value, .card-profit').text().trim();
            const profit = profitText.replace(/[^\d]/g, '');
            const category = $(el).find('.card-category, .category').text().trim();

            if (name && profit) {
                data.manufacturing.push({
                    name,
                    profit: parseInt(profit) || 0,
                    category
                });
            }
        });

        console.log(`🏭 解析到 ${data.manufacturing.length} 个制造物品`);

        const activitySection = $('section').filter((i, el) => $(el).text().includes('研发部门')).first();
        activitySection.find('.activity-card, .activity-item').each((index, el) => {
            const name = $(el).find('h3, .name, .activity-name').text().trim();
            const reward = $(el).find('.activity-profit, .reward').text().trim();

            if (name) {
                data.activities.push({
                    name,
                    reward
                });
            }
        });

        console.log(`🎁 解析到 ${data.activities.length} 个活动物品`);

        const countdownMatch = response.data.match(/活动倒计时[：:]\s*(\d+)天(\d+)时/);
        if (countdownMatch) {
            data.countdown = {
                days: parseInt(countdownMatch[1]),
                hours: parseInt(countdownMatch[2])
            };
        }

        const dateMatch = response.data.match(/每日密码更新时间[：:]\s*(\d{2}-\d{2})/);
        if (dateMatch) {
            data.updateDate = dateMatch[1];
        }

        const outputContent = `// 自动生成的数据文件 - ${new Date().toLocaleString('zh-CN')}
// 数据来源: ${SOURCE_URL}

const weaponData = ${JSON.stringify(data.weapons, null, 4)};

const hotWeapons = ${JSON.stringify(data.hotCodes, null, 4)};

const manufacturingData = ${JSON.stringify(data.manufacturing, null, 4)};

const activityData = ${JSON.stringify(data.activities, null, 4)};

const siteInfo = {
    updateTime: '${data.updateTime}',
    updateDate: '${data.updateDate || ''}',
    countdown: ${JSON.stringify(data.countdown || { days: 0, hours: 0 })}
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { weaponData, hotWeapons, manufacturingData, activityData, siteInfo };
}
`;

        fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf-8');
        console.log(`💾 数据已保存到: ${OUTPUT_FILE}`);
        console.log('✅ 数据爬取完成！');

        return data;

    } catch (error) {
        console.error('❌ 爬取失败:', error.message);
        if (error.response) {
            console.error('📡 响应状态:', error.response.status);
        }
        process.exit(1);
    }
}

function detectCategory(name) {
    const nameLower = name.toLowerCase();
    
    const patterns = {
        'smg': ['冲锋枪', 'mp5', 'p90', 'vector', 'uzi', 'smg', 'mp7', 'mk4', '野牛', 'ak74u', 'sr-3m', '勇士', 'mp7', 'qcq171', 'ash-12k'],
        'pistol': ['手枪', 'qsz92', '沙漠之鹰', 'g17', 'm1911', '93r', '357', '左轮', 'g18'],
        'rifle': ['步枪', 'm4a1', 'akm', 'm16a4', 'scar', 'aug', 'k416', 'ak-12', 'car-15', 'mk47', 'qbz95', 'm7', 'sg552', 'g3', '腾龙'],
        'sniper': ['狙击', 'svd', 'psg-1', 'ptr', 'kc17', 'awm', 'r93', 'sv-98', 'm700'],
        'marksman': ['射手步枪', 'mini-14', 'sks', 'marlin', 'sr-25', 'm14'],
        'lmg': ['轻机枪', 'pkm', 'm249', 'm250', 'qjb201'],
        'shotgun': ['霰弹枪', 'm870', 'm1014', 's12k', '725', '双管'],
        'special': ['特殊', '复合弓', 'as val', 'k437']
    };

    for (const [category, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))) {
            return category;
        }
    }

    return 'rifle';
}

scrapeWebsite();
