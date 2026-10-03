// sidebar.js —— 侧边栏：渲染文章列表，点击打开文章，高亮当前置顶文章。

import * as data from './data.js';
import * as wm from './window-manager.js';

const listEl = document.getElementById('articleList');

function render() {
    const articles = data.getArticles();
    listEl.innerHTML = '';

    if (!articles.length) {
        const empty = document.createElement('div');
        empty.className = 'sidebar-item empty';
        empty.textContent = '暂无文章';
        listEl.appendChild(empty);
        return;
    }

    for (const a of articles) {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.dataset.id = a.id;
        item.textContent = `${a.id} ${a.title}`;
        item.addEventListener('click', () => wm.open(a.id));
        listEl.appendChild(item);
    }

    updateActive(wm.getStack());
}

function updateActive(stack) {
    const top = stack.length ? stack[stack.length - 1] : null;
    const activeId = top && top.type === 'article' ? top.id : null;
    for (const el of listEl.querySelectorAll('.sidebar-item')) {
        el.classList.toggle('active', el.dataset.id === activeId);
    }
}

export function initSidebar() {
    render();
    wm.subscribe(updateActive);
    data.subscribe(render);
}
