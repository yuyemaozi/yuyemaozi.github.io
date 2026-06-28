(function () {
  'use strict';

  var lines = [
    '\u6211\u4e00\u5b9a\u4f1a\u6210\u4e3a\u706b\u5f71',
    '\u9f9f\u6d3e\u6c14\u529f',
    '\u771f\u76f8\u53ea\u6709\u4e00\u4e2a',
    '\u7206\u88c2\u5427\u73b0\u5b9e',
    '\u6d88\u5931\u5427\u865a\u6784\u4e16\u754c',
    '\u613f\u6d77\u62c9\u9c81\u7684\u98ce\u6307\u5f15\u4f60',
    '\u8fde\u63a5\u672a\u6765\u5427',
    '\u4e0d\u8981\u505c\u4e0b\u6765\u554a',
    '\u8fd9\u5c31\u662f\u4e8c\u6b21\u5143\u7684\u6d6a\u6f2b',
    '\u53ea\u8981\u8fd8\u6d3b\u7740\u5c31\u8fd8\u6709\u660e\u5929',
    '\u4eca\u5929\u4e5f\u8981\u5143\u6c14\u6ee1\u6ee1',
    '\u771f\u6b63\u7684\u5192\u9669\u624d\u521a\u521a\u5f00\u59cb',
    '\u6211\u7684\u738b\u4e4b\u529b',
    '\u4e00\u5207\u90fd\u662f\u547d\u8fd0\u77f3\u4e4b\u95e8\u7684\u9009\u62e9'
    ,'\u5fcd\u9053\u5c31\u662f\u8bf4\u5230\u505a\u5230'
    ,'\u53ea\u8981\u4e0d\u653e\u5f03\u5c31\u4e0d\u7b97\u8f93'
    ,'\u6211\u8981\u8d85\u8d8a\u6781\u9650'
    ,'\u585e\u5c14\u8fbe\u516c\u4e3b\u5728\u7b49\u4f60'
    ,'\u5927\u5e08\u5251\u4f1a\u9009\u62e9\u52c7\u8005'
    ,'\u90aa\u738b\u771f\u773c\u662f\u6700\u5f3a\u7684'
    ,'\u6211\u4e0e\u4f60\u7acb\u4e0b\u5951\u7ea6'
    ,'\u7528\u4f60\u7684\u5251\u6253\u5f00\u660e\u5929'
    ,'\u706b\u4e4b\u610f\u5fd7\u4e0d\u4f1a\u7184\u706d'
    ,'\u6211\u8fd8\u80fd\u53d8\u5f97\u66f4\u5f3a'
    ,'\u6218\u6597\u529b\u53ea\u662f\u53c2\u8003'
    ,'\u8fd9\u4e00\u51fb\u5c31\u662f\u5168\u529b'
    ,'\u5149\u4f1a\u7167\u5230\u4e0b\u4e00\u4e2a\u5730\u65b9'
    ,'\u613f\u4f60\u88ab\u4e16\u754c\u6e29\u67d4\u4ee5\u5f85'
    ,'\u559c\u6b22\u5c31\u662f\u6700\u5f3a\u7684\u9b54\u6cd5'
    ,'\u4eca\u5929\u4e5f\u8981\u5411\u524d\u4e00\u6b65'
    ,'\u5c11\u5e74\u554a\u53bb\u521b\u9020\u5947\u8ff9'
    ,'\u76f8\u9047\u672c\u8eab\u5c31\u662f\u5192\u9669'
    ,'\u68a6\u60f3\u4e0d\u4f1a\u8f7b\u6613\u5b8c\u7ed3'
    ,'\u4e16\u754c\u8fd8\u7b49\u7740\u6211\u4eec'
    ,'\u4e3a\u4e86\u91cd\u8981\u7684\u4eba\u53d8\u5f3a'
    ,'\u771f\u6b63\u7684\u5f3a\u5927\u662f\u5b88\u62a4'
    ,'\u4e0b\u4e00\u7ad9\u53bb\u54ea\u91cc\u90fd\u53ef\u4ee5'
    ,'\u751f\u6d3b\u9700\u8981\u4e00\u70b9\u5947\u8ff9'
  ];

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = {
    cleanup: null,
    timers: [],
    entered: false,
    avatarAnimating: false,
    lastLine: -1
  };

  function clearTimers() {
    state.timers.forEach(function (timer) {
      clearTimeout(timer);
    });
    state.timers = [];
  }

  function later(fn, delay) {
    var timer = window.setTimeout(fn, delay);
    state.timers.push(timer);
    return timer;
  }

  function pickLineIndex() {
    if (lines.length < 2) return 0;
    var next = state.lastLine;
    while (next === state.lastLine) {
      next = Math.floor(Math.random() * lines.length);
    }
    state.lastLine = next;
    return next;
  }

  function startTypewriter(target) {
    if (!target || reduceMotion) {
      if (target) target.textContent = lines[pickLineIndex()];
      return;
    }

    var current = lines[pickLineIndex()];
    var charIndex = 0;
    var deleting = false;

    function tick() {
      target.textContent = current.slice(0, charIndex);

      if (!deleting && charIndex < current.length) {
        charIndex++;
        later(tick, 92);
        return;
      }

      if (!deleting) {
        deleting = true;
        later(tick, 1800);
        return;
      }

      if (charIndex > 0) {
        charIndex--;
        later(tick, 44);
        return;
      }

      current = lines[pickLineIndex()];
      deleting = false;
      later(tick, 360);
    }

    tick();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getHeroAvatar() {
    return document.querySelector('.home-hero__avatar img');
  }

  function getSidebarAvatar() {
    return document.querySelector('.site-avatar .site-logo');
  }

  function setAvatarHidden(heroHidden, sidebarHidden) {
    var hero = getHeroAvatar();
    var sidebar = getSidebarAvatar();
    if (hero) hero.classList.toggle('home-avatar-hidden', !!heroHidden);
    if (sidebar) sidebar.classList.toggle('home-avatar-hidden', !!sidebarHidden);
  }

  function animateAvatar(direction) {
    if (state.avatarAnimating || reduceMotion) return;

    var heroAvatar = getHeroAvatar();
    var sidebarAvatar = getSidebarAvatar();
    if (!heroAvatar || !sidebarAvatar) return;

    var source = direction === 'to-sidebar' ? heroAvatar : sidebarAvatar;
    var target = direction === 'to-sidebar' ? sidebarAvatar : heroAvatar;
    var from = source.getBoundingClientRect();
    var to = target.getBoundingClientRect();
    if (!from.width || !to.width) return;

    var fromCenterX = from.left + from.width / 2;
    var fromCenterY = from.top + from.height / 2;
    var toCenterX = to.left + to.width / 2;
    var toCenterY = to.top + to.height / 2;

    state.avatarAnimating = true;
    document.body.classList.add('home-avatar-in-flight');
    setAvatarHidden(true, true);

    var clone = source.cloneNode(true);
    clone.className = 'home-hero__avatar-flight';
    clone.style.cssText = [
      'position:fixed',
      'left:' + (fromCenterX - from.width / 2) + 'px',
      'top:' + (fromCenterY - from.height / 2) + 'px',
      'width:' + from.width + 'px',
      'height:' + from.height + 'px',
      'border-radius:50%',
      'z-index:1200',
      'pointer-events:none',
      'object-fit:cover',
      'transform:translate3d(0,0,0)',
      'transition:transform .86s cubic-bezier(.22,1,.36,1), opacity .42s ease',
      'box-shadow:0 18px 60px rgba(0,0,0,.34)'
    ].join(';');

    document.body.appendChild(clone);

    requestAnimationFrame(function () {
      var scale = to.width / from.width;
      clone.style.transform = 'translate3d(' + (toCenterX - fromCenterX) + 'px,' + (toCenterY - fromCenterY) + 'px,0) scale(' + scale + ')';
    });

    later(function () {
      clone.style.opacity = '0';
    }, 760);

    later(function () {
      clone.remove();
      setAvatarHidden(false, false);
      document.body.classList.remove('home-avatar-in-flight');
      state.avatarAnimating = false;
    }, 1040);
  }

  function enterHome(hero) {
    if (state.entered) return;
    state.entered = true;
    document.body.classList.add('home-entered');
    document.body.classList.remove('home-hero-active');
    animateAvatar('to-sidebar');
    later(function () {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 40);
    if (window.BlogSakura && typeof window.BlogSakura.stopHome === 'function') {
      window.BlogSakura.stopHome();
    }
  }

  function exitHome(hero) {
    if (!state.entered) return;
    state.entered = false;
    document.body.classList.remove('home-entered');
    document.body.classList.add('home-hero-active');
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    animateAvatar('to-hero');
    if (window.BlogSakura && typeof window.BlogSakura.startHome === 'function') {
      window.BlogSakura.startHome();
    }
  }

  function init() {
    if (state.cleanup) state.cleanup();
    clearTimers();
    setAvatarHidden(false, false);

    var hero = document.querySelector('.home-hero');
    var isHome = document.body.classList.contains('template-home') && hero;

    if (!isHome) {
      document.body.classList.remove('home-hero-active', 'home-entered', 'home-avatar-in-flight');
      state.cleanup = null;
      state.entered = false;
      state.avatarAnimating = false;
      return;
    }

    var typeTarget = hero.querySelector('[data-home-typewriter]');
    state.entered = window.scrollY > Math.min(window.innerHeight * 0.22, 180);

    document.body.classList.toggle('home-entered', state.entered);
    document.body.classList.toggle('home-hero-active', !state.entered);
    startTypewriter(typeTarget);

    if (reduceMotion) {
      enterHome(hero);
      return;
    }

    var ticking = false;
    var touchStartY = 0;

    function update() {
      ticking = false;
      var triggerDistance = Math.min(window.innerHeight * 0.34, 260);
      var progress = clamp(window.scrollY / triggerDistance, 0, 1);
      hero.style.setProperty('--home-hero-progress', progress.toFixed(3));

      if (!state.entered && progress > 0.42) {
        enterHome(hero);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    function onKeydown(event) {
      if (event.key === 'PageDown' || event.key === ' ' || event.key === 'ArrowDown') {
        later(function () { enterHome(hero); }, 40);
      }
      if (event.key === 'Home' || event.key === 'PageUp' || event.key === 'ArrowUp') {
        later(function () { if (state.entered && window.scrollY <= 2) exitHome(hero); }, 40);
      }
    }

    function onWheel(event) {
      if (state.entered && window.scrollY <= 2 && event.deltaY < -24) {
        exitHome(hero);
      }
      if (!state.entered && event.deltaY > 24) {
        later(function () { enterHome(hero); }, 40);
      }
    }

    function onTouchStart(event) {
      touchStartY = event.touches && event.touches.length ? event.touches[0].clientY : 0;
    }

    function onTouchMove(event) {
      if (!event.touches || !event.touches.length || !touchStartY) return;
      var delta = event.touches[0].clientY - touchStartY;
      if (state.entered && window.scrollY <= 2 && delta > 36) {
        exitHome(hero);
      }
      if (!state.entered && delta < -36) {
        later(function () { enterHome(hero); }, 40);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    update();

    state.cleanup = function () {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      hero.style.removeProperty('--home-hero-progress');
    };
  }

  window.BlogHomeHero = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
