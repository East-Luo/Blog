// search.js —— 搜索框（桌面）：展开/收起交互、全文搜索、结果渲染、快捷键唤起。
// 自建 DOM，平台差异完全封装在模块内部。

import * as data from '../../core/data.js';
import * as wm from '../../core/window-manager.js';

const HIT_LABELS = {
    id: 'ID',
    title: '标题',
    body: '正文',
};

function isTyping(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export function initSearch() {
    const searchWindow = document.createElement('div');
    searchWindow.id = 'searchWindow';
    searchWindow.className = 'search-window';
    searchWindow.innerHTML = `
        <div class="search-container">
            <div id="searchButton" class="search-button">
                <div class="triangle"></div>
                <input type="text" id="searchInput" class="search-input" placeholder="搜索...">
            </div>
            <div id="searchResults" class="search-results"></div>
        </div>
    `;
    document.body.appendChild(searchWindow);

    const searchButton = searchWindow.querySelector('#searchButton');
    const searchInput = searchWindow.querySelector('#searchInput');
    const searchResults = searchWindow.querySelector('#searchResults');

    function showResults(results) {
        searchResults.innerHTML = '';

        if (!results.length) {
            searchResults.style.display = 'none';
            return;
        }

        for (const { article, hit } of results) {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            const idEl = document.createElement('div');
            idEl.className = 'result-id';
            idEl.textContent = article.id;

            const titleEl = document.createElement('div');
            titleEl.className = 'result-title';
            titleEl.textContent = article.title;

            item.appendChild(idEl);
            item.appendChild(titleEl);
            if (hit) {
                const hitEl = document.createElement('span');
                hitEl.className = 'result-hit';
                hitEl.textContent = HIT_LABELS[hit] || hit;
                item.appendChild(hitEl);
            }

            item.addEventListener('click', () => {
                wm.open(article.id);
                searchInput.value = '';
                searchResults.style.display = 'none';
                searchButton.classList.remove('active');
            });

            searchResults.appendChild(item);
        }

        searchResults.style.display = 'block';
    }

    // 点击展开/收起
    searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        searchButton.classList.toggle('active');
        if (searchButton.classList.contains('active')) searchInput.focus();
    });
    searchInput.addEventListener('click', (e) => e.stopPropagation());

    // 点击其他地方收起搜索框、隐藏结果
    document.addEventListener('click', (e) => {
        if (!searchButton.contains(e.target)) searchButton.classList.remove('active');
        if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // 输入即搜索
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        if (q) showResults(data.search(q));
        else searchResults.style.display = 'none';
    });

    // 快捷键 / 唤起搜索（不影响正在输入的场景）
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !isTyping(e.target)) {
            e.preventDefault();
            wm.focus('search');
            searchButton.classList.add('active');
            searchInput.focus();
        }
    });
}
