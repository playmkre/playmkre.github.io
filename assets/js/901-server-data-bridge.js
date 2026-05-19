/* TechSysLab / ODI Server Data Bridge Phase 10
 * Scope: API health/dashboard/schedule/quality summary diagnostics plus read-only preview support.
 * Non-goals: no route guard, no menu hard hide, no permission block,
 * no schedule/quality data overwrite, no localStorage contract rewrite.
 */
(function () {
  'use strict';

  var VERSION = 'API_SERVER_EXPANSION_PHASE_10_CODEMASTER_DATAREADY_SERVER_CONNECT';
  var state = {
    version: VERSION,
    apiBase: null,
    health: null,
    dashboard: null,
    scheduleSummary: null,
    qualitySummary: null,
    status: 'INIT',
    message: 'API 진단 대기',
    lastCheckedAt: null,
    lastError: null
  };

  function ensureStyle() {
    if (document.getElementById('techsyslab-api-bridge-style')) return;
    var style = document.createElement('style');
    style.id = 'techsyslab-api-bridge-style';
    style.textContent = [
      '#techsyslab-api-bridge-badge{position:fixed;right:16px;bottom:16px;z-index:99990;min-width:210px;max-width:340px;border:1px solid rgba(148,163,184,.45);background:rgba(15,23,42,.92);color:#e5e7eb;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.25);font:12px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}',
      '#techsyslab-api-bridge-badge.min .tsb-body{display:none}',
      '#techsyslab-api-bridge-badge .tsb-head{display:flex;align-items:center;gap:8px;padding:9px 10px;cursor:pointer;user-select:none}',
      '#techsyslab-api-bridge-badge .tsb-dot{width:9px;height:9px;border-radius:99px;background:#94a3b8;box-shadow:0 0 0 3px rgba(148,163,184,.16)}',
      '#techsyslab-api-bridge-badge.ready .tsb-dot{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18)}',
      '#techsyslab-api-bridge-badge.warn .tsb-dot{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.18)}',
      '#techsyslab-api-bridge-badge.fail .tsb-dot{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.18)}',
      '#techsyslab-api-bridge-badge .tsb-title{font-weight:700;flex:1;white-space:nowrap}',
      '#techsyslab-api-bridge-badge .tsb-state{font-size:11px;color:#cbd5e1}',
      '#techsyslab-api-bridge-badge .tsb-body{border-top:1px solid rgba(148,163,184,.22);padding:9px 10px;color:#cbd5e1}',
      '#techsyslab-api-bridge-badge .tsb-row{display:flex;justify-content:space-between;gap:8px;margin:3px 0}',
      '#techsyslab-api-bridge-badge code{font-size:11px;color:#bfdbfe;word-break:break-all}',
      '#techsyslab-api-bridge-badge .tsb-actions{display:flex;gap:6px;margin-top:8px}',
      '#techsyslab-api-bridge-badge button{border:1px solid rgba(148,163,184,.35);border-radius:8px;background:rgba(30,41,59,.95);color:#e5e7eb;font:11px system-ui;padding:5px 7px;cursor:pointer}',
      '#techsyslab-api-bridge-badge button:hover{background:rgba(51,65,85,.95)}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function statusClass(status) {
    if (status === 'READY') return 'ready';
    if (status === 'WARN') return 'warn';
    if (status === 'FAIL') return 'fail';
    return '';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function countFromSummary(obj) {
    return obj && obj.summary && typeof obj.summary.total === 'number' ? obj.summary.total : 0;
  }

  function renderBadge() {
    ensureStyle();
    var el = document.getElementById('techsyslab-api-bridge-badge');
    if (!el) {
      el = document.createElement('div');
      el.id = 'techsyslab-api-bridge-badge';
      el.className = 'min';
      document.body.appendChild(el);
    }
    el.className = 'min ' + statusClass(state.status);
    var checked = state.lastCheckedAt ? new Date(state.lastCheckedAt).toLocaleTimeString() : '-';
    var dashboardStatus = state.dashboard && state.dashboard.status ? state.dashboard.status : '-';
    el.innerHTML = [
      '<div class="tsb-head" title="클릭해서 API 진단 상세 보기">',
      '<span class="tsb-dot"></span>',
      '<span class="tsb-title">API Server</span>',
      '<span class="tsb-state">' + escapeHtml(state.status) + '</span>',
      '</div>',
      '<div class="tsb-body">',
      '<div class="tsb-row"><span>Base</span><code>' + escapeHtml(state.apiBase || '-') + '</code></div>',
      '<div class="tsb-row"><span>Health</span><b>' + escapeHtml(state.health && state.health.status || '-') + '</b></div>',
      '<div class="tsb-row"><span>Dashboard</span><b>' + escapeHtml(dashboardStatus) + '</b></div>',
      '<div class="tsb-row"><span>Schedule rows</span><b>' + countFromSummary(state.scheduleSummary) + '</b></div>',
      '<div class="tsb-row"><span>Quality issues</span><b>' + countFromSummary(state.qualitySummary) + '</b></div>',
      '<div class="tsb-row"><span>Checked</span><b>' + escapeHtml(checked) + '</b></div>',
      '<div style="margin-top:6px">' + escapeHtml(state.message || '') + '</div>',
      state.lastError ? '<div style="margin-top:6px;color:#fecaca">' + escapeHtml(state.lastError) + '</div>' : '',
      '<div class="tsb-actions"><button type="button" data-tsb-action="refresh">다시 확인</button><button type="button" data-tsb-action="console">콘솔 출력</button></div>',
      '</div>'
    ].join('');
    var head = el.querySelector('.tsb-head');
    if (head) head.onclick = function () { el.classList.toggle('min'); };
    var refresh = el.querySelector('[data-tsb-action="refresh"]');
    if (refresh) refresh.onclick = function (ev) { ev.stopPropagation(); runDiagnostics(); };
    var con = el.querySelector('[data-tsb-action="console"]');
    if (con) con.onclick = function (ev) { ev.stopPropagation(); console.log('[TechSysLabServerBridge]', diagnostics()); };
  }

  async function runDiagnostics() {
    var api = window.TechSysLabApiClient;
    state.apiBase = api && api.getApiBase ? api.getApiBase() : null;
    state.status = 'WARN';
    state.message = 'API 서버 확인 중';
    state.lastError = null;
    state.lastCheckedAt = new Date().toISOString();
    renderBadge();

    if (!api || !api.get) {
      state.status = 'FAIL';
      state.message = '900-api-client.js가 로드되지 않았습니다.';
      state.lastError = 'TechSysLabApiClient missing';
      renderBadge();
      return diagnostics();
    }

    try {
      state.health = await api.get('/api/health', { timeoutMs: 6000 });
      state.dashboard = await api.get('/api/dashboard', { timeoutMs: 6000 });
      state.scheduleSummary = await api.get('/api/schedule/summary', { timeoutMs: 6000 });
      state.qualitySummary = await api.get('/api/quality/summary', { timeoutMs: 6000 });
      state.status = 'READY';
      state.message = 'API 서버 연결 준비 완료. 사용자 화면 데이터는 자동 덮어쓰지 않습니다.';
      state.lastError = null;
    } catch (err) {
      state.status = state.health ? 'WARN' : 'FAIL';
      state.message = state.health ? '일부 API 엔드포인트 점검이 필요합니다.' : 'API 서버 연결 실패. 정적 UI는 유지됩니다.';
      state.lastError = String(err && err.message || err);
    }
    state.lastCheckedAt = new Date().toISOString();
    renderBadge();
    return diagnostics();
  }

  function diagnostics() {
    return JSON.parse(JSON.stringify(state));
  }

  window.TechSysLabServerBridge = {
    version: VERSION,
    state: state,
    runDiagnostics: runDiagnostics,
    diagnostics: diagnostics,
    renderBadge: renderBadge
  };

  document.addEventListener('DOMContentLoaded', function () {
    renderBadge();
    setTimeout(runDiagnostics, 900);
  });
})();
