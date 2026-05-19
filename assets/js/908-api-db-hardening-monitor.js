/* TechSysLab / ODI API DB Transition Hardening Monitor Phase 12
     * Purpose: show runtime diagnostics, backup state, and deployment-readiness warnings.
     * Read-only only. Does not hide menus, block routes, rewrite localStorage, or overwrite legacy UI data.
     */
    (function () {
      'use strict';
      var VERSION = 'API_SERVER_EXPANSION_PHASE_12_RELEASE_QA_REGRESSION_DEPLOY_CANDIDATE';
      var PANEL_ID = 'techsyslab-api-db-hardening-panel';
      var STYLE_ID = 'techsyslab-api-db-hardening-style';
      var state = { version: VERSION, status: 'INIT', runtime: null, backups: [], error: null, loadedAt: null };
      function api() { return window.TechSysLabApiClient || null; }
      function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]; }); }
      function arr(v) { return Array.isArray(v) ? v : []; }
      function num(v) { var n = Number(v || 0); return isFinite(n) ? n.toLocaleString('ko-KR') : '0'; }
      function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
          '#'+PANEL_ID+'{margin:14px 0;padding:0;border:1px solid rgba(99,102,241,.24);border-radius:16px;background:linear-gradient(180deg,rgba(99,102,241,.09),rgba(14,165,233,.06));box-shadow:0 12px 30px rgba(15,23,42,.07);color:var(--tp,#0f172a);font-size:12px;overflow:hidden}',
          '#'+PANEL_ID+' .hd{display:flex;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid rgba(148,163,184,.22);background:rgba(255,255,255,.58)}',
          '#'+PANEL_ID+' .dot{width:9px;height:9px;border-radius:50%;background:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.14)}',
          '#'+PANEL_ID+' .title{font-weight:900;letter-spacing:-.01em;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          '#'+PANEL_ID+' .badge{font-size:10.5px;padding:2px 8px;border-radius:999px;background:rgba(15,23,42,.08);color:var(--ts,#475569)}',
          '#'+PANEL_ID+' .body{padding:13px}',
          '#'+PANEL_ID+' .desc{margin:0 0 10px;color:var(--ts,#64748b)}',
          '#'+PANEL_ID+' .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}',
          '#'+PANEL_ID+' .kpi{border:1px solid rgba(148,163,184,.28);border-radius:13px;background:rgba(255,255,255,.72);padding:9px 10px}',
          '#'+PANEL_ID+' .kpi span{display:block;color:var(--ts,#64748b);font-size:11px}',
          '#'+PANEL_ID+' .kpi b{display:block;font-size:18px;line-height:1.15;margin-top:3px}',
          '#'+PANEL_ID+' .actions{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}',
          '#'+PANEL_ID+' button{border:1px solid rgba(99,102,241,.3);border-radius:10px;padding:7px 10px;background:rgba(255,255,255,.84);color:var(--tp,#0f172a);font:inherit;font-weight:800;cursor:pointer}',
          '#'+PANEL_ID+' button:hover{background:rgba(99,102,241,.13)}',
          '#'+PANEL_ID+' .warn{margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(245,158,11,.1);color:#92400e;border:1px solid rgba(245,158,11,.22)}',
          '#'+PANEL_ID+' .table-wrap{max-height:210px;overflow:auto;border:1px solid rgba(148,163,184,.25);border-radius:12px;background:rgba(255,255,255,.58)}',
          '#'+PANEL_ID+' table{width:100%;border-collapse:collapse;min-width:680px}',
          '#'+PANEL_ID+' th,#'+PANEL_ID+' td{padding:7px 8px;border-bottom:1px solid rgba(148,163,184,.18);text-align:left;white-space:nowrap}',
          '#'+PANEL_ID+' th{font-size:10.5px;color:var(--ts,#64748b);font-weight:900;background:rgba(248,250,252,.88);position:sticky;top:0}',
          '#'+PANEL_ID+' td{font-size:11.5px;max-width:260px;overflow:hidden;text-overflow:ellipsis}',
          'html.dark #'+PANEL_ID+',body.dark #'+PANEL_ID+',[data-theme="dark"] #'+PANEL_ID+'{background:linear-gradient(180deg,rgba(99,102,241,.16),rgba(14,165,233,.1));border-color:rgba(148,163,184,.3);color:#e5e7eb}',
          'html.dark #'+PANEL_ID+' .hd,body.dark #'+PANEL_ID+' .hd,[data-theme="dark"] #'+PANEL_ID+' .hd{background:rgba(15,23,42,.65)}',
          'html.dark #'+PANEL_ID+' .kpi,html.dark #'+PANEL_ID+' .table-wrap,body.dark #'+PANEL_ID+' .kpi,body.dark #'+PANEL_ID+' .table-wrap,[data-theme="dark"] #'+PANEL_ID+' .kpi,[data-theme="dark"] #'+PANEL_ID+' .table-wrap{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.28);color:#e5e7eb}',
          'html.dark #'+PANEL_ID+' button,body.dark #'+PANEL_ID+' button,[data-theme="dark"] #'+PANEL_ID+' button{background:rgba(30,41,59,.9);color:#e5e7eb;border-color:rgba(148,163,184,.35)}',
          '@media(max-width:980px){#'+PANEL_ID+' .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
          '@media(max-width:620px){#'+PANEL_ID+' .grid{grid-template-columns:1fr}}'
        ].join('\n');
        document.head.appendChild(style);
      }
      function findAnchor() { return document.getElementById('page-dashboard') || document.getElementById('page-download') || document.querySelector('main') || document.body; }
      function kpis() {
        var r = state.runtime || {};
        var db = r.db || {};
        var checks = r.checks || {};
        return [
          ['Runtime', r.status || state.status],
          ['DB Size', num(checks.dbSizeBytes || db.sizeBytes || 0)],
          ['Backups', num(r.backupCount || state.backups.length || 0)],
          ['Audit Events', num(db.serverAuditEventCount || 0)]
        ].map(function (kv) { return '<div class="kpi"><span>'+esc(kv[0])+'</span><b>'+esc(kv[1])+'</b></div>'; }).join('');
      }
      function rows() {
        var backups = arr(state.backups).slice(0, 8);
        if (!backups.length) return '<tr><td colspan="5">백업 파일이 없습니다. 운영 전 수동 백업 생성을 권장합니다.</td></tr>';
        return backups.map(function (b) { return '<tr><td>'+esc(b.name)+'</td><td>'+esc(b.scope || '')+'</td><td>'+esc(num(b.sizeBytes))+'</td><td>'+esc(b.modifiedAt || b.createdAt || '')+'</td><td>'+esc((b.sha256 || '').slice(0, 16))+'</td></tr>'; }).join('');
      }
      function render() {
        ensureStyle();
        var anchor = findAnchor(); if (!anchor) return false;
        var panel = document.getElementById(PANEL_ID);
        if (!panel) { panel = document.createElement('section'); panel.id = PANEL_ID; panel.setAttribute('data-techsyslab-hardening', 'phase12'); anchor.insertBefore(panel, anchor.firstChild); }
        var warnings = arr(state.runtime && state.runtime.warnings).concat(state.error ? [state.error] : []);
        panel.innerHTML = '<div class="hd"><span class="dot"></span><span class="title">API/DB Hardening Monitor</span><span class="badge">Phase 12</span><span class="badge">'+esc(state.status)+'</span></div>'+
          '<div class="body"><p class="desc">운영 배포 전 DB 경로, 백업, CORS, 쓰기 권한, 감사 로그 상태를 read-only로 표시합니다. 메뉴 숨김, route 차단, localStorage rewrite는 수행하지 않습니다.</p>'+
          '<div class="grid">'+kpis()+'</div><div class="actions"><button type="button" data-hd="reload">Reload diagnostics</button></div>'+
          '<div class="table-wrap"><table><thead><tr><th>Backup</th><th>Scope</th><th>Size</th><th>Modified</th><th>SHA256</th></tr></thead><tbody>'+rows()+'</tbody></table></div>'+
          (warnings.length ? '<div class="warn">'+esc(warnings.join(' / '))+'</div>' : '')+'</div>';
        var btn = panel.querySelector('[data-hd="reload"]'); if (btn) btn.onclick = load;
        return true;
      }
      async function load() {
        var client = api(); if (!client) { state.status='NO_CLIENT'; state.error='TechSysLabApiClient is unavailable.'; render(); return state; }
        try {
          state.status = 'LOADING'; state.error = null; render();
          var runtime = await client.get('/api/admin/maintenance/runtime');
          var backups = await client.get('/api/admin/maintenance/backups?limit=20');
          state.runtime = runtime; state.backups = arr(backups && backups.items); state.status = runtime.status || 'READY'; state.loadedAt = new Date().toISOString();
        } catch (err) { state.status='FAIL'; state.error = String(err && err.message || err); }
        render(); return state;
      }
      function init() { render(); setTimeout(load, 1200); }
      window.TechSysLabApiDbHardeningMonitor = { version: VERSION, state: state, load: load, render: render, diagnostics: function () { return JSON.parse(JSON.stringify(state)); } };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    })();
