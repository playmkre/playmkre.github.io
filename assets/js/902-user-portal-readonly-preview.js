/* TechSysLab / ODI User Portal Readonly Preview Phase 10
 * Scope: render API/DB data as a non-invasive read-only preview inside the existing user portal.
 * Non-goals: no route guard, no menu hard hide, no permission block, no localStorage contract rewrite,
 * no legacy schedule/quality data overwrite, no seed/mock data.
 */
(function () {
  'use strict';

  var VERSION = 'API_SERVER_EXPANSION_PHASE_10_CODEMASTER_DATAREADY_SERVER_CONNECT';
  var PANEL_ID = 'techsyslab-readonly-preview-panel';
  var STYLE_ID = 'techsyslab-readonly-preview-style';
  var COLLAPSE_KEY = 'techsyslab.readonlyPreview.collapsed';
  var state = {
    version: VERSION,
    status: 'INIT',
    message: '서버 데이터 미리보기 대기',
    apiBase: null,
    preview: null,
    lastError: null,
    lastLoadedAt: null
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function safeArray(value) { return Array.isArray(value) ? value : []; }

  function numberText(value) {
    var n = Number(value || 0);
    if (!isFinite(n)) return '0';
    try { return n.toLocaleString('ko-KR'); } catch (err) { return String(n); }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#' + PANEL_ID + '{position:fixed;left:16px;bottom:16px;z-index:99989;width:min(720px,calc(100vw - 32px));max-height:min(680px,calc(100vh - 32px));border:1px solid rgba(148,163,184,.45);border-radius:16px;background:rgba(248,250,252,.98);color:#0f172a;box-shadow:0 18px 48px rgba(15,23,42,.26);font:12px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}',
      '#' + PANEL_ID + '.min{width:320px}',
      '#' + PANEL_ID + '.min .trp-body{display:none}',
      '#' + PANEL_ID + ' .trp-head{display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(135deg,rgba(15,23,42,.96),rgba(30,41,59,.96));color:#e5e7eb;cursor:pointer;user-select:none}',
      '#' + PANEL_ID + ' .trp-dot{width:9px;height:9px;border-radius:99px;background:#94a3b8;box-shadow:0 0 0 3px rgba(148,163,184,.16);flex:none}',
      '#' + PANEL_ID + '.ready .trp-dot{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18)}',
      '#' + PANEL_ID + '.empty .trp-dot{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.18)}',
      '#' + PANEL_ID + '.fail .trp-dot{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.18)}',
      '#' + PANEL_ID + ' .trp-title{font-weight:800;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#' + PANEL_ID + ' .trp-state{font-size:11px;color:#cbd5e1;white-space:nowrap}',
      '#' + PANEL_ID + ' .trp-body{padding:12px;overflow:auto;max-height:620px}',
      '#' + PANEL_ID + ' .trp-muted{color:#64748b}',
      '#' + PANEL_ID + ' .trp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0 10px}',
      '#' + PANEL_ID + ' .trp-card{border:1px solid rgba(148,163,184,.35);border-radius:12px;background:#fff;padding:9px 10px;min-width:0}',
      '#' + PANEL_ID + ' .trp-card b{display:block;font-size:18px;line-height:1.1;margin-top:4px}',
      '#' + PANEL_ID + ' .trp-section{margin-top:10px;border:1px solid rgba(148,163,184,.35);border-radius:12px;background:#fff;overflow:hidden}',
      '#' + PANEL_ID + ' .trp-section h4{margin:0;padding:8px 10px;background:#f8fafc;border-bottom:1px solid rgba(148,163,184,.28);font-size:12px}',
      '#' + PANEL_ID + ' table{width:100%;border-collapse:collapse;font-size:11px}',
      '#' + PANEL_ID + ' th,#' + PANEL_ID + ' td{padding:6px 8px;border-bottom:1px solid rgba(226,232,240,.9);text-align:left;vertical-align:top}',
      '#' + PANEL_ID + ' th{color:#475569;background:#f8fafc;font-weight:700;white-space:nowrap}',
      '#' + PANEL_ID + ' td{color:#0f172a;max-width:170px;word-break:break-word}',
      '#' + PANEL_ID + ' .trp-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
      '#' + PANEL_ID + ' button{border:1px solid rgba(148,163,184,.45);border-radius:9px;background:#fff;color:#0f172a;font:11px system-ui;padding:6px 8px;cursor:pointer}',
      '#' + PANEL_ID + ' button:hover{background:#f1f5f9}',
      '#' + PANEL_ID + ' .trp-error{margin-top:8px;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:8px}',
      'html.dark #' + PANEL_ID + ',body.dark #' + PANEL_ID + ',[data-theme="dark"] #' + PANEL_ID + '{background:rgba(15,23,42,.98);color:#e5e7eb}',
      'html.dark #' + PANEL_ID + ' .trp-card,html.dark #' + PANEL_ID + ' .trp-section,body.dark #' + PANEL_ID + ' .trp-card,body.dark #' + PANEL_ID + ' .trp-section,[data-theme="dark"] #' + PANEL_ID + ' .trp-card,[data-theme="dark"] #' + PANEL_ID + ' .trp-section{background:#111827;color:#e5e7eb;border-color:rgba(148,163,184,.35)}',
      'html.dark #' + PANEL_ID + ' th,html.dark #' + PANEL_ID + ' .trp-section h4,body.dark #' + PANEL_ID + ' th,body.dark #' + PANEL_ID + ' .trp-section h4,[data-theme="dark"] #' + PANEL_ID + ' th,[data-theme="dark"] #' + PANEL_ID + ' .trp-section h4{background:#0f172a;color:#cbd5e1}',
      'html.dark #' + PANEL_ID + ' td,body.dark #' + PANEL_ID + ' td,[data-theme="dark"] #' + PANEL_ID + ' td{color:#e5e7eb;border-bottom-color:rgba(51,65,85,.9)}',
      '@media(max-width:720px){#' + PANEL_ID + ' .trp-grid{grid-template-columns:1fr}#' + PANEL_ID + '.min{width:min(320px,calc(100vw - 32px))}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function getCollapsed() {
    try { return localStorage.getItem(COLLAPSE_KEY) !== '0'; } catch (err) { return true; }
  }

  function setCollapsed(value) {
    try { localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0'); } catch (err) {}
  }

  function panelClass() {
    var cls = [];
    if (getCollapsed()) cls.push('min');
    if (state.status === 'READY') cls.push('ready');
    else if (state.status === 'EMPTY' || state.status === 'WARN') cls.push('empty');
    else if (state.status === 'FAIL') cls.push('fail');
    return cls.join(' ');
  }

  function renderRows(rows, columns, emptyText) {
    rows = safeArray(rows);
    if (!rows.length) return '<div class="trp-card trp-muted">' + escapeHtml(emptyText) + '</div>';
    return [
      '<table><thead><tr>',
      columns.map(function (c) { return '<th>' + escapeHtml(c.label) + '</th>'; }).join(''),
      '</tr></thead><tbody>',
      rows.map(function (row) {
        return '<tr>' + columns.map(function (c) {
          return '<td>' + escapeHtml(row && row[c.key] != null ? row[c.key] : '-') + '</td>';
        }).join('') + '</tr>';
      }).join(''),
      '</tbody></table>'
    ].join('');
  }

  function renderBody() {
    var preview = state.preview || {};
    var summary = preview.summary || {};
    var generated = preview.generatedAt ? new Date(preview.generatedAt).toLocaleString() : '-';
    var loaded = state.lastLoadedAt ? new Date(state.lastLoadedAt).toLocaleTimeString() : '-';
    var warnings = safeArray(preview.warnings);
    return [
      '<div class="trp-muted">기존 사용자 화면을 덮어쓰지 않는 서버 DB read-only 미리보기입니다.</div>',
      '<div class="trp-grid">',
      '<div class="trp-card"><span>생산일정 DB 행</span><b>' + numberText(summary.scheduleRows) + '</b></div>',
      '<div class="trp-card"><span>품질 이슈 DB 행</span><b>' + numberText(summary.qualityIssues) + '</b></div>',
      '<div class="trp-card"><span>업로드 이력</span><b>' + numberText(summary.uploadHistory) + '</b></div>',
      '</div>',
      '<div class="trp-card"><div><b style="font-size:12px">상태</b></div><div class="trp-muted">API Base: ' + escapeHtml(state.apiBase || '-') + '</div><div class="trp-muted">생성: ' + escapeHtml(generated) + ' / 로드: ' + escapeHtml(loaded) + '</div><div>' + escapeHtml(state.message || '') + '</div>' + (warnings.length ? '<div class="trp-muted">' + warnings.map(escapeHtml).join(' · ') + '</div>' : '') + '</div>',
      '<div class="trp-section"><h4>생산일정 미리보기</h4>' + renderRows(preview.scheduleRows, [
        { key: 'order_no', label: '수주/LOT' },
        { key: 'item_name', label: '품명' },
        { key: 'plan_date', label: '계획일' },
        { key: 'status', label: '상태' },
        { key: 'line_name', label: '라인' }
      ], '업로드된 생산일정 데이터가 없습니다.') + '</div>',
      '<div class="trp-section"><h4>품질 이슈 미리보기</h4>' + renderRows(preview.qualityIssues, [
        { key: 'issue_no', label: '이슈번호' },
        { key: 'item_name', label: '품명' },
        { key: 'defect_type', label: '불량유형' },
        { key: 'status', label: '상태' },
        { key: 'severity', label: '등급' }
      ], '업로드된 품질 이슈 데이터가 없습니다.') + '</div>',
      '<div class="trp-section"><h4>최근 업로드</h4>' + renderRows(preview.uploads, [
        { key: 'upload_type', label: '구분' },
        { key: 'original_filename', label: '파일명' },
        { key: 'row_count', label: '행수' },
        { key: 'status', label: '상태' },
        { key: 'uploaded_at', label: '업로드시각' }
      ], '업로드 이력이 없습니다.') + '</div>',
      state.lastError ? '<div class="trp-error">' + escapeHtml(state.lastError) + '</div>' : '',
      '<div class="trp-actions"><button type="button" data-trp-action="reload">다시 불러오기</button><button type="button" data-trp-action="console">콘솔 출력</button><button type="button" data-trp-action="collapse">접기</button></div>'
    ].join('');
  }

  function renderPanel() {
    ensureStyle();
    var el = document.getElementById(PANEL_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = PANEL_ID;
      document.body.appendChild(el);
    }
    el.className = panelClass();
    var titleCount = state.preview && state.preview.summary
      ? 'S ' + numberText(state.preview.summary.scheduleRows) + ' / Q ' + numberText(state.preview.summary.qualityIssues)
      : '대기';
    el.innerHTML = [
      '<div class="trp-head" title="클릭해서 서버 DB 미리보기 열기/닫기">',
      '<span class="trp-dot"></span>',
      '<span class="trp-title">서버 데이터 미리보기</span>',
      '<span class="trp-state">' + escapeHtml(state.status) + ' · ' + escapeHtml(titleCount) + '</span>',
      '</div>',
      '<div class="trp-body">' + renderBody() + '</div>'
    ].join('');
    var head = el.querySelector('.trp-head');
    if (head) head.onclick = function () { setCollapsed(!getCollapsed()); renderPanel(); };
    var reload = el.querySelector('[data-trp-action="reload"]');
    if (reload) reload.onclick = function (ev) { ev.stopPropagation(); loadPreview(); };
    var con = el.querySelector('[data-trp-action="console"]');
    if (con) con.onclick = function (ev) { ev.stopPropagation(); console.log('[TechSysLabReadonlyPreview]', diagnostics()); };
    var collapse = el.querySelector('[data-trp-action="collapse"]');
    if (collapse) collapse.onclick = function (ev) { ev.stopPropagation(); setCollapsed(true); renderPanel(); };
  }

  function fallbackPreview(api) {
    return Promise.all([
      api.get('/api/dashboard', { timeoutMs: 7000 }).catch(function (err) { return { status: 'error', error: String(err && err.message || err) }; }),
      api.get('/api/schedule?limit=8', { timeoutMs: 7000 }).catch(function () { return { rows: [] }; }),
      api.get('/api/quality/issues?limit=8', { timeoutMs: 7000 }).catch(function () { return { rows: [] }; }),
      api.get('/api/admin/uploads?limit=8', { timeoutMs: 7000 }).catch(function () { return { rows: [] }; })
    ]).then(function (parts) {
      var dashboard = parts[0] || {};
      var scheduleRows = safeArray(parts[1] && parts[1].rows);
      var qualityIssues = safeArray(parts[2] && parts[2].rows);
      var uploads = safeArray(parts[3] && parts[3].rows);
      return {
        status: dashboard.status || (scheduleRows.length || qualityIssues.length ? 'ready' : 'empty'),
        phase: 'phase_10_codemaster_dataready_server_connect_fallback',
        generatedAt: dashboard.generatedAt || new Date().toISOString(),
        summary: {
          scheduleRows: dashboard.scheduleSummary && dashboard.scheduleSummary.total || scheduleRows.length,
          qualityIssues: dashboard.qualitySummary && dashboard.qualitySummary.total || qualityIssues.length,
          uploadHistory: uploads.length
        },
        scheduleSummary: dashboard.scheduleSummary || {},
        qualitySummary: dashboard.qualitySummary || {},
        scheduleRows: scheduleRows,
        qualityIssues: qualityIssues,
        uploads: uploads,
        warnings: dashboard.warnings || []
      };
    });
  }

  async function loadPreview() {
    var api = window.TechSysLabApiClient;
    state.apiBase = api && api.getApiBase ? api.getApiBase() : null;
    state.status = 'WARN';
    state.message = '서버 DB 미리보기 로드 중';
    state.lastError = null;
    renderPanel();
    if (!api || !api.get) {
      state.status = 'FAIL';
      state.message = '900-api-client.js가 로드되지 않았습니다.';
      state.lastError = 'TechSysLabApiClient missing';
      state.lastLoadedAt = new Date().toISOString();
      renderPanel();
      return diagnostics();
    }
    try {
      var preview;
      try {
        preview = await api.get('/api/user/readonly-preview?limit=8', { timeoutMs: 8000 });
      } catch (primaryErr) {
        preview = await fallbackPreview(api);
        preview.primaryEndpointError = String(primaryErr && primaryErr.message || primaryErr);
      }
      state.preview = preview;
      state.status = preview && preview.status === 'ready' ? 'READY' : 'EMPTY';
      state.message = state.status === 'READY'
        ? '서버 DB 데이터를 read-only 미리보기로 표시 중입니다.'
        : '업로드된 운영 데이터가 없습니다. 예시 데이터는 표시하지 않습니다.';
      state.lastError = null;
    } catch (err) {
      state.status = 'FAIL';
      state.message = '서버 미리보기 로드 실패. 기존 정적 UI는 유지됩니다.';
      state.lastError = String(err && err.message || err);
    }
    state.lastLoadedAt = new Date().toISOString();
    renderPanel();
    return diagnostics();
  }

  function diagnostics() {
    return JSON.parse(JSON.stringify(state));
  }

  window.TechSysLabReadonlyPreview = {
    version: VERSION,
    state: state,
    loadPreview: loadPreview,
    renderPanel: renderPanel,
    diagnostics: diagnostics
  };

  document.addEventListener('DOMContentLoaded', function () {
    renderPanel();
    setTimeout(loadPreview, 1300);
  });
})();
