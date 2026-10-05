// mobile/search.js —— 搜索框（手机端）：居中、默认展开，右下角纯三角形「回到搜索」。

import * as data from '../../core/data.js';
import * as wm from '../../core/window-manager.js';

const HIT_LABELS = {
    id: 'ID',
    title: '标题',
    body: '正文',
};

export function initSearch() {
    const searchWindow = document.createElement('div');
    searchWindow.id = 'searchWindow';
    searchWindow.className = 'search-window';
    searchWindow.innerHTML = `
        <input type="text" id="searchInput" class="search-input" placeholder="搜索...">
        <div id="searchResults" class="search-results"></div>
    `;
    document.body.appendChild(searchWindow);

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
            });

            searchResults.appendChild(item);
        }

        searchResults.style.display = 'block';
    }

    searchInput.addEventListener('click', (e) => e.stopPropagation());

    // 点击其他地方隐藏结果
    document.addEventListener('click', (e) => {
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
}
