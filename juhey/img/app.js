// 在 app.js 的 initSearch 函数中添加以下代码
function initSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const customSelect = document.getElementById('searchTypeSelect');
    const infoSearchUI = document.getElementById('infoSearchUI');
    const imageSearchUI = document.getElementById('imageSearchUI');
    const videoSearchUI = document.getElementById('videoSearchUI');
    const newsSearchUI = document.getElementById('newsSearchUI');

    let currentSearchUrl = 'https://www.baidu.com/s?wd=';
    const originalPlaceholder = searchInput.placeholder; // 保存原始的 placeholder

    // 键盘事件处理
    const handleSearch = (event) => {
        if (event.type === 'keydown' && event.key !== 'Enter') return;
        event.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
            window.open(currentSearchUrl + encodeURIComponent(keyword), '_blank');
        }
    };
    searchInput.addEventListener('keydown', handleSearch);
    searchForm.addEventListener('submit', handleSearch);

    // 自定义下拉菜单点击事件
    const customSelectTrigger = customSelect.querySelector('.custom-select-trigger');
    const customOptions = customSelect.querySelectorAll('.custom-option');
    customSelectTrigger.addEventListener('click', () => {
        const options = customSelect.querySelector('.custom-options');
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    customOptions.forEach(option => {
        option.addEventListener('click', () => {
            customOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            customSelectTrigger.textContent = option.textContent;
            const searchType = option.dataset.value;
            infoSearchUI.style.display = searchType === 'info' ? 'flex' : 'none';
            imageSearchUI.style.display = searchType === 'image' ? 'flex' : 'none';
            videoSearchUI.style.display = searchType === 'video' ? 'flex' : 'none';
            newsSearchUI.style.display = searchType === 'news' ? 'flex' : 'none';

            const options = customSelect.querySelector('.custom-options');
            options.style.display = 'none';

            // 设置默认激活状态
            const currentSearchUI = {
                'info': infoSearchUI,
                'image': imageSearchUI,
                'video': videoSearchUI,
                'news': newsSearchUI
            }[searchType];
            if (currentSearchUI) {
                const firstItem = currentSearchUI.querySelector('li');
                if (firstItem) {
                    activateSearchEngine(firstItem);
                }
            }
        });
    });

    // 搜索引擎选择
    const searchUIs = [infoSearchUI, imageSearchUI, videoSearchUI, newsSearchUI];
    const activateSearchEngine = (item) => {
        searchUIs.forEach(ui => ui.querySelectorAll('li').forEach(li => li.classList.remove('active')));
        item.classList.add('active');
        currentSearchUrl = item.dataset.searchUrl;
    };
    searchUIs.forEach(ui => {
        ui.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => activateSearchEngine(item));
        });
    });

    // 处理输入框的焦点事件
    searchInput.addEventListener('focus', () => {
        searchInput.placeholder = '';
    });

    searchInput.addEventListener('blur', () => {
        if (searchInput.value === '') {
            searchInput.placeholder = originalPlaceholder;
        }
    });

    // 页面首次加载时设置默认激活状态
    const defaultFirstItem = infoSearchUI.querySelector('li');
    if (defaultFirstItem) {
        activateSearchEngine(defaultFirstItem);
    }
}


function renderData(data) {
    const container = document.getElementById('categories');
    const fragment = document.createDocumentFragment();

    data.categories.forEach((category, index) => {
        const categoryId = `category-${index}`;
        const shouldShowTabs = category.showTabs; // 需确保 data.json 中存在 showTabs

        // 分类内容
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.id = categoryId;
        categoryDiv.innerHTML = `
            <h2>${category.name}</h2>
            ${shouldShowTabs ? `
            <div class="tab-nav">
                ${category.subCategories.map((sub, subIndex) => `
                    <button class="tab-link ${subIndex === 0 ? 'active' : ''}"
                            data-tab="${sub}">${sub}</button>
                `).join('')}
            </div>` : ''}
            <div class="links">
                ${category.links.map(link => `
                    <a href="${link.url}" 
                       class="link-item ${!shouldShowTabs ? 'active' : (link.subCategory === category.subCategories[0] ? 'active' : '')}"
                       data-sub-category="${link.subCategory}"
                       target="_blank"> <!-- 添加 target="_blank" 属性 -->
                        <img src="${link.icon}" alt="${link.title}图标">
                        <div class="link-info">
                            <span class="link-title">${link.title}</span>
                            <p class="link-description">${link.description}</p>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
        fragment.appendChild(categoryDiv);

        // 侧边栏项
        const navItem = document.createElement('li');
        navItem.innerHTML = `
            <img src="${category.icon}" alt="${category.name}图标" 
                 style="width:20px;height:20px;margin-right:10px;">
            <span>${category.name}</span>
        `;
        navItem.dataset.target = categoryId;
        navItem.dataset.title = category.name;
        document.getElementById('sidebarNav').appendChild(navItem);
    });

    container.appendChild(fragment);
    initTabs();
    initSidebar();
}

function initTabs() {
    document.querySelectorAll('.tab-nav').forEach(tabNav => {
        const tabs = tabNav.querySelectorAll('.tab-link');
        const category = tabNav.closest('.category');
        const links = category.querySelectorAll('.link-item');

        const activateTab = (targetTab) => {
            tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === targetTab));
            links.forEach(link => link.classList.toggle('active', link.dataset.subCategory === targetTab));
        };

        tabNav.addEventListener('click', e => {
            if (e.target.classList.contains('tab-link')) {
                activateTab(e.target.dataset.tab);
            }
        });

        if (tabs.length > 0) activateTab(tabs[0].dataset.tab);
    });
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.createElement('div');

    // 折叠按钮
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '<img src="./img/cd.png" alt="折叠侧边栏">';
    sidebar.insertAdjacentElement('afterbegin', sidebarToggle);
    const updateSidebarState = (isCollapsed) => {
        sidebar.classList.toggle('collapsed', isCollapsed);
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    };

    sidebarToggle.addEventListener('click', () => updateSidebarState(!sidebar.classList.contains('collapsed')));

    // 初始化状态
    const storedState = localStorage.getItem('sidebarCollapsed');

// 默认展开，仅当明确存储为 'true' 时折叠
    const isCollapsed = storedState === 'false'; // 无存储时为 false  储存时true
    updateSidebarState(isCollapsed);


    // 导航点击滚动
    document.querySelectorAll('#sidebarNav li').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById(item.dataset.target)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // 交叉观察器
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(document.querySelectorAll('.category')).indexOf(entry.target);
                document.querySelectorAll('#sidebarNav li').forEach((li, i) =>
                    li.classList.toggle('active', i === index)
                );
            }
        });
    }, { threshold: 0.5 });

    // 逐个观察每个类别元素
    document.querySelectorAll('.category').forEach(category => {
        observer.observe(category);
    });
}

// 数据加载
fetch('./img/data.json')
    .then(response => response.json())
    .then(renderData)
    .then(initSearch)
    .catch(console.error);