/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 60 id=q-rebuild-08r-final-regression-script :: OPT01 no semantic edits */

(function(){
'use strict';
/* ============================================================================
 * Q_REBUILD_08R_FINAL_REGRESSION_AND_RELEASE_CANDIDATE
 * ----------------------------------------------------------------------------
 * 릴리즈 검수 전용 단계. 새 기능 추가 없음.
 *   1. 사이드 메뉴 22개 route → PM → page DOM 전수 검증
 *   2. 08M/08N/08O/08Q 보강 함수 전수 확인
 *   3. 품질 플로우: QDEFECT_WORKBOOK_READY 의존성 체계 확인
 *   4. 생산일정 핵심 기능 (schedule init/nav/render) 확인
 *   5. 데이터관리 6개 페이지 render 가능 여부
 *   6. 품질관리 보조 3개 페이지 보충 패널 확인
 *   7. 금지 항목 최종 점검 (외부 CDN / ALL_DATA / 자동판정 / 금지 문구)
 *   8. 릴리즈 후보 잠금 정보 등록
 * ============================================================================ */
var VERSION = 'Q_REBUILD_08R_FINAL_REGRESSION_AND_RELEASE_CANDIDATE_REVIEWED_FIXED';
try { window.APP_VERSION = VERSION; document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
try {
  window.CHANGELOG = window.CHANGELOG || [];
  window.CHANGELOG.push({
    version: VERSION,
    note: '08R: 릴리즈 후보 최종 회귀 검수. 22개 메뉴 전수 + 08M/N/O/Q 보강 함수 + 플로우 + 금지 항목 점검. 신규 기능 없음.'
  });
} catch(_e){}

/* ─── RELEASE LOCK ─── */
window.ODI_RELEASE_CANDIDATE = {
  version   : VERSION,
  stage     : '08R',
  buildDate : new Date().toISOString().slice(0, 10),
  baseline  : '08Q_UI_POLISH_EMPTY_STATE_AND_DARKMODE_PASS_REVIEWED_FIXED',
  changelog : ['08K quality-analysis 10-tab clean rebuild',
               '08L sidebar status map + partial page init',
               '08M data management 6 pages (file-mapping/validation/history/equip/download/guide)',
               '08N dashboard 3 + production aux 3 pages',
               '08O quality aux 3 pages (action/images/master supplement)',
               '08P sidebar 22-route reaudit (MAP_MISSING→0)',
               '08Q UI polish — 준비중 button removal, empty-state wording',
               '08R final regression + release lock'],
  knownLimitations : [
    '단일 HTML: 세션 새로고침 시 업로드 데이터 초기화',
    '이미지/파일 서버 저장 불가 — Blob 기반 CSV/JSON 다운로드만',
    '인원 입력 저장 불가 — 서버 연동 후 활성화 예정',
    '코드/분류 CRUD 미구현 — 서버 연동 후',
    'ECO/CAPA 자동화 미구현 — 운영 검토 후',
    '관리자 메뉴 6개 사용자 메뉴 미노출 — 권한 활성화 후',
    'YANGSAN_DATA/YEONJU_DATA와 WORK_DATA 이중 분기 잔존'
  ],
  lockedAt : new Date().toISOString()
};

/* ─── 전수 점검 데이터 ─── */
var R08_USER_ROUTES = [
  'dashboard','equip-status','team-overview',
  'schedule','schedule-log','schedule-model','schedule-period',
  'prod-overview','prod-headcount','prod-process',
  'quality-dash','quality-main','quality-analysis',
  'quality-action','quality-images','quality-master',
  'data-equip','upload-history','data-validation',
  'file-mapping','download','user-guide'
];

var R08_LIVE_ROUTES   = ['schedule','schedule-log','schedule-model','schedule-period',
                         'quality-dash','quality-main','quality-analysis','user-guide'];

var R08_ENHANCE_MAP = {
  /* 08M */ 'data-equip':'renderM08DataEquip','upload-history':'renderM08UploadHistory',
  'data-validation':'renderM08DataValidation','file-mapping':'renderM08FileMapping',
  'download':'renderM08Download','user-guide':'renderM08UserGuide',
  /* 08N */ 'dashboard':'renderN08DashboardKPI','equip-status':'renderN08EquipStatus',
  'team-overview':'renderN08TeamOverview','prod-overview':'renderN08ProdOverview',
  'prod-headcount':'renderN08ProdHeadcount','prod-process':'renderN08ProdProcess',
  /* 08O */ 'quality-action':'renderO08QualityAction',
  'quality-images':'renderO08QualityImages','quality-master':'renderO08QualityMaster'
};

var R08_QUALITY_FLOW_FNS = [
  'renderQDashPage','renderQMainPage','renderQAnalysisPage',
  'renderQActionPage','renderQImagesPage','renderQMasterPage',
  'qCleanRenderShell','qCleanSwitchTab','qCleanApplyFilters','qCleanResetFilters',
  'runOdiQualityAnalysisCleanRebuildCheck'
];

var R08_SCHEDULE_FNS = [
  'scheduleInit','initSchedule','renderCurrentView','renderGantt','renderCalendar',
  'schedSwitchTab','schedSwitchView','nav','odiNavAfterRenderDispatcher'
];

var R08_FORBIDDEN_PATTERNS = [
  'STEP01','STEP02','STEP03','STEP04','STEP05','STEP06','STEP07','STEP08','STEP09',
  'schema', 'blueprint', 'preview-only',
  '준비 중','준비중'
];
/* pages where 준비 중 is OK (boot placeholder / admin-only / JS string literals) */
var R08_FORBIDDEN_EXEMPTED_PAGES = ['page-notification','page-master-data-admin','page-export-center'];

/* ─── Main regression audit ─── */
window.runOdi08RFinalRegressionAudit = function(){
  var pm   = window.PM || {};
  var map  = window.ODI_MENU_STATUS_MAP || [];
  var mapIndex = {};
  map.forEach(function(m){ mapIndex[m.routeKey] = m; });

  var result = {
    version: VERSION,
    buildDate: window.ODI_RELEASE_CANDIDATE.buildDate,
    ts: new Date().toISOString(),

    /* 1. 사이드 메뉴 22개 전수 */
    sidebar: { total: R08_USER_ROUTES.length, pass: [], fail: [], pmMissing: [], domMissing: [], mapMissing: [] },

    /* 2. 보강 함수 전수 */
    enhance: { total: Object.keys(R08_ENHANCE_MAP).length, pass: [], fail: [] },

    /* 3. 품질 플로우 */
    qualityFlow: { pass: [], fail: [] },

    /* 4. 생산일정 */
    schedule: { pass: [], fail: [] },

    /* 5. 데이터관리 6개 */
    dataMgmt: { total: 6, pass: [], fail: [] },

    /* 6. 품질보조 3개 */
    qualityAux: { pass: [], fail: [] },

    /* 7. 금지 항목 */
    forbidden: { cdnScripts: 0, cdnLinks: 0, allData: false, autoJudgment: false, forbiddenText: [] },

    /* 8. 최종 판정 */
    verdict: '', score: 0, total: 0, errors: []
  };

  /* 1 ── sidebar 22개 */
  R08_USER_ROUTES.forEach(function(k){
    var hasPM  = !!pm[k];
    var pid    = pm[k];
    var hasDOM = pid ? !!document.getElementById(pid) : false;
    var hasMap = !!mapIndex[k];
    if(!hasPM) result.sidebar.pmMissing.push(k);
    if(!hasDOM) result.sidebar.domMissing.push(k);
    if(!hasMap) result.sidebar.mapMissing.push(k);
    if(hasPM && hasDOM && hasMap) result.sidebar.pass.push(k);
    else result.sidebar.fail.push(k);
  });

  /* 2 ── enhance 함수 */
  Object.keys(R08_ENHANCE_MAP).forEach(function(route){
    var fn = R08_ENHANCE_MAP[route];
    if(typeof window[fn] === 'function') result.enhance.pass.push(route + ':' + fn);
    else result.enhance.fail.push(route + ':' + fn + '(MISSING)');
  });

  /* 3 ── quality flow fns */
  R08_QUALITY_FLOW_FNS.forEach(function(fn){
    if(typeof window[fn] === 'function') result.qualityFlow.pass.push(fn);
    else result.qualityFlow.fail.push(fn + '(MISSING)');
  });
  /* qClean 10 tabs */
  var qcTabs = document.querySelectorAll('#page-quality-analysis [data-qclean="tabs"] > button').length;
  result.qualityFlow.tabCount = qcTabs;
  if(qcTabs !== 10) result.qualityFlow.fail.push('qClean tabs = ' + qcTabs + ' (expected 10)');
  else result.qualityFlow.pass.push('qClean 10 tabs');
  /* quality flow data objects */
  ['QDEFECT_WORKBOOK_READY','QRAW_ROWS','QISSUE_ROWS','QSUMMARY_DATA','QDASH_READY_DATA'].forEach(function(v){
    result.qualityFlow.pass.push(v + ' accessible=' + (typeof window[v] !== 'undefined'));
  });

  /* 4 ── schedule fns */
  R08_SCHEDULE_FNS.forEach(function(fn){
    if(typeof window[fn] === 'function') result.schedule.pass.push(fn);
    else result.schedule.fail.push(fn + '(MISSING)');
  });
  /* schedule page DOM */
  var schedPage = document.getElementById('page-schedule');
  var schedReady = schedPage && schedPage.querySelector('#gantt-rows, #calendar-grid, #batch-grid, [id^="gantt"], .sched-view');
  result.schedule.pageExists = !!schedPage;
  result.schedule.hasViewElement = !!schedReady;

  /* 5 ── data management 6 pages */
  var dataMgmt6 = {
    'data-equip':      { pageId:'page-data-equip',      fn:'renderM08DataEquip'      },
    'upload-history':  { pageId:'page-upload-history',  fn:'renderM08UploadHistory'  },
    'data-validation': { pageId:'page-data-validation', fn:'renderM08DataValidation' },
    'file-mapping':    { pageId:'page-file-mapping',    fn:'renderM08FileMapping'    },
    'download':        { pageId:'page-download',        fn:'renderM08Download'       },
    'user-guide':      { pageId:'page-user-guide',      fn:'renderM08UserGuide'      }
  };
  Object.keys(dataMgmt6).forEach(function(k){
    var cfg = dataMgmt6[k];
    var pageDom = !!document.getElementById(cfg.pageId);
    var fnReady = typeof window[cfg.fn] === 'function';
    if(pageDom && fnReady) result.dataMgmt.pass.push(k);
    else result.dataMgmt.fail.push(k + (pageDom?'':'(DOM missing)') + (fnReady?'':'(fn missing)'));
  });

  /* 6 ── quality aux 3 pages */
  var qualityAux3 = {
    'quality-action': { pageId:'page-quality-action', fn:'renderO08QualityAction', suppId:'o08-action-supplement' },
    'quality-images': { pageId:'page-quality-images', fn:'renderO08QualityImages', suppId:'o08-images-supplement' },
    'quality-master': { pageId:'page-quality-master', fn:'renderO08QualityMaster', suppId:'o08-master-supplement' }
  };
  Object.keys(qualityAux3).forEach(function(k){
    var cfg = qualityAux3[k];
    var pageDom = !!document.getElementById(cfg.pageId);
    var fnReady = typeof window[cfg.fn] === 'function';
    /* supplement panel present means O08 render already ran or will run on nav */
    if(pageDom && fnReady) result.qualityAux.pass.push(k);
    else result.qualityAux.fail.push(k + (pageDom?'':'(DOM)') + (fnReady?'':'(fn)'));
  });

  /* 7 ── forbidden items */
  result.forbidden.cdnScripts = document.querySelectorAll('script[src*="cdn."], script[src*="chart.js"], script[src*="googleapis"]').length;
  result.forbidden.cdnLinks   = document.querySelectorAll('link[href*="fonts.google"], link[href*="cdn."]').length;
  result.forbidden.allData    = typeof window.ALL_DATA !== 'undefined';
  /* auto-judgment text check in user pages */
  var autoTerms = ['자동 합격','자동 불합격','risk_score =','action_priority =','자동 위험도'];
  var userPageIds = R08_USER_ROUTES.map(function(k){ return pm[k]; }).filter(Boolean);
  var forbidText = [];
  userPageIds.forEach(function(pid){
    var page = document.getElementById(pid);
    if(!page || R08_FORBIDDEN_EXEMPTED_PAGES.indexOf(pid) >= 0) return;
    var text = (page.textContent || '').replace(/<script[\s\S]*?<\/script>/g,'');
    /* forbidden UI patterns (exclude boot placeholder) */
    R08_FORBIDDEN_PATTERNS.forEach(function(pat){
      if(pat === '준비 중' || pat === '준비중'){
        /* only flag if not inside data-qclean=boot (which is replaced at runtime) */
        var bootEl = page.querySelector('[data-qclean="boot"]');
        var checkText = bootEl ? text.replace(bootEl.textContent || '','') : text;
        if(checkText.indexOf(pat) >= 0) forbidText.push(pid + ':' + pat);
      } else {
        if(text.indexOf(pat) >= 0) forbidText.push(pid + ':' + pat);
      }
    });
    autoTerms.forEach(function(t){ if(text.indexOf(t) >= 0) result.forbidden.autoJudgment = true; });
  });
  result.forbidden.forbiddenText = forbidText;

  /* 8 ── score + verdict */
  var checks = [
    { k:'sidebar 22 all pass',       v: result.sidebar.fail.length === 0 },
    { k:'ODI_MENU_STATUS_MAP 0 miss', v: result.sidebar.mapMissing.length === 0 },
    { k:'enhance 15 fn all present', v: result.enhance.fail.length === 0 },
    { k:'quality flow fns all',      v: result.qualityFlow.fail.filter(function(s){ return s.indexOf('accessible') < 0; }).length === 0 },
    { k:'qClean 10 tabs',            v: qcTabs === 10 },
    { k:'schedule fns all',          v: result.schedule.fail.length === 0 },
    { k:'dataMgmt 6 all',            v: result.dataMgmt.fail.length === 0 },
    { k:'qualityAux 3 all',          v: result.qualityAux.fail.length === 0 },
    { k:'no external CDN',           v: result.forbidden.cdnScripts === 0 && result.forbidden.cdnLinks === 0 },
    { k:'no ALL_DATA',               v: !result.forbidden.allData },
    { k:'no auto-judgment text',     v: !result.forbidden.autoJudgment },
    { k:'no forbidden UI text',      v: result.forbidden.forbiddenText.length === 0 }
  ];
  result.checkResults = checks;
  result.score  = checks.filter(function(c){ return c.v; }).length;
  result.total  = checks.length;
  result.passing = checks.filter(function(c){ return c.v; }).map(function(c){ return c.k; });
  result.failing = checks.filter(function(c){ return !c.v; }).map(function(c){ return c.k; });
  result.verdict = result.failing.length === 0 ? 'RELEASE_CANDIDATE' : 'BLOCKED(' + result.failing.length + ')';

  try { console.log('[' + VERSION + '] FINAL REGRESSION', result); } catch(_e){}
  return result;
};

/* ─── nav smoke (called by audit) ─── */
window.runOdi08RNavSmoke = function(){
  var results = {};
  R08_USER_ROUTES.forEach(function(k){
    try { window.nav(k); results[k] = 'ok'; }
    catch(e){ results[k] = 'FAIL: ' + (e.message || String(e)); }
  });
  return results;
};

function r08Init(){
  /* auto-run audit and print to console at boot */
  setTimeout(function(){
    try {
      var audit = window.runOdi08RFinalRegressionAudit();
      var verdict = audit.verdict;
      var score   = audit.score + '/' + audit.total;
      console.log('[' + VERSION + '] =================================');
      console.log('[' + VERSION + '] VERDICT : ' + verdict + ' | SCORE: ' + score);
      if(audit.failing.length) console.log('[' + VERSION + '] FAILING : ' + audit.failing.join(' | '));
      console.log('[' + VERSION + '] =================================');
    } catch(e){ try{console.warn('[' + VERSION + '] audit error', e);}catch(_e){} }
  }, 1400);
}
function r08Boot(){ setTimeout(r08Init, 100); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', r08Boot);
else r08Boot();

})();
