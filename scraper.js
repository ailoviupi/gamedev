const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://g.aitags.cn/';
const OUTPUT_DIR = path.join(__dirname, 'assets');
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');
const DATA_FILE = path.join(OUTPUT_DIR, 'js', 'data.js');

if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const categoryIconMap = {
    'rifle': '/assets/images/category_rifle.svg',
    'sniper': '/assets/images/category_sniper.svg',
    'marksman': '/assets/images/category_marksman.svg',
    'smg': '/assets/images/category_smg.svg',
    'shotgun': '/assets/images/category_shotgun.svg',
    'pistol': '/assets/images/category_pistol.svg',
    'mg': '/assets/images/category_mg.svg',
    'lmg': '/assets/images/category_mg.svg',
    'melee': '/assets/images/category_melee.svg',
    'explosive': '/assets/images/category_explosive.svg'
};

function getWeaponImage(weaponName, category) {
    const normalizedName = weaponName.toLowerCase();

    const weaponSpecificImages = {
        'm4a1': '/assets/images/category_rifle.svg',
        'm4': '/assets/images/category_rifle.svg',
        'ak-47': '/assets/images/category_rifle.svg',
        'ak47': '/assets/images/category_rifle.svg',
        'ak': '/assets/images/category_rifle.svg',
        'm16': '/assets/images/category_rifle.svg',
        'aug': '/assets/images/category_rifle.svg',
        'scar': '/assets/images/category_rifle.svg',
        'ar15': '/assets/images/category_rifle.svg',

        'awm': '/assets/images/category_sniper.svg',
        'awp': '/assets/images/category_sniper.svg',
        'barrett': '/assets/images/category_sniper.svg',
        'm24': '/assets/images/category_sniper.svg',
        'ssg': '/assets/images/category_sniper.svg',

        'sr-25': '/assets/images/category_marksman.svg',
        'sr25': '/assets/images/category_marksman.svg',
        'sks': '/assets/images/category_marksman.svg',
        'scar-h': '/assets/images/category_marksman.svg',
        'scarh': '/assets/images/category_marksman.svg',

        'mp5': '/assets/images/category_smg.svg',
        'ump': '/assets/images/category_smg.svg',
        'p90': '/assets/images/category_smg.svg',
        'vector': '/assets/images/category_smg.svg',

        'm1897': '/assets/images/category_shotgun.svg',
        'm870': '/assets/images/category_shotgun.svg',
        'spas': '/assets/images/category_shotgun.svg',

        'glock': '/assets/images/category_pistol.svg',
        'm1911': '/assets/images/category_pistol.svg',
        'deagle': '/assets/images/category_pistol.svg',
        ' desert': '/assets/images/category_pistol.svg',

        'm249': '/assets/images/category_mg.svg',
        'pkp': '/assets/images/category_mg.svg',
        'mg4': '/assets/images/category_mg.svg',

        'knife': '/assets/images/category_melee.svg',
        'blade': '/assets/images/category_melee.svg',

        'rpg': '/assets/images/category_explosive.svg',
        'rpg-7': '/assets/images/category_explosive.svg',
        'm203': '/assets/images/category_explosive.svg'
    };

    for (const [key, imagePath] of Object.entries(weaponSpecificImages)) {
        if (normalizedName.includes(key)) {
            return imagePath;
        }
    }

    return categoryIconMap[category] || categoryIconMap['default'];
}

