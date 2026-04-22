/* =============================================
   Xonra Animations v2
   Drop in project root, add to every page:
   <script src="animations.js" defer></script>
   Settings are saved in localStorage and can
   be toggled from the floating ✦ button.
   ============================================= */

/* ─── DEFAULTS ─── */
const DEFAULTS = {
  scrollReveal:  true,
  typewriter:    true,
  navShrink:     true,
  logoFloat:     true,
  ripple:        true,
  parallax:      true,
  activeNav:     true,
  smoothScroll:  true,
  cursorTrail:   true,
  counterAnim:   true,
};

function loadSettings() {
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('xonraAnimSettings') || '{}'));
  } catch { return { ...DEFAULTS }; }
}
function saveSetting(key, value) {
  const s = loadSettings(); s[key] = value;
  localStorage.setItem('xonraAnimSettings', JSON.stringify(s));
}

const S = loadSettings();

/* ─── GLOBAL STYLES ─── */
const gs = document.createElement('style');
gs.textContent = `
  .xr-hidden{opacity:0;transform:translateY(28px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
  .xr-visible{opacity:1!important;transform:none!important}
  .xr-ripple-host{position:relative;overflow:hidden}
  .xr-ripple{position:absolute;border-radius:50%;transform:scale(0) translate(-50%,-50%);animation:xr-rpl .55s linear forwards;background:rgba(255,255,255,.22);pointer-events:none}
  @keyframes xr-rpl{to{transform:scale(4) translate(-50%,-50%);opacity:0}}
  @keyframes xr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .xr-logo-float{animation:xr-float 3.5s ease-in-out infinite;display:inline-block}
  @keyframes xr-blink{0%,100%{opacity:1}50%{opacity:0}}
  nav a.xr-active{font-weight:600;text-decoration:underline;text-underline-offset:4px}
  .xr-cross{position:fixed;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);animation:xr-cross .5s ease forwards;overflow:visible}
  @keyframes xr-cross{0%{opacity:.9;transform:translate(-50%,-50%) scale(1) rotate(0deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(2) rotate(45deg)}}
  .xr-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-radius:8px;padding:8px 12px}
  .xr-row label{cursor:pointer;color:var(--text-primary);user-select:none}
  .xr-sw{position:relative;width:34px;height:18px;flex-shrink:0}
  .xr-sw input{opacity:0;width:0;height:0}
  .xr-sl{position:absolute;inset:0;background:var(--text-secondary);opacity:0.3;border-radius:18px;cursor:pointer;transition:background .25s}
  .xr-sl::before{content:'';position:absolute;width:13px;height:13px;left:2.5px;top:2.5px;background:#fff;border-radius:50%;transition:transform .25s}
  .xr-sw input:checked+.xr-sl{background:var(--accent);opacity:1}
  .xr-sw input:checked+.xr-sl::before{transform:translateX(15px)}
  #xr-reload-note{font-size:11px;color:var(--text-secondary);margin-top:8px;padding-top:8px;border-top:1px solid var(--header-border);text-align:center}
  #xr-settings-panel .xr-row{background:var(--page-bg);border:1px solid var(--header-border);margin-bottom:4px}
`;
document.head.appendChild(gs);

/* ─── 1. NAVBAR SHRINK ─── */
if (S.navShrink) {
  const nav = document.querySelector('nav, header');
  if (nav) {
    nav.style.transition = 'padding .3s ease, backdrop-filter .3s ease, box-shadow .3s ease';
    window.addEventListener('scroll', () => {
      const on = window.scrollY > 60;
      nav.style.padding        = on ? '.4rem 1.5rem' : '';
      nav.style.backdropFilter = on ? 'blur(14px)' : '';
      nav.style.boxShadow      = on ? '0 2px 20px rgba(0,0,0,.2)' : '';
    }, { passive: true });
  }
}

