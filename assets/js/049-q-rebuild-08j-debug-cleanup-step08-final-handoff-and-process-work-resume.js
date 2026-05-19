/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 49 id=q-rebuild-08j-debug-cleanup-step08-final-handoff-and-process-work-resume :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP08_FINAL_HANDOFF_AND_PROCESS_WORK_RESUME';
  try { window.APP_VERSION = VERSION; } catch(e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Debug cleanup step 08: final handoff for 08J cleanup, baseline confirmation, and process page work-resume readiness. No CSS, route, business logic, UI text, or data structure changes.'
    });
  } catch(e){}

  // ── STEP08 Final Handoff ─────────────────────────────
  // 08J 디버그 cleanup 시퀀스의 최종 종료 선언과 함께,
  // 다음 단계인 공정 웹페이지(08K) 실제 개선 작업의 기준 파일을 확정한다.
  // 이 STEP08 파일이 08J 시퀀스의 최종 baseline이며,
  // 여기서부터는 CSS cleanup이 아니라 공정 페이지 실제 작업으로 흐름이 전환된다.
  window.ODI_DEBUG_AUDIT_08J_STEP08 = {
    version: VERSION,
    sourceStep07Version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP07_FUNCTIONAL_SMOKE_AND_PROCESS_PAGE_BASELINE',
    cleanupStatus: {
      step01DomNestingCleanup: 'completed',
      step02NavDispatcherUnify: 'completed',
      step03CssInventory: 'completed',
      step04CssSafeDedupPlan: 'completed',
      step05CssDryRun: 'completed',
      step06CssCleanupFreeze: 'completed',
      step07FunctionalSmokeBaseline: 'completed',
      finalDecision: '08J debug cleanup closed'
    },
    finalBaseline: {
      fileRole: 'final debug cleanup baseline before process page work resumes',
      cssDeletionAllowed: false,
      cssMergeAllowed: false,
      safeMergeCandidateCount: 0,
      styleBlockCountExpected: 25,
      pageCountExpected: 29,
      pmTargetMissingExpected: 0,
      nestedPageCountExpected: 0,
      duplicateIdExpected: 0
    },
    processWorkResumeReadiness: {
      recommendedNextWorkstream: 'Q_REBUILD_08K_PROCESS_PAGE_STABILIZE_AND_DETAIL_BUILD',
      targetPages: [
        'page-prod-process',
        'page-prod-overview',
        'page-equip-status',
        'page-schedule',
        'page-data-equip',
        'page-quality-dash',
        'page-quality-main'
      ],
      allowedNextChanges: [
        '공정 현황 페이지 목적 강화',
        '공정별 진행률 baseline 강화',
        '호기별 현재 공정 요약 강화',
        '공정 병목 후보 표시 강화',
        '생산일정 WORK_DATA와 공정 현황 연결 명확화',
        '품질관리 데이터와 공정 연동 예정 영역 정리'
      ],
      blockedNextChanges: [
        'CSS cleanup 재개 금지',
        '간트 sticky header CSS 삭제 금지',
        '품질관리 상세 페이지 숨김 금지',
        '생산일정 업로드/저장 로직 변경 금지',
        'DXF/FAIR 프로젝트 혼입 금지'
      ]
    },
    knownNotes: [
      'renderBatch is absent but renderBatchView exists; keep as baseline note unless a later task explicitly requires compatibility alias.',
      'CSS cleanup is frozen because STEP05 found hidden cascade risks in both previous safeMergeCandidate selectors.',
      'STEP03 duplicate selector list was capped; unclassified duplicates are not cleanup candidates.',
      'Functional smoke baseline is static/report-based unless browser runtime smoke is explicitly performed later.',
      'renderUserModelDetailPage is referenced by odiNavAfterRenderDispatcher (schedule-model branch) but never defined; dispatcher uses typeof === function guard so this is runtime-safe — baseline notes it explicitly.',
      'Forbidden route guard for user portal admin/dev/test pages is built into the base nav() — page DOM is preserved but nav redirects to dashboard.'
    ],
    auditChainSummary: {
      step01: { version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP01_REVIEWED_FIXED', present: !!window.ODI_DEBUG_AUDIT_08J_STEP01 },
      step02: { version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP02_NAV_DISPATCHER_UNIFY_REVIEWED_FIXED', present: !!window.ODI_DEBUG_AUDIT_08J_STEP02 },
      step03: { version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP03_CSS_PATCH_INVENTORY', present: !!window.ODI_DEBUG_AUDIT_08J_STEP03 },
      step04: { version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP04_CSS_SAFE_DEDUP_PLAN', present: !!window.ODI_DEBUG_AUDIT_08J_STEP04 },
      step05: { version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP05_SINGLE_SAFE_MERGE_DRY_RUN', present: !!window.ODI_DEBUG_AUDIT_08J_STEP05 },
      step06: { version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP06_SAFE_CANDIDATE_DEMOTE_AND_FREEZE', present: !!window.ODI_DEBUG_AUDIT_08J_STEP06 },
      step07: { version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP07_FUNCTIONAL_SMOKE_AND_PROCESS_PAGE_BASELINE', present: !!window.ODI_DEBUG_AUDIT_08J_STEP07 },
      step08: { version: VERSION, present: true }
    },
    validation: {
      cssModified: false,
      styleBlockCountActual: null,
      scriptBlockCountActual: null,
      pageCountActual: null,
      nestedPageCount: null,
      duplicateIds: [],
      pmTargetMissing: [],
      jsSyntaxExpected: 'pass'
    },
    nextStepRecommendation: 'Start Q_REBUILD_08K_PROCESS_PAGE_STABILIZE_AND_DETAIL_BUILD after this file passes review.'
  };

  function runValidation(){
    var A = window.ODI_DEBUG_AUDIT_08J_STEP08;
    var V = A.validation;
    try {
      V.styleBlockCountActual = document.querySelectorAll('style').length;
      V.scriptBlockCountActual = document.querySelectorAll('script').length;
      V.pageCountActual = document.querySelectorAll('.page').length;
      V.nestedPageCount = document.querySelectorAll('.page .page').length;
      V.navCallable = typeof window.nav === 'function';
      V.dispatcherCallable = typeof window.odiNavAfterRenderDispatcher === 'function';
      V.pmBridgeOk = (typeof window.PM !== 'undefined' && !!window.PM);

      // Re-derive auditChainSummary.present at runtime (in case audits were evaluated late)
      A.auditChainSummary.step01.present = !!window.ODI_DEBUG_AUDIT_08J_STEP01;
      A.auditChainSummary.step02.present = !!window.ODI_DEBUG_AUDIT_08J_STEP02;
      A.auditChainSummary.step03.present = !!window.ODI_DEBUG_AUDIT_08J_STEP03;
      A.auditChainSummary.step04.present = !!window.ODI_DEBUG_AUDIT_08J_STEP04;
      A.auditChainSummary.step05.present = !!window.ODI_DEBUG_AUDIT_08J_STEP05;
      A.auditChainSummary.step06.present = !!window.ODI_DEBUG_AUDIT_08J_STEP06;
      A.auditChainSummary.step07.present = !!window.ODI_DEBUG_AUDIT_08J_STEP07;

      // STEP06 freeze invariant re-check
      V.cssFreezeStillHolds = false;
      if(window.ODI_DEBUG_AUDIT_08J_STEP06 && window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState){
        var s = window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState;
        V.cssFreezeStillHolds =
          s.safeMergeCandidateCount === 0 &&
          s.cssDeletionAllowed === false &&
          s.cssMergeAllowed === false &&
          s.scheduleGanttQualityCssLocked === true;
      }

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

      // Process / quality / schedule page readiness
      V.processPageReady = !!document.getElementById('page-prod-process');
      V.schedulePageReady = !!document.getElementById('page-schedule');
      var qualityIds = ['page-quality-dash','page-quality-main','page-quality-analysis',
                        'page-quality-action','page-quality-images','page-quality-master'];
      V.qualityPagesReady = qualityIds.every(function(id){ return !!document.getElementById(id); });

      // Final invariant check vs expected baseline
      V.allBaselineInvariantsHold =
        V.styleBlockCountActual === A.finalBaseline.styleBlockCountExpected &&
        V.pageCountActual === A.finalBaseline.pageCountExpected &&
        V.nestedPageCount === A.finalBaseline.nestedPageCountExpected &&
        V.duplicateIds.length === A.finalBaseline.duplicateIdExpected &&
        V.pmTargetMissing.length === A.finalBaseline.pmTargetMissingExpected;

      console.log('[' + VERSION + '] final handoff complete', {
        cleanupStatus: A.cleanupStatus,
        finalBaseline: A.finalBaseline,
        auditChain: A.auditChainSummary,
        validation: V,
        nextWorkstream: A.processWorkResumeReadiness.recommendedNextWorkstream
      });
    } catch(err) {
      V.error = String(err && err.message || err);
      console.warn('[' + VERSION + '] validation failed', err);
    }
  }

  // ── 수동 검수 함수 (명령문 4절 사양) ──
  window.runOdi08jStep08FinalHandoffCheck = function(){
    var result = {
      version: window.APP_VERSION || 'unknown',
      hasStep06Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP06,
      hasStep07Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP07,
      hasStep08Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP08,
      styleBlockCount: document.querySelectorAll('style').length,
      scriptBlockCount: document.querySelectorAll('script').length,
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      duplicateIds: [],
      pmTargetMissing: [],
      cssFreezeVerified: false,
      processPageReady: !!document.getElementById('page-prod-process'),
      qualityPagesReady: true,
      schedulePageReady: !!document.getElementById('page-schedule'),
      errors: []
    };

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

    try {
      if(window.ODI_DEBUG_AUDIT_08J_STEP06 &&
         window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState) {
        var s = window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState;
        result.cssFreezeVerified =
          s.safeMergeCandidateCount === 0 &&
          s.cssDeletionAllowed === false &&
          s.cssMergeAllowed === false &&
          s.scheduleGanttQualityCssLocked === true;
      }
    } catch(e) {
      result.errors.push('css freeze verification failed: ' + (e.message || e));
    }

    [
      'page-quality-dash',
      'page-quality-main',
      'page-quality-analysis',
      'page-quality-action',
      'page-quality-images',
      'page-quality-master'
    ].forEach(function(id){
      if(!document.getElementById(id)) result.qualityPagesReady = false;
    });

    console.log('[Q_REBUILD_08J_DEBUG_CLEANUP_STEP08_FINAL_HANDOFF_AND_PROCESS_WORK_RESUME] final handoff check', result);
    return result;
  };

  // 자동 실행 — 다른 audit들이 모두 끝난 후 마지막으로 실행
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runValidation, 2000); });
  } else {
    setTimeout(runValidation, 2000);
  }
})();
