// window-manager.js —— 窗口栈纯逻辑：打开、置顶、关闭、LRU 淘汰。
// 不接触 DOM，只维护栈状态并通知订阅者（tabbar / article-view 订阅）。

const MAX_ARTICLES = 8; // 单篇上限，不含搜索框
const SEARCH_ID = 'search';

let stack = []; // 底 → 顶，元素 { id, type, z }
const listeners = new Set();

export function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

function notify() {
    const snapshot = stack.map((w) => ({ ...w }));
    for (const fn of listeners) fn(snapshot);
}

function articleCount() {
    return stack.filter((w) => w.type === 'article').length;
}

function assignZ() {
    let z = 10;
    for (const w of stack) {
        if (w.type === 'search') continue; // 搜索框 z 由 CSS 固定，不参与分配
        w.z = z++;
    }
}

function ensureSearch() {
    if (!stack.some((w) => w.id === SEARCH_ID)) {
        stack.unshift({ id: SEARCH_ID, type: SEARCH_ID });
    }
}

function evictOldestArticle() {
    const idx = stack.findIndex((w) => w.type === 'article');
    if (idx !== -1) stack.splice(idx, 1);
}

export function getStack() {
    return stack.map((w) => ({ ...w }));
}

export function getTop() {
    return stack.length ? { ...stack[stack.length - 1] } : null;
}

export function hasArticles() {
    return articleCount() > 0;
}

// 打开（不存在则入栈置顶；已存在等价于 focus）
export function open(id) {
    if (id === SEARCH_ID) {
        focus(SEARCH_ID);
        return;
    }
    ensureSearch();
    const existing = stack.find((w) => w.id === id);
    if (existing) {
        focus(id);
        return;
    }
    if (articleCount() >= MAX_ARTICLES) evictOldestArticle();
    stack.push({ id, type: 'article' });
    assignZ();
    notify();
}

export function focus(id) {
    const idx = stack.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const [w] = stack.splice(idx, 1);
    stack.push(w);
    assignZ();
    notify();
}

export function close(id) {
    const idx = stack.findIndex((w) => w.id === id);
    if (idx === -1) return;
    stack.splice(idx, 1);
    // 关闭后若无文章，搜索框也随之退出栈，回到独占状态
    if (articleCount() === 0) {
        stack = stack.filter((w) => w.type !== SEARCH_ID);
    }
    assignZ();
    notify();
}
