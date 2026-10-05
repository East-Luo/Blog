// mobile/sidebar.js —— 顶部抽屉（手机端文章栏）。
// 抽屉是可移动的「页」：宽 100%、高 50vh，把手在页底部。
// 把手元素即触控区（15vh），底部 40px 为可视渐变条；下拉展开、上滑收起。

import * as data from '../../core/data.js';
import * as wm from '../../core/window-manager.js';

let drawer = null;
let listEl = null;
let handleEl = null;
let expanded = false;

function render() {
    const articles = data.getArticles();
    listEl.innerHTML = '<h3>文章列表</h3>';

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
        item.addEventListener('click', () => {
            wm.open(a.id);
            collapse();
        });
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

// ---- 位置（px）控制：收起位置为 -(页高 - 把手高)，展开位置为 0 ----

function collapsedOffset() {
    return -(drawer.offsetHeight - handleEl.offsetHeight);
}

function setOffset(px) {
    drawer.style.transform = `translateY(${px}px)`;
}

function currentOffset() {
    const m = /translateY\(([-\d.]+)px\)/.exec(drawer.style.transform || '');
    return m ? parseFloat(m[1]) : collapsedOffset();
}

function collapse() {
    expanded = false;
    drawer.style.transition = '';
    setOffset(collapsedOffset());
}

function expand() {
    expanded = true;
    drawer.style.transition = '';
    setOffset(0);
}

function initGesture() {
    let dragging = false;
    let startY = 0;
    let startOffset = 0;

    function start(e) {
        dragging = true;
        startY = e.touches[0].clientY;
        startOffset = currentOffset();
        drawer.style.transition = 'none';
    }

    function move(e) {
        if (!dragging) return;
        const dy = e.touches[0].clientY - startY;
        setOffset(Math.max(collapsedOffset(), Math.min(0, startOffset + dy)));
    }

    function end() {
        if (!dragging) return;
        dragging = false;
        // 吸附：当前位置越过中点则展开，否则收起
        if (currentOffset() > collapsedOffset() / 2) expand();
        else collapse();
    }

    handleEl.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('touchend', end);

    // 展开后：点击抽屉覆盖范围外（含右下角小三角）自动收起
    document.addEventListener('click', (e) => {
        if (!expanded) return;
        if (!drawer.contains(e.target)) collapse();
    });
}

export function initSidebar() {
    drawer = document.createElement('div');
    drawer.id = 'mobileSidebar';
    drawer.className = 'mobile-sidebar';
    drawer.innerHTML = `
        <div class="sidebar-list"></div>
        <div class="sidebar-handle"><div class="handle-bar">☰</div></div>
    `;
    document.body.appendChild(drawer);
    listEl = drawer.querySelector('.sidebar-list');
    handleEl = drawer.querySelector('.sidebar-handle');

    render();
    wm.subscribe(updateActive);
    initGesture();
    collapse();
}
