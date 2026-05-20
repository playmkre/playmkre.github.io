/* ============================================================================
 * ODI User Portal — Phase 13A Data Status Badge + Dev-Panel Suppression
 * ----------------------------------------------------------------------------
 * 사용자 포털에서:
 *  1) Phase 12/13에서 노출되던 개발자용 패널을 기본 비노출 처리
 *     - Release QA 패널
 *     - 서버 진단/Runtime 상세값
 *     - DB 체크 패널 / API 업로드 콘솔
 *  2) 운영자/사용자가 이해할 수 있는 표현으로 "현재 적용 중인 데이터" 배지 표시
 *     - 생산일정 / 품질 각각의 원본 파일명, 반영 행 수, 최종 적용일
 *
 *  Phase 13A 정책:
 *   - 사용자 포털 본문 미수정
 *   - 보호 페이지 9종 미숨김
 *   - 자동 화면 데이터 교체 금지 (read-only 표시 전용)
 * ========================================================================== */
(function(){
  'use strict';
  if (window.__ODI_PHASE13A_USER_BADGE__) return;
  window.__ODI_PHASE13A_USER_BADGE__ = true;

  // 사용자 포털에서 숨길 개발자/진단 패널의 ID/셀렉터 목록
  var DEV_PANEL_SELECTORS = [
    '#tsl-admin-upload-console',
    '#tsl-release-qa-console',
    '#tsl-db-check-console',
    '#tsl-runtime-panel',
    '[data-tsl-dev-panel]'
  ];

  function getApiBase(){
    try {
      var api = window.TechSysLabApiClient;
      if (api && typeof api.getApiBase === 'function') return api.getApiBase();
    } catch(e) {}
    return 'https://api.techsyslab.com';
  }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function fmtTime(s){
    if (!s) return '-';
    try {
      var d = new Date(String(s).replace(' ', 'T'));
      if (isNaN(d.getTime())) return s;
      return d.toLocaleString('ko-KR', { hour12: false });
    } catch(e) { return s; }
  }

  // 사용자 포털 여부 감지: /admin/ 경로는 아닌 페이지만 적용
  function isUserPortal(){
    try {
      var p = (location.pathname || '').toLowerCase();
      return p.indexOf('/admin') === -1;
    } catch(e) { return true; }
  }

  // ---------------- 1) 개발자 패널 비노출 처리 ----------------
  function hideDevPanels(){
    DEV_PANEL_SELECTORS.forEach(function(sel){
      try {
        document.querySelectorAll(sel).forEach(function(el){
          if (el && !el.classList.contains('odi-p13a-suppressed')) {
            el.classList.add('odi-p13a-suppressed');
            el.style.display = 'none';
          }
        });
      } catch(e) {}
    });
  }

  function watchAndHide(){
    hideDevPanels();
    var mo = new MutationObserver(function(records){
      var any = false;
      records.forEach(function(r){
        if (r.addedNodes && r.addedNodes.length) any = true;
      });
      if (any) hideDevPanels();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------- 2) 배지 ----------------
  function injectStyles(){
    if (document.getElementById('odi-p13a-user-style')) return;
    var st = document.createElement('style');
    st.id = 'odi-p13a-user-style';
    st.textContent = [
      '#odi-p13a-user-badge { position:fixed; right:12px; bottom:12px; z-index:99997;',
      '  background:rgba(15,19,32,0.93); color:#dde2ec; border:1px solid #2a3148;',
      '  border-radius:8px; padding:8px 11px; font-size:11px;',
      '  font-family:system-ui,Pretendard,"Segoe UI",sans-serif;',
      '  box-shadow:0 4px 14px rgba(0,0,0,0.25); max-width:320px; }',
      '#odi-p13a-user-badge .ttl { color:#7ec8ff; font-weight:700; margin-bottom:4px; }',
      '#odi-p13a-user-badge .grp { padding:3px 0; border-top:1px dashed #2a3148; }',
      '#odi-p13a-user-badge .grp:first-of-type { border-top:none; padding-top:0; }',
      '#odi-p13a-user-badge .lbl { color:#8b95ad; font-size:10px; display:inline-block; min-width:64px; }',
      '#odi-p13a-user-badge .val { color:#e6edf7; }',
      '#odi-p13a-user-badge .row { color:#bbb; font-size:10px; }',
      '#odi-p13a-user-badge .ok { color:#8bff9c; font-size:10px; }',
      '#odi-p13a-user-badge.min .body { display:none; }',
      '#odi-p13a-user-badge .head { cursor:pointer; user-select:none; display:flex;',
      '  align-items:center; justify-content:space-between; }',
      '@media (max-width: 720px){ #odi-p13a-user-badge { font-size:10px; max-width:220px; } }'
    ].join('\n');
    document.head.appendChild(st);
  }

  function render(data){
    var el = document.getElementById('odi-p13a-user-badge');
    if (!el) {
      el = document.createElement('div');
      el.id = 'odi-p13a-user-badge';
      el.className = 'min';
      document.body.appendChild(el);
      el.addEventListener('click', function(){ el.classList.toggle('min'); });
    }
    var sch = (data && data.schedule) || null;
    var ql = (data && data.quality) || null;
    var lastApplied = '';
    if (sch && sch.last_applied_at) lastApplied = sch.last_applied_at;
    if (ql && ql.last_applied_at && (!lastApplied || ql.last_applied_at > lastApplied)) {
      lastApplied = ql.last_applied_at;
    }

    el.innerHTML = ''
      + '<div class="head">'
      +   '<span class="ttl">현재 적용 중인 데이터</span>'
      +   '<span class="row">▾</span>'
      + '</div>'
      + '<div class="body">'
      + '  <div class="grp">'
      + '    <div><span class="lbl">생산일정</span> '
      +       (sch ? '<span class="val">' + esc(sch.original_filename || '-') + '</span>' : '<span class="row">미적용</span>')
      + '    </div>'
      + '    <div class="row">반영 행수: <span class="val">'
      +       (sch && sch.derived_row_count != null ? esc(sch.derived_row_count) : '-')
      + '    </span></div>'
      + '  </div>'
      + '  <div class="grp">'
      + '    <div><span class="lbl">품질</span> '
      +       (ql ? '<span class="val">' + esc(ql.original_filename || '-') + '</span>' : '<span class="row">미적용</span>')
      + '    </div>'
      + '    <div class="row">반영 행수: <span class="val">'
      +       (ql && ql.derived_row_count != null ? esc(ql.derived_row_count) : '-')
      + '    </span></div>'
      + '  </div>'
      + '  <div class="grp">'
      + '    <div class="row">최종 적용일: <span class="val">' + esc(fmtTime(lastApplied)) + '</span></div>'
      + '    <div class="ok">원본 파일 기준 · 읽기 전용 미리보기</div>'
      + '  </div>'
      + '</div>';
  }

  function load(){
    var url = getApiBase().replace(/\/$/, '') + '/api/user/source-file-status';
    fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
      .then(function(r){ if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function(j){ injectStyles(); render(j); })
      .catch(function(){ /* offline-friendly: 사용자 포털은 API 실패해도 정상 동작해야 함 */ });
  }

  function init(){
    // 사용자 포털에서만 동작
    if (!isUserPortal()) return;
    // 개발자 패널 즉시 숨김 + 감시
    watchAndHide();
    // 배지 로드 (약간 지연 — 사용자 포털 초기 렌더가 끝난 뒤)
    setTimeout(load, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
