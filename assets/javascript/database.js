// 数据库对象
let articleDatabase = [];

// 从meta.json加载数据
async function loadArticleData() {
    try {
        const response = await fetch('articles/meta.json');
        const data = await response.json();
        articleDatabase = data;

        // 更新侧边栏
        updateSidebar();
    } catch (error) {
        console.error('加载文章数据失败:', error);
    }
}

// 更新侧边栏
function updateSidebar() {
    const articleList = document.getElementById('articleList');
    articleList.innerHTML = '';

    articleDatabase.forEach(article => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.textContent = `${article.id} ${article.title}`;
        item.dataset.articleId = article.id;
        item.addEventListener('click', () => {
            open_overlay(article.id, article.url); // 打开文章详情
            console.log(`点击了: ${article.id} ${article.title}`);
        });
        articleList.appendChild(item);
    });
}

// 模糊搜索函数
function fuzzySearch(query, articles) {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();

    return articles
        .map(article => {
            // 计算匹配分数
            let score = 0;

            // 检查ID
            if (article.id.toLowerCase().includes(searchTerm)) {
                score += 10;
            }

            // 检查标题
            if (article.title.toLowerCase().includes(searchTerm)) {
                score += 10;
            }

            // 检查标签
            if (Array.isArray(article.tags)) {
                article.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(searchTerm)) {
                        score += 5;
                    }
                });
            }

            return { ...article, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // 只返回前5个结果
}

// 显示搜索结果
function showSearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';

        // 创建包含ID、标题和标签的结构
        const idElement = document.createElement('div');
        idElement.className = 'result-id';
        idElement.textContent = result.id;

        const titleElement = document.createElement('div');
        titleElement.className = 'result-title';
        titleElement.textContent = result.title;

        const tagsElement = document.createElement('div');
        tagsElement.className = 'result-tags';
        tagsElement.textContent = Array.isArray(result.tags) ? `[${result.tags.join(', ')}]` : '';

        resultItem.appendChild(idElement);
        resultItem.appendChild(titleElement);
        resultItem.appendChild(tagsElement);

        resultItem.addEventListener('click', () => {
            // 这里稍后添加点击后的实际功能
            open_overlay(result.id, result.url); // 打开文章详情
            console.log(`选择了: ${result.id} ${result.title}`);
            // 清空搜索框
            document.getElementById('searchInput').value = '';
            searchResults.style.display = 'none';
        });
        searchResults.appendChild(resultItem);
    });

    searchResults.style.display = 'block';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadArticleData();

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // 监听搜索框输入
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();

        if (query) {
            const results = fuzzySearch(query, articleDatabase);
            showSearchResults(results);
        } else {
            searchResults.style.display = 'none';
        }
    });

    // 点击页面其他地方隐藏搜索结果
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
});