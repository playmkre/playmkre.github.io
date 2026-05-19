(function () {
  'use strict';

  var VERSION = 'API_SERVER_EXPANSION_PHASE_10_CODEMASTER_DATAREADY_SERVER_CONNECT';
  var PANEL_ID = 'techsyslab-permission-preview-panel';
  var STYLE_ID = 'techsyslab-permission-preview-panel-style';
  var state = {
    version: VERSION,
    status: 'INIT',
    apiBase: null,
    routeKey: 'download',
    payload: null,
    actions: [],
    summary: null,
    lastError: null,
    lastLoadedAt: null
  };

  function api() { return window.TechSysLabApiClient || null; }
  function safeArray(v) { return Array.isArray(v) ? v : []; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]; }); }
  function numberText(v) { var n = Number(v || 0); return isFinite(n) ? n.toLocaleString('ko-KR') : '0'; }
  function currentRouteKey() {
    var active = document.querySelector('.page.active[id^="page-"]') || document.querySelector('[data-route].active') || document.querySelector('[data-route="download"]');
    if (active) {
      var rid = active.getAttribute('data-route') || active.id || '';
      return rid.replace(/^page-/, '') || 'download';
    }
    var hash = String(location.hash || '').replace(/^#\/?/, '').trim();
    return hash || 'download';
  }
  function requesterEmail() {
    var field = document.getElementById('drp-email');
    return field && field.value ? field.value : '';
  }
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#'+PANEL_ID+'{margin:14px 0;padding:0;border:1px solid rgba(99,102,241,.22);border-radius:16px;background:linear-gradient(180deg,rgba(99,102,241,.09),rgba(14,165,233,.06));box-shadow:0 12px 30px rgba(15,23,42,.07);color:var(--tp,#0f172a);font-size:12px;overflow:hidden}',
      '#'+PANEL_ID+' .pp-head{display:flex;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid rgba(148,163,184,.22);background:rgba(255,255,255,.56)}',
      '#'+PANEL_ID+' .pp-dot{width:9px;height:9px;border-radius:50%;background:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.14)}',
      '#'+PANEL_ID+' .pp-title{font-weight:900;letter-spacing:-.01em;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#'+PANEL_ID+' .pp-badge{font-size:10.5px;padding:2px 8px;border-radius:999px;background:rgba(15,23,42,.08);color:var(--ts,#475569)}',
      '#'+PANEL_ID+' .pp-body{padding:13px}',
      '#'+PANEL_ID+' .pp-desc{margin:0 0 10px;color:var(--ts,#64748b)}',
      '#'+PANEL_ID+' .pp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}',
      '#'+PANEL_ID+' .pp-kpi{border:1px solid rgba(148,163,184,.28);border-radius:13px;background:rgba(255,255,255,.72);padding:9px 10px}',
      '#'+PANEL_ID+' .pp-kpi span{display:block;color:var(--ts,#64748b);font-size:11px}',
      '#'+PANEL_ID+' .pp-kpi b{display:block;font-size:18px;line-height:1.15;margin-top:3px}',
      '#'+PANEL_ID+' .pp-actions{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}',
      '#'+PANEL_ID+' button{border:1px solid rgba(99,102,241,.28);border-radius:10px;padding:7px 10px;background:rgba(255,255,255,.82);color:var(--tp,#0f172a);font:inherit;font-weight:800;cursor:pointer}',
      '#'+PANEL_ID+' button:hover{background:rgba(99,102,241,.13)}',
      '#'+PANEL_ID+' .pp-table-wrap{max-height:240px;overflow:auto;border:1px solid rgba(148,163,184,.25);border-radius:12px;background:rgba(255,255,255,.58)}',
      '#'+PANEL_ID+' table{width:100%;border-collapse:collapse;min-width:760px}',
      '#'+PANEL_ID+' th,#'+PANEL_ID+' td{padding:7px 8px;border-bottom:1px solid rgba(148,163,184,.18);text-align:left;white-space:nowrap}',
      '#'+PANEL_ID+' th{font-size:10.5px;color:var(--ts,#64748b);font-weight:900;background:rgba(248,250,252,.88);position:sticky;top:0}',
      '#'+PANEL_ID+' td{font-size:11.5px;max-width:280px;overflow:hidden;text-overflow:ellipsis}',
      '#'+PANEL_ID+' .pp-warn{margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(245,158,11,.1);color:#92400e;border:1px solid rgba(245,158,11,.22)}',
      '#'+PANEL_ID+' .pp-ok{color:#047857;font-weight:900}',
      '#'+PANEL_ID+' .pp-block{color:#b45309;font-weight:900}',
      'html.dark #'+PANEL_ID+',body.dark #'+PANEL_ID+',[data-theme="dark"] #'+PANEL_ID+'{background:linear-gradient(180deg,rgba(99,102,241,.16),rgba(14,165,233,.1));border-color:rgba(148,163,184,.3);color:#e5e7eb}',
      'html.dark #'+PANEL_ID+' .pp-head,body.dark #'+PANEL_ID+' .pp-head,[data-theme="dark"] #'+PANEL_ID+' .pp-head{background:rgba(15,23,42,.65)}',
      'html.dark #'+PANEL_ID+' .pp-kpi,html.dark #'+PANEL_ID+' .pp-table-wrap,body.dark #'+PANEL_ID+' .pp-kpi,body.dark #'+PANEL_ID+' .pp-table-wrap,[data-theme="dark"] #'+PANEL_ID+' .pp-kpi,[data-theme="dark"] #'+PANEL_ID+' .pp-table-wrap{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.28);color:#e5e7eb}',
      'html.dark #'+PANEL_ID+' button,body.dark #'+PANEL_ID+' button,[data-theme="dark"] #'+PANEL_ID+' button{background:rgba(30,41,59,.9);color:#e5e7eb;border-color:rgba(148,163,184,.35)}',
      '@media(max-width:980px){#'+PANEL_ID+' .pp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media(max-width:620px){#'+PANEL_ID+' .pp-grid{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }
  function findAnchor() {
    return document.getElementById('techsyslab-download-request-panel') || document.getElementById('page-download') || document.querySelector('[data-route="download"]') || document.body;
  }
  function kpis() {
    var s = state.summary || {};
    return [
      ['Actions', s.totalActions || 0],
      ['Allowed', s.allowedActions || 0],
      ['Blocked', s.blockedActions || 0],
      ['Approved DL', s.hasValidApprovedDownload ? 1 : 0]
    ].map(function (kv) { return '<div class="pp-kpi"><span>'+esc(kv[0])+'</span><b>'+esc(numberText(kv[1]))+'</b></div>'; }).join('');
  }
  function actionRows() {
    var rows = safeArray(state.actions);
    if (!rows.length) return '<tr><td colspan="5">No permission preview results.</td></tr>';
    return rows.map(function (r) {
      var cls = r.allowed ? 'pp-ok' : 'pp-block';
      return '<tr><td>'+esc(r.action)+'</td><td class="'+cls+'">'+esc(r.allowed ? 'ALLOW' : 'BLOCK')+'</td><td>'+esc(r.effectiveState || '-')+'</td><td>'+esc(r.mode || 'preview')+'</td><td>'+esc(r.reason || '-')+'</td></tr>';
    }).join('');
  }
  function render() {
    ensureStyle();
    var anchor = findAnchor();
    if (!anchor) return false;
    var panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = PANEL_ID;
      panel.setAttribute('data-techsyslab-permission-preview', 'phase10');
      if (anchor.id === 'techsyslab-download-request-panel') anchor.parentNode.insertBefore(panel, anchor.nextSibling);
      else anchor.insertBefore(panel, anchor.firstChild);
    }
    panel.innerHTML = [
      '<div class="pp-head"><span class="pp-dot"></span><span class="pp-title">Permission Preview / Button Level Restriction</span><span class="pp-badge">Phase 10</span><span class="pp-badge">'+esc(state.status)+'</span><span class="pp-badge">route='+esc(state.routeKey)+'</span></div>',
      '<div class="pp-body">',
      '<p class="pp-desc">Preview-only policy layer. It checks button/action states without hiding menus, blocking pages, or rewriting localStorage contracts.</p>',
      '<div class="pp-grid">'+kpis()+'</div>',
      '<div class="pp-actions"><button type="button" data-pp="reload">Reload Preview</button><button type="button" data-pp="download">Evaluate Download Page</button></div>',
      '<div class="pp-table-wrap"><table><thead><tr><th>Action</th><th>Decision</th><th>Effective State</th><th>Mode</th><th>Reason</th></tr></thead><tbody>'+actionRows()+'</tbody></table></div>',
      state.lastError ? '<div class="pp-warn">'+esc(state.lastError)+'</div>' : '',
      '</div>'
    ].join('');
    var reload = panel.querySelector('[data-pp="reload"]');
    if (reload) reload.onclick = loadPreview;
    var download = panel.querySelector('[data-pp="download"]');
    if (download) download.onclick = function () { loadPreview('download'); };
    return true;
  }
  async function loadPreview(routeKey) {
    var client = api();
    state.routeKey = routeKey || currentRouteKey() || 'download';
    state.apiBase = client && client.getApiBase ? client.getApiBase() : null;
    state.lastError = null;
    if (!client || !client.get) {
      state.status = 'FAIL';
      state.lastError = '900-api-client.js is not loaded.';
      render();
      return diagnostics();
    }
    try {
      var q = '/api/user/permission-preview?route_key=' + encodeURIComponent(state.routeKey) + '&page_id=' + encodeURIComponent(state.routeKey) + '&requester_email=' + encodeURIComponent(requesterEmail());
      var payload = await client.get(q, { timeoutMs: 9000 });
      state.payload = payload;
      state.actions = safeArray(payload && payload.actions);
      state.summary = payload && payload.summary || null;
      state.status = payload && payload.status || 'READY';
    } catch (err) {
      state.status = 'FAIL';
      state.lastError = String(err && err.message || err);
    }
    state.lastLoadedAt = new Date().toISOString();
    render();
    return diagnostics();
  }
  function diagnostics() {
    return JSON.parse(JSON.stringify({
      version: VERSION,
      status: state.status,
      apiBase: state.apiBase,
      routeKey: state.routeKey,
      summary: state.summary,
      actionCount: safeArray(state.actions).length,
      lastError: state.lastError,
      lastLoadedAt: state.lastLoadedAt,
      policy: { previewOnly: true, buttonLevelOnly: true, noRouteGuard: true, noMenuHide: true, noPageAccessBlock: true, noLocalStorageRewrite: true, noSeedData: true }
    }));
  }
  window.TechSysLabPermissionPreview = { version: VERSION, state: state, render: render, loadPreview: loadPreview, diagnostics: diagnostics };
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(render, 3300);
    setTimeout(function () { loadPreview('download'); }, 3800);
  });
})();
