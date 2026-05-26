/**
 * TechSysLab Phase 14B — Server Data Bootstrap
 * 파일: assets/js/930-server-data-bootstrap.js
 * 버전: PHASE14B_v1.0
 *
 * 역할:
 *   - 임시 로그인 게이트 통과 확인 후 서버 API에서 운영 데이터 로딩
 *   - window.TechSysLabServerData 전역 상태 관리
 *   - 로딩 결과를 DOM 커스텀 이벤트로 발행
 *
 * 절대 금지:
 *   - localStorage에서 운영 데이터 읽기
 *   - 가짜 데이터(fallback seed) 표시
 *   - 920-auth-gate.js 재삽입
 *   - /api/auth/login 기반 인증 호출
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     상수
  ────────────────────────────────────────── */
  var API_BASE = 'https://api.techsyslab.com';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';
  var BOOTSTRAP_DONE_KEY = 'tsl.bootstrap.done';   // sessionStorage — 중복 실행 방지
  var TIMEOUT_MS = 10000;

  /* ──────────────────────────────────────────
     전역 상태 초기화
  ────────────────────────────────────────── */
  window.TechSysLabServerData = window.TechSysLabServerData || {
    status: 'PENDING',   // PENDING | READY | OFFLINE | ERROR
    apiBase: API_BASE,
    health: null,
    counts: {
      uploadHistoryCount: null,
      scheduleRowCount: null,
      qualityIssueCount: null,
      rollbackEventCount: null
    },
    sourceFiles: null,
    loadedAt: null,
    errorMessage: null
  };

  /* ──────────────────────────────────────────
     헬퍼
  ────────────────────────────────────────── */
  function isGateUnlocked() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  function sessionGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  function emit(name, detail) {
    try {
      document.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
    } catch (e) {}
  }

  function fetchWithTimeout(url, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error('TIMEOUT:' + url));
      }, ms);
      fetch(url, { method: 'GET', cache: 'no-store' })
        .then(function (r) { clearTimeout(timer); resolve(r); })
        .catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  function safeJson(resp) {
    return resp.json().catch(function () { return {}; });
  }

  /* ──────────────────────────────────────────
     API 호출
  ────────────────────────────────────────── */
  function fetchHealth() {
    return fetchWithTimeout(API_BASE + '/api/health', TIMEOUT_MS)
      .then(function (r) {
        if (!r.ok) throw new Error('health HTTP ' + r.status);
        return safeJson(r);
      });
  }

  function fetchDashboard() {
    /* /api/dashboard 우선, 없으면 /api/user/readonly-preview fallback */
    return fetchWithTimeout(API_BASE + '/api/dashboard', TIMEOUT_MS)
      .then(function (r) {
        if (r.ok) return safeJson(r);
        return fetchWithTimeout(API_BASE + '/api/user/readonly-preview', TIMEOUT_MS)
          .then(function (r2) {
            if (!r2.ok) throw new Error('dashboard+preview HTTP ' + r2.status);
            return safeJson(r2);
          });
      });
  }

  function fetchScheduleSummary() {
    return fetchWithTimeout(API_BASE + '/api/user/schedule/summary', TIMEOUT_MS)
      .then(function (r) { return r.ok ? safeJson(r) : {}; })
      .catch(function () { return {}; });
  }

  function fetchQualitySummary() {
    return fetchWithTimeout(API_BASE + '/api/user/quality/summary', TIMEOUT_MS)
      .then(function (r) { return r.ok ? safeJson(r) : {}; })
      .catch(function () { return {}; });
  }

  function fetchSourceFileStatus() {
    return fetchWithTimeout(API_BASE + '/api/user/source-file-status', TIMEOUT_MS)
      .then(function (r) { return r.ok ? safeJson(r) : {}; })
      .catch(function () { return {}; });
  }

  /* ──────────────────────────────────────────
     카운트 추출 — 다양한 응답 구조 대응
  ────────────────────────────────────────── */
  function extractCounts(health, dashboard, schedule, quality, sourceFile) {
    var c = window.TechSysLabServerData.counts;

    /* health에서 추출 시도 */
    if (health) {
      if (health.scheduleRowCount != null) c.scheduleRowCount = health.scheduleRowCount;
      if (health.qualityIssueCount != null) c.qualityIssueCount = health.qualityIssueCount;
      if (health.uploadHistoryCount != null) c.uploadHistoryCount = health.uploadHistoryCount;
      if (health.rollbackEventCount != null) c.rollbackEventCount = health.rollbackEventCount;
      /* nested counts 구조 */
      if (health.counts) {
        if (health.counts.scheduleRowCount != null) c.scheduleRowCount = health.counts.scheduleRowCount;
        if (health.counts.qualityIssueCount != null) c.qualityIssueCount = health.counts.qualityIssueCount;
        if (health.counts.uploadHistoryCount != null) c.uploadHistoryCount = health.counts.uploadHistoryCount;
        if (health.counts.rollbackEventCount != null) c.rollbackEventCount = health.counts.rollbackEventCount;
      }
    }

    /* dashboard에서 추출 시도 */
    if (dashboard) {
      if (dashboard.scheduleRowCount != null) c.scheduleRowCount = dashboard.scheduleRowCount;
      if (dashboard.qualityIssueCount != null) c.qualityIssueCount = dashboard.qualityIssueCount;
      if (dashboard.uploadHistoryCount != null) c.uploadHistoryCount = dashboard.uploadHistoryCount;
      if (dashboard.rollbackEventCount != null) c.rollbackEventCount = dashboard.rollbackEventCount;
      if (dashboard.counts) {
        if (dashboard.counts.scheduleRowCount != null) c.scheduleRowCount = dashboard.counts.scheduleRowCount;
        if (dashboard.counts.qualityIssueCount != null) c.qualityIssueCount = dashboard.counts.qualityIssueCount;
        if (dashboard.counts.uploadHistoryCount != null) c.uploadHistoryCount = dashboard.counts.uploadHistoryCount;
        if (dashboard.counts.rollbackEventCount != null) c.rollbackEventCount = dashboard.counts.rollbackEventCount;
      }
    }

    /* schedule summary에서 추출 */
    if (schedule && schedule.counts) {
      if (schedule.counts.scheduleRowCount != null) c.scheduleRowCount = schedule.counts.scheduleRowCount;
    }
    if (schedule && schedule.scheduleRowCount != null) c.scheduleRowCount = schedule.scheduleRowCount;

    /* quality summary에서 추출 */
    if (quality && quality.counts) {
      if (quality.counts.qualityIssueCount != null) c.qualityIssueCount = quality.counts.qualityIssueCount;
    }
    if (quality && quality.qualityIssueCount != null) c.qualityIssueCount = quality.qualityIssueCount;

    /* source-file-status에서 추출 */
    if (sourceFile) {
      if (sourceFile.counts) {
        if (sourceFile.counts.scheduleRowCount != null) c.scheduleRowCount = sourceFile.counts.scheduleRowCount;
        if (sourceFile.counts.qualityIssueCount != null) c.qualityIssueCount = sourceFile.counts.qualityIssueCount;
        if (sourceFile.counts.uploadHistoryCount != null) c.uploadHistoryCount = sourceFile.counts.uploadHistoryCount;
      }
      if (sourceFile.sourceFiles) {
        window.TechSysLabServerData.sourceFiles = sourceFile.sourceFiles;
      }
    }
  }

  /* ──────────────────────────────────────────
     메인 부트스트랩 실행
  ────────────────────────────────────────── */
  function runBootstrap() {
    /* 이미 완료됐으면 재실행 건너뜀 */
    if (sessionGet(BOOTSTRAP_DONE_KEY) === 'READY') {
      emit('tsl:server-data-ready', window.TechSysLabServerData);
      return;
    }

    emit('tsl:server-data-loading', {});

    fetchHealth()
      .then(function (health) {
        window.TechSysLabServerData.health = health;

        return Promise.all([
          fetchDashboard().catch(function () { return {}; }),
          fetchScheduleSummary(),
          fetchQualitySummary(),
          fetchSourceFileStatus()
        ]).then(function (results) {
          var dashboard = results[0];
          var schedule  = results[1];
          var quality   = results[2];
          var srcFile   = results[3];

          extractCounts(health, dashboard, schedule, quality, srcFile);

          window.TechSysLabServerData.status = 'READY';
          window.TechSysLabServerData.loadedAt = new Date().toISOString();
          window.TechSysLabServerData.errorMessage = null;

          sessionSet(BOOTSTRAP_DONE_KEY, 'READY');

          emit('tsl:server-data-ready', window.TechSysLabServerData);
        });
      })
      .catch(function (err) {
        window.TechSysLabServerData.status = 'OFFLINE';
        window.TechSysLabServerData.errorMessage = err ? err.message : 'UNKNOWN';
        window.TechSysLabServerData.loadedAt = new Date().toISOString();

        emit('tsl:server-data-offline', window.TechSysLabServerData);
      });
  }

  /* ──────────────────────────────────────────
     진입점 — 로그인 게이트 통과 후 실행
  ────────────────────────────────────────── */
  function init() {
    if (!isGateUnlocked()) {
      /* 게이트 통과 후 unlock 이벤트 대기 */
      document.addEventListener('tsl:gate-unlocked', function () {
        runBootstrap();
      });
      return;
    }
    runBootstrap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ──────────────────────────────────────────
     외부 수동 재호출 API
  ────────────────────────────────────────── */
  window.TechSysLabBootstrap = {
    reload: function () {
      try { sessionStorage.removeItem(BOOTSTRAP_DONE_KEY); } catch (e) {}
      window.TechSysLabServerData.status = 'PENDING';
      runBootstrap();
    },
    getState: function () { return window.TechSysLabServerData; }
  };

})();
