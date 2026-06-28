(function () {
  'use strict';

  var selector = [
    '.article-list article',
    '.article-list--compact article',
    '.article-list--tile article',
    '.archives-group article',
    '.archives-group .article-time--item'
  ].join(', ');

  if (window.__blogReveal && typeof window.__blogReveal.observe === 'function') {
    window.__blogReveal.observe(document);
    return;
  }

  var state = window.__blogReveal = {
    queued: new Set(),
    visible: new Set(),
    observe: observe,
    queuedFrame: 0,
    visibleFrame: 0
  };

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      state.visible.add(entry.target);
      revealObserver.unobserve(entry.target);
    });

    if (!state.visibleFrame) {
      state.visibleFrame = requestAnimationFrame(showVisibleCards);
    }
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -80px 0px'
  });

  function collect(root) {
    if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;

    if (root.nodeType === 1 && root.matches(selector)) {
      state.queued.add(root);
    }

    if (root.querySelectorAll) {
      root.querySelectorAll(selector).forEach(function (el) {
        state.queued.add(el);
      });
    }

    if (!state.queuedFrame) {
      state.queuedFrame = requestAnimationFrame(flushQueuedCards);
    }
  }

  function observe(root) {
    collect(root || document);
  }

  function flushQueuedCards() {
    state.queuedFrame = 0;
    var index = 0;

    state.queued.forEach(function (el) {
      state.queued.delete(el);
      if (el.classList.contains('observed-reveal') || el.classList.contains('reveal-visible')) return;

      el.style.setProperty('--reveal-index', Math.min(index, 8));
      el.classList.add('observed-reveal');
      revealObserver.observe(el);
      index++;
    });
  }

  function showVisibleCards() {
    state.visibleFrame = 0;

    state.visible.forEach(function (el) {
      state.visible.delete(el);
      el.classList.add('reveal-visible');

      window.setTimeout(function () {
        el.classList.add('reveal-done');
      }, 760);
    });
  }

  function observeInitialCards() {
    observe(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeInitialCards, { once: true });
  } else {
    observeInitialCards();
  }

  var domObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(collect);
    });
  });

  domObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
})();
