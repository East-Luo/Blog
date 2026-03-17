document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const triangle = document.querySelector('.triangle');

    // 鼠标悬停效果 - 三角形变亮
    searchButton.addEventListener('mouseenter', () => {
        if (!searchButton.classList.contains('active')) {
            triangle.style.opacity = '1';
        }
    });

    // 鼠标离开效果 - 三角形变淡
    searchButton.addEventListener('mouseleave', () => {
        if (!searchButton.classList.contains('active')) {
            triangle.style.opacity = '0.7';
        }
    });

    // 点击按钮展开搜索框
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (searchButton.classList.contains('active')) {
            // 如果已经激活，则取消激活
            searchButton.classList.remove('active');
        } else {
            // 展开搜索框
            searchButton.classList.add('active');
            searchInput.focus();
        }
    });

    // 点击输入框内部也要保持激活状态
    searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 点击页面其他地方收回搜索框
    document.addEventListener('click', (e) => {
        if (!searchButton.contains(e.target)) {
            searchButton.classList.remove('active');
        }
    });
});