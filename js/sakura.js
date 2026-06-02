// assets/js/sakura.js
(function () {
  let canvas, ctx;
  let particles = [];
  const maxParticles = 35; // 樱花数量，不宜过多
  let animationId;
  let isDark = document.documentElement.getAttribute('data-scheme') === 'dark';

  // 樱花色：浅色模式下用粉白，暗色模式下微调得更柔和
  const lightColors = ['rgba(255,183,197,0.8)', 'rgba(255,179,186,0.7)', 'rgba(255,200,210,0.7)'];
  const darkColors = ['rgba(255,160,175,0.6)', 'rgba(255,150,165,0.5)', 'rgba(255,180,190,0.5)'];

  function getColors() {
    return isDark ? darkColors : lightColors;
  }

  class Sakura {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = -10 - Math.random() * 200;
      this.size = Math.random() * 10 + 6; // 6~16px
      this.speedX = Math.random() * 1.5 - 0.75;
      this.speedY = Math.random() * 1.5 + 1;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 2 - 1;
      this.opacity = Math.random() * 0.6 + 0.4;
      this.color = getColors()[Math.floor(Math.random() * getColors().length)];
    }
    update() {
      this.x += this.speedX + Math.sin(this.y / 80) * 0.5; // 左右飘荡
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      if (this.y > window.innerHeight + 20 || this.x < -30 || this.x > window.innerWidth + 30) {
        this.reset();
        this.y = -10 - Math.random() * 100;
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      // 画一个简单的花瓣形状（5个小椭圆）
      for (let i = 0; i < 5; i++) {
        ctx.rotate((72 * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.6, this.size * 0.4, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    canvas.style.cssText = 'position:fixed; top:0; left:0; pointer-events:none; z-index:9999;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function startAnimation() {
    if (particles.length === 0) {
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Sakura());
      }
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 监听主题切换
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-scheme') {
        isDark = document.documentElement.getAttribute('data-scheme') === 'dark';
        // 更新现有粒子颜色
        particles.forEach(p => {
          p.color = getColors()[Math.floor(Math.random() * getColors().length)];
        });
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  // 根据页面可见性暂停/恢复动画，节省资源
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  // 启动
  if (document.readyState === 'complete') {
    initCanvas();
    startAnimation();
  } else {
    window.addEventListener('load', () => {
      initCanvas();
      startAnimation();
    });
  }
})();