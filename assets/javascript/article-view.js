// article-view.js —— 文章窗口的 DOM 生命周期：创建、注入、抽屉式转场、销毁。
// 仅栈顶文章展开为全屏，其余窗口收到底部（视口外），由标签栏切换。

import * as wm from './window-manager.js';
import * as data from './data.js';

const windowsRoot = document.getElementById('windows');
const domMap = new Map(); // id -> { el }
let prevArticleIds = [];

function createWindow(id, z) {
    const meta = data.getMeta(id);
    const el = document.createElement('div');
    el.className = 'article-window';
    el.style.zIndex = z;
    el.innerHTML = `
        <button class="article-close-btn" title="关闭">&times;</button>
        <div class="article-window-body">
            <div class="article-content"></div>
        </div>
    `;
    el.querySelector('.article-close-btn').addEventListener('click', () => wm.close(id));

    const content = el.querySelector('.article-content');
    content.innerHTML = meta ? meta.html : '<p style="color:#666">文章不存在</p>';

    windowsRoot.appendChild(el);
    domMap.set(id, { el });

    // 强制首帧布局后展开，确保 translateY(100%)→0 的过渡被触发
    void el.getBoundingClientRect();
    el.classList.add('active');
    return el;
}

function closeWindow(id) {
    const rec = domMap.get(id);
    if (!rec) return;
    domMap.delete(id);
    const el = rec.el;
    el.classList.remove('active'); // 收到底部
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    // 兜底：极端情况下 transition 不触发也确保移除
    setTimeout(() => el.remove(), 1000);
}

function onStackChange(stack) {
    const articleIds = stack.filter((w) => w.type === 'article').map((w) => w.id);
    const added = articleIds.filter((id) => !prevArticleIds.includes(id));
    const removed = prevArticleIds.filter((id) => !articleIds.includes(id));

    for (const id of added) {
        const w = stack.find((x) => x.id === id);
        createWindow(id, w.z);
    }
    for (const id of removed) {
        closeWindow(id);
    }

    // 仅当栈顶是文章时才展开它；栈顶是搜索框或空时，所有文章收到底部
    const top = stack.length ? stack[stack.length - 1] : null;
    const topId = top && top.type === 'article' ? top.id : null;
    for (const w of stack) {
        if (w.type !== 'article') continue;
        const rec = domMap.get(w.id);
        if (rec) {
            rec.el.style.zIndex = w.z;
            rec.el.classList.toggle('active', w.id === topId);
        }
    }

    prevArticleIds = articleIds;
}

wm.subscribe(onStackChange);

export function initArticleView() {
    // 订阅已挂接，无额外初始化
}
