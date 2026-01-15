// 初始数据文件 - 首次运行爬虫后会自动更新
// 数据来源: https://g.aitags.cn/

const weaponData = [];

const hotWeapons = [];

const manufacturingData = [];

const activityData = [];

const siteInfo = {
    updateTime: '',
    updateDate: '',
    countdown: { days: 0, hours: 0 }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { weaponData, hotWeapons, manufacturingData, activityData, siteInfo };
}
