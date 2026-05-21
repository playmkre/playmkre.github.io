/* ============================================================================
 * ODI Admin Console — Phase 14A-1B Integrated User & Permission Management
 * ============================================================================
 *
 * Phase 14A-1B 구조 (사용자 spec §7):
 *   ① 현재 로그인 사용자 카드
 *   ② 사용자 관리 (목록 / 추가 / 수정 / 역할변경 / 활성·비활성 / 비밀번호 초기화)
 *   ③ 역할/권한 관리 — 922-role-permission-matrix.js 가 처리
 *   ④ 접속/작업 이력 (audit-logs)
 *   ⑤ 고급 진단 (기본 닫힘, /api/health 등)
 *
 * 권한 적용:
 *   - super_admin: 모든 섹션 표시 + 모든 기능
 *   - admin:       사용자 관리 (team/guest 만 생성/수정), 역할/권한은 조회만
 *   - team/guest:  콘솔 자체 미표시 (게이트가 /admin 진입을 차단)
 *
 * 절대 금지 (사용자 spec §8 — 운영자 표현으로만 노출):
 *   - 기술 진단/내부용 영문 키워드는 운영자 UI에 그대로 노출하지 않는다.
 *     예: 내부 작업 단계명 / 검수 절차 명칭 / 진단 모니터 명칭 등.
 *   - 제거된 진단 모듈 (008/009 계열) 재삽입 금지
 * ========================================================================== */
