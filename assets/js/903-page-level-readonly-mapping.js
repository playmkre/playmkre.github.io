/* TechSysLab / ODI Page Level Readonly Mapping Phase 10
 * Scope: insert conservative server-data preview cards into existing user portal pages.
 * Non-goals: no route guard, no menu hard hide, no permission block, no localStorage rewrite,
 * no schedule/quality legacy table overwrite, no seed/mock data.
 */
(function () {
  'use strict';

  var VERSION = 'API_SERVER_EXPANSION_PHASE_10_CODEMASTER_DATAREADY_SERVER_CONNECT';
  var STYLE_ID = 'techsyslab-page-readonly-style';
  var CARD_CLASS = 'techsyslab-page-readonly-card';
  var STORAGE_COLLAPSE_PREFIX = 'techsyslab.pageReadonly.collapsed.';
  var DEFAULT_LIMIT = 6;
  var state = {
    version: VERSION,
    status: 'INIT',
    message: 'Page-level read-only mapping 대기',
    apiBase: null,
    payload: null,
    mappingByRoute: {},
    lastError: null,
    lastLoadedAt: null,
    renderedRoutes: []
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

  function asText(value) {
    if (value == null || value === '') return '-';
    if (typeof value === 'number') return numberText(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.' + CARD_CLASS + '{margin:0 0 14px 0;border:1px solid rgba(88,166,255,.32);border-radius:14px;background:linear-gradient(180deg,rgba(88,166,255,.08),rgba(148,163,184,.055));box-shadow:0 8px 24px rgba(15,23,42,.08);overflow:hidden;color:var(--tp,#0f172a);font:12px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '.' + CARD_CLASS + '.collapsed .tpl-body{display:none}',
      '.' + CARD_CLASS + ' .tpl-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(148,163,184,.22);cursor:pointer;user-select:none}',
      '.' + CARD_CLASS + ' .tpl-dot{width:9px;height:9px;border-radius:99px;background:#94a3b8;box-shadow:0 0 0 3px rgba(148,163,184,.14);flex:none}',
      '.' + CARD_CLASS + '.ready .tpl-dot{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18)}',
      '.' + CARD_CLASS + '.empty .tpl-dot{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.18)}',
      '.' + CARD_CLASS + '.fail .tpl-dot{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.18)}',
      '.' + CARD_CLASS + ' .tpl-title{font-weight:800;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.' + CARD_CLASS + ' .tpl-badge{font-size:10.5px;padding:2px 8px;border-radius:99px;background:rgba(15,23,42,.08);color:var(--ts,#475569);white-space:nowrap}',
      '.' + CARD_CLASS + ' .tpl-body{padding:12px}',
      '.' + CARD_CLASS + ' .tpl-desc{color:var(--ts,#64748b);margin-bottom:10px}',
      '.' + CARD_CLASS + ' .tpl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}',
      '.' + CARD_CLASS + ' .tpl-kpi{border:1px solid rgba(148,163,184,.28);border-radius:12px;background:rgba(255,255,255,.66);padding:9px 10px;min-width:0}',
      '.' + CARD_CLASS + ' .tpl-kpi span{display:block;color:var(--ts,#64748b);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.' + CARD_CLASS + ' .tpl-kpi b{display:block;font-size:18px;line-height:1.1;margin-top:4px;color:var(--tp,#0f172a)}',
      '.' + CARD_CLASS + ' .tpl-meta{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}',
      '.' + CARD_CLASS + ' .tpl-pill{border:1px solid rgba(148,163,184,.28);border-radius:99px;padding:3px 8px;color:var(--ts,#64748b);background:rgba(255,255,255,.55);font-size:10.5px}',
      '.' + CARD_CLASS + ' .tpl-table-wrap{border:1px solid rgba(148,163,184,.28);border-radius:12px;background:rgba(255,255,255,.62);overflow:auto;max-height:260px}',
      '.' + CARD_CLASS + ' .tpl-table-title{font-weight:800;margin:2px 0 7px;color:var(--tp,#0f172a)}',
      '.' + CARD_CLASS + ' table{width:100%;border-collapse:collapse;font-size:11px}',
      '.' + CARD_CLASS + ' th,.' + CARD_CLASS + ' td{padding:6px 8px;border-bottom:1px solid rgba(226,232,240,.8);text-align:left;vertical-align:top}',
      '.' + CARD_CLASS + ' th{background:rgba(248,250,252,.9);color:var(--ts,#475569);font-weight:800;white-space:nowrap}',
      '.' + CARD_CLASS + ' td{color:var(--tp,#0f172a);max-width:180px;word-break:break-word}',
      '.' + CARD_CLASS + ' .tpl-warn{margin-top:8px;border:1px solid rgba(245,158,11,.35);background:rgba(245,158,11,.09);color:var(--am,#b45309);border-radius:10px;padding:7px 9px;font-size:11px}',
      '.' + CARD_CLASS + ' .tpl-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
      '.' + CARD_CLASS + ' button{border:1px solid rgba(148,163,184,.45);border-radius:9px;background:rgba(255,255,255,.72);color:var(--tp,#0f172a);font:11px system-ui;padding:5px 8px;cursor:pointer}',
      '.' + CARD_CLASS + ' button:hover{background:rgba(241,245,249,.92)}',
      'html.dark .' + CARD_CLASS + ',body.dark .' + CARD_CLASS + ',[data-theme="dark"] .' + CARD_CLASS + '{background:linear-gradient(180deg,rgba(37,99,235,.12),rgba(15,23,42,.82));color:#e5e7eb;border-color:rgba(88,166,255,.35)}',
      'html.dark .' + CARD_CLASS + ' .tpl-kpi,html.dark .' + CARD_CLASS + ' .tpl-table-wrap,html.dark .' + CARD_CLASS + ' .tpl-pill,body.dark .' + CARD_CLASS + ' .tpl-kpi,body.dark .' + CARD_CLASS + ' .tpl-table-wrap,body.dark .' + CARD_CLASS + ' .tpl-pill,[data-theme="dark"] .' + CARD_CLASS + ' .tpl-kpi,[data-theme="dark"] .' + CARD_CLASS + ' .tpl-table-wrap,[data-theme="dark"] .' + CARD_CLASS + ' .tpl-pill{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.28);color:#e5e7eb}',
      'html.dark .' + CARD_CLASS + ' th,body.dark .' + CARD_CLASS + ' th,[data-theme="dark"] .' + CARD_CLASS + ' th{background:rgba(15,23,42,.9);color:#cbd5e1}',
      'html.dark .' + CARD_CLASS + ' td,html.dark .' + CARD_CLASS + ' .tpl-kpi b,body.dark .' + CARD_CLASS + ' td,body.dark .' + CARD_CLASS + ' .tpl-kpi b,[data-theme="dark"] .' + CARD_CLASS + ' td,[data-theme="dark"] .' + CARD_CLASS + ' .tpl-kpi b{color:#e5e7eb}',
      'html.dark .' + CARD_CLASS + ' button,body.dark .' + CARD_CLASS + ' button,[data-theme="dark"] .' + CARD_CLASS + ' button{background:rgba(30,41,59,.9);color:#e5e7eb;border-color:rgba(148,163,184,.35)}',
      '@media(max-width:760px){.' + CARD_CLASS + ' .tpl-grid{grid-template-columns:1fr}.' + CARD_CLASS + ' .tpl-head{align-items:flex-start;flex-wrap:wrap}}'
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
    var mappings = safeArray(payload && payload.mappings);
    var byRoute = {};
    mappings.forEach(function (m) {
      if (m && m.routeKey) byRoute[m.routeKey] = m;
    });
    return byRoute;
  }

  function fallbackFromReadonlyPreview(preview) {
    var summary = preview && preview.summary || {};
    return {
      status: preview && preview.status || 'empty',
      phase: 'phase_10_codemaster_dataready_server_connect_fallback',
      version: VERSION,
      generatedAt: preview && preview.generatedAt || new Date().toISOString(),
      policy: {
        readOnly: true,
        noRouteGuard: true,
        noMenuHide: true,
        noLocalStorageRewrite: true,
        noSeedData: true,
        noLegacyDataOverwrite: true
      },
      summary: {
        scheduleRows: summary.scheduleRows || 0,
        qualityIssues: summary.qualityIssues || 0,
        uploadHistory: summary.uploadHistory || 0,
        mappedPages: 4
      },
      mappings: [
        {
          routeKey: 'schedule', pageId: 'page-schedule', title: '생산일정 서버 Preview', kind: 'schedule',
          description: 'fallback: /api/user/readonly-preview 데이터를 생산일정 페이지 보조 카드로 표시합니다.',
          status: (summary.scheduleRows || 0) ? 'ready' : 'empty', total: summary.scheduleRows || 0,
          cards: [{ label: 'DB 행', value: summary.scheduleRows || 0 }, { label: '업로드 이력', value: summary.uploadHistory || 0 }, { label: '강제 제한', value: 0 }],
          table: { title: '최근 생산일정 행', columns: [{ key: 'order_no', label: '수주/LOT' }, { key: 'item_name', label: '품명' }, { key: 'plan_date', label: '계획일' }, { key: 'status', label: '상태' }, { key: 'line_name', label: '라인/호기' }], rows: safeArray(preview && preview.scheduleRows) },
          warnings: (summary.scheduleRows || 0) ? [] : ['생산일정 업로드 데이터가 없습니다.'], policy: { readOnly: true, noLegacyDataOverwrite: true }
        },
        {
          routeKey: 'quality-dash', pageId: 'page-quality-dash', title: '품질 대시보드 서버 Preview', kind: 'quality',
          description: 'fallback: 서버 품질 요약을 품질 대시보드 보조 카드로 표시합니다.',
          status: (summary.qualityIssues || 0) ? 'ready' : 'empty', total: summary.qualityIssues || 0,
          cards: [{ label: '품질 이슈 DB 행', value: summary.qualityIssues || 0 }, { label: '업로드 이력', value: summary.uploadHistory || 0 }, { label: '강제 제한', value: 0 }],
          table: { title: '최근 품질 이슈', columns: [{ key: 'issue_no', label: '이슈번호' }, { key: 'item_name', label: '품명' }, { key: 'defect_type', label: '불량유형' }, { key: 'status', label: '상태' }, { key: 'severity', label: '등급' }], rows: safeArray(preview && preview.qualityIssues) },
          warnings: (summary.qualityIssues || 0) ? [] : ['품질 이슈 업로드 데이터가 없습니다.'], policy: { readOnly: true, noLegacyDataOverwrite: true }
        },
        {
          routeKey: 'quality-main', pageId: 'page-quality-main', title: '불량관리 서버 Preview', kind: 'quality',
          description: 'fallback: 서버 품질 이슈 행을 불량관리센터 보조 테이블로 표시합니다.',
          status: (summary.qualityIssues || 0) ? 'ready' : 'empty', total: summary.qualityIssues || 0,
          cards: [{ label: '품질 이슈 DB 행', value: summary.qualityIssues || 0 }, { label: '업로드 이력', value: summary.uploadHistory || 0 }, { label: '강제 제한', value: 0 }],
          table: { title: '최근 품질 이슈', columns: [{ key: 'issue_no', label: '이슈번호' }, { key: 'item_name', label: '품명' }, { key: 'defect_type', label: '불량유형' }, { key: 'status', label: '상태' }, { key: 'severity', label: '등급' }], rows: safeArray(preview && preview.qualityIssues) },
          warnings: (summary.qualityIssues || 0) ? [] : ['품질 이슈 업로드 데이터가 없습니다.'], policy: { readOnly: true, noLegacyDataOverwrite: true }
        },
        {
          routeKey: 'download', pageId: 'page-download', title: '다운로드/내보내기 서버 Preview', kind: 'download',
          description: 'fallback: 다운로드 연결 전 서버 업로드 이력을 보조 표시합니다.',
          status: (summary.uploadHistory || 0) ? 'ready' : 'empty', total: summary.uploadHistory || 0,
          cards: [{ label: '생산 원천', value: summary.scheduleRows || 0 }, { label: '품질 원천', value: summary.qualityIssues || 0 }, { label: '업로드 이력', value: summary.uploadHistory || 0 }],
          table: { title: '최근 업로드', columns: [{ key: 'upload_type', label: '구분' }, { key: 'original_filename', label: '파일명' }, { key: 'row_count', label: '행수' }, { key: 'status', label: '상태' }, { key: 'uploaded_at', label: '업로드시각' }], rows: safeArray(preview && preview.uploads) },
          warnings: ['다운로드 승인/차단 적용은 아직 하지 않습니다.'], policy: { readOnly: true, noLegacyDataOverwrite: true }
        }
      ]
    };
  }

  function cardClass(mapping) {
    var status = mapping && mapping.status || 'empty';
    var cls = [CARD_CLASS, status === 'ready' ? 'ready' : status === 'empty' ? 'empty' : 'fail'];
    if (isCollapsed(mapping.routeKey)) cls.push('collapsed');
    return cls.join(' ');
  }

  function renderCards(cards) {
    cards = safeArray(cards);
    if (!cards.length) return '';
    return '<div class="tpl-grid">' + cards.slice(0, 4).map(function (card) {
      return '<div class="tpl-kpi"><span>' + escapeHtml(card.label) + '</span><b>' + escapeHtml(asText(card.value)) + '</b></div>';
    }).join('') + '</div>';
  }

  function renderTable(table) {
    table = table || {};
    var columns = safeArray(table.columns);
    var rows = safeArray(table.rows);
    if (!columns.length) return '';
    if (!rows.length) {
      return '<div class="tpl-table-title">' + escapeHtml(table.title || '서버 데이터') + '</div><div class="tpl-table-wrap"><div style="padding:12px;color:var(--ts,#64748b)">표시할 서버 데이터가 없습니다.</div></div>';
    }
    return [
      '<div class="tpl-table-title">' + escapeHtml(table.title || '서버 데이터') + '</div>',
      '<div class="tpl-table-wrap"><table><thead><tr>',
      columns.map(function (c) { return '<th>' + escapeHtml(c.label || c.key || '') + '</th>'; }).join(''),
      '</tr></thead><tbody>',
      rows.map(function (row) {
        return '<tr>' + columns.map(function (c) {
          return '<td>' + escapeHtml(asText(row && row[c.key])) + '</td>';
        }).join('') + '</tr>';
      }).join(''),
      '</tbody></table></div>'
    ].join('');
  }

  function renderWarnings(warnings) {
    warnings = safeArray(warnings);
    if (!warnings.length) return '';
    return '<div class="tpl-warn">' + warnings.map(escapeHtml).join(' · ') + '</div>';
  }

  function renderMeta(mapping) {
    var latest = mapping.latestUpload || {};
    var loaded = state.lastLoadedAt ? new Date(state.lastLoadedAt).toLocaleTimeString() : '-';
    var pills = [
      'read-only',
      'route: ' + (mapping.routeKey || '-'),
      'pageId: ' + (mapping.pageId || '-'),
      'loaded: ' + loaded
    ];
    if (latest.original_filename) pills.push('latest: ' + latest.original_filename);
    return '<div class="tpl-meta">' + pills.map(function (p) { return '<span class="tpl-pill">' + escapeHtml(p) + '</span>'; }).join('') + '</div>';
  }

  function renderMappingHtml(mapping) {
    var statusText = mapping.status === 'ready' ? 'READY' : mapping.status === 'empty' ? 'EMPTY' : 'WARN';
    return [
      '<div class="tpl-head" data-tpl-action="toggle" title="클릭해서 서버 preview 카드 접기/펼치기">',
      '<span class="tpl-dot"></span>',
      '<span class="tpl-title">' + escapeHtml(mapping.title || '서버 데이터 Preview') + '</span>',
      '<span class="tpl-badge">' + escapeHtml(statusText) + '</span>',
      '<span class="tpl-badge">' + escapeHtml(numberText(mapping.total || 0)) + '건</span>',
      '</div>',
      '<div class="tpl-body">',
      '<div class="tpl-desc">' + escapeHtml(mapping.description || '기존 화면을 덮어쓰지 않는 서버 DB 보조 미리보기입니다.') + '</div>',
      renderCards(mapping.cards),
      renderMeta(mapping),
      renderTable(mapping.table),
      renderWarnings(mapping.warnings),
      '<div class="tpl-actions"><button type="button" data-tpl-action="reload">서버 다시 조회</button><button type="button" data-tpl-action="console">콘솔 출력</button><button type="button" data-tpl-action="collapse">접기</button></div>',
      '</div>'
    ].join('');
  }

  function insertIntoPage(mapping) {
    if (!mapping || !mapping.pageId || !mapping.routeKey) return false;
    var page = document.getElementById(mapping.pageId);
    if (!page) return false;
    ensureStyle();
    var id = 'techsyslab-page-readonly-' + mapping.routeKey.replace(/[^a-z0-9_-]/gi, '-');
    var card = document.getElementById(id);
    if (!card) {
      card = document.createElement('section');
      card.id = id;
      card.setAttribute('data-techsyslab-page-preview', mapping.routeKey);
      var header = page.querySelector(':scope > .pg-hd');
      if (header && header.parentNode) header.parentNode.insertBefore(card, header.nextSibling);
      else page.insertBefore(card, page.firstChild);
    }
    card.className = cardClass(mapping);
    card.innerHTML = renderMappingHtml(mapping);
    var toggle = card.querySelector('[data-tpl-action="toggle"]');
    if (toggle) toggle.onclick = function () { setCollapsed(mapping.routeKey, !isCollapsed(mapping.routeKey)); renderAll(); };
    var reload = card.querySelector('[data-tpl-action="reload"]');
    if (reload) reload.onclick = function (ev) { ev.stopPropagation(); loadMapping(); };
    var con = card.querySelector('[data-tpl-action="console"]');
    if (con) con.onclick = function (ev) { ev.stopPropagation(); console.log('[TechSysLabPageReadonlyMapping]', mapping, diagnostics()); };
    var collapse = card.querySelector('[data-tpl-action="collapse"]');
    if (collapse) collapse.onclick = function (ev) { ev.stopPropagation(); setCollapsed(mapping.routeKey, true); renderAll(); };
    return true;
  }

  function renderAll() {
    var rendered = [];
    Object.keys(state.mappingByRoute || {}).forEach(function (routeKey) {
      var mapping = state.mappingByRoute[routeKey];
      if (insertIntoPage(mapping)) rendered.push(routeKey);
    });
    state.renderedRoutes = rendered;
    return rendered;
  }

  async function loadMapping() {
    var api = window.TechSysLabApiClient;
    state.apiBase = api && api.getApiBase ? api.getApiBase() : null;
    state.status = 'WARN';
    state.message = 'Page-level mapping 로드 중';
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
        payload = await api.get('/api/user/page-readonly-mapping?limit=' + DEFAULT_LIMIT, { timeoutMs: 8000 });
      } catch (primaryErr) {
        var preview = await api.get('/api/user/readonly-preview?limit=' + DEFAULT_LIMIT, { timeoutMs: 8000 });
        payload = fallbackFromReadonlyPreview(preview);
        payload.primaryEndpointError = String(primaryErr && primaryErr.message || primaryErr);
      }
      state.payload = payload;
      state.mappingByRoute = normalizePayload(payload);
      state.status = payload && payload.status === 'ready' ? 'READY' : 'EMPTY';
      state.message = state.status === 'READY'
        ? '서버 DB page-level read-only mapping 표시 중입니다.'
        : '업로드된 운영 데이터가 없습니다. 예시 데이터는 표시하지 않습니다.';
      state.lastError = null;
    } catch (err) {
      state.status = 'FAIL';
      state.message = 'Page-level mapping 로드 실패. 기존 화면은 유지됩니다.';
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

  window.TechSysLabPageReadonlyMapping = {
    version: VERSION,
    state: state,
    loadMapping: loadMapping,
    renderAll: renderAll,
    diagnostics: diagnostics,
    protectedRouteCheck: protectedRouteCheck
  };

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(loadMapping, 1700);
    setTimeout(renderAll, 2600);
  });
})();
