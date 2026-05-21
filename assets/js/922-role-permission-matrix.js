/* ============================================================================
 * ODI Admin Console — Phase 14A-1B Role / Permission Matrix
 * ============================================================================
 *
 * 역할 탭별로 페이지·메뉴·액션 권한 매트릭스를 표시하고 편집한다.
 *
 * API:
 *   GET   /api/admin/roles
 *   GET   /api/admin/permissions
 *   PATCH /api/admin/permissions
 *
 * 외부 진입점 (921 콘솔이 호출):
 *   window.ODIPhase14A1BPermMatrix.render(hostEl, { canEdit, onMessage })
 *
 * 권한:
 *   - super_admin: canEdit = true → 체크박스 활성, 저장 / 기본값 복원 버튼 활성
 *   - admin:       canEdit = false → 조회만, 체크박스 비활성
 *
 * 절대 금지 단어 미사용 (사용자 spec §8):
 *   기술 진단용 영문 키워드 / 내부 작업 단계 명칭은 운영자 UI에 노출하지 않는다.
 * ========================================================================== */
(function(){
  'use strict';
  if (window.__ODI_PHASE14A_1B_PERMS__) return;
  window.__ODI_PHASE14A_1B_PERMS__ = true;

  var ROLE_KO = {
    super_admin: '슈퍼 관리자',
    admin: '관리자',
    team: '일반 팀원',
    guest: '게스트'
  };

  // 권한 키별 운영자 친화 라벨
  var PAGE_LABEL = {
    'dashboard':         '대시보드',
    'schedule':          '생산일정',
    'download':          '다운로드',
    'quality-dash':      '품질 — 대시보드',
    'quality-main':      '품질 — 메인',
    'quality-analysis':  '품질 — 분석',
    'quality-action':    '품질 — 조치',
    'quality-images':    '품질 — 이미지',
    'quality-master':    '품질 — 마스터',
    'admin':             '관리자 포털',
    'admin-users':       '관리자 — 사용자',
    'admin-files':       '관리자 — 파일',
    'admin-permissions': '관리자 — 권한'
  };
  var ACTION_LABEL = {
    'files.upload':            '파일 업로드',
    'files.apply':             '파일 화면 적용',
    'files.download_original': '원본 파일 다운로드',
    'files.rollback':          '이전 적용으로 되돌리기',
    'users.manage':            '사용자 관리',
    'permissions.manage':      '권한 관리',
    'admin.view':              '관리자 포털 접근',
    'diagnostics.view':        '고급 진단 보기'
  };

  // 기본값 (서버 마이그레이션 seed와 일치)
  var DEFAULT_PERMS = {
    super_admin: {
      pages: { 'dashboard':[1,1], 'schedule':[1,1], 'download':[1,1],
               'quality-dash':[1,1], 'quality-main':[1,1], 'quality-analysis':[1,1],
               'quality-action':[1,1], 'quality-images':[1,1], 'quality-master':[1,1],
               'admin':[1,1], 'admin-users':[1,1], 'admin-files':[1,1], 'admin-permissions':[1,1] },
      actions: { 'files.upload':1, 'files.apply':1, 'files.download_original':1, 'files.rollback':1,
                 'users.manage':1, 'permissions.manage':1, 'admin.view':1, 'diagnostics.view':1 }
    },
    admin: {
      pages: { 'dashboard':[1,1], 'schedule':[1,1], 'download':[1,1],
               'quality-dash':[1,1], 'quality-main':[1,1], 'quality-analysis':[1,1],
               'quality-action':[1,1], 'quality-images':[1,1], 'quality-master':[1,1],
               'admin':[1,1], 'admin-users':[0,0], 'admin-files':[1,1], 'admin-permissions':[0,0] },
      actions: { 'files.upload':1, 'files.apply':1, 'files.download_original':1, 'files.rollback':1,
                 'users.manage':0, 'permissions.manage':0, 'admin.view':1, 'diagnostics.view':1 }
    },
    team: {
      pages: { 'dashboard':[1,0], 'schedule':[1,0], 'download':[1,0],
               'quality-dash':[1,0], 'quality-main':[1,0], 'quality-analysis':[1,0],
               'quality-action':[1,0], 'quality-images':[1,0], 'quality-master':[1,0],
               'admin':[0,0], 'admin-users':[0,0], 'admin-files':[0,0], 'admin-permissions':[0,0] },
      actions: { 'files.upload':0, 'files.apply':0, 'files.download_original':1, 'files.rollback':0,
                 'users.manage':0, 'permissions.manage':0, 'admin.view':0, 'diagnostics.view':0 }
    },
    guest: {
      pages: { 'dashboard':[1,0], 'schedule':[1,0], 'download':[0,0],
               'quality-dash':[0,0], 'quality-main':[0,0], 'quality-analysis':[0,0],
               'quality-action':[0,0], 'quality-images':[0,0], 'quality-master':[0,0],
               'admin':[0,0], 'admin-users':[0,0], 'admin-files':[0,0], 'admin-permissions':[0,0] },
      actions: { 'files.upload':0, 'files.apply':0, 'files.download_original':0, 'files.rollback':0,
                 'users.manage':0, 'permissions.manage':0, 'admin.view':0, 'diagnostics.view':0 }
    }
  };

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function api(path, opts){
    var g = window.ODIPhase14AAuth;
    if (g && typeof g.apiFetch === 'function') return g.apiFetch(path, opts);
    return fetch(path, Object.assign({ credentials: 'include' }, opts || {}))
      .then(function(r){ return r.json().then(function(b){ return { ok: r.ok, status: r.status, body: b }; }); });
  }

  var state = {
    permissions: null,    // 서버에서 받은 원본
    workingCopy: null,    // 편집 중 사본
    currentRole: 'super_admin',
    canEdit: false,
    onMessage: function(){}
  };

  function injectStyle(){
    if (document.getElementById('odi-p14a1b-perms-style')) return;
    var st = document.createElement('style');
    st.id = 'odi-p14a1b-perms-style';
    st.textContent = [
      '.p14a1b-perms { font-size: 11px; }',
      '.p14a1b-perms .role-tabs { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }',
      '.p14a1b-perms .role-tabs button {',
      '  padding: 5px 9px; font-size: 11px; cursor: pointer;',
      '  background: #1f2740; color: #a4adc4; border: 1px solid #2a3148; border-radius: 5px;',
      '}',
      '.p14a1b-perms .role-tabs button.active { background: #2b4a8c; border-color: #3863b8; color: #fff; }',
      '.p14a1b-perms .section-title {',
      '  color: #ffd58a; font-weight: 700; font-size: 11px; margin: 8px 0 4px;',
      '  padding-bottom: 3px; border-bottom: 1px solid #2a3148;',
      '}',
      '.p14a1b-perms .matrix {',
      '  display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 2px 6px;',
      '  align-items: center; font-size: 10px;',
      '}',
      '.p14a1b-perms .matrix.actions { grid-template-columns: 1.5fr 1fr; }',
      '.p14a1b-perms .matrix .h { color: #8b95ad; font-weight: 600; padding: 4px 0; }',
      '.p14a1b-perms .matrix .k {',
      '  color: #e6edf7; padding: 3px 0; border-bottom: 1px dashed #1e2438;',
      '}',
      '.p14a1b-perms .matrix .k .sub { color: #8b95ad; font-size: 9px; display: block; }',
      '.p14a1b-perms .matrix .cell {',
      '  display: flex; align-items: center; gap: 4px; padding: 3px 0;',
      '  border-bottom: 1px dashed #1e2438;',
      '}',
      '.p14a1b-perms .matrix input[type=checkbox] {',
      '  width: auto; margin: 0; cursor: pointer;',
      '}',
      '.p14a1b-perms .matrix input[type=checkbox]:disabled { cursor: not-allowed; }',
      '.p14a1b-perms .footer {',
      '  display: flex; gap: 6px; justify-content: flex-end; margin-top: 10px;',
      '  padding-top: 8px; border-top: 1px solid #2a3148;',
      '}',
      '.p14a1b-perms .changed { background: rgba(255,213,138,0.10); }',
      '.p14a1b-perms .diff-preview {',
      '  margin-top: 6px; padding: 6px 8px; background: #0a0e1a; border-radius: 4px;',
      '  font-size: 10px; color: #ffd58a; max-height: 100px; overflow: auto;',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function cloneSet(perms){
    return JSON.parse(JSON.stringify(perms));
  }

  function load(host){
    host.innerHTML = '<div style="color:#8b95ad">권한 매트릭스 로딩 중…</div>';
    api('/api/admin/permissions').then(function(r){
      if (!r.ok) {
        host.innerHTML = '<div style="color:#ff8a8a">권한 조회 실패: '
          + esc((r.body && r.body.detail) || r.status) + '</div>';
        return;
      }
      // 서버 형식: { permissions: { role_key: { pages:{key:{can_view,can_edit}}, menus:{key:{visible,enabled}}, actions:{key:bool} } } }
      state.permissions = r.body.permissions || {};
      state.workingCopy = cloneSet(state.permissions);
      renderUI(host);
    });
  }

  function renderUI(host){
    var roles = ['super_admin','admin','team','guest'];
    var html = '<div class="p14a1b-perms">'
      + '<div class="role-tabs">'
      + roles.map(function(rk){
          return '<button data-role="' + rk + '"' + (state.currentRole === rk ? ' class="active"' : '') + '>'
               + esc(ROLE_KO[rk]) + '</button>';
        }).join('')
      + '</div>'
      + '<div id="p14a1b-perms-body"></div>'
      + '<div class="footer">'
      +   (state.canEdit
          ? '<button class="x subtle" id="p14a1b-perms-reset">기본값 복원</button>'
            + '<button class="x" id="p14a1b-perms-discard">변경 취소</button>'
            + '<button class="x primary" id="p14a1b-perms-save">저장</button>'
          : '<span style="color:#8b95ad;font-size:10px">조회만 가능 — 슈퍼 관리자만 변경 가능</span>')
      + '</div>'
      + '<div class="diff-preview" id="p14a1b-perms-diff" style="display:none"></div>'
      + '</div>';
    host.innerHTML = html;

    host.querySelectorAll('[data-role]').forEach(function(b){
      b.addEventListener('click', function(){
        state.currentRole = b.getAttribute('data-role');
        renderUI(host);
      });
    });
    if (state.canEdit) {
      var btn;
      btn = host.querySelector('#p14a1b-perms-reset');
      if (btn) btn.addEventListener('click', function(){
        if (!confirm('현재 표시된 역할(' + ROLE_KO[state.currentRole] + ')의 권한을 기본값으로 되돌립니다. 저장 버튼을 누를 때까지 서버 반영은 되지 않습니다. 계속하시겠습니까?')) return;
        applyDefaults(state.currentRole);
        renderBody(host);
        renderDiff(host);
      });
      btn = host.querySelector('#p14a1b-perms-discard');
      if (btn) btn.addEventListener('click', function(){
        state.workingCopy = cloneSet(state.permissions);
        renderBody(host);
        renderDiff(host);
      });
      btn = host.querySelector('#p14a1b-perms-save');
      if (btn) btn.addEventListener('click', function(){ save(host); });
    }
    renderBody(host);
    renderDiff(host);
  }

  function applyDefaults(roleKey){
    var def = DEFAULT_PERMS[roleKey];
    if (!def || !state.workingCopy[roleKey]) return;
    // pages
    Object.keys(def.pages).forEach(function(pk){
      var pv = def.pages[pk];
      state.workingCopy[roleKey].pages = state.workingCopy[roleKey].pages || {};
      state.workingCopy[roleKey].pages[pk] = { can_view: !!pv[0], can_edit: !!pv[1] };
    });
    // actions
    Object.keys(def.actions).forEach(function(ak){
      state.workingCopy[roleKey].actions = state.workingCopy[roleKey].actions || {};
      state.workingCopy[roleKey].actions[ak] = !!def.actions[ak];
    });
  }

  function renderBody(host){
    var body = host.querySelector('#p14a1b-perms-body');
    if (!body) return;
    var rk = state.currentRole;
    var working = (state.workingCopy && state.workingCopy[rk]) || {};
    var original = (state.permissions && state.permissions[rk]) || {};
    var pages = working.pages || {};
    var actions = working.actions || {};
    var origPages = original.pages || {};
    var origActions = original.actions || {};

    var pageKeys = Object.keys(PAGE_LABEL);
    var actionKeys = Object.keys(ACTION_LABEL);

    var html = '<div class="section-title">페이지 권한 (총 ' + pageKeys.length + ' 항목)</div>'
      + '<div class="matrix">'
      +   '<div class="h">페이지</div><div class="h">조회 가능</div><div class="h">변경 가능</div>'
      + pageKeys.map(function(pk){
          var p = pages[pk] || { can_view: false, can_edit: false };
          var op = origPages[pk] || { can_view: false, can_edit: false };
          var changedView = !!p.can_view !== !!op.can_view;
          var changedEdit = !!p.can_edit !== !!op.can_edit;
          var disabled = state.canEdit ? '' : ' disabled';
          return '<div class="k">' + esc(PAGE_LABEL[pk]) + '<span class="sub">' + esc(pk) + '</span></div>'
            + '<div class="cell' + (changedView ? ' changed' : '') + '">'
            +   '<input type="checkbox" data-kind="page-view" data-pk="' + esc(pk) + '"' + (p.can_view ? ' checked' : '') + disabled + ' />'
            + '</div>'
            + '<div class="cell' + (changedEdit ? ' changed' : '') + '">'
            +   '<input type="checkbox" data-kind="page-edit" data-pk="' + esc(pk) + '"' + (p.can_edit ? ' checked' : '') + disabled + ' />'
            + '</div>';
        }).join('')
      + '</div>'
      + '<div class="section-title">버튼 / 작업 권한 (총 ' + actionKeys.length + ' 항목)</div>'
      + '<div class="matrix actions">'
      +   '<div class="h">작업</div><div class="h">허용</div>'
      + actionKeys.map(function(ak){
          var v = !!actions[ak];
          var ov = !!origActions[ak];
          var changed = v !== ov;
          var disabled = state.canEdit ? '' : ' disabled';
          return '<div class="k">' + esc(ACTION_LABEL[ak]) + '<span class="sub">' + esc(ak) + '</span></div>'
            + '<div class="cell' + (changed ? ' changed' : '') + '">'
            +   '<input type="checkbox" data-kind="action" data-ak="' + esc(ak) + '"' + (v ? ' checked' : '') + disabled + ' />'
            + '</div>';
        }).join('')
      + '</div>';
    body.innerHTML = html;

    if (!state.canEdit) return;
    body.querySelectorAll('input[type=checkbox]').forEach(function(cb){
      cb.addEventListener('change', function(){
        var kind = cb.getAttribute('data-kind');
        var roleObj = state.workingCopy[rk] = state.workingCopy[rk] || { pages:{}, actions:{} };
        if (kind === 'page-view') {
          var pk = cb.getAttribute('data-pk');
          roleObj.pages[pk] = roleObj.pages[pk] || { can_view: false, can_edit: false };
          roleObj.pages[pk].can_view = cb.checked;
          // 조회 권한 해제 시 변경 권한도 자동 해제
          if (!cb.checked) roleObj.pages[pk].can_edit = false;
        } else if (kind === 'page-edit') {
          var pk2 = cb.getAttribute('data-pk');
          roleObj.pages[pk2] = roleObj.pages[pk2] || { can_view: false, can_edit: false };
          roleObj.pages[pk2].can_edit = cb.checked;
          // 변경 권한 부여 시 조회 권한도 자동 부여
          if (cb.checked) roleObj.pages[pk2].can_view = true;
        } else if (kind === 'action') {
          var ak = cb.getAttribute('data-ak');
          roleObj.actions[ak] = cb.checked;
        }
        renderBody(host);
        renderDiff(host);
      });
    });
  }

  function diffEntries(){
    var entries = { pages: [], actions: [] };
    if (!state.workingCopy || !state.permissions) return entries;
    ['super_admin','admin','team','guest'].forEach(function(rk){
      var w = (state.workingCopy[rk] || {});
      var o = (state.permissions[rk] || {});
      Object.keys(PAGE_LABEL).forEach(function(pk){
        var wp = (w.pages || {})[pk] || { can_view: false, can_edit: false };
        var op = (o.pages || {})[pk] || { can_view: false, can_edit: false };
        if (!!wp.can_view !== !!op.can_view || !!wp.can_edit !== !!op.can_edit) {
          entries.pages.push({ role_key: rk, page_key: pk, can_view: wp.can_view ? 1 : 0, can_edit: wp.can_edit ? 1 : 0 });
        }
      });
      Object.keys(ACTION_LABEL).forEach(function(ak){
        var wv = !!(w.actions || {})[ak];
        var ov = !!(o.actions || {})[ak];
        if (wv !== ov) {
          entries.actions.push({ role_key: rk, action_key: ak, allowed: wv ? 1 : 0 });
        }
      });
    });
    return entries;
  }

  function renderDiff(host){
    var d = host.querySelector('#p14a1b-perms-diff');
    if (!d) return;
    var diff = diffEntries();
    var total = diff.pages.length + diff.actions.length;
    if (!total) {
      d.style.display = 'none';
      d.innerHTML = '';
      return;
    }
    d.style.display = 'block';
    var msg = '저장 대기 중인 변경사항: 페이지 ' + diff.pages.length + '건, 작업 ' + diff.actions.length + '건';
    if (state.canEdit) {
      msg += ' — 저장 버튼을 누르면 서버에 반영됩니다.';
    }
    d.textContent = msg;
  }

  function save(host){
    var diff = diffEntries();
    if (!diff.pages.length && !diff.actions.length) {
      state.onMessage('변경사항이 없습니다.', true);
      return;
    }
    if (!confirm('권한 변경 ' + (diff.pages.length + diff.actions.length) + '건을 서버에 저장합니다. 계속하시겠습니까?')) return;
    api('/api/admin/permissions', {
      method: 'PATCH',
      body: JSON.stringify({ pages: diff.pages, menus: [], actions: diff.actions })
    }).then(function(r){
      if (!r.ok) {
        state.onMessage('권한 저장 실패: ' + ((r.body && r.body.detail) || r.status));
        return;
      }
      state.onMessage('권한이 저장되었습니다. (페이지 ' + (r.body.updated.pages || 0)
        + ', 작업 ' + (r.body.updated.actions || 0) + ')', true);
      // 다시 로드
      load(host);
    });
  }

  // 외부 진입점
  window.ODIPhase14A1BPermMatrix = {
    render: function(host, opts){
      if (!host) return;
      injectStyle();
      state.canEdit = !!(opts && opts.canEdit);
      state.onMessage = (opts && opts.onMessage) || function(){};
      load(host);
    }
  };
})();
