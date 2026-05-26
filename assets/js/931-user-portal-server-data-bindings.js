/**
 * TechSysLab Phase 14B — User Portal Server Data Bindings
 * 파일: assets/js/931-user-portal-server-data-bindings.js
 * 버전: PHASE14B_v1.0
 *
 * 역할:
 *   - 930-server-data-bootstrap.js 이벤트 수신
 *   - 사용자 포털 대시보드의 서버 데이터 상태 카드 렌더링
 *   - 기존 대시보드/생산일정/품질관리 페이지 화면 구조 유지 (대체 금지)
 *   - 서버 연결 실패 시 명확한 안내 표시 (가짜 데이터 표시 절대 금지)
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     상태 카드 컨테이너 ID
  ────────────────────────────────────────── */
  var CARD_ID = 'tsl-server-status-card';

  /* ──────────────────────────────────────────
     카드 CSS (인라인 — 외부 CSS 의존 없음)
  ────────────────────────────────────────── */
  var CARD_CSS = [
    '#tsl-server-status-card{',
    '  margin:12px 0;padding:14px 16px;border-radius:12px;',
    '  border:1px solid rgba(255,255,255,.1);',
    '  background:rgba(22,27,34,.85);',
    '  font-size:12px;line-height:1.6;',
    '}',
    '#tsl-server-status-card .tsl-sc-head{',
    '  display:flex;align-items:center;gap:8px;margin-bottom:10px;',
    '  font-weight:700;font-size:13px;',
    '}',
    '#tsl-server-status-card .tsl-sc-dot{',
    '  width:9px;height:9px;border-radius:50%;flex-shrink:0;',
    '}',
    '#tsl-server-status-card .tsl-sc-grid{',
    '  display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;',
    '}',
    '#tsl-server-status-card .tsl-sc-item{',
    '  background:rgba(255,255,255,.04);border-radius:8px;',
    '  padding:8px 10px;text-align:center;',
    '}',
    '#tsl-server-status-card .tsl-sc-val{',
    '  font-size:22px;font-weight:800;letter-spacing:-0.5px;',
    '}',
    '#tsl-server-status-card .tsl-sc-lbl{',
    '  font-size:10px;color:var(--ts,#8b949e);margin-top:2px;',
    '}',
    '#tsl-server-status-card .tsl-sc-footer{',
    '  margin-top:10px;padding-top:8px;',
    '  border-top:1px solid rgba(255,255,255,.06);',
    '  color:var(--ts,#8b949e);font-size:10px;',
    '}',
    '#tsl-server-status-card .tsl-sc-offline{',
    '  padding:10px 12px;border-radius:8px;',
    '  background:rgba(248,81,73,.08);',
    '  border:1px solid rgba(248,81,73,.2);',
    '  color:var(--rd,#f85149);',
    '}',
    '#tsl-server-status-card .tsl-sc-offline strong{display:block;margin-bottom:4px;}'
  ].join('\n');

  /* ──────────────────────────────────────────
     포탈 로딩 중 카드 렌더
  ────────────────────────────────────────── */
  function renderLoading(container) {
    container.innerHTML = [
      '<div class="tsl-sc-head">',
      '  <span class="tsl-sc-dot" style="background:#8b949e"></span>',
      '  <span style="color:var(--ts,#8b949e)">서버 데이터 로딩 중...</span>',
      '</div>'
    ].join('');
  }

  /* ──────────────────────────────────────────
     서버 READY 시 카드 렌더
  ────────────────────────────────────────── */
  function renderReady(container, data) {
    var c = data.counts || {};
    var scheduleCount  = c.scheduleRowCount  != null ? c.scheduleRowCount  : '—';
    var qualityCount   = c.qualityIssueCount  != null ? c.qualityIssueCount  : '—';
    var uploadCount    = c.uploadHistoryCount != null ? c.uploadHistoryCount : '—';
    var rollbackCount  = c.rollbackEventCount != null ? c.rollbackEventCount : '0';

    var loadedAt = data.loadedAt
      ? new Date(data.loadedAt).toLocaleString('ko-KR')
      : '—';

    container.innerHTML = [
      '<div class="tsl-sc-head">',
      '  <span class="tsl-sc-dot" style="background:#3fb950"></span>',
      '  <span style="color:var(--gr,#3fb950)">서버 데이터 연결됨</span>',
      '  <span style="margin-left:auto;color:var(--ts,#8b949e);font-size:10px;font-weight:400">서버 DB 기준</span>',
      '</div>',
      '<div class="tsl-sc-grid">',
      '  <div class="tsl-sc-item">',
      '    <div class="tsl-sc-val" style="color:var(--ac,#58a6ff)">' + scheduleCount + '</div>',
      '    <div class="tsl-sc-lbl">생산일정 반영 행</div>',
      '  </div>',
      '  <div class="tsl-sc-item">',
      '    <div class="tsl-sc-val" style="color:var(--am,#d29922)">' + qualityCount + '</div>',
      '    <div class="tsl-sc-lbl">품질 이슈 반영</div>',
      '  </div>',
      '  <div class="tsl-sc-item">',
      '    <div class="tsl-sc-val" style="color:var(--gr,#3fb950)">' + uploadCount + '</div>',
      '    <div class="tsl-sc-lbl">업로드 이력</div>',
      '  </div>',
      '  <div class="tsl-sc-item">',
      '    <div class="tsl-sc-val" style="color:var(--ts,#8b949e)">' + rollbackCount + '</div>',
      '    <div class="tsl-sc-lbl">Rollback 이벤트</div>',
      '  </div>',
      '</div>',
      '<div class="tsl-sc-footer">',
      '  마지막 확인: ' + loadedAt + ' &nbsp;·&nbsp; ',
      '  <button style="background:none;border:none;color:var(--ac,#58a6ff);cursor:pointer;',
      '    font-size:10px;padding:0;text-decoration:underline" ',
      '    onclick="if(window.TechSysLabBootstrap){window.TechSysLabBootstrap.reload();}">',
      '    새로고침',
      '  </button>',
      '</div>'
    ].join('');
  }

  /* ──────────────────────────────────────────
     서버 OFFLINE/ERROR 시 카드 렌더
  ────────────────────────────────────────── */
  function renderOffline(container, data) {
    container.innerHTML = [
      '<div class="tsl-sc-head">',
      '  <span class="tsl-sc-dot" style="background:var(--rd,#f85149)"></span>',
      '  <span style="color:var(--rd,#f85149)">서버 데이터 연결 필요</span>',
      '</div>',
      '<div class="tsl-sc-offline">',
      '  <strong>⚠ 운영 데이터를 표시할 수 없습니다.</strong>',
      '  서버 데이터 연결이 필요합니다.<br>',
      '  회사 서버 PC 또는 api.techsyslab.com 상태를 확인하세요.<br>',
      '  <span style="font-size:10px;opacity:.7">현재 화면은 운영 데이터 기준으로 표시할 수 없습니다.</span>',
      '</div>',
      '<div class="tsl-sc-footer">',
      '  확인 항목: FastAPI 서버 실행 여부 · Cloudflared 실행 여부 · 서버 PC 전원 &nbsp;·&nbsp; ',
      '  <button style="background:none;border:none;color:var(--ac,#58a6ff);cursor:pointer;',
      '    font-size:10px;padding:0;text-decoration:underline" ',
      '    onclick="if(window.TechSysLabBootstrap){window.TechSysLabBootstrap.reload();}">',
      '    재연결 시도',
      '  </button>',
      '</div>'
    ].join('');
  }

  /* ──────────────────────────────────────────
     카드 컨테이너 삽입 — 대시보드 페이지 상단
  ────────────────────────────────────────── */
  function ensureContainer() {
    var existing = document.getElementById(CARD_ID);
    if (existing) return existing;

    /* 스타일 삽입 */
    if (!document.getElementById('tsl-server-status-card-style')) {
      var s = document.createElement('style');
      s.id = 'tsl-server-status-card-style';
      s.textContent = CARD_CSS;
      document.head.appendChild(s);
    }

    var card = document.createElement('div');
    card.id = CARD_ID;

    /* #page-dashboard 최상단에 삽입 */
    var dashPage = document.getElementById('page-dashboard');
    if (dashPage) {
      dashPage.insertBefore(card, dashPage.firstChild);
    } else {
      /* fallback — body 최상단 main 컨테이너 탐색 */
      var main = document.querySelector('.content-area') ||
                 document.querySelector('#content') ||
                 document.querySelector('main') ||
                 document.body;
      main.insertBefore(card, main.firstChild);
    }
    return card;
  }

  /* ──────────────────────────────────────────
     이벤트 리스너
  ────────────────────────────────────────── */
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

    /* 이미 부트스트랩 완료된 경우 즉시 렌더 */
    var existing = window.TechSysLabServerData;
    if (existing) {
      if (existing.status === 'READY') {
        var c = ensureContainer();
        renderReady(c, existing);
      } else if (existing.status === 'OFFLINE' || existing.status === 'ERROR') {
        var c2 = ensureContainer();
        renderOffline(c2, existing);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

})();
