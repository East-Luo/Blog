// platforms/mobile/index.js —— 手机平台统一入口。
// article-view 复用桌面（浮动逻辑一致）；sidebar/search/tabbar 为手机实现。

import { initSidebar } from './sidebar.js';
import { initSearch } from './search.js';
import { initTabbar } from './tabbar.js';
import { initArticleView } from '../desktop/article-view.js';

export function initComponents() {
    initSidebar();
    initSearch();
    initTabbar();
    initArticleView();
}

export function reveal() {
    document.getElementById('searchWindow')?.classList.add('ready');
    document.getElementById('mobileSidebar')?.classList.add('ready');
    document.getElementById('dock')?.classList.add('ready');
}
