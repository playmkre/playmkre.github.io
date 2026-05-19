/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 58 id=q-rebuild-08p-sidebar-reaudit-script :: OPT01 no semantic edits */

(function(){
'use strict';
/* ============================================================================
 * Q_REBUILD_08P_SIDEBAR_COMPLETION_REAUDIT
 * ----------------------------------------------------------------------------
 * 새 기능 추가가 아닌 재점검 + audit 함수 갱신.
 * 08M/08N/08O 보강 완료 후 전체 사이드 메뉴 22개 재분류 및 상태 확인.
 *   ① 사이드바 22개 route → PM → page DOM 연결 확인
 *   ② ODI_MENU_STATUS_MAP 누락 0건 확인
 *   ③ 08M 데이터관리 6개 / 08N 대시보드·생산관리 6개 / 08O 품질보조 3개 열리는지
 *   ④ LIVE 페이지 8개 손상 없음 확인 (quality-analysis 10탭 포함)
 *   ⑤ 전체 상태 분류 갱신 (LIVE/PARTIAL/MAP_MISSING)
 *   ⑥ window.runOdi08PSidebarReaudit() — 완전한 재검사 함수
 * ============================================================================ */
var VERSION = 'Q_REBUILD_08P_SIDEBAR_COMPLETION_REAUDIT_REVIEWED_FIXED';
try { window.APP_VERSION = VERSION; document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
try {
  window.CHANGELOG = window.CHANGELOG||[];
  window.CHANGELOG.push({ version: VERSION, note: '08P: 사이드 메뉴 22개 전수 재점검. 08M 데이터관리·08N 대시보드/생산관리·08O 품질보조 보강 상태 확인. ODI_MENU_STATUS_MAP 29 entries 상태 최신화. page-quality-analysis 10탭 유지 확인. 새 기능 추가 없음.' });
} catch(_e){}

/* ─── Updated status map for 22 user sidebar routes ───
 * 08M~08O 기준으로 갱신된 실제 완성도 분류.
 * ODI_MENU_STATUS_MAP 에 이미 있는 entries 는 갱신 반영만. */
var P08_SIDEBAR_STATUS = {
  /* ① 대시보드 */
  'dashboard'      : { label:'종합 현황',          group:'대시보드', status:'PARTIAL', since:'08N', note:'KPI + dash-progress + 품질 KPI 보강. renderN08DashboardKPI 연결.' },
  'equip-status'   : { label:'장비 생산현황',       group:'대시보드', status:'PARTIAL', since:'08N', note:'호기별 카드 + KPI. renderN08EquipStatus(_es2Build) 연결.' },
  'team-overview'  : { label:'팀별 업무 현황',      group:'대시보드', status:'PARTIAL', since:'08N', note:'_to2Build + 업무 기재 상태 안내 패널. renderN08TeamOverview 연결.' },
  /* ② 일정 관리 */
  'schedule'       : { label:'생산일정 관리',       group:'일정관리', status:'LIVE',    since:'원본', note:'간트·캘린더·배치 완성. 핵심 LIVE 페이지.' },
  'schedule-log'   : { label:'스케줄 변동 이력',    group:'일정관리', status:'LIVE',    since:'원본', note:'세션 변동 이력 완성.' },
  'schedule-model' : { label:'모델별 상세',         group:'일정관리', status:'LIVE',    since:'원본', note:'모델별 단계 흐름 완성.' },
  'schedule-period': { label:'기간별 분석',         group:'일정관리', status:'LIVE',    since:'원본', note:'기간별 stacked bar 완성.' },
  /* ③ 생산관리 */
  'prod-overview'  : { label:'종합 파악',           group:'생산관리', status:'PARTIAL', since:'08N', note:'renderUserProdOverviewPage + renderN08ProdOverview 프록시 연결.' },
  'prod-headcount' : { label:'생산인원 입력',       group:'생산관리', status:'PARTIAL', since:'08N', note:'입력 매트릭스 보강. 저장 기능 없음 명시.' },
  'prod-process'   : { label:'공정 현황',           group:'생산관리', status:'PARTIAL', since:'08N', note:'병목 후보 + matrix. renderN08ProdProcess 연결.' },
  /* ④ 품질관리 */
  'quality-dash'   : { label:'품질 통합 대시보드',  group:'품질관리', status:'LIVE',    since:'원본', note:'renderQDashPage 완성. 6A 차트 포함.' },
  'quality-main'   : { label:'불량 관리 센터',      group:'품질관리', status:'LIVE',    since:'원본', note:'엑셀 업로드→Raw→Issue→Summary→Dashboard Ready 전체 플로우.' },
  'quality-analysis': { label:'품질 분석 센터',     group:'품질관리', status:'LIVE',    since:'08K', note:'10탭 clean rebuild (08K). 필터/Raw 50건 cap/반복 후보/생산일정 연계.' },
  'quality-action' : { label:'조치 · ECO · CAPA',  group:'품질관리', status:'PARTIAL', since:'08O', note:'8탭 + 조치 후보 표(담당/기한/상태) + CAPA/ECO 반복 후보 패널 (08O).' },
  'quality-images' : { label:'이미지 / 증빙',       group:'품질관리', status:'PARTIAL', since:'08O', note:'5탭 + 이미지 있음/없음 KPI + 호기별 첨부 현황 (08O).' },
  'quality-master' : { label:'기준정보 / 코드',     group:'품질관리', status:'PARTIAL', since:'08O', note:'7탭 + 코드 매핑 현황 + 미분류 + 검토 필요 (08O). CRUD 미구현.' },
  /* ⑤ 데이터관리 */
  'data-equip'     : { label:'장비 데이터',         group:'데이터관리', status:'PARTIAL', since:'08M', note:'감지 장비 수/미매핑/master 표. renderM08DataEquip.' },
  'upload-history' : { label:'업로드 이력',         group:'데이터관리', status:'PARTIAL', since:'08M', note:'세션 기준 업로드 이력 표. renderM08UploadHistory.' },
  'data-validation': { label:'데이터 검증',         group:'데이터관리', status:'PARTIAL', since:'08M', note:'필수값/날짜/장비/중복 검증. renderM08DataValidation.' },
  'file-mapping'   : { label:'파일 매핑',           group:'데이터관리', status:'PARTIAL', since:'08M', note:'시트·컬럼 매핑 현황 표. renderM08FileMapping. CRUD 미구현.' },
  'download'       : { label:'내보내기 / 다운로드', group:'데이터관리', status:'PARTIAL', since:'08M', note:'CSV/JSON 7종 다운로드 (Blob). renderM08Download.' },
  'user-guide'     : { label:'사용 가이드',         group:'데이터관리', status:'LIVE',    since:'08M', note:'4 워크플로우 + 주의사항 + 용어 설명. LIVE 상태 정적 가이드.' }
};

/* LIVE 확정 페이지 목록 */
var P08_LIVE_PAGES = ['schedule','schedule-log','schedule-model','schedule-period',
                      'quality-dash','quality-main','quality-analysis','user-guide'];

/* 08M~08O 보강 페이지 */
var P08_ENHANCED_BY_STAGE = {
  '08M': ['data-equip','upload-history','data-validation','file-mapping','download','user-guide'],
  '08N': ['dashboard','equip-status','team-overview','prod-overview','prod-headcount','prod-process'],
  '08O': ['quality-action','quality-images','quality-master']
};

/* ─── Sync ODI_MENU_STATUS_MAP with 08P status ─── */
function p08SyncStatusMap(){
  try {
    if(!Array.isArray(window.ODI_MENU_STATUS_MAP)) return false;
    var map = window.ODI_MENU_STATUS_MAP;
    var existing = {};
    map.forEach(function(m){ existing[m.routeKey] = m; });
    Object.keys(P08_SIDEBAR_STATUS).forEach(function(k){
      var info = P08_SIDEBAR_STATUS[k];
      if(existing[k]){
        /* update status if different */
        if(existing[k].status !== info.status) existing[k].status = info.status;
        existing[k].notes_08p = '08P재분류: ' + info.note;
      }
      /* missing entries will have been added by m08AugmentMenuStatusMap */
    });
    return true;
  } catch(e){ return false; }
}

/* ─── Main reaudit function ─── */
window.runOdi08PSidebarReaudit = function(){
  var userSidebarRoutes = Object.keys(P08_SIDEBAR_STATUS);
  var pmHas = {}, pageDomHas = {}, mapStatus = {}, renderFns = {};
  var pm = window.PM || {};
  userSidebarRoutes.forEach(function(k){
    pmHas[k]     = !!pm[k];
    var pid       = pm[k];
    pageDomHas[k] = pid ? !!document.getElementById(pid) : false;
    var mapEntry  = Array.isArray(window.ODI_MENU_STATUS_MAP)
                  ? window.ODI_MENU_STATUS_MAP.find(function(m){ return m.routeKey===k; })
                  : null;
    mapStatus[k]  = mapEntry ? mapEntry.status : 'MAP_MISSING';
    /* check render function availability — explicit map avoids camelCase ambiguity */
    var FN_MAP_08P = {
      'data-equip':      'renderM08DataEquip',
      'upload-history':  'renderM08UploadHistory',
      'data-validation': 'renderM08DataValidation',
      'file-mapping':    'renderM08FileMapping',
      'download':        'renderM08Download',
      'user-guide':      'renderM08UserGuide',
      'dashboard':       'renderN08DashboardKPI',
      'equip-status':    'renderN08EquipStatus',
      'team-overview':   'renderN08TeamOverview',
      'prod-overview':   'renderN08ProdOverview',
      'prod-headcount':  'renderN08ProdHeadcount',
      'prod-process':    'renderN08ProdProcess',
      'quality-action':  'renderO08QualityAction',
      'quality-images':  'renderO08QualityImages',
      'quality-master':  'renderO08QualityMaster'
    };
    var expected = FN_MAP_08P[k] || null;
    renderFns[k] = expected ? (typeof window[expected]==='function' ? expected : '(MISSING: '+expected+')') : 'native';
  });

  var mapMissing = userSidebarRoutes.filter(function(k){ return mapStatus[k]==='MAP_MISSING'; });
  var pmMissing  = userSidebarRoutes.filter(function(k){ return !pmHas[k]; });
  var domMissing = userSidebarRoutes.filter(function(k){ return !pageDomHas[k]; });

  /* LIVE page integrity */
  var liveIntegrity = {};
  P08_LIVE_PAGES.forEach(function(k){
    var pid = pm[k];
    liveIntegrity[k] = pid ? !!document.getElementById(pid) : false;
  });
  var qcTabs = document.querySelectorAll('#page-quality-analysis [data-qclean="tabs"] > button').length;

  /* 08M/08N/08O render function check */
  var enhancedCheck = {};
  Object.keys(P08_ENHANCED_BY_STAGE).forEach(function(stg){
    enhancedCheck[stg] = {};
    P08_ENHANCED_BY_STAGE[stg].forEach(function(k){
      var fnName = renderFns[k];
      enhancedCheck[stg][k] = {
        fn: fnName,
        fnAvail: fnName === 'native' || (fnName && fnName.indexOf('not found') < 0 && typeof window[fnName] === 'function'),
        pageDom: pageDomHas[k]
      };
    });
  });

  /* status counts */
  var counts = { LIVE:0, PARTIAL:0, MAP_MISSING:0 };
  userSidebarRoutes.forEach(function(k){
    var s = P08_SIDEBAR_STATUS[k].status;
    if(counts[s] !== undefined) counts[s]++;
  });

  var result = {
    version: VERSION,
    timestamp: new Date().toISOString(),
    sidebarRouteCount: userSidebarRoutes.length,
    sidebarRoutes: userSidebarRoutes,
    mapMissingCount: mapMissing.length,
    mapMissing: mapMissing,
    pmMissingCount: pmMissing.length,
    pmMissing: pmMissing,
    domMissingCount: domMissing.length,
    domMissing: domMissing,
    statusCounts: counts,
    allClear: mapMissing.length===0 && pmMissing.length===0 && domMissing.length===0,
    statusByRoute: mapStatus,
    renderFnByRoute: renderFns,
    livePageIntegrity: liveIntegrity,
    qCleanTabsCount: qcTabs,
    liveAllIntact: Object.values(liveIntegrity).every(function(v){ return v; }),
    enhancedByStage: enhancedCheck,
    externalCdnAdded: !!document.querySelector('script[src*="cdn."], script[src*="chart.js"], link[href*="fonts.google"]'),
    allDataImported: typeof window.ALL_DATA !== 'undefined',
    errors: []
  };
  try { console.log('[' + VERSION + '] sidebar-reaudit', result); } catch(_e){}
  return result;
};

/* expose status table for Figma map */
window.ODI_P08_SIDEBAR_STATUS = P08_SIDEBAR_STATUS;
window.ODI_P08_LIVE_PAGES     = P08_LIVE_PAGES;
window.ODI_P08_ENHANCED_BY_STAGE = P08_ENHANCED_BY_STAGE;

function p08Init(){
  try { p08SyncStatusMap(); } catch(_e){}
}
function p08Boot(){ setTimeout(p08Init, 1100); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', p08Boot);
else p08Boot();

})();
