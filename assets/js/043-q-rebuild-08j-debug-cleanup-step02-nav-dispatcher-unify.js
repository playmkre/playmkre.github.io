/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 43 id=q-rebuild-08j-debug-cleanup-step02-nav-dispatcher-unify :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP02_NAV_DISPATCHER_UNIFY_REVIEWED_FIXED';
  try { window.APP_VERSION = VERSION; } catch(e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Debug cleanup step 02: unified nav after-render dispatcher, removed redundant nav wrapper chain without changing business logic, UI text, or page content.'
    });
  } catch(e){}

  // ── STEP02 진단 결과 저장소 ──────────────────────────────
  window.ODI_DEBUG_AUDIT_08J_STEP02 = {
    version: VERSION,
    navWrappersBefore: [
      '__qFlowTraceWrapped',
      '__odiReviewedSidebarOpenWrapped',
      '__v95hooked',
      '__v96hooked',
      '__v97hooked',
      '__q08bQualityReviewed',
      '__q08c0aUserCleanWrapped',
      '__odi08gReviewedWrapped',
      '__odi08hReviewedFixedWrapped',
      '__odi08jStep01Guarded'
    ],
    navWrappersAfter: [],
    preservedBehaviors: [
      'forbidden route guard (was __q08c0aUserCleanWrapped) -> moved into base nav step 1',
      'PM target warn + try/catch (was __odi08jStep01Guarded) -> moved into base nav step 2',
      'window.PM compatibility bridge added for audit and quality page guard scripts',
      'schedule init (was inline in old base nav) -> dispatcher schedule branch',
      'dashboard KPI + summary notes (was inline + __odiReviewedSidebarOpenWrapped) -> dispatcher dashboard branch',
      'schedule-model renderUserModelDetailPage (was __v95/96/97hooked) -> dispatcher schedule-model branch',
      'schedule-log/model/period refresh (was __odi08gReviewedWrapped) -> dispatcher schedule-* branch',
      'quality renders renderQDashPage/MainPage/AnalysisPage/ActionPage/ImagesPage/MasterPage (was inline + __v95/96/97hooked) -> dispatcher quality branch',
      'qEnsureQualityFlowTraceContainers (was inline) -> dispatcher quality branch',
      'qRefreshQualityFlowTracePanel (was __qFlowTraceWrapped + __odiReviewedSidebarOpenWrapped) -> dispatcher quality + trace branch',
      'q08bHardenQualityDom (was __q08bQualityReviewed) -> dispatcher quality branch',
      'prod-overview/headcount/process renderUserProd* (was __v95/96/97hooked + __odi08hReviewedFixedWrapped) -> dispatcher prod branch',
      'odiEnsureSidebarAllGroupsOpen (was __odiReviewedSidebarOpenWrapped + inline) -> dispatcher final step'
    ],
    removedWrapperFlags: [],
    blockedItems: [
      'CSS patch consolidation — deferred to STEP03_CSS_PATCH_INVENTORY',
      'localStorage policy unification — deferred to later step',
      'duplicate id audit-only — actual id renames deferred',
      'Gantt sticky header CSS rework — deferred',
      'data management / process page redesign — deferred'
    ],
    validation: {}
  };

  function runAudit(){
    var R = window.ODI_DEBUG_AUDIT_08J_STEP02;
    try {
      var navFn = window.nav;
      if(typeof navFn === 'function'){
        var checkFlags = [
          '__qFlowTraceWrapped','__odiReviewedSidebarOpenWrapped',
          '__v95hooked','__v96hooked','__v97hooked',
          '__q08bQualityReviewed','__q08c0aUserCleanWrapped',
          '__odi08gReviewedWrapped','__odi08hReviewedFixedWrapped',
          '__odi08jStep01Guarded'
        ];
        checkFlags.forEach(function(f){
          if(navFn[f]) R.navWrappersAfter.push({flag:f, value:!!navFn[f], note:'flag preserved but wrapping neutralized'});
        });
        // Generic scan for any other hook flags
        try {
          Object.keys(navFn).forEach(function(k){
            if(k.indexOf('__') === 0 && checkFlags.indexOf(k) === -1){
              R.navWrappersAfter.push({flag:k, value:navFn[k], note:'unlisted flag'});
            }
          });
        } catch(_e){}
      }

      R.validation.pageCount = document.querySelectorAll('.page').length;
      R.validation.nestedPageCount = document.querySelectorAll('.page .page').length;
      R.validation.navCallable = typeof window.nav === 'function';
      R.validation.dispatcherCallable = typeof window.odiNavAfterRenderDispatcher === 'function';
      R.validation.forbiddenRoutesPresent = !!window.ODI_USER_FORBIDDEN_ROUTES;

      // duplicate id quick scan
      var seen = {};
      document.querySelectorAll('[id]').forEach(function(el){
        if(!el.id) return;
        seen[el.id] = (seen[el.id]||0)+1;
      });
      var dups = [];
      Object.keys(seen).forEach(function(id){ if(seen[id]>1) dups.push({id:id,count:seen[id]}); });
      R.validation.duplicateIds = dups;

      // PM target check
      var miss = [];
      try {
        if(typeof window.PM !== 'undefined' && window.PM){
          Object.keys(window.PM).forEach(function(k){
            var id = window.PM[k];
            if(id && !document.getElementById(id)) miss.push({key:k,pageId:id});
          });
        }
      } catch(_e){}
      R.validation.missingPmTargets = miss;

      console.log('[' + VERSION + '] audit complete', R);
    } catch(err){
      R.auditError = String(err && err.message || err);
      console.warn('[' + VERSION + '] audit failed', err);
    }
  }

  // ── STEP02 수동 검수 함수 (nav smoke) ──────────────────
  window.runOdi08jStep02NavSmokeTest = function(){
    var keys = [
      'dashboard',
      'schedule',
      'equip-status',
      'team-overview',
      'schedule-log',
      'schedule-model',
      'schedule-period',
      'prod-overview',
      'prod-headcount',
      'prod-process',
      'quality-dash',
      'quality-main',
      'quality-analysis',
      'quality-action',
      'quality-images',
      'quality-master',
      'data-equip',
      'download'
    ];

    var result = {
      version: window.APP_VERSION || 'unknown',
      navCallable: typeof window.nav === 'function',
      dispatcherCallable: typeof window.odiNavAfterRenderDispatcher === 'function',
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      duplicateIds: [],
      results: [],
      missingPmTargets: [],
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
      keys.forEach(function(k){
        var row = { key:k, pageId:null, exists:false, navOk:false, active:false, activeCount:0, error:null };
        try {
          row.pageId = (typeof PM !== 'undefined' && PM && PM[k]) ? PM[k] : null;
          row.exists = !!(row.pageId && document.getElementById(row.pageId));
          if(typeof window.nav === 'function') {
            window.nav(k);
            row.navOk = true;
          }
          var el = row.pageId ? document.getElementById(row.pageId) : null;
          row.active = !!(el && el.classList.contains('active'));
          row.activeCount = document.querySelectorAll('.page.active').length;
        } catch(e) {
          row.error = String(e && e.message || e);
        }
        result.results.push(row);
      });
    } catch(e) {
      result.errors.push('nav key loop failed: ' + (e.message || e));
    }

    try {
      if(typeof PM !== 'undefined') {
        Object.keys(PM).forEach(function(k){
          var id = PM[k];
          if(id && !document.getElementById(id)) result.missingPmTargets.push({key:k,pageId:id});
        });
      }
    } catch(e) {
      result.errors.push('PM target scan failed: ' + (e.message || e));
    }

    console.log('[Q_REBUILD_08J_DEBUG_CLEANUP_STEP02_NAV_DISPATCHER_UNIFY_REVIEWED_FIXED] nav smoke', result);
    return result;
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runAudit, 1000); });
  } else {
    setTimeout(runAudit, 1000);
  }
})();
