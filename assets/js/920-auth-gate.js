/* ============================================================================
 * ODI / TechSysLab — Phase 14A Custom Auth Gate
 * ----------------------------------------------------------------------------
 * 사이트 접속 즉시 동작하는 인증 게이트.
 *
 *  1) DOMContentLoaded 즉시 페이지 본문을 가린다 (auth-gate overlay).
 *  2) /api/auth/me 호출
 *      - status = 'ok'  → 사용자 정보/권한 캐시 후 본문 표시 + 권한별 메뉴 가시화
 *      - status = 'anonymous' → 로그인 화면 표시
 *  3) 로그인 성공 시 본문을 표시하고 권한 적용
 *
 *  Phase 14A 정책:
 *   - 사용자 / 관리자 HTML 본문 미변경 (이 JS만 <script>로 로드)
 *   - 기존 메뉴 / 보호 페이지 / 현황판 이미지 asset 미손상
 *   - 프론트 메뉴 숨김은 보안의 보조 수단일 뿐. 서버 API에서 항상 권한 검사 함
 *   - 미로그인 상태에서는 API 호출이 일어나지 않도록 overlay가 모든 입력을 막음
 * ========================================================================== */
(function(){
  'use strict';
  if (window.__ODI_PHASE14A_AUTH_GATE__) return;
  window.__ODI_PHASE14A_AUTH_GATE__ = true;

  // ---------- 설정 ----------
  function getApiBase(){
    try {
      var ac = window.TechSysLabApiClient;
      if (ac && typeof ac.getApiBase === 'function') return ac.getApiBase();
    } catch(e) {}
    // CNAME 기반 안전 기본값
    return 'https://api.techsyslab.com';
  }

  function isAdminPortal(){
    try { return (location.pathname || '').toLowerCase().indexOf('/admin') !== -1; }
    catch(e) { return false; }
  }

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function apiFetch(path, opts){
    opts = opts || {};
    opts.credentials = 'include';
    opts.headers = opts.headers || {};
    if (!opts.headers['Accept']) opts.headers['Accept'] = 'application/json';
    if (opts.body && !opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';
    return fetch(getApiBase().replace(/\/$/, '') + path, opts).then(function(r){
      return r.json().then(function(j){
        return { ok: r.ok, status: r.status, body: j };
      }, function(){ return { ok: r.ok, status: r.status, body: null }; });
    });
  }

  // ---------- 상태 ----------
  var state = {
    me: null,           // /api/auth/me 결과 user 객체
    permissions: null,  // 권한 객체 { pages, menus, actions }
    booted: false       // 한 번이라도 로그인 화면을 띄웠는지
  };

  // ---------- 스타일 ----------
  function injectStyle(){
    if (document.getElementById('odi-p14a-style')) return;
    var st = document.createElement('style');
    st.id = 'odi-p14a-style';
    st.textContent = [
      '#odi-p14a-overlay {',
      '  position: fixed; inset: 0; z-index: 2147483600;',
      '  background: linear-gradient(135deg, #0a0e1a 0%, #161c30 100%);',
      '  display: flex; align-items: center; justify-content: center;',
      '  font-family: system-ui, Pretendard, "Segoe UI", sans-serif;',
      '  color: #dde2ec;',
      '}',
      '#odi-p14a-overlay .box {',
      '  width: 360px; max-width: 92vw;',
      '  background: #0f1320; border: 1px solid #2a3148; border-radius: 12px;',
      '  padding: 28px 26px 24px; box-shadow: 0 16px 48px rgba(0,0,0,0.45);',
      '}',
      '#odi-p14a-overlay h1 {',
      '  margin: 0 0 4px; font-size: 18px; color: #bcd2ff; letter-spacing: 0.5px;',
      '}',
      '#odi-p14a-overlay .sub { font-size: 11px; color: #8b95ad; margin-bottom: 20px; }',
      '#odi-p14a-overlay label {',
      '  display: block; font-size: 11px; color: #a4adc4; margin: 10px 0 4px;',
      '}',
      '#odi-p14a-overlay input[type=text], #odi-p14a-overlay input[type=password] {',
      '  width: 100%; box-sizing: border-box;',
      '  padding: 8px 10px; font-size: 13px;',
      '  background: #141a2c; border: 1px solid #2a3148; border-radius: 6px;',
      '  color: #e6edf7; outline: none;',
      '}',
      '#odi-p14a-overlay input:focus { border-color: #3863b8; }',
      '#odi-p14a-overlay .actions { margin-top: 18px; display: flex; gap: 8px; }',
      '#odi-p14a-overlay button.primary {',
      '  flex: 1; padding: 9px 12px; font-size: 13px;',
      '  background: #2b4a8c; color: #fff; border: 1px solid #3863b8;',
      '  border-radius: 6px; cursor: pointer; font-weight: 600;',
      '}',
      '#odi-p14a-overlay button.primary:hover { background: #3863b8; }',
      '#odi-p14a-overlay button.primary:disabled { opacity: 0.5; cursor: progress; }',
      '#odi-p14a-overlay .err {',
      '  margin-top: 12px; padding: 8px 10px; font-size: 11px;',
      '  background: rgba(255,90,90,0.12); color: #ff8a8a;',
      '  border-radius: 5px; min-height: 16px;',
      '}',
      '#odi-p14a-overlay .ok {',
      '  margin-top: 12px; padding: 8px 10px; font-size: 11px;',
      '  background: rgba(90,255,150,0.08); color: #8bff9c; border-radius: 5px;',
      '}',
      '#odi-p14a-overlay .foot {',
      '  margin-top: 16px; font-size: 10px; color: #6e7790; text-align: center;',
      '}',
      // 권한별 메뉴 숨김용 유틸 클래스
      '.odi-p14a-hidden { display: none !important; }',
      '.odi-p14a-disabled { pointer-events: none; opacity: 0.4; }',
      // 사용자 정보 배지 (상단 우측)
      '#odi-p14a-userbar {',
      '  position: fixed; top: 8px; right: 10px; z-index: 99996;',
      '  background: rgba(15,19,32,0.9); color: #dde2ec;',
      '  border: 1px solid #2a3148; border-radius: 6px;',
      '  padding: 4px 9px; font-size: 11px;',
      '  font-family: system-ui, Pretendard, "Segoe UI", sans-serif;',
      '}',
      '#odi-p14a-userbar .role {',
      '  display: inline-block; padding: 0 6px; margin-left: 6px;',
      '  background: #2b4a8c; color: #fff; border-radius: 8px; font-size: 10px; font-weight: 600;',
      '}',
      '#odi-p14a-userbar .role.r-super_admin { background: #6a2f7a; }',
      '#odi-p14a-userbar .role.r-admin { background: #2f7a4b; }',
      '#odi-p14a-userbar .role.r-team { background: #2b4a8c; }',
      '#odi-p14a-userbar .role.r-guest { background: #555; }',
      '#odi-p14a-userbar a {',
      '  color: #a4adc4; text-decoration: none; margin-left: 8px; cursor: pointer;',
      '}',
      '#odi-p14a-userbar a:hover { color: #fff; }',
    ].join('\n');
    document.head.appendChild(st);
  }

  // ---------- 로그인 화면 ----------
  function showLoginOverlay(initialError){
    injectStyle();
    var el = document.getElementById('odi-p14a-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'odi-p14a-overlay';
      document.body.appendChild(el);
    }
    el.innerHTML = ''
      + '<div class="box">'
      + '  <h1>TechSysLab 로그인</h1>'
      + '  <div class="sub">' + (isAdminPortal() ? '관리자 포털' : '사용자 포털') + ' · 로그인이 필요합니다.</div>'
      + '  <form id="odi-p14a-form" autocomplete="on">'
      + '    <label for="odi-p14a-id">아이디 또는 이메일</label>'
      + '    <input id="odi-p14a-id" type="text" autocomplete="username" required />'
      + '    <label for="odi-p14a-pw">비밀번호</label>'
      + '    <input id="odi-p14a-pw" type="password" autocomplete="current-password" required />'
      + '    <div class="actions">'
      + '      <button class="primary" type="submit" id="odi-p14a-submit">로그인</button>'
      + '    </div>'
      + '    <div class="err" id="odi-p14a-err">' + (initialError ? esc(initialError) : '') + '</div>'
      + '  </form>'
      + '  <div class="foot">© TechSysLab · 자체 인증 / RBAC 베이스라인</div>'
      + '</div>';

    var form = document.getElementById('odi-p14a-form');
    var idEl = document.getElementById('odi-p14a-id');
    var pwEl = document.getElementById('odi-p14a-pw');
    var btn = document.getElementById('odi-p14a-submit');
    var errEl = document.getElementById('odi-p14a-err');

    function submit(ev){
      if (ev && ev.preventDefault) ev.preventDefault();
      var identifier = (idEl.value || '').trim();
      var password = pwEl.value || '';
      if (!identifier || !password) {
        errEl.textContent = '아이디와 비밀번호를 입력하세요.';
        return false;
      }
      btn.disabled = true;
      errEl.textContent = '';
      apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier, password: password })
      }).then(function(r){
        if (!r.ok) {
          var msg = (r.body && r.body.detail) || '로그인 실패';
          if (r.status === 401) msg = '아이디 또는 비밀번호가 올바르지 않습니다.';
          errEl.textContent = msg;
          btn.disabled = false;
          return;
        }
        state.me = r.body.user;
        state.permissions = r.body.permissions;
        try { window.__ODI_P14A_ME__ = state.me; window.__ODI_P14A_PERMS__ = state.permissions; } catch(e) {}
        hideOverlay();
        applyPermissions();
        renderUserBar();
        // 로그인 직후 신호 발사 — 다른 스크립트가 이를 듣고 초기화 가능
        try { document.dispatchEvent(new CustomEvent('odi:auth:login', { detail: { user: state.me, permissions: state.permissions } })); } catch(e) {}
      }, function(){
        errEl.textContent = '서버와 통신할 수 없습니다. 잠시 후 다시 시도하세요.';
        btn.disabled = false;
      });
      return false;
    }
    form.addEventListener('submit', submit);
    setTimeout(function(){ try { idEl.focus(); } catch(e) {} }, 50);
    state.booted = true;
  }

  function hideOverlay(){
    var el = document.getElementById('odi-p14a-overlay');
    if (el) el.parentNode.removeChild(el);
  }

  // ---------- 권한 기반 화면 제어 ----------
  function applyPermissions(){
    if (!state.permissions) return;
    var menus = state.permissions.menus || {};
    var pages = state.permissions.pages || {};

    // data-menu-key="..." 속성을 가진 노드: visible=false면 숨김, enabled=false면 비활성
    document.querySelectorAll('[data-menu-key]').forEach(function(el){
      var key = el.getAttribute('data-menu-key');
      var mp = menus[key];
      if (!mp) return;
      el.classList.toggle('odi-p14a-hidden', !mp.visible);
      el.classList.toggle('odi-p14a-disabled', mp.visible && !mp.enabled);
    });

    // data-page-key 속성: can_view=false면 페이지 컨테이너 숨김
    document.querySelectorAll('[data-page-key]').forEach(function(el){
      var key = el.getAttribute('data-page-key');
      var pp = pages[key];
      if (!pp) return;
      el.classList.toggle('odi-p14a-hidden', !pp.can_view);
    });

    // data-action-key 속성: 버튼 권한
    var actions = state.permissions.actions || {};
    document.querySelectorAll('[data-action-key]').forEach(function(el){
      var key = el.getAttribute('data-action-key');
      var allowed = !!actions[key];
      el.classList.toggle('odi-p14a-hidden', !allowed);
    });

    // 관리자 포털인데 admin 미만이면 본문을 가리고 안내 표시
    if (isAdminPortal()) {
      var role = state.me && state.me.role;
      var level = ({super_admin: 100, admin: 80, team: 40, guest: 10})[role] || 0;
      if (level < 80) {
        showNotAuthorized('관리자 권한이 필요합니다. (현재 역할: ' + (role || 'guest') + ')');
      }
    }
  }

  function showNotAuthorized(message){
    injectStyle();
    var el = document.getElementById('odi-p14a-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'odi-p14a-overlay';
      document.body.appendChild(el);
    }
    el.innerHTML = ''
      + '<div class="box">'
      + '  <h1>접근 권한 없음</h1>'
      + '  <div class="sub">' + esc(message) + '</div>'
      + '  <div class="actions">'
      + '    <button class="primary" id="odi-p14a-back">사용자 포털로 돌아가기</button>'
      + '  </div>'
      + '</div>';
    var b = document.getElementById('odi-p14a-back');
    if (b) b.addEventListener('click', function(){ location.href = '/'; });
  }

  // ---------- 사용자 바 (상단 우측) ----------
  function renderUserBar(){
    if (!state.me) return;
    var el = document.getElementById('odi-p14a-userbar');
    if (!el) {
      el = document.createElement('div');
      el.id = 'odi-p14a-userbar';
      document.body.appendChild(el);
    }
    var role = state.me.role || 'guest';
    var name = state.me.display_name || state.me.username || '익명';
    el.innerHTML = ''
      + esc(name)
      + ' <span class="role r-' + esc(role) + '">' + esc(role) + '</span>'
      + ' <a id="odi-p14a-logout">로그아웃</a>'
      + (role === 'super_admin' || role === 'admin' ? ' <a href="/admin/">관리자</a>' : '')
      + (isAdminPortal() ? ' <a href="/">사용자</a>' : '');

    var lo = document.getElementById('odi-p14a-logout');
    if (lo) lo.addEventListener('click', function(){
      apiFetch('/api/auth/logout', { method: 'POST' }).then(function(){
        state.me = null; state.permissions = null;
        try { delete window.__ODI_P14A_ME__; delete window.__ODI_P14A_PERMS__; } catch(e) {}
        location.reload();
      });
    });
  }

  // ---------- 부팅 ----------
  function boot(){
    injectStyle();
    // overlay 즉시 표시하여 본문 가림 (깜빡임 방지)
    var el = document.createElement('div');
    el.id = 'odi-p14a-overlay';
    el.innerHTML = '<div class="box"><div class="sub">인증 확인 중…</div></div>';
    document.body.appendChild(el);

    apiFetch('/api/auth/me').then(function(r){
      var b = r.body || {};
      if (b.status === 'ok' && b.user) {
        state.me = b.user;
        state.permissions = b.permissions;
        try { window.__ODI_P14A_ME__ = state.me; window.__ODI_P14A_PERMS__ = state.permissions; } catch(e) {}
        hideOverlay();
        applyPermissions();
        renderUserBar();
        try { document.dispatchEvent(new CustomEvent('odi:auth:ready', { detail: { user: state.me, permissions: state.permissions } })); } catch(e) {}
      } else {
        showLoginOverlay();
      }
    }, function(){
      showLoginOverlay('서버와 통신할 수 없습니다. 네트워크를 확인하세요.');
    });
  }

  // 외부에 작은 API 노출 — 다른 JS가 권한 캐시를 활용할 수 있도록
  window.ODIPhase14AAuth = {
    me: function(){ return state.me; },
    permissions: function(){ return state.permissions; },
    can: function(actionKey){
      return !!(state.permissions && state.permissions.actions && state.permissions.actions[actionKey]);
    },
    apiFetch: apiFetch,
    logout: function(){
      return apiFetch('/api/auth/logout', { method: 'POST' }).then(function(){ location.reload(); });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
