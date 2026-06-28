(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = {
    canvas: null,
    ctx: null,
    flowers: [],
    raf: 0,
    runningHome: false,
    buttonReady: false,
    lastTime: 0
  };

  var COLORS = ['rgba(255,183,197,.78)', 'rgba(255,179,186,.70)', 'rgba(255,205,214,.72)'];
  var HOME_COUNT = 18;
  var BURST_COUNT = 32;
  var PETAL_CACHE = {};

  function ensureCanvas() {
    if (state.canvas) return state.canvas;
    var canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:185;contain:strict;will-change:opacity;opacity:0;transition:opacity .7s ease';
    document.body.appendChild(canvas);
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas, { passive: true });
    return canvas;
  }

  function resizeCanvas() {
    if (!state.canvas) return;
    state.canvas.width = window.innerWidth;
    state.canvas.height = window.innerHeight;
  }

  function ensureButton() {
    if (state.buttonReady || document.getElementById('sakura-burst-button')) return;
    state.buttonReady = true;
    var button = document.createElement('button');
    button.id = 'sakura-burst-button';
    button.type = 'button';
    button.setAttribute('aria-label', '\u6492\u4e00\u9635\u6a31\u82b1');
    button.innerHTML = '<span aria-hidden="true">\u82b1</span>';
    button.addEventListener('click', burst);
    document.body.appendChild(button);
  }

  function createFlowerBitmap(color) {
    if (PETAL_CACHE[color]) return PETAL_CACHE[color];
    var size = 56;
    var half = size / 2;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < 5; i++) {
      ctx.save();
      ctx.translate(half, half);
      ctx.rotate((i * 72 * Math.PI) / 180);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 11, 5.8, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255,230,238,.72)';
    ctx.beginPath();
    ctx.arc(half, half, 4.2, 0, Math.PI * 2);
    ctx.fill();
    PETAL_CACHE[color] = canvas;
    return canvas;
  }

  function makeFlower(homeMode) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * width,
      y: homeMode ? -40 - Math.random() * height * 0.6 : -20 - Math.random() * 80,
      vx: -0.35 + Math.random() * 0.9,
      vy: homeMode ? 0.45 + Math.random() * 0.9 : 1.15 + Math.random() * 1.65,
      size: 10 + Math.random() * 10,
      rotate: Math.random() * Math.PI * 2,
      vr: -0.025 + Math.random() * 0.05,
      alpha: 0.45 + Math.random() * 0.36,
      color: color,
      bitmap: createFlowerBitmap(color),
      life: homeMode ? Infinity : 220 + Math.random() * 105,
      age: 0,
      home: homeMode
    };
  }

  function drawFlower(ctx, flower) {
    var alpha = flower.life === Infinity ? flower.alpha : Math.max(0, flower.alpha * (1 - flower.age / flower.life));
    var scale = flower.size / 28;
    ctx.save();
    ctx.translate(flower.x | 0, flower.y | 0);
    ctx.rotate(flower.rotate);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.drawImage(flower.bitmap, -28, -28);
    ctx.restore();
  }

  function tick(timestamp) {
    if (!state.ctx || !state.canvas) return;
    if (!state.lastTime) state.lastTime = timestamp;
    var delta = Math.min((timestamp - state.lastTime) / 16.67, 2.4) || 1;
    state.lastTime = timestamp;

    var width = window.innerWidth;
    var height = window.innerHeight;
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

    for (var i = state.flowers.length - 1; i >= 0; i--) {
      var flower = state.flowers[i];
      flower.age += delta;
      flower.x += (flower.vx + Math.sin((flower.y + flower.age) / 86) * 0.44) * delta;
      flower.y += flower.vy * delta;
      flower.rotate += flower.vr * delta;

      if (flower.home && (flower.y > height + 42 || flower.x < -50 || flower.x > width + 50)) {
        Object.assign(flower, makeFlower(true), { y: -30 });
      }

      if (!flower.home && (flower.age > flower.life || flower.y > height + 70)) {
        state.flowers.splice(i, 1);
        continue;
      }

      drawFlower(state.ctx, flower);
    }

    if (state.flowers.length || state.runningHome) {
      state.raf = requestAnimationFrame(tick);
      return;
    }

    state.raf = 0;
    state.lastTime = 0;
    state.canvas.style.opacity = '0';
  }

  function startLoop() {
    if (!state.raf) state.raf = requestAnimationFrame(tick);
  }

  function startHome() {
    if (reduceMotion) return;
    var isHomeIntro = document.body.classList.contains('template-home') && !document.body.classList.contains('home-entered');
    if (!isHomeIntro) {
      stopHome();
      return;
    }

    ensureCanvas();
    state.runningHome = true;
    state.canvas.style.opacity = '1';
    state.flowers = state.flowers.filter(function (flower) { return !flower.home; });
    while (state.flowers.filter(function (flower) { return flower.home; }).length < HOME_COUNT) {
      state.flowers.push(makeFlower(true));
    }
    startLoop();
  }

  function stopHome() {
    state.runningHome = false;
    state.flowers = state.flowers.filter(function (flower) { return !flower.home; });
    if (state.canvas) state.canvas.style.opacity = state.flowers.length ? '1' : '0';
  }

  function burst() {
    if (reduceMotion) return;
    ensureCanvas();
    state.canvas.style.opacity = '1';
    for (var i = 0; i < BURST_COUNT; i++) {
      state.flowers.push(makeFlower(false));
    }
    startLoop();
  }

  function init() {
    ensureButton();
    if (document.body.classList.contains('template-home') && !document.body.classList.contains('home-entered')) {
      startHome();
    } else {
      stopHome();
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.lastTime = 0;
    } else if (!document.hidden && (state.flowers.length || state.runningHome)) {
      startLoop();
    }
  });

  window.BlogSakura = {
    init: init,
    startHome: startHome,
    stopHome: stopHome,
    burst: burst
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
