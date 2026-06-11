/**
 * sakura.js — 动态樱花背景（性能优化版）
 *
 * 优化策略：
 * 1. 离屏 Canvas 预渲染花瓣位图，每帧用 drawImage() 替代 175 次 ellipse() 路径操作
 * 2. 粒子数从 35 → 25
 * 3. 30fps 渲染（requestAnimationFrame + 跳帧），为主线程交互预留时间片
 * 4. Canvas 元素添加 will-change: transform 触发 GPU 合成层
 */
(function () {
  'use strict';

  /* ────── 配置 ────── */
  var MAX_PARTICLES = 25;
  var RENDER_INTERVAL = 2;
  var PETAL_FIXED_SIZE = 16;

  var LIGHT_COLORS = ['rgba(255,183,197,0.8)', 'rgba(255,179,186,0.7)', 'rgba(255,200,210,0.7)'];
  var DARK_COLORS  = ['rgba(255,160,175,0.6)', 'rgba(255,150,165,0.5)', 'rgba(255,180,190,0.5)'];

  /* ────── 状态 ────── */
  var canvas, ctx;
  var particles = [];
  var animationId = null;
  var frameCount = 0;
  var isDark = document.documentElement.getAttribute('data-scheme') === 'dark';
  var petalCache = {};

  /* ────── 离屏花瓣预渲染 ────── */
  function createPetalBitmap(fillStyle) {
    var margin = 2;
    var r = PETAL_FIXED_SIZE;
    var halfSize = Math.ceil(r * 1.4) + margin;
    var bitmap = document.createElement('canvas');
    bitmap.width = bitmap.height = halfSize * 2;
    var bCtx = bitmap.getContext('2d');

    bCtx.fillStyle = fillStyle;
    for (var i = 0; i < 5; i++) {
      bCtx.save();
      bCtx.translate(halfSize, halfSize);
      bCtx.rotate((i * 72 * Math.PI) / 180);
      bCtx.beginPath();
      bCtx.ellipse(0, r * 0.6, r * 0.4, r * 0.8, 0, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.restore();
    }
    return bitmap;
  }

  function getOrCreatePetal(fillStyle) {
    if (!petalCache[fillStyle]) {
      petalCache[fillStyle] = createPetalBitmap(fillStyle);
    }
    return petalCache[fillStyle];
  }

  function getColors() {
    return isDark ? DARK_COLORS : LIGHT_COLORS;
  }

  /* ────── 粒子 ────── */
  function Sakura() {
    this.reset(false);
  }

  Sakura.prototype.reset = function () {
    var W = window.innerWidth;
    this.x = Math.random() * W;
    this.y = -10 - Math.random() * 200;
    this.size = Math.random() * 10 + 6;
    this.speedX = Math.random() * 1.5 - 0.75;
    this.speedY = Math.random() * 1.5 + 1;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 2 - 1;
    this.opacity = Math.random() * 0.6 + 0.4;
    var colors = getColors();
    this.colorIdx = Math.floor(Math.random() * colors.length);
    this.color = colors[this.colorIdx];
    this._bitmap = getOrCreatePetal(this.color);
  };

  Sakura.prototype.update = function () {
    var W = window.innerWidth;
    var H = window.innerHeight;
    this.x += this.speedX + Math.sin(this.y / 80) * 0.5;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    if (this.y > H + 20 || this.x < -30 || this.x > W + 30) {
      this.x = Math.random() * W;
      this.y = -10 - Math.random() * 100;
      this.size = Math.random() * 10 + 6;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.speedY = Math.random() * 1.5 + 1;
      this.rotationSpeed = Math.random() * 2 - 1;
      this.opacity = Math.random() * 0.6 + 0.4;
      var colors = getColors();
      this.colorIdx = Math.floor(Math.random() * colors.length);
      this.color = colors[this.colorIdx];
      this._bitmap = getOrCreatePetal(this.color);
    }
  };

  Sakura.prototype.draw = function (ctx, bitmapHalf) {
    var scale = this.size / PETAL_FIXED_SIZE;
    ctx.save();
    ctx.translate(this.x | 0, this.y | 0);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this._bitmap, -bitmapHalf, -bitmapHalf);
    ctx.restore();
  };

  /* ────── Canvas 初始化 ────── */
  function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:0;will-change:transform;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ────── 动画循环（30 fps 跳帧） ────── */
  function startAnimation() {
    if (particles.length === 0) {
      for (var i = 0; i < MAX_PARTICLES; i++) {
        particles.push(new Sakura());
      }
    }

    var bitmapHalf = null;
    for (var k in petalCache) {
      if (petalCache.hasOwnProperty(k)) {
        bitmapHalf = petalCache[k].width / 2;
        break;
      }
    }

    function animate() {
      frameCount++;
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      if (frameCount % RENDER_INTERVAL === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
          particles[i].draw(ctx, bitmapHalf);
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* ────── 主题切换监听 ────── */
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === 'data-scheme') {
        isDark = document.documentElement.getAttribute('data-scheme') === 'dark';
        petalCache = {};
        particles.forEach(function (p) {
          p._bitmap = getOrCreatePetal(p.color);
        });
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  /* ────── 页面可见性 ────── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  /* ────── 启动 ────── */
  if (document.readyState === 'complete') {
    initCanvas();
    startAnimation();
  } else {
    window.addEventListener('load', function () {
      initCanvas();
      startAnimation();
    });
  }
})();
