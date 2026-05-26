/**
 * TechSysLab Phase 14F — User Portal Force Inline Server Apply
 * 목적:
 * - 상단 별도 서버 현황판을 만들지 않는다.
 * - 관리자 업로드 결과를 사용자 포털의 기존 종합현황/운영포커스/품질 카드 안에 직접 반영한다.
 * - 기존 스크립트가 나중에 "데이터 없음"으로 덮어써도 재적용한다.
 */
(function () {
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';
  var TIMER_KEY = '__tslPhase14FForceInlineTimer';
  var LAST_DATA_KEY = '__tslPhase14FLastData';
  var APPLY_CLASS = 'tsl-server-inline-applied';

  function hasAccess() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1' || document.documentElement.classList.contains('tsl-auth-unlocked');
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
    if (payload.result && Array.isArray(payload.result.rows)) return payload.result.rows;
    return [];
  }

  function fetchJson(path) {
    return fetch(API_BASE + path, { cache: 'no-store', credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error(path + ' HTTP ' + res.status);
        return res.json();
      });
  }

  function shortName(v, n) {
    var s = String(v == null ? '-' : v);
    n = n || 38;
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  function latestByType(uploads, type) {
    var rows = rowsOf(uploads);
    for (var i = 0; i < rows.length; i += 1) {
      if (String(rows[i].upload_type || '').toLowerCase() === type) return rows[i];
    }
    return null;
  }

  function removeBadPanels() {
    [
      'tsl-user-live-server-apply-panel',
      'tsl-user-live-server-apply-style'
    ].forEach(function (id) {
      var el = $(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    document.querySelectorAll('[id*="server-apply-panel"], [id*="live-server-apply-panel"]').forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function setText(id, text) {
    var el = $(id);
    if (el) {
      el.textContent = text;
      el.classList.add(APPLY_CLASS);
    }
  }

  function setHtml(id, html) {
    var el = $(id);
    if (el) {
      el.innerHTML = html;
      el.classList.add(APPLY_CLASS);
    }
  }

  function ensureStyle() {
    if ($('tsl-phase14f-style')) return;
    var style = document.createElement('style');
    style.id = 'tsl-phase14f-style';
    style.textContent = [
      '.tsl-inline-box{border:1px solid var(--bd);border-radius:9px;background:rgba(88,166,255,.055);padding:10px 12px}',
      '.tsl-inline-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '.tsl-inline-k{font-size:10px;color:var(--tm);font-weight:700;margin-bottom:4px}',
      '.tsl-inline-v{font-size:22px;font-weight:900;color:var(--ac);line-height:1.1}',
      '.tsl-inline-n{font-size:10px;color:var(--ts);line-height:1.55;margin-top:4px}',
      '.tsl-inline-table{width:100%;border-collapse:collapse;font-size:10px}',
      '.tsl-inline-table th{padding:6px 7px;text-align:left;color:var(--tm);background:var(--bd)}',
      '.tsl-inline-table td{padding:7px;border-bottom:1px solid var(--bd);color:var(--ts);vertical-align:top}',
      '.tsl-inline-ok{color:var(--gr)!important}',
      '.tsl-inline-warn{color:var(--am)!important}',
      '@media(max-width:900px){.tsl-inline-grid{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function metric(label, value, note) {
    return '<div class="tsl-inline-box"><div class="tsl-inline-k">' + esc(label) + '</div>' +
      '<div class="tsl-inline-v">' + esc(value) + '</div>' +
      '<div class="tsl-inline-n">' + esc(note || '서버 DB 기준') + '</div></div>';
  }

  function uploadNote(upload, empty) {
    if (!upload) return '<div class="tsl-inline-n">' + esc(empty || '업로드 없음') + '</div>';
    return '<div class="tsl-inline-n">파일: <b style="color:var(--tp)">' + esc(shortName(upload.original_filename, 46)) + '</b><br>' +
      '반영 행: <b style="color:var(--tp)">' + esc(upload.row_count || 0) + '</b> · 상태: <b style="color:var(--tp)">' + esc(upload.status || '-') + '</b><br>' +
      '시간: ' + esc(upload.uploaded_at || '-') + '</div>';
  }

  function pick(obj, names) {
    if (!obj) return '';
    for (var i = 0; i < names.length; i += 1) {
      if (obj[names[i]] != null && obj[names[i]] !== '') return obj[names[i]];
    }
    return '';
  }

  function scheduleTable(payload) {
    var rows = rowsOf(payload).slice(0, 8);
    if (!rows.length) return '<div class="tsl-inline-box"><div class="tsl-inline-n">서버 생산일정 행 수는 반영됐지만, 미리보기 행을 가져오지 못했습니다.</div></div>';
    return '<table class="tsl-inline-table"><thead><tr>' +
      '<th>호기/대상</th><th>모델/품명</th><th>상태</th><th>일정</th><th>비고</th>' +
      '</tr></thead><tbody>' + rows.map(function (r) {
        var unit = pick(r, ['unit', 'machine', 'machine_no', '호기', '장비', 'cell', 'CELL', 'id']) || '-';
        var model = pick(r, ['model', 'model_name', 'product', '품명', '모델', 'project', 'name']) || '-';
        var status = pick(r, ['status', '상태', 'progress_status', 'phase']) || '-';
        var date = pick(r, ['ship_date', 'due_date', 'date', 'start_date', 'end_date', '출고일', '생산일', '납기']) || '-';
        var note = pick(r, ['note', 'memo', 'remark', '비고', '업체', 'customer']) || '';
        return '<tr><td>' + esc(shortName(unit, 18)) + '</td><td>' + esc(shortName(model, 24)) + '</td><td>' + esc(shortName(status, 18)) + '</td><td>' + esc(shortName(date, 20)) + '</td><td>' + esc(shortName(note, 24)) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function qualityTable(payload) {
    var rows = rowsOf(payload).slice(0, 8);
    if (!rows.length) return '<div class="tsl-inline-box"><div class="tsl-inline-n">서버 품질/불량 행 수는 반영됐지만, 미리보기 행을 가져오지 못했습니다.</div></div>';
    return '<table class="tsl-inline-table"><thead><tr>' +
      '<th>상태</th><th>품명/모델</th><th>불량/내용</th><th>공정</th><th>일자</th>' +
      '</tr></thead><tbody>' + rows.map(function (r) {
        var status = pick(r, ['status', '상태', 'issue_status']) || '-';
        var model = pick(r, ['model', 'model_name', '품명', '모델', 'product']) || '-';
        var issue = pick(r, ['issue', 'defect', 'defect_name', '불량', '내용', 'description']) || '-';
        var process = pick(r, ['process', '공정', 'part', '파트']) || '-';
        var date = pick(r, ['date', 'created_at', '일자', '접수일']) || '-';
        return '<tr><td>' + esc(shortName(status, 16)) + '</td><td>' + esc(shortName(model, 22)) + '</td><td>' + esc(shortName(issue, 28)) + '</td><td>' + esc(shortName(process, 16)) + '</td><td>' + esc(shortName(date, 18)) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function setDashboardSubtitle() {
    var page = $('page-dashboard');
    if (!page) return;
    var sub = page.querySelector('.pg-sub');
    if (sub) sub.textContent = '서버 DB 기준 · 관리자 업로드 반영 · api.techsyslab.com 연결';
  }

  function applyDashboard(data) {
    var db = (data.health && data.health.db) || {};
    var uploads = data.uploads || {};
    var scheduleCount = Number(db.scheduleRowCount || 0);
    var qualityCount = Number(db.qualityIssueCount || 0);
    var uploadCount = Number(db.uploadHistoryCount || 0);
    var activeFiles = Number(db.activeSourceFileCount || 0);
    var latestSchedule = latestByType(uploads, 'schedule');
    var latestQuality = latestByType(uploads, 'quality');

    setDashboardSubtitle();

    // KPI row
    setText('kpi-yangsan', scheduleCount);
    setText('kpi-yeonju', uploadCount);
    setText('kpi-delay-val', 0);
    setText('kpi-done-val', activeFiles);

    // Summary notes
    setText('sn-prod-count', scheduleCount);
    setText('sn-ship-count', uploadCount);
    setText('sn-delay-count', 0);
    setText('sn-done-count', activeFiles);
    setText('sn-raw-count', qualityCount);
    setText('sn-raw-label', '서버 quality_issues 기준');
    setText('sn-issue-count', qualityCount);
    setText('sn-img-count', '-');
    setText('sn-img-label', '이미지 별도 연동 예정');
    setText('sn-data-status', '서버 DB 기준');
    setText('sn-data-label', 'api.techsyslab.com 연결됨');

    setHtml('dash-status-summary',
      '<div class="tsl-inline-grid">' +
      metric('생산일정 반영 행', scheduleCount, '서버 schedule_rows 기준') +
      metric('최근 생산일정 파일', latestSchedule ? (latestSchedule.row_count || 0) + '행' : '없음', latestSchedule ? shortName(latestSchedule.original_filename, 38) : '업로드 필요') +
      '</div>' + uploadNote(latestSchedule, '생산일정 업로드 필요')
    );

    setHtml('dash-monthly-output',
      '<div class="tsl-inline-grid">' +
      metric('업로드 이력', uploadCount, '누적 이력') +
      metric('활성 원본 파일', activeFiles, 'source_files 원본 기준') +
      '</div>'
    );

    setHtml('dash-quality-rate',
      '<div class="tsl-inline-grid">' +
      metric('품질/불량 반영 행', qualityCount, '서버 quality_issues 기준') +
      metric('최근 품질 파일', latestQuality ? (latestQuality.row_count || 0) + '행' : '없음', latestQuality ? shortName(latestQuality.original_filename, 38) : '업로드 필요') +
      '</div>' + uploadNote(latestQuality, '품질/불량 업로드 필요')
    );

    setHtml('dash-progress', scheduleTable(data.scheduleRows));
  }

  function applySchedulePage(data) {
    var db = (data.health && data.health.db) || {};
    var scheduleCount = Number(db.scheduleRowCount || 0);
    setText('sp-status', scheduleCount ? '서버 DB 반영됨' : '서버 DB 연결됨 / 생산일정 없음');
    setText('sp-saved-at', '서버 확인: ' + new Date().toLocaleString('ko-KR'));
    setText('card-total-y', scheduleCount);
    setText('card-ok-y', scheduleCount);
    setText('card-err-y', 0);
    setHtml('sched-preview', scheduleTable(data.scheduleRows));
  }

  function applyQuality(data) {
    var db = (data.health && data.health.db) || {};
    var qualityCount = Number(db.qualityIssueCount || 0);
    setText('qdash-badge', qualityCount ? ('서버 DB ' + qualityCount + '건') : '서버 DB 연결됨');
    setText('qmain-badge', qualityCount ? ('서버 DB ' + qualityCount + '건') : '서버 DB 연결됨');
    setText('uh2-qual-rows', qualityCount);
    setText('dl2-qual-cnt', qualityCount);

    var content = $('qdash-content');
    var empty = $('qdash-empty');
    if (content) {
      content.style.display = '';
      content.innerHTML = '<div class="tsl-inline-grid" style="margin-bottom:10px">' +
        metric('품질/불량 반영 행', qualityCount, '서버 quality_issues 기준') +
        metric('데이터 기준', '서버 DB', '관리자 업로드 반영') +
        '</div>' + qualityTable(data.qualityRows);
    }
    if (empty && qualityCount) empty.style.display = 'none';

    var issuesEmpty = $('qmain-issues-empty');
    var issuesContent = $('qmain-issues-content');
    if (issuesContent) {
      issuesContent.style.display = '';
      issuesContent.innerHTML = qualityTable(data.qualityRows);
    }
    if (issuesEmpty && qualityCount) issuesEmpty.style.display = 'none';
  }

  function replaceVisibleEmptyText(data) {
    // 기존 스크립트가 남긴 "데이터 없음" 문구를 서버 DB 기준 문구로 보정한다.
    var db = (data.health && data.health.db) || {};
    var scheduleCount = Number(db.scheduleRowCount || 0);
    var qualityCount = Number(db.qualityIssueCount || 0);
    var texts = [
      ['생산일정 데이터 없음', '서버 DB 생산일정 ' + scheduleCount + '행 반영됨'],
      ['생산일정 데이터가 없습니다.', '서버 DB 생산일정 ' + scheduleCount + '행 반영됨'],
      ['생산일정 업로드 후 표시됩니다', '서버 DB 생산일정 ' + scheduleCount + '행 반영됨'],
      ['품질 데이터가 없습니다', '서버 DB 품질/불량 ' + qualityCount + '행 반영됨'],
      ['파일을 업로드하면 불량 이슈가 표시됩니다.', '서버 DB 품질/불량 ' + qualityCount + '행 반영됨']
    ];
    var nodes = Array.prototype.slice.call(document.querySelectorAll('div,td,span'));
    nodes.forEach(function (el) {
      if (!el || el.children.length) return;
      var t = (el.textContent || '').trim();
      texts.forEach(function (pair) {
        if (t === pair[0] || t.indexOf(pair[0]) >= 0) {
          el.textContent = pair[1];
          el.classList.add(APPLY_CLASS);
          el.style.color = 'var(--ts)';
        }
      });
    });
  }

  function applyAll(data) {
    ensureStyle();
    removeBadPanels();
    window[LAST_DATA_KEY] = data;
    applyDashboard(data);
    applySchedulePage(data);
    applyQuality(data);
    replaceVisibleEmptyText(data);
  }

  function renderError(err) {
    ensureStyle();
    removeBadPanels();
    setText('sn-data-status', '서버 연결 실패');
    setText('sn-data-label', 'api.techsyslab.com 확인 필요');
    setHtml('dash-status-summary', '<div class="tsl-inline-box"><div class="tsl-inline-k">서버 데이터 연결 실패</div><div class="tsl-inline-n">' + esc(err && err.message || err) + '</div></div>');
  }

  function load() {
    if (!hasAccess()) return;
    return Promise.allSettled([
      fetchJson('/api/health'),
      fetchJson('/api/public/uploads'),
      fetchJson('/api/schedule?limit=8'),
      fetchJson('/api/quality/issues?limit=8')
    ]).then(function (res) {
      if (res[0].status !== 'fulfilled') throw res[0].reason;
      applyAll({
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
    // 기존 페이지 스크립트가 나중에 빈 상태로 덮는 문제를 막기 위해 짧게 여러 번 재적용한다.
    [300, 900, 1600, 3000, 5000].forEach(function (ms) {
      setTimeout(function () {
        if (window[LAST_DATA_KEY]) applyAll(window[LAST_DATA_KEY]);
        else load();
      }, ms);
    });
    if (!window[TIMER_KEY]) {
      window[TIMER_KEY] = setInterval(function () {
        if (hasAccess()) load();
      }, 30000);
    }
  }

  window.TechSysLabUserPortalForceInlineApply = { refresh: load, apply: applyAll };
  document.addEventListener('tsl:gate-unlocked', boot);
  document.addEventListener('DOMContentLoaded', function () {
    removeBadPanels();
    setTimeout(boot, 100);
    setTimeout(boot, 1000);
  });
})();
