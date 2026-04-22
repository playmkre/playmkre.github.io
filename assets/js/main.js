/* ODI Co., Ltd. — Main JS (updated) */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  injectLayout();

  const header = document.querySelector('.site-header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), {passive:true});

  document.querySelectorAll('.nav__item').forEach(item => {
    let leaveTimer;
    item.addEventListener('mouseenter', () => { clearTimeout(leaveTimer); item.classList.add('hover'); });
    item.addEventListener('mouseleave', () => { leaveTimer = setTimeout(() => item.classList.remove('hover'), 80); });
  });

  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.hamburger');
    if (btn) { btn.classList.toggle('open'); document.querySelector('.mobile-nav')?.classList.toggle('open'); }
    if (!e.target.closest('.site-header') && !e.target.closest('.mobile-nav')) {
      document.querySelector('.hamburger')?.classList.remove('open');
      document.querySelector('.mobile-nav')?.classList.remove('open');
    }
    const tog = e.target.closest('.theme-toggle');
    if (tog) toggleTheme();
  });

  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }), {threshold:.1, rootMargin:'0px 0px -30px 0px'});
    fadeEls.forEach(el => obs.observe(el));
  }

  const counters = document.querySelectorAll('.count-up');
  if (counters.length) {
    const cobs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); cobs.unobserve(e.target); } }), {threshold:.5});
    counters.forEach(el => cobs.observe(el));
  }

  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });

  setActiveNav();
});

function initTheme() {
  const saved = localStorage.getItem('odi-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('odi-theme', next);
}

function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1800, start = performance.now();
  const update = now => {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(e * target) + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function setActiveNav() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link, .mobile-nav a').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '');
    if (!href) return;
    try {
      const abs = new URL(href, location.href).pathname.replace(/\/$/, '');
      if (abs && abs !== '/' && path.includes(abs.split('/').pop()?.replace('.html','') || '')) {
        if (abs.split('/').pop() !== 'index') link.classList.add('active');
      }
    } catch(e) {}
  });
}

const MOON_SVG = `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const SUN_SVG  = `<svg class="icon-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

function injectLayout() {
  const h = document.getElementById('site-header');
  if (h) { const b = h.dataset.base||''; h.outerHTML = buildHeader(b); }
  const f = document.getElementById('site-footer');
  if (f) { const b = f.dataset.base||''; f.outerHTML = buildFooter(b); }
}

function buildHeader(b) {
  return `<header class="site-header" role="banner">
  <div class="header-inner">
    <a href="${b}index.html" class="logo logo--img" aria-label="ODI 홈">
      <img src="${b}assets/images/logo.png" alt="오디아이 주식회사" class="logo__img">
      <div class="logo__text"><span class="logo__text-en">ODI Co., Ltd.</span><span class="logo__text-ko">오디아이 주식회사</span></div>
    </a>
    <nav class="nav" role="navigation" aria-label="주 메뉴">
      <div class="nav__item"><a href="${b}company/index.html" class="nav__link">회사소개</a>
        <div class="nav__dropdown"><a href="${b}company/index.html">기업개요 · 연혁</a><a href="${b}company/index.html#vision">비전 · 로드맵</a><a href="${b}company/index.html#organization">조직 구조</a><a href="${b}company/location.html">오시는 길</a></div>
      </div>
      <div class="nav__item"><a href="${b}business/index.html" class="nav__link">주력 사업</a>
        <div class="nav__dropdown"><a href="${b}business/semiconductor.html">반도체·디스플레이</a><a href="${b}business/automation.html">자동화·초음파</a><a href="${b}business/automotive.html">자동차 부품검사</a></div>
      </div>
      <div class="nav__item"><a href="${b}capability/index.html" class="nav__link">제조역량</a>
        <div class="nav__dropdown"><a href="${b}capability/index.html#process">생산 프로세스</a><a href="${b}capability/index.html#capabilities">공정 및 설비</a><a href="${b}capability/index.html#erp">ERP · 운영관리</a></div>
      </div>
      <div class="nav__item"><a href="${b}quality/index.html" class="nav__link">품질관리</a>
        <div class="nav__dropdown"><a href="${b}quality/index.html">품질관리 체계</a><a href="${b}quality/index.html#kpi">품질 KPI</a><a href="${b}quality/index.html#inspection">검사 프로세스</a></div>
      </div>
      <div class="nav__item"><a href="${b}cases/index.html" class="nav__link">적용사례</a>
        <div class="nav__dropdown"><a href="${b}cases/index.html">전체 사례</a><a href="${b}cases/index.html#semiconductor">반도체·디스플레이</a><a href="${b}cases/index.html#automotive">자동차 부품검사</a></div>
      </div>
      <div class="nav__item"><a href="${b}downloads/index.html" class="nav__link">자료실</a>
        <div class="nav__dropdown"><a href="${b}downloads/index.html">회사소개서</a><a href="${b}downloads/index.html">제조역량 소개서</a><a href="${b}downloads/index.html">품질/운영 자료</a></div>
      </div>
      <div class="nav__item"><a href="${b}faq/index.html" class="nav__link">FAQ</a></div>
    </nav>
    <div class="header-cta">
      <button class="theme-toggle" aria-label="테마 변경" title="다크/라이트 모드 전환">${MOON_SVG}${SUN_SVG}</button>
      <a href="${b}contact/index.html" class="btn btn--primary" style="font-size:.83rem;padding:.55rem 1.1rem">생산 상담</a>
    </div>
    <button class="hamburger" aria-label="메뉴"><span></span><span></span><span></span></button>
  </div>
  <nav class="mobile-nav" aria-label="모바일 메뉴">
    <a href="${b}index.html">홈</a>
    <a href="${b}company/index.html">회사소개</a>
    <div class="mobile-sub"><a href="${b}company/index.html">기업개요 · 연혁</a><a href="${b}company/location.html">오시는 길</a></div>
    <a href="${b}business/index.html">주력 사업</a>
    <div class="mobile-sub"><a href="${b}business/semiconductor.html">반도체·디스플레이</a><a href="${b}business/automation.html">자동화·초음파</a><a href="${b}business/automotive.html">자동차 부품검사</a></div>
    <a href="${b}capability/index.html">제조역량</a>
    <a href="${b}quality/index.html">품질관리</a>
    <a href="${b}cases/index.html">적용사례</a>
    <a href="${b}downloads/index.html">자료실</a>
    <a href="${b}faq/index.html">FAQ</a>
    <a href="${b}contact/index.html">생산 상담</a>
  </nav>
</header>`;
}

function buildFooter(b) {
  return `<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">
    <div class="footer-info"><strong>오디아이 주식회사 (ODI Co., Ltd.)</strong><br>제1공장: 경기도 화성시 양감면 정문송산로 93번길 10-75 &nbsp;|&nbsp; 제2공장: 경기도 화성시 양감면 댕이안길 42-12<br>Tel. 031-8059-8845 &nbsp;|&nbsp; Email. silva79@naver.com &nbsp;|&nbsp; 평일 09:00 – 18:00</div>
    <div class="footer-bottom"><p>© 2025 ODI Co., Ltd. All rights reserved.</p><div class="footer-bottom-links"><a href="#">개인정보처리방침</a><a href="#">이용약관</a><a href="${b}contact/index.html">생산 상담 문의</a></div></div>
  </div>
</footer>`;
}
