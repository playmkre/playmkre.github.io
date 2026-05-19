/* TechSysLab / ODI CodeMaster DataReady Server Connect Phase 10
 * Purpose: show server CodeMaster and DataReady readiness without overwriting legacy UI.
 */
(function () {
  'use strict';

  var VERSION = 'API_SERVER_EXPANSION_PHASE_10_CODEMASTER_DATAREADY_SERVER_CONNECT';
  var PANEL_ID = 'techsyslab-codemaster-dataready-panel';
  var STYLE_ID = 'techsyslab-codemaster-dataready-style';
  var state = {
    version: VERSION,
    status: 'INIT',
    payload: null,
    codeRows: [],
    readinessRows: [],
    derivedRows: [],
    summary: null,
    lastError: null,
    lastLoadedAt: null
  };

  function api() { return window.TechSysLabApiClient || null; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]; }); }
  function num(v) { var n = Number(v || 0); return isFinite(n) ? n.toLocaleString('ko-KR') : '0'; }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#'+PANEL_ID+'{margin:14px 0;padding:0;border:1px solid rgba(16,185,129,.24);border-radius:16px;background:linear-gradient(180deg,rgba(16,185,129,.09),rgba(59,130,246,.06));box-shadow:0 12px 30px rgba(15,23,42,.07);color:var(--tp,#0f172a);font-size:12px;overflow:hidden}',
      '#'+PANEL_ID+' .cm-head{display:flex;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid rgba(148,163,184,.22);background:rgba(255,255,255,.58)}',
      '#'+PANEL_ID+' .cm-dot{width:9px;height:9px;border-radius:50%;background:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.14)}',
      '#'+PANEL_ID+' .cm-title{font-weight:900;letter-spacing:-.01em;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#'+PANEL_ID+' .cm-badge{font-size:10.5px;padding:2px 8px;border-radius:999px;background:rgba(15,23,42,.08);color:var(--ts,#475569)}',
      '#'+PANEL_ID+' .cm-body{padding:13px}',
      '#'+PANEL_ID+' .cm-desc{margin:0 0 10px;color:var(--ts,#64748b)}',
      '#'+PANEL_ID+' .cm-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}',
      '#'+PANEL_ID+' .cm-kpi{border:1px solid rgba(148,163,184,.28);border-radius:13px;background:rgba(255,255,255,.72);padding:9px 10px}',
      '#'+PANEL_ID+' .cm-kpi span{display:block;color:var(--ts,#64748b);font-size:11px}',
      '#'+PANEL_ID+' .cm-kpi b{display:block;font-size:18px;line-height:1.15;margin-top:3px}',
      '#'+PANEL_ID+' .cm-actions{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}',
      '#'+PANEL_ID+' button{border:1px solid rgba(16,185,129,.3);border-radius:10px;padding:7px 10px;background:rgba(255,255,255,.84);color:var(--tp,#0f172a);font:inherit;font-weight:800;cursor:pointer}',
      '#'+PANEL_ID+' button:hover{background:rgba(16,185,129,.13)}',
      '#'+PANEL_ID+' .cm-tables{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '#'+PANEL_ID+' .cm-table-card{border:1px solid rgba(148,163,184,.25);border-radius:12px;background:rgba(255,255,255,.58);overflow:hidden}',
      '#'+PANEL_ID+' .cm-table-title{padding:8px 10px;font-weight:900;border-bottom:1px solid rgba(148,163,184,.18)}',
      '#'+PANEL_ID+' .cm-table-wrap{max-height:220px;overflow:auto}',
      '#'+PANEL_ID+' table{width:100%;border-collapse:collapse;min-width:560px}',
      '#'+PANEL_ID+' th,#'+PANEL_ID+' td{padding:7px 8px;border-bottom:1px solid rgba(148,163,184,.18);text-align:left;white-space:nowrap}',
      '#'+PANEL_ID+' th{font-size:10.5px;color:var(--ts,#64748b);font-weight:900;background:rgba(248,250,252,.88);position:sticky;top:0}',
      '#'+PANEL_ID+' td{font-size:11.5px;max-width:240px;overflow:hidden;text-overflow:ellipsis}',
      '#'+PANEL_ID+' .cm-warn{margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(245,158,11,.1);color:#92400e;border:1px solid rgba(245,158,11,.22)}',
      'html.dark #'+PANEL_ID+',body.dark #'+PANEL_ID+',[data-theme="dark"] #'+PANEL_ID+'{background:linear-gradient(180deg,rgba(16,185,129,.16),rgba(59,130,246,.1));border-color:rgba(148,163,184,.3);color:#e5e7eb}',
      'html.dark #'+PANEL_ID+' .cm-head,body.dark #'+PANEL_ID+' .cm-head,[data-theme="dark"] #'+PANEL_ID+' .cm-head{background:rgba(15,23,42,.65)}',
      'html.dark #'+PANEL_ID+' .cm-kpi,html.dark #'+PANEL_ID+' .cm-table-card,body.dark #'+PANEL_ID+' .cm-kpi,body.dark #'+PANEL_ID+' .cm-table-card,[data-theme="dark"] #'+PANEL_ID+' .cm-kpi,[data-theme="dark"] #'+PANEL_ID+' .cm-table-card{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.28);color:#e5e7eb}',
      'html.dark #'+PANEL_ID+' button,body.dark #'+PANEL_ID+' button,[data-theme="dark"] #'+PANEL_ID+' button{background:rgba(30,41,59,.9);color:#e5e7eb;border-color:rgba(148,163,184,.35)}',
      '@media(max-width:980px){#'+PANEL_ID+' .cm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#'+PANEL_ID+' .cm-tables{grid-template-columns:1fr}}',
      '@media(max-width:620px){#'+PANEL_ID+' .cm-grid{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function findAnchor() {
    return document.getElementById('page-quality-master') || document.querySelector('[data-route="quality-master"]') || document.getElementById('page-dashboard') || document.body;
  }

  function kpis() {
    var cm = state.payload && state.payload.codeMaster && state.payload.codeMaster.summary || {};
    var dr = state.payload && state.payload.dataReadiness && state.payload.dataReadiness.summary || {};
    return [
      ['CodeMaster', cm.total || 0],
      ['Active Codes', cm.active || 0],
      ['Ready Items', dr.ready || 0],
      ['Avg Score', dr.averageScore || 0]
    ].map(function (kv) { return '<div class="cm-kpi"><span>'+esc(kv[0])+'</span><b>'+esc(num(kv[1]))+'</b></div>'; }).join('');
  }

  function codeRows() {
    var rows = arr(state.codeRows).slice(0, 12);
    if (!rows.length) return '<tr><td colspan="5">CodeMaster 기준정보가 없습니다. 예시 seed는 생성하지 않습니다.</td></tr>';
    return rows.map(function (r) {
      return '<tr><td>'+esc(r.code_type)+'</td><td>'+esc(r.code_key)+'</td><td>'+esc(r.code_label)+'</td><td>'+esc(r.code_value || '-')+'</td><td>'+esc(r.is_active ? 'ACTIVE' : 'INACTIVE')+'</td></tr>';
    }).join('');
  }

  function readinessRows() {
    var rows = arr(state.readinessRows).concat(arr(state.derivedRows)).slice(0, 12);
    if (!rows.length) return '<tr><td colspan="5">DataReady 항목이 없습니다.</td></tr>';
    return rows.map(function (r) {
      return '<tr><td>'+esc(r.component_key)+'</td><td>'+esc(r.component_label)+'</td><td>'+esc(r.status)+'</td><td>'+esc(num(r.readiness_score))+'</td><td>'+esc(r.source_scope || 'derived')+'</td></tr>';
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
      panel.setAttribute('data-techsyslab-codemaster-dataready', 'phase10');
      anchor.insertBefore(panel, anchor.firstChild);
    }
    var warnings = arr(state.payload && state.payload.warnings).concat(state.lastError ? [state.lastError] : []);
    panel.innerHTML = [
      '<div class="cm-head"><span class="cm-dot"></span><span class="cm-title">CodeMaster / DataReady Server Preview</span><span class="cm-badge">Phase 10</span><span class="cm-badge">'+esc(state.status)+'</span></div>',
      '<div class="cm-body">',
      '<p class="cm-desc">서버 기준정보와 데이터 준비 상태를 read-only로 표시합니다. 사용자 포털 route, 메뉴, localStorage 계약, 기존 화면 데이터는 덮어쓰지 않습니다.</p>',
      '<div class="cm-grid">'+kpis()+'</div>',
      '<div class="cm-actions"><button type="button" data-cm="reload">Reload CodeMaster/DataReady</button></div>',
      '<div class="cm-tables">',
      '<div class="cm-table-card"><div class="cm-table-title">CodeMaster 기준정보</div><div class="cm-table-wrap"><table><thead><tr><th>Type</th><th>Key</th><th>Label</th><th>Value</th><th>State</th></tr></thead><tbody>'+codeRows()+'</tbody></table></div></div>',
      '<div class="cm-table-card"><div class="cm-table-title">DataReady 상태</div><div class="cm-table-wrap"><table><thead><tr><th>Component</th><th>Label</th><th>Status</th><th>Score</th><th>Source</th></tr></thead><tbody>'+readinessRows()+'</tbody></table></div></div>',
      '</div>',
      warnings.length ? '<div class="cm-warn">'+esc(warnings.join(' / '))+'</div>' : '',
      '</div>'
    ].join('');
    var reload = panel.querySelector('[data-cm="reload"]');
    if (reload) reload.onclick = loadPreview;
    return true;
  }

  async function loadPreview() {
    var client = api();
    state.lastError = null;
    if (!client || !client.get) {
      state.status = 'FAIL';
      state.lastError = '900-api-client.js is not loaded.';
      render();
      return diagnostics();
    }
    try {
      var payload = await client.get('/api/user/codemaster-dataready-preview', { timeoutMs: 9000 });
      state.payload = payload;
      state.status = payload && payload.status || 'READY';
      state.codeRows = arr(payload && payload.codeMaster && payload.codeMaster.rows);
      state.readinessRows = arr(payload && payload.dataReadiness && payload.dataReadiness.rows);
      state.derivedRows = arr(payload && payload.dataReadiness && payload.dataReadiness.derivedRows);
      state.summary = payload && payload.dataReadiness && payload.dataReadiness.summary || null;
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
      codeCount: arr(state.codeRows).length,
      readinessCount: arr(state.readinessRows).length,
      derivedReadinessCount: arr(state.derivedRows).length,
      summary: state.summary,
      lastError: state.lastError,
      lastLoadedAt: state.lastLoadedAt,
      policy: { readOnlyForUserPortal: true, noRouteGuard: true, noMenuHide: true, noLocalStorageRewrite: true, noSeedData: true }
    }));
  }

  window.TechSysLabCodeMasterDataReady = { version: VERSION, state: state, render: render, loadPreview: loadPreview, diagnostics: diagnostics };
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(render, 4100);
    setTimeout(loadPreview, 4600);
  });
})();
