# Blog

纯静态博客：入口与数据彻底分离，前端直接渲染 Markdown。页面托管在自己的服务器上，文章仓库只放 `.md` 与媒体文件，访问者拿到页面后与源服务器零交互。

## 架构

```
浏览器（成品：裸 HTML + 原生 JS + marked 纯函数库）
  ├── 入口与静态资源：由你的服务器提供（index.html + assets/）
  └── 文章数据：GitHub API 枚举目录 → raw 拉取 md → 前端 marked 渲染
```

加载流程的两个判定节点：

```
白点 → 拉取 marked → 三向延伸 → GitHub API 枚举+拉取全部 md → 延伸到底
     → 中点连线（渲染+建索引）→ 升维旋转 + UI 淡入
```

分层：

| 模块 | 文件 | 职责 |
|------|------|------|
| 编排 | `assets/javascript/main.js` | 引导、超时、重试、组件初始化 |
| 数据 | `assets/javascript/data.js` | API 枚举、拉取 md、marked 渲染、全文搜索 |
| 背景 | `assets/javascript/background.js` | 加载动画 + 四面体背景（同一 canvas） |
| 侧边栏 | `assets/javascript/sidebar.js` | 文章列表、点击打开 |
| 搜索 | `assets/javascript/search.js` | 展开交互、全文搜索、结果渲染 |
| 窗口栈 | `assets/javascript/window-manager.js` | 打开/置顶/关闭、LRU 淘汰（上限 8 篇） |
| 标签栏 | `assets/javascript/tabbar.js` | 栈状态的视图投影 |
| 文章视图 | `assets/javascript/article-view.js` | 窗口 DOM、同步注入、转场 |
| 依赖 | `assets/vendor/marked.js` | marked ESM（纯函数库，非运行时框架） |

## 文章仓库

公开仓库 `East-Luo/Articles`，纯数据、零清单：

```
01/
    milestone.md      # 第一个 # 行是标题
    image.png         # 相对路径媒体随文章走
02/
    ...
```

- 无 `meta.json`、无 frontmatter、无 html 产物
- `id` = 目录名，标题 = 文中第一个 `# 标题` 行
- md 里的相对路径图片/链接会被自动重写为仓库 raw 绝对地址
- 写文章 = 建目录放 `.md` + 媒体，push 即生效（GitHub API 即时无缓存）

## 部署

改 `data.js` 顶部两个常量即可切换数据源：

```js
const REPO = 'East-Luo/Articles';
const BRANCH = 'main';
```

## 本地开发

需要 HTTP 服务（`fetch` 与 ES Module 在 `file://` 下不可用）：

```bash
python -m http.server 8000
```

匿名 GitHub API 限流 60 次/小时，个人博客流量不会触及。
