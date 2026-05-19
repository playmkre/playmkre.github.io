/* TechSysLab / ODI User Portal Page Detail Server Preview Phase 10
 * Scope: render richer read-only server detail panels inside existing protected pages.
 * Non-goals: no route guard, no menu hard hide, no permission block, no localStorage rewrite,
 * no legacy table/chart overwrite, no seed/mock data, no download approval enforcement.
 */
(function () {
  'use strict';

  var VERSION = 'API_SERVER_EXPANSION_PHASE_10_CODEMASTER_DATAREADY_SERVER_CONNECT';
  var STYLE_ID = 'techsyslab-page-detail-preview-style';
  var PANEL_CLASS = 'techsyslab-page-detail-preview';
  var STORAGE_COLLAPSE_PREFIX = 'techsyslab.pageDetail.collapsed.';
  var DEFAULT_LIMIT = 12;
  var state = {
    version: VERSION,
    status: 'INIT',
    message: 'Page detail server preview 대기',
    apiBase: null,
    payload: null,
    sectionByRoute: {},
    renderedRoutes: [],
    lastError: null,
    lastLoadedAt: null
  };

  var PROTECTED_ROUTES = {
    schedule: true,
    'quality-dash': true,
    'quality-main': true,
    'quality-analysis': true,
    'quality-action': true,
    'quality-images': true,
    'quality-master': true,
    dashboard: true,
    download: true
  };

  function safeArray(value) { return Array.isArray(value) ? value : []; }
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function asText(value) {
    if (value == null || value === '') return '-';
    if (typeof value === 'number') return numberText(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  }
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
      '.' + PANEL_CLASS + '{margin:0 0 16px 0;border:1px solid rgba(16,185,129,.28);border-radius:16px;background:linear-gradient(180deg,rgba(16,185,129,.075),rgba(59,130,246,.045));box-shadow:0 10px 28px rgba(15,23,42,.075);overflow:hidden;color:var(--tp,#0f172a);font:12px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '.' + PANEL_CLASS + '.collapsed .tdp-body{display:none}',
      '.' + PANEL_CLASS + ' .tdp-head{display:flex;align-items:center;gap:10px;padding:11px 13px;border-bottom:1px solid rgba(148,163,184,.22);cursor:pointer;user-select:none}',
      '.' + PANEL_CLASS + ' .tdp-dot{width:9px;height:9px;border-radius:99px;background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.16);flex:none}',
      '.' + PANEL_CLASS + '.empty .tdp-dot{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.16)}',
      '.' + PANEL_CLASS + '.fail .tdp-dot{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.16)}',
      '.' + PANEL_CLASS + ' .tdp-title{font-weight:900;letter-spacing:-.01em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.' + PANEL_CLASS + ' .tdp-badge{font-size:10.5px;padding:2px 8px;border-radius:99px;background:rgba(15,23,42,.08);color:var(--ts,#475569);white-space:nowrap}',
      '.' + PANEL_CLASS + ' .tdp-body{padding:13px}',
      '.' + PANEL_CLASS + ' .tdp-sub{color:var(--ts,#64748b);margin-bottom:10px}',
      '.' + PANEL_CLASS + ' .tdp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 12px 0}',
      '.' + PANEL_CLASS + ' .tdp-kpi{border:1px solid rgba(148,163,184,.28);border-radius:13px;background:rgba(255,255,255,.72);padding:9px 10px;min-width:0}',
      '.' + PANEL_CLASS + ' .tdp-kpi span{display:block;color:var(--ts,#64748b);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.' + PANEL_CLASS + ' .tdp-kpi b{display:block;font-size:18px;line-height:1.1;margin-top:3px;color:var(--tp,#0f172a)}',
      '.' + PANEL_CLASS + ' .tdp-kpi small{display:block;color:var(--tm,#94a3b8);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}',
      '.' + PANEL_CLASS + ' .tdp-table-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:8px}',
      '.' + PANEL_CLASS + ' .tdp-block{min-width:0}',
      '.' + PANEL_CLASS + ' .tdp-block-title{font-weight:800;margin:0 0 4px 0;color:var(--tp,#0f172a)}',
      '.' + PANEL_CLASS + ' .tdp-block-desc{color:var(--ts,#64748b);font-size:11px;margin:0 0 6px 0}',
      '.' + PANEL_CLASS + ' .tdp-table-wrap{max-height:260px;overflow:auto;border:1px solid rgba(148,163,184,.25);border-radius:12px;background:rgba(255,255,255,.58)}',
      '.' + PANEL_CLASS + ' table{width:100%;border-collapse:collapse;min-width:460px}',
      '.' + PANEL_CLASS + ' th,.' + PANEL_CLASS + ' td{padding:7px 8px;border-bottom:1px solid rgba(148,163,184,.18);text-align:left;vertical-align:top;white-space:nowrap}',
      '.' + PANEL_CLASS + ' th{font-size:10.5px;color:var(--ts,#64748b);font-weight:800;background:rgba(248,250,252,.88);position:sticky;top:0;z-index:1}',
      '.' + PANEL_CLASS + ' td{font-size:11.5px;color:var(--tp,#0f172a);max-width:220px;overflow:hidden;text-overflow:ellipsis}',
      '.' + PANEL_CLASS + ' .tdp-warn{margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(245,158,11,.1);color:#92400e;border:1px solid rgba(245,158,11,.22)}',
      '.' + PANEL_CLASS + ' .tdp-meta{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0 0}',
      '.' + PANEL_CLASS + ' .tdp-pill{border:1px solid rgba(148,163,184,.28);background:rgba(255,255,255,.66);border-radius:999px;padding:2px 8px;color:var(--ts,#64748b);font-size:10.5px}',
      '.' + PANEL_CLASS + ' .tdp-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}',
      '.' + PANEL_CLASS + ' button{border:1px solid rgba(148,163,184,.34);background:rgba(255,255,255,.78);border-radius:10px;padding:6px 9px;font:inherit;font-weight:700;cursor:pointer;color:var(--tp,#0f172a)}',
      '.' + PANEL_CLASS + ' button:hover{background:rgba(16,185,129,.12)}',
      'html.dark .' + PANEL_CLASS + ',body.dark .' + PANEL_CLASS + ',[data-theme="dark"] .' + PANEL_CLASS + '{background:linear-gradient(180deg,rgba(16,185,129,.14),rgba(59,130,246,.09));border-color:rgba(148,163,184,.3);color:#e5e7eb}',
      'html.dark .' + PANEL_CLASS + ' .tdp-kpi,html.dark .' + PANEL_CLASS + ' .tdp-table-wrap,html.dark .' + PANEL_CLASS + ' .tdp-pill,body.dark .' + PANEL_CLASS + ' .tdp-kpi,body.dark .' + PANEL_CLASS + ' .tdp-table-wrap,body.dark .' + PANEL_CLASS + ' .tdp-pill,[data-theme="dark"] .' + PANEL_CLASS + ' .tdp-kpi,[data-theme="dark"] .' + PANEL_CLASS + ' .tdp-table-wrap,[data-theme="dark"] .' + PANEL_CLASS + ' .tdp-pill{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.28);color:#e5e7eb}',
      'html.dark .' + PANEL_CLASS + ' th,body.dark .' + PANEL_CLASS + ' th,[data-theme="dark"] .' + PANEL_CLASS + ' th{background:rgba(15,23,42,.9);color:#cbd5e1}',
      'html.dark .' + PANEL_CLASS + ' td,html.dark .' + PANEL_CLASS + ' .tdp-kpi b,html.dark .' + PANEL_CLASS + ' .tdp-block-title,body.dark .' + PANEL_CLASS + ' td,body.dark .' + PANEL_CLASS + ' .tdp-kpi b,body.dark .' + PANEL_CLASS + ' .tdp-block-title,[data-theme="dark"] .' + PANEL_CLASS + ' td,[data-theme="dark"] .' + PANEL_CLASS + ' .tdp-kpi b,[data-theme="dark"] .' + PANEL_CLASS + ' .tdp-block-title{color:#e5e7eb}',
      'html.dark .' + PANEL_CLASS + ' .tdp-sub,html.dark .' + PANEL_CLASS + ' .tdp-block-desc,body.dark .' + PANEL_CLASS + ' .tdp-sub,body.dark .' + PANEL_CLASS + ' .tdp-block-desc,[data-theme="dark"] .' + PANEL_CLASS + ' .tdp-sub,[data-theme="dark"] .' + PANEL_CLASS + ' .tdp-block-desc{color:#cbd5e1}',
      'html.dark .' + PANEL_CLASS + ' button,body.dark .' + PANEL_CLASS + ' button,[data-theme="dark"] .' + PANEL_CLASS + ' button{background:rgba(30,41,59,.9);color:#e5e7eb;border-color:rgba(148,163,184,.35)}',
      '@media(max-width:980px){.' + PANEL_CLASS + ' .tdp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.' + PANEL_CLASS + ' .tdp-table-grid{grid-template-columns:1fr}}',
      '@media(max-width:620px){.' + PANEL_CLASS + ' .tdp-grid{grid-template-columns:1fr}.' + PANEL_CLASS + ' .tdp-head{align-items:flex-start;flex-wrap:wrap}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function isCollapsed(routeKey) {
    try { return localStorage.getItem(STORAGE_COLLAPSE_PREFIX + routeKey) === '1'; } catch (err) { return false; }
  }
  function setCollapsed(routeKey, value) {
    try { localStorage.setItem(STORAGE_COLLAPSE_PREFIX + routeKey, value ? '1' : '0'); } catch (err) {}
  }

  function normalizePayload(payload) {
    var sections = safeArray(payload && payload.sections);
    var byRoute = {};
    sections.forEach(function (section) {
      if (section && section.routeKey) byRoute[section.routeKey] = section;
    });
    return byRoute;
  }

  function fallbackFromMapping(mappingPayload) {
    var mappings = safeArray(mappingPayload && mappingPayload.mappings);
    return {
      status: mappingPayload && mappingPayload.status || 'empty',
      phase: 'phase_10_codemaster_dataready_server_connect_fallback',
      version: VERSION,
      generatedAt: mappingPayload && mappingPayload.generatedAt || new Date().toISOString(),
      policy: { readOnly: true, noRouteGuard: true, noMenuHide: true, noLocalStorageRewrite: true, noSeedData: true, noLegacyDataOverwrite: true },
      summary: mappingPayload && mappingPayload.summary || {},
      sections: mappings.map(function (m) {
        return {
          routeKey: m.routeKey,
          pageId: m.pageId,
          title: (m.title || '서버 데이터 Preview') + ' 상세',
          subtitle: m.description || 'fallback: page-readonly-mapping 데이터를 상세 preview 형식으로 표시합니다.',
          intent: 'fallback-detail-readonly',
          status: m.status || 'empty',
          cards: safeArray(m.cards),
          tables: m.table ? [m.table] : [],
          warnings: safeArray(m.warnings),
          latestUpload: m.latestUpload,
          policy: m.policy || {}
        };
      })
    };
  }

  function panelClass(section) {
    var cls = [PANEL_CLASS, section && section.status === 'ready' ? 'ready' : section && section.status === 'empty' ? 'empty' : 'fail'];
    if (section && isCollapsed(section.routeKey)) cls.push('collapsed');
    return cls.join(' ');
  }

  function renderCards(cards) {
    cards = safeArray(cards);
    if (!cards.length) return '';
    return '<div class="tdp-grid">' + cards.slice(0, 6).map(function (card) {
      return '<div class="tdp-kpi"><span>' + escapeHtml(card.label) + '</span><b>' + escapeHtml(asText(card.value)) + '</b><small>' + escapeHtml(card.hint || 'read-only') + '</small></div>';
    }).join('') + '</div>';
  }

  function renderTable(table) {
    table = table || {};
    var columns = safeArray(table.columns);
    var rows = safeArray(table.rows);
    if (!columns.length) return '';
    var body = rows.length ? rows.map(function (row) {
      return '<tr>' + columns.map(function (c) {
        return '<td title="' + escapeHtml(asText(row && row[c.key])) + '">' + escapeHtml(asText(row && row[c.key])) + '</td>';
      }).join('') + '</tr>';
    }).join('') : '<tr><td colspan="' + columns.length + '">표시할 서버 데이터가 없습니다.</td></tr>';
    return [
      '<div class="tdp-block">',
      '<div class="tdp-block-title">' + escapeHtml(table.title || '서버 데이터') + '</div>',
      table.description ? '<div class="tdp-block-desc">' + escapeHtml(table.description) + '</div>' : '',
      '<div class="tdp-table-wrap"><table><thead><tr>',
      columns.map(function (c) { return '<th>' + escapeHtml(c.label || c.key || '') + '</th>'; }).join(''),
      '</tr></thead><tbody>', body, '</tbody></table></div></div>'
    ].join('');
  }

  function renderTables(tables) {
    tables = safeArray(tables);
    if (!tables.length) return '';
    return '<div class="tdp-table-grid">' + tables.map(renderTable).join('') + '</div>';
  }

  function renderWarnings(warnings) {
    warnings = safeArray(warnings);
    if (!warnings.length) return '';
    return '<div class="tdp-warn">' + warnings.map(escapeHtml).join(' · ') + '</div>';
  }

  function renderMeta(section) {
    var latest = section.latestUpload || {};
    var loaded = state.lastLoadedAt ? new Date(state.lastLoadedAt).toLocaleTimeString() : '-';
    var pills = [
      'read-only detail',
      'route: ' + (section.routeKey || '-'),
      'pageId: ' + (section.pageId || '-'),
      'intent: ' + (section.intent || '-'),
      'loaded: ' + loaded
    ];
    if (latest.original_filename) pills.push('latest: ' + latest.original_filename);
    return '<div class="tdp-meta">' + pills.map(function (p) { return '<span class="tdp-pill">' + escapeHtml(p) + '</span>'; }).join('') + '</div>';
  }

  function renderSectionHtml(section) {
    var statusText = section.status === 'ready' ? 'READY' : section.status === 'empty' ? 'EMPTY' : 'WARN';
    return [
      '<div class="tdp-head" data-tdp-action="toggle" title="클릭해서 서버 detail preview 접기/펼치기">',
      '<span class="tdp-dot"></span>',
      '<span class="tdp-title">' + escapeHtml(section.title || '서버 상세 Preview') + '</span>',
      '<span class="tdp-badge">' + escapeHtml(statusText) + '</span>',
      '<span class="tdp-badge">Phase 10</span>',
      '</div>',
      '<div class="tdp-body">',
      '<div class="tdp-sub">' + escapeHtml(section.subtitle || '기존 화면을 덮어쓰지 않는 서버 DB 상세 미리보기입니다.') + '</div>',
      renderCards(section.cards),
      renderMeta(section),
      renderTables(section.tables),
      renderWarnings(section.warnings),
      '<div class="tdp-actions"><button type="button" data-tdp-action="reload">상세 다시 조회</button><button type="button" data-tdp-action="console">콘솔 출력</button><button type="button" data-tdp-action="collapse">접기</button></div>',
      '</div>'
    ].join('');
  }

  function insertIntoPage(section) {
    if (!section || !section.pageId || !section.routeKey) return false;
    var page = document.getElementById(section.pageId);
    if (!page) return false;
    ensureStyle();
    var id = 'techsyslab-page-detail-' + section.routeKey.replace(/[^a-z0-9_-]/gi, '-');
    var panel = document.getElementById(id);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = id;
      panel.setAttribute('data-techsyslab-page-detail-preview', section.routeKey);
      var pagePreview = document.getElementById('techsyslab-page-readonly-' + section.routeKey.replace(/[^a-z0-9_-]/gi, '-'));
      if (pagePreview && pagePreview.parentNode) pagePreview.parentNode.insertBefore(panel, pagePreview.nextSibling);
      else {
        var header = page.querySelector(':scope > .pg-hd');
        if (header && header.parentNode) header.parentNode.insertBefore(panel, header.nextSibling);
        else page.insertBefore(panel, page.firstChild);
      }
    }
    panel.className = panelClass(section);
    panel.innerHTML = renderSectionHtml(section);
    var toggle = panel.querySelector('[data-tdp-action="toggle"]');
    if (toggle) toggle.onclick = function () { setCollapsed(section.routeKey, !isCollapsed(section.routeKey)); renderAll(); };
    var reload = panel.querySelector('[data-tdp-action="reload"]');
    if (reload) reload.onclick = function (ev) { ev.stopPropagation(); loadDetailPreview(); };
    var con = panel.querySelector('[data-tdp-action="console"]');
    if (con) con.onclick = function (ev) { ev.stopPropagation(); console.log('[TechSysLabPageDetailPreview]', section, diagnostics()); };
    var collapse = panel.querySelector('[data-tdp-action="collapse"]');
    if (collapse) collapse.onclick = function (ev) { ev.stopPropagation(); setCollapsed(section.routeKey, true); renderAll(); };
    return true;
  }

  function renderAll() {
    var rendered = [];
    Object.keys(state.sectionByRoute || {}).forEach(function (routeKey) {
      var section = state.sectionByRoute[routeKey];
      if (insertIntoPage(section)) rendered.push(routeKey);
    });
    state.renderedRoutes = rendered;
    return rendered;
  }

  async function loadDetailPreview() {
    var api = window.TechSysLabApiClient;
    state.apiBase = api && api.getApiBase ? api.getApiBase() : null;
    state.status = 'WARN';
    state.message = 'Page detail preview 로드 중';
    state.lastError = null;
    if (!api || !api.get) {
      state.status = 'FAIL';
      state.message = '900-api-client.js가 로드되지 않았습니다.';
      state.lastError = 'TechSysLabApiClient missing';
      state.lastLoadedAt = new Date().toISOString();
      renderAll();
      return diagnostics();
    }
    try {
      var payload;
      try {
        payload = await api.get('/api/user/page-detail-preview?limit=' + DEFAULT_LIMIT, { timeoutMs: 9000 });
      } catch (primaryErr) {
        var mapping = await api.get('/api/user/page-readonly-mapping?limit=' + DEFAULT_LIMIT, { timeoutMs: 9000 });
        payload = fallbackFromMapping(mapping);
        payload.primaryEndpointError = String(primaryErr && primaryErr.message || primaryErr);
      }
      state.payload = payload;
      state.sectionByRoute = normalizePayload(payload);
      state.status = payload && payload.status === 'ready' ? 'READY' : 'EMPTY';
      state.message = state.status === 'READY'
        ? '서버 DB 상세 preview를 read-only로 표시 중입니다.'
        : '업로드/확정된 운영 데이터가 없습니다. 예시 데이터는 표시하지 않습니다.';
      state.lastError = null;
    } catch (err) {
      state.status = 'FAIL';
      state.message = 'Page detail preview 로드 실패. 기존 화면은 유지됩니다.';
      state.lastError = String(err && err.message || err);
    }
    state.lastLoadedAt = new Date().toISOString();
    renderAll();
    return diagnostics();
  }

  function protectedRouteCheck() {
    var missing = [];
    Object.keys(PROTECTED_ROUTES).forEach(function (routeKey) {
      var pid = window.PM && window.PM[routeKey] || ('page-' + routeKey);
      if (!document.getElementById(pid)) missing.push({ routeKey: routeKey, pageId: pid });
    });
    return { ok: missing.length === 0, missing: missing };
  }

  function diagnostics() {
    return JSON.parse(JSON.stringify({
      version: state.version,
      status: state.status,
      message: state.message,
      apiBase: state.apiBase,
      summary: state.payload && state.payload.summary || null,
      renderedRoutes: state.renderedRoutes,
      lastError: state.lastError,
      lastLoadedAt: state.lastLoadedAt,
      protectedRoutes: protectedRouteCheck(),
      policy: state.payload && state.payload.policy || null
    }));
  }

  window.TechSysLabPageDetailPreview = {
    version: VERSION,
    state: state,
    loadPreview: loadDetailPreview,
    loadDetailPreview: loadDetailPreview,
    renderAll: renderAll,
    diagnostics: diagnostics,
    protectedRouteCheck: protectedRouteCheck
  };

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(loadDetailPreview, 2300);
    setTimeout(renderAll, 3400);
  });
})();
