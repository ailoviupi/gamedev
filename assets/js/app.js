let weaponData = [];
let hotWeapons = [];
let manufacturingData = [];
let activityData = [];
let siteImages = {};
let siteInfo = {};

const categoryNames = {
    all: "全部",
    smg: "冲锋枪",
    pistol: "手枪",
    rifle: "步枪",
    sniper: "狙击步枪",
    marksman: "精确射手步枪",
    lmg: "轻机枪",
    shotgun: "霰弹枪",
    special: "特殊武器"
};

const categoryIcons = {
    all: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    smg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>',
    pistol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>',
    rifle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5l-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>',
    sniper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    marksman: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5l-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    lmg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/><path d="M15 6v12"/></svg>',
    shotgun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12"/><ellipse cx="12" cy="16" rx="6" ry="4"/></svg>',
    special: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
};

const weaponEmojis = {
    smg: '🔫',
    pistol: '🔫',
    rifle: '🎯',
    sniper: '🎯',
    marksman: '🎯',
    lmg: '🔥',
    shotgun: '💥',
    special: '⭐'
};

class App {
    constructor() {
        this.currentCategory = 'all';
        this.displayedWeapons = 12;
        this.theme = localStorage.getItem('theme') || 'dark';
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        await this.loadData();
        this.initTheme();
        this.initMobileMenu();
        this.initSmoothScroll();
        this.initFilterButtons();
        this.initRandomButton();
        this.initLoadMore();
        this.initEventDelegation();
        this.initCursorGlow();
        this.initAOS();
        this.renderHotWeapons();
        this.renderWeapons();
        this.renderManufacturing();
        this.renderActivities();
        this.updateStats();
    }

