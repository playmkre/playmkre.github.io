/**
 * TechSysLab Phase 14B ??Server Data Bootstrap
 * ?뚯씪: assets/js/930-server-data-bootstrap.js
 * 踰꾩쟾: PHASE14B_v1.0
 *
 * ??븷:
 *   - ?꾩떆 濡쒓렇??寃뚯씠???듦낵 ?뺤씤 ???쒕쾭 API?먯꽌 ?댁쁺 ?곗씠??濡쒕뵫
 *   - window.TechSysLabServerData ?꾩뿭 ?곹깭 愿由? *   - 濡쒕뵫 寃곌낵瑜?DOM 而ㅼ뒪? ?대깽?몃줈 諛쒗뻾
 *
 * ?덈? 湲덉?:
 *   - localStorage?먯꽌 ?댁쁺 ?곗씠???쎄린
 *   - 媛吏??곗씠??fallback seed) ?쒖떆
 */

(function () {
  'use strict';

  /* ??????????????????????????????????????????
     ?곸닔
  ?????????????????????????????????????????? */
  var API_BASE = 'https://api.techsyslab.com';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';
  var BOOTSTRAP_DONE_KEY = 'tsl.bootstrap.done';   // sessionStorage ??以묐났 ?ㅽ뻾 諛⑹?
  var TIMEOUT_MS = 10000;

  /* ??????????????????????????????????????????
     ?꾩뿭 ?곹깭 珥덇린??  ?????????????????????????????????????????? */
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

  /* ??????????????????????????????????????????
     ?ы띁
  ?????????????????????????????????????????? */
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

  /* ??????????????????????????????????????????
     API ?몄텧
  ?????????????????????????????????????????? */
  function fetchHealth() {
    return fetchWithTimeout(API_BASE + '/api/health', TIMEOUT_MS)
      .then(function (r) {
        if (!r.ok) throw new Error('health HTTP ' + r.status);
        return safeJson(r);
      });
  }

  function fetchDashboard() {
    /* /api/dashboard ?곗꽑, ?놁쑝硫?/api/user/readonly-preview fallback */
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

  /* ??????????????????????????????????????????
     移댁슫??異붿텧 ???ㅼ뼇???묐떟 援ъ“ ???  ?????????????????????????????????????????? */
  function extractCounts(health, dashboard, schedule, quality, sourceFile) {
    var c = window.TechSysLabServerData.counts;

    /* health?먯꽌 異붿텧 ?쒕룄 */
    if (health) {
      if (health.scheduleRowCount != null) c.scheduleRowCount = health.scheduleRowCount;
      if (health.qualityIssueCount != null) c.qualityIssueCount = health.qualityIssueCount;
      if (health.uploadHistoryCount != null) c.uploadHistoryCount = health.uploadHistoryCount;
      if (health.rollbackEventCount != null) c.rollbackEventCount = health.rollbackEventCount;
      /* nested counts 援ъ“ */
      if (health.counts) {
        if (health.counts.scheduleRowCount != null) c.scheduleRowCount = health.counts.scheduleRowCount;
        if (health.counts.qualityIssueCount != null) c.qualityIssueCount = health.counts.qualityIssueCount;
        if (health.counts.uploadHistoryCount != null) c.uploadHistoryCount = health.counts.uploadHistoryCount;
        if (health.counts.rollbackEventCount != null) c.rollbackEventCount = health.counts.rollbackEventCount;
      }
    }

    /* dashboard?먯꽌 異붿텧 ?쒕룄 */
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

    /* schedule summary?먯꽌 異붿텧 */
    if (schedule && schedule.counts) {
      if (schedule.counts.scheduleRowCount != null) c.scheduleRowCount = schedule.counts.scheduleRowCount;
    }
    if (schedule && schedule.scheduleRowCount != null) c.scheduleRowCount = schedule.scheduleRowCount;

    /* quality summary?먯꽌 異붿텧 */
    if (quality && quality.counts) {
      if (quality.counts.qualityIssueCount != null) c.qualityIssueCount = quality.counts.qualityIssueCount;
    }
    if (quality && quality.qualityIssueCount != null) c.qualityIssueCount = quality.qualityIssueCount;

    /* source-file-status?먯꽌 異붿텧 */
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

  /* ??????????????????????????????????????????
     硫붿씤 遺?몄뒪?몃옪 ?ㅽ뻾
  ?????????????????????????????????????????? */
  function runBootstrap() {
    /* ?대? ?꾨즺?먯쑝硫??ъ떎??嫄대꼫? */
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

  /* ??????????????????????????????????????????
     吏꾩엯????濡쒓렇??寃뚯씠???듦낵 ???ㅽ뻾
  ?????????????????????????????????????????? */
  function init() {
    if (!isGateUnlocked()) {
      /* 寃뚯씠???듦낵 ??unlock ?대깽???湲?*/
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

  /* ??????????????????????????????????????????
     ?몃? ?섎룞 ?ы샇異?API
  ?????????????????????????????????????????? */
  window.TechSysLabBootstrap = {
    reload: function () {
      try { sessionStorage.removeItem(BOOTSTRAP_DONE_KEY); } catch (e) {}
      window.TechSysLabServerData.status = 'PENDING';
      runBootstrap();
    },
    getState: function () { return window.TechSysLabServerData; }
  };

})();
