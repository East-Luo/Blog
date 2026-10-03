// search.js —— 搜索框：展开/收起交互、模糊搜索、结果渲染、快捷键唤起。
// 搜索框是 window-manager 中的一个特殊窗口，跟随栈层叠。

import * as data from './data.js';
import * as wm from './window-manager.js';

const searchWindow = document.getElementById('searchWindow');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const HIT_LABELS = {
    id: 'ID',
    title: '标题',
    body: '正文',
};

function isTyping(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

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

function initSearch() {
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

    // 跟随栈层叠：搜索窗口的 z 由 wm 分配；置顶且有文章时显示遮罩
    wm.subscribe((stack) => {
        const w = stack.find((x) => x.id === 'search');
        searchWindow.style.zIndex = w ? String(w.z) : '10';

        const top = stack.length ? stack[stack.length - 1] : null;
        const hasArticles = stack.some((x) => x.type === 'article');
        const dimmed = !!(top && top.id === 'search' && hasArticles);
        searchWindow.classList.toggle('dimmed', dimmed);
    });
}

export { initSearch };
