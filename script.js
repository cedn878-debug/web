/* =====================================================
   SENTIMIENTO UNIVERSAL – JavaScript Interactions
   ===================================================== */

(function () {
  'use strict';

  // ── Stardust Cursor Trail ─────────────────────────────
  (function initStardust() {
    const canvas = document.createElement('canvas');
    canvas.id = 'stardustCanvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let dust  = [];
    let mouse = { x: -999, y: -999 };

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Paleta estelar: dorado, violeta, cian, rosa
    const palette = [
      'rgba(201,168,76,',
      'rgba(240,208,128,',
      'rgba(139,92,246,',
      'rgba(125,211,252,',
      'rgba(251,113,133,',
      'rgba(255,255,255,',
    ];

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Spawn 3-5 particles per move
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        dust.push({
          x:     mouse.x + (Math.random() - 0.5) * 16,
          y:     mouse.y + (Math.random() - 0.5) * 16,
          r:     Math.random() * 2.5 + 0.5,
          alpha: Math.random() * 0.7 + 0.3,
          vx:    (Math.random() - 0.5) * 1.2,
          vy:    -(Math.random() * 1.5 + 0.5),
          decay: Math.random() * 0.018 + 0.012,
          color: palette[Math.floor(Math.random() * palette.length)],
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    }, { passive: true });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dust = dust.filter(p => p.alpha > 0.01);

      dust.forEach(p => {
        p.x      += p.vx;
        p.y      += p.vy;
        p.alpha  -= p.decay;
        p.twinkle += 0.12;

        // Subtle twinkle size oscillation
        const size = p.r * (0.85 + 0.15 * Math.sin(p.twinkle));

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.shadowBlur  = 10;
        ctx.shadowColor = p.color + Math.min(p.alpha * 0.8, 0.5) + ')';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  })();

  // ── Repel Dust on Course Card Images ─────────────────
  function initRepelDust() {
    document.querySelectorAll('.course-repel-dust').forEach(img => {
      const wrap = img.closest('.course-card-img-wrap');
      if (!wrap) return;

      // Create canvas overlay on top of the image
      const canvas = document.createElement('canvas');
      canvas.style.cssText = `
        position:absolute;
        inset:0;
        width:100%;height:100%;
        pointer-events:none;
        z-index:5;
      `;
      wrap.style.position = 'relative';
      wrap.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let particles = [];
      let animId;
      let running = false;

      function resize() {
        canvas.width  = wrap.offsetWidth;
        canvas.height = wrap.offsetHeight;
      }
      resize();

      // Gold palette for repel dust
      const goldPalette = [
        'rgba(201,168,76,',
        'rgba(240,208,128,',
        'rgba(255,230,100,',
        'rgba(255,200,50,',
        'rgba(255,255,220,',
      ];

      function spawnRepelParticle(mx, my) {
        // Random offset near cursor
        const ox = (Math.random() - 0.5) * 30;
        const oy = (Math.random() - 0.5) * 30;
        const px = mx + ox;
        const py = my + oy;

        // Direction AWAY from cursor
        const angle = Math.atan2(oy, ox) + (Math.random() - 0.5) * 1.2;
        const speed = Math.random() * 2.5 + 1;

        particles.push({
          x: px, y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() * 3 + 1,
          alpha: Math.random() * 0.8 + 0.2,
          decay: Math.random() * 0.025 + 0.015,
          color: goldPalette[Math.floor(Math.random() * goldPalette.length)],
          twinkle: Math.random() * Math.PI * 2,
        });
      }

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.alpha > 0.01);

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04; // slight gravity
          p.alpha -= p.decay;
          p.twinkle += 0.15;

          const size = p.r * (0.85 + 0.15 * Math.sin(p.twinkle));
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = p.color + p.alpha + ')';
          ctx.shadowBlur  = 14;
          ctx.shadowColor = p.color + Math.min(p.alpha * 0.7, 0.5) + ')';
          ctx.fill();
        });

        if (particles.length > 0 || running) {
          animId = requestAnimationFrame(loop);
        }
      }

      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Spawn 4-7 particles per move
        const count = Math.floor(Math.random() * 4) + 4;
        for (let i = 0; i < count; i++) spawnRepelParticle(mx, my);

        if (!running) {
          running = true;
          resize();
          loop();
        }
      }, { passive: true });

      wrap.addEventListener('mouseleave', () => {
        running = false;
      });

      window.addEventListener('resize', resize, { passive: true });
    });
  }

  // ── Navbar scroll effect ──────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // ── Particle Canvas (connection section) ─────────────
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas && canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function spawnParticle() {
    return {
      x:     randomBetween(0, canvas.width),
      y:     randomBetween(0, canvas.height),
      r:     randomBetween(1, 3),
      alpha: randomBetween(0.2, 0.9),
      vx:    randomBetween(-0.25, 0.25),
      vy:    randomBetween(-0.4, -0.1),
      life:  randomBetween(60, 160),
      age:   0,
      hue:   randomBetween(40, 260), // gold to violet range
    };
  }

  function initParticles() {
    particles = [];
    if (!canvas) return;
    for (let i = 0; i < 80; i++) {
      const p = spawnParticle();
      p.age = randomBetween(0, p.life); // spread lifetimes
      particles.push(p);
    }
  }

  function drawParticles() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, idx) => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.age += 1;

      const lifeRatio = p.age / p.life;
      const curAlpha  = p.alpha * (1 - lifeRatio);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${curAlpha})`;
      ctx.shadowBlur  = 12;
      ctx.shadowColor = `hsla(${p.hue}, 90%, 80%, ${curAlpha * 0.6})`;
      ctx.fill();

      // Draw connecting lines between nearby particles
      for (let j = idx + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 100) {
          const lineAlpha = (1 - dist / 100) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
          ctx.lineWidth   = 0.5;
          ctx.shadowBlur  = 0;
          ctx.stroke();
        }
      }

      if (p.age >= p.life) {
        particles[idx] = spawnParticle();
      }
    });

    animFrame = requestAnimationFrame(drawParticles);
  }

  // Intersection Observer – only run canvas when visible
  if (canvas) {
    const connSection = document.getElementById('connection');
    const obsCanvas   = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          resizeCanvas();
          initParticles();
          drawParticles();
        } else {
          cancelAnimationFrame(animFrame);
          ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    }, { threshold: 0.1 });

    if (connSection) obsCanvas.observe(connSection);
    window.addEventListener('resize', resizeCanvas, { passive: true });
  }

  // ── Animated counter ─────────────────────────────────
  function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    const step  = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('es-ES');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function startCounters() {
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      animateCounter(el, target);
    });
  }

  // ── Progress bar animation ────────────────────────────
  function animateProgress() {
    const fill  = document.getElementById('progressFill');
    const glow  = document.querySelector('.progress-glow');
    if (!fill) return;
    setTimeout(() => {
      fill.style.width = '85%';
      if (glow) glow.style.right = '15%';
    }, 400);
  }

  // ── Map pulsing dots ──────────────────────────────────
  function createMapDots() {
    const overlay = document.getElementById('mapDotsOverlay');
    if (!overlay) return;

    // Approximate hotspot positions as % coordinates
    const hotspots = [
      { x: 48, y: 38, label: 'Europa' },
      { x: 22, y: 45, label: 'América' },
      { x: 55, y: 55, label: 'África' },
      { x: 73, y: 35, label: 'Asia' },
      { x: 82, y: 65, label: 'Oceanía' },
      { x: 30, y: 70, label: 'S. América' },
      { x: 68, y: 45, label: 'Medio Oriente' },
    ];

    hotspots.forEach((spot, i) => {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position:absolute;
        left:${spot.x}%; top:${spot.y}%;
        transform:translate(-50%,-50%);
      `;
      dot.innerHTML = `
        <div style="
          width:8px;height:8px;
          background:rgba(125,211,252,0.9);
          border-radius:50%;
          box-shadow:0 0 12px rgba(125,211,252,0.8);
          animation: pulseMap 2s ${i * 0.3}s infinite ease-in-out;
        "></div>
        <div style="
          position:absolute;
          inset:-4px;
          border-radius:50%;
          border:1px solid rgba(125,211,252,0.4);
          animation: rippleMap 2s ${i * 0.3}s infinite ease-out;
        "></div>
      `;
      overlay.appendChild(dot);
    });

    // Inject keyframe styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulseMap {
        0%,100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
        50%      { opacity:0.6; transform:translate(-50%,-50%) scale(1.4); }
      }
      @keyframes rippleMap {
        0%   { transform:translate(-50%,-50%) scale(1); opacity:0.7; }
        100% { transform:translate(-50%,-50%) scale(3); opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Meditation Countdown Timer ────────────────────────
  function startTimer() {
    const timerEl   = document.getElementById('meditationTimer');
    const timerCirc = document.getElementById('timerCircle');
    if (!timerEl) return;

    let totalSecs = 14 * 60 + 32; // 14:32
    const maxSecs = 20 * 60;      // 20 min session

    const circumference = 2 * Math.PI * 34; // r=34

    function updateTimer() {
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

      if (timerCirc) {
        const ratio  = totalSecs / maxSecs;
        const offset = circumference * (1 - ratio);
        timerCirc.setAttribute('stroke-dasharray', circumference.toFixed(1));
        timerCirc.setAttribute('stroke-dashoffset', offset.toFixed(1));
      }

      if (totalSecs > 0) {
        totalSecs--;
        setTimeout(updateTimer, 1000);
      } else {
        timerEl.textContent = '00:00';
        setTimeout(() => { totalSecs = 20 * 60; updateTimer(); }, 3000);
      }
    }
    updateTimer();
  }

  // Set gradient on timer ring via inline SVG def
  function injectTimerGradient() {
    const svg = document.querySelector('.timer-ring');
    if (!svg) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#c9a84c"/>
      </linearGradient>
    `;
    svg.prepend(defs);
  }

  // ── Live stats fluctuation ────────────────────────────
  function startLiveFluctuation() {
    const heartsEl = document.querySelector('#stat-hearts .stat-value');
    const readersEl = document.querySelector('#stat-readers .stat-value');
    if (!heartsEl || !readersEl) return;

    setInterval(() => {
      const heartsDelta  = Math.floor(Math.random() * 21) - 10;
      const readersDelta = Math.floor(Math.random() * 11) - 5;

      let hearts  = parseInt(heartsEl.textContent.replace(/\./g, '').replace(',', ''), 10) || 42890;
      let readers = parseInt(readersEl.textContent.replace(/\./g, '').replace(',', ''), 10) || 12432;

      hearts  = Math.max(42000, hearts  + heartsDelta);
      readers = Math.max(12000, readers + readersDelta);

      heartsEl.textContent  = hearts.toLocaleString('es-ES');
      readersEl.textContent = readers.toLocaleString('es-ES');
    }, 3000);
  }

  // ── Sync Button interaction ───────────────────────────
  function initSyncButton() {
    const btn = document.getElementById('btn-sincronizar');
    if (!btn) return;

    btn.addEventListener('click', () => {
      btn.textContent = '✦  SINCRONIZADO ✓';
      btn.style.background = 'linear-gradient(90deg, #8b5cf6, #c9a84c)';
      btn.style.color = '#fff';
      btn.disabled = true;

      // Particle burst effect
      createBurstEffect(btn);

      setTimeout(() => {
        btn.innerHTML = '<span class="btn-sync-icon">✦</span> SINCRONIZAR MI SENTIR';
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);
    });
  }

  function createBurstEffect(origin) {
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;

    for (let i = 0; i < 14; i++) {
      const el = document.createElement('div');
      const angle = (i / 14) * Math.PI * 2;
      const dist  = 60 + Math.random() * 60;
      el.style.cssText = `
        position:fixed;
        left:${cx}px;top:${cy}px;
        width:6px;height:6px;
        border-radius:50%;
        background:hsl(${40 + i * 20},90%,70%);
        pointer-events:none;
        z-index:9999;
        transition:all 0.8s cubic-bezier(0.2,0,0.2,1);
        box-shadow:0 0 8px hsl(${40 + i * 20},90%,70%);
      `;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
        el.style.opacity   = '0';
      });
      setTimeout(() => el.remove(), 900);
    }
  }

  // ── Manifestation Form ────────────────────────────────
  function initManifestForm() {
    const form        = document.getElementById('manifestForm');
    const nameEl      = document.getElementById('manifestName');
    const emailEl     = document.getElementById('manifestEmail');
    const textEl      = document.getElementById('manifestText');
    const charCount   = document.getElementById('manifestCharCount');
    const energyFill  = document.getElementById('energyBarFill');
    const energyLevel = document.getElementById('energyLevel');
    const successEl   = document.getElementById('manifestSuccess');
    const newBtn      = document.getElementById('btn-manifest-new');
    const promptHint  = document.getElementById('manifestPromptHint');

    if (!form) return;

    // Rotating inspirational prompts
    const prompts = [
      '"Le pido al universo abundancia, paz y amor verdadero en mi vida..."',
      '"Manifiesto salud plena, alegría profunda y propósito claro..."',
      '"Hoy elijo confiar en el proceso. Todo fluye a mi favor..."',
      '"Atraigo oportunidades que elevan mi alma y expanden mi potencial..."',
      '"Soy digno/a de recibir todo lo bueno que el universo tiene para mí..."',
      '"Libero lo que ya no me sirve y abrazo mi nueva versión con amor..."',
    ];
    let promptIdx = 0;
    setInterval(() => {
      if (document.activeElement !== textEl) {
        promptIdx = (promptIdx + 1) % prompts.length;
        if (promptHint) {
          promptHint.style.opacity = '0';
          setTimeout(() => {
            promptHint.textContent = prompts[promptIdx];
            promptHint.style.opacity = '1';
          }, 300);
        }
      }
    }, 4000);

    // Energy levels based on text length
    const energyLevels = [
      { min: 0,   max: 1,   pct: 0,   label: 'Escribe para cargar tu intención ✦', color: '' },
      { min: 1,   max: 50,  pct: 15,  label: '✦ Intención naciendo...', color: '' },
      { min: 50,  max: 150, pct: 35,  label: '✦ Energía fluyendo ✦', color: '' },
      { min: 150, max: 300, pct: 60,  label: '✦✦ Vibración alta ✦✦', color: '' },
      { min: 300, max: 600, pct: 80,  label: '✦✦✦ Manifestación poderosa', color: '' },
      { min: 600, max: 1001,pct: 100, label: '✦✦✦✦ MÁXIMA ENERGÍA CÓSMICA', color: '' },
    ];

    // Char counter + energy bar
    textEl && textEl.addEventListener('input', () => {
      const len = textEl.value.length;
      if (charCount) charCount.textContent = len;

      const level = energyLevels.find(l => len >= l.min && len < l.max) || energyLevels[0];
      if (energyFill)  energyFill.style.width = level.pct + '%';
      if (energyLevel) energyLevel.textContent = level.label;
    });

    // Validation helper
    function validate() {
      let ok = true;
      [nameEl, emailEl, textEl].forEach(el => {
        if (!el) return;
        el.classList.remove('error');
        if (!el.value.trim()) {
          el.classList.add('error');
          ok = false;
        }
      });
      if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        emailEl.classList.add('error');
        ok = false;
      }
      return ok;
    }

    // Form submit → Gmail Web Compose (funciona sin servidor)
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;

      const submitBtn  = document.getElementById('btn-manifest');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span style="display:inline-block;animation:spinSlow 1s linear infinite">✦</span> Preparando tu mensaje...';

      const nombre  = nameEl.value.trim();
      const correo  = emailEl.value.trim();
      const mensaje = textEl.value.trim();

      // Cuerpo del email formateado
      const cuerpo =
        `✦ MANIFESTACIÓN POSITIVA ✦\n\n` +
        `Nombre: ${nombre}\n` +
        `Correo: ${correo}\n\n` +
        `Mensaje al Universo:\n${mensaje}\n\n` +
        `— Enviado desde Sentimiento Universal`;

      const asunto  = encodeURIComponent('✦ Mensaje Positivo – Sentimiento Universal');
      const body    = encodeURIComponent(cuerpo);
      const destino = 'conexaia.solutions@gmail.com';

      // Abrir Gmail Web compose en pestaña nueva
      const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${destino}&su=${asunto}&body=${body}`;
      setTimeout(() => {
        window.open(gmailURL, '_blank', 'noopener');
        // Mostrar éxito en la página
        form.style.display = 'none';
        if (successEl) successEl.classList.add('visible');
      }, 800);
    });

    // Reset button
    newBtn && newBtn.addEventListener('click', () => {
      if (successEl) successEl.classList.remove('visible');
      form.style.display = '';
      nameEl && (nameEl.value = '');
      emailEl && (emailEl.value = '');
      textEl  && (textEl.value  = '');
      if (charCount)   charCount.textContent  = '0';
      if (energyFill)  energyFill.style.width = '0%';
      if (energyLevel) energyLevel.textContent = 'Escribe para cargar tu intención ✦';
    });
  }

  // ── Scroll reveal ─────────────────────────────────────
  function initReveal() {
    const targets = document.querySelectorAll(
      '.gallery-card, .glass-widget, .buy-card, .about-text, .about-visual'
    );
    targets.forEach(el => el.classList.add('reveal'));

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => obs.observe(el));
  }

  // ── Connection section observer ───────────────────────
  function initConnectionObserver() {
    const section = document.getElementById('connection');
    if (!section) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounters();
          animateProgress();
          startLiveFluctuation();
          obs.unobserve(section);
        }
      });
    }, { threshold: 0.2 });

    obs.observe(section);
  }

  // ── Copy image assets to assets/ folder via fetch ─────
  // (assets are referenced relatively; this is done in setup)

  // ── Init ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    injectTimerGradient();
    createMapDots();
    startTimer();
    initReveal();
    initConnectionObserver();
    initSyncButton();
    initRepelDust();
    initManifestForm();
  });

})();
