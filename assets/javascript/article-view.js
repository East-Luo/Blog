// article-view.js —— 文章窗口的 DOM 生命周期：创建、注入、转场、销毁。
// 文章数据已在引导期全部预加载并渲染，此处只做同步注入，无异步加载。

import * as wm from './window-manager.js';
import * as data from './data.js';

const windowsRoot = document.getElementById('windows');
const domMap = new Map(); // id -> { el }
let prevArticleIds = [];

function createWindow(id, z) {
    const meta = data.getMeta(id);
    const el = document.createElement('div');
    el.className = 'article-window entering';
    el.style.zIndex = z;
    el.innerHTML = `
        <button class="article-close-btn" title="关闭">&times;</button>
        <div class="article-window-body">
            <div class="article-content"></div>
        </div>
    `;
    el.querySelector('.article-close-btn').addEventListener('click', () => wm.close(id));

    const content = el.querySelector('.article-content');
    content.innerHTML = meta ? meta.html : '<p style="color:rgba(255,255,255,0.7)">文章不存在</p>';

    windowsRoot.appendChild(el);
    domMap.set(id, { el });

    // 下一帧移除进入态，触发从底部滑入
    requestAnimationFrame(() => el.classList.remove('entering'));
    return el;
}

function closeWindow(id) {
    const rec = domMap.get(id);
    if (!rec) return;
    domMap.delete(id);
    const el = rec.el;
    el.classList.add('closing');
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

    // 同步 z-index（置顶即改变层叠）
    for (const w of stack) {
        if (w.type !== 'article') continue;
        const rec = domMap.get(w.id);
        if (rec) rec.el.style.zIndex = w.z;
    }

    prevArticleIds = articleIds;
}

wm.subscribe(onStackChange);

export function initArticleView() {
    // 订阅已挂接，无额外初始化
}
