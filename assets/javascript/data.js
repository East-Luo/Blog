// data.js —— 数据层：GitHub API 枚举文章目录 → 拉取 md → 前端 marked 渲染 → 全文搜索。
// 文章仓库是纯 .md + 媒体文件，无 meta.json、无 frontmatter、无 html 产物。
// 部署时只需改顶部 REPO / BRANCH。

const REPO = 'East-Luo/Articles';
const BRANCH = 'main';
const API_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

let markedLib = null;        // 由 main 动态 import 后注入
let hljsLib = null;          // 代码高亮库，同样由 main 注入
let articles = [];           // { id, path, dir, file, title, html, text }

export function setLibraries({ marked, hljs }) {
    markedLib = marked;
    hljsLib = hljs;
}

export function getArticles() {
    return articles;
}

export function getMeta(id) {
    return articles.find((a) => a.id === id);
}

// 第一个 # 标题行作为文章标题（不要求在第一行）
function extractTitle(md) {
    const m = md.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : '';
}

// 相对路径媒体重写为仓库 raw 绝对地址
function resolveMediaUrl(href, dir) {
    if (!href) return href;
    if (/^(https?:|data:|#|\/\/)/i.test(href)) return href;
    return dir ? `${RAW_BASE}/${dir}/${href}` : `${RAW_BASE}/${href}`;
}

// 渲染单篇：marked 转 HTML，并把相对路径 src/href 指向文章所在目录
function render(md, dir) {
    const renderer = new markedLib.Renderer();
    renderer.image = (token) => {
        const src = resolveMediaUrl(token.href, dir);
        const t = token.title ? ` title="${token.title}"` : '';
        const a = token.text ? ` alt="${token.text}"` : '';
        return `<img src="${src}"${a}${t}>`;
    };
    renderer.link = (token) => {
        const url = resolveMediaUrl(token.href, dir);
        const t = token.title ? ` title="${token.title}"` : '';
        return `<a href="${url}"${t}>${token.text}</a>`;
    };
    return markedLib.parse(md, { renderer });
}

// 枚举仓库全部 .md 文件
async function listArticles() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.tree || [])
        .filter((item) => item.type === 'blob' && item.path.toLowerCase().endsWith('.md'))
        .map((item) => {
            const parts = item.path.split('/');
            const file = parts[parts.length - 1];
            const id = parts.length > 1 ? parts[0] : file.replace(/\.md$/i, '');
            const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
            return { id, path: item.path, dir, file };
        })
        .sort((a, b) => {
            const na = parseInt(a.id, 10);
            const nb = parseInt(b.id, 10);
            if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
            return a.id.localeCompare(b.id);
        });
}

async function loadOne(entry) {
    const res = await fetch(`${RAW_BASE}/${entry.path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    const html = render(md, entry.dir);

    // 解析 DOM：代码高亮 + 提纯纯文本（一次解析两用）
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (hljsLib) {
        doc.querySelectorAll('pre code').forEach((el) => hljsLib.highlightElement(el));
    }

    return {
        ...entry,
        title: extractTitle(md),
        html: doc.body.innerHTML,
        text: (doc.body.textContent || '').replace(/\s+/g, ' ').trim(),
    };
}

// 枚举 + 并发拉取并渲染全部文章，单篇失败静默跳过
export async function fetchArticles() {
    const list = await listArticles();
    const results = await Promise.all(list.map((e) => loadOne(e).catch(() => null)));
    articles = results.filter(Boolean);
    return articles;
}

// 全文搜索：id(10) / 标题(10) / 正文(2)
export function search(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];

    const hits = [];
    for (const a of articles) {
        let score = 0;
        let hit = null;

        if ((a.id || '').toLowerCase().includes(q)) {
            score += 10;
            hit = hit || 'id';
        }
        if ((a.title || '').toLowerCase().includes(q)) {
            score += 10;
            hit = hit || 'title';
        }
        if ((a.text || '').toLowerCase().includes(q)) {
            score += 2;
            hit = hit || 'body';
        }

        if (score > 0) hits.push({ article: a, score, hit });
    }

    return hits.sort((x, y) => y.score - x.score).slice(0, 5);
}
