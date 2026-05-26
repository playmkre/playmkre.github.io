/**
 * TechSysLab Phase 14E — User Portal Inline Server Apply
 * - 상단 대형 서버 DB 패널 제거
 * - 기존 사용자 포털 카드/대시보드 영역에 서버 DB 값을 직접 반영
 * - 관리자 업로드 결과를 사용자 포털 안의 기존 영역으로 표시
 */
(function () {
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';
  var TIMER_KEY = '__tslUserInlineApplyTimer';
  var AUTO_REFRESH_MS = 30000;

  function hasAccess() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1' ||
        document.documentElement.classList.contains('tsl-auth-unlocked');
    } catch (e) {
      return document.documentElement.classList.contains('tsl-auth-unlocked');
    }
  }

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function rowsOf(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.rows)) return payload.rows;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function fetchJson(path) {
    return fetch(API_BASE + path, { cache: 'no-store', credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error(path + ' HTTP ' + res.status);
        return res.json();
      });
  }

  function shortName(name) {
    var s = String(name || '-');
    return s.length > 34 ? s.slice(0, 34) + '…' : s;
  }

  function removeOldPanel() {
    var ids = [
      'tsl-user-live-server-apply-panel',
      'tsl-user-live-server-apply-style'
    ];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function setHtml(id, html) {
    var el = $(id);
    if (el) el.innerHTML = html;
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function latestByType(uploads, type) {
    var rows = rowsOf(uploads);
    for (var i = 0; i < rows.length; i += 1) {
      if (String(rows[i].upload_type || '').toLowerCase() === type) return rows[i];
    }
    return null;
  }

  function statusPill(label, value, note) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--sf);border:1px solid var(--bd);border-radius:8px;padding:8px 10px">' +
      '<div><div style="font-size:10px;color:var(--tm);font-weight:700">' + esc(label) + '</div>' +
      '<div style="font-size:10px;color:var(--ts);margin-top:3px">' + esc(note || '서버 DB 기준') + '</div></div>' +
      '<div style="font-size:20px;font-weight:900;color:var(--ac)">' + esc(value) + '</div>' +
      '</div>';
  }

  function uploadMini(latest, fallback) {
    if (!latest) return '<div style="font-size:10px;color:var(--tm);padding:10px 0;text-align:center">' + esc(fallback) + '</div>';
    return '<div style="font-size:10px;color:var(--ts);line-height:1.65">' +
      '<div><b style="color:var(--tp)">파일</b> ' + esc(shortName(latest.original_filename)) + '</div>' +
      '<div><b style="color:var(--tp)">행</b> ' + esc(latest.row_count || 0) + ' · <b style="color:var(--tp)">상태</b> ' + esc(latest.status || '-') + '</div>' +
      '<div><b style="color:var(--tp)">반영</b> ' + esc(latest.uploaded_at || '-') + '</div>' +
      '</div>';
  }

  function genericRowsTable(rows, emptyText) {
    rows = rowsOf(rows).slice(0, 5);
    if (!rows.length) return '<div style="padding:14px;text-align:center;color:var(--tm);font-size:10px;border:1px dashed var(--bd);border-radius:8px">' + esc(emptyText) + '</div>';
    var keys = [];
    rows.forEach(function (r) {
      Object.keys(r || {}).forEach(function (k) {
        if (keys.length < 5 && keys.indexOf(k) < 0 && !/raw|payload|detail|note/i.test(k)) keys.push(k);
      });
    });
    if (!keys.length) keys = Object.keys(rows[0] || {}).slice(0, 5);
    return '<table style="width:100%;border-collapse:collapse;font-size:10px">' +
      '<thead><tr style="background:var(--bd)">' + keys.map(function(k){ return '<th style="padding:5px 6px;text-align:left;color:var(--tm)">' + esc(k) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + rows.map(function(r){ return '<tr>' + keys.map(function(k){ return '<td style="padding:6px;border-bottom:1px solid var(--bd);color:var(--ts)">' + esc(shortName(r && r[k])) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>' +
      '</table>';
  }

  function updateTopBadges(health) {
    var db = (health && health.db) || {};
    setText('sn-data-status', '서버 DB 기준');
    setText('sn-data-label', 'api.techsyslab.com 연결됨');
    setText('data-save-status', '서버 DB 반영됨');
    setText('data-upload-hint', '관리자 포털 업로드 결과를 서버 DB 기준으로 표시 중입니다.');
    if ($('sn-issue-count')) setText('sn-issue-count', db.qualityIssueCount || 0);
    if ($('sn-raw-count')) setText('sn-raw-count', db.qualityIssueCount || 0);
    if ($('sn-raw-label')) setText('sn-raw-label', '서버 품질 데이터');
  }

  function updateDashboard(data) {
    var health = data.health || {};
    var db = health.db || {};
    var uploads = data.uploads || {};
    var latestSchedule = latestByType(uploads, 'schedule');
    var latestQuality = latestByType(uploads, 'quality');
    var scheduleCount = db.scheduleRowCount || 0;
    var qualityCount = db.qualityIssueCount || 0;

    setHtml('dash-status-summary',
      statusPill('생산일정 서버 반영', scheduleCount + '행', latestSchedule ? shortName(latestSchedule.original_filename) : '생산일정 최신 업로드 없음') +
      '<div style="margin-top:8px">' + uploadMini(latestSchedule, '생산일정 업로드 후 표시') + '</div>'
    );

    setHtml('dash-monthly-output',
      statusPill('업로드/원본 기준', (db.activeSourceFileCount || 0) + '개', '활성 원본 파일') +
      '<div style="margin-top:8px;font-size:10px;color:var(--tm)">업로드 이력 ' + esc(db.uploadHistoryCount || 0) + '건 · 서버 DB: ' + esc(db.path || '-') + '</div>'
    );

    setHtml('dash-quality-rate',
      statusPill('품질/불량 서버 반영', qualityCount + '행', latestQuality ? shortName(latestQuality.original_filename) : '품질 최신 업로드 없음') +
      '<div style="margin-top:8px">' + uploadMini(latestQuality, '품질/불량 업로드 후 표시') + '</div>'
    );

    setHtml('dash-progress', genericRowsTable(data.scheduleRows, '서버 생산일정 데이터가 아직 없습니다.'));
  }

  function updateSchedulePage(data) {
    var health = data.health || {};
    var db = health.db || {};
    var scheduleCount = db.scheduleRowCount || 0;
    var rows = rowsOf(data.scheduleRows);
    setText('sp-status', scheduleCount ? '서버 DB 반영됨' : '서버 DB 연결됨 / 생산일정 없음');
    setText('sp-saved-at', '서버 확인: ' + new Date().toLocaleString('ko-KR'));
    setText('card-total-y', scheduleCount);
    setText('card-ok-y', scheduleCount);
    setText('card-err-y', 0);
    setText('card-total-r', 0);
    setText('card-ok-r', 0);
    setText('card-err-r', 0);
    setHtml('sched-preview', genericRowsTable(rows, '서버 생산일정 데이터가 아직 없습니다.'));
  }

  function updateQualityPage(data) {
    var health = data.health || {};
    var db = health.db || {};
    var qualityCount = db.qualityIssueCount || 0;
    setText('qdash-badge', qualityCount ? ('서버 DB ' + qualityCount + '건') : '서버 DB 연결됨');
    var empty = $('qdash-empty');
    var content = $('qdash-content');
    if (content) {
      content.style.display = '';
      content.innerHTML = '<div class="cards" style="margin-bottom:12px">' +
        '<div class="card"><div class="card-lbl">품질/불량 반영 행</div><div class="card-num">' + esc(qualityCount) + '</div></div>' +
        '<div class="card"><div class="card-lbl">서버 기준</div><div style="font-size:12px;color:var(--ts);line-height:1.7">api.techsyslab.com<br>quality_issues 기준</div></div>' +
        '</div>' +
        genericRowsTable(data.qualityRows, '서버 품질/불량 데이터가 아직 없습니다.');
    }
    if (empty && qualityCount) empty.style.display = 'none';
  }

  function renderError(err) {
    removeOldPanel();
    setHtml('dash-status-summary', '<div style="font-size:10px;color:var(--rd);padding:12px;text-align:center">서버 데이터 연결 실패: ' + esc(err && err.message || err) + '</div>');
    setText('sn-data-status', '서버 연결 실패');
    setText('sn-data-label', 'api.techsyslab.com 상태 확인 필요');
  }

  function apply(data) {
    removeOldPanel();
    updateTopBadges(data.health);
    updateDashboard(data);
    updateSchedulePage(data);
    updateQualityPage(data);
    window.TechSysLabServerInlineData = data;
  }

  function load() {
    if (!hasAccess()) return;
    removeOldPanel();
    Promise.allSettled([
      fetchJson('/api/health'),
      fetchJson('/api/public/uploads'),
      fetchJson('/api/schedule?limit=8'),
      fetchJson('/api/quality/issues?limit=8')
    ]).then(function (res) {
      if (res[0].status !== 'fulfilled') throw res[0].reason;
      apply({
        health: res[0].value,
        uploads: res[1].status === 'fulfilled' ? res[1].value : null,
        scheduleRows: res[2].status === 'fulfilled' ? res[2].value : null,
        qualityRows: res[3].status === 'fulfilled' ? res[3].value : null
      });
    }).catch(renderError);
  }

  function boot() {
    if (!hasAccess()) return;
    load();
    if (!window[TIMER_KEY]) {
      window[TIMER_KEY] = setInterval(function () {
        if (hasAccess()) load();
      }, AUTO_REFRESH_MS);
    }
  }

  window.TechSysLabUserPortalInlineApply = { refresh: load };
  document.addEventListener('tsl:gate-unlocked', boot);
  document.addEventListener('DOMContentLoaded', function () {
    removeOldPanel();
    setTimeout(boot, 200);
    setTimeout(boot, 1000);
  });
})();
