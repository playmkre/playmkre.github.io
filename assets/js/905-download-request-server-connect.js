/* TechSysLab / ODI Download Request Server Connect Phase 10
 * Scope: create read-only/status download request bridge against FastAPI server.
 * Non-goals: no actual file download, no route guard, no menu hide, no localStorage contract rewrite.
 */
(function () {
  'use strict';

  var VERSION = 'API_SERVER_EXPANSION_PHASE_10_CODEMASTER_DATAREADY_SERVER_CONNECT';
  var STYLE_ID = 'techsyslab-download-request-style';
  var PANEL_ID = 'techsyslab-download-request-panel';
  var state = {
    version: VERSION,
    status: 'INIT',
    message: '다운로드 요청 서버 연결 대기',
    apiBase: null,
    payload: null,
    requests: [],
    summary: null,
    lastError: null,
    lastLoadedAt: null
  };

  function api() { return window.TechSysLabApiClient || null; }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function safeArray(value) { return Array.isArray(value) ? value : []; }
  function numberText(value) { var n = Number(value || 0); try { return n.toLocaleString('ko-KR'); } catch (err) { return String(n); } }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#'+PANEL_ID+'{margin:0 0 16px 0;border:1px solid rgba(59,130,246,.26);border-radius:16px;background:linear-gradient(180deg,rgba(59,130,246,.08),rgba(16,185,129,.045));box-shadow:0 10px 26px rgba(15,23,42,.07);font:12px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--tp,#0f172a);overflow:hidden}',
      '#'+PANEL_ID+' .drp-head{display:flex;align-items:center;gap:10px;padding:11px 13px;border-bottom:1px solid rgba(148,163,184,.22)}',
      '#'+PANEL_ID+' .drp-dot{width:9px;height:9px;border-radius:99px;background:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.16)}',
      '#'+PANEL_ID+'.empty .drp-dot{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.16)}',
      '#'+PANEL_ID+'.fail .drp-dot{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.16)}',
      '#'+PANEL_ID+' .drp-title{font-weight:900;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#'+PANEL_ID+' .drp-badge{font-size:10.5px;padding:2px 8px;border-radius:999px;background:rgba(15,23,42,.08);color:var(--ts,#475569)}',
      '#'+PANEL_ID+' .drp-body{padding:13px}',
      '#'+PANEL_ID+' .drp-desc{color:var(--ts,#64748b);margin:0 0 10px 0}',
      '#'+PANEL_ID+' .drp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}',
      '#'+PANEL_ID+' .drp-kpi{border:1px solid rgba(148,163,184,.28);border-radius:13px;background:rgba(255,255,255,.7);padding:9px 10px}',
      '#'+PANEL_ID+' .drp-kpi span{display:block;color:var(--ts,#64748b);font-size:11px}',
      '#'+PANEL_ID+' .drp-kpi b{display:block;font-size:18px;line-height:1.1;margin-top:3px}',
      '#'+PANEL_ID+' .drp-form{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin:10px 0}',
      '#'+PANEL_ID+' input,#'+PANEL_ID+' select,#'+PANEL_ID+' textarea{border:1px solid rgba(148,163,184,.35);border-radius:10px;padding:7px 8px;background:rgba(255,255,255,.82);color:var(--tp,#0f172a);font:inherit;min-width:0}',
      '#'+PANEL_ID+' textarea{grid-column:span 2;min-height:34px;resize:vertical}',
      '#'+PANEL_ID+' button{border:1px solid rgba(59,130,246,.28);border-radius:10px;padding:7px 10px;background:rgba(255,255,255,.82);color:var(--tp,#0f172a);font:inherit;font-weight:800;cursor:pointer}',
      '#'+PANEL_ID+' button:hover{background:rgba(59,130,246,.13)}',
      '#'+PANEL_ID+' .drp-table-wrap{max-height:260px;overflow:auto;border:1px solid rgba(148,163,184,.25);border-radius:12px;background:rgba(255,255,255,.58)}',
      '#'+PANEL_ID+' table{width:100%;border-collapse:collapse;min-width:720px}',
      '#'+PANEL_ID+' th,#'+PANEL_ID+' td{padding:7px 8px;border-bottom:1px solid rgba(148,163,184,.18);text-align:left;white-space:nowrap}',
      '#'+PANEL_ID+' th{font-size:10.5px;color:var(--ts,#64748b);font-weight:800;background:rgba(248,250,252,.88);position:sticky;top:0}',
      '#'+PANEL_ID+' td{font-size:11.5px;max-width:230px;overflow:hidden;text-overflow:ellipsis}',
      '#'+PANEL_ID+' .drp-warn{margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(245,158,11,.1);color:#92400e;border:1px solid rgba(245,158,11,.22)}',
      'html.dark #'+PANEL_ID+',body.dark #'+PANEL_ID+',[data-theme="dark"] #'+PANEL_ID+'{background:linear-gradient(180deg,rgba(59,130,246,.14),rgba(16,185,129,.09));border-color:rgba(148,163,184,.3);color:#e5e7eb}',
      'html.dark #'+PANEL_ID+' .drp-kpi,html.dark #'+PANEL_ID+' .drp-table-wrap,body.dark #'+PANEL_ID+' .drp-kpi,body.dark #'+PANEL_ID+' .drp-table-wrap,[data-theme="dark"] #'+PANEL_ID+' .drp-kpi,[data-theme="dark"] #'+PANEL_ID+' .drp-table-wrap{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.28);color:#e5e7eb}',
      'html.dark #'+PANEL_ID+' input,html.dark #'+PANEL_ID+' select,html.dark #'+PANEL_ID+' textarea,html.dark #'+PANEL_ID+' button,body.dark #'+PANEL_ID+' input,body.dark #'+PANEL_ID+' select,body.dark #'+PANEL_ID+' textarea,body.dark #'+PANEL_ID+' button,[data-theme="dark"] #'+PANEL_ID+' input,[data-theme="dark"] #'+PANEL_ID+' select,[data-theme="dark"] #'+PANEL_ID+' textarea,[data-theme="dark"] #'+PANEL_ID+' button{background:rgba(30,41,59,.9);color:#e5e7eb;border-color:rgba(148,163,184,.35)}',
      '@media(max-width:980px){#'+PANEL_ID+' .drp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#'+PANEL_ID+' .drp-form{grid-template-columns:1fr 1fr}#'+PANEL_ID+' textarea{grid-column:span 2}}',
      '@media(max-width:620px){#'+PANEL_ID+' .drp-grid,#'+PANEL_ID+' .drp-form{grid-template-columns:1fr}#'+PANEL_ID+' textarea{grid-column:span 1}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function findDownloadPage() { return document.getElementById('page-download') || document.querySelector('[data-route="download"]') || document.body; }

  function statusClass() { return state.status === 'READY' ? 'ready' : state.status === 'EMPTY' ? 'empty' : state.status === 'FAIL' ? 'fail' : 'empty'; }

  function summaryKpis() {
    var s = state.summary || {};
    return [
      ['전체 요청', s.total || 0],
      ['승인 대기', s.pending || 0],
      ['승인 완료', s.approved || 0],
      ['표시 행', safeArray(state.requests).length]
    ].map(function (kv) { return '<div class="drp-kpi"><span>'+escapeHtml(kv[0])+'</span><b>'+escapeHtml(numberText(kv[1]))+'</b></div>'; }).join('');
  }

  function requestRows() {
    var rows = safeArray(state.requests);
    if (!rows.length) return '<tr><td colspan="7">다운로드 요청이 없습니다. 아래 입력으로 요청을 생성할 수 있습니다.</td></tr>';
    return rows.map(function (r) {
      return '<tr><td>'+escapeHtml(r.id)+'</td><td>'+escapeHtml(r.request_type)+'</td><td>'+escapeHtml(r.requester_name || '-')+'</td><td>'+escapeHtml(r.requester_email || '-')+'</td><td>'+escapeHtml(r.status)+'</td><td>'+escapeHtml(r.requested_at || '-')+'</td><td>'+escapeHtml(r.admin_note || '-')+'</td></tr>';
    }).join('');
  }

  function render() {
    var page = findDownloadPage();
    if (!page) return false;
    ensureStyle();
    var panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = PANEL_ID;
      panel.setAttribute('data-techsyslab-download-request-server-connect', 'phase10');
      var header = page.querySelector(':scope > .pg-hd');
      if (header && header.parentNode) header.parentNode.insertBefore(panel, header.nextSibling);
      else page.insertBefore(panel, page.firstChild);
    }
    panel.className = statusClass();
    panel.innerHTML = [
      '<div class="drp-head"><span class="drp-dot"></span><span class="drp-title">다운로드 요청 서버 연결</span><span class="drp-badge">Phase 10</span><span class="drp-badge">'+escapeHtml(state.status)+'</span></div>',
      '<div class="drp-body">',
      '<p class="drp-desc">사용자 요청과 관리자 승인/반려/만료 상태를 서버 DB 기준으로 확인합니다. 실제 파일 다운로드 제공은 아직 적용하지 않습니다.</p>',
      '<div class="drp-grid">'+summaryKpis()+'</div>',
      '<div class="drp-form">',
      '<select id="drp-type"><option value="schedule">생산일정</option><option value="quality">품질</option><option value="dashboard">대시보드</option><option value="report">보고서</option><option value="mixed">복합</option></select>',
      '<input id="drp-name" placeholder="요청자명">',
      '<input id="drp-email" placeholder="요청자 이메일">',
      '<input id="drp-target" placeholder="대상/범위">',
      '<textarea id="drp-reason" placeholder="요청 사유"></textarea>',
      '<button type="button" data-drp="create">요청 생성</button>',
      '<button type="button" data-drp="reload">상태 새로고침</button>',
      '</div>',
      '<div class="drp-table-wrap"><table><thead><tr><th>요청ID</th><th>구분</th><th>요청자</th><th>이메일</th><th>상태</th><th>요청시각</th><th>관리자 메모</th></tr></thead><tbody>'+requestRows()+'</tbody></table></div>',
      state.lastError ? '<div class="drp-warn">'+escapeHtml(state.lastError)+'</div>' : '',
      '</div>'
    ].join('');
    var create = panel.querySelector('[data-drp="create"]');
    if (create) create.onclick = createRequestFromForm;
    var reload = panel.querySelector('[data-drp="reload"]');
    if (reload) reload.onclick = loadRequests;
    return true;
  }

  async function loadRequests() {
    var client = api();
    state.apiBase = client && client.getApiBase ? client.getApiBase() : null;
    state.lastError = null;
    if (!client || !client.get) {
      state.status = 'FAIL';
      state.message = '900-api-client.js가 로드되지 않았습니다.';
      state.lastError = state.message;
      render();
      return diagnostics();
    }
    try {
      var payload = await client.get('/api/user/download-requests?limit=50', { timeoutMs: 9000 });
      state.payload = payload;
      state.requests = safeArray(payload && payload.rows);
      state.summary = payload && payload.summary || null;
      state.status = state.requests.length ? 'READY' : 'EMPTY';
      state.message = state.requests.length ? '다운로드 요청 상태를 서버에서 조회했습니다.' : '다운로드 요청이 없습니다.';
    } catch (err) {
      state.status = 'FAIL';
      state.message = '다운로드 요청 조회 실패. 기존 화면은 유지됩니다.';
      state.lastError = String(err && err.message || err);
    }
    state.lastLoadedAt = new Date().toISOString();
    render();
    return diagnostics();
  }

  async function createRequestFromForm() {
    var client = api();
    if (!client || !client.postJson) return diagnostics();
    var body = {
      requestType: (document.getElementById('drp-type') || {}).value || 'report',
      targetScope: (document.getElementById('drp-target') || {}).value || '',
      targetId: '',
      requesterName: (document.getElementById('drp-name') || {}).value || '',
      requesterEmail: (document.getElementById('drp-email') || {}).value || '',
      reason: (document.getElementById('drp-reason') || {}).value || '',
      payload: { source: 'user-portal-phase10', createdFrom: 'page-download' }
    };
    try {
      await client.postJson('/api/user/download-requests', body, { timeoutMs: 9000 });
      await loadRequests();
    } catch (err) {
      state.status = 'FAIL';
      state.lastError = String(err && err.message || err);
      render();
    }
    return diagnostics();
  }

  function diagnostics() {
    return JSON.parse(JSON.stringify({
      version: state.version,
      status: state.status,
      message: state.message,
      apiBase: state.apiBase,
      summary: state.summary,
      requestCount: safeArray(state.requests).length,
      lastError: state.lastError,
      lastLoadedAt: state.lastLoadedAt,
      policy: { noActualFileDownload: true, noRouteGuard: true, noMenuHide: true, noLocalStorageRewrite: true, noSeedData: true }
    }));
  }

  window.TechSysLabDownloadRequestBridge = {
    version: VERSION,
    state: state,
    render: render,
    loadRequests: loadRequests,
    createRequestFromForm: createRequestFromForm,
    diagnostics: diagnostics
  };

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(render, 2500);
    setTimeout(loadRequests, 3000);
  });
})();