async function scrapeWebsite() {
    console.log('🚀 开始爬取数据...');
    console.log(`📡 目标网站: ${SOURCE_URL}`);
    
    try {
        console.log('📥 正在获取页面...');
        const response = await axios.get(SOURCE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': SOURCE_URL
            },
            timeout: 30000,
            responseType: 'arraybuffer'
        });

        console.log('✅ 页面获取成功');
        const htmlContent = response.data.toString('utf-8');
        const $ = cheerio.load(htmlContent);
        
        const data = {
            updateTime: new Date().toLocaleString('zh-CN'),
            weapons: [],
            hotCodes: [],
            manufacturing: [],
            activities: [],
            images: {}
        };

        console.log('🔍 正在解析数据...');

        const downloadedImages = new Map();
        let imageIndex = 0;

        $('img').each((index, img) => {
            const src = $(img).attr('src') || $(img).attr('data-src');
            if (src && (src.includes('weapon') || src.includes('icon') || src.includes('img'))) {
                const fullUrl = src.startsWith('http') ? src : new URL(src, SOURCE_URL).href;
                const ext = path.extname(fullUrl) || '.png';
                const filename = `weapon_${imageIndex}${ext}`;
                const localPath = path.join(IMAGES_DIR, filename);
                
                if (!downloadedImages.has(fullUrl)) {
                    downloadedImages.set(fullUrl, `/assets/images/${filename}`);
                }
                
                $(img).attr('data-local-src', `/assets/images/${filename}`);
            }
        });

        console.log(`🖼️ 发现 ${downloadedImages.size} 张图片需要下载`);

        console.log('📥 正在下载图片...');
        for (const [url, localPath] of downloadedImages) {
            try {
                const imgResponse = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': SOURCE_URL
                    },
                    timeout: 10000,
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(path.join(__dirname, localPath));
                imgResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                console.log(`✅ 下载成功: ${localPath}`);
            } catch (error) {
                console.warn(`⚠️ 图片下载失败: ${url}`);
            }
        }

        const weaponImageMap = {};
        $('table tbody tr').each((index, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 2) {
                const name = $(cols[0]).text().trim();
                const imgElement = $(cols[0]).find('img');
                const localSrc = imgElement.attr('data-local-src');
                
                if (name && localSrc) {
                    const filename = path.basename(localSrc);
                    weaponImageMap[name] = `/assets/images/${filename}`;
                }
            }
        });

        data.images = Object.fromEntries(downloadedImages);

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
                    const image = getWeaponImage(name, category);
                    
                    data.weapons.push({
                        name,
                        code,
                        description,
                        value,
                        category,
                        copyCount: parseInt(copyCount.replace(/\D/g, '')) || 0,
                        image
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
                    const category = detectCategory(name);
                    const image = getWeaponImage(name, category);
                    data.hotCodes.push({
                        name,
                        code,
                        description,
                        value,
                        copyCount: parseInt(copyCount.replace(/\D/g, '')) || 0,
                        image
                    });
                }
            }
        });

        console.log(`🔥 解析到 ${data.hotCodes.length} 个热门改枪码`);

        const manufacturingSection = $('section').filter((i, el) => $(el).text().includes('特勤处制造')).first();
        
        manufacturingSection.find('.manufacturing-card, .card, [class*="card"]').each((index, el) => {
            const name = $(el).find('h3, .title, .card-title').text().trim();
            const profitText = $(el).find('.profit-value, .card-profit, [class*="profit"]').text().trim();
            const profit = profitText.replace(/[^\d]/g, '');
            const category = $(el).find('.card-category, .category, [class*="category"]').text().trim();
            const imgElement = $(el).find('img');
            const image = imgElement.attr('data-local-src') || null;

            if (name && profit) {
                data.manufacturing.push({
                    name,
                    profit: parseInt(profit) || 0,
                    category: category || '制造',
                    image
                });
            }
        });

        console.log(`🏭 解析到 ${data.manufacturing.length} 个制造物品`);

        const activitySection = $('section').filter((i, el) => $(el).text().includes('研发部门')).first();
        activitySection.find('.activity-card, .activity-item, [class*="activity"]').each((index, el) => {
            const name = $(el).find('h3, .name, .activity-name').text().trim();
            const reward = $(el).find('.activity-profit, .reward, [class*="reward"]').text().trim();
            const imgElement = $(el).find('img');
            const image = imgElement.attr('data-local-src') || null;

            if (name) {
                data.activities.push({
                    name,
                    reward: reward || '未知',
                    image
                });
            }
        });

        console.log(`🎁 解析到 ${data.activities.length} 个活动物品`);

        const countdownMatch = htmlContent.match(/活动倒计时[：:]\s*(\d+)天(\d+)时/);
        if (countdownMatch) {
            data.countdown = {
                days: parseInt(countdownMatch[1]),
                hours: parseInt(countdownMatch[2])
            };
        }

        const dateMatch = htmlContent.match(/每日密码更新时间[：:]\s*(\d{2}-\d{2})/);
        if (dateMatch) {
            data.updateDate = dateMatch[1];
        }

        const outputContent = `// 自动生成的数据文件 - ${new Date().toLocaleString('zh-CN')}
// 数据来源: ${SOURCE_URL}

const weaponData = ${JSON.stringify(data.weapons, null, 4)};

const hotWeapons = ${JSON.stringify(data.hotCodes, null, 4)};

const manufacturingData = ${JSON.stringify(data.manufacturing, null, 4)};

const activityData = ${JSON.stringify(data.activities, null, 4)};

const siteImages = ${JSON.stringify(data.images, null, 4)};

const siteInfo = {
    updateTime: '${data.updateTime}',
    updateDate: '${data.updateDate || ''}',
    countdown: ${JSON.stringify(data.countdown || { days: 0, hours: 0 })}
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { weaponData, hotWeapons, manufacturingData, activityData, siteImages, siteInfo };
}
`;

        fs.writeFileSync(DATA_FILE, outputContent, 'utf-8');
        console.log(`💾 数据已保存到: ${DATA_FILE}`);
        console.log('✅ 数据爬取完成！');
        console.log(`📁 图片保存在: ${IMAGES_DIR}`);

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
