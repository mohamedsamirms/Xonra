// Loads JSON data from `data/` and renders it into the homepage/other pages.
// This file centralizes content so templates can be data-driven.

function safeJson(value, fallback) {
  try {
    return value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return await res.json();
}

function renderHomepage() {
  // HERO
  const hero = document.querySelector('[data-xr-hero]') || null;
  if (hero) {
    // Not used in current templates, but kept for compatibility.
  }

  // ABOUT cards (static template uses hardcoded markup right now)
  // We only fill JSON-driven elements if template has placeholders.
}

function injectHeaderFromJson(headerData) {
  // Template headers are currently hardcoded; only inject if placeholders exist.
  const nav = document.querySelector('[data-xr-header-nav]');
  if (!nav) return;

  nav.innerHTML = '';
  (headerData || []).forEach(item => {
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = item.link;
    a.textContent = item.name;
    nav.appendChild(a);
  });
}

function injectFooterFromJson(footerData, socialData) {
  const footer = document.querySelector('[data-xr-footer]');
  if (!footer) return;

  footer.innerHTML = '';

  if (footerData?.copyright) {
    const p = document.createElement('p');
    p.textContent = footerData.copyright;
    footer.appendChild(p);
  }

  if (Array.isArray(socialData) && socialData.length) {
    const div = document.createElement('div');
    div.className = 'social-icons';
    socialData.forEach(s => {
      const a = document.createElement('a');
      a.href = s.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', s.platform);
      if (s.icon) {
        const i = document.createElement('i');
        i.className = s.icon;
        a.appendChild(i);
      }
      div.appendChild(a);
    });
    footer.appendChild(div);
  }
}

async function loadHomepageData() {
  // Decide base path depending on where this script runs.
  // Homepage template is in templates/html and loads ../js/data.js
  // so relative to templates/html, data is ../../data
  const base = document.documentElement.getAttribute('data-xr-base') || '../../data';

  const [
    hero,
    about,
    tools,
    projects,
    contact,
    header,
    footer,
    socials
  ] = await Promise.all([
    fetchJson(`${base}/index/hero.json`).catch(() => null),
    fetchJson(`${base}/index/about-us.json`).catch(() => null),
    fetchJson(`${base}/index/tools.json`).catch(() => null),
    fetchJson(`${base}/index/projects.json`).catch(() => null),
    fetchJson(`${base}/index/contact-us.json`).catch(() => null),
    fetchJson(`${base}/global/header.json`).catch(() => null),
    fetchJson(`${base}/global/footer.json`).catch(() => null),
    fetchJson(`${base}/global/social-media.json`).catch(() => null)
  ]);

  // Current templates are mostly hardcoded.
  // The goal is: if template adds placeholders, we’ll render from JSON.
  // For now, ensure header/footer injection placeholders are supported.

  injectHeaderFromJson(header);
  injectFooterFromJson(footer, socials);

  // If you later update templates to include placeholders, this is where you render
  // hero/about/tools/projects/contact.

  return { hero, about, tools, projects, contact };
}

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on pages that need data.
  // Homepage currently: templates/html/index.html
  const path = window.location.pathname;

  // Heuristic: if index.html is used (or path is '/'), load homepage data.
  const isHomepage = path === '/' || path.endsWith('/index') || path.endsWith('/index.html');

  try {
    if (isHomepage) {
      await loadHomepageData();
    }
  } catch (e) {
    console.error('data.js load failed', e);
  }
});

