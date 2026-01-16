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
    'explosive': '/assets/images/category_explosive.svg',
    'special': '/assets/images/category_special.svg'
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
            images: {},
            countdown: { days: 0, hours: 0 }
        };

        console.log('🔍 正在解析数据...');

        console.log('📊 解析武器表格数据...');
        const tableRows = $('table tbody tr');
        tableRows.each((index, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 4) {
                const name = $(cols[0]).text().trim();
                const code = $(cols[1]).text().trim();
                const description = $(cols[2]).text().trim();
                const value = $(cols[3]).text().trim();
                
                let copyCount = 0;
                if (cols.length >= 5) {
                    const copyText = $(cols[4]).text().trim();
                    copyCount = parseInt(copyText.replace(/\D/g, '')) || 0;
                }

                if (name && code) {
                    const category = detectCategory(name);
                    const image = getWeaponImage(name, category);
                    
                    data.weapons.push({
                        name,
                        code,
                        description,
                        value,
                        category,
                        copyCount,
                        image
                    });
                }
            }
        });

        if (data.weapons.length === 0) {
            const tableHtml = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
            if (tableHtml) {
                tableHtml.forEach(table => {
                    const table$ = cheerio.load(table);
                    table$('tbody tr').each((index, row) => {
                        const cols = $(row).find('td');
                        if (cols.length >= 4) {
                            const name = $(cols[0]).text().trim();
                            const code = $(cols[1]).text().trim();
                            const description = $(cols[2]).text().trim();
                            const value = $(cols[3]).text().trim();
                            
                            if (name && code) {
                                const category = detectCategory(name);
                                const image = getWeaponImage(name, category);
                                
                                data.weapons.push({
                                    name,
                                    code,
                                    description,
                                    value,
                                    category,
                                    copyCount: 0,
                                    image
                                });
                            }
                        }
                    });
                });
            }
        }

        console.log(`📊 解析到 ${data.weapons.length} 个武器数据`);

        console.log('🔥 解析热门改枪码...');
        const hotSection = $('section').filter((i, el) => $(el).text().includes('热门改枪码')).first();
        if (hotSection.length) {
            hotSection.find('table tbody tr').each((index, row) => {
                const cols = $(row).find('td');
                if (cols.length >= 4) {
                    const name = $(cols[0]).text().trim();
                    const code = $(cols[1]).text().trim();
                    const description = $(cols[2]).text().trim();
                    const value = $(cols[3]).text().trim();
                    
                    let copyCount = 0;
                    if (cols.length >= 5) {
                        const copyText = $(cols[4]).text().trim();
                        copyCount = parseInt(copyText.replace(/\D/g, '')) || 0;
                    }

                    if (name && code) {
                        const category = detectCategory(name);
                        const image = getWeaponImage(name, category);
                        data.hotCodes.push({
                            name,
                            code,
                            description,
                            value,
                            copyCount,
                            image
                        });
                    }
                }
            });
        }

        console.log(`🔥 解析到 ${data.hotCodes.length} 个热门改枪码`);

        console.log('🏭 解析特勤处制造推荐...');
        const manufacturingCategories = [
            { name: '技术中心', keywords: ['幻影垂直握把', '技术中心'] },
            { name: '工作台', keywords: ['9x39mm BP', '工作台'] },
            { name: '制药台', keywords: ['战地医疗箱', '制药台'] },
            { name: '防具台', keywords: ['精英防弹背心', '防具台'] }
        ];

        manufacturingCategories.forEach(cat => {
            const profitMatch = htmlContent.match(new RegExp(`${cat.name}[\\s\\S]*?(\\d{1,3}(?:,\\d{3})*)\\s*小时利润`));
            
            const itemMatch = htmlContent.match(new RegExp(`([\\u4e00-\\u9fff]+(?:握把|BP|医疗箱|背心))`));
            
            const profit = profitMatch ? parseInt(profitMatch[1].replace(/,/g, '')) : 0;
            
            data.manufacturing.push({
                name: itemMatch ? itemMatch[1] : `${cat.name}推荐物品`,
                profit: profit,
                category: cat.name,
                image: null
            });
        });

        if (data.manufacturing.length === 0 || data.manufacturing[0].profit === 0) {
            const hardcodedManufacturing = [
                { name: '幻影垂直握把', profit: 7111, category: '技术中心' },
                { name: '9x39mm BP', profit: 28546, category: '工作台' },
                { name: '战地医疗箱', profit: 3303, category: '制药台' },
                { name: '精英防弹背心', profit: 16750, category: '防具台' }
            ];
            
            hardcodedManufacturing.forEach(item => {
                const existing = data.manufacturing.find(m => m.category === item.category);
                if (!existing || existing.profit === 0) {
                    if (existing) {
                        existing.name = item.name;
                        existing.profit = item.profit;
                    } else {
                        data.manufacturing.push(item);
                    }
                }
            });
        }

        console.log(`🏭 解析到 ${data.manufacturing.length} 个制造物品`);

        console.log('🎁 解析研发部门活动物品...');
        const activityMatch = htmlContent.match(/研发部门活动物品[\s\S]*?<div[^>]*>/);
        if (activityMatch) {
            const activityHtml = activityMatch[0];
            const items = activityHtml.match(/[\u4e00-\u9fff]{2,10}/g) || [];
            
            const cleanItems = [...new Set(items)].filter(item => 
                !item.includes('研发') && 
                !item.includes('部门') && 
                !item.includes('活动') && 
                !item.includes('物品') &&
                !item.includes('已结束') &&
                item.length >= 2
            );
            
            if (cleanItems.length >= 2) {
                data.activities.push({ name: cleanItems[0], reward: cleanItems[1] || '已结束', image: null });
            } else if (cleanItems.length === 1) {
                data.activities.push({ name: cleanItems[0], reward: '活动奖励', image: null });
            }
        }

        if (data.activities.length === 0) {
            const defaultActivities = [
                { name: '加密路由器', reward: 'DVD光驱' },
                { name: 'DVD光驱', reward: '已结束' }
            ];
            data.activities = defaultActivities;
        }

        console.log(`🎁 解析到 ${data.activities.length} 个活动物品`);

        const timeMatch = htmlContent.match(/Data updated:\s*(\d{2}:\d{2})/);
        if (timeMatch) {
            data.updateTime = timeMatch[1];
        }

        const countdownMatch = htmlContent.match(/倒计时[：:]*\s*(\d+)天?\s*(\d+)时/);
        if (countdownMatch) {
            data.countdown = {
                days: parseInt(countdownMatch[1]),
                hours: parseInt(countdownMatch[2])
            };
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
