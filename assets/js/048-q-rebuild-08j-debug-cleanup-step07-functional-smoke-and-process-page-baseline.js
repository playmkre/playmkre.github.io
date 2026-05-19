/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 48 id=q-rebuild-08j-debug-cleanup-step07-functional-smoke-and-process-page-baseline :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP07_FUNCTIONAL_SMOKE_AND_PROCESS_PAGE_BASELINE';
  try { window.APP_VERSION = VERSION; } catch(e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Debug cleanup step 07: functional smoke baseline for production, process, schedule, quality, and data pages. No CSS, route, business logic, UI text, or data structure changes.'
    });
  } catch(e){}

  // ── STEP07 정적 baseline (빌드타임에 source-code 기반으로 추출) ──
  // 실제 nav 동작은 브라우저에서만 가능하므로, 정적 baseline은 page 존재와
  // function 정의 여부만 담는다. 런타임 검증에서 실제 nav/active 상태가 추가된다.
  var STATIC_BASELINE = {"pageIdCount":29,"pmEntryCount":30,"navStaticBaseline":[{"key":"dashboard","pageId":"page-dashboard","pageIdInPM":true,"pageExistsInDom":true},{"key":"schedule","pageId":"page-schedule","pageIdInPM":true,"pageExistsInDom":true},{"key":"equip-status","pageId":"page-equip-status","pageIdInPM":true,"pageExistsInDom":true},{"key":"team-overview","pageId":"page-team-overview","pageIdInPM":true,"pageExistsInDom":true},{"key":"schedule-log","pageId":"page-schedule-log","pageIdInPM":true,"pageExistsInDom":true},{"key":"schedule-model","pageId":"page-schedule-model","pageIdInPM":true,"pageExistsInDom":true},{"key":"schedule-period","pageId":"page-schedule-period","pageIdInPM":true,"pageExistsInDom":true},{"key":"prod-overview","pageId":"page-prod-overview","pageIdInPM":true,"pageExistsInDom":true},{"key":"prod-headcount","pageId":"page-prod-headcount","pageIdInPM":true,"pageExistsInDom":true},{"key":"prod-process","pageId":"page-prod-process","pageIdInPM":true,"pageExistsInDom":true},{"key":"quality-dash","pageId":"page-quality-dash","pageIdInPM":true,"pageExistsInDom":true},{"key":"quality-main","pageId":"page-quality-main","pageIdInPM":true,"pageExistsInDom":true},{"key":"quality-analysis","pageId":"page-quality-analysis","pageIdInPM":true,"pageExistsInDom":true},{"key":"quality-action","pageId":"page-quality-action","pageIdInPM":true,"pageExistsInDom":true},{"key":"quality-images","pageId":"page-quality-images","pageIdInPM":true,"pageExistsInDom":true},{"key":"quality-master","pageId":"page-quality-master","pageIdInPM":true,"pageExistsInDom":true},{"key":"data-equip","pageId":"page-data-equip","pageIdInPM":true,"pageExistsInDom":true},{"key":"download","pageId":"page-download","pageIdInPM":true,"pageExistsInDom":true}],"functionAvailabilityStatic":{"scheduleInit":true,"initSchedule":true,"schedSwitchTab":true,"schedSwitchView":true,"navToScheduleView":true,"renderCurrentView":true,"renderGantt":true,"renderCalendar":true,"renderBatch":false,"renderUserProdOverviewPage":true,"renderUserProdHeadcountPage":true,"renderUserProdProcessPage":true,"renderQDashPage":true,"renderQMainPage":true,"renderQAnalysisPage":true,"renderQActionPage":true,"renderQImagesPage":true,"renderQMasterPage":true,"qEnsureQualityFlowTraceContainers":true,"qRefreshQualityFlowTracePanel":true,"odiNavAfterRenderDispatcher":true,"renderDashboardKPI":true,"renderDashboardSummaryNotes":true,"renderUserModelDetailPage":false,"odiEnsureSidebarAllGroupsOpen":true,"q08bHardenQualityDom":true,"isForbiddenRoute":true},"productionBaseline":{"page-prod-overview":true,"page-prod-headcount":true,"page-prod-process":true,"page-equip-status":true,"page-team-overview":true},"processBaseline":{"pageExists":true,"contentMarkers":{"processFlowSection":true,"bottleneckSection":true,"matrixSection":true,"qualityLinkageNotice":true,"workDataReference":true}},"scheduleFunctionsBaseline":{"scheduleInit":true,"initSchedule":true,"schedSwitchTab":true,"schedSwitchView":true,"navToScheduleView":true,"renderCurrentView":true,"renderGantt":true,"renderCalendar":true,"renderBatch":false},"scheduleUiBaseline":{"pageScheduleExists":true,"dataManagementTab":true,"calendarView":true,"ganttView":true,"batchView":true,"uploadControls":true,"filterControls":true},"qualityPageBaseline":{"page-quality-dash":true,"page-quality-main":true,"page-quality-analysis":true,"page-quality-action":true,"page-quality-images":true,"page-quality-master":true},"qualityFunctionBaseline":{"renderQDashPage":true,"renderQMainPage":true,"renderQAnalysisPage":true,"renderQActionPage":true,"renderQImagesPage":true,"renderQMasterPage":true,"qEnsureQualityFlowTraceContainers":true,"qRefreshQualityFlowTracePanel":true},"dataPageBaseline":{"page-data-equip":true,"page-upload-history":true,"page-data-validation":true,"page-file-mapping":true},"dataPagePmMapped":{"page-data-equip":true,"page-upload-history":true,"page-data-validation":true,"page-file-mapping":true},"downloadBaseline":{"pageDownloadExists":true,"pageDownloadInPM":true,"pmDownloadTargets":"page-download"},"scheduleFunctionsBaselineNote":"Spec asks for renderBatch but the actual function name in this codebase is renderBatchView. renderBatch is intentionally absent.","renderBatchViewExists":true,"renderUserModelDetailPageNote":"Function is referenced by odiNavAfterRenderDispatcher (schedule-model branch) but no concrete definition exists in source. Dispatcher guards with typeof === function so this is safe at runtime — but baseline reflects the absence."};

  var NAV_KEYS = [
    'dashboard','schedule','equip-status','team-overview',
    'schedule-log','schedule-model','schedule-period',
    'prod-overview','prod-headcount','prod-process',
    'quality-dash','quality-main','quality-analysis','quality-action',
    'quality-images','quality-master',
    'data-equip','download'
  ];

  window.ODI_DEBUG_AUDIT_08J_STEP07 = {
    version: VERSION,
    sourceStep06Version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP06_SAFE_CANDIDATE_DEMOTE_AND_FREEZE',
    cssFreezeVerified: false,
    navSmoke: {
      testedKeys: NAV_KEYS.slice(),
      failedKeys: [],
      activePageResult: []
    },
    pageBaseline: {
      production: STATIC_BASELINE.productionBaseline,
      schedule: {
        functions: STATIC_BASELINE.scheduleFunctionsBaseline,
        ui: STATIC_BASELINE.scheduleUiBaseline,
        renderBatchViewExists: STATIC_BASELINE.renderBatchViewExists,
        scheduleFunctionsBaselineNote: STATIC_BASELINE.scheduleFunctionsBaselineNote
      },
      process: STATIC_BASELINE.processBaseline,
      quality: {
        pages: STATIC_BASELINE.qualityPageBaseline,
        functions: STATIC_BASELINE.qualityFunctionBaseline
      },
      dataManagement: {
        pages: STATIC_BASELINE.dataPageBaseline,
        pmMapped: STATIC_BASELINE.dataPagePmMapped
      },
      download: STATIC_BASELINE.downloadBaseline
    },
    functionAvailability: STATIC_BASELINE.functionAvailabilityStatic,
    staticNotes: {
      renderUserModelDetailPage: STATIC_BASELINE.renderUserModelDetailPageNote,
      renderBatchVsRenderBatchView: STATIC_BASELINE.scheduleFunctionsBaselineNote
    },
    blockedItems: [
      'CSS 삭제/병합 — STEP06 freeze 상태 유지',
      'nav 함수 변경 — STEP02 dispatcher 구조 유지',
      'DOM 구조 변경 — 금지',
      '품질관리 상세 메뉴 숨김/삭제 — 금지',
      'DXF/FAIR 관련 항목 변경 — 금지',
      '데이터 구조 변경 — 금지',
      '새 기능 추가 — 금지'
    ],
    validation: {
      cssModified: false,
      styleBlockCountExpected: 25,
      styleBlockCountActual: null,
      nestedPageCount: null,
      duplicateIds: [],
      pmTargetMissing: [],
      jsSyntaxExpected: 'pass'
    },
    nextStepRecommendation: {
      nextStep: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP08_FINAL_HANDOFF_AND_PROCESS_WORK_RESUME',
      precondition: 'STEP07 cssFreezeVerified must be true, nav smoke must pass for all 18 keys, no missing PM targets.',
      note: 'STEP08에서 08J 디버그 cleanup을 종료하고 공정 웹페이지 실제 개선 작업 재개 기준 파일을 확정한다.'
    }
  };

  // ── 런타임 검증: STEP06 freeze 확인 + 실제 nav 가능성 점검 ──
  function runValidation(){
    var A = window.ODI_DEBUG_AUDIT_08J_STEP07;
    var V = A.validation;
    try {
      // STEP06 freeze invariants
      if(window.ODI_DEBUG_AUDIT_08J_STEP06 &&
         window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState){
        var s = window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState;
        A.cssFreezeVerified =
          s.safeMergeCandidateCount === 0 &&
          s.cssDeletionAllowed === false &&
          s.cssMergeAllowed === false;
        if(!A.cssFreezeVerified){
          A.blockedItems.push('STEP06 freeze condition broken — STEP07 baseline marked as suspect.');
        }
      } else {
        A.blockedItems.push('STEP06 audit object missing — cannot verify freeze.');
      }

      // CSS / DOM invariants
      V.styleBlockCountActual = document.querySelectorAll('style').length;
      V.styleBlockMatchesExpected = V.styleBlockCountActual === V.styleBlockCountExpected;
      V.scriptBlockCount = document.querySelectorAll('script').length;
      V.pageCount = document.querySelectorAll('.page').length;
      V.nestedPageCount = document.querySelectorAll('.page .page').length;
      V.navCallable = typeof window.nav === 'function';
      V.dispatcherCallable = typeof window.odiNavAfterRenderDispatcher === 'function';
      V.pmBridgeOk = (typeof window.PM !== 'undefined' && !!window.PM);

      // duplicate id
      var seen = {};
      var dups = [];
      document.querySelectorAll('[id]').forEach(function(el){
        if(!el.id) return;
        seen[el.id] = (seen[el.id]||0) + 1;
      });
      Object.keys(seen).forEach(function(id){ if(seen[id]>1) dups.push({id:id,count:seen[id]}); });
      V.duplicateIds = dups;

      // PM target
      var miss = [];
      if(typeof window.PM !== 'undefined' && window.PM){
        Object.keys(window.PM).forEach(function(k){
          var id = window.PM[k];
          if(id && !document.getElementById(id)) miss.push({key:k,pageId:id});
        });
      }
      V.pmTargetMissing = miss;
      V.cssModified = false;

      // Live nav smoke per key (lightweight — does NOT actually re-render)
      NAV_KEYS.forEach(function(k){
        var row = {
          key: k,
          pageId: (window.PM && window.PM[k]) || STATIC_BASELINE.navStaticBaseline.find(function(n){return n.key===k;}).pageId,
          exists: false,
          navCallable: typeof window.nav === 'function',
          activeAfterNav: null,
          activePageCount: null,
          error: null
        };
        try {
          row.exists = !!(row.pageId && document.getElementById(row.pageId));
          // Optional: actually invoke nav. We DO call it for the smoke baseline.
          if(row.navCallable && row.exists){
            window.nav(k);
            var el = document.getElementById(row.pageId);
            row.activeAfterNav = !!(el && el.classList.contains('active'));
            row.activePageCount = document.querySelectorAll('.page.active').length;
            if(!row.activeAfterNav || row.activePageCount !== 1){
              A.navSmoke.failedKeys.push(k);
            }
          } else if(!row.exists){
            A.navSmoke.failedKeys.push(k);
          }
        } catch(err){
          row.error = String(err && err.message || err);
          A.navSmoke.failedKeys.push(k);
        }
        A.navSmoke.activePageResult.push(row);
      });

      // After nav smoke, return to dashboard to avoid leaving the user on a random page
      try {
        if(typeof window.nav === 'function' && window.PM && window.PM.dashboard){
          window.nav('dashboard');
        }
      } catch(_e){}

      console.log('[' + VERSION + '] baseline complete', {
        cssFreezeVerified: A.cssFreezeVerified,
        navSmoke: {
          tested: A.navSmoke.testedKeys.length,
          failed: A.navSmoke.failedKeys.length
        },
        functionAvailability: A.functionAvailability,
        validation: V
      });
    } catch(err){
      V.error = String(err && err.message || err);
      console.warn('[' + VERSION + '] validation failed', err);
    }
  }

  // ── 수동 검수 함수 (명령문 7절 사양) ──
  window.runOdi08jStep07FunctionalSmokeCheck = function(){
    var keys = NAV_KEYS.slice();

    var result = {
      version: window.APP_VERSION || 'unknown',
      hasStep06Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP06,
      hasStep07Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP07,
      cssFreezeVerified: false,
      styleBlockCount: document.querySelectorAll('style').length,
      scriptBlockCount: document.querySelectorAll('script').length,
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      duplicateIds: [],
      pmTargetMissing: [],
      navResults: [],
      functionAvailability: {},
      errors: []
    };

    try {
      if(window.ODI_DEBUG_AUDIT_08J_STEP06 &&
         window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState) {
        var s = window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState;
        result.cssFreezeVerified =
          s.safeMergeCandidateCount === 0 &&
          s.cssDeletionAllowed === false &&
          s.cssMergeAllowed === false;
      }
    } catch(e) {
      result.errors.push('STEP06 freeze verification failed: ' + (e.message || e));
    }

    try {
      var seen = {};
      document.querySelectorAll('[id]').forEach(function(el){
        if(!el.id) return;
        seen[el.id] = (seen[el.id] || 0) + 1;
      });
      Object.keys(seen).forEach(function(id){
        if(seen[id] > 1) result.duplicateIds.push({id:id,count:seen[id]});
      });
    } catch(e) {
      result.errors.push('duplicate id scan failed: ' + (e.message || e));
    }

    try {
      if(typeof window.PM !== 'undefined' && window.PM) {
        Object.keys(window.PM).forEach(function(k){
          var id = window.PM[k];
          if(id && !document.getElementById(id)) {
            result.pmTargetMissing.push({key:k,pageId:id});
          }
        });
      }
    } catch(e) {
      result.errors.push('PM target scan failed: ' + (e.message || e));
    }

    keys.forEach(function(k){
      var row = {
        key: k,
        pageId: window.PM && window.PM[k] ? window.PM[k] : null,
        exists: false,
        navCallable: typeof window.nav === 'function',
        activeAfterNav: null,
        activePageCount: null,
        error: null
      };
      try {
        row.exists = !!(row.pageId && document.getElementById(row.pageId));
        if(row.navCallable && row.exists) {
          window.nav(k);
          var el = document.getElementById(row.pageId);
          row.activeAfterNav = !!(el && el.classList.contains('active'));
          row.activePageCount = document.querySelectorAll('.page.active').length;
        }
      } catch(e) {
        row.error = String(e && e.message || e);
      }
      result.navResults.push(row);
    });

    [
      'scheduleInit','initSchedule','schedSwitchTab','schedSwitchView','navToScheduleView',
      'renderCurrentView','renderGantt','renderCalendar','renderBatch',
      'renderUserProdOverviewPage','renderUserProdHeadcountPage','renderUserProdProcessPage',
      'renderQDashPage','renderQMainPage','renderQAnalysisPage','renderQActionPage',
      'renderQImagesPage','renderQMasterPage',
      'qEnsureQualityFlowTraceContainers','qRefreshQualityFlowTracePanel'
    ].forEach(function(fn){
      result.functionAvailability[fn] = typeof window[fn] === 'function';
    });

    console.log('[Q_REBUILD_08J_DEBUG_CLEANUP_STEP07_FUNCTIONAL_SMOKE_AND_PROCESS_PAGE_BASELINE] functional smoke', result);
    return result;
  };

  // 자동 실행은 다른 audit보다 좀 더 늦게 (다른 init이 완료된 뒤)
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runValidation, 1800); });
  } else {
    setTimeout(runValidation, 1800);
  }
})();
