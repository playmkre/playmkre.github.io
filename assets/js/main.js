/* ODI Co., Ltd. — Main JS */
document.addEventListener('DOMContentLoaded', () => {
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
        <div class="nav__dropdown"><a href="${b}capability/index.html#turnkey">Turnkey 프로세스</a><a href="${b}capability/index.html#capabilities">공정 및 설비</a><a href="${b}capability/index.html#erp">ERP · 모니터링</a></div>
      </div>
      <div class="nav__item"><a href="${b}quality/index.html" class="nav__link">품질관리</a>
        <div class="nav__dropdown"><a href="${b}quality/index.html">품질관리 체계</a><a href="${b}quality/index.html#inspection">검사 항목</a><a href="${b}quality/index.html#storage">보관 · 물류</a></div>
      </div>
      <div class="nav__item"><a href="${b}cases/index.html" class="nav__link">적용사례</a>
        <div class="nav__dropdown"><a href="${b}cases/index.html">전체 사례</a><a href="${b}cases/index.html#track">고객사별 이력</a></div>
      </div>
      <div class="nav__item"><a href="${b}downloads/index.html" class="nav__link">자료실</a>
        <div class="nav__dropdown"><a href="${b}downloads/index.html">회사소개서</a><a href="${b}downloads/index.html">제조역량 소개서</a><a href="${b}downloads/index.html">장비 카탈로그</a></div>
      </div>
    </nav>
    <div class="header-cta"><a href="${b}contact/index.html" class="btn btn--primary" style="font-size:.83rem;padding:.55rem 1.1rem">문의하기</a></div>
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
    <a href="${b}contact/index.html">문의하기</a>
  </nav>
</header>`;
}

function buildFooter(b) {
  return `<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="${b}index.html" class="logo logo--img"><img src="${b}assets/images/logo.png" alt="오디아이 주식회사" class="logo__img logo__img--footer"></a>
        <p>반도체·디스플레이·자동차 산업을 위한<br>OEM·ODM·Turnkey 제조 파트너</p>
        <div style="margin-top:1.2rem;display:flex;flex-direction:column;gap:.45rem">
          <a href="tel:031-8059-8845" style="font-size:.8rem;color:rgba(255,255,255,.55);text-decoration:none">Tel. 031-8059-8845</a>
          <a href="mailto:silva79@naver.com" style="font-size:.8rem;color:rgba(255,255,255,.55);text-decoration:none">Email. silva79@naver.com</a>
        </div>
      </div>
      <div class="footer-col"><h4>회사소개</h4><ul><li><a href="${b}company/index.html">기업개요</a></li><li><a href="${b}company/index.html#history">연혁</a></li><li><a href="${b}company/index.html#vision">비전 · 로드맵</a></li><li><a href="${b}company/index.html#organization">조직 구조</a></li><li><a href="${b}company/location.html">오시는 길</a></li></ul></div>
      <div class="footer-col"><h4>제조 · 역량</h4><ul><li><a href="${b}capability/index.html">제조역량</a></li><li><a href="${b}quality/index.html">품질관리</a></li><li><a href="${b}cases/index.html">적용사례</a></li><li><a href="${b}downloads/index.html">자료실</a></li></ul></div>
      <div class="footer-col"><h4>고객지원</h4><ul><li><a href="${b}contact/index.html">문의하기</a></li><li><a href="${b}faq/index.html">FAQ</a></li><li><a href="${b}company/location.html">오시는 길</a></li></ul></div>
    </div>
    <div class="footer-info"><strong>오디아이 주식회사 (ODI Co., Ltd.)</strong><br>제1공장: 경기도 화성시 양감면 정문송산로 93번길 10-75 &nbsp;|&nbsp; 제2공장: 경기도 화성시 양감면 댕이안길 42-12<br>Tel. 031-8059-8845 &nbsp;|&nbsp; Email. silva79@naver.com &nbsp;|&nbsp; 평일 09:00 – 18:00</div>
    <div class="footer-bottom"><p>© 2025 ODI Co., Ltd. All rights reserved.</p><div class="footer-bottom-links"><a href="#">개인정보처리방침</a><a href="#">이용약관</a><a href="${b}contact/index.html">문의하기</a></div></div>
  </div>
</footer>`;
}
