/**
 * TechSysLab Phase 14D — User Portal Live Server Apply
 * 목적: 관리자 포털에서 업로드/DB 반영된 서버 데이터를 사용자 포털에서도 즉시 확인 가능하게 표시.
 * 서버 기준: https://api.techsyslab.com
 */
(function () {
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';
  var PANEL_ID = 'tsl-user-live-server-apply-panel';
  var STYLE_ID = 'tsl-user-live-server-apply-style';
  var AUTO_REFRESH_MS = 30000;

  function hasAccess() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1' ||
        document.documentElement.classList.contains('tsl-auth-unlocked');
    } catch (e) {
      return document.documentElement.classList.contains('tsl-auth-unlocked');
    }
  }

  function jsonFetch(path) {
    return fetch(API_BASE + path, { cache: 'no-store', credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error(path + ' HTTP ' + res.status);
        return res.json();
      });
  }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shortName(name) {
    var s = String(name || '-');
    return s.length > 44 ? s.slice(0, 44) + '…' : s;
  }

  function rowsOf(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.rows)) return payload.rows;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.summary && Array.isArray(payload.summary.rows)) return payload.summary.rows;
    return [];
  }

  function countFromHealth(health, key) {
    return health && health.db && typeof health.db[key] !== 'undefined' ? health.db[key] : 0;
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#'+PANEL_ID+'{box-sizing:border-box;width:min(1380px,calc(100% - 32px));margin:14px auto 18px;padding:16px;border:1px solid rgba(59,130,246,.35);border-radius:16px;background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(15,23,42,.9));color:#e5e7eb;box-shadow:0 16px 40px rgba(0,0,0,.22);font-family:inherit;}',
      '#'+PANEL_ID+' *{box-sizing:border-box;}',
      '#'+PANEL_ID+' .tsl-live-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}',
      '#'+PANEL_ID+' .tsl-live-title{font-weight:800;font-size:15px;letter-spacing:-.01em;}',
      '#'+PANEL_ID+' .tsl-live-sub{font-size:12px;color:#9ca3af;margin-top:4px;}',
      '#'+PANEL_ID+' .tsl-live-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;}',
      '#'+PANEL_ID+' button{border:1px solid rgba(148,163,184,.35);background:rgba(30,41,59,.9);color:#e5e7eb;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer;}',
      '#'+PANEL_ID+' button:hover{background:rgba(51,65,85,.95);}',
      '#'+PANEL_ID+' .tsl-live-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px;}',
      '#'+PANEL_ID+' .tsl-live-card{border:1px solid rgba(148,163,184,.22);background:rgba(2,6,23,.42);border-radius:14px;padding:12px;min-height:76px;}',
      '#'+PANEL_ID+' .tsl-live-label{font-size:11px;color:#94a3b8;margin-bottom:4px;}',
      '#'+PANEL_ID+' .tsl-live-value{font-size:24px;font-weight:900;line-height:1.1;color:#f8fafc;}',
      '#'+PANEL_ID+' .tsl-live-note{font-size:11px;color:#9ca3af;margin-top:6px;}',
      '#'+PANEL_ID+' .tsl-live-sections{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
      '#'+PANEL_ID+' .tsl-live-box{border:1px solid rgba(148,163,184,.22);background:rgba(2,6,23,.32);border-radius:14px;padding:12px;min-width:0;}',
      '#'+PANEL_ID+' .tsl-live-box h4{margin:0 0 8px;font-size:13px;color:#f8fafc;}',
      '#'+PANEL_ID+' table{width:100%;border-collapse:collapse;font-size:11px;}',
      '#'+PANEL_ID+' th,#'+PANEL_ID+' td{padding:6px 7px;border-bottom:1px solid rgba(148,163,184,.16);text-align:left;vertical-align:top;}',
      '#'+PANEL_ID+' th{color:#93c5fd;font-weight:800;background:rgba(30,41,59,.45);}',
      '#'+PANEL_ID+' td{color:#d1d5db;}',
      '#'+PANEL_ID+' .tsl-ok{color:#86efac;}',
      '#'+PANEL_ID+' .tsl-bad{color:#fca5a5;}',
      '#'+PANEL_ID+' .tsl-empty{padding:10px;border:1px dashed rgba(148,163,184,.3);border-radius:10px;color:#94a3b8;font-size:12px;}',
      '@media(max-width:900px){#'+PANEL_ID+' .tsl-live-grid{grid-template-columns:repeat(2,minmax(0,1fr));}#'+PANEL_ID+' .tsl-live-sections{grid-template-columns:1fr;}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensurePanel() {
    var panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    addStyle();
    panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.setAttribute('aria-label', '서버 DB 반영 현황');

    var overlay = document.getElementById('tsl-temp-login-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.insertBefore(panel, overlay.nextSibling);
    } else if (document.body.firstChild) {
      document.body.insertBefore(panel, document.body.firstChild);
    } else {
      document.body.appendChild(panel);
    }
    return panel;
  }

  function renderLoading() {
    ensurePanel().innerHTML = '<div class="tsl-live-head"><div><div class="tsl-live-title">서버 DB 반영 현황</div><div class="tsl-live-sub">관리자 포털 업로드 데이터를 사용자 포털에 불러오는 중입니다.</div></div></div><div class="tsl-empty">서버 데이터 로딩 중…</div>';
  }

  function renderError(err) {
    ensurePanel().innerHTML = [
      '<div class="tsl-live-head"><div><div class="tsl-live-title">서버 DB 반영 현황</div>',
      '<div class="tsl-live-sub tsl-bad">서버 데이터 연결 실패</div></div>',
      '<div class="tsl-live-actions"><button type="button" data-tsl-live-refresh>다시 불러오기</button></div></div>',
      '<div class="tsl-empty tsl-bad">api.techsyslab.com 연결 또는 서버 실행 상태를 확인하세요. ', esc(err && err.message ? err.message : err), '</div>'
    ].join('');
    bindRefresh();
  }

  function uploadRows(uploads) {
    var rows = rowsOf(uploads).slice(0, 6);
    if (!rows.length) return '<div class="tsl-empty">아직 업로드 이력이 없습니다.</div>';
    return ['<table><thead><tr><th>구분</th><th>파일</th><th>행</th><th>상태</th><th>시각</th></tr></thead><tbody>', rows.map(function (r) {
      return '<tr><td>'+esc(r.upload_type || '-')+'</td><td>'+esc(shortName(r.original_filename || '-'))+'</td><td>'+esc(r.row_count || 0)+'</td><td>'+esc(r.status || '-')+'</td><td>'+esc(r.uploaded_at || '-')+'</td></tr>';
    }).join(''), '</tbody></table>'].join('');
  }

  function genericTable(title, payload, fallbackText) {
    var rows = rowsOf(payload).slice(0, 6);
    if (!rows.length) return '<div class="tsl-live-box"><h4>'+esc(title)+'</h4><div class="tsl-empty">'+esc(fallbackText || '표시할 행이 없습니다.')+'</div></div>';
    var keys = [];
    rows.forEach(function (r) {
      Object.keys(r || {}).forEach(function (k) {
        if (keys.indexOf(k) < 0 && keys.length < 5 && !/id|raw|payload/i.test(k)) keys.push(k);
      });
    });
    if (!keys.length) keys = Object.keys(rows[0]).slice(0, 5);
    return ['<div class="tsl-live-box"><h4>'+esc(title)+'</h4><table><thead><tr>', keys.map(function(k){return '<th>'+esc(k)+'</th>';}).join(''), '</tr></thead><tbody>', rows.map(function(r){return '<tr>'+keys.map(function(k){return '<td>'+esc(shortName(r && r[k]))+'</td>';}).join('')+'</tr>';}).join(''), '</tbody></table></div>'].join('');
  }

  function render(data) {
    var health = data.health || {};
    var db = health.db || {};
    var updatedAt = new Date().toLocaleString('ko-KR');
    var scheduleCount = countFromHealth(health, 'scheduleRowCount');
    var qualityCount = countFromHealth(health, 'qualityIssueCount');
    var uploadCount = countFromHealth(health, 'uploadHistoryCount');
    var activeSource = countFromHealth(health, 'activeSourceFileCount');
    var panel = ensurePanel();
    panel.innerHTML = [
      '<div class="tsl-live-head">',
      '<div><div class="tsl-live-title">서버 DB 반영 현황 <span class="tsl-ok">● 연결됨</span></div>',
      '<div class="tsl-live-sub">관리자 포털 업로드 결과가 사용자 포털에 서버 DB 기준으로 표시됩니다. 마지막 확인: '+esc(updatedAt)+'</div></div>',
      '<div class="tsl-live-actions"><button type="button" data-tsl-live-refresh>새로고침</button><button type="button" data-tsl-live-open-admin>관리자 포털</button></div>',
      '</div>',
      '<div class="tsl-live-grid">',
      '<div class="tsl-live-card"><div class="tsl-live-label">생산일정 반영 행</div><div class="tsl-live-value">'+esc(scheduleCount)+'</div><div class="tsl-live-note">서버 schedule_rows 기준</div></div>',
      '<div class="tsl-live-card"><div class="tsl-live-label">품질/불량 반영 행</div><div class="tsl-live-value">'+esc(qualityCount)+'</div><div class="tsl-live-note">서버 quality_issues 기준</div></div>',
      '<div class="tsl-live-card"><div class="tsl-live-label">업로드 기록</div><div class="tsl-live-value">'+esc(uploadCount)+'</div><div class="tsl-live-note">이력은 누적 보관</div></div>',
      '<div class="tsl-live-card"><div class="tsl-live-label">활성 원본 파일</div><div class="tsl-live-value">'+esc(activeSource)+'</div><div class="tsl-live-note">source_files 원본 기준</div></div>',
      '</div>',
      '<div class="tsl-live-sections">',
      '<div class="tsl-live-box"><h4>최근 업로드 이력</h4>'+uploadRows(data.uploads)+'</div>',
      genericTable('최근 생산일정 데이터', data.scheduleRows, '생산일정 데이터가 아직 없습니다.'),
      genericTable('최근 품질/불량 데이터', data.qualityRows, '품질/불량 데이터가 아직 없습니다.'),
      '<div class="tsl-live-box"><h4>서버 기준</h4><table><tbody>',
      '<tr><th>DB</th><td>'+esc(db.path || '-')+'</td></tr>',
      '<tr><th>상태</th><td>'+esc(health.status || '-')+'</td></tr>',
      '<tr><th>버전</th><td>'+esc(health.version || '-')+'</td></tr>',
      '</tbody></table></div>',
      '</div>'
    ].join('');
    bindRefresh();
  }

  function bindRefresh() {
    var panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    var refresh = panel.querySelector('[data-tsl-live-refresh]');
    if (refresh) refresh.onclick = load;
    var admin = panel.querySelector('[data-tsl-live-open-admin]');
    if (admin) admin.onclick = function () { location.href = '/admin/?v=user-live-open'; };
  }

  function load() {
    if (!hasAccess()) return;
    renderLoading();
    Promise.allSettled([
      jsonFetch('/api/health'),
      jsonFetch('/api/public/uploads'),
      jsonFetch('/api/schedule?limit=6'),
      jsonFetch('/api/quality/issues?limit=6')
    ]).then(function (results) {
      if (results[0].status !== 'fulfilled') throw results[0].reason;
      render({
        health: results[0].value,
        uploads: results[1].status === 'fulfilled' ? results[1].value : null,
        scheduleRows: results[2].status === 'fulfilled' ? results[2].value : null,
        qualityRows: results[3].status === 'fulfilled' ? results[3].value : null
      });
    }).catch(renderError);
  }

  function boot() {
    if (hasAccess()) {
      load();
      if (!window.__tslUserLiveApplyTimer) {
        window.__tslUserLiveApplyTimer = setInterval(function () {
          if (hasAccess()) load();
        }, AUTO_REFRESH_MS);
      }
    }
  }

  window.TechSysLabUserPortalLiveApply = { refresh: load };
  document.addEventListener('tsl:gate-unlocked', boot);
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(boot, 250);
    setTimeout(boot, 1200);
  });
})();