(function(){
  'use strict';
  if (window.__ODI_PHASE14A_1B_CONSOLE__) return;
  window.__ODI_PHASE14A_1B_CONSOLE__ = true;

  // ───────── 상수 ─────────
  var ROLE_KO = {
    super_admin: '슈퍼 관리자',
    admin: '관리자',
    team: '일반 팀원',
    guest: '게스트'
  };
  var STATUS_KO = { ACTIVE: '활성', DISABLED: '비활성' };

  // ───────── 유틸 ─────────
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
  function api(path, opts){
    var g = window.ODIPhase14AAuth;
    if (g && typeof g.apiFetch === 'function') return g.apiFetch(path, opts);
    return fetch(path, Object.assign({ credentials: 'include' }, opts || {}))
      .then(function(r){ return r.json().then(function(b){ return { ok: r.ok, status: r.status, body: b }; }); });
  }
  function role(){
    var g = window.ODIPhase14AAuth;
    return (g && g.me() && g.me().role) || 'guest';
  }
  function me(){
    var g = window.ODIPhase14AAuth;
    return (g && g.me()) || null;
  }
  function isSuper(){ return role() === 'super_admin'; }
  function isAdmin(){ return role() === 'admin' || role() === 'super_admin'; }
  function isAdminPortal(){
    return (location.pathname || '').toLowerCase().indexOf('/admin') !== -1;
  }

  // ───────── 스타일 ─────────
  function injectStyle(){
    if (document.getElementById('odi-p14a1b-style')) return;
    var st = document.createElement('style');
    st.id = 'odi-p14a1b-style';
    st.textContent = [
      '#odi-p14a1b-console {',
      '  position: fixed; left: 14px; bottom: 14px; width: 560px;',
      '  max-height: 86vh; overflow: hidden; z-index: 99997;',
      '  background: #0f1320; color: #dde2ec;',
      '  border: 1px solid #2a3148; border-radius: 10px;',
      '  font-family: system-ui, Pretendard, "Segoe UI", sans-serif; font-size: 12px;',
      '  box-shadow: 0 8px 28px rgba(0,0,0,0.35);',
      '  display: flex; flex-direction: column;',
      '}',
      '#odi-p14a1b-console .head {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  padding: 9px 12px; background: #161c30; border-bottom: 1px solid #2a3148;',
      '  cursor: pointer; font-weight: 700; color: #bcd2ff; flex: 0 0 auto;',
      '}',
      '#odi-p14a1b-console.min .body { display: none; }',
      '#odi-p14a1b-console .body {',
      '  padding: 10px 12px 14px; overflow-y: auto; flex: 1 1 auto;',
      '}',
      '#odi-p14a1b-console .tabs { display: flex; gap: 3px; margin-bottom: 10px; flex-wrap: wrap; }',
      '#odi-p14a1b-console .tabs button {',
      '  padding: 5px 9px; font-size: 11px;',
      '  background: #1f2740; color: #a4adc4; border: 1px solid #2a3148;',
      '  border-radius: 5px; cursor: pointer;',
      '}',
      '#odi-p14a1b-console .tabs button.active { background: #2b4a8c; color: #fff; border-color: #3863b8; }',
      '#odi-p14a1b-console .card {',
      '  background: #141a2c; border: 1px solid #232a44; border-radius: 7px;',
      '  padding: 9px 11px; margin-bottom: 10px;',
      '}',
      '#odi-p14a1b-console .card h4 {',
      '  margin: 0 0 6px; font-size: 11px; color: #ffd58a; font-weight: 700;',
      '  display: flex; align-items: center; justify-content: space-between;',
      '}',
      '#odi-p14a1b-console .grid { display: grid; grid-template-columns: 86px 1fr; gap: 3px 8px; font-size: 11px; }',
      '#odi-p14a1b-console .grid .k { color: #8b95ad; }',
      '#odi-p14a1b-console .grid .v { color: #e6edf7; word-break: break-all; }',
      '#odi-p14a1b-console table { width: 100%; border-collapse: collapse; font-size: 11px; }',
      '#odi-p14a1b-console th, #odi-p14a1b-console td {',
      '  padding: 5px 6px; border-bottom: 1px dashed #2a3148; text-align: left; vertical-align: top;',
      '}',
      '#odi-p14a1b-console th { color: #8b95ad; font-weight: 600; background: #161c30; }',
      '#odi-p14a1b-console td .muted { color: #8b95ad; font-size: 10px; }',
      '#odi-p14a1b-console input[type=text], #odi-p14a1b-console input[type=email],',
      '#odi-p14a1b-console input[type=password], #odi-p14a1b-console select {',
      '  background: #141a2c; color: #e6edf7; border: 1px solid #2a3148;',
      '  border-radius: 4px; padding: 4px 6px; font-size: 11px;',
      '  width: 100%; box-sizing: border-box;',
      '}',
      '#odi-p14a1b-console label { color: #8b95ad; font-size: 11px; }',
      '#odi-p14a1b-console .x {',
      '  background: #1f2740; color: #dde2ec; border: 1px solid #2a3148;',
      '  border-radius: 4px; padding: 4px 9px; font-size: 11px; cursor: pointer; margin: 0 2px;',
      '}',
      '#odi-p14a1b-console .x:hover { background: #2a3148; }',
      '#odi-p14a1b-console .x:disabled { opacity: 0.4; cursor: not-allowed; }',
      '#odi-p14a1b-console .x.primary { background: #2b4a8c; border-color: #3863b8; color: #fff; }',
      '#odi-p14a1b-console .x.danger  { background: #7a2f2f; border-color: #a64545; color: #fff; }',
      '#odi-p14a1b-console .x.subtle  { background: transparent; border-color: transparent; color: #a4adc4; }',
      '#odi-p14a1b-console .form-row {',
      '  display: grid; grid-template-columns: 100px 1fr; gap: 4px 8px;',
      '  align-items: center; margin-bottom: 4px;',
      '}',
      '#odi-p14a1b-console .form-row.full { grid-template-columns: 1fr; }',
      '#odi-p14a1b-console .msg { margin-top: 6px; padding: 5px 8px; border-radius: 4px; font-size: 10px; min-height: 14px; }',
      '#odi-p14a1b-console .msg.ok { background: rgba(90,255,150,0.08); color: #8bff9c; }',
      '#odi-p14a1b-console .msg.err { background: rgba(255,90,90,0.12); color: #ff8a8a; }',
      '#odi-p14a1b-console .muted { color: #8b95ad; font-size: 10px; }',
      '#odi-p14a1b-console .role-pill {',
      '  display: inline-block; padding: 1px 7px; border-radius: 9px;',
      '  font-size: 10px; font-weight: 700; color: #fff;',
      '}',
      '#odi-p14a1b-console .role-pill.r-super_admin { background: #6a2f7a; }',
      '#odi-p14a1b-console .role-pill.r-admin { background: #2f7a4b; }',
      '#odi-p14a1b-console .role-pill.r-team { background: #2b4a8c; }',
      '#odi-p14a1b-console .role-pill.r-guest { background: #555; }',
      '#odi-p14a1b-console .status-pill {',
      '  display: inline-block; padding: 1px 6px; border-radius: 8px;',
      '  font-size: 10px; font-weight: 600;',
      '}',
      '#odi-p14a1b-console .status-pill.active { background: rgba(90,255,150,0.15); color: #8bff9c; }',
      '#odi-p14a1b-console .status-pill.disabled { background: rgba(255,90,90,0.15); color: #ff8a8a; }',
      // 모달
      '.odi-p14a1b-modal-bg {',
      '  position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 99999;',
      '  display: flex; align-items: center; justify-content: center;',
      '}',
      '.odi-p14a1b-modal {',
      '  background: #0f1320; color: #dde2ec; border: 1px solid #2a3148;',
      '  border-radius: 10px; padding: 18px 20px; width: 420px; max-width: 92vw;',
      '  font-family: system-ui, Pretendard, "Segoe UI", sans-serif; font-size: 12px;',
      '  max-height: 88vh; overflow: auto;',
      '}',
      '.odi-p14a1b-modal h3 { margin: 0 0 10px; font-size: 14px; color: #bcd2ff; }',
      // 검색 / 필터
      '#odi-p14a1b-console .search {',
      '  display: flex; gap: 4px; margin-bottom: 6px;',
      '}',
      '#odi-p14a1b-console .search input { flex: 1; }',
      '#odi-p14a1b-console .search select { width: 90px; flex: 0 0 auto; }',
      // 고급 진단
      '#odi-p14a1b-console .adv summary {',
      '  cursor: pointer; color: #a4adc4; font-size: 11px; padding: 4px 0;',
      '  user-select: none; outline: none;',
      '}',
      '#odi-p14a1b-console .adv pre {',
      '  background: #0a0e1a; color: #dde2ec; padding: 6px 8px; border-radius: 4px;',
      '  font-size: 10px; max-height: 180px; overflow: auto;',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  // ───────── 콘솔 빌드 ─────────
  function buildConsole(){
    if (document.getElementById('odi-p14a1b-console')) return;
    var el = document.createElement('div');
    el.id = 'odi-p14a1b-console';
    el.className = 'min';
    el.innerHTML = ''
      + '<div class="head">'
      +   '<span>보안 / 권한 관리 콘솔</span>'
      +   '<span id="odi-p14a1b-tg">▾</span>'
      + '</div>'
      + '<div class="body">'
      +   '<div id="odi-p14a1b-me"></div>'
      +   '<div class="tabs">'
      +     '<button data-tab="users" class="active">사용자 관리</button>'
      +     '<button data-tab="perms">역할/권한</button>'
      +     '<button data-tab="audit">접속/작업 이력</button>'
      +     '<button data-tab="adv">고급 진단</button>'
      +   '</div>'
      +   '<div id="odi-p14a1b-tab"></div>'
      +   '<div class="msg" id="odi-p14a1b-msg"></div>'
      + '</div>';
    document.body.appendChild(el);
    el.querySelector('.head').addEventListener('click', function(){
      el.classList.toggle('min');
      var t = document.getElementById('odi-p14a1b-tg');
      if (t) t.textContent = el.classList.contains('min') ? '▾' : '▴';
    });
    el.querySelectorAll('.tabs button').forEach(function(b){
      b.addEventListener('click', function(){
        el.querySelectorAll('.tabs button').forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        renderTab(b.getAttribute('data-tab'));
      });
    });
  }

  function setMsg(text, ok){
    var e = document.getElementById('odi-p14a1b-msg');
    if (!e) return;
    e.className = 'msg ' + (ok ? 'ok' : (text ? 'err' : ''));
    e.textContent = text || '';
  }

  function renderMeCard(){
    var box = document.getElementById('odi-p14a1b-me');
    if (!box) return;
    var u = me();
    if (!u) { box.innerHTML = ''; return; }
    box.innerHTML = ''
      + '<div class="card">'
      +   '<h4>현재 로그인 사용자'
      +     '<button class="x subtle" id="odi-p14a1b-mychpw">비밀번호 변경</button>'
      +   '</h4>'
      +   '<div class="grid">'
      +     '<div class="k">아이디</div><div class="v">' + esc(u.username) + '</div>'
      +     '<div class="k">이름</div><div class="v">' + esc(u.display_name || '-') + '</div>'
      +     '<div class="k">역할</div><div class="v"><span class="role-pill r-' + esc(u.role) + '">' + esc(ROLE_KO[u.role] || u.role) + '</span></div>'
      +     '<div class="k">최근 로그인</div><div class="v">' + esc(fmtTime(u.last_login_at)) + '</div>'
      +   '</div>'
      + '</div>';
    var b = document.getElementById('odi-p14a1b-mychpw');
    if (b) b.addEventListener('click', openMyChangePassword);
  }

  function renderTab(tab){
    setMsg('');
    var box = document.getElementById('odi-p14a1b-tab');
    if (!box) return;
    if (tab === 'users') return renderUsersTab(box);
    if (tab === 'perms') return renderPermsTab(box);
    if (tab === 'audit') return renderAuditTab(box);
    if (tab === 'adv')   return renderAdvancedTab(box);
  }

  // ───────────────────────────────────────────────
  // ② 사용자 관리 탭
  // ───────────────────────────────────────────────
  function renderUsersTab(box){
    box.innerHTML = ''
      + '<div class="card">'
      +   '<h4>사용자 목록'
      +     '<button class="x primary" id="odi-p14a1b-uadd">사용자 추가</button>'
      +   '</h4>'
      +   '<div class="search">'
      +     '<input type="text" id="odi-p14a1b-usearch" placeholder="아이디/이름/이메일 검색" />'
      +     '<select id="odi-p14a1b-urole">'
      +       '<option value="">전체 역할</option>'
      +       '<option value="super_admin">슈퍼 관리자</option>'
      +       '<option value="admin">관리자</option>'
      +       '<option value="team">일반 팀원</option>'
      +       '<option value="guest">게스트</option>'
      +     '</select>'
      +     '<select id="odi-p14a1b-ustatus">'
      +       '<option value="">전체 상태</option>'
      +       '<option value="ACTIVE">활성</option>'
      +       '<option value="DISABLED">비활성</option>'
      +     '</select>'
      +   '</div>'
      +   '<div id="odi-p14a1b-utbl"><div class="muted">불러오는 중…</div></div>'
      + '</div>';

    document.getElementById('odi-p14a1b-uadd').addEventListener('click', openAddUserModal);
    ['odi-p14a1b-usearch','odi-p14a1b-urole','odi-p14a1b-ustatus'].forEach(function(id){
      document.getElementById(id).addEventListener('input', renderUserTable);
      document.getElementById(id).addEventListener('change', renderUserTable);
    });
    renderUserTable();
  }

  function renderUserTable(){
    var box = document.getElementById('odi-p14a1b-utbl');
    if (!box) return;
    box.innerHTML = '<div class="muted">불러오는 중…</div>';
    api('/api/admin/users').then(function(r){
      if (!r.ok) { setMsg('사용자 조회 실패: ' + (r.body && r.body.detail || r.status)); box.innerHTML = ''; return; }
      var rows = r.body.rows || [];
      var q = (document.getElementById('odi-p14a1b-usearch') || {}).value || '';
      var fr = (document.getElementById('odi-p14a1b-urole') || {}).value || '';
      var fs = (document.getElementById('odi-p14a1b-ustatus') || {}).value || '';
      q = q.trim().toLowerCase();
      var filtered = rows.filter(function(u){
        if (fr && u.role !== fr) return false;
        if (fs && u.status !== fs) return false;
        if (!q) return true;
        return (u.username || '').toLowerCase().indexOf(q) !== -1
            || (u.email || '').toLowerCase().indexOf(q) !== -1
            || (u.display_name || '').toLowerCase().indexOf(q) !== -1;
      });

      var canEditTarget = function(u){
        if (isSuper()) return true;
        // admin 은 super_admin 수정 불가
        return u.role !== 'super_admin' && u.role !== 'admin';
      };

      var html = '<table><thead><tr>'
        + '<th>아이디</th><th>이름</th><th>역할</th><th>상태</th><th>최근 로그인</th><th>관리</th>'
        + '</tr></thead><tbody>';
      if (!filtered.length) {
        html += '<tr><td colspan="6" class="muted" style="text-align:center;padding:10px">조건에 맞는 사용자가 없습니다.</td></tr>';
      } else {
        filtered.forEach(function(u){
          var canEdit = canEditTarget(u);
          html += '<tr>'
            + '<td><strong>' + esc(u.username) + '</strong>'
            +   (u.must_change_password ? '<div class="muted">⚠ 첫 로그인 시 비밀번호 변경 필요</div>' : '')
            + '</td>'
            + '<td>' + esc(u.display_name || '-')
            +   (u.email ? '<div class="muted">' + esc(u.email) + '</div>' : '')
            + '</td>'
            + '<td><span class="role-pill r-' + esc(u.role) + '">' + esc(ROLE_KO[u.role] || u.role) + '</span></td>'
            + '<td><span class="status-pill ' + (u.status === 'ACTIVE' ? 'active' : 'disabled') + '">'
            +   esc(STATUS_KO[u.status] || u.status) + '</span></td>'
            + '<td>' + esc(fmtTime(u.last_login_at)) + '</td>'
            + '<td>'
            +   '<button class="x" data-act="edit"  data-id="' + esc(u.id) + '"' + (canEdit ? '' : ' disabled') + '>편집</button>'
            +   '<button class="x" data-act="reset" data-id="' + esc(u.id) + '"' + (canEdit ? '' : ' disabled') + '>비밀번호 초기화</button>'
            + '</td>'
            + '</tr>';
        });
      }
      html += '</tbody></table>';
      box.innerHTML = html;

      box.querySelectorAll('[data-act=edit]').forEach(function(b){
        b.addEventListener('click', function(){ openEditUserModal(parseInt(b.getAttribute('data-id'), 10), filtered); });
      });
      box.querySelectorAll('[data-act=reset]').forEach(function(b){
        b.addEventListener('click', function(){ openResetPasswordModal(parseInt(b.getAttribute('data-id'), 10), filtered); });
      });
    });
  }

  // ───────── 모달 빌더 ─────────
  function openModal(html){
    closeModal();
    var bg = document.createElement('div');
    bg.className = 'odi-p14a1b-modal-bg';
    bg.innerHTML = '<div class="odi-p14a1b-modal">' + html + '</div>';
    document.body.appendChild(bg);
    bg.addEventListener('click', function(ev){
      if (ev.target === bg) closeModal();
    });
    return bg.querySelector('.odi-p14a1b-modal');
  }
  function closeModal(){
    var bg = document.querySelector('.odi-p14a1b-modal-bg');
    if (bg) bg.parentNode.removeChild(bg);
  }

  function openAddUserModal(){
    var canCreateAnyRole = isSuper();
    var roleOptions = canCreateAnyRole
      ? '<option value="team">일반 팀원</option><option value="guest">게스트</option><option value="admin">관리자</option><option value="super_admin">슈퍼 관리자</option>'
      : '<option value="team">일반 팀원</option><option value="guest">게스트</option>';

    var modal = openModal(
        '<h3>사용자 추가</h3>'
      + '<div class="form-row"><label>아이디</label><input type="text" id="u-add-username" /></div>'
      + '<div class="form-row"><label>이름</label><input type="text" id="u-add-display" placeholder="표시 이름" /></div>'
      + '<div class="form-row"><label>이메일</label><input type="email" id="u-add-email" /></div>'
      + '<div class="form-row"><label>초기 비밀번호</label><input type="password" id="u-add-pw" placeholder="8자 이상" /></div>'
      + '<div class="form-row"><label>역할</label><select id="u-add-role">' + roleOptions + '</select></div>'
      + '<div class="form-row"><label>상태</label><select id="u-add-status"><option value="ACTIVE">활성</option><option value="DISABLED">비활성</option></select></div>'
      + '<div class="form-row"><label></label><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="u-add-must" checked style="width:auto" /> 최초 로그인 후 비밀번호 변경 필요</label></div>'
      + (canCreateAnyRole ? '' : '<div class="muted" style="margin-top:6px">관리자는 일반 팀원 / 게스트 역할만 생성할 수 있습니다.</div>')
      + '<div style="margin-top:14px;text-align:right">'
      +   '<button class="x" id="u-add-cancel">취소</button>'
      +   '<button class="x primary" id="u-add-go">생성</button>'
      + '</div>'
      + '<div class="msg" id="u-add-msg"></div>'
    );
    modal.querySelector('#u-add-cancel').addEventListener('click', closeModal);
    modal.querySelector('#u-add-go').addEventListener('click', function(){
      var body = {
        username: modal.querySelector('#u-add-username').value.trim(),
        display_name: modal.querySelector('#u-add-display').value.trim() || null,
        email: modal.querySelector('#u-add-email').value.trim() || null,
        password: modal.querySelector('#u-add-pw').value,
        role: modal.querySelector('#u-add-role').value,
        must_change_password: modal.querySelector('#u-add-must').checked
      };
      var status = modal.querySelector('#u-add-status').value;
      var msg = modal.querySelector('#u-add-msg');

      if (body.username.length < 2) { msg.className = 'msg err'; msg.textContent = '아이디는 2자 이상이어야 합니다.'; return; }
      if (body.password.length < 8) { msg.className = 'msg err'; msg.textContent = '비밀번호는 8자 이상이어야 합니다.'; return; }

      msg.className = 'msg'; msg.textContent = '';
      api('/api/admin/users', { method: 'POST', body: JSON.stringify(body) }).then(function(r){
        if (!r.ok) {
          msg.className = 'msg err';
          msg.textContent = '생성 실패: ' + ((r.body && r.body.detail) || r.status);
          return;
        }
        var newId = r.body.user.id;
        if (status === 'DISABLED') {
          // 후속 활성/비활성 처리
          api('/api/admin/users/' + newId + '/status', { method: 'PATCH', body: JSON.stringify({ status: 'DISABLED' }) }).then(function(){});
        }
        closeModal();
        setMsg('사용자가 생성되었습니다.', true);
        renderUserTable();
      });
    });
  }

  function openEditUserModal(id, rows){
    var u = (rows || []).find(function(x){ return x.id === id; });
    if (!u) { setMsg('대상 사용자를 찾을 수 없습니다.'); return; }
    var canChangeRole = isSuper() && u.role !== 'super_admin' || (isSuper() && u.role === 'super_admin');
    // super_admin 이 자기 자신을 강등하려는 경우 서버가 막지만 UI 에서도 미리 방지
    var myId = (me() || {}).id;
    var isSelf = (myId === u.id);

    var roleOptions = ['super_admin','admin','team','guest'].map(function(rk){
      return '<option value="' + rk + '"' + (u.role === rk ? ' selected' : '') + '>' + ROLE_KO[rk] + '</option>';
    }).join('');

    var modal = openModal(
        '<h3>사용자 편집 — ' + esc(u.username) + '</h3>'
      + '<div class="form-row"><label>이름</label><input type="text" id="u-e-display" value="' + esc(u.display_name || '') + '" /></div>'
      + '<div class="form-row"><label>이메일</label><input type="email" id="u-e-email" value="' + esc(u.email || '') + '" /></div>'
      + (isSuper()
          ? '<div class="form-row"><label>역할</label><select id="u-e-role">' + roleOptions + '</select></div>'
            + '<div class="form-row"><label>상태</label><select id="u-e-status">'
            + '<option value="ACTIVE"' + (u.status==='ACTIVE'?' selected':'') + '>활성</option>'
            + '<option value="DISABLED"' + (u.status==='DISABLED'?' selected':'') + '>비활성</option>'
            + '</select></div>'
          : '<div class="muted" style="margin-top:6px">역할 / 상태 변경은 슈퍼 관리자만 가능합니다.</div>')
      + (isSelf ? '<div class="muted" style="color:#ffd58a">⚠ 본인 계정입니다. super_admin 권한 제거나 비활성은 차단됩니다.</div>' : '')
      + '<div style="margin-top:14px;text-align:right">'
      +   '<button class="x" id="u-e-cancel">취소</button>'
      +   '<button class="x primary" id="u-e-go">저장</button>'
      + '</div>'
      + '<div class="msg" id="u-e-msg"></div>'
    );
    modal.querySelector('#u-e-cancel').addEventListener('click', closeModal);
    modal.querySelector('#u-e-go').addEventListener('click', function(){
      var msg = modal.querySelector('#u-e-msg');
      msg.className = 'msg'; msg.textContent = '';

      var promises = [];
      // 1) 이름/이메일
      var pe = api('/api/admin/users/' + u.id, { method: 'PATCH', body: JSON.stringify({
        display_name: modal.querySelector('#u-e-display').value.trim() || null,
        email: modal.querySelector('#u-e-email').value.trim() || null
      })});
      promises.push(pe);

      // 2) 역할 변경 (super_admin 만)
      if (isSuper()) {
        var newRole = modal.querySelector('#u-e-role').value;
        if (newRole !== u.role) {
          promises.push(api('/api/admin/users/' + u.id + '/role', { method: 'PATCH', body: JSON.stringify({ role: newRole }) }));
        }
        var newStatus = modal.querySelector('#u-e-status').value;
        if (newStatus !== u.status) {
          promises.push(api('/api/admin/users/' + u.id + '/status', { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }));
        }
      }

      Promise.all(promises).then(function(results){
        var failed = results.filter(function(r){ return !r.ok; });
        if (failed.length) {
          msg.className = 'msg err';
          msg.textContent = '일부 항목 저장 실패: ' + failed.map(function(r){ return (r.body && r.body.detail) || r.status; }).join(' / ');
        } else {
          closeModal();
          setMsg('사용자 정보가 저장되었습니다.', true);
          renderUserTable();
        }
      });
    });
  }

  function openResetPasswordModal(id, rows){
    var u = (rows || []).find(function(x){ return x.id === id; });
    if (!u) { setMsg('대상 사용자를 찾을 수 없습니다.'); return; }

    var modal = openModal(
        '<h3>비밀번호 초기화 — ' + esc(u.username) + '</h3>'
      + '<div class="muted">초기화 후 해당 사용자의 모든 세션은 무효화됩니다.</div>'
      + '<div class="form-row" style="margin-top:8px"><label>새 비밀번호</label><input type="password" id="u-rp-pw" placeholder="8자 이상" /></div>'
      + '<div class="form-row"><label></label><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="u-rp-must" checked style="width:auto" /> 첫 로그인 시 비밀번호 변경 필요</label></div>'
      + '<div style="margin-top:14px;text-align:right">'
      +   '<button class="x" id="u-rp-cancel">취소</button>'
      +   '<button class="x primary" id="u-rp-go">초기화</button>'
      + '</div>'
      + '<div class="msg" id="u-rp-msg"></div>'
    );
    modal.querySelector('#u-rp-cancel').addEventListener('click', closeModal);
    modal.querySelector('#u-rp-go').addEventListener('click', function(){
      var pw = modal.querySelector('#u-rp-pw').value;
      var must = modal.querySelector('#u-rp-must').checked;
      var msg = modal.querySelector('#u-rp-msg');
      if (pw.length < 8) { msg.className = 'msg err'; msg.textContent = '비밀번호는 8자 이상이어야 합니다.'; return; }
      msg.className = 'msg'; msg.textContent = '';
      api('/api/admin/users/' + u.id + '/reset-password', {
        method: 'POST',
        body: JSON.stringify({ new_password: pw, require_change_on_next_login: must })
      }).then(function(r){
        if (!r.ok) {
          msg.className = 'msg err';
          msg.textContent = '초기화 실패: ' + ((r.body && r.body.detail) || r.status);
          return;
        }
        closeModal();
        setMsg('비밀번호가 초기화되었습니다. (무효화된 세션: ' + (r.body.sessions_revoked || 0) + ')', true);
        renderUserTable();
      });
    });
  }

  function openMyChangePassword(){
    var modal = openModal(
        '<h3>내 비밀번호 변경</h3>'
      + '<div class="form-row"><label>현재 비밀번호</label><input type="password" id="me-pw-cur" /></div>'
      + '<div class="form-row"><label>새 비밀번호</label><input type="password" id="me-pw-new" placeholder="8자 이상" /></div>'
      + '<div class="form-row"><label>새 비밀번호 (확인)</label><input type="password" id="me-pw-new2" /></div>'
      + '<div style="margin-top:14px;text-align:right">'
      +   '<button class="x" id="me-pw-cancel">취소</button>'
      +   '<button class="x primary" id="me-pw-go">변경</button>'
      + '</div>'
      + '<div class="msg" id="me-pw-msg"></div>'
    );
    modal.querySelector('#me-pw-cancel').addEventListener('click', closeModal);
    modal.querySelector('#me-pw-go').addEventListener('click', function(){
      var cur = modal.querySelector('#me-pw-cur').value;
      var n1 = modal.querySelector('#me-pw-new').value;
      var n2 = modal.querySelector('#me-pw-new2').value;
      var msg = modal.querySelector('#me-pw-msg');
      if (n1.length < 8) { msg.className = 'msg err'; msg.textContent = '새 비밀번호는 8자 이상이어야 합니다.'; return; }
      if (n1 !== n2)     { msg.className = 'msg err'; msg.textContent = '새 비밀번호 확인이 일치하지 않습니다.'; return; }
      if (n1 === cur)    { msg.className = 'msg err'; msg.textContent = '현재 비밀번호와 다른 값을 입력하세요.'; return; }
      api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: cur, new_password: n1 }) }).then(function(r){
        if (!r.ok) {
          msg.className = 'msg err';
          msg.textContent = '변경 실패: ' + ((r.body && r.body.detail) || r.status);
          return;
        }
        closeModal();
        setMsg('비밀번호가 변경되었습니다.', true);
      });
    });
  }

  // ───────────────────────────────────────────────
  // ③ 역할/권한 탭 (922 모듈에 위임)
  // ───────────────────────────────────────────────
  function renderPermsTab(box){
    box.innerHTML = '<div id="odi-p14a1b-perms-host"><div class="muted">권한 매트릭스 로딩 중…</div></div>';
    if (window.ODIPhase14A1BPermMatrix && typeof window.ODIPhase14A1BPermMatrix.render === 'function') {
      window.ODIPhase14A1BPermMatrix.render(document.getElementById('odi-p14a1b-perms-host'), {
        canEdit: isSuper(),
        onMessage: setMsg
      });
    } else {
      box.innerHTML = '<div class="card"><div class="muted">'
        + '922-role-permission-matrix.js 가 로드되지 않았습니다. admin/index.html 에서 스크립트 태그가 포함되었는지 확인하세요.'
        + '</div></div>';
    }
  }

  // ───────────────────────────────────────────────
  // ④ 접속/작업 이력 탭
  // ───────────────────────────────────────────────
  function renderAuditTab(box){
    box.innerHTML = ''
      + '<div class="card">'
      +   '<h4>접속 / 작업 이력'
      +     '<button class="x subtle" id="odi-p14a1b-audit-refresh">새로고침</button>'
      +   '</h4>'
      +   '<div class="search">'
      +     '<select id="odi-p14a1b-audit-filter">'
      +       '<option value="">전체 작업</option>'
      +     '</select>'
      +   '</div>'
      +   '<div id="odi-p14a1b-audit-list"><div class="muted">불러오는 중…</div></div>'
      + '</div>';
    document.getElementById('odi-p14a1b-audit-refresh').addEventListener('click', loadAudit);
    document.getElementById('odi-p14a1b-audit-filter').addEventListener('change', loadAudit);
    loadAudit();
  }

  function loadAudit(){
    var box = document.getElementById('odi-p14a1b-audit-list');
    if (!box) return;
    box.innerHTML = '<div class="muted">불러오는 중…</div>';
    var sel = document.getElementById('odi-p14a1b-audit-filter');
    var action = (sel && sel.value) || '';
    var path = '/api/admin/audit-logs?limit=100' + (action ? '&action=' + encodeURIComponent(action) : '');
    api(path).then(function(r){
      if (!r.ok) {
        // audit-logs API가 아직 추가 안된 baseline 에 대비한 placeholder
        if (r.status === 404) {
          box.innerHTML = '<div class="muted">감사 로그 API가 서버에 아직 적용되지 않았습니다. (Phase 14A-1B 서버 패치 적용 필요)</div>';
          return;
        }
        box.innerHTML = '<div class="muted" style="color:#ff8a8a">조회 실패: ' + esc((r.body && r.body.detail) || r.status) + '</div>';
        return;
      }
      var rows = r.body.rows || [];
      // 필터 옵션 채우기 (한 번만)
      if (sel && sel.children.length <= 1) {
        var labels = r.body.action_labels || {};
        Object.keys(labels).forEach(function(k){
          var opt = document.createElement('option');
          opt.value = k; opt.textContent = labels[k];
          sel.appendChild(opt);
        });
        if (action) sel.value = action;
      }
      if (!rows.length) {
        box.innerHTML = '<div class="muted">기록이 없습니다.</div>';
        return;
      }
      var html = '<table><thead><tr>'
        + '<th>시각</th><th>작업</th><th>대상</th><th>수행자</th><th>상세</th>'
        + '</tr></thead><tbody>';
      rows.forEach(function(e){
        var detail = e.detail
          ? '<code style="font-size:9px;color:#a4adc4">' + esc(JSON.stringify(e.detail)) + '</code>'
          : '-';
        html += '<tr>'
          + '<td>' + esc(fmtTime(e.created_at)) + '</td>'
          + '<td>' + esc(e.action_label || e.action) + '</td>'
          + '<td>' + esc(e.target || '-') + '</td>'
          + '<td>' + esc(e.actor_display_name || e.actor_username || (e.actor_user_id != null ? ('#' + e.actor_user_id) : '-')) + '</td>'
          + '<td>' + detail + '</td>'
          + '</tr>';
      });
      html += '</tbody></table>';
      box.innerHTML = html;
    });
  }

  // ───────────────────────────────────────────────
  // ⑤ 고급 진단 탭 (기본 닫힘 — 운영자 친화 표현, 절대 금지 단어 미사용)
  // ───────────────────────────────────────────────
  function renderAdvancedTab(box){
    box.innerHTML = ''
      + '<div class="card adv">'
      +   '<h4>고급 진단</h4>'
      +   '<details>'
      +     '<summary>서버 상태 확인 / 사용자 권한 점검 (개발자 모드)</summary>'
      +     '<div style="margin-top:8px">'
      +       '<button class="x" data-adv="health">서버 상태</button>'
      +       '<button class="x" data-adv="me">내 권한 정보</button>'
      +       '<button class="x" data-adv="roles">역할 목록</button>'
      +       '<pre id="odi-p14a1b-adv-out" style="margin-top:8px">출력 대기</pre>'
      +     '</div>'
      +   '</details>'
      + '</div>';

    function out(v){
      var o = document.getElementById('odi-p14a1b-adv-out');
      if (!o) return;
      if (typeof v === 'object') v = JSON.stringify(v, null, 2);
      o.textContent = String(v);
    }
    box.querySelectorAll('[data-adv]').forEach(function(b){
      b.addEventListener('click', function(){
        var k = b.getAttribute('data-adv');
        if (k === 'health')      api('/api/health').then(function(r){ out(r.body); });
        else if (k === 'me')     api('/api/auth/me').then(function(r){ out(r.body); });
        else if (k === 'roles')  api('/api/admin/roles').then(function(r){ out(r.body); });
      });
    });
  }

  // ───────── 초기화 ─────────
  function init(){
    if (!isAdminPortal()) return;  // /admin 경로에서만 표시
    document.addEventListener('odi:auth:ready', start);
    document.addEventListener('odi:auth:login', start);
    if (window.ODIPhase14AAuth && window.ODIPhase14AAuth.me()) start();
  }
  function start(){
    if (!isAdmin()) return;  // team/guest 는 콘솔 미표시
    injectStyle();
    buildConsole();
    renderMeCard();
    renderTab('users');
    // must_change_password 플래그가 켜져 있으면 비밀번호 변경 모달을 즉시 띄움
    var u = me();
    if (u && u.must_change_password) {
      setTimeout(openMyChangePassword, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
