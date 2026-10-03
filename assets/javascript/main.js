// main.js —— 应用引导：动态拉取 marked → GitHub API 取文章 → 组件编排。
// 加载动画的两个判定节点：marked 就绪、文章数据就绪。

import * as data from './data.js';
import { createIntro } from './background.js';
import { initSidebar } from './sidebar.js';
import { initSearch } from './search.js';
import { initTabbar } from './tabbar.js';
import { initArticleView } from './article-view.js';

const sidebar = document.getElementById('sidebar');
const searchWindow = document.getElementById('searchWindow');
const TIMEOUT = 10000;

function revealUI() {
    sidebar.classList.add('ready');
    searchWindow.classList.add('ready');
}

function initComponents() {
    initSidebar();
    initSearch();
    initTabbar();
    initArticleView();
}

function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);
}

async function boot() {
    const intro = createIntro({ onReady: revealUI, onRetry: boot });
    intro.begin();

    try {
        // 判定节点一：浏览器拉取 marked
        const marked = await withTimeout(import('./vendor/marked.js'), TIMEOUT);
        data.setMarked(marked);
        intro.markedReady();

        // 判定节点二：GitHub API 枚举 + 拉取渲染全部文章
        await withTimeout(data.fetchArticles(), TIMEOUT);
        intro.dataReady();

        initComponents();
    } catch (e) {
        intro.fail();
    }
}

boot();
