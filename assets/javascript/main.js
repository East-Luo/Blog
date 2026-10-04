// main.js —— 应用引导：CDN 拉取 marked → GitHub API 取文章 → 组件编排。
// 加载动画的两个判定节点：marked 就绪、文章数据就绪，失败时分别提示。

import * as data from './data.js';
import { createIntro } from './background.js';
import { initSidebar } from './sidebar.js';
import { initSearch } from './search.js';
import { initTabbar } from './tabbar.js';
import { initArticleView } from './article-view.js';

const MARKED_URL = 'https://cdn.jsdelivr.net/npm/marked@15.0.12/lib/marked.esm.js';
const HLJS_URL = 'https://cdn.jsdelivr.net/npm/highlight.js@11/+esm';
const TIMEOUT = 10000;

const sidebar = document.getElementById('sidebar');
const searchWindow = document.getElementById('searchWindow');

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

    // 发散期硬检查点：浏览器从 CDN 拉取渲染依赖（marked + highlight.js）
    let marked, hljs;
    try {
        [marked, hljs] = await withTimeout(Promise.all([
            import(MARKED_URL),
            import(HLJS_URL).then((m) => m.default),
        ]), TIMEOUT);
    } catch (e) {
        intro.fail('加载渲染依赖失败');
        return;
    }
    data.setLibraries({ marked, hljs });
    intro.markedReady();

    // 封边期硬检查点：GitHub API 枚举 + 拉取渲染全部文章
    try {
        await withTimeout(data.fetchArticles(), TIMEOUT);
    } catch (e) {
        intro.fail('从 GitHub 获取文章失败');
        return;
    }
    intro.dataReady();

    initComponents();
}

boot();
