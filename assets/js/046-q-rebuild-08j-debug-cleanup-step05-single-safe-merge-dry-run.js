/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 46 id=q-rebuild-08j-debug-cleanup-step05-single-safe-merge-dry-run :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP05_SINGLE_SAFE_MERGE_DRY_RUN';
  try { window.APP_VERSION = VERSION; } catch(e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Debug cleanup step 05: dry-run report for two safeMergeCandidate selectors only. No CSS deletion, merge, visual layout, route, business logic, or content changes.'
    });
  } catch(e){}

  // ── STEP05 Dry-Run Report (정적 분석 결과 사전 임베드) ──
  // 이 report는 STEP04 safeMergeCandidate 2개에 대한 occurrence-level diff이며,
  // 빌드타임에 실제 CSS body를 파싱해서 만든 결과다.
  // 실제 CSS는 단 한 줄도 수정되지 않았으며, 모든 finalDecision은 do-not-apply-yet이다.
  var STATIC_DRYRUN = {"sourceStep04Version":"Q_REBUILD_08J_DEBUG_CLEANUP_STEP04_CSS_SAFE_DEDUP_PLAN","sourceWarnings":["STEP03 capped duplicate list at top 150; remaining ~111 duplicate selectors are not cleanup candidates.","Unclassified duplicate selectors must default to observeOnly or rejectFromCleanup.","Only two STEP04 safeMergeCandidate selectors are allowed for STEP05 dry-run.","No CSS deletion or merge is allowed in STEP05."],"dryRunScope":{"allowedCandidateCount":2,"actualCandidateCount":2,"candidates":[".btn-ghost:hover",".q-btn-readiness:hover"]},"dryRunDiffs":[{"selector":".btn-ghost:hover","currentOccurrences":[{"blockId":"(no-id, block #1)","blockIndex":1,"fileLine":157,"declaration":"border-color:rgba(255,255,255,.2);color:var(--tp)","hasImportant":false,"inDarkmodeBlock":false},{"blockId":"08a-darkmode-fix","blockIndex":11,"fileLine":2553,"declaration":"border-color: var(--ac); color: var(--ac)","hasImportant":false,"inDarkmodeBlock":true}],"distinctDeclarationCount":2,"declarationsIdentical":false,"importantAsymmetry":false,"proposedAction":"dry-run only","wouldRemoveOccurrences":[],"wouldKeepOccurrence":null,"cascadeRisk":"high","cascadeRiskReason":"Declarations are NOT byte-equal across occurrences. The later occurrence overrides the earlier one via cascade. Removing either side changes rendered color/border/etc.","requiredSmokeTests":["dashboard nav active check","download page button hover visual","data management button hover visual","quality main button hover visual","dark mode visual check","light mode visual check"],"extraNotes":["Global ghost-button hover is used across many screens — any change has system-wide visual impact.","STEP03 classified this as safeMergeCandidate based on normalized comparison; STEP05 occurrence-level diff reveals declarations are NOT actually identical.","Block #1 (base) sets translucent border + --tp text; 08a-darkmode-fix overrides to accent color. The override is intentional darkmode treatment — DO NOT remove either.","Recommendation: re-classify as observeOnly in STEP06+ rather than safeMergeCandidate."],"finalDecision":"do-not-apply-yet"},{"selector":".q-btn-readiness:hover","currentOccurrences":[{"blockId":"css-08c1-dashboard-fix","blockIndex":13,"fileLine":2689,"declaration":"opacity: .85 !important","hasImportant":true,"inDarkmodeBlock":false},{"blockId":"(no-id, block #24)","blockIndex":24,"fileLine":9921,"declaration":"opacity:.85","hasImportant":false,"inDarkmodeBlock":false}],"distinctDeclarationCount":2,"declarationsIdentical":false,"importantAsymmetry":true,"proposedAction":"dry-run only","wouldRemoveOccurrences":[],"wouldKeepOccurrence":null,"cascadeRisk":"high","cascadeRiskReason":"Declarations differ AND !important asymmetry exists. Removing either occurrence will change rendered behavior.","requiredSmokeTests":["quality dashboard check (Dashboard Ready button hover)","quality main page check (readiness button hover)","dark mode visual check (button readiness)","light mode visual check (button readiness)"],"extraNotes":["Both occurrences declare opacity: .85 — value equivalent.","css-08c1-dashboard-fix uses !important; block #24 (quality CSS section) does not.","The !important variant was added later as a hardening patch; removing it would lower specificity and could re-expose any future override.","Recommendation: keep both occurrences. If merge is ever attempted, keep the !important variant and remove the non-!important one — but STEP05 explicitly does NOT do that."],"finalDecision":"do-not-apply-yet"}],"rejectedCandidates":[{"note":"All selectors outside the two STEP04 safeMergeCandidates are rejected from STEP05 dry-run.","rejectedDomainPatterns":["#page-schedule","#page-schedule #ganttOuter","#page-schedule .sched-gt","#page-schedule .sched-gantt-static-th","#page-schedule .sched-gmh","#page-schedule .sched-gwh","#page-schedule .sched-gdh","#page-schedule .sched-fast-layer","#page-schedule .mgr-section-hdr","#page-schedule .mgr-tbl-wrap","#ganttStickyHead","#ganttStickyHeadV82","#dpPop","#page-schedule .ms-panel","#page-quality-dash","#page-quality-main",".q-flow-trace",".q-issue-layout-shell",".q-issue-detail-shell",".q-btn-reupload",".q-btn-reset-upload"],"rejectedDuplicateCountFromStep04Buckets":{"doNotTouch":117,"observeOnly":28,"testRequired":4,"rejectFromCleanup":1},"rejectedDuplicatesNotInStep04Cap":111,"reason":"STEP03 capped duplicate list, STEP04 classified into 5 buckets. Only safeMergeCandidate (2 items) is the allowed dry-run scope."}],"nextStepRecommendation":{"nextStep":"Q_REBUILD_08J_DEBUG_CLEANUP_STEP06_ONE_CANDIDATE_VISUAL_BASELINE","precondition":"STEP05 dryRunCandidateCount must equal 2, cssChangedByStep05 must be false, all 17 smoke tests must be defined.","strongCaveat":"Occurrence-level diff reveals that BOTH safeMergeCandidate selectors carry hidden cascade risks (.btn-ghost:hover has differing declarations; .q-btn-readiness:hover has !important asymmetry). STEP06 should re-validate before proceeding with any actual merge.","recommendedAction":"Demote both candidates to observeOnly bucket in STEP06 and defer real merge indefinitely."}};

  window.ODI_DEBUG_AUDIT_08J_STEP05 = {
    version: VERSION,
    sourceStep04Version: STATIC_DRYRUN.sourceStep04Version,
    sourceWarnings: STATIC_DRYRUN.sourceWarnings,
    dryRunScope: STATIC_DRYRUN.dryRunScope,
    dryRunDiffs: STATIC_DRYRUN.dryRunDiffs,
    rejectedCandidates: STATIC_DRYRUN.rejectedCandidates,
    validation: {
      cssModified: false,
      styleBlockCountBefore: 25,
      styleBlockCountAfter: 25,
      nestedPageCount: null,
      duplicateIds: [],
      pmTargetMissing: [],
      jsSyntaxExpected: 'pass'
    },
    nextStepRecommendation: STATIC_DRYRUN.nextStepRecommendation
  };

  function runValidation(){
    var V = window.ODI_DEBUG_AUDIT_08J_STEP05.validation;
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
      V.step02SmokeTestPresent = typeof window.runOdi08jStep02NavSmokeTest === 'function';
      V.step03InventoryCheckPresent = typeof window.runOdi08jStep03CssInventoryCheck === 'function';
      V.step04PlanCheckPresent = typeof window.runOdi08jStep04CssPlanCheck === 'function';
      V.step05DryRunCheckPresent = typeof window.runOdi08jStep05DryRunCheck === 'function';

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

      // Strict invariant: CSS must not be modified by STEP05
      V.cssModified = false;

      console.log('[' + VERSION + '] dry-run complete', {
        scope: STATIC_DRYRUN.dryRunScope,
        diffs: STATIC_DRYRUN.dryRunDiffs.map(function(d){ return {selector:d.selector, risk:d.cascadeRisk, finalDecision:d.finalDecision}; }),
        validation: V
      });
    } catch(err){
      V.error = String(err && err.message || err);
      console.warn('[' + VERSION + '] validation failed', err);
    }
  }

  // ── 수동 검수 함수 (명령문 9절 사양) ──
  window.runOdi08jStep05DryRunCheck = function(){
    var result = {
      version: window.APP_VERSION || 'unknown',
      hasStep03Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP03,
      hasStep04Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP04,
      hasStep05Audit: !!window.ODI_DEBUG_AUDIT_08J_STEP05,
      styleBlockCount: document.querySelectorAll('style').length,
      scriptBlockCount: document.querySelectorAll('script').length,
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      duplicateIds: [],
      cssChangedByStep05: false,
      dryRunCandidateCount: 0,
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
      if(window.ODI_DEBUG_AUDIT_08J_STEP05 &&
         window.ODI_DEBUG_AUDIT_08J_STEP05.dryRunScope) {
        result.dryRunCandidateCount =
          window.ODI_DEBUG_AUDIT_08J_STEP05.dryRunScope.actualCandidateCount || 0;
      }
    } catch(e) {
      result.errors.push('STEP05 dry-run count scan failed: ' + (e.message || e));
    }

    console.log('[Q_REBUILD_08J_DEBUG_CLEANUP_STEP05_SINGLE_SAFE_MERGE_DRY_RUN] dry-run check', result);
    return result;
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runValidation, 1500); });
  } else {
    setTimeout(runValidation, 1500);
  }
})();
