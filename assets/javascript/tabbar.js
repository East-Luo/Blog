// tabbar.js —— 标签栏：window-manager 栈状态的投影，纯视图层。
// 栈顶标签显示在最上；点击标签置顶，右键或点关闭按钮关闭。

import * as wm from './window-manager.js';
import * as data from './data.js';

const root = document.getElementById('tabbar');
const SEARCH_LABEL = '搜索';

function titleFor(w) {
    if (w.type === 'search') return SEARCH_LABEL;
    const meta = data.getMeta(w.id);
    return meta ? meta.title : w.id;
}

function render() {
    const stack = wm.getStack();
    root.innerHTML = '';

    // 无文章时隐藏整个标签栏
    if (!wm.hasArticles()) {
        root.style.display = 'none';
        return;
    }
    root.style.display = 'flex';

    // 栈底在数组头，栈顶在数组尾；视觉上栈顶应在上方
    const reversed = [...stack].reverse();
    const top = wm.getTop();

    for (const w of reversed) {
        const isSearch = w.type === 'search';
        const tab = document.createElement('div');
        tab.className = 'tab' + (top && w.id === top.id ? ' active' : '');
        tab.dataset.id = w.id;

        const title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = titleFor(w);
        tab.appendChild(title);

        // 搜索标签不可关闭：不渲染关闭按钮，右键也不响应关闭
        if (!isSearch) {
            const closeBtn = document.createElement('span');
            closeBtn.className = 'tab-close';
            closeBtn.textContent = '\u00d7';
            closeBtn.title = '关闭';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                wm.close(w.id);
            });
            tab.appendChild(closeBtn);
        }

        tab.addEventListener('click', () => {
            // 点击当前激活的标签静默
            if (top && w.id === top.id) return;
            wm.focus(w.id);
        });
        if (!isSearch) {
            tab.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                wm.close(w.id);
            });
        }

        root.appendChild(tab);
    }
}

wm.subscribe(render);

export function initTabbar() {
    render();
}