/* ─── 2. SCROLL REVEAL ─── */
if (S.scrollReveal) {
  const els = document.querySelectorAll('section,article,.card,.project,h2,h3,p,a');
  els.forEach((el, i) => {
    el.classList.add('xr-hidden');
    el.style.transitionDelay = `${(i % 5) * 55}ms`;
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('xr-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ─── 3. TYPEWRITER — fixed, no body flicker, cursor as sibling span ─── */
if (S.typewriter) {
  /* Find the first h3 inside the first section (hero subtitle) */
  const subtitle = (
    document.querySelector('section h3') ||
    document.querySelector('.hero h3') ||
    document.querySelector('h2 ~ h3') ||
    document.querySelector('h1 ~ p')
  );

  if (subtitle) {
    const text = subtitle.textContent.trim();
    /* Clear and set aria fallback */
    subtitle.textContent = '';
    subtitle.setAttribute('aria-label', text);

    /* Text node will hold typed chars */
    const textNode = document.createTextNode('');
    subtitle.appendChild(textNode);

    /* Blinking cursor span */
    const cur = document.createElement('span');
    cur.style.cssText = 'display:inline-block;width:2px;height:1em;background:currentColor;vertical-align:text-bottom;margin-left:2px;animation:xr-blink .7s step-end infinite';
    subtitle.appendChild(cur);

    let i = 0;
    function type() {
      if (i <= text.length) {
        textNode.textContent = text.slice(0, i++);
        setTimeout(type, 42);
      } else {
        /* Stop blinking after 1.8 s */
        setTimeout(() => { cur.style.animation = 'none'; cur.style.opacity = '0'; }, 1800);
      }
    }

    /* Wait until visible before starting */
    const obs = new IntersectionObserver(e => {
      if (e[0].isIntersecting) { obs.disconnect(); setTimeout(type, 500); }
    }, { threshold: 0.4 });
    obs.observe(subtitle);
  }
}

/* ─── 4. RIPPLE ─── */
if (S.ripple) {
  document.querySelectorAll('a,button').forEach(btn => {
    btn.classList.add('xr-ripple-host');
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const sz = Math.max(r.width, r.height);
      const rpl = document.createElement('span');
      rpl.className = 'xr-ripple';
      rpl.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
      btn.appendChild(rpl);
      rpl.addEventListener('animationend', () => rpl.remove());
    });
  });
}

/* ─── 5. LOGO FLOAT ─── */
if (S.logoFloat) {
  const logo = document.querySelector('img[alt*="ogo"],nav img,header img');
  if (logo) logo.classList.add('xr-logo-float');
}

/* ─── 6. PARALLAX ─── */
if (S.parallax) {
  const hero = document.querySelector('section:first-of-type,.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      hero.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
    }, { passive: true });
  }
}

/* ─── 7. ACTIVE NAV ─── */
if (S.activeNav) {
  const links = [...document.querySelectorAll('nav a[href^="#"]')];
  const secs  = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  window.addEventListener('scroll', () => {
    let cur = '';
    secs.forEach(s => { if (window.scrollY >= s.offsetTop - 150) cur = '#' + s.id; });
    links.forEach(l => l.classList.toggle('xr-active', l.getAttribute('href') === cur));
  }, { passive: true });
}

