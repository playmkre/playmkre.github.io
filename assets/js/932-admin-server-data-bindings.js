/**
 * TechSysLab Phase 14B — Admin Portal Server Data Bindings
 * 파일: assets/js/932-admin-server-data-bindings.js
 * 버전: PHASE14B_v1.0
 *
 * 역할:
 *   - 930-server-data-bootstrap.js 이벤트 수신 (admin/index.html 전용)
 *   - 관리자 대시보드(page-dash)에 서버 DB 상태 카드 렌더링
 *   - 개발자 진단 패널 재표시 금지 — 고급 진단은 접힘 영역으로만
 *   - 서버 OFFLINE 시 명확한 안내 (가짜 데이터 표시 절대 금지)
 */

(function () {
  'use strict';

  var CARD_ID = 'tsl-admin-server-card';

  /* ──────────────────────────────────────────
     카드 CSS
  ────────────────────────────────────────── */
  var CARD_CSS = [
    '#tsl-admin-server-card{',
    '  margin:12px 0;padding:14px 16px;border-radius:12px;',
    '  border:1px solid rgba(248,81,73,.15);',
    '  background:rgba(10,5,5,.7);',
    '  font-size:12px;line-height:1.6;',
    '}',
    '#tsl-admin-server-card .tsl-asc-head{',
    '  display:flex;align-items:center;gap:8px;margin-bottom:10px;',
    '  font-weight:700;font-size:13px;',
    '}',
    '#tsl-admin-server-card .tsl-asc-dot{',
    '  width:9px;height:9px;border-radius:50%;flex-shrink:0;',
    '}',
    '#tsl-admin-server-card .tsl-asc-grid{',
    '  display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;',
    '}',
    '#tsl-admin-server-card .tsl-asc-item{',
    '  background:rgba(248,81,73,.05);border-radius:8px;',
    '  padding:8px 10px;text-align:center;',
    '  border:1px solid rgba(248,81,73,.1);',
    '}',
    '#tsl-admin-server-card .tsl-asc-val{',
    '  font-size:22px;font-weight:800;letter-spacing:-0.5px;',
    '}',
    '#tsl-admin-server-card .tsl-asc-lbl{',
    '  font-size:10px;color:#8b949e;margin-top:2px;',
    '}',
    '#tsl-admin-server-card .tsl-asc-footer{',
    '  margin-top:10px;padding-top:8px;',
    '  border-top:1px solid rgba(248,81,73,.1);',
    '  color:#8b949e;font-size:10px;',
    '}',
    '#tsl-admin-server-card .tsl-asc-offline{',
    '  padding:10px 12px;border-radius:8px;',
    '  background:rgba(248,81,73,.08);',
    '  border:1px solid rgba(248,81,73,.25);',
    '  color:#f85149;',
    '}',
    '#tsl-admin-server-card .tsl-asc-offline strong{display:block;margin-bottom:4px;}',
    /* 접힘 진단 영역 */
    '#tsl-admin-diag-details{margin-top:10px;}',
    '#tsl-admin-diag-details summary{',
    '  cursor:pointer;font-size:10px;color:#8b949e;',
    '  padding:4px 0;user-select:none;list-style:none;',
    '}',
    '#tsl-admin-diag-details summary::before{content:"▶ ";}',
    '#tsl-admin-diag-details[open] summary::before{content:"▼ ";}',
    '#tsl-admin-diag-details pre{',
    '  margin-top:8px;padding:10px 12px;border-radius:8px;',
    '  background:#0d1117;color:#8b949e;font-size:10px;',
    '  overflow-x:auto;white-space:pre-wrap;word-break:break-all;',
    '  border:1px solid rgba(255,255,255,.06);',
    '}'
  ].join('\n');

  /* ──────────────────────────────────────────
     원본 파일 보관 경로 안내
  ────────────────────────────────────────── */
  var SOURCE_PATH_INFO = 'C:\\\\techsyslab-server\\\\source_files';

  function renderLoading(c) {
    c.innerHTML = [
      '<div class="tsl-asc-head">',
      '  <span class="tsl-asc-dot" style="background:#484f58"></span>',
      '  <span style="color:#8b949e">서버 DB 로딩 중...</span>',
      '</div>'
    ].join('');
  }

  function renderReady(c, data) {
    var cnt = data.counts || {};
    var upload   = cnt.uploadHistoryCount != null ? cnt.uploadHistoryCount : '—';
    var sched    = cnt.scheduleRowCount   != null ? cnt.scheduleRowCount   : '—';
    var quality  = cnt.qualityIssueCount  != null ? cnt.qualityIssueCount  : '—';
    var rollback = cnt.rollbackEventCount != null ? cnt.rollbackEventCount : '0';
    var loadedAt = data.loadedAt
      ? new Date(data.loadedAt).toLocaleString('ko-KR')
      : '—';

    var srcInfo = '';
    if (data.sourceFiles) {
      var sf = data.sourceFiles;
      var schedState   = (sf.schedule  && sf.schedule.state)  ? sf.schedule.state  : '—';
      var qualState    = (sf.quality   && sf.quality.state)   ? sf.quality.state   : '—';
      srcInfo = '<div style="margin-top:8px;font-size:11px;color:#8b949e">' +
        '📂 원본 파일: <code style="color:#58a6ff">' + SOURCE_PATH_INFO + '</code><br>' +
        'schedule: <span style="color:#3fb950">' + schedState + '</span> &nbsp; ' +
        'quality: <span style="color:#d29922">' + qualState + '</span>' +
        '</div>';
    } else {
      srcInfo = '<div style="margin-top:8px;font-size:11px;color:#8b949e">' +
        '📂 원본 파일 보관 위치: <code style="color:#58a6ff">' + SOURCE_PATH_INFO + '</code>' +
        '</div>';
    }

    var diagJson = JSON.stringify({
      status: data.status,
      apiBase: data.apiBase,
      health: data.health,
      counts: data.counts,
      loadedAt: data.loadedAt
    }, null, 2);

    c.innerHTML = [
      '<div class="tsl-asc-head">',
      '  <span class="tsl-asc-dot" style="background:#3fb950"></span>',
      '  <span style="color:#3fb950">서버 DB 연결 정상</span>',
      '  <span style="margin-left:auto;color:#8b949e;font-size:10px;font-weight:400">운영 DB 기준</span>',
      '</div>',
      '<div class="tsl-asc-grid">',
      '  <div class="tsl-asc-item">',
      '    <div class="tsl-asc-val" style="color:#3fb950">' + upload + '</div>',
      '    <div class="tsl-asc-lbl">업로드 이력</div>',
      '  </div>',
      '  <div class="tsl-asc-item">',
      '    <div class="tsl-asc-val" style="color:#58a6ff">' + sched + '</div>',
      '    <div class="tsl-asc-lbl">생산일정 데이터</div>',
      '  </div>',
      '  <div class="tsl-asc-item">',
      '    <div class="tsl-asc-val" style="color:#d29922">' + quality + '</div>',
      '    <div class="tsl-asc-lbl">품질 이슈 데이터</div>',
      '  </div>',
      '  <div class="tsl-asc-item">',
      '    <div class="tsl-asc-val" style="color:#8b949e">' + rollback + '</div>',
      '    <div class="tsl-asc-lbl">Rollback 이벤트</div>',
      '  </div>',
      '</div>',
      srcInfo,
      '<div class="tsl-asc-footer">',
      '  마지막 확인: ' + loadedAt + ' &nbsp;·&nbsp; ',
      '  <button style="background:none;border:none;color:#58a6ff;cursor:pointer;',
      '    font-size:10px;padding:0;text-decoration:underline" ',
      '    onclick="if(window.TechSysLabBootstrap){window.TechSysLabBootstrap.reload();}">',
      '    데이터 새로고침',
      '  </button>',
      '</div>',
      '<details id="tsl-admin-diag-details">',
      '  <summary>고급 진단 (서버 응답 원본)</summary>',
      '  <pre>' + diagJson.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>',
      '</details>'
    ].join('');
  }

  function renderOffline(c, data) {
    var ts = data.loadedAt
      ? new Date(data.loadedAt).toLocaleString('ko-KR')
      : '—';

    c.innerHTML = [
      '<div class="tsl-asc-head">',
      '  <span class="tsl-asc-dot" style="background:#f85149"></span>',
      '  <span style="color:#f85149">서버 DB 연결 실패</span>',
      '</div>',
      '<div class="tsl-asc-offline">',
      '  <strong>⚠ 서버 데이터 연결이 필요합니다.</strong>',
      '  회사 서버 PC 또는 api.techsyslab.com 상태를 확인하세요.<br>',
      '  <span style="font-size:10px;opacity:.7">현재 화면은 운영 데이터 기준으로 표시할 수 없습니다.</span>',
      '</div>',
      '<div class="tsl-asc-footer">',
      '  확인 항목: FastAPI 실행 · Cloudflared 실행 · 서버 PC 전원 &nbsp;·&nbsp; ',
      '  <button style="background:none;border:none;color:#58a6ff;cursor:pointer;',
      '    font-size:10px;padding:0;text-decoration:underline" ',
      '    onclick="if(window.TechSysLabBootstrap){window.TechSysLabBootstrap.reload();}">',
      '    재연결 시도',
      '  </button>',
      '</div>'
    ].join('');
  }

  function ensureContainer() {
    var existing = document.getElementById(CARD_ID);
    if (existing) return existing;

    if (!document.getElementById('tsl-admin-server-card-style')) {
      var s = document.createElement('style');
      s.id = 'tsl-admin-server-card-style';
      s.textContent = CARD_CSS;
      document.head.appendChild(s);
    }

    var card = document.createElement('div');
    card.id = CARD_ID;

    var dashPage = document.getElementById('page-dash');
    if (dashPage) {
      dashPage.insertBefore(card, dashPage.firstChild);
    } else {
      var main = document.querySelector('.content-area') ||
                 document.querySelector('#content') ||
                 document.querySelector('main') ||
                 document.body;
      main.insertBefore(card, main.firstChild);
    }
    return card;
  }

  function bindEvents() {
    document.addEventListener('tsl:server-data-loading', function () {
      var c = ensureContainer();
      renderLoading(c);
    });

    document.addEventListener('tsl:server-data-ready', function (e) {
      var c = ensureContainer();
      renderReady(c, e.detail || window.TechSysLabServerData);
    });

    document.addEventListener('tsl:server-data-offline', function (e) {
      var c = ensureContainer();
      renderOffline(c, e.detail || window.TechSysLabServerData);
    });

    var existing = window.TechSysLabServerData;
    if (existing) {
      if (existing.status === 'READY') {
        renderReady(ensureContainer(), existing);
      } else if (existing.status === 'OFFLINE' || existing.status === 'ERROR') {
        renderOffline(ensureContainer(), existing);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

})();
