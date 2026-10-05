// mobile/tabbar.js —— 底部 Dock（手机端）：磨砂玻璃悬浮块，内含标签 + 回到搜索三角。

import * as wm from '../../core/window-manager.js';
import * as data from '../../core/data.js';

let dock = null;
let tabsEl = null;

function titleFor(w) {
    const meta = data.getMeta(w.id);
    return meta ? meta.title : w.id;
}

function render() {
    const stack = wm.getStack();
    tabsEl.innerHTML = '';

    if (!wm.hasArticles()) {
        dock.style.display = 'none';
        return;
    }
    dock.style.display = 'flex';

    const reversed = [...stack].reverse();
    const top = wm.getTop();

    for (const w of reversed) {
        // 不显示「搜索」标签（由右侧三角承担）
        if (w.type === 'search') continue;

        const tab = document.createElement('div');
        tab.className = 'tab' + (top && w.id === top.id ? ' active' : '');
        tab.dataset.id = w.id;

        const title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = titleFor(w);
        tab.appendChild(title);

        const closeBtn = document.createElement('span');
        closeBtn.className = 'tab-close';
        closeBtn.textContent = '\u00d7';
        closeBtn.title = '关闭';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wm.close(w.id);
        });
        tab.appendChild(closeBtn);

        tab.addEventListener('click', () => {
            if (top && w.id === top.id) return;
            wm.focus(w.id);
        });

        tabsEl.appendChild(tab);
    }
}

export function initTabbar() {
    dock = document.createElement('div');
    dock.id = 'dock';
    dock.className = 'dock';
    dock.innerHTML = `
        <div class="dock-tabs"></div>
        <div class="dock-action"><div class="corner-triangle"></div></div>
    `;
    document.body.appendChild(dock);
    tabsEl = dock.querySelector('.dock-tabs');

    // 三角：回到搜索（文章下沉 + 聚焦输入框）
    dock.querySelector('.dock-action').addEventListener('click', () => {
        wm.focus('search');
        document.getElementById('searchInput')?.focus();
    });

    wm.subscribe(render);
    render();
}