/* ─── 8. SMOOTH SCROLL ─── */
if (S.smoothScroll) {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── 9. CURSOR TRAIL — crosshair sparks ─── */
if (S.cursorTrail) {
  const colors = ['#7f77dd','#1d9e75','#d85a30','#d4537e','#378add','#ef9f27'];
  let ci = 0, last = { x: -999, y: -999 };

  document.addEventListener('mousemove', e => {
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    if (dx * dx + dy * dy < 400) return; /* ~20px threshold */
    last = { x: e.clientX, y: e.clientY };
    const c = colors[ci++ % colors.length];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-8 -8 16 16');
    svg.style.cssText = `width:16px;height:16px;left:${e.clientX}px;top:${e.clientY}px`;
    svg.classList.add('xr-cross');
    svg.innerHTML = `
      <line x1="-6" y1="0"  x2="6"  y2="0"  stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <line x1="0"  y1="-6" x2="0"  y2="6"  stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
    document.body.appendChild(svg);
    svg.addEventListener('animationend', () => svg.remove());
  });
}

/* ─── 10. COUNTER ANIMATION ─── */
if (S.counterAnim) {
  [...document.querySelectorAll('*')].filter(el => {
    if (el.children.length) return false;
    return /^\d+[+]?$/.test(el.textContent.trim());
  }).forEach(el => {
    const target = parseInt(el.textContent);
    if (isNaN(target) || target > 9999) return;
    const suffix = el.textContent.replace(/\d/g, '').trim();
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const iv = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur + suffix;
        if (cur >= target) clearInterval(iv);
      }, 30);
    }, { threshold: 0.8 });
    obs.observe(el);
  });
}

/* ═══════════════════════════════════════════
   FLOATING SETTINGS PANEL (only on non-settings pages)
   ═══════════════════════════════════════════ */

const LABELS = {
  scrollReveal: 'Scroll reveal',
  typewriter:   'Typewriter effect',
  navShrink:    'Navbar shrink',
  logoFloat:    'Logo float',
  ripple:       'Button ripple',
  parallax:     'Parallax',
  activeNav:    'Active nav highlight',
  smoothScroll: 'Smooth scroll',
  cursorTrail:  'Cursor trail',
  counterAnim:  'Number counter',
};

function createAnimationToggle(key) {
  const row = document.createElement('div');
  row.className = 'xr-row';

  const lbl = document.createElement('label');
  lbl.textContent = LABELS[key];
  lbl.htmlFor = `xr-sw-${key}`;

  const sw  = document.createElement('label');
  sw.className = 'xr-sw';
  const inp = document.createElement('input');
  inp.type = 'checkbox'; inp.id = `xr-sw-${key}`; inp.checked = S[key];
  inp.addEventListener('change', () => { 
    saveSetting(key, inp.checked);
    // Toggle animations dynamically without reload
    applyAnimationSetting(key, inp.checked);
  });
  const sl  = document.createElement('span'); sl.className = 'xr-sl';
  sw.appendChild(inp); sw.appendChild(sl);

  row.appendChild(lbl); row.appendChild(sw);
  return row;
}

// Populate settings page controls if on settings.html
const settingsPanel = document.getElementById('xr-settings-panel');
if (settingsPanel) {
  Object.keys(LABELS).forEach(key => {
    settingsPanel.appendChild(createAnimationToggle(key));
  });
}

/* ═══════════════════════════════════════════
   DYNAMIC ANIMATION APPLICATION
   ═══════════════════════════════════════════ */

// Store references to active handlers for cleanup
const animHandlers = {
  navShrink: null,
  parallax: null,
  activeNav: null,
  cursorTrail: null,
  ripple: null,
};

function applyAnimationSetting(key, enabled) {
  // This function handles enabling/disabling animations without page reload
  if (key === 'scrollReveal') {
    const els = document.querySelectorAll('.xr-hidden, .xr-visible');
    if (enabled) {
      els.forEach(el => el.classList.remove('xr-visible'));
      // Re-initialize scroll reveal
      const allEls = document.querySelectorAll('section,article,.card,.project,h2,h3,p,a');
      allEls.forEach((el, i) => {
        if (!el.classList.contains('xr-hidden')) {
          el.classList.add('xr-hidden');
          el.style.transitionDelay = `${(i % 5) * 55}ms`;
        }
      });
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('xr-visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      allEls.forEach(el => obs.observe(el));
    } else {
      els.forEach(el => {
        el.classList.remove('xr-hidden', 'xr-visible');
        el.style.transitionDelay = '';
      });
    }
  } 
  else if (key === 'logoFloat') {
    const logo = document.querySelector('img[alt*="ogo"],.logo-container img,header img');
    if (logo) {
      if (enabled) {
        logo.classList.add('xr-logo-float');
      } else {
        logo.classList.remove('xr-logo-float');
      }
    }
  }
  else if (key === 'ripple') {
    if (enabled) {
      // Re-add ripple effect
      document.querySelectorAll('a,button').forEach(btn => {
        btn.classList.add('xr-ripple-host');
        if (!btn.dataset.rippleAttached) {
          btn.dataset.rippleAttached = 'true';
          btn.addEventListener('click', e => {
            const r = btn.getBoundingClientRect();
            const sz = Math.max(r.width, r.height);
            const rpl = document.createElement('span');
            rpl.className = 'xr-ripple';
            rpl.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
            btn.appendChild(rpl);
            rpl.addEventListener('animationend', () => rpl.remove());
          });
        }
      });
    } else {
      // Remove ripple effect
      document.querySelectorAll('.xr-ripple-host').forEach(btn => {
        btn.classList.remove('xr-ripple-host');
        delete btn.dataset.rippleAttached;
      });
    }
  }
  else if (key === 'navShrink') {
    const nav = document.querySelector('nav, header');
    if (nav) {
      if (enabled) {
        nav.style.transition = 'padding .3s ease, backdrop-filter .3s ease, box-shadow .3s ease';
        animHandlers.navShrink = () => {
          const on = window.scrollY > 60;
          nav.style.padding        = on ? '.4rem 1.5rem' : '';
          nav.style.backdropFilter = on ? 'blur(14px)' : '';
          nav.style.boxShadow      = on ? '0 2px 20px rgba(0,0,0,.2)' : '';
        };
        window.addEventListener('scroll', animHandlers.navShrink, { passive: true });
      } else {
        if (animHandlers.navShrink) {
          window.removeEventListener('scroll', animHandlers.navShrink);
          animHandlers.navShrink = null;
        }
        nav.style.padding = '';
        nav.style.backdropFilter = '';
        nav.style.boxShadow = '';
      }
    }
  }
  else if (key === 'cursorTrail') {
    if (enabled) {
      const colors = ['#7f77dd','#1d9e75','#d85a30','#d4537e','#378add','#ef9f27'];
      let ci = 0, last = { x: -999, y: -999 };
      
      animHandlers.cursorTrail = e => {
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        if (dx * dx + dy * dy < 400) return;
        last = { x: e.clientX, y: e.clientY };
        const c = colors[ci++ % colors.length];
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '-8 -8 16 16');
        svg.style.cssText = `width:16px;height:16px;left:${e.clientX}px;top:${e.clientY}px;position:fixed;pointer-events:none;z-index:99999`;
        svg.classList.add('xr-cross');
        svg.innerHTML = `
          <line x1="-6" y1="0"  x2="6"  y2="0"  stroke="${c}" stroke-width="2" stroke-linecap="round"/>
          <line x1="0"  y1="-6" x2="0"  y2="6"  stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
        document.body.appendChild(svg);
        svg.addEventListener('animationend', () => svg.remove());
      };
      document.addEventListener('mousemove', animHandlers.cursorTrail);
    } else {
      if (animHandlers.cursorTrail) {
        document.removeEventListener('mousemove', animHandlers.cursorTrail);
        animHandlers.cursorTrail = null;
      }
      // Clean up any remaining crosses
      document.querySelectorAll('.xr-cross').forEach(el => el.remove());
    }
  }
  else if (key === 'counterAnim') {
    if (enabled) {
      [...document.querySelectorAll('*')].filter(el => {
        if (el.children.length) return false;
        return /^\d+[+]?$/.test(el.textContent.trim());
      }).forEach(el => {
        if (el.dataset.counterAttached) return;
        el.dataset.counterAttached = 'true';
        const target = parseInt(el.textContent);
        if (isNaN(target) || target > 9999) return;
        const suffix = el.textContent.replace(/\d/g, '').trim();
        const obs = new IntersectionObserver(entries => {
          if (!entries[0].isIntersecting) return;
          obs.disconnect();
          let cur = 0;
          const step = Math.max(1, Math.ceil(target / 40));
          const iv = setInterval(() => {
            cur = Math.min(cur + step, target);
            el.textContent = cur + suffix;
            if (cur >= target) clearInterval(iv);
          }, 30);
        }, { threshold: 0.8 });
        obs.observe(el);
      });
    } else {
      document.querySelectorAll('[data-counter-attached]').forEach(el => {
        delete el.dataset.counterAttached;
      });
    }
  }
  // Other animations will apply on next page load
}
