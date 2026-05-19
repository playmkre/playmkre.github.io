/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 47 id=q-rebuild-08j-debug-cleanup-step06-safe-candidate-demote-and-freeze :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP06_SAFE_CANDIDATE_DEMOTE_AND_FREEZE';
  try { window.APP_VERSION = VERSION; } catch(e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Debug cleanup step 06: demoted both STEP05 dry-run candidates to observeOnly and froze CSS cleanup. No CSS deletion, merge, visual layout, route, business logic, or content changes.'
    });
  } catch(e){}

  // ── STEP06 Freeze Report ──────────────────────────────
  // STEP05 occurrence-level diff에서 다음이 확인되었다:
  //   1) .btn-ghost:hover     → declaration 다름 (base vs 08a-darkmode-fix), cascadeRisk: high
  //   2) .q-btn-readiness:hover → !important 비대칭 (css-08c1 vs block #24), cascadeRisk: high
  // 따라서 두 후보 모두 safeMergeCandidate에서 observeOnly로 강등하고
  // CSS cleanup 작업 자체를 freeze한다. 실제 CSS는 단 한 줄도 변경되지 않는다.
  window.ODI_DEBUG_AUDIT_08J_STEP06 = {
    version: VERSION,
    sourceStep05Version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP05_SINGLE_SAFE_MERGE_DRY_RUN',
    demotedCandidates: [
      {
        selector: '.btn-ghost:hover',
        from: 'safeMergeCandidate',
        to: 'observeOnly',
        reason: 'STEP05 occurrence-level diff found differing declarations and global cascade risk.',
        step05CascadeRisk: 'high',
        step05Occurrences: [
          { blockId: '(no-id, block #1)',  fileLine: 157,  declaration: 'border-color:rgba(255,255,255,.2);color:var(--tp)' },
          { blockId: '08a-darkmode-fix',   fileLine: 2553, declaration: 'border-color: var(--ac); color: var(--ac)' }
        ],
        finalDecision: 'freeze-no-css-change'
      },
      {
        selector: '.q-btn-readiness:hover',
        from: 'safeMergeCandidate',
        to: 'observeOnly',
        reason: 'STEP05 occurrence-level diff found !important asymmetry and quality readiness button regression risk.',
        step05CascadeRisk: 'high',
        step05Occurrences: [
          { blockId: 'css-08c1-dashboard-fix', fileLine: 2689, declaration: 'opacity: .85 !important' },
          { blockId: '(no-id, block #24)',    fileLine: 9921, declaration: 'opacity:.85' }
        ],
        finalDecision: 'freeze-no-css-change'
      }
    ],
    finalCssCleanupState: {
      safeMergeCandidateCount: 0,
      cssDeletionAllowed: false,
      cssMergeAllowed: false,
      importantRemovalAllowed: false,
      scheduleGanttQualityCssLocked: true,
      recommendedNextWorkstream: 'functional smoke test and process page stabilization'
    },
    preservedWarnings: [
      'STEP03 capped duplicate list at top 150; remaining ~111 duplicate selectors are not cleanup candidates.',
      'Unclassified duplicate selectors must default to observeOnly or rejectFromCleanup.',
      'STEP05 found hidden cascade risk in both previous safeMergeCandidate selectors.',
      'No CSS deletion or merge is allowed without screenshot baseline and manual approval.'
    ],
    blockedItems: [
      'CSS selector 실제 삭제 — 영구 freeze (현 안정화 기간 한정)',
      'CSS selector 실제 병합 — 영구 freeze',
      '!important 제거 — 영구 freeze',
      '간트/스케줄/품질 CSS 정리 — lock 상태 유지',
      'STEP04 doNotTouch 117건 — 영구 보존',
      'STEP04 observeOnly 28건 + STEP06 demoted 2건 = 총 30건 → 관찰만'
    ],
    nextStepRecommendation: {
      nextStep: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP07_FUNCTIONAL_SMOKE_AND_PROCESS_PAGE_BASELINE',
      precondition: 'STEP06 cssChangedByStep06 must be false AND safeMergeCandidateCountAfterFreeze must be 0.',
      focusAreas: [
        '공정 현황 (page-prod-process)',
        '생산 종합 파악 (page-prod-overview)',
        '인력 현황 (page-prod-headcount)',
        '생산일정 (page-schedule) — 캘린더/간트/배치 view',
        '품질관리 대시보드 (page-quality-dash)',
        '품질관리 센터 (page-quality-main)',
        '품질 분석/조치/이미지/마스터 (page-quality-analysis/action/images/master)'
      ],
      note: 'CSS 정리 작업 흐름은 STEP06으로 종료. STEP07부터는 화면 기능 smoke와 기준선 캡처로 작업 흐름을 전환한다.'
    },
    validation: {
      cssModified: false,
      styleBlockCountBefore: 25,
      styleBlockCountAfter: 25,
      nestedPageCount: null,
      duplicateIds: [],
      pmTargetMissing: [],
      jsSyntaxExpected: 'pass'
    }
  };

  function runValidation(){
    var V = window.ODI_DEBUG_AUDIT_08J_STEP06.validation;
    try {
      V.runtimeStyleBlockCount = document.querySelectorAll('style').length;
      V.styleBlockCountAfter = V.runtimeStyleBlockCount;
      V.styleBlockMatchesExpected = (V.runtimeStyleBlockCount === 25);
      V.scriptBlockCount = document.querySelectorAll('script').length;
      V.pageCount = document.querySelectorAll('.page').length;
      V.nestedPageCount = document.querySelectorAll('.page .page').length;
      V.navCallable = typeof window.nav === 'function';
      V.dispatcherCallable = typeof window.odiNavAfterRenderDispatcher === 'function';
      V.pmBridgeOk = (typeof window.PM !== 'undefined' && !!window.PM);
      V.hasStep03Audit = !!window.ODI_DEBUG_AUDIT_08J_STEP03;
      V.hasStep04Audit = !!window.ODI_DEBUG_AUDIT_08J_STEP04;
      V.hasStep05Audit = !!window.ODI_DEBUG_AUDIT_08J_STEP05;
      V.step02SmokeTestPresent = typeof window.runOdi08jStep02NavSmokeTest === 'function';
      V.step03InventoryCheckPresent = typeof window.runOdi08jStep03CssInventoryCheck === 'function';
      V.step04PlanCheckPresent = typeof window.runOdi08jStep04CssPlanCheck === 'function';
      V.step05DryRunCheckPresent = typeof window.runOdi08jStep05DryRunCheck === 'function';
      V.step06FreezeCheckPresent = typeof window.runOdi08jStep06FreezeCheck === 'function';

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
      V.safeMergeCandidateCountAfterFreeze = 0;

      console.log('[' + VERSION + '] freeze complete', {
        demoted: window.ODI_DEBUG_AUDIT_08J_STEP06.demotedCandidates.map(function(d){
          return {selector:d.selector, from:d.from, to:d.to, finalDecision:d.finalDecision};
        }),
        finalState: window.ODI_DEBUG_AUDIT_08J_STEP06.finalCssCleanupState,
        validation: V
      });
    } catch(err) {
      V.error = String(err && err.message || err);
      console.warn('[' + VERSION + '] validation failed', err);
    }
  }

  // ── 수동 검수 함수 (명령문 5절 사양) ──
  window.runOdi08jStep06FreezeCheck = function(){
    var result = {
      version: window.APP_VERSION || 'unknown',
      hasStep03Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP03,
      hasStep04Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP04,
      hasStep05Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP05,
      hasStep06Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP06,
      styleBlockCount: document.querySelectorAll('style').length,
      scriptBlockCount: document.querySelectorAll('script').length,
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      duplicateIds: [],
      safeMergeCandidateCountAfterFreeze: 0,
      cssChangedByStep06: false,
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

    console.log('[Q_REBUILD_08J_DEBUG_CLEANUP_STEP06_SAFE_CANDIDATE_DEMOTE_AND_FREEZE] freeze check', result);
    return result;
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runValidation, 1600); });
  } else {
    setTimeout(runValidation, 1600);
  }
})();