    async loadData() {
        try {
            const response = await fetch('assets/js/data.js');
            const scriptText = await response.text();
            
            const script = document.createElement('script');
            script.textContent = scriptText;
            document.head.appendChild(script);
            
            if (typeof weaponData === 'undefined' || weaponData.length === 0) {
                console.log('使用备用数据');
                this.loadFallbackData();
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        weaponData = [
            { name: "M870霰弹枪", category: "shotgun", code: "M870001", description: "低配方案", value: "15W", copyCount: 0, image: null },
            { name: "MK4冲锋枪", category: "smg", code: "MK4001", description: "标准配置", value: "12W", copyCount: 0, image: null },
            { name: "Mini-14射手步枪", category: "marksman", code: "MINI1401", description: "精准射击", value: "20W", copyCount: 0, image: null },
            { name: "SKS射手步枪", category: "marksman", code: "SKS001", description: "性价比之选", value: "18W", copyCount: 0, image: null },
            { name: "M4A1", category: "rifle", code: "M4A101", description: "万能之王", value: "24W", copyCount: 0, image: null },
            { name: "AK-12", category: "rifle", code: "AK1201", description: "现代AK", value: "26W", copyCount: 0, image: null },
            { name: "K416", category: "rifle", code: "K41601", description: "德系精工", value: "26W", copyCount: 0, image: null },
            { name: "SVD", category: "sniper", code: "SVD001", description: "精确狙击", value: "30W", copyCount: 0, image: null },
            { name: "AWM", category: "sniper", code: "AWM001", description: "终极狙击", value: "45W", copyCount: 0, image: null },
            { name: "M249", category: "lmg", code: "M249001", description: "火力压制", value: "30W", copyCount: 0, image: null },
            { name: "MP5", category: "smg", code: "MP5001", description: "经典冲锋", value: "15W", copyCount: 0, image: null },
            { name: "沙漠之鹰", category: "pistol", code: "DEAGLE01", description: "高伤害手枪", value: "10W", copyCount: 0, image: null },
            { name: "QBZ95-1", category: "rifle", code: "QBZ9501", description: "国产95式", value: "22W", copyCount: 0, image: null },
            { name: "PKM", category: "lmg", code: "PKM001", description: "轻机枪王", value: "28W", copyCount: 0, image: null },
            { name: "M1014", category: "shotgun", code: "M101401", description: "战术霰弹", value: "18W", copyCount: 0, image: null },
            { name: "P90", category: "smg", code: "P90001", description: "未来设计", value: "17W", copyCount: 0, image: null },
            { name: "G17", category: "pistol", code: "G17001", description: "标准手枪", value: "7W", copyCount: 0, image: null },
            { name: "SR-25", category: "marksman", code: "SR2501", description: "半自动射手", value: "24W", copyCount: 0, image: null },
            { name: "Vector", category: "smg", code: "VECTOR01", description: "超高射速", value: "18W", copyCount: 0, image: null },
            { name: "M16A4", category: "rifle", code: "M16A401", description: "经典步枪", value: "20W", copyCount: 0, image: null },
            { name: "AKM", category: "rifle", code: "AKM001", description: "经典AK", value: "20W", copyCount: 0, image: null },
            { name: "PSG-1", category: "sniper", code: "PSG101", description: "高精度狙击", value: "35W", copyCount: 0, image: null },
            { name: "MK47", category: "rifle", code: "MK4701", description: "强力输出", value: "25W", copyCount: 0, image: null },
            { name: "SCAR-H", category: "rifle", code: "SCARH01", description: "特种作战", value: "27W", copyCount: 0, image: null },
            { name: "野牛冲锋枪", category: "smg", code: "BISON01", description: "高射速", value: "16W", copyCount: 0, image: null },
            { name: "SV-98", category: "sniper", code: "SV9801", description: "俄式狙击", value: "33W", copyCount: 0, image: null },
            { name: "M700", category: "sniper", code: "M70001", description: "经典狙击", value: "28W", copyCount: 0, image: null },
            { name: "93R", category: "pistol", code: "93R001", description: "手枪连发", value: "9W", copyCount: 0, image: null },
            { name: "UZI", category: "smg", code: "UZI001", description: "微型冲锋", value: "13W", copyCount: 0, image: null },
            { name: "AUG", category: "rifle", code: "AUG001", description: "奥地利名枪", value: "25W", copyCount: 0, image: null },
            { name: "R93", category: "sniper", code: "R93001", description: "精准猎手", value: "38W", copyCount: 0, image: null },
            { name: "PTR-32", category: "sniper", code: "PTR3201", description: "远程打击", value: "32W", copyCount: 0, image: null },
            { name: "KC17", category: "sniper", code: "KC1701", description: "顶级狙击", value: "40W", copyCount: 0, image: null },
            { name: "M14", category: "marksman", code: "M1401", description: "经典射手", value: "22W", copyCount: 0, image: null },
            { name: "M250", category: "lmg", code: "M250001", description: "重火力", value: "32W", copyCount: 0, image: null },
            { name: "QJB201", category: "lmg", code: "QJB20101", description: "国产机枪", value: "26W", copyCount: 0, image: null },
            { name: "S12K", category: "shotgun", code: "S12K01", description: "自动霰弹", value: "20W", copyCount: 0, image: null },
            { name: "725", category: "shotgun", code: "725001", description: "双管爆发", value: "22W", copyCount: 0, image: null },
            { name: "复合弓", category: "special", code: "BOW001", description: "特殊武器", value: "12W", copyCount: 0, image: null },
            { name: "AS Val", category: "special", code: "ASVAL01", description: "特种消音", value: "28W", copyCount: 0, image: null },
            { name: "K437", category: "special", code: "K43701", description: "特殊武器", value: "20W", copyCount: 0, image: null },
            { name: "腾龙", category: "rifle", code: "TENGLONG01", description: "国产新锐", value: "27W", copyCount: 0, image: null },
            { name: "G3", category: "rifle", code: "G3001", description: "德系经典", value: "22W", copyCount: 0, image: null },
            { name: "SG552", category: "rifle", code: "SG55201", description: "精准射击", value: "24W", copyCount: 0, image: null },
            { name: "M7", category: "rifle", code: "M7001", description: "战斗步枪", value: "23W", copyCount: 0, image: null },
            { name: "CAR-15", category: "rifle", code: "CAR1501", description: "万能配置", value: "22W", copyCount: 0, image: null },
            { name: "QSZ92", category: "pistol", code: "QSZ9201", description: "手枪推荐", value: "8W", copyCount: 0, image: null },
            { name: "M1911", category: "pistol", code: "M191101", description: "经典手枪", value: "6W", copyCount: 0, image: null },
            { name: "G18", category: "pistol", code: "G18001", description: "全自动手枪", value: "10W", copyCount: 0, image: null },
            { name: "357左轮", category: "pistol", code: "357001", description: "高伤害左轮", value: "11W", copyCount: 0, image: null },
            { name: "MP7", category: "smg", code: "MP7001", description: "精密冲锋", value: "16W", copyCount: 0, image: null },
            { name: "SMG-45", category: "smg", code: "SMG4501", description: "复古风格", value: "14W", copyCount: 0, image: null },
            { name: "SR-3M", category: "smg", code: "SR3M01", description: "俄式冲锋", value: "16W", copyCount: 0, image: null },
            { name: "勇士", category: "smg", code: "WARRIOR01", description: "国产冲锋", value: "15W", copyCount: 0, image: null },
            { name: "QCQ171", category: "smg", code: "QCQ17101", description: "新锐冲锋", value: "17W", copyCount: 0, image: null },
            { name: "AKS-74U", category: "smg", code: "AKS74U01", description: "近距离突击", value: "14W", copyCount: 0, image: null },
            { name: "ASh-12K", category: "smg", code: "ASH12K01", description: "大口径冲锋", value: "19W", copyCount: 0, image: null },
            { name: "Marlin", category: "marksman", code: "MARLIN01", description: "经典复古", value: "16W", copyCount: 0, image: null }
        ];

        hotWeapons = [
            { name: "M249", code: "6G94JAC08OPOB8QKQ72I8", description: "低配", value: "17W", copyCount: 9150, image: null },
            { name: "SVD", code: "6GS5BGK064FJ19C5SGDFD", description: "火控", value: "29W", copyCount: 0, image: null },
            { name: "K416", code: "6GL0ARO0B47DBPRUAR75R", description: "低配", value: "18W", copyCount: 0, image: null },
            { name: "M250", code: "6H3EPMK0BAC7RIM3B0293", description: "低配", value: "36W", copyCount: 3746, image: null }
        ];
    }

    getWeaponIcon(weapon) {
        if (weapon.image) {
            return `<img src="${weapon.image}" alt="${weapon.name}" class="weapon-img" loading="lazy" decoding="async" onerror="this.style.display='none';this.parentElement.innerHTML='${weaponEmojis[weapon.category] || '🔫'}';">`;
        }
        return weaponEmojis[weapon.category] || '🔫';
    }

    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', this.theme);
            localStorage.setItem('theme', this.theme);
        });
    }

    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initFilterButtons() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentCategory = btn.dataset.category;
                this.displayedWeapons = 12;
                this.renderWeapons();
            });
        });
    }

    initRandomButton() {
        const randomBtn = document.getElementById('randomBtn');
        randomBtn.addEventListener('click', () => {
            const shuffled = [...hotWeapons].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 4);
            this.renderHotWeapons(selected);
            this.showToast('已随机更换4个武器', 'success');
            
            document.getElementById('hot').scrollIntoView({ behavior: 'smooth' });
        });
    }

    initLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn.addEventListener('click', () => {
            this.displayedWeapons += 12;
            this.renderWeapons();
            
            if (this.displayedWeapons >= this.getFilteredWeapons().length) {
                loadMoreBtn.style.display = 'none';
            }
        });
    }

    initEventDelegation() {
        const handleCopy = (e) => {
            const btn = e.target.closest('.copy-btn');
            if (!btn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const codeContainer = btn.closest('[data-code]');
            if (codeContainer) {
                const code = codeContainer.dataset.code;
                const icon = btn.querySelector('.copy-icon');
                this.copyCode(code, icon);
            }
        };

        document.addEventListener('click', handleCopy);
        document.addEventListener('touchend', handleCopy);
    }

    initCursorGlow() {
        const cursorGlow = document.querySelector('.cursor-glow');
        
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });

        document.addEventListener('mouseenter', () => {
            cursorGlow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }

    initAOS() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });
    }

    getFilteredWeapons() {
        if (this.currentCategory === 'all') {
            return weaponData;
        }
        return weaponData.filter(w => w.category === this.currentCategory);
    }

    renderHotWeapons(weapons = hotWeapons) {
        const hotGrid = document.getElementById('hotGrid');
        if (!hotGrid) return;
        
        hotGrid.innerHTML = weapons.map((weapon, index) => `
            <div class="hot-card" style="animation-delay: ${index * 0.1}s">
                <div class="hot-card-header">
                    <h3 class="hot-card-title">${weapon.name}</h3>
                    <span class="hot-badge">热门</span>
                </div>
                <div class="hot-card-code" data-code="${weapon.code}">
                    <span class="code-text">${this.formatCode(weapon.code)}</span>
                    <button class="copy-btn" aria-label="复制">
                        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                </div>
                <div class="hot-card-meta">
                    <span class="hot-card-description">${weapon.description}</span>
                    <span class="hot-card-value">${weapon.value}</span>
                </div>
                <div class="hot-card-stats">
                    <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span class="hot-card-copy-count">${weapon.copyCount > 0 ? weapon.copyCount.toLocaleString() : '0'} 次复制</span>
                </div>
            </div>
        `).join('');
    }

    renderWeapons() {
        const weaponsGrid = document.getElementById('weaponsGrid');
        if (!weaponsGrid) return;
        
        const filteredWeapons = this.getFilteredWeapons();
        const weaponsToShow = filteredWeapons.slice(0, this.displayedWeapons);
        
        weaponsGrid.innerHTML = weaponsToShow.map((weapon, index) => `
            <div class="weapon-card" style="animation-delay: ${index * 0.05}s">
                <div class="weapon-card-header">
                    <div class="weapon-icon">${this.getWeaponIcon(weapon)}</div>
                    <div class="weapon-info">
                        <h3 class="weapon-name">${weapon.name}</h3>
                        <span class="weapon-category">${categoryNames[weapon.category] || weapon.category}</span>
                    </div>
                </div>
                <div class="weapon-code" data-code="${weapon.code}">
                    <code>${weapon.code}</code>
                    <button class="copy-btn" aria-label="复制">
                        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                </div>
            </div>
        `).join('');

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        if (this.displayedWeapons >= filteredWeapons.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }

    renderManufacturing() {
        const container = document.querySelector('.manufacturing-grid');
        if (!container || !manufacturingData || manufacturingData.length === 0) return;

        const categories = {
            '技术中心': 'tech-center',
            '工作台': 'workbench',
            '制药台': 'pharmacy',
            '防具台': 'armor'
        };

        container.innerHTML = manufacturingData.map((item, index) => `
            <div class="manufacturing-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card-glow"></div>
                <div class="card-header">
                    <div class="card-icon ${categories[item.category] || ''}">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="card-img" onerror="this.style.display='none'">` : ''}
                    </div>
                    <span class="card-category">${item.category || '制造'}</span>
                </div>
                <h3 class="card-title">${item.name}</h3>
                <div class="card-profit">
                    <span class="profit-label">小时利润</span>
                    <span class="profit-value">${item.profit.toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }

    renderActivities() {
        const container = document.querySelector('.activity-grid');
        if (!container || !activityData || activityData.length === 0) return;

        container.innerHTML = activityData.map(item => `
            <div class="activity-card">
                <div class="activity-icon">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="activity-img" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="activity-info">
                    <h3 class="activity-name">${item.name}</h3>
                    <div class="activity-profit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                            <polyline points="17 6 23 6 23 12"/>
                        </svg>
                        <span>${item.reward || '未知'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const weaponCount = document.getElementById('weaponCount');
        const codeCount = document.getElementById('codeCount');
        
        if (weaponCount) {
            weaponCount.textContent = (weaponData.length || 0) + '+';
        }
        if (codeCount) {
            codeCount.textContent = ((weaponData.length || 0) * 4) + '+';
        }
    }

    formatCode(code) {
        if (!code) return '';
        return code.length > 12 ? code.substring(0, 12) + '...' : code;
    }

    async copyCode(code, element) {
        try {
            await navigator.clipboard.writeText(code);
            
            const icon = element.querySelector('.copy-icon');
            const originalHTML = icon.innerHTML;
            
            icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
            icon.style.color = '#10b981';
            
            this.showToast('改枪码已复制到剪贴板', 'success');
            
            setTimeout(() => {
                icon.innerHTML = originalHTML;
                icon.style.color = '';
            }, 2000);
        } catch (err) {
            this.showToast('复制失败，请手动选择复制', 'info');
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' 
                    ? '<polyline points="20 6 9 17 4 12"/>'
                    : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
            </svg>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

const app = new App();
