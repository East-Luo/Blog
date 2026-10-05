// platforms/desktop/index.js —— 桌面平台统一入口，导出统一接口。

import { initSidebar } from './sidebar.js';
import { initSearch } from './search.js';
import { initTabbar } from './tabbar.js';
import { initArticleView } from './article-view.js';

export function initComponents() {
    initSidebar();
    initSearch();
    initTabbar();
    initArticleView();
}

export function reveal() {
    document.getElementById('sidebar')?.classList.add('ready');
    document.getElementById('searchWindow')?.classList.add('ready');
}
