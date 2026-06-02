// assets/js/scroll-reveal.js
(function () {
  // 需要添加动画的元素选择器，覆盖首页文章卡片、归档卡片等
  const selectors = [
    '.article-list article',        // 首页卡片
    '.article-list--compact article', // 归档紧凑卡片
    '.article-list--tile article',    // 分类/标签瓷砖
    '.archives-group article',        // 归档组
    '.archives-group .article-time--item'
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        // 动画只播放一次，之后不再触发
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,          // 卡片 15% 进入视口时触发
    rootMargin: '0px 0px -30px 0px' // 稍微提前触发，避免看到生硬的突然出现
  });

  function observeCards() {
    const elements = document.querySelectorAll(selectors.join(','));
    elements.forEach(el => observer.observe(el));
  }

  // 初始观察
  if (document.readyState === 'complete') {
    observeCards();
  } else {
    window.addEventListener('load', observeCards);
  }

  // Hugo 的 PJAX 或无限滚动可能导致 DOM 更新，这里简单用 MutationObserver 监听
  // 如果你的主题有 PJAX（Stack 默认无），可保留下面代码，否则可以删除
  const mainContainer = document.querySelector('.main-container');
  if (mainContainer) {
    const mo = new MutationObserver(() => {
      observeCards();
    });
    mo.observe(mainContainer, { childList: true, subtree: true });
  }
})();