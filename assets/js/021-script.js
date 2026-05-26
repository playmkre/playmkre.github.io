/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 21 id=(none) :: OPT01 no semantic edits */


'use strict';

// SheetJS is lazy-loaded only when Excel upload/download is used.
const XLSX_CDN_URL='https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js';
let _xlsxLoadPromise=null;
function ensureXlsxReady(){
  if(window.XLSX) return Promise.resolve(window.XLSX);
  if(_xlsxLoadPromise) return _xlsxLoadPromise;
  if(typeof showToast==='function') showToast('엑셀 엔진 로딩 중...', 'warn');
  _xlsxLoadPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-xlsx-loader="1"]');
    if(existing){
      existing.addEventListener('load',()=>window.XLSX?resolve(window.XLSX):reject(new Error('SheetJS 객체 없음')),{once:true});
      existing.addEventListener('error',()=>reject(new Error('SheetJS 네트워크 로드 실패')),{once:true});
      return;
    }
    const sc=document.createElement('script');
    sc.src=XLSX_CDN_URL;
    sc.async=true;
    sc.defer=true;
    sc.dataset.xlsxLoader='1';
    sc.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('SheetJS 객체 없음'));
    sc.onerror=()=>reject(new Error('SheetJS 네트워크 로드 실패'));
    document.head.appendChild(sc);
  });
  return _xlsxLoadPromise;
}

// ── 원본 캘린더 함수 표현식 전역 선언 (strict mode 호환, v0.24) ─────────────────
var schedSwitchTab, schedSwitchView, initSchedule;

// ══════════════════════════════════════════
//  포털 Shell — 라우팅 / 테마 / 공통
// ══════════════════════════════════════════
const PM = {
  'dashboard':'page-dashboard','schedule':'page-schedule',
  'equip-status':'page-equip-status','team-overview':'page-team-overview',
  'schedule-log':'page-schedule-log','schedule-model':'page-schedule-model',
  'schedule-period':'page-schedule-period','prod-overview':'page-prod-overview',
  'prod-headcount':'page-prod-headcount','prod-process':'page-prod-process',
  'quality':'page-quality-dash','quality-dash':'page-quality-dash',
  'quality-main':'page-quality-main','quality-analysis':'page-quality-analysis',
  'quality-action':'page-quality-action','quality-images':'page-quality-images',
  'quality-master':'page-quality-master',
  'data-equip':'page-data-equip','download':'page-download',
  'test-management':'page-test-management',
  'change-log':'page-change-log',
  'system-guide':'page-system-guide',
  'notification':'page-notification',
  'menu-admin':'page-menu-admin',
  'master-data-admin':'page-master-data-admin',
  'export-center':'page-export-center',
  'upload-history': 'page-upload-history',
  'data-validation': 'page-data-validation',
  'file-mapping': 'page-file-mapping',
  'user-guide': 'page-user-guide'
};
try { window.PM = PM; } catch(_e){}
function nav(k){
  // [STEP02 nav core] — wrapper chain absorbed into dispatcher
  // 1. forbidden route guard (was __q08c0aUserCleanWrapped)
  try {
    if(window.ODI_USER_FORBIDDEN_ROUTES && window.ODI_USER_FORBIDDEN_ROUTES[k]){
      console.warn('[USER PORTAL] blocked admin/dev/test route:', k);
      k = 'dashboard';
    }
  } catch(_e){}
  // 2. PM target sanity warn (was __odi08jStep01Guarded)
  try {
    if(typeof PM !== 'undefined' && PM && k && !PM[k]){
      console.warn('[STEP02 nav] called with unknown key:', k);
    } else if(typeof PM !== 'undefined' && PM && PM[k] && !document.getElementById(PM[k])){
      console.warn('[STEP02 nav] target pageId missing in DOM:', PM[k], 'for key', k);
    }
  } catch(_e){}
  try {
    // 3. clear active on all .page
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
    // 4. activate target .page  +  6. scrollTop = 0
    const pid=PM[k];
    if(pid){const el=document.getElementById(pid);if(el){el.classList.add('active');var _mc=document.getElementById('main-content');if(_mc)_mc.scrollTop=0;}}
    // 5. sidebar active processing
    document.querySelectorAll('.sb-item').forEach(i=>{
      if((i.getAttribute('onclick')||'').includes("'"+k+"'"))i.classList.add('active');
    });
    // 7. after-render dispatcher  (+ 8. sidebar all-open is inside the dispatcher)
    if(typeof odiNavAfterRenderDispatcher === 'function') odiNavAfterRenderDispatcher(k);
  } catch(err){
    console.warn('[STEP02 nav] core threw, swallowed to prevent UI break:', err);
  }
}

// ════════════════════════════════════════════════════════
// [STEP02] Unified after-render dispatcher
// ════════════════════════════════════════════════════════
// 통합 대상 wrapper들:
//   __qFlowTraceWrapped, __odiReviewedSidebarOpenWrapped,
//   __v95hooked, __v96hooked, __v97hooked,
//   __q08bQualityReviewed, __odi08gReviewedWrapped,
//   __odi08hReviewedFixedWrapped, __odi08jStep01Guarded
function odiNavAfterRenderDispatcher(k){
  try {
    // schedule (was inline in old base nav)
    if(k === 'schedule'){
      setTimeout(function(){
        if(typeof scheduleInit === 'function') scheduleInit();
        else if(typeof initSchedule === 'function') initSchedule();
      }, 80);
    }
    // dashboard (was inline in old base nav + __odiReviewedSidebarOpenWrapped)
    if(k === 'dashboard'){
      setTimeout(function(){
        if(typeof renderDashboardKPI === 'function') renderDashboardKPI();
        if(typeof renderDashboardSummaryNotes === 'function') renderDashboardSummaryNotes();
      }, 50);
    }
    // schedule-model (was in __v95/96/97hooked as renderUserModelDetailPage)
    if(k === 'schedule-model'){
      setTimeout(function(){
        if(typeof renderUserModelDetailPage === 'function') {
          try { renderUserModelDetailPage(); } catch(e){ console.warn('[STEP02] renderUserModelDetailPage failed', e); }
        }
      }, 60);
    }
    // schedule-log/model/period refresh (was __odi08gReviewedWrapped)
    if(k === 'schedule-log' || k === 'schedule-model' || k === 'schedule-period'){
      setTimeout(function(){
        try{ if(typeof window._slogRender === 'function') window._slogRender(); }catch(_e){}
        try{ if(typeof window._smBuild === 'function') window._smBuild(); }catch(_e){}
        try{ if(typeof window._spBuild === 'function') window._spBuild(); }catch(_e){}
      }, 120);
    }
    // quality renders (was inline in old base nav + __v95/96/97hooked + __qFlowTraceWrapped + __q08bQualityReviewed)
    var qualityRenderMap = {
      'quality':          function(){ if(typeof renderQDashPage === 'function') renderQDashPage(); },
      'quality-dash':     function(){ if(typeof renderQDashPage === 'function') renderQDashPage(); },
      'quality-main':     function(){ if(typeof renderQMainPage === 'function') renderQMainPage(); },
      'quality-analysis': function(){ if(typeof renderQAnalysisPage === 'function') renderQAnalysisPage(); },
      'quality-action':   function(){ if(typeof renderQActionPage === 'function') renderQActionPage(); },
      'quality-images':   function(){ if(typeof renderQImagesPage === 'function') renderQImagesPage(); },
      'quality-master':   function(){ if(typeof renderQMasterPage === 'function') renderQMasterPage(); }
    };
    if(qualityRenderMap[k]){
      setTimeout(function(){
        if(typeof qEnsureQualityFlowTraceContainers === 'function') {
          try { qEnsureQualityFlowTraceContainers(); } catch(_e){}
        }
        try { qualityRenderMap[k](); } catch(e){ console.warn('[STEP02] quality render failed', k, e); }
        if(typeof qRefreshQualityFlowTracePanel === 'function') {
          try { qRefreshQualityFlowTracePanel('nav-quality'); } catch(_e){}
        }
        if(typeof q08bHardenQualityDom === 'function') {
          try { q08bHardenQualityDom(); } catch(_e){}
        }
      }, 60);
    }
    // prod-overview/headcount/process refresh (was __v95/96/97hooked partial + __odi08hReviewedFixedWrapped)
    if(k === 'prod-overview' || k === 'prod-headcount' || k === 'prod-process'){
      setTimeout(function(){
        try {
          if(k === 'prod-overview' && typeof renderUserProdOverviewPage === 'function') renderUserProdOverviewPage();
          if(k === 'prod-headcount' && typeof renderUserProdHeadcountPage === 'function') renderUserProdHeadcountPage();
          if(k === 'prod-process' && typeof renderUserProdProcessPage === 'function') renderUserProdProcessPage();
        } catch(e){ console.warn('[STEP02] prod render failed', k, e); }
      }, 90);
    }
    // sidebar all-open (was __odiReviewedSidebarOpenWrapped) — 8단계
    setTimeout(function(){
      if(typeof odiEnsureSidebarAllGroupsOpen === 'function') {
        try { odiEnsureSidebarAllGroupsOpen(); } catch(_e){}
      }
    }, 0);
    // generic flow-trace refresh (was __qFlowTraceWrapped 'nav' + __odiReviewedSidebarOpenWrapped 'nav-reviewed')
    setTimeout(function(){
      if(typeof qRefreshQualityFlowTracePanel === 'function') {
        try { qRefreshQualityFlowTracePanel('nav-trace'); } catch(_e){}
      }
    }, 130);
  } catch(e) {
    console.warn('[STEP02 nav dispatcher] after-render failed', k, e);
  }
}
function navToScheduleView(view){
  nav('schedule');
  setTimeout(()=>{
    if(typeof schedSwitchTab==='function') schedSwitchTab('view');
    if(typeof schedSwitchView==='function') schedSwitchView(view || 'calendar');
    const main=document.getElementById('main-content');
    if(main) main.scrollTop=0;
  },140);
}
function togGrp(h){
  const items=h.nextElementSibling;
  const ch=h.querySelector('.sb-ch');
  items.classList.toggle('open');
  if(ch) ch.classList.toggle('open');
}
function odiEnsureSidebarAllGroupsOpen(){
  try{
    document.querySelectorAll('#sidebar .sb-items').forEach(function(el){ el.classList.add('open'); });
    document.querySelectorAll('#sidebar .sb-ch').forEach(function(el){ el.classList.add('open'); });
  }catch(err){ console.warn('[ODI_MENU] sidebar open ensure failed', err); }
}

function toggleTheme(){
  const cur=document.body.dataset.theme||'dark';
  document.body.dataset.theme=cur==='dark'?'light':'dark';
  localStorage.setItem('odi_theme',document.body.dataset.theme);
}
const MENU_CONFIG_KEY='odi_menu_config';
function applyMenuConfigToSidebar(){
  const cfg=JSON.parse(localStorage.getItem(MENU_CONFIG_KEY)||'[]');
  if(!cfg.length) return;
  const styleEl=document.getElementById('menu-config-styles');
  if(!styleEl) return;
  const css=[];
  cfg.forEach(m=>{
    const sel=`[data-menu-id="${m.menu_id}"]`;
    if(m.text_color) css.push(`${sel}{color:${m.text_color}!important}`);
    if(m.active_bg_color) css.push(`${sel}.active{background:${m.active_bg_color}!important}`);
    if(!m.visible) css.push(`${sel}{display:none!important}`);
  });
  styleEl.textContent=css.join('\n');
  if(typeof odiEnsureSidebarAllGroupsOpen==='function') odiEnsureSidebarAllGroupsOpen();
}

// 대시보드 KPI — 생산일정 원천 데이터 기반
// 대시보드 KPI — YANGSAN_DATA / YEONJU_DATA 기반 (업로드 후 저장된 확정 데이터만)
function getScheduleStatusOrder(){return ['계획','대기','진행','출고','완료'];}
// v0.34: 종합현황 기준 설정 — 추후 관리자 콘솔 > 대시보드 기준 설정에서 저장/수정
const DASHBOARD_RULE_CONFIG={
  rangeDaysBefore:30,
  rangeDaysAfter:30,
  // v0.46 확정: 생산기간은 개별 작업 컬럼 묶음이 아니라
  // 전장/기구/배선 시작일 ~ 적층 종료일 한 구간으로 판단한다.
  productionPeriodStartKey:'jungjiangStart',
  productionPeriodEndKey:'jeokjeungEnd',
  productionPeriodStartLabel:'전장/기구/배선 시작일',
  productionPeriodEndLabel:'적층 종료일',
  productionStageKeys:['jungjiang','test','jeokjeung'],
  productionStageLabels:['전장/기구/배선','TEST/세팅','적층'],
  labels:{
    production:'생산 진행/예정',
    planWait:'계획·입고대기',
    shipOpen:'출고 후 해체대기',
    done:'해체 완료'
  }
};
// v0.46 HARD GATE:
// 생산일정 데이터는 파일 내부 샘플/테스트 데이터와 localStorage 저장소를 절대 사용하지 않는다.
// 현재 브라우저 세션에서 엑셀 업로드 후 저장 버튼을 누른 메모리 데이터만 대시보드/일정보기에 반영한다.
let SCHEDULE_DATA_READY=false;
let SCHEDULE_LAST_SAVED_AT='';
function hasScheduleDataReady(){ return SCHEDULE_DATA_READY===true; }
function markScheduleDataReady(){
  SCHEDULE_DATA_READY=true;
  setTimeout(function(){
    if(typeof renderDashboardSummaryNotes==='function') renderDashboardSummaryNotes();
  }, 100);
}
function clearScheduleDataReady(){ SCHEDULE_DATA_READY=false; SCHEDULE_LAST_SAVED_AT=''; }
function escHtml(v){return String(v ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
function getStageColor(status){return {'계획':'var(--tm)','대기':'var(--am)','진행':'var(--ac)','출고':'var(--cy)','완료':'var(--gr)','지연':'var(--rd)'}[status] || 'var(--ts)';}
function getRowStageInfo(row){
  const schema = (typeof ACTIVE_SCHEMA !== 'undefined' && ACTIVE_SCHEMA) ? ACTIVE_SCHEMA : {materials:[],works:[],semix:[]};
  const mats = schema.materials || [];
  const works = schema.works || [];
  const semix = schema.semix || [];
  const haejeKey = (semix.find(s => /해체|분해|disassembly/i.test((s.label||'')+(s.key||''))) || semix[1] || {}).key || 'haeje';
  const chulgoKey = (semix.find(s => /출고|출하|shipping/i.test((s.label||'')+(s.key||''))) || semix[0] || {}).key || 'chulgo';
  if(row[haejeKey]) return {status:'완료', label:'해체 완료', field:haejeKey, date:row[haejeKey], progress:100};
  if(row[chulgoKey]) return {status:'출고', label:'출고 완료', field:chulgoKey, date:row[chulgoKey], progress:88};
  let latestWork = null;
  works.forEach((w,idx)=>{
    const s=row[w.key+'Start'], e=row[w.key+'End'];
    if(s) latestWork = {status:'진행', label:w.label + ' 시작', field:w.key+'Start', date:s, progress:35 + Math.round((idx/Math.max(1,works.length))*42)};
    if(e) latestWork = {status:'진행', label:w.label + ' 완료', field:w.key+'End', date:e, progress:42 + Math.round(((idx+1)/Math.max(1,works.length))*38)};
  });
  if(latestWork) return latestWork;
  let latestMat = null;
  mats.forEach((m,idx)=>{ if(row[m.key]) latestMat = {status:'대기', label:m.label + ' 입고 완료', field:m.key, date:row[m.key], progress:15 + Math.round(((idx+1)/Math.max(1,mats.length))*15)}; });
  if(latestMat) return latestMat;
  return {status:'계획', label:'부자재 입고 전', field:'', date:'', progress:5};
}
function hasScheduleDelay(row){
  try{ if(typeof validateRow === 'function' && validateRow(row).length > 0) return true; }catch(e){}
  return /지연|delay/i.test(String(row.note || ''));
}
function renderDashboardKPI(){
  // v0.46 HARD GATE:
  // 업로드 후 저장 전에는 어떤 localStorage / 잔여 데이터도 대시보드에 표시하지 않는다.
  // 대시보드는 현재 세션에서 저장이 완료된 메모리 데이터만 사용한다.
  const ready = hasScheduleDataReady();
  const ys = (ready && typeof YANGSAN_DATA !== 'undefined' && Array.isArray(YANGSAN_DATA)) ? YANGSAN_DATA : [];
  const yr = (ready && typeof YEONJU_DATA  !== 'undefined' && Array.isArray(YEONJU_DATA))  ? YEONJU_DATA  : [];
  const allRows=[...ys,...yr];
  const total = allRows.length;
  const setV = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  const today = dashboardToday();
  const rangeStart = addDashboardDays(today, -(DASHBOARD_RULE_CONFIG.rangeDaysBefore||30));
  const rangeEnd   = addDashboardDays(today,  (DASHBOARD_RULE_CONFIG.rangeDaysAfter||30));
  const rangeLabel = fmtDashDate(rangeStart)+' ~ '+fmtDashDate(rangeEnd);

  const focusRows = buildDashboardFocusRows(allRows, rangeStart, rangeEnd, today);
  const focusTotal = focusRows.length;
  const stageCounts = Object.fromEntries(getScheduleStatusOrder().map(k=>[k,0]));
  focusRows.forEach(item=>{ const st=item.info.status; stageCounts[st]=(stageCounts[st]||0)+1; });

  const productionCount = stageCounts['진행'] || 0;
  const planWaitCount = (stageCounts['계획']||0) + (stageCounts['대기']||0);
  const shipWaitingCount = stageCounts['출고'] || 0;
  const dismantledCount = stageCounts['완료'] || 0;

  setV('kpi-yangsan', productionCount);
  setV('kpi-yeonju',  planWaitCount);
  setV('kpi-delay-val', shipWaitingCount);
  setV('kpi-done-val', dismantledCount);

  const summaryEl=document.getElementById('dash-status-summary');
  if(summaryEl){
    if(!total){
      summaryEl.innerHTML='<div style="color:var(--tm);font-size:11.5px;line-height:1.9">생산일정 데이터 없음</div>';
    }else{
      const warnCount=focusRows.filter(x=>x.warn).length;
      summaryEl.innerHTML=
        '<div style="font-size:10.5px;color:var(--tm);margin-bottom:2px">기준 범위: '+rangeLabel+' · 생산기간 기준: 전장/기구/배선 시작일 ~ 적층 종료일 · 운영 대상 '+focusTotal+'건 / 전체 원장 '+total+'건</div>'+
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">'+
          '<div style="background:var(--acd);border:1px solid rgba(88,166,255,.22);border-radius:7px;padding:7px"><div style="font-size:10px;color:var(--ts)">'+DASHBOARD_RULE_CONFIG.labels.production+'</div><b style="font-size:18px;color:var(--ac)">'+productionCount+'</b></div>'+
          '<div style="background:var(--amd);border:1px solid rgba(210,153,34,.22);border-radius:7px;padding:7px"><div style="font-size:10px;color:var(--ts)">'+DASHBOARD_RULE_CONFIG.labels.planWait+'</div><b style="font-size:18px;color:var(--am)">'+planWaitCount+'</b></div>'+
          '<div style="background:var(--cyd);border:1px solid rgba(57,197,207,.22);border-radius:7px;padding:7px"><div style="font-size:10px;color:var(--ts)">'+DASHBOARD_RULE_CONFIG.labels.shipOpen+'</div><b style="font-size:18px;color:var(--cy)">'+shipWaitingCount+'</b></div>'+
          '<div style="background:var(--grd);border:1px solid rgba(63,185,80,.22);border-radius:7px;padding:7px"><div style="font-size:10px;color:var(--ts)">'+DASHBOARD_RULE_CONFIG.labels.done+'</div><b style="font-size:18px;color:var(--gr)">'+dismantledCount+'</b></div>'+
        '</div>'+
        (focusTotal?getScheduleStatusOrder().map(st=>{
          const cnt=stageCounts[st]||0, pct=focusTotal?Math.round(cnt/focusTotal*100):0, c=getStageColor(st);
          return '<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px"><b style="color:'+c.text+'">'+st+'</b><span style="color:var(--ts)">'+cnt+'건 · '+pct+'%</span></div><div class="progress-bar" style="height:4px"><div class="progress-fill" style="width:'+pct+'%;background:'+c.text+'"></div></div></div>';
        }).join(''):'<div style="color:var(--tm);font-size:11.5px;line-height:1.8">해당 기간에 포함되는 작업/출고/해체 대상이 없습니다. 전체 원장은 생산일정 관리에서 확인합니다.</div>')+
        '<div style="font-size:10px;color:var(--tm);margin-top:6px">※ 기준 설정은 관리자 콘솔 > 시스템 설정 > 대시보드 기준 설정에서 범위/공정 컬럼을 수정하는 구조로 분리 예정</div>'+
        (warnCount?'<div style="font-size:10.5px;color:var(--rd);margin-top:6px">일정 검증 경고 '+warnCount+'건 포함</div>':'');
    }
  }

  const monthlyEl=document.getElementById('dash-monthly-output');
  if(monthlyEl){
    if(!total){
      monthlyEl.innerHTML='<div style="color:var(--tm);font-size:11.5px;line-height:1.9">출고/해체 일정 데이터 없음</div>';
    }else{
      const monthMap={};
      focusRows.forEach(({row})=>{
        const chulgoKey=getSemixKeyByLabel(/출고|출하|shipping/i,0,'chulgo');
        const haejeKey=getSemixKeyByLabel(/해체|분해|disassembly/i,1,'haeje');
        const ship=row[chulgoKey], done=row[haejeKey];
        [[ship,'ship'],[done,'done']].forEach(([d,type])=>{
          const dt=parseDashDate(d); if(!dt) return;
          if(dt < rangeStart || dt > rangeEnd) return;
          const m=d.slice(0,7);
          if(!monthMap[m]) monthMap[m]={shipActual:0,shipPlan:0,doneActual:0,donePlan:0,open:0};
          if(type==='ship'){ if(dt<=today) monthMap[m].shipActual++; else monthMap[m].shipPlan++; if(!done) monthMap[m].open++; }
          if(type==='done'){ if(dt<=today) monthMap[m].doneActual++; else monthMap[m].donePlan++; }
        });
      });
      const months=Object.keys(monthMap).sort();
      const maxVal=Math.max(1,...months.map(m=>monthMap[m].shipActual+monthMap[m].shipPlan+monthMap[m].doneActual+monthMap[m].donePlan));
      monthlyEl.innerHTML=months.length?(
        '<div style="font-size:10.5px;color:var(--tm);margin-bottom:2px">'+rangeLabel+' 범위 · 출고/해체는 실적과 예정 분리 · 해체 미완료 출고건 표시</div>'+
        months.map(m=>{
          const v=monthMap[m], sum=v.shipActual+v.shipPlan+v.doneActual+v.donePlan, pct=Math.max(8,Math.round(sum/maxVal*100));
          return '<div><div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:2px"><b style="color:var(--cy)">'+m+'</b><span style="color:var(--ts)">출고 실적 '+v.shipActual+' · 출고 예정 '+v.shipPlan+' · 해체 완료 '+(v.doneActual+v.donePlan)+' · 해체대기 '+v.open+'</span></div><div class="progress-bar" style="height:4px"><div class="progress-fill" style="width:'+pct+'%;background:var(--cy)"></div></div></div>';
        }).join('')
      ):'<div style="color:var(--tm);font-size:11.5px;line-height:1.9">'+rangeLabel+' 범위의 출고/해체 일정이 없습니다.</div>';
    }
  }

  const qEl=document.getElementById('dash-quality-rate');
  if(qEl){
    const validationWarnings=focusRows.filter(x=>x.warn).length;
    const noWorkRows=allRows.filter(r=>!collectDashboardWorkRanges(r).length).length;
    qEl.innerHTML=
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">'+
        '<div style="background:var(--rdd);border:1px solid rgba(248,81,73,.22);border-radius:7px;padding:7px"><div style="font-size:10px;color:var(--ts)">기간 내 검증 경고</div><b style="font-size:18px;color:var(--rd)">'+validationWarnings+'</b></div>'+
        '<div style="background:rgba(72,79,88,.18);border:1px solid var(--bd);border-radius:7px;padding:7px"><div style="font-size:10px;color:var(--ts)">작업일 미입력 원장</div><b style="font-size:18px;color:var(--tm)">'+noWorkRows+'</b></div>'+
      '</div>'+
      '<div style="font-size:11px;color:var(--ts);line-height:1.8">대시보드 산정 기준: <b style="color:var(--ac)">전장/기구/배선 시작일 ~ 적층 종료일</b><br><small style="color:var(--tm)">품질/불량률은 불량 관리 센터·품질 분석 센터 데이터 연동 후 별도 계산합니다.</small></div>';
  }

  const quickEl=document.getElementById('dash-my-changes');
  if(quickEl) quickEl.innerHTML='';

  const el = document.getElementById('dash-progress');
  if(!el) return;
  if(!total){
    el.innerHTML='<div style="color:var(--tm);font-size:11.5px;padding:8px 0;line-height:1.9">생산일정 데이터가 없습니다.<br><small style="color:var(--tm)">생산일정 관리 → 엑셀 업로드 후 저장하면 반영됩니다.</small></div>';
    return;
  }
  const managedRows=focusRows.filter(x=>x.info.status!=='완료');
  if(!managedRows.length){
    el.innerHTML='<div style="color:var(--tm);font-size:11.5px;padding:8px 0;line-height:1.9">'+rangeLabel+' 범위의 현재 생산/계획/출고대기 항목이 없습니다.<br><small style="color:var(--tm)">해체 완료 과거 이력은 생산일정 관리 또는 보관 화면에서 확인합니다.</small></div>';
    return;
  }
  const rowsForList=managedRows.slice(0,12);
  el.innerHTML=
    '<div style="overflow-x:auto"><table style="font-size:10.5px;min-width:760px"><thead><tr><th>차수</th><th>모델</th><th>호기</th><th>공정 단계</th><th>현재 단계</th><th>출고 예정일</th><th>D-day</th><th>입력 상태</th></tr></thead><tbody>'+
    rowsForList.map(({row:r,info,warn,shipDate,timing})=>{
      const st=info.status, stColor=getStageColor(st);
      const inputState=warn?'<span class="b-rd b" style="font-size:8px">검증필요</span>':(collectDashboardDates(r).length?'<span class="b-gr b" style="font-size:8px">입력완료</span>':'<span class="b-ts b" style="font-size:8px">미입력</span>');
      return '<tr onclick="openDrawer(\''+escHtml(r.id||'')+'\')" style="cursor:pointer"><td>'+escHtml(r.batch||'')+'차</td><td>'+escHtml(r.model||'')+'</td><td><b style="color:var(--ac)">'+escHtml(r.machine||'?')+'호기</b></td><td>'+renderDashboardStageDots(r)+'</td><td><span style="color:'+stColor+';font-weight:700">'+escHtml(info.label)+'</span></td><td>'+escHtml(shipDate?fmtDate(shipDate):'—')+'</td><td>'+escHtml(timing||'—')+'</td><td>'+inputState+'</td></tr>';
    }).join('')+
    '</tbody></table></div>'+
    (managedRows.length>rowsForList.length?'<div style="font-size:10.5px;color:var(--tm);padding-top:6px">기간 내 추가 '+(managedRows.length-rowsForList.length)+'건은 생산일정 관리에서 확인</div>':'');
}

function renderDashboardStageDots(row){
  const schema=getDashboardSchema();
  const works=(schema.works||[]).filter(w=>(DASHBOARD_RULE_CONFIG.productionStageKeys||['jungjiang','test','jeokjeung']).includes(w.key)).slice(0,3);
  const chulgoKey=getSemixKeyByLabel(/출고|출하|shipping/i,0,'chulgo');
  const parts=[];
  works.forEach(w=>{
    const s=row[w.key+'Start'], e=row[w.key+'End'];
    const short=(w.label||w.key||'?').replace(/시작|종료|완료/g,'').trim().slice(0,1) || '?';
    const state=e?'done':(s?'active':'wait');
    const mark=e?'✓':short;
    parts.push('<span title="'+escHtml(w.label||w.key)+'" style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;font-size:9px;font-weight:700;margin-right:2px;background:'+(state==='done'?'var(--grd)':state==='active'?'var(--acd)':'var(--sf3)')+';color:'+(state==='done'?'var(--gr)':state==='active'?'var(--ac)':'var(--tm)')+';border:1px solid var(--bd)">'+escHtml(mark)+'</span>');
  });
  const shipped=!!row[chulgoKey];
  parts.push('<span title="출고" style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;font-size:9px;font-weight:700;margin-right:2px;background:'+(shipped?'var(--cyd)':'var(--sf3)')+';color:'+(shipped?'var(--cy)':'var(--tm)')+';border:1px solid var(--bd)">출</span>');
  return parts.join('');
}

function dashboardToday(){
  const d=new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDashboardDays(d,n){const x=new Date(d.getTime());x.setDate(x.getDate()+n);return x;}
function parseDashDate(v){
  if(!v || !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return null;
  const [y,m,d]=String(v).split('-').map(Number);
  return new Date(y,m-1,d);
}
function fmtDashDate(d){return String(d.getFullYear())+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0');}
function dayDiff(a,b){return Math.round((a.getTime()-b.getTime())/86400000);}
function getDashboardSchema(){return (typeof ACTIVE_SCHEMA !== 'undefined' && ACTIVE_SCHEMA) ? ACTIVE_SCHEMA : {materials:[],works:[],semix:[]};}
function getSemixKeyByLabel(re,fallbackIndex,fallbackKey){
  const semix=getDashboardSchema().semix||[];
  return (semix.find(s=>re.test((s.label||'')+(s.key||'')))||semix[fallbackIndex]||{}).key||fallbackKey;
}
function getShipmentDates(row){
  const haejeKey=getSemixKeyByLabel(/해체|분해|disassembly/i,1,'haeje');
  const chulgoKey=getSemixKeyByLabel(/출고|출하|shipping/i,0,'chulgo');
  return [row[chulgoKey], row[haejeKey]].filter(Boolean);
}
function getPrimaryDashboardDate(row){
  const info=getRowStageInfo(row);
  const ship=getShipmentDates(row).filter(Boolean);
  return info.date || ship[1] || ship[0] || '';
}
function collectDashboardDates(row){
  const dates=[];
  const schema=getDashboardSchema();
  (schema.materials||[]).forEach(m=>{ if(row[m.key]) dates.push(row[m.key]); });
  (schema.works||[]).forEach(w=>{ if(row[w.key+'Start']) dates.push(row[w.key+'Start']); if(row[w.key+'End']) dates.push(row[w.key+'End']); });
  (schema.semix||[]).forEach(s=>{ if(row[s.key]) dates.push(row[s.key]); });
  const info=getRowStageInfo(row); if(info.date) dates.push(info.date);
  return [...new Set(dates)].filter(Boolean);
}
function getDashboardWorkByHints(hints){
  const hs=(hints||[]).map(h=>String(h).toLowerCase());
  const works=(getDashboardSchema().works||[]);
  return works.find(w=>{
    const hay=[w.key,w.label,w.short,...(w.aliases||[])].join(' ').toLowerCase();
    return hs.some(h=>hay.includes(h));
  })||null;
}
function getDashboardRowDateByHints(row,hints,suffix){
  const hs=(hints||[]).map(h=>String(h).toLowerCase());
  const direct=Object.keys(row||{}).find(k=>{
    const kl=String(k).toLowerCase();
    if(suffix && !kl.endsWith(String(suffix).toLowerCase())) return false;
    return hs.some(h=>kl.includes(h));
  });
  return direct ? row[direct] : '';
}
function collectDashboardWorkRanges(row){
  // v0.46 확정: 생산기간은 전장/기구/배선 시작일 ~ 적층 종료일 단일 구간이다.
  // 기존 v0.35는 고정 key(jungjiangStart/jeokjeungEnd)에만 의존해,
  // 동적 스키마/분리 헤더/한글 key 상황에서 생산기간이 누락될 수 있었다.
  const cfg=DASHBOARD_RULE_CONFIG||{};
  const startWork=getDashboardWorkByHints(['jungjiang','전장/기구/배선','전장기구배선','전장 기구 배선','생산']);
  const endWork=getDashboardWorkByHints(['jeokjeung','적층','stacking']);
  const startKey=(startWork ? startWork.key+'Start' : (cfg.productionPeriodStartKey||'jungjiangStart'));
  const endKey=(endWork ? endWork.key+'End' : (cfg.productionPeriodEndKey||'jeokjeungEnd'));

  let sRaw=row[startKey] || row[cfg.productionPeriodStartKey||''] || getDashboardRowDateByHints(row,['jungjiang','전장','기구','배선','생산'],'Start') || '';
  let eRaw=row[endKey] || row[cfg.productionPeriodEndKey||''] || getDashboardRowDateByHints(row,['jeokjeung','적층','stacking'],'End') || '';

  let a=parseDashDate(sRaw);
  let b=parseDashDate(eRaw);

  // 보조값: 전장 시작/적층 종료 중 하나가 누락되면 중간 공정 날짜로 보완한다.
  // 단, 기준 문구와 최종 판정 명칭은 계속 전장 시작~적층 종료로 유지한다.
  const schema=getDashboardSchema();
  const stageHints=['jungjiang','전장','기구','배선','test','테스트','세팅','jeokjeung','적층'];
  const stageWorks=(schema.works||[]).filter(w=>{
    const hay=[w.key,w.label,w.short,...(w.aliases||[])].join(' ').toLowerCase();
    return stageHints.some(h=>hay.includes(h));
  });
  const stageDates=[];
  stageWorks.forEach(w=>{
    if(row[w.key+'Start']) stageDates.push({raw:row[w.key+'Start'],date:parseDashDate(row[w.key+'Start'])});
    if(row[w.key+'End']) stageDates.push({raw:row[w.key+'End'],date:parseDashDate(row[w.key+'End'])});
  });
  const validStageDates=stageDates.filter(x=>x.date).sort((x,y)=>x.date-y.date);
  if(!a && validStageDates.length){ a=validStageDates[0].date; if(!sRaw) sRaw=validStageDates[0].raw; }
  if(!b && validStageDates.length){ b=validStageDates[validStageDates.length-1].date; if(!eRaw) eRaw=validStageDates[validStageDates.length-1].raw; }
  if(a && !b){ const today=dashboardToday(); b=today>a?today:a; }
  if(!a && b) a=b;
  if(!a || !b) return [];
  const start=a<=b?a:b, end=a<=b?b:a;
  return [{
    key:'production_period',
    label:'생산기간',
    start,
    end,
    startRaw:sRaw,
    endRaw:eRaw,
    basisStartKey:startKey,
    basisEndKey:endKey,
    basisStartLabel:cfg.productionPeriodStartLabel||'전장/기구/배선 시작일',
    basisEndLabel:cfg.productionPeriodEndLabel||'적층 종료일'
  }];
}
function dashDateInRange(ds,start,end){const d=parseDashDate(ds);return !!(d&&d>=start&&d<=end);}
function dashRangeOverlap(a,b,start,end){return !!(a&&b&&a<=end&&b>=start);}
function hasDashboardMaterialBeforeOrIn(row,end){
  const schema=getDashboardSchema();
  return (schema.materials||[]).some(m=>{const d=parseDashDate(row[m.key]);return d&&d<=end;});
}
function getDashboardPeriodInfo(row,start,end,today){
  const chulgoKey=getSemixKeyByLabel(/출고|출하|shipping/i,0,'chulgo');
  const haejeKey=getSemixKeyByLabel(/해체|분해|disassembly/i,1,'haeje');
  const chulgo=row[chulgoKey], haeje=row[haejeKey];
  const chulgoDt=parseDashDate(chulgo), haejeDt=parseDashDate(haeje);
  const workRanges=collectDashboardWorkRanges(row);
  const period=workRanges[0]||null;

  // v0.46: 미래 출고/미래 해체 예정일을 완료/출고 완료로 오판하지 않는다.
  // 완료는 해체일이 오늘 이전/오늘일 때만, 출고 후 해체대기는 출고일이 오늘 이전/오늘이고 해체가 아직 아닐 때만.
  if(haejeDt && haejeDt<=today && haejeDt>=start && haejeDt<=end){
    return {status:'완료',label:'해체 완료',field:haejeKey,date:haeje,progress:100,include:true,shipDate:chulgo||haeje,period};
  }
  if(chulgoDt && chulgoDt<=today && !(haejeDt&&haejeDt<=today)){
    return {status:'출고',label:'출고 후 해체대기',field:chulgoKey,date:chulgo,progress:88,include:true,shipDate:chulgo,period};
  }
  if(period && dashRangeOverlap(period.start,period.end,start,end)){
    const nowInside=(period.start<=today && period.end>=today);
    const future=period.start>today;
    const label=nowInside?'생산 진행중':(future?'생산 예정':'생산기간 포함');
    return {status:'진행',label,field:period.key,date:period.startRaw,progress:60,include:true,shipDate:chulgo||'',period};
  }
  // 생산기간이 기준 범위 밖이어도, 생산 착수 전 자재 입고가 되어 있으면 계획/대기 현황에 잡는다.
  if(hasDashboardMaterialBeforeOrIn(row,end)){
    const futurePeriod=period && period.start>end;
    return {status:'대기',label:futurePeriod?'생산 착수 대기':'입고 후 작업대기',field:'',date:'',progress:25,include:true,shipDate:chulgo||'',period};
  }
  const dates=collectDashboardDates(row).map(parseDashDate).filter(Boolean);
  const anyIn=dates.some(d=>d>=start&&d<=end);
  if(anyIn) return {status:'계획',label:'일정 계획',field:'',date:'',progress:5,include:true,shipDate:chulgo||'',period};
  return {status:'계획',label:'범위 밖',field:'',date:'',progress:0,include:false,shipDate:chulgo||'',period};
}
function buildDashboardFocusRows(rows,start,end,today){
  const statusPriority={'진행':0,'출고':1,'대기':2,'계획':3,'완료':9};
  const items=[];
  rows.forEach(row=>{
    const info=getDashboardPeriodInfo(row,start,end,today);
    if(!info.include) return;
    const chulgoKey=getSemixKeyByLabel(/출고|출하|shipping/i,0,'chulgo');
    const shipDate=info.shipDate || row[chulgoKey] || '';
    const shipDt=parseDashDate(shipDate);
    const workRanges=collectDashboardWorkRanges(row);
    const mainDate=shipDate || (workRanges[0] ? workRanges[0].startRaw : getPrimaryDashboardDate(row));
    const md=parseDashDate(mainDate);
    const distance=md?Math.abs(dayDiff(md,today)):9999;
    const timing=shipDt?formatTiming(shipDt,today):(md?formatTiming(md,today):'');
    const warn=hasScheduleDelay(row);
    items.push({row,info,mainDate,shipDate,timing,warn,distance});
  });
  return items.sort((a,b)=>{
    if(a.warn!==b.warn) return a.warn?-1:1;
    const pa=statusPriority[a.info.status]??9, pb=statusPriority[b.info.status]??9;
    if(pa!==pb) return pa-pb;
    if(a.distance!==b.distance) return a.distance-b.distance;
    return String(a.row.machine||'').localeCompare(String(b.row.machine||''),'ko',{numeric:true});
  });
}
function formatTiming(d,today){
  const n=dayDiff(d,today);
  if(n===0) return '오늘';
  if(n>0) return 'D-'+n;
  return 'D+'+Math.abs(n);
}
function safeLsArray(key){ return []; } // v0.46: schedule localStorage fallback disabled

document.addEventListener('DOMContentLoaded',()=>{
  const t=localStorage.getItem('odi_theme'); if(t) document.body.dataset.theme=t;
  applyMenuConfigToSidebar();
  if(typeof odiEnsureSidebarAllGroupsOpen==='function') odiEnsureSidebarAllGroupsOpen();
  renderDashboardKPI();
  document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});
  });
});

// ══════════════════════════════════════════
//  생산일정 모듈 — 원본 ODI_생산일정_캘린더.html 이식
//  SCHEDULE_CALENDAR_PORTING_STEP_01
// ══════════════════════════════════════════
let scheduleState = null;  // 초기화 후 전역 접근용

function scheduleInit(){
  if(scheduleState && scheduleState._initialized){
    if(typeof initSchedule==='function') initSchedule();
    renderDashboardKPI();
    _updateSchedStatusPanel();
    return;
  }
  console.log('[schedule] scheduleInit 호출 — v0.46 auto-restore disabled');

  // v0.46 HARD GATE:
  // 페이지 로드/메뉴 진입 시 localStorage 복원 금지.
  // 사용자가 현재 세션에서 엑셀 업로드 후 저장하기 전까지 원천 데이터는 빈 배열이어야 한다.
  clearScheduleDataReady();
  if(typeof YANGSAN_DATA !== 'undefined') YANGSAN_DATA=[];
  if(typeof YEONJU_DATA  !== 'undefined') YEONJU_DATA=[];
  if(typeof WORK_DATA    !== 'undefined') WORK_DATA=[];
  if(typeof PENDING_YANGSAN !== 'undefined') PENDING_YANGSAN=null;
  if(typeof PENDING_YEONJU  !== 'undefined') PENDING_YEONJU=null;

  if(typeof initSchedule === 'function') {
    initSchedule();
    scheduleState = {_initialized: true};
  } else {
    console.warn('[schedule] initSchedule 함수 없음');
  }

  renderDashboardKPI();
  _updateSchedStatusPanel();
  Object.assign(_schedTestLog,{
    localStorageYSCount:0, localStorageYRCount:0, savedYSCount:0, savedYRCount:0, savedWDCount:0,
    restoredYSCount:0, restoredYRCount:0, restoredOk:false, kpiMatch:false, verdict:'미수행'
  });
  _refreshTestLogPanel();
}

// ── 스키마 ────────────────────────────────────────────────────────
const BASE_SCHEMA={
  meta:[
    {key:'batch',label:'차수',type:'text',group:'base',aliases:['차수','batch']},
    {key:'model',label:'모델',type:'text',group:'base',aliases:['모델','모델명','장비명','model']},
    {key:'machine',label:'호기',type:'text',group:'base',aliases:['호기','machine']}
  ],
  materials:[
    {key:'jaje',label:'부자재 입고',short:'부자재',type:'single',group:'mat',color:'#F0C84A',aliases:['부자재','부자재 입고','부 자재','부자재입고']},
    {key:'ybase',label:'YBASE',short:'YBASE',type:'single',group:'mat',color:'#E87878',aliases:['ybase','y base','xybase','x y base','y_base','y-base','와이베이스']},
    {key:'pod3',label:'3POD',short:'3POD',type:'single',group:'mat',color:'#6BCB8B',aliases:['3pod','3 pod','3_pod','3-pod','쓰리팟']},
    {key:'wvpz',label:'WV/PZ',short:'WV/PZ',type:'single',group:'mat',color:'#6BA8E8',aliases:['wv/pz','wvpz','wv pz','wv-pz']},
    {key:'elmo',label:'엘모',short:'엘모',type:'single',group:'mat',color:'#F4A0A0',aliases:['엘모','elmo','el-mo']}
  ],
  works:[
    {key:'jungjiang',label:'전장/기구/배선',short:'생산',type:'period',group:'work',color:'#6BA8E8',
     aliases:['전장/기구/배선','전장기구배선','생산','전장 기구 배선'],
     startAliases:['전장/기구/배선 시작','전장/기구/배선시작','생산 시작','생산시작','전장기구배선시작'],
     endAliases:['전장/기구/배선 종료','전장/기구/배선종료','생산 종료','생산종료','전장기구배선종료'],
     order:100,splitAliases:['전장','기구','배선']},
    {key:'test',label:'TEST',short:'TEST',type:'period',group:'work',color:'#F0C84A',
     aliases:['test','테스트','테 스 트','세팅','setting'],
     startAliases:['test 시작','test시작','테스트 시작','테스트시작','세팅 시작','세팅시작','setting 시작'],
     endAliases:['test 종료','test종료','테스트 종료','테스트종료','세팅 종료','세팅종료','setting 종료'],order:200},
    {key:'jeokjeung',label:'적층',short:'적층',type:'period',group:'work',color:'#E87878',
     aliases:['적층','stacking'],
     startAliases:['적층 시작','적층시작'],endAliases:['적층 종료','적층종료'],order:300}
  ],
  semix:[
    {key:'chulgo',label:'출고',short:'출고',type:'single',group:'semix',color:'#6BCB8B',aliases:['출고','출하','shipping'],order:1000},
    {key:'haeje',label:'해체',short:'해체',type:'single',group:'semix',color:'#F4A0A0',aliases:['해체','분해','disassembly'],order:1100}
  ],
  note:{key:'note',label:'비고',type:'text',aliases:['비고','기타','note','memo','참고','remark','remarks']}
};
let ACTIVE_SCHEMA=JSON.parse(JSON.stringify(BASE_SCHEMA));
let _lastParseInfo={newMats:[],newWorks:[],splitResolved:false,splitDesc:''};
const _AUTO_COLORS=['#6BCB8B','#6BA8E8','#F0C84A','#E87878','#F4A0A0','#80D8A0','#7EC8F0','#F0D070','#eab308','#3b82f6','#8b5cf6','#14b8a6','#f59e0b','#ec4899','#db2777','#2563eb','#16a34a','#0f766e'];
let _autoColorIdx=5;
function nextAutoColor(){return _AUTO_COLORS[_autoColorIdx++%_AUTO_COLORS.length];}

// ── 스키마 파생 헬퍼 ──────────────────────────────────────────────
function schemaMatFields(){return ACTIVE_SCHEMA.materials.map(m=>m.key);}
function schemaWorkFields(){const f=[];ACTIVE_SCHEMA.works.forEach(w=>{f.push(w.key+'Start');f.push(w.key+'End');});return f;}
function schemaSemixFields(){return ACTIVE_SCHEMA.semix.map(s=>s.key);}
function schemaAllDateFields(){return[...schemaMatFields(),...schemaWorkFields(),...schemaSemixFields()];}
function schemaCalFields(){return[...schemaMatFields(),...ACTIVE_SCHEMA.works.map(w=>w.key+'Start'),...schemaSemixFields()];}
function schemaGanttItems(){
  const items=[];
  ACTIVE_SCHEMA.materials.forEach(m=>{items.push({field:m.key,label:m.label,short:m.short,group:'mat',color:m.color,type:'single'});});
  ACTIVE_SCHEMA.works.forEach(w=>{items.push({field:w.key+'Start',endField:w.key+'End',label:w.short,short:w.short,group:'work',color:w.color,type:'period'});});
  ACTIVE_SCHEMA.semix.forEach(s=>{items.push({field:s.key,label:s.label,short:s.short,group:'semix',color:s.color,type:'single'});});
  return items;
}
function schemaConnPairs(){
  const pairs=[];const w=ACTIVE_SCHEMA.works;const s=ACTIVE_SCHEMA.semix;
  for(let i=0;i<w.length-1;i++)pairs.push({fromItem:w[i].key+'Start',fromField:w[i].key+'End',to:w[i+1].key+'Start'});
  if(w.length>0&&s.length>0)pairs.push({fromItem:w[w.length-1].key+'Start',fromField:w[w.length-1].key+'End',to:s[0].key});
  if(s.length>=2)pairs.push({fromItem:s[0].key,fromField:s[0].key,to:s[1].key});
  return pairs;
}
function schemaFMeta(){
  const m={};
  schemaGanttItems().forEach(it=>{
    m[it.field]={group:it.group,label:it.label,short:it.short,color:it.color,type:it.type,endField:it.endField||null};
    if(it.endField)m[it.endField]={group:it.group,label:it.label+' 종료',short:it.short+'종',color:it.color,type:'single',endField:null};
  });
  return m;
}
function buildMgmtThead(){
  const mats=ACTIVE_SCHEMA.materials,works=ACTIVE_SCHEMA.works,semix=ACTIVE_SCHEMA.semix;
  let r1=`<th class="th-base sc-th-r1" rowspan="3">진행상황</th><th class="th-base sc-th-r1" rowspan="3">차수</th><th class="th-base sc-th-r1" rowspan="3">모델</th><th class="th-base sc-th-r1" rowspan="3">호기</th>`;
  if(mats.length)r1+=`<th class="th-mat sc-th-r1" colspan="${mats.length}">자 재 입 고</th>`;
  if(works.length)r1+=`<th class="th-work sc-th-r1" colspan="${works.length*2}">작 업</th>`;
  if(semix.length)r1+=`<th class="th-semix sc-th-r1" colspan="${semix.length}">세 믹 스</th>`;
  let r2='';
  mats.forEach(m=>{r2+=`<th class="th-mat-s sc-th-r2" rowspan="2">${m.short}</th>`;});
  works.forEach(w=>{r2+=`<th class="th-work-s sc-th-r2" colspan="2">${w.label}</th>`;});
  semix.forEach(s=>{r2+=`<th class="th-semix-s sc-th-r2" rowspan="2">${s.short}</th>`;});
  let r3='';works.forEach(()=>{r3+=`<th class="th-work-ss sc-th-r3">시작</th><th class="th-work-ss sc-th-r3">종료</th>`;});
  return`<tr>${r1}</tr><tr>${r2}</tr><tr>${r3}</tr>`;
}
function rebuildMgmtTables(){
  const inner=buildMgmtThead();
  ['yangsanThead','yeonjuThead'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=inner;});
}
function rebuildFieldFilt(){
  const valid=new Set(schemaCalFields());
  Object.keys(fieldFilt).forEach(k=>{if(!valid.has(k))delete fieldFilt[k];});
  valid.forEach(f=>{if(!(f in fieldFilt))fieldFilt[f]=true;});
}

// ── 기본 데이터 ───────────────────────────────────────────────────
const EMPTY_YANGSAN_DATA=[];  // v0.46: 파일 내부 샘플/테스트 데이터 없음. 업로드 후 저장한 현재 세션 메모리만 인정

// ── 상태 변수 ─────────────────────────────────────────────────────
let YANGSAN_DATA=JSON.parse(JSON.stringify(EMPTY_YANGSAN_DATA));
let YEONJU_DATA=[];
let PENDING_YANGSAN=null,PENDING_YEONJU=null;
let WORK_DATA=[];
let NID=200;
// curPage / curView : STEP 3의 _schedPage/_schedView 와 동기화
// (schedSwitchTab/schedSwitchView에서 동시에 업데이트)
let curPage='manage',curView='calendar'; // ← 탭 상태값: manage/view 로 통일 (data 키워드 혼용 금지)
// v0.55_FIXED: strict mode에서 _schedPage/_schedView/_schedInited 미선언 ReferenceError 때문에
// 일정 보기 탭이 열리지 않던 문제를 차단한다. initSchedule/schedSwitchTab/schedSwitchView가 모두 이 값을 사용한다.
let _schedPage='manage', _schedView='calendar', _schedInited=false;
let curNavYear=2026,curNavMonth=4;
const fieldFilt={};
let expandedDates=new Set();
let YANGSAN_IDS=new Set(),YEONJU_IDS=new Set();
let gvEquipFilt='',gvBatchFilt='',gvMachineFilt='',gvTypeFilt='',gvModelFilt='';
let selMode=false,summaryMode=false;
const msSel={equip:new Set(),type:new Set(),model:new Set(),batch:new Set(),machine:new Set()};
let gBatchFilt='',gTypeFilt='',gMachineFilt='',gModelFilt='',gItemFilt='';
let activeBatch=null,cachedRange=null;
let ganttShowDay=false,ganttShowDow=false; // v0.59_FIXED: 월/주는 기본, 일/요일은 선택 표시
let batchSortCol='batch',batchSortDir='asc',batchModelFilt='';
let dpCtx=null,dpY=2026,dpM=3,dpSel=null;
let hoverCell=null,dragId=null,dragFld=null;
let errPanelOpen=true;
const H={'2025-01-01':'신정','2025-01-29':'설날','2025-03-01':'삼일절','2025-05-05':'어린이날','2025-05-15':'부처님오신날','2025-06-06':'현충일','2025-08-15':'광복절','2025-10-06':'추석','2025-10-09':'한글날','2025-12-25':'성탄절','2026-01-01':'신정','2026-02-17':'설날','2026-03-01':'삼일절','2026-03-02':'대체공휴일','2026-05-05':'어린이날','2026-05-24':'부처님오신날','2026-06-06':'현충일','2026-08-15':'광복절','2026-09-25':'추석','2026-10-03':'개천절','2026-10-09':'한글날','2026-12-25':'성탄절'};
const DAY_PX=26;
const SCHED_DAY_PX=24; // v0.62(FIXED 기반): 간트 좌우 이동이 실제로 생기도록 1일 폭 확대
const GANTT_WINDOW_MONTHS=6; // v0.67(FIXED 기반): 선택 월 기준 좌우 6개월 페이퍼 로딩
function schedDateToX(ds,startDate){if(!ds||!startDate)return -1;return Math.floor((new Date(ds)-startDate)/86400000)*SCHED_DAY_PX;}
let lastSavedYangsan=null,lastSavedYeonju=null;
let undoStack=[],redoStack=[],isDirty=false;

// ── UI 헬퍼 ───────────────────────────────────────────────────────
let _schedErrT=null;
function showErr(m){
  const el=document.getElementById('sched-err-text');
  const banner=document.getElementById('sched-err-banner');
  if(el)el.textContent='⚠ '+m;
  if(banner)banner.classList.add('show');
  if(_schedErrT)clearTimeout(_schedErrT);
  _schedErrT=setTimeout(()=>{if(banner)banner.classList.remove('show');},7000);
}
function schedCloseErr(){const b=document.getElementById('sched-err-banner');if(b)b.classList.remove('show');}
let _schedToastT=null;
function showToast(m,t='ok'){
  const el=document.getElementById('sched-toast');if(!el)return;
  el.textContent=(t==='ok'?'✓ ':'ℹ ')+m;
  el.className='show'+(t==='ok'?' ok':'');
  if(_schedToastT)clearTimeout(_schedToastT);
  _schedToastT=setTimeout(()=>{el.className='';},2800);
}
function mbadge(m){if(!m)return'';const u=m.toUpperCase();if(u.includes('HBM'))return`<span class="badge b-hbm">${m}</span>`;if(u.includes('OPERA'))return`<span class="badge b-opera">${m}</span>`;return`<span class="badge b-md">${m}</span>`;}
function machineLbl(m){return/^\d+$/.test(m)?m+'호기':m;}
function fmtDate(d){if(!d)return'';const p=d.split('-');return p.length===3?p[1]+'.'+p[2]:d;}
function addDays(ds,days){const dt=new Date(ds);dt.setDate(dt.getDate()+days);return dt.toISOString().slice(0,10);}
function diffDays(a,b){return Math.round((new Date(a)-new Date(b))/86400000);}
function lightenColor(h){try{const r=Math.min(255,parseInt(h.slice(1,3),16)+40),g=Math.min(255,parseInt(h.slice(3,5),16)+40),b=Math.min(255,parseInt(h.slice(5,7),16)+40);return`rgb(${r},${g},${b})`;}catch{return h;}}

// ── 검증 ──────────────────────────────────────────────────────────
function validateRow(row){
  const mats=ACTIVE_SCHEMA.materials,works=ACTIVE_SCHEMA.works,semix=ACTIVE_SCHEMA.semix;
  const f2=d=>d?d.slice(5).replace('-','.'):'';const e=[];
  const matDates=mats.map(m=>row[m.key]).filter(Boolean);
  if(matDates.length&&works.length>0){const fws=row[works[0].key+'Start'];if(fws){const mx=matDates.reduce((a,b)=>a>b?a:b);if(mx>fws)e.push(`자재입고(${f2(mx)}) > ${works[0].label}시작(${f2(fws)}) — 자재입고 더 늦음`);}}
  works.forEach(w=>{const s=row[w.key+'Start'],en=row[w.key+'End'];if(s&&en&&s>en)e.push(`${w.label}시작(${f2(s)}) > ${w.label}종료(${f2(en)})`);});
  for(let i=0;i<works.length-1;i++){const pe=row[works[i].key+'End'],ns=row[works[i+1].key+'Start'];if(pe&&ns&&pe>ns)e.push(`${works[i].label}종료(${f2(pe)}) > ${works[i+1].label}시작(${f2(ns)})`); }
  if(works.length>0&&semix.length>0){const le=row[works[works.length-1].key+'End'],fs=row[semix[0].key];if(le&&fs&&le>=fs)e.push(`${works[works.length-1].label}종료(${f2(le)}) ≥ ${semix[0].label}(${f2(fs)})`); }
  if(semix.length>=2){const s1=row[semix[0].key],s2=row[semix[1].key];if(s1&&s2&&s1>=s2)e.push(`${semix[0].label}(${f2(s1)}) ≥ ${semix[1].label}(${f2(s2)})`); }
  return e;
}
function getErrorFields(row){
  const mats=ACTIVE_SCHEMA.materials,works=ACTIVE_SCHEMA.works,semix=ACTIVE_SCHEMA.semix;
  const fs=new Set();
  const matDates=mats.map(m=>row[m.key]).filter(Boolean);
  if(matDates.length&&works.length>0){const fws=row[works[0].key+'Start'];if(fws){const mx=matDates.reduce((a,b)=>a>b?a:b);if(mx>fws){mats.forEach(m=>{if(row[m.key]&&row[m.key]>fws)fs.add(m.key);});fs.add(works[0].key+'Start');}}}
  works.forEach(w=>{const s=row[w.key+'Start'],en=row[w.key+'End'];if(s&&en&&s>en){fs.add(w.key+'Start');fs.add(w.key+'End');}});
  for(let i=0;i<works.length-1;i++){const pe=row[works[i].key+'End'],ns=row[works[i+1].key+'Start'];if(pe&&ns&&pe>ns){fs.add(works[i].key+'End');fs.add(works[i+1].key+'Start');}}
  if(works.length>0&&semix.length>0){const le=row[works[works.length-1].key+'End'],fsk=row[semix[0].key];if(le&&fsk&&le>=fsk){fs.add(works[works.length-1].key+'End');fs.add(semix[0].key);}}
  if(semix.length>=2){const s1=row[semix[0].key],s2=row[semix[1].key];if(s1&&s2&&s1>=s2){fs.add(semix[0].key);fs.add(semix[1].key);}}
  return fs;
}
function calcRowStatus(row){
  // v0.26 확정 기준:
  // 계획 = 부자재 입고 전 / 대기 = 부자재 입고 후 / 진행 = 작업 시작 후 / 출고 = 출고 완료 / 완료 = 해체 완료
  if(typeof getRowStageInfo === 'function') return getRowStageInfo(row).status;
  if(row.haeje) return '완료';
  if(row.chulgo) return '출고';
  if(row.jungjiangStart || row.testStart || row.jeokjeungStart) return '진행';
  if(row.jaje || row.ybase || row.pod3 || row.wvpz || row.elmo) return '대기';
  return '계획';
}

// ── 편집 상태 시스템 ───────────────────────────────────────────────
function checkDirty(){if(!lastSavedYangsan||!lastSavedYeonju)return false;return JSON.stringify(YANGSAN_DATA)!==JSON.stringify(lastSavedYangsan)||JSON.stringify(YEONJU_DATA)!==JSON.stringify(lastSavedYeonju);}
// ── 간트 드래그 스크롤 + 년/월 실시간 동기화 [4-6] ────────────────
(function initGanttScrollUX() {
  function setup() {
    var outer = document.getElementById('ganttOuter');
    if (!outer) return;
    if (outer._dragInit) return;
    outer._dragInit = true;
    outer.style.cursor = 'grab'; // drag scroll 커서

    // ── drag scroll ──────────────────────────────────
    var isDrag = false, startX = 0, startSL = 0;
    outer.addEventListener('mousedown', function(e) {
      // 바 자체 드래그(일정 이동) 및 우클릭 무시
      if (e.button !== 0) return;
      if (e.target.closest('[draggable="true"]') ||
          e.target.closest('.sched-gb-plan') ||
          e.target.closest('.sched-gb-dot') ||
          e.target.closest('.cal-ev-span')) return;
      isDrag = true;
      startX = e.clientX;
      startSL = outer.scrollLeft;
      outer.classList.add('dragging');
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDrag) return;
      outer.scrollLeft = startSL - (e.clientX - startX);
    });
    function endDrag() { isDrag = false; outer.classList.remove('dragging'); }
    document.addEventListener('mouseup', endDrag);
    outer.addEventListener('mouseleave', endDrag);

    // ── 스크롤 시 년/월 실시간 동기화 ────────────────
    var _syncT = null;
    outer.addEventListener('scroll', function() {
      if (_syncT) clearTimeout(_syncT);
      _syncT = setTimeout(function() {
        var range = cachedRange || getActiveGanttRange();
        if (!range) return;
        var STICKY_W = 294;
        var centerX = outer.scrollLeft + (outer.clientWidth - STICKY_W) / 2;
        var dayOff = Math.floor(centerX / SCHED_DAY_PX);
        var d = new Date(range.start);
        d.setDate(d.getDate() + Math.max(0, dayOff));
        var y = d.getFullYear(), m = d.getMonth() + 1;
        var yl = document.getElementById('gnav-year-lbl');
        var ms = document.getElementById('gnav-month-sel');
        if (yl && parseInt(yl.textContent) !== y) { yl.textContent = y; curNavYear = y; }
        if (ms && parseInt(ms.value) !== m) { ms.value = m; curNavMonth = m; }
      }, 60);
    });
  }
  // renderGantt 완료 후 초기화 (requestAnimationFrame 이후)
  var _orig = window.renderGantt;
  if (_orig) {
    window.renderGantt = function() {
      _orig.apply(this, arguments);
      requestAnimationFrame(setup);
    };
  }
  // initSchedule 이후에도 한 번 더 시도
  setTimeout(setup, 1200);
})();

function setupGanttPanScroll(){
  const outer=document.getElementById('ganttOuter');
  if(!outer || outer._panScrollV79)return;
  outer._panScrollV79=true;
  let panning=false,startX=0,startLeft=0,edgeLock=false;
  const isInteractive=t=>!!(t&&t.closest&&t.closest('button,input,select,textarea,.sched-hdr-dropdown,.cal-mv-btn,.dp-day'));
  const maxScroll=()=>Math.max(0,outer.scrollWidth-outer.clientWidth);
  function shiftViewportByPan(dir,e){
    if(edgeLock)return;
    edgeLock=true;
    navMonth(dir * (typeof GANTT_WINDOW_MONTHS==='number'?GANTT_WINDOW_MONTHS:6));
    startX=e.clientX;
    startLeft=(document.getElementById('ganttOuter')||{scrollLeft:0}).scrollLeft;
    requestAnimationFrame(()=>{
      const o=document.getElementById('ganttOuter');
      if(o){
        startLeft=o.scrollLeft;
        startX=e&&typeof e.clientX==='number'?e.clientX:startX;
      }
      setTimeout(()=>{edgeLock=false;},140);
    });
  }
  outer.addEventListener('pointerdown',function(e){
    if(e.button!==0 || isInteractive(e.target))return;
    if(outer.scrollWidth<=outer.clientWidth)return;
    panning=true;startX=e.clientX;startLeft=outer.scrollLeft;
    outer.classList.add('panning','dragging');
    try{outer.setPointerCapture(e.pointerId);}catch(_e){}
    e.preventDefault();
  },true);
  outer.addEventListener('pointermove',function(e){
    if(!panning)return;
    const max=maxScroll();
    const desired=startLeft-(e.clientX-startX);
    if(desired>max+50 || (outer.scrollLeft>=max-2 && e.clientX<startX-55)){shiftViewportByPan(1,e);e.preventDefault();return;}
    if(desired<-50 || (outer.scrollLeft<=2 && e.clientX>startX+55)){shiftViewportByPan(-1,e);e.preventDefault();return;}
    outer.scrollLeft=Math.max(0,Math.min(max,desired));
    e.preventDefault();
  },true);
  const end=function(e){
    if(!panning)return;
    panning=false;outer.classList.remove('panning','dragging');
    try{outer.releasePointerCapture(e.pointerId);}catch(_e){}
  };
  outer.addEventListener('pointerup',end,true);
  outer.addEventListener('pointercancel',end,true);
  outer.addEventListener('lostpointercapture',function(){panning=false;outer.classList.remove('panning','dragging');},true);
}

// ── 섹션 접기/펼치기 [9] ────────────────────────────────────────
function toggleMgrSection(wrapId, btnId) {
  var wrap = document.getElementById(wrapId);
  var btn  = document.getElementById(btnId);
  if (!wrap) return;
  var collapsed = wrap.classList.toggle('collapsed');
  if (btn) btn.textContent = collapsed ? '펼치기' : '접기';
}

function updateEditState(){
  isDirty=checkDirty();
  const noUndo=undoStack.length===0,noRedo=redoStack.length===0;
  // 일정보기 탭 편집 컨트롤
  const ub=document.getElementById('sched-undo-btn');
  const rdb=document.getElementById('sched-redo-btn');
  const rb=document.getElementById('sched-restore-btn');
  const sb=document.getElementById('sched-view-save-btn');
  if(ub)ub.disabled=noUndo;if(rdb)rdb.disabled=noRedo;
  if(rb)rb.disabled=!isDirty;if(sb)sb.disabled=!isDirty;
  // 데이터관리 탭 편집 컨트롤 (동일 상태 동기화)
  const ubm=document.getElementById('sched-undo-btn-mgr');
  const rdbm=document.getElementById('sched-redo-btn-mgr');
  const rbm=document.getElementById('sched-restore-btn-mgr');
  const sbm=document.getElementById('sched-save-btn-mgr');
  if(ubm)ubm.disabled=noUndo;if(rdbm)rdbm.disabled=noRedo;
  if(rbm)rbm.disabled=!isDirty;if(sbm)sbm.disabled=!isDirty;
  // dirty 인디케이터
  const di=document.getElementById('sched-dirty-indicator');
  if(di){
    if(isDirty)di.textContent='● 미저장 변경 있음';
    else if(lastSavedYangsan)di.textContent='✓ 저장됨';
    else di.textContent='';
  }
}
function syncWorkData(){
  WORK_DATA=[...YANGSAN_DATA,...YEONJU_DATA];
  YANGSAN_IDS=new Set(YANGSAN_DATA.map(r=>r.id));
  YEONJU_IDS=new Set(YEONJU_DATA.map(r=>r.id));
  if(typeof syncScheduleToDashboardState==="function")syncScheduleToDashboardState();
  setTimeout(function(){
    if(typeof renderDashboardSummaryNotes==='function') renderDashboardSummaryNotes();
  }, 150);
}
function findRow(id){
  // v0.58_FIXED: drag/drop dataTransfer는 id를 문자열로 돌려준다.
  // 기존 strict 비교(x.id===id) 때문에 드롭 후 행을 못 찾아 날짜가 안 움직이던 문제를 차단한다.
  const sid=String(id);
  const byId=x=>String(x.id)===sid;
  if(PENDING_YANGSAN){const r=PENDING_YANGSAN.find(byId);if(r)return r;}
  if(PENDING_YEONJU){const r=PENDING_YEONJU.find(byId);if(r)return r;}
  const r1=YANGSAN_DATA.find(byId);if(r1)return r1;
  const r2=YEONJU_DATA.find(byId);if(r2)return r2;return null;
}
function commitSavedSnapshot(){lastSavedYangsan=JSON.parse(JSON.stringify(YANGSAN_DATA));lastSavedYeonju=JSON.parse(JSON.stringify(YEONJU_DATA));undoStack=[];redoStack=[];isDirty=false;updateEditState();}
function applyDateChanges(changes){
  const affected=new Map();
  for(const c of changes){const row=findRow(c.rowId);if(!row)continue;if(!affected.has(c.rowId))affected.set(c.rowId,{row,fieldsBefore:{}});affected.get(c.rowId).fieldsBefore[c.field]=row[c.field];}
  for(const c of changes){const row=findRow(c.rowId);if(row)row[c.field]=c.newVal;}
  let failMsgs=[];
  for(const[,{row,fieldsBefore}] of affected){
    const savedVals={};for(const[f,v] of Object.entries(fieldsBefore)){savedVals[f]=row[f];row[f]=v;}
    const eb=new Set(validateRow(row));for(const[f,v] of Object.entries(savedVals))row[f]=v;
    const ea=validateRow(row);const newE=ea.filter(e=>!eb.has(e));if(newE.length)failMsgs.push(...newE);
  }
  if(failMsgs.length){for(const[,{row,fieldsBefore}] of affected)for(const[f,v] of Object.entries(fieldsBefore))row[f]=v;showErr('검증 실패: '+[...new Set(failMsgs)].join(' / '));return false;}
  const undoEntry=[];
  for(const[rowId,{fieldsBefore}] of affected)for(const[field,oldVal] of Object.entries(fieldsBefore))undoEntry.push({rowId,field,newVal:changes.find(c=>c.rowId===rowId&&c.field===field)?.newVal||'',oldVal});
  undoStack.push(undoEntry);redoStack=[];isDirty=true;updateEditState();return true;
}
// ── handleCalDrop: 드래그앤드롭 날짜 이동 (v0.50 구현) ─────────────────
function handleCalDrop(ds, e){
  e.preventDefault();
  let rowId=dragId, field=dragFld, anchorDate=null, endField=null, endDate=null;
  if(e.dataTransfer){
    try{
      const raw=e.dataTransfer.getData('text/plain');
      if(raw){
        const pts=raw.split('|');
        rowId=pts[0]||rowId;
        field=pts[1]||field;
        anchorDate=pts[2]||null;
        endField=pts[3]||null;
        endDate=pts[4]||null;
      }
    }catch(_e){}
  }
  if(!rowId||!field)return;
  const row=findRow(rowId);if(!row)return;
  const FMETA=schemaFMeta();
  const meta=FMETA[field]||{};
  const changes=[];
  const isPeriodMove=!!(meta.type==='period'&&meta.endField&&endField&&endDate);
  if(isPeriodMove){
    const msPerDay=86400000;
    const deltaBase=anchorDate||row[field]||ds;
    const delta=Math.round((new Date(ds)-new Date(deltaBase))/msPerDay);
    if(delta===0){dragId=null;dragFld=null;return;}
    const shiftDate=d=>{if(!d)return '';const nd=new Date(d);nd.setDate(nd.getDate()+delta);return nd.toISOString().slice(0,10);};
    const startField=field;
    const finishField=meta.endField;
    changes.push({rowId,field:startField,newVal:shiftDate(row[startField])});
    changes.push({rowId,field:finishField,newVal:shiftDate(row[finishField]||endDate)});
  }else{
    const oldVal=row[field]||'';
    if(oldVal===ds){dragId=null;dragFld=null;return;}
    changes.push({rowId,field,newVal:ds});
  }
  dragId=null;dragFld=null;
  if(changes.length){
    const ok=applyDateChanges(changes);
    if(ok){
      syncWorkData();
      populateEditFilters();
      renderEditTable(); // v0.62(FIXED 기반): 캘린더 날짜 이동 즉시 데이터 관리 테이블에도 반영
      populateGvFilters();
      renderCalendar();
      if(curView==='gantt')renderGantt();
      if(curView==='batch')renderBatchView(batchModelFilt);
      updateCards();updateEditState();
      showToast('날짜 이동 완료');
    }
  }
}

function openDP(rowId, field, ev){
  if(ev){ev.preventDefault();ev.stopPropagation();}
  const row=findRow(rowId);
  if(!row){showErr('행을 찾을 수 없습니다.');return;}
  dpOpen(rowId, field, row[field]||'', {sourceEvent:ev});
}

// ── dpOpen: 날짜 선택 팝업 열기 (v0.50 구현) ───────────────────────────
function dpOpen(rowId, field, curDate, opts){
  const pop=document.getElementById('dpPop');if(!pop)return;
  const today=new Date();
  const d=curDate?new Date(curDate):today;
  opts=opts||{};
  dpCtx={rowId,field,anchorDate:curDate||'',endField:opts.endField||'',endDate:opts.endDate||'',periodStartField:opts.periodStartField||field,periodStartDate:opts.periodStartDate||'',isPeriod:!!opts.endField};
  dpSel=curDate||null;
  dpY=d.getFullYear();dpM=d.getMonth();
  renderDPPop();
  pop.style.display='block';
  pop.classList.add('open');

  // 호출 이벤트의 currentTarget/target을 기준으로 위치를 잡고, 화면 밖이면 위/안쪽으로 보정한다.
  const ev=opts.sourceEvent||null;
  const srcTarget=(ev&&((ev.currentTarget&&ev.currentTarget.getBoundingClientRect)?ev.currentTarget:ev.target))||null;
  const src=srcTarget&&srcTarget.getBoundingClientRect?srcTarget.getBoundingClientRect():null;
  const pw=pop.offsetWidth||254;
  const ph=Math.min(pop.offsetHeight||260, window.innerHeight-24);
  let left=12, top=64;
  if(src){
    left=src.left;
    top=src.bottom+6;
    if(top+ph>window.innerHeight-12) top=Math.max(12, src.top-ph-6);
    if(left+pw>window.innerWidth-12) left=Math.max(12, window.innerWidth-pw-12);
    if(left<12) left=12;
  }else{
    left=Math.max(12,(window.innerWidth-pw)/2);
    top=Math.max(64,(window.innerHeight-ph)/2);
  }
  pop.style.left=Math.round(left)+'px';
  pop.style.top=Math.round(top)+'px';
}

function editUndo(){if(!undoStack.length)return;const entry=undoStack.pop();const reEntry=[];for(const{rowId,field,oldVal,newVal} of entry){const row=findRow(rowId);if(!row)continue;reEntry.push({rowId,field,newVal:row[field],oldVal:newVal});row[field]=oldVal;}redoStack.push(reEntry);isDirty=checkDirty();updateEditState();syncWorkData();renderEditTable();if(curPage==='view'){populateGvFilters();renderCurrentView();}showToast('Undo 완료');}
function editRedo(){if(!redoStack.length)return;const entry=redoStack.pop();const reEntry=[];for(const{rowId,field,newVal} of entry){const row=findRow(rowId);if(!row)continue;reEntry.push({rowId,field,newVal:row[field],oldVal:newVal});row[field]=newVal;}undoStack.push(reEntry);isDirty=checkDirty();updateEditState();syncWorkData();renderEditTable();if(curPage==='view'){populateGvFilters();renderCurrentView();}showToast('Redo 완료');}
function editRefresh(){if(!isDirty){showToast('변경 사항 없음');return;}if(!confirm('마지막 저장 상태로 복원하시겠습니까?'))return;YANGSAN_DATA=JSON.parse(JSON.stringify(lastSavedYangsan));YEONJU_DATA=JSON.parse(JSON.stringify(lastSavedYeonju));undoStack=[];redoStack=[];isDirty=false;updateEditState();syncWorkData();populateEditFilters();renderEditTable();populateGvFilters();if(curPage==='view')renderCurrentView();const ct=document.getElementById('sched-card-time');if(ct)ct.textContent='복원 완료 '+new Date().toLocaleTimeString('ko-KR');showToast('마지막 저장 상태로 복원');}
function editSave(){
  if(!isDirty){showToast('변경 사항 없음');return;}
  // 스냅샷 + 스택 초기화
  lastSavedYangsan=JSON.parse(JSON.stringify(YANGSAN_DATA));
  lastSavedYeonju =JSON.parse(JSON.stringify(YEONJU_DATA));
  undoStack=[];redoStack=[];isDirty=false;
  updateEditState();
  syncWorkData();
  // 세션 메모리 저장 완료 플래그 갱신 (localStorage 저장 금지)
  _persistSchedule('editSave');
  // UI 갱신
  populateGvFilters();
  if(typeof renderCurrentView==='function') renderCurrentView();
  renderDashboardKPI();
  _updateSchedStatusPanel();
  const ct=document.getElementById('sched-card-time');
  if(ct) ct.textContent='저장 완료 '+new Date().toLocaleTimeString('ko-KR');
  showToast('저장 완료');
  showSaveBar('저장 완료 (편집)');
}

// ── 데이터 관리 테이블 ────────────────────────────────────────────
function mgrExcept(rows,prefix,exclude){
  const st=document.getElementById(prefix+'fi-status')?.value||'',mo=document.getElementById(prefix+'fi-model')?.value||'',ba=document.getElementById(prefix+'fi-batch')?.value||'',mc=document.getElementById(prefix+'fi-machine')?.value||'';
  return rows.filter(r=>{if(exclude!=='status'&&st&&calcRowStatus(r)!==st)return false;if(exclude!=='model'&&mo&&r.model!==mo)return false;if(exclude!=='batch'&&ba&&r.batch!==ba)return false;if(exclude!=='machine'&&mc&&r.machine!==mc)return false;return true;});
}
function mgrCrossFilter(prefix,allRows){
  const STATUS_ORDER=['계획','대기','진행','출고','완료'];
  const fillSel=(id,opts,ordered)=>{const el=document.getElementById(id);if(!el)return;const cur=el.value;const list=ordered?STATUS_ORDER.filter(v=>opts.includes(v)):opts;el.innerHTML='<option value="">전체</option>'+list.map(o=>`<option value="${o}">${o}</option>`).join('');el.value=list.includes(cur)?cur:'';};
  fillSel(prefix+'fi-status',[...new Set(mgrExcept(allRows,prefix,'status').map(r=>calcRowStatus(r)))],true);
  fillSel(prefix+'fi-model',[...new Set(mgrExcept(allRows,prefix,'model').map(r=>r.model).filter(Boolean))].sort(),false);
  fillSel(prefix+'fi-batch',[...new Set(mgrExcept(allRows,prefix,'batch').map(r=>r.batch).filter(Boolean))].sort((a,b)=>Number(a)-Number(b)),false);
  fillSel(prefix+'fi-machine',[...new Set(mgrExcept(allRows,prefix,'machine').map(r=>r.machine).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko')),false);
}
function onMgrFilter(prefix){const{yangsan,yeonju}=getDisplayData();if(prefix==='y')mgrCrossFilter('y-',yangsan);else mgrCrossFilter('r-',yeonju);renderEditTable();}
function populateEditFilters(){
  // v0.46: 필터는 확정 데이터(저장 후) 기준으로만 채운다.
  // v0.46: pending 상태에서는 빈 필터를 유지하여 확정 전 데이터가 필터에 섞이는 것을 방지.
  if(hasScheduleDataReady()){
    mgrCrossFilter('y-', YANGSAN_DATA);
    mgrCrossFilter('r-', YEONJU_DATA);
  } else {
    mgrCrossFilter('y-', []);
    mgrCrossFilter('r-', []);
  }
}
function getDisplayData(){return{yangsan:PENDING_YANGSAN!==null?PENDING_YANGSAN:YANGSAN_DATA,yeonju:PENDING_YEONJU!==null?PENDING_YEONJU:YEONJU_DATA,isPending:PENDING_YANGSAN!==null||PENDING_YEONJU!==null};}
function renderEditTable(){
  const yB=document.getElementById('y-fi-batch')?.value||'',yM=document.getElementById('y-fi-model')?.value||'',yMc=document.getElementById('y-fi-machine')?.value||'',ySt=document.getElementById('y-fi-status')?.value||'';
  const rB=document.getElementById('r-fi-batch')?.value||'',rM=document.getElementById('r-fi-model')?.value||'',rMc=document.getElementById('r-fi-machine')?.value||'',rSt=document.getElementById('r-fi-status')?.value||'';
  const{yangsan,yeonju,isPending}=getDisplayData();
  const filtY=yangsan.filter(row=>{if(yB&&row.batch!==yB)return false;if(yM&&row.model!==yM)return false;if(yMc&&row.machine!==yMc)return false;if(ySt&&calcRowStatus(row)!==ySt)return false;return true;});
  const filtR=yeonju.filter(row=>{if(rB&&row.batch!==rB)return false;if(rM&&row.model!==rM)return false;if(rMc&&row.machine!==rMc)return false;if(rSt&&calcRowStatus(row)!==rSt)return false;return true;});
  renderSectionBody('yangsanBody',filtY,isPending,'yangsanWrap');
  renderSectionBody('yeonjuBody',filtR,isPending,'yeonjuWrap');
  const cy=document.getElementById('sec-count-y'),cr=document.getElementById('sec-count-r');
  if(cy)cy.textContent=filtY.length+'행';if(cr)cr.textContent=filtR.length+'행';
  updateCards();refreshErrPanel();
}
function renderSectionBody(bodyId,rows,isPending,wrapId){
  const tbody=document.getElementById(bodyId),wrap=document.getElementById(wrapId);
  if(!tbody)return;tbody.innerHTML='';if(wrap)wrap.classList.toggle('pending-overlay',isPending);
  const totalCols=4+ACTIVE_SCHEMA.materials.length+ACTIVE_SCHEMA.works.length*2+ACTIVE_SCHEMA.semix.length;
  if(!rows.length){
    const tr=document.createElement('tr');
    const msg = !hasScheduleDataReady()
      ? '업로드 후 저장하면 데이터가 표시됩니다.'
      : isPending ? '업로드 후 저장 버튼을 눌러 확정하세요.'
      : '저장된 데이터가 없습니다.';
    tr.innerHTML=`<td colspan="${totalCols}" style="padding:28px;text-align:center;color:var(--tm);font-size:12px;line-height:1.8">`+
      `<div style="font-size:22px;margin-bottom:6px">📭</div>${msg}</td>`;
    tbody.appendChild(tr);return;}
  rows.forEach((row,i)=>{
    const errs=validateRow(row),errFields=getErrorFields(row),status=calcRowStatus(row);
    const tr=document.createElement('tr');if(i%2)tr.classList.add('alt');if(errs.length)tr.classList.add('row-err');if(isPending)tr.classList.add('pending-row');tr.style.cursor='pointer';tr.title='클릭하여 상세 보기';tr.addEventListener('click',function(e){if(!e.target.closest('.dbt')&&!e.target.closest('button'))openModal(row.id);});
    const dBtn=(f,cls)=>{const v=row[f]||'',hasCellErr=errFields.has(f),cellCls=hasCellErr?'cell-err':'',btnCls=v?cls:'empty';return`<td class="${cellCls}" title="${hasCellErr?errs.join('; '):''}"><span class="dbt ${btnCls}" onclick="openDP(${row.id},'${f}',event)" onmouseenter="hoverCell={rowId:${row.id},field:'${f}'}" onmouseleave="hoverCell=null">${v?fmtDate(v):'—'}</span></td>`;};
    let html=`<td><span class="st-${status}">${status}</span></td><td class="td-meta" style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ac)">${row.batch||'—'}</td><td class="td-meta">${row.model?mbadge(row.model):'—'}</td><td class="td-machine">${machineLbl(row.machine||'—')}</td>`;
    ACTIVE_SCHEMA.materials.forEach(m=>html+=dBtn(m.key,'mat'));
    ACTIVE_SCHEMA.works.forEach(w=>{html+=dBtn(w.key+'Start','work');html+=dBtn(w.key+'End','work-end');});
    ACTIVE_SCHEMA.semix.forEach(s=>html+=dBtn(s.key,'semix'));
    tr.innerHTML=html;tbody.appendChild(tr);
  });
}
function updateCards(){
  // v0.46: 저장 전/후 데이터 소스 분리
  // - pending 상태면 pending 기준으로 미리보기 카드만 갱신 (v0.46)
  // - 저장 후(hasScheduleDataReady)면 확정 데이터 기준 (v0.46)
  const ready = hasScheduleDataReady();
  const isPending = PENDING_YANGSAN !== null || PENDING_YEONJU !== null;
  const {yangsan, yeonju} = getDisplayData();
  const errY=yangsan.filter(r=>validateRow(r).length>0).length;
  const errR=yeonju.filter(r=>validateRow(r).length>0).length;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('card-total-y', yangsan.length);
  set('card-total-r', yeonju.length);
  set('card-err-y', errY);
  set('card-err-r', errR);
  set('card-ok-y', yangsan.length - errY);
  set('card-ok-r', yeonju.length - errR);
  // 저장 상태 배지
  const badge = document.getElementById('data-save-status');
  if(badge){
    if(isPending){
      badge.textContent='저장 전 (pending)';
      badge.className='badge-pill b-am';
    } else if(ready){
      badge.textContent='저장 완료 — 양산 '+YANGSAN_DATA.length+'행 / 연구 '+YEONJU_DATA.length+'행';
      badge.className='badge-pill b-gr';
    } else {
      badge.textContent='데이터 없음';
      badge.className='badge-pill b-dt';
    }
  }
}
function updNote(id,v){const r=findRow(id);if(r)r.note=v;}
function toggleErrPanel(){errPanelOpen=!errPanelOpen;const b=document.getElementById('errPanelBody'),a=document.getElementById('errPanelArrow');if(b)b.style.display=errPanelOpen?'block':'none';if(a)a.textContent=errPanelOpen?'▼':'▶';}
function buildDetailedErrors(row,rowIdx,section){
  const f2=d=>d?d.slice(5).replace('-','.'):'—';const FMETA=schemaFMeta();const getLbl=f=>FMETA[f]?FMETA[f].short||FMETA[f].label||f:f;
  const loc=`${section} ${rowIdx}행 ${row.batch||'?'}차 ${row.model||'?'} ${machineLbl(row.machine||'?')}`;const msgs=[];
  const mats=ACTIVE_SCHEMA.materials,works=ACTIVE_SCHEMA.works,semix=ACTIVE_SCHEMA.semix;
  const matDates=mats.map(m=>row[m.key]).filter(Boolean);
  if(matDates.length&&works.length>0){const fws=row[works[0].key+'Start'];if(fws){const mx=matDates.reduce((a,b)=>a>b?a:b);if(mx>fws){const mxField=mats.slice().reverse().find(m=>row[m.key]===mx)||mats[0];msgs.push(`${loc} ${getLbl(mxField.key)} ${f2(mx)} — 자재입고가 ${works[0].label} 시작보다 늦음`);}}}
  works.forEach(w=>{const s=row[w.key+'Start'],en=row[w.key+'End'];if(s&&en&&s>en)msgs.push(`${loc} ${w.label}시작 ${f2(s)} — ${w.label} 시작이 종료보다 늦음`);});
  for(let i=0;i<works.length-1;i++){const pe=row[works[i].key+'End'],ns=row[works[i+1].key+'Start'];if(pe&&ns&&pe>ns)msgs.push(`${loc} ${works[i].label}종료 ${f2(pe)} — ${works[i].label} 종료가 ${works[i+1].label} 시작보다 늦음`);}
  if(works.length>0&&semix.length>0){const le=row[works[works.length-1].key+'End'],fs=row[semix[0].key];if(le&&fs&&le>=fs)msgs.push(`${loc} ${works[works.length-1].label}종료 ${f2(le)} — 마지막 작업 종료가 ${semix[0].label} 이후임`);}
  if(semix.length>=2){const s1=row[semix[0].key],s2=row[semix[1].key];if(s1&&s2&&s1>=s2)msgs.push(`${loc} ${semix[0].label} ${f2(s1)} — ${semix[0].label}이 ${semix[1].label} 이후임`);}
  if(!row.machine)msgs.push(`${loc} 호기 — 호기 누락`);
  return msgs;
}
function refreshErrPanel(){
  const{yangsan,yeonju}=getDisplayData();const allMsgs=[];
  yangsan.forEach((row,i)=>buildDetailedErrors(row,i+1,'양산').forEach(m=>allMsgs.push(m)));
  yeonju.forEach((row,i)=>buildDetailedErrors(row,i+1,'연구').forEach(m=>allMsgs.push(m)));
  const panel=document.getElementById('rawErrPanel'),title=document.getElementById('errPanelTitle'),body=document.getElementById('errPanelBody');
  if(!panel)return;
  if(!allMsgs.length){panel.style.display='none';return;}
  panel.style.display='block';
  if(title)title.textContent=`⚠ 검증 오류 (${allMsgs.length}건)`;
  if(body)body.innerHTML=allMsgs.map(m=>`<div class="err-item">${m}</div>`).join('');
}

// ── 저장 / 취소 / 복원 ──────────────────────────────────────────

// ── v0.24 업로드 검수 로그 ─────────────────────────────────────────────
const _schedTestLog = {
  // ── v0.24: 실제 업로드 흐름에서만 채워지는 중립 초기값 ──
  version: 'v0.48',
  fileName: '',
  sheetNames: [],
  autoRecognition: '미수행',
  ysSheet: '',
  yrSheet: '',
  headerRows: null,
  dataStartRow: null,
  rawYCount: 0,
  rawRCount: 0,
  errCount: 0,
  newMats: [],
  newWorks: [],
  pendingOk: false,
  uploadErrors: [],
  savedYSCount: 0,
  savedYRCount: 0,
  savedWDCount: 0,
  localStorageYSCount: 0,
  localStorageYRCount: 0,
  kpiYangsan: 0,
  kpiYeonju: 0,
  kpiDelay: 0,
  kpiDone: 0,
  kpiMatch: false,
  restoredYSCount: 0,
  restoredYRCount: 0,
  restoredOk: false,
  consoleErrors: [],
  verdict: '미수행'
};

// ── 세션 메모리 저장 공통 함수 (v0.46) ────────────────────────────
function _persistSchedule(caller){
  const savedAt = new Date().toISOString();
  SCHEDULE_LAST_SAVED_AT = savedAt;
  markScheduleDataReady();
  console.log('[schedule] session commit (' + caller + '): 양산', YANGSAN_DATA.length, '연구', YEONJU_DATA.length);
}

// ── 저장 상태 패널 업데이트 (v0.24) ─────────────────────────────────
function _updateSchedStatusPanel(){
  const hasPend = (typeof PENDING_YANGSAN!=='undefined'&&PENDING_YANGSAN!==null)
               || (typeof PENDING_YEONJU !=='undefined'&&PENDING_YEONJU !==null);
  const ready = hasScheduleDataReady();
  const ysLen = (ready && typeof YANGSAN_DATA!=='undefined') ? YANGSAN_DATA.length : 0;
  const yrLen = (ready && typeof YEONJU_DATA !=='undefined') ? YEONJU_DATA.length  : 0;
  const savedAt = ready ? SCHEDULE_LAST_SAVED_AT : '';
  const statusText  = hasPend ? '업로드 대기' : (ready ? '저장됨' : '미저장');
  const statusColor = hasPend ? 'var(--am)'   : (ready ? 'var(--gr)' : 'var(--tm)');
  const setEl = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  setEl('sp-status',   statusText);
  setEl('sp-ls-ys',    ysLen);
  setEl('sp-ls-yr',    yrLen);
  setEl('sp-mem-ys',   ysLen);
  setEl('sp-mem-yr',   yrLen);
  setEl('sp-saved-at', savedAt ? '세션 확정: '+savedAt.substring(0,19).replace('T',' ') : '세션 확정 없음');
  const statusEl = document.getElementById('sp-status');
  if(statusEl) statusEl.style.color = statusColor;
  if(hasPend) setEl('sp-saved-at', `업로드 대기: ${typeof PENDING_YANGSAN!=='undefined'&&PENDING_YANGSAN?PENDING_YANGSAN.length:0}행`);
}

function _safeScheduleStep(label, fn){
  try{ return fn ? fn() : undefined; }
  catch(err){
    console.error('[schedule/save] '+label+' 실패', err);
    if(typeof _schedTestLog !== 'undefined'){
      _schedTestLog.consoleErrors = _schedTestLog.consoleErrors || [];
      _schedTestLog.consoleErrors.push(label+': '+(err && err.message ? err.message : err));
    }
    return undefined;
  }
}

function _commitPendingScheduleData(){
  const hasPendingY = (typeof PENDING_YANGSAN !== 'undefined' && PENDING_YANGSAN !== null);
  const hasPendingR = (typeof PENDING_YEONJU  !== 'undefined' && PENDING_YEONJU  !== null);
  if(!hasPendingY && !hasPendingR) return false;

  const nextY = hasPendingY ? PENDING_YANGSAN : (Array.isArray(YANGSAN_DATA) ? YANGSAN_DATA : []);
  const nextR = hasPendingR ? PENDING_YEONJU  : (Array.isArray(YEONJU_DATA)  ? YEONJU_DATA  : []);

  // pending 배열을 먼저 확정 데이터로 깊은 복사한 뒤 pending을 비운다.
  // schedDiscardPending()을 먼저 호출하면 저장 전 pending 참조가 끊겨 저장 실패처럼 보일 수 있으므로 금지.
  YANGSAN_DATA = JSON.parse(JSON.stringify(nextY || []));
  YEONJU_DATA  = JSON.parse(JSON.stringify(nextR || []));
  PENDING_YANGSAN = null;
  PENDING_YEONJU  = null;
  markScheduleDataReady();
  SCHEDULE_LAST_SAVED_AT = new Date().toISOString();
  return true;
}

function schedSaveData(){
  const committed = _commitPendingScheduleData();
  if(!committed){ showErr('저장할 데이터가 없습니다'); return; }

  // pending UI 정리
  const pb=document.getElementById('pendingBar'); if(pb) pb.style.display='none';
  const ep=document.getElementById('rawErrPanel'); if(ep) ep.style.display='none';

  // 핵심 데이터 동기화는 실패하면 안 되므로 개별 보호한다.
  _safeScheduleStep('syncWorkData', ()=>syncWorkData());
  _safeScheduleStep('commitSavedSnapshot', ()=>commitSavedSnapshot());
  _safeScheduleStep('populateEditFilters', ()=>populateEditFilters());
  _safeScheduleStep('renderEditTable', ()=>renderEditTable());
  _safeScheduleStep('populateGvFilters', ()=>populateGvFilters());
  _safeScheduleStep('renderCurrentView', ()=>{ if(typeof renderCurrentView==='function') renderCurrentView(); });
  _safeScheduleStep('renderDashboardKPI', ()=>renderDashboardKPI());
  _safeScheduleStep('_updateSchedStatusPanel', ()=>_updateSchedStatusPanel());

  const ct=document.getElementById('sched-card-time');
  if(ct) ct.textContent='저장 완료 '+new Date().toLocaleTimeString('ko-KR');
  _safeScheduleStep('_updateSchedActionBar', ()=>_updateSchedActionBar());
  showToast('저장 완료 — 양산 '+YANGSAN_DATA.length+'행 / 연구 '+YEONJU_DATA.length+'행','ok');
  showSaveBar('저장 완료 — 양산 '+YANGSAN_DATA.length+'행 / 연구 '+YEONJU_DATA.length+'행');

  // 검수 로그 갱신 — localStorage 검수 폐기, 현재 세션 확정 데이터 기준
  const allRowsForKpi = [...YANGSAN_DATA, ...YEONJU_DATA];
  _schedTestLog.savedYSCount = YANGSAN_DATA.length;
  _schedTestLog.savedYRCount = YEONJU_DATA.length;
  _schedTestLog.savedWDCount = allRowsForKpi.length;
  _schedTestLog.localStorageYSCount = 0;
  _schedTestLog.localStorageYRCount = 0;
  _schedTestLog.kpiYangsan = Number(document.getElementById('kpi-yangsan')?.textContent || 0);
  _schedTestLog.kpiYeonju  = Number(document.getElementById('kpi-yeonju')?.textContent || 0);
  _schedTestLog.kpiDelay   = Number(document.getElementById('kpi-delay-val')?.textContent || 0);
  _schedTestLog.kpiDone    = Number(document.getElementById('kpi-done-val')?.textContent || 0);
  _schedTestLog.restoredYSCount = 0;
  _schedTestLog.restoredYRCount = 0;
  _schedTestLog.restoredOk = false;
  _schedTestLog.kpiMatch = hasScheduleDataReady() && allRowsForKpi.length > 0 && WORK_DATA.length === allRowsForKpi.length;
  _schedTestLog.verdict = _schedTestLog.kpiMatch ? '부분통과' : '저장됨/화면검수필요';
  console.log('[v0.48 save]', JSON.stringify({ys:YANGSAN_DATA.length, yr:YEONJU_DATA.length, work:WORK_DATA.length, ready:hasScheduleDataReady(), verdict:_schedTestLog.verdict}));
  _refreshTestLogPanel();
  if(window.__TSL_uploadScheduleAfterNativeSave) window.__TSL_uploadScheduleAfterNativeSave();
}

function schedDiscardPending(notify=true){
  PENDING_YANGSAN=null;PENDING_YEONJU=null;
  const pb=document.getElementById('pendingBar');if(pb)pb.style.display='none';
  const ep=document.getElementById('rawErrPanel');if(ep)ep.style.display='none';
  _updateSchedActionBar();
  if(notify){renderEditTable();showToast('업로드 취소됨 — 기존 데이터 유지','ok');}
}
function _updateSchedActionBar(){
  const hasPending=PENDING_YANGSAN!==null||PENDING_YEONJU!==null;
  const sv=document.getElementById('sched-save-btn'),sd=document.getElementById('sched-discard-btn');
  if(sv)sv.disabled=!hasPending;if(sd)sd.disabled=!hasPending;
}

// ── 업로드 파서 ───────────────────────────────────────────────────
function parseXlDate(v){
  if(!v && v !== 0) return '';
  // 숫자 serial (엑셀 날짜 40000~60000 범위)
  if(typeof v === 'number' || (typeof v === 'string' && /^[0-9]+(\.[0-9]+)?$/.test(v.trim()))){
    const n = Number(v);
    if(n > 40000 && n < 70000){
      const epoch = new Date(Date.UTC(1899, 11, 30));
      epoch.setUTCDate(epoch.getUTCDate() + Math.floor(n));
      return epoch.toISOString().slice(0,10);
    }
  }
  // ISO 날짜 문자열
  const s = String(v).trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Date 생성자로 파싱
  const d = new Date(s);
  if(!isNaN(d.getTime())) return d.toISOString().slice(0,10);
  return '';
}
function nrmStr(s){return String(s||'').replace(/[\s\u00a0\t\r\n]+/g,' ').replace(/[_\-·]/g,'').trim().toLowerCase();}
function normalizeKey(label){return label.replace(/[^a-zA-Z0-9가-힣]/g,'').toLowerCase().slice(0,20)||('k'+Date.now());}
function makeMergeResolver(ws,merges){
  return function getCellVal(r,c){
    let tr=r,tc=c;
    for(const m of merges){if(r>=m.s.r&&r<=m.e.r&&c>=m.s.c&&c<=m.e.c){tr=m.s.r;tc=m.s.c;break;}}
    const addr=XLSX.utils.encode_cell({r:tr,c:tc});const cell=ws[addr];if(!cell)return'';
    if(cell.t==='d'&&cell.v instanceof Date)return cell.v.toISOString().slice(0,10);
    return String(cell.w!==undefined?cell.w:cell.v!==undefined?cell.v:'').trim();
  };
}
const _GRP_SET=new Set(['자재입고','자재','입고','작업','공정','세믹스','기타','비고','구분','정보','합계','소계','생산공정','제조공정','base','material','work','semix','note','etc','summary','assembly','process']);
function isGroupLabelTok(normTok){if(!normTok||normTok.length<=1)return true;if(_GRP_SET.has(normTok))return true;const col=normTok.replace(/ /g,'');return _GRP_SET.has(col);}
function isNoteField(normTok){return['비고','기타','note','memo','참고','remark','remarks','비 고','기 타'].includes(normTok);}
function semixFieldHint(normTok){return['출고','해체','출하','shipping','disassembly'].some(k=>normTok===k||normTok.includes(k));}
function groupToType(tok){const g=nrmStr(tok);if(!g)return null;if(g.includes('자재')||g.includes('입고')||g.includes('material'))return'mat';if(g.includes('작업')||g.includes('work')||g.includes('공정'))return'work';if(g.includes('세믹스')||g.includes('semix'))return'semix';if(g.includes('기타')||g.includes('비고')||g.includes('note'))return'note';if(g.includes('구분')||g.includes('정보')||g.includes('base'))return'base';return null;}
function buildAliasMap(){
  const map={};const nrm=nrmStr;
  const add=(aliases,type,key)=>aliases.forEach(a=>{const k=nrm(a);if(k)map[k]={type,key};});
  ACTIVE_SCHEMA.meta.forEach(m=>add(m.aliases||[m.label],`meta_${m.key}`,m.key));
  ACTIVE_SCHEMA.materials.forEach(m=>add(m.aliases||[m.label,m.short||m.label],'mat',m.key));
  ACTIVE_SCHEMA.works.forEach(w=>{
    add(w.aliases||[w.label],'work_label',w.key);
    add(w.startAliases||[(w.aliases||[w.label])[0]+' 시작'],'work_start',w.key);
    add(w.endAliases||[(w.aliases||[w.label])[0]+' 종료'],'work_end',w.key);
    if(w.splitAliases){w.splitAliases.forEach(a=>{add([a],'work_split_label',w.key);add([a+' 시작',a+'시작',a+' start'],'work_split_start',w.key);add([a+' 종료',a+'종료',a+' end'],'work_split_end',w.key);});}
  });
  ACTIVE_SCHEMA.semix.forEach(s=>add(s.aliases||[s.label,s.short||s.label],'semix',s.key));
  add(ACTIVE_SCHEMA.note.aliases||['비고','기타','note'],'note','note');
  return map;
}
function buildHeaderZone(ws,merges,getCellVal,range){
  const maxScan=Math.min(12,range.e.r);let metaRow=-1;
  for(let r=0;r<=maxScan;r++){for(let c=0;c<=Math.min(range.e.c,30);c++){const v=nrmStr(getCellVal(r,c));if(v==='차수'||v==='batch'){metaRow=r;break;}}if(metaRow>=0)break;}
  if(metaRow<0)return null;
  let dataStartRow=metaRow+1;
  for(let r=metaRow+1;r<=Math.min(metaRow+8,range.e.r);r++){
    let hasDate=false;
    for(let c=2;c<=Math.min(range.e.c,30);c++){const addr=XLSX.utils.encode_cell({r,c});const cell=ws[addr];if(!cell)continue;if(cell.t==='d'){hasDate=true;break;}if(cell.t==='n'&&cell.v>40000&&cell.v<70000){hasDate=true;break;}if(cell.t==='s'&&/^\d{4}-\d{2}-\d{2}/.test(String(cell.v||''))){hasDate=true;break;}}
    if(hasDate){dataStartRow=r;break;}dataStartRow=r+1;
  }
  const headerRows=[];
  for(let r=0;r<dataStartRow;r++){let hasContent=false;for(let c=0;c<=Math.min(range.e.c,30);c++){if(getCellVal(r,c).trim()){hasContent=true;break;}}if(hasContent)headerRows.push(r);}
  return{headerRows,metaRow,dataStartRow};
}
function buildColMap(ws,merges,getCellVal,zone,maxCol){
  const{headerRows}=zone;const aliasMap=buildAliasMap();const colMap={};const pendingWorkPairs={};const pendingMat=[];let colOrder=0;
  for(let c=0;c<=maxCol;c++){
    colOrder++;
    const pathRaw=headerRows.map(r=>getCellVal(r,c).trim());const pathNorm=pathRaw.map(nrmStr);
    if(!pathNorm.some(Boolean))continue;
    let lastTokIdx=-1;for(let i=pathNorm.length-1;i>=0;i--){if(pathNorm[i]){lastTokIdx=i;break;}}
    if(lastTokIdx<0)continue;
    const lastTok=pathNorm[lastTokIdx];const isStart=lastTok==='시작'||lastTok==='start';const isEnd=lastTok==='종료'||lastTok==='end';const isStartEnd=isStart||isEnd;
    let itemLabel='',itemNorm='';const searchEnd=isStartEnd?lastTokIdx-1:lastTokIdx;
    for(let i=searchEnd;i>=0;i--){const tok=pathNorm[i];if(tok&&!isGroupLabelTok(tok)){itemLabel=pathRaw[i];itemNorm=tok;break;}}
    if(!itemLabel){for(let i=searchEnd;i>=0;i--){if(pathNorm[i]){itemLabel=pathRaw[i];itemNorm=pathNorm[i];break;}}}
    if(!itemLabel)continue;
    let groupHint=null;for(const tok of pathNorm){if(tok){const h=groupToType(tok);if(h){groupHint=h;break;}}}
    if(isStartEnd){
      const combined=itemNorm+(isStart?' 시작':' 종료');const mapped=aliasMap[combined]||aliasMap[itemNorm]||null;
      if(mapped){const{type,key}=mapped;if(type==='work_start'||(type==='work_label'&&isStart))colMap[c]=key+'Start';else if(type==='work_end'||(type==='work_label'&&isEnd))colMap[c]=key+'End';else if(type==='work_split_start'||(type==='work_split_label'&&isStart)){if(!pendingWorkPairs[itemNorm])pendingWorkPairs[itemNorm]={label:itemLabel,isSplitOf:key,colOrder};pendingWorkPairs[itemNorm].start=c;}else if(type==='work_split_end'||(type==='work_split_label'&&isEnd)){if(!pendingWorkPairs[itemNorm])pendingWorkPairs[itemNorm]={label:itemLabel,isSplitOf:key,colOrder};pendingWorkPairs[itemNorm].end=c;}}
      else{if(!pendingWorkPairs[itemNorm])pendingWorkPairs[itemNorm]={label:itemLabel,colOrder};if(isStart)pendingWorkPairs[itemNorm].start=c;else pendingWorkPairs[itemNorm].end=c;}
    }else{
      const mapped=aliasMap[itemNorm]||null;
      if(mapped){const{type,key}=mapped;if(type==='meta_batch')colMap[c]='batch';else if(type==='meta_model')colMap[c]='model';else if(type==='meta_machine')colMap[c]='machine';else if(type==='mat')colMap[c]=key;else if(type==='semix')colMap[c]=key;else if(type==='note')colMap[c]='note';}
      else{if(isNoteField(itemNorm)){colMap[c]='note';}else if(groupHint==='semix'||semixFieldHint(itemNorm)){const key=normalizeKey(itemLabel);if(!ACTIVE_SCHEMA.semix.find(s=>s.key===key)){const maxO=ACTIVE_SCHEMA.semix.reduce((m,s)=>Math.max(m,s.order||0),0);ACTIVE_SCHEMA.semix.push({key,label:itemLabel,short:itemLabel,type:'single',group:'semix',color:nextAutoColor(),aliases:[itemLabel,itemNorm],order:maxO+50});}colMap[c]=key;}else if(groupHint!=='work'&&!isGroupLabelTok(itemNorm)&&itemLabel.length>=2){pendingMat.push({label:itemLabel,normLabel:itemNorm,col:c,colOrder,groupHint});}}
    }
  }
  Object.entries(pendingWorkPairs).forEach(([normLabel,pair])=>{
    if(pair.start===undefined||pair.end===undefined){const col=pair.start!==undefined?pair.start:pair.end;if(col!==undefined)pendingMat.push({label:pair.label||normLabel,normLabel,col,colOrder:pair.colOrder||0});return;}
    const key=normalizeKey(pair.label||normLabel);
    if(!ACTIVE_SCHEMA.works.find(w=>w.key===key)){const color=nextAutoColor();const parentWork=pair.isSplitOf?ACTIVE_SCHEMA.works.find(w=>w.key===pair.isSplitOf):null;const baseOrder=parentWork?parentWork.order:ACTIVE_SCHEMA.works.reduce((m,w)=>Math.max(m,w.order||0),0);const existingSplits=ACTIVE_SCHEMA.works.filter(w=>w.isSplitOf===pair.isSplitOf).length;const order=pair.isSplitOf?(baseOrder+1+existingSplits):baseOrder+50;ACTIVE_SCHEMA.works.push({key,label:pair.label||normLabel,short:pair.label||normLabel,type:'period',group:'work',color,aliases:[pair.label||normLabel,normLabel],startAliases:[(pair.label||normLabel)+' 시작',(pair.label||normLabel)+'시작'],endAliases:[(pair.label||normLabel)+' 종료',(pair.label||normLabel)+'종료'],order,isSplitOf:pair.isSplitOf||null});ACTIVE_SCHEMA.works.sort((a,b)=>(a.order||0)-(b.order||0));_lastParseInfo.newWorks.push(pair.label||normLabel);}
    colMap[pair.start]=key+'Start';colMap[pair.end]=key+'End';
  });
  pendingMat.forEach(({label,normLabel,col})=>{if(isNoteField(normLabel)){colMap[col]='note';return;}if(isGroupLabelTok(normLabel)||label.length<2)return;const key=normalizeKey(label||normLabel);if(!ACTIVE_SCHEMA.materials.find(m=>m.key===key)){ACTIVE_SCHEMA.materials.push({key,label,short:label,type:'single',group:'mat',color:nextAutoColor(),aliases:[label,normLabel]});_lastParseInfo.newMats.push(label);}colMap[col]=key;});
  resolveWorkConflicts(colMap);return colMap;
}
function resolveWorkConflicts(colMap){
  ACTIVE_SCHEMA.works.slice().forEach(w=>{
    if(!w.splitAliases||w.splitAliases.length===0)return;
    const splitChildren=ACTIVE_SCHEMA.works.filter(sw=>sw!==w&&(sw.isSplitOf===w.key||w.splitAliases.some(a=>nrmStr(a)===nrmStr(sw.label)||nrmStr(a)===sw.key)));
    if(splitChildren.length===0)return;
    const allComplete=splitChildren.every(sw=>Object.values(colMap).includes(sw.key+'Start')&&Object.values(colMap).includes(sw.key+'End'));
    if(allComplete){Object.keys(colMap).forEach(c=>{if(colMap[c]===w.key+'Start'||colMap[c]===w.key+'End')delete colMap[c];});const idx=ACTIVE_SCHEMA.works.indexOf(w);if(idx>=0)ACTIVE_SCHEMA.works.splice(idx,1);_lastParseInfo.splitResolved=true;_lastParseInfo.splitDesc=`통합 '${w.label}' → 분리 [${splitChildren.map(s=>s.label).join(', ')}] 우선 적용`;}
    else{splitChildren.forEach(sw=>{const ok=Object.values(colMap).includes(sw.key+'Start')&&Object.values(colMap).includes(sw.key+'End');if(!ok){Object.keys(colMap).forEach(c=>{if(colMap[c]===sw.key+'Start'||colMap[c]===sw.key+'End')delete colMap[c];});const idx2=ACTIVE_SCHEMA.works.findIndex(ww=>ww.key===sw.key);if(idx2>=0)ACTIVE_SCHEMA.works.splice(idx2,1);}});}
  });
}
function parseSheetRowsDynamic(ws){
  if(!ws)return[];const merges=ws['!merges']||[];const ref=ws['!ref'];if(!ref)return[];
  const range=XLSX.utils.decode_range(ref);const getCellVal=makeMergeResolver(ws,merges);
  const zone=buildHeaderZone(ws,merges,getCellVal,range);if(!zone)return parseSheetRowsLegacy(ws);
  if(typeof _lastParseInfo !== 'undefined'){
    _lastParseInfo.headerRows   = zone.headerRows.length;
    _lastParseInfo.dataStartRow = zone.dataStartRow + 1;
  }
  const colMap=buildColMap(ws,merges,getCellVal,zone,range.e.c);
  const rows=[];
  for(let r=zone.dataStartRow;r<=range.e.r;r++){
    const get=(c)=>{const addr=XLSX.utils.encode_cell({r,c});const cell=ws[addr];if(!cell)return'';if(cell.t==='d'&&cell.v instanceof Date)return cell.v.toISOString().slice(0,10);return String(cell.w!==undefined?cell.w:cell.v!==undefined?cell.v:'').trim();};
    const getD=(c)=>parseXlDate(get(c));
    let batch='',model='',machine='',note='';const dateVals={};let hasAny=false;
    Object.entries(colMap).forEach(([col,key])=>{const ci=Number(col);if(key==='batch'){batch=get(ci);if(batch)hasAny=true;}else if(key==='model'){model=get(ci);if(model)hasAny=true;}else if(key==='machine'){machine=get(ci);if(machine)hasAny=true;}else if(key==='note'){note=get(ci);}else{const v=getD(ci);if(v)hasAny=true;dateVals[key]=v||'';}});
    if(!hasAny)continue;
    rows.push({id:NID++,batch,model,machine,note,...dateVals,type:'대기',_valid:true,_errs:[]});
  }
  return rows;
}
function parseSheetRowsLegacy(ws){
  if(!ws)return[];const ref=ws['!ref'];if(!ref)return[];const range=XLSX.utils.decode_range(ref);const rows=[];
  for(let r=4;r<=range.e.r;r++){const gc=(c)=>{const addr=XLSX.utils.encode_cell({r,c});const cell=ws[addr];if(!cell)return'';if(cell.t==='d'&&cell.v instanceof Date)return cell.v.toISOString().slice(0,10);return String(cell.w||String(cell.v||'')).trim();};const gd=(c)=>parseXlDate(gc(c));const batch=gc(2),model=gc(3),machine=gc(4);if(!batch&&!model&&!machine)continue;rows.push({id:NID++,batch,model,machine,jaje:gd(5),ybase:gd(6),pod3:gd(7),wvpz:gd(8),elmo:gd(9),jungjiangStart:gd(10),jungjiangEnd:gd(11),testStart:gd(12),testEnd:gd(13),jeokjeungStart:gd(14),jeokjeungEnd:gd(15),chulgo:gd(16),haeje:gd(17),note:gc(18),type:'대기',_valid:true,_errs:[]});}
  return rows;
}
// ── 시트 매핑 상태 ─────────────────────────────────────────────────────
let _pendingWb=null;

function handleUpload(input){
  const file=input.files[0];if(!file)return; window.__TSL_LAST_SCHEDULE_FILE=file; input.value='';
  ensureXlsxReady()
    .then(()=>_handleUploadFile(file))
    .catch(err=>{console.error(err);showErr('엑셀 엔진 로드 실패: '+err.message);});
}
function _handleUploadFile(file){
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array',cellDates:true});
      _pendingWb=wb;
      const sheetNames=wb.SheetNames;
      // v0.24: 파일명/시트명 즉시 기록
      _schedTestLog.fileName = file.name;
      _schedTestLog.sheetNames = sheetNames.slice();
      // 자동 인식: '양산'/'연구' 시트 존재 여부
      const hasY = sheetNames.includes('양산');
      const hasR = sheetNames.includes('연구');
      if(hasY || hasR){
        _schedTestLog.autoRecognition = '성공';
        _schedTestLog.ysSheet = hasY ? '양산' : '';
        _schedTestLog.yrSheet = hasR ? '연구' : '';
        _doUploadWithSheets(hasY?'양산':'', hasR?'연구':'');
      } else {
        _schedTestLog.autoRecognition = '실패';
        // 시트명 불일치 → 매핑 UI 표시
        _showSheetMappingUI(sheetNames);
      }
    }catch(err){console.error(err);showErr('파일 읽기 오류: '+err.message);}
  };
  reader.readAsArrayBuffer(file);
}

function _showSheetMappingUI(sheetNames){
  const ui=document.getElementById('sheet-mapping-ui');
  if(!ui){
    showErr('시트 '+(sheetNames.join(', '))+' — 양산/연구 시트가 없어 업로드할 수 없습니다. 파일의 시트명을 확인하세요.');
    return;
  }
  const opts=sheetNames.map(s=>`<option value="${s}">${s}</option>`).join('');
  const noneOpt='<option value="">선택 안 함</option>';
  document.getElementById('sm-yangsan-sel').innerHTML=noneOpt+opts;
  document.getElementById('sm-yeonju-sel').innerHTML=noneOpt+opts;
  // 단일 시트면 첫 번째를 양산 기본값으로
  if(sheetNames.length===1) document.getElementById('sm-yangsan-sel').value=sheetNames[0];
  const sheetInfo=document.getElementById('sm-sheet-list');
  if(sheetInfo) sheetInfo.textContent='파일 시트: '+sheetNames.join(', ');
  ui.style.display='block';
  showToast('시트명 불일치: 매핑을 선택하세요','warn');
}

function _applySheetMapping(){
  const ysName=document.getElementById('sm-yangsan-sel')?.value||'';
  const yrName=document.getElementById('sm-yeonju-sel')?.value||'';
  if(!ysName&&!yrName){showErr('양산 또는 연구 시트를 하나 이상 선택하세요');return;}
  // v0.24: 매핑 선택값 기록
  _schedTestLog.ysSheet = ysName;
  _schedTestLog.yrSheet = yrName;
  const ui=document.getElementById('sheet-mapping-ui');
  if(ui) ui.style.display='none';
  _doUploadWithSheets(ysName, yrName);
}

function _doUploadWithSheets(ysName, yrName){
  if(!_pendingWb){showErr('파일 데이터 없음. 다시 업로드하세요.');return;}
  try{
    ACTIVE_SCHEMA=JSON.parse(JSON.stringify(BASE_SCHEMA));
    _autoColorIdx=5;_lastParseInfo={newMats:[],newWorks:[],splitResolved:false,splitDesc:''};
    const wsY=ysName?_pendingWb.Sheets[ysName]:null;
    const wsR=yrName?_pendingWb.Sheets[yrName]:null;
    if(!wsY&&!wsR){showErr('유효한 시트가 없습니다');return;}
    const rawY=wsY?parseSheetRowsDynamic(wsY):[];
    const rawR=wsR?parseSheetRowsDynamic(wsR):[];
    ACTIVE_SCHEMA.works.sort((a,b)=>(a.order||0)-(b.order||0));
    rebuildMgmtTables();rebuildFieldFilt();
    updateSchemaInfoBar();
    const allErrs=[];
    [...rawY,...rawR].forEach((row,i)=>{
      if(!row.machine){row._errs.push('호기 누락');row._valid=false;}
      const ve=validateRow(row);ve.forEach(err=>{row._errs.push(err);row._valid=false;});
      const loc=`${row.batch?row.batch+'차 ':''}${row.model?row.model+' ':''}${row.machine?machineLbl(row.machine):'행'+(i+1)}`;
      row._errs.forEach(err=>allErrs.push(`[${loc}] ${err}`));
    });
    PENDING_YANGSAN=rawY;PENDING_YEONJU=rawR;
    const pb=document.getElementById('pendingBar');if(pb)pb.style.display='flex';
    const pc=document.getElementById('sched-pending-count');
    if(pc) pc.textContent=`양산 ${rawY.length}행 / 연구 ${rawR.length}행`;
    const ct=document.getElementById('sched-card-time');
    if(ct) ct.textContent='업로드 대기 '+new Date().toLocaleTimeString('ko-KR');
    const ep=document.getElementById('rawErrPanel'),et=document.getElementById('errPanelTitle'),eb=document.getElementById('errPanelBody');
    if(allErrs.length){
      if(ep)ep.style.display='block';
      if(et)et.textContent=`⚠ 오류 (${allErrs.length}건)`;
      if(eb)eb.innerHTML=allErrs.slice(0,60).map(err=>`<div class="err-item">${err}</div>`).join('');
    } else { if(ep)ep.style.display='none'; }
    _updateSchedActionBar();populateEditFilters();renderEditTable();
    _updateSchedStatusPanel();
    let toastMsg=`양산 ${rawY.length}행 / 연구 ${rawR.length}행 업로드 완료`;
    if(_lastParseInfo.newMats.length)toastMsg+=` | 신규 자재: ${_lastParseInfo.newMats.join(', ')}`;
    if(_lastParseInfo.newWorks.length)toastMsg+=` | 신규 공정: ${_lastParseInfo.newWorks.join(', ')}`;
    showToast(toastMsg,'ok');
    // 검수 로그 업데이트
    _schedTestLog.sheetNames=_pendingWb.SheetNames;
    _schedTestLog.ysSheet=ysName||'(없음)';
    _schedTestLog.yrSheet=yrName||'(없음)';
    _schedTestLog.rawYCount=rawY.length;
    _schedTestLog.rawRCount=rawR.length;
    _schedTestLog.errCount=allErrs.length;
    _schedTestLog.newMats=_lastParseInfo.newMats.slice();
    _schedTestLog.newWorks=_lastParseInfo.newWorks.slice();
    _schedTestLog.pendingOk=(rawY.length>0||rawR.length>0);
    _schedTestLog.uploadErrors=allErrs.slice(0,10);
    // v0.24: headerRows / dataStartRow 기록
    if(_lastParseInfo.headerRows  != null) _schedTestLog.headerRows  = _lastParseInfo.headerRows;
    if(_lastParseInfo.dataStartRow != null) _schedTestLog.dataStartRow = _lastParseInfo.dataStartRow;
    console.log('[v0.26 upload]', JSON.stringify({rawY:rawY.length,rawR:rawR.length,
      pendingOk:_schedTestLog.pendingOk,errs:allErrs.length,
      headerRows:_schedTestLog.headerRows,dataStartRow:_schedTestLog.dataStartRow}));
    _refreshTestLogPanel();
  }catch(err){console.error(err);showErr('파일 처리 오류: '+err.message);}
}
function updateSchemaInfoBar(){
  const bar=document.getElementById('schemaInfoBar');if(!bar)return;
  const info=[];
  if(_lastParseInfo.newMats.length)info.push(`신규 자재: ${_lastParseInfo.newMats.join(', ')}`);
  if(_lastParseInfo.newWorks.length)info.push(`신규 공정: ${_lastParseInfo.newWorks.join(', ')}`);
  if(_lastParseInfo.splitResolved)info.push(_lastParseInfo.splitDesc);
  if(info.length){bar.style.display='block';bar.textContent='📌 스키마 감지: '+info.join(' | ');}
  else bar.style.display='none';
}

// ── 다운로드 ──────────────────────────────────────────────────────
function createTemplateSheet(sheetTitle,dataRows){
  const mats=ACTIVE_SCHEMA.materials,works=ACTIVE_SCHEMA.works,semix=ACTIVE_SCHEMA.semix;
  const matN=mats.length,workN=works.length,semixN=semix.length;
  const baseC=5,workStartC=baseC+matN,semixStartC=workStartC+workN*2,noteC=semixStartC+semixN,totalCols=noteC+1;
  const row0=new Array(totalCols).fill(null);const row1=new Array(totalCols).fill(null);
  row1[2]='구   분';row1[baseC]='자 재 입 고';if(workN>0)row1[workStartC]='작   업';if(semixN>0)row1[semixStartC]='세믹스';row1[noteC]='기   타';
  const row2=new Array(totalCols).fill(null);row2[2]='차수';row2[3]='모델명';row2[4]='호기';
  mats.forEach((m,i)=>{row2[baseC+i]=m.label;});works.forEach((w,i)=>{row2[workStartC+i*2]=w.label;});semix.forEach((s,i)=>{row2[semixStartC+i]=s.label;});
  const row3=new Array(totalCols).fill(null);works.forEach((_,i)=>{row3[workStartC+i*2]='시작';row3[workStartC+i*2+1]='종료';});
  const aoa=[row0,row1,row2,row3];
  if(dataRows&&dataRows.length){dataRows.forEach(row=>{const r=new Array(totalCols).fill(null);r[2]=row.batch||'';r[3]=row.model||'';r[4]=row.machine||'';mats.forEach((m,i)=>{r[baseC+i]=row[m.key]||'';});works.forEach((w,i)=>{r[workStartC+i*2]=row[w.key+'Start']||'';r[workStartC+i*2+1]=row[w.key+'End']||'';});semix.forEach((s,i)=>{r[semixStartC+i]=row[s.key]||'';});r[noteC]=row.note||'';aoa.push(r);});}
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  const merges=[];merges.push({s:{r:1,c:2},e:{r:1,c:4}});if(matN>0)merges.push({s:{r:1,c:baseC},e:{r:1,c:baseC+matN-1}});if(workN>0)merges.push({s:{r:1,c:workStartC},e:{r:1,c:workStartC+workN*2-1}});if(semixN>0)merges.push({s:{r:1,c:semixStartC},e:{r:1,c:semixStartC+semixN-1}});merges.push({s:{r:1,c:noteC},e:{r:3,c:noteC}});merges.push({s:{r:2,c:2},e:{r:3,c:2}});merges.push({s:{r:2,c:3},e:{r:3,c:3}});merges.push({s:{r:2,c:4},e:{r:3,c:4}});mats.forEach((_,i)=>{merges.push({s:{r:2,c:baseC+i},e:{r:3,c:baseC+i}});});works.forEach((_,i)=>{merges.push({s:{r:2,c:workStartC+i*2},e:{r:2,c:workStartC+i*2+1}});});semix.forEach((_,i)=>{merges.push({s:{r:2,c:semixStartC+i},e:{r:3,c:semixStartC+i}});});ws['!merges']=merges;
  const colW=new Array(totalCols).fill({wch:4});colW[2]={wch:6};colW[3]={wch:10};colW[4]={wch:10};for(let i=0;i<matN;i++)colW[baseC+i]={wch:10};for(let i=0;i<workN*2;i++)colW[workStartC+i]={wch:10};for(let i=0;i<semixN;i++)colW[semixStartC+i]={wch:10};colW[noteC]={wch:14};ws['!cols']=colW;
  return ws;
}
function downloadTemplate(mode){
  if(typeof XLSX==='undefined'){
    ensureXlsxReady()
      .then(()=>downloadTemplate(mode))
      .catch(err=>{console.error(err);showErr('엑셀 엔진 로드 실패: '+err.message);});
    return;
  }
  const wb=XLSX.utils.book_new();
  const today=new Date();
  const ds=today.getFullYear()+'년 '+(today.getMonth()+1)+'월 '+today.getDate()+'일';
  const sheetTitle=ds+' 생산일정';
  const fileName=ds+' 생산일정 데이터.xlsx';

  if(mode==='blank'||!mode){
    // 빈 양식: 헤더+스타일만, 데이터 없음
    WORK_DATA.forEach((r,si)=>{
      // 시트별로 분류
    });
    // 시트 구성: YANGSAN/YEONJU 또는 WORK_DATA 그룹
    const sheets=[
      {name:'양산',data:[]},
      {name:'연구',data:[]},
    ];
    sheets.forEach(s=>{
      wb.SheetNames.push(s.name);
      wb.Sheets[s.name]=createTemplateSheet(s.name,[]);
    });
    XLSX.writeFile(wb,ds+' 생산일정_빈양식.xlsx');
    showToast('빈 양식 다운로드 완료');
  } else if(mode==='current'){
    // 현재 데이터: YANGSAN_DATA + YEONJU_DATA
    XLSX.utils.book_append_sheet(wb,createTemplateSheet('양산',YANGSAN_DATA),'양산');
    XLSX.utils.book_append_sheet(wb,createTemplateSheet('연구',YEONJU_DATA),'연구');
    XLSX.writeFile(wb,fileName);
    showToast('현재 데이터 다운로드 완료');
  }
}
function downloadWorkExcel(){downloadTemplate('current');}
function renderDPPop(){
  const MN=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const nl=document.getElementById('dpNavLbl');if(nl)nl.textContent=`${dpY}년 ${MN[dpM]}`;
  const grid=document.getElementById('dpPopGrid');if(!grid)return;grid.innerHTML='';
  const fd=new Date(dpY,dpM,1).getDay(),dim=new Date(dpY,dpM+1,0).getDate(),pd=new Date(dpY,dpM,0).getDate(),today=new Date().toISOString().slice(0,10);
  for(let i=fd-1;i>=0;i--){const d=document.createElement('div');d.className='dp-day oth';d.textContent=pd-i;grid.appendChild(d);}
  for(let day=1;day<=dim;day++){
    const ds=`${dpY}-${String(dpM+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,dow=new Date(dpY,dpM,day).getDay();
    const d=document.createElement('div');let cls='dp-day';if(dow===0)cls+=' sd';if(dow===6)cls+=' sa';if(ds===today)cls+=' tod';if(ds===dpSel)cls+=' sel';
    d.className=cls;d.textContent=day;d.dataset.date=ds;d.onclick=function(ev){ev.stopPropagation();dpSel=this.dataset.date;dpApply(dpSel);};grid.appendChild(d);
  }
  const rem=(fd+dim)%7===0?0:7-(fd+dim)%7;for(let i=1;i<=rem;i++){const d=document.createElement('div');d.className='dp-day oth';d.textContent=i;grid.appendChild(d);}
  const pop2=document.getElementById('dpPop');
  if(pop2){const oldFooter=pop2.querySelector('.dp-footer');if(oldFooter)oldFooter.remove();}
  const footer=document.createElement('div');footer.className='dp-footer';
  const clrBtn=document.createElement('button');clrBtn.className='btn btn-pi';clrBtn.style.cssText='font-size:10.5px;padding:4px 10px;';clrBtn.textContent='날짜 지우기';
  clrBtn.onclick=ev=>{ev.stopPropagation();dpApply('');};
  const closeBtn=document.createElement('button');closeBtn.className='btn btn-ghost';closeBtn.style.cssText='font-size:10.5px;padding:4px 10px;';closeBtn.textContent='닫기';
  closeBtn.onclick=ev=>{ev.stopPropagation();dpClose();};
  footer.appendChild(clrBtn);footer.appendChild(closeBtn);
  if(pop2)pop2.appendChild(footer);
}
function dpApply(newVal){
  if(!dpCtx)return;
  // v0.54: 날짜 지우기 지원 (newVal==='' or null → 해당 필드를 '')
  if(newVal===null||newVal===undefined)newVal='';
  const changes=[];
  if(dpCtx.isPeriod&&dpCtx.endField&&newVal){
    const row=findRow(dpCtx.rowId);
    const startField=dpCtx.periodStartField||dpCtx.field;
    const endField=dpCtx.endField;
    const anchor=dpCtx.anchorDate||row?.[dpCtx.field]||row?.[startField]||newVal;
    const curStart=row?.[startField]||dpCtx.periodStartDate||anchor;
    const curEnd=row?.[endField]||dpCtx.endDate||anchor;
    const delta=Math.round((new Date(newVal)-new Date(anchor))/86400000);
    const shiftDate=d=>{if(!d)return '';const nd=new Date(d);nd.setDate(nd.getDate()+delta);return nd.toISOString().slice(0,10);};
    changes.push({rowId:dpCtx.rowId,field:startField,newVal:shiftDate(curStart)});
    changes.push({rowId:dpCtx.rowId,field:endField,newVal:shiftDate(curEnd)});
  }else{
    changes.push({rowId:dpCtx.rowId,field:dpCtx.field,newVal});
  }
  const ok=applyDateChanges(changes);
  dpClose();if(!ok)return;
  syncWorkData();
  renderEditTable();
  if(curPage==='view'){
    if(curView==='calendar')renderCalendar();
    else if(curView==='gantt')renderGantt();
    else if(curView==='batch')renderBatchView(batchModelFilt);
    else renderCurrentView();
  }
  updateCards();updateEditState();
}
function dpClose(){const pop=document.getElementById('dpPop');if(!pop)return;pop.classList.remove('open');pop.style.display='none';dpCtx=null;dpSel=null;}
function dpCancel(){dpClose();}
function dpPrev(){dpM--;if(dpM<0){dpM=11;dpY--;}renderDPPop();}
function dpNext(){dpM++;if(dpM>11){dpM=0;dpY++;}renderDPPop();}

// ── 전역 이벤트 (dpPop 닫기) ──────────────────────────────────────
document.addEventListener('click',function(e){
  const pop=document.getElementById('dpPop');
  if(pop&&pop.classList.contains('open')&&!pop.contains(e.target))dpCancel();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){dpClose();}
  if((e.key==='Delete'||e.key==='Backspace')&&hoverCell){
    const tag=(document.activeElement?.tagName||'').toLowerCase();if(tag==='input'||tag==='select'||tag==='textarea')return;
    const pop=document.getElementById('dpPop');
    if(pop&&pop.classList.contains('open')&&dpCtx){e.preventDefault();dpApply('');return;}
    e.preventDefault();const row=findRow(hoverCell.rowId);if(row&&row[hoverCell.field]){const ok=applyDateChanges([{rowId:hoverCell.rowId,field:hoverCell.field,newVal:''}]);if(ok){syncWorkData();renderEditTable();if(curPage==='view')renderCurrentView();}}
  }
});

// Claude v0.50에는 schedSwitchTab()이 _schedApplyTab(tab)을 호출하지만
// _schedApplyTab 함수 정의가 없어 일정 보기 클릭 시 ReferenceError가 발생했다.
// 이 함수는 데이터 관리/일정 보기 1차 탭 버튼과 패널을 실제로 전환한다.
function _schedApplyTab(tab){
  tab = (tab === 'view') ? 'view' : 'manage';
  const manageBtn = document.getElementById('sched-tab-manage');
  const viewBtn = document.getElementById('sched-tab-view');
  const managePanel = document.getElementById('sched-panel-manage');
  const viewPanel = document.getElementById('sched-panel-view');

  if(manageBtn) manageBtn.classList.toggle('on', tab === 'manage');
  if(viewBtn) viewBtn.classList.toggle('on', tab === 'view');
  if(managePanel) managePanel.classList.toggle('on', tab === 'manage');
  if(viewPanel) viewPanel.classList.toggle('on', tab === 'view');

  _schedPage = tab;
  curPage = tab;

  // 강제 표시/숨김까지 동기화한다. CSS class 충돌이나 이전 active/on 잔여 상태 때문에
  // 일정 보기 패널이 계속 display:none으로 남는 회귀를 막는다.
  if(managePanel) managePanel.style.display = (tab === 'manage') ? 'block' : 'none';
  if(viewPanel) viewPanel.style.display = (tab === 'view') ? 'block' : 'none';
}

// ── 탭 전환 함수 최종 재정의 (curPage/curView 동기화) ────────────
schedSwitchTab=function(tab){
  _schedPage=tab;curPage=tab;
  _schedApplyTab(tab);
  if(tab==='manage'){
    syncWorkData();
    populateEditFilters();
    renderEditTable();
  }
  else if(tab==='view'){
    populateGvFilters();
    // v0.48: 일정 보기 진입 시 현재 뷰 버튼/패널/리본을 모두 동기화한다.
    // v0.46은 renderCurrentView만 호출해서 캘린더 패널인데 리본은 간트가 active인 상태가 남을 수 있었다.
    if(typeof schedSwitchView==='function') schedSwitchView(curView || 'calendar');
    else renderCurrentView();
  }
  // 탭 전환 후 편집 상태 UI 동기화
  updateEditState();
};
schedSwitchView=function(view){
  _schedView=view;curView=view;
  ['calendar','gantt','batch'].forEach(function(v){
    const btn=document.getElementById('sched-vtab-'+v);
    const panel=document.getElementById('sched-vpanel-'+v);
    if(btn)btn.classList.toggle('on',v===view);
    if(panel)panel.classList.toggle('on',v===view);
  });
  // 캘린더 필터바 / 간트 범례 표시 제어
  // calFilterBar: ribbon-cal show/hide가 담당
  // ganttLegend: ribbon-gantt show/hide가 담당 (display는 buildGanttLegend 제어)
  const tb=document.getElementById('todayBtn');
  if(tb)tb.disabled=(view==='batch'); // [5] calendar + gantt 모두 today 활성
  updateSummaryChipDim();
  // vsctrl 패널 전환 — 뷰별 상단 기능 영역 교체
  ['cal','gantt','batch'].forEach(function(p){
    var el=document.getElementById('vsctrl-'+p);
    if(el)el.classList.toggle('active',
      (p==='cal'&&view==='calendar')||(p==='gantt'&&view==='gantt')||(p==='batch'&&view==='batch'));
  });
  // ribbon 패널 전환 (2단 뷰별 리본)
  ['cal','gantt','batch'].forEach(function(p){
    var el=document.getElementById('ribbon-'+p);
    if(el)el.classList.toggle('active',
      (p==='cal'&&view==='calendar')||(p==='gantt'&&view==='gantt')||(p==='batch'&&view==='batch'));
  });
  // [STEP5-HOOK] renderCurrentView 연결 완료
  renderCurrentView();
};

// ── initSchedule 최종 정의 ─────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════
// SCHEDULE STEP 5 — 일정보기 이식 완료
// (renderCurrentView / renderCalendar / renderGantt / renderBatchView
//  + 필터 / 날짜 탐색 / 멀티셀렉트 / 드래그)
// ═══════════════════════════════════════════════════════════════════

// ── 툴팁 ─────────────────────────────────────────────────────────
function showTip(e,info){
  const tip=document.getElementById('gTip');if(!tip)return;
  const tm=document.getElementById('gTipMachine'),tl=document.getElementById('gTipLabel'),td=document.getElementById('gTipDate'),tdv=document.getElementById('gTipDateVal');
  if(tm)tm.textContent=(info.batch?info.batch+'차 ':'')+machineLbl(info.machine||'');
  if(tl){tl.textContent=info.label||'';tl.style.color=info.color||'var(--tp)';}
  if(td&&tdv){if(info.planDate){td.style.display='flex';tdv.textContent=info.planDate;}else td.style.display='none';}
  tip.style.display='block';
  const vw=window.innerWidth,vh=window.innerHeight;
  let left=e.clientX+14,top=e.clientY-14;
  if(left+245>vw-6)left=e.clientX-255;if(top+120>vh-6)top=e.clientY-125;if(top<6)top=6;
  tip.style.left=left+'px';tip.style.top=top+'px';
}
function hideTip(){const tip=document.getElementById('gTip');if(tip)tip.style.display='none';}

// ── 렌더 분기 ─────────────────────────────────────────────────────
function renderCurrentView(){
  if(curView==='calendar')renderCalendar();
  else if(curView==='gantt')renderGantt();
  else if(curView==='batch')renderBatchView(batchModelFilt);
}

// ── 교차 필터 ─────────────────────────────────────────────────────
function viewExcept(exclude){return WORK_DATA.filter(r=>{if(exclude!=='equip'){if(gvEquipFilt==='양산'&&!YANGSAN_IDS.has(r.id))return false;if(gvEquipFilt==='연구'&&!YEONJU_IDS.has(r.id))return false;}if(exclude!=='type'&&gvTypeFilt&&calcRowStatus(r)!==gvTypeFilt)return false;if(exclude!=='model'&&gvModelFilt&&r.model!==gvModelFilt)return false;if(exclude!=='batch'&&gvBatchFilt&&r.batch!==gvBatchFilt)return false;if(exclude!=='machine'&&gvMachineFilt&&r.machine!==gvMachineFilt)return false;return true;});}
function viewCrossFilter(){
  const STATUS_ORDER=['계획','대기','진행','출고','완료'];
  const fillSel=(id,opts,labelFn)=>{const el=document.getElementById(id);if(!el)return;const cur=el.value;el.innerHTML='<option value="">전체</option>'+opts.map(o=>`<option value="${o}">${labelFn?labelFn(o):o}</option>`).join('');el.value=opts.includes(cur)?cur:'';};
  const eqEl=document.getElementById('gv-equip');if(eqEl){const cur=eqEl.value;eqEl.innerHTML='<option value="">전체</option><option value="양산">양산</option><option value="연구">연구</option>';eqEl.value=cur;}
  // 현재 데이터에 없는 상태까지 포함해 계획/대기/진행/출고/완료 전체를 유지하고,
  // 추가 상태가 있으면 뒤에 붙인다. 필터 선택 후 목록이 줄어드는 현상을 막는다.
  const typeBase=[...new Set([...STATUS_ORDER,...WORK_DATA.map(r=>calcRowStatus(r)).filter(Boolean)])];
  fillSel('gv-type',typeBase,null);
  fillSel('gv-model',[...new Set(viewExcept('model').map(r=>r.model).filter(Boolean))].sort(),null);
  fillSel('gv-batch',[...new Set(viewExcept('batch').map(r=>r.batch).filter(Boolean))].sort((a,b)=>Number(a)-Number(b)),o=>o+'차');
  fillSel('gv-machine',[...new Set(viewExcept('machine').map(r=>r.machine).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko')),machineLbl);
}
function passGvFilter(r){
  if(selMode){
    if(msSel.equip.size>0){const isY=YANGSAN_IDS.has(r.id),isR=YEONJU_IDS.has(r.id);if(!(msSel.equip.has('양산')&&isY||msSel.equip.has('연구')&&isR))return false;}
    if(msSel.type.size>0&&![...msSel.type].includes(calcRowStatus(r)))return false;
    if(msSel.model.size>0&&![...msSel.model].includes(r.model))return false;
    if(msSel.batch.size>0&&![...msSel.batch].includes(r.batch))return false;
    if(msSel.machine.size>0&&![...msSel.machine].includes(r.machine))return false;
    return true;
  }
  if(gvEquipFilt==='양산'&&!YANGSAN_IDS.has(r.id))return false;if(gvEquipFilt==='연구'&&!YEONJU_IDS.has(r.id))return false;
  if(gvTypeFilt&&calcRowStatus(r)!==gvTypeFilt)return false;if(gvModelFilt&&r.model!==gvModelFilt)return false;
  if(gvBatchFilt&&r.batch!==gvBatchFilt)return false;if(gvMachineFilt&&r.machine!==gvMachineFilt)return false;
  return true;
}
function onGvFilter(){gvEquipFilt=document.getElementById('gv-equip')?.value||'';gvTypeFilt=document.getElementById('gv-type')?.value||'';gvModelFilt=document.getElementById('gv-model')?.value||'';gvBatchFilt=document.getElementById('gv-batch')?.value||'';gvMachineFilt=document.getElementById('gv-machine')?.value||'';viewCrossFilter();renderCurrentView();}
function populateGvFilters(){viewCrossFilter();if(selMode)buildMsFilters();}

// ── 날짜 탐색 ─────────────────────────────────────────────────────
function goToToday(){const t=new Date();curNavYear=t.getFullYear();curNavMonth=t.getMonth()+1;const yl=document.getElementById('gnav-year-lbl');if(yl)yl.textContent=curNavYear;syncNavMonthSel();if(curView==='calendar'){renderCalendar();return;}const range=cachedRange||getActiveGanttRange();const x=schedDateToX(t.toISOString().slice(0,10),range.start);const outer=document.getElementById('ganttOuter');if(outer&&x>=0){const vw=outer.clientWidth;outer.scrollTo({left:Math.max(0,x-(vw-294)/2),behavior:'smooth'});}}
function navYear(dir){curNavYear+=dir;const yl=document.getElementById('gnav-year-lbl');if(yl)yl.textContent=curNavYear;syncNavMonthSel();if(curView==='calendar')renderCalendar();else renderGantt();}
function navMonth(dir){
  const base=new Date(curNavYear, (curNavMonth||1)-1+(Number(dir)||0), 1);
  curNavYear=base.getFullYear();curNavMonth=base.getMonth()+1;
  const yl=document.getElementById('gnav-year-lbl');if(yl)yl.textContent=curNavYear;
  syncNavMonthSel();
  if(curView==='calendar')renderCalendar();else renderGantt();
}
function onMonthSelChange(){curNavMonth=parseInt(document.getElementById('gnav-month-sel').value);if(curView==='calendar')renderCalendar();else renderGantt();}
function syncNavMonthSel(){const s=document.getElementById('gnav-month-sel');if(s)s.value=curNavMonth;}
function scrollGanttToMonth(){
  const range=cachedRange||getActiveGanttRange();
  if(!range)return;
  const x=schedDateToX(new Date(curNavYear,curNavMonth-1,1).toISOString().slice(0,10),range.start);
  if(x<0)return;
  // v0.59_FIXED: 전체 페이지가 옆으로 밀리지 않도록 수평 이동은 간트 컨테이너에서만 처리한다.
  // 세로 스크롤은 #main-content 전체 스크롤을 사용한다.
  const outer=document.getElementById('ganttOuter');
  if(!outer||typeof outer.scrollTo!=='function')return;
  outer.scrollTo({left:Math.max(0,x-40),behavior:'smooth'});
}
function setGanttHeaderOpt(kind, checked){
  if(kind==='day') ganttShowDay=!!checked;
  if(kind==='dow') ganttShowDow=!!checked;
  const dayCb=document.getElementById('gantt-show-day');
  const dowCb=document.getElementById('gantt-show-dow');
  if(dayCb) dayCb.checked=!!ganttShowDay;
  if(dowCb) dowCb.checked=!!ganttShowDow;
  if(curView==='gantt') renderGantt();
}
function updateSummaryChipDim(){const chip=document.getElementById('summaryChip');if(!chip)return;chip.classList.toggle('dim',curView!=='gantt');}

// ── 선택모드 / 요약모드 ───────────────────────────────────────────
function onSelModeToggle(){selMode=!selMode;const chip=document.getElementById('selChip');if(chip)chip.classList.toggle('on',selMode);if(selMode){gvEquipFilt='';gvTypeFilt='';gvModelFilt='';gvBatchFilt='';gvMachineFilt='';Object.values(msSel).forEach(s=>s.clear());buildMsFilters();}else{Object.values(msSel).forEach(s=>s.clear());restoreSingleFilters();viewCrossFilter();}renderCurrentView();}
function onSummaryToggle(){summaryMode=!summaryMode;const chip=document.getElementById('summaryChip');if(chip)chip.classList.toggle('on',summaryMode);if(curView==='gantt')renderGantt();}
function restoreSingleFilters(){['equip','type','model','batch','machine'].forEach(k=>{const fg=document.getElementById('fg-'+k);if(!fg)return;fg.querySelectorAll('.ms-btn,.ms-panel').forEach(el=>el.remove());const sel=fg.querySelector('select.f-sel');if(sel)sel.style.display='';})}
function buildMsFilters(){
  const STATUS_ORDER=['계획','대기','진행','출고','완료'];
  const rowPassForMs=(r,exclude)=>{
    if(exclude!=='equip'&&msSel.equip.size>0){const isY=YANGSAN_IDS.has(r.id),isR=YEONJU_IDS.has(r.id);if(!((msSel.equip.has('양산')&&isY)||(msSel.equip.has('연구')&&isR)))return false;}
    if(exclude!=='type'&&msSel.type.size>0&&!msSel.type.has(calcRowStatus(r)))return false;
    if(exclude!=='model'&&msSel.model.size>0&&!msSel.model.has(r.model))return false;
    if(exclude!=='batch'&&msSel.batch.size>0&&!msSel.batch.has(r.batch))return false;
    if(exclude!=='machine'&&msSel.machine.size>0&&!msSel.machine.has(r.machine))return false;
    return true;
  };
  const rowsExcept=key=>WORK_DATA.filter(r=>rowPassForMs(r,key));
  const unionSelected=(items,key)=>{
    const set=new Set(items);
    msSel[key].forEach(v=>set.add(v));
    return [...set];
  };
  // 다른 필터 때문에 계획/대기/진행/출고/완료 항목이 줄어들지 않게 한다.
  const typeItems=unionSelected([...new Set([...STATUS_ORDER,...WORK_DATA.map(r=>calcRowStatus(r)).filter(Boolean)])],'type');
  const modelItems=unionSelected([...new Set(rowsExcept('model').map(r=>r.model).filter(Boolean))].sort(),'model');
  const batchItems=unionSelected([...new Set(rowsExcept('batch').map(r=>r.batch).filter(Boolean))].sort((a,b)=>Number(a)-Number(b)),'batch');
  const machineItems=unionSelected([...new Set(rowsExcept('machine').map(r=>r.machine).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko')),'machine');
  const equipBase=[];
  if(rowsExcept('equip').some(r=>YANGSAN_IDS.has(r.id)))equipBase.push('양산');
  if(rowsExcept('equip').some(r=>YEONJU_IDS.has(r.id)))equipBase.push('연구');
  const equipItems=unionSelected(equipBase,'equip');
  const configs=[
    {key:'equip',id:'fg-equip',items:equipItems,labelFn:v=>v},
    {key:'type',id:'fg-type',items:typeItems,labelFn:v=>v},
    {key:'model',id:'fg-model',items:modelItems,labelFn:v=>v},
    {key:'batch',id:'fg-batch',items:batchItems,labelFn:v=>v+'차'},
    {key:'machine',id:'fg-machine',items:machineItems,labelFn:v=>machineLbl(v)}
  ];
  configs.forEach(({key,id,items,labelFn})=>{
    const fg=document.getElementById(id);if(!fg)return;const sel=fg.querySelector('select.f-sel');if(sel)sel.style.display='none';
    fg.querySelectorAll('.ms-btn,.ms-panel').forEach(el=>el.remove());
    const btn=document.createElement('button');btn.className='ms-btn';btn.id='ms-btn-'+key;btn.innerHTML=`<span class="ms-btn-lbl" id="ms-lbl-${key}">전체</span><span class="ms-btn-arr">▾</span>`;btn.onclick=ev=>{ev.stopPropagation();toggleMsPanel(key);};fg.appendChild(btn);
    const panel=document.createElement('div');panel.className='ms-panel';panel.id='ms-panel-'+key;
    items.forEach(val=>{const item=document.createElement('div');item.className='ms-item'+(msSel[key].has(val)?' checked':'');const cb=document.createElement('input');cb.type='checkbox';cb.value=val;cb.checked=msSel[key].has(val);cb.onclick=ev=>{ev.stopPropagation();toggleMsItem(key,val,cb.checked);};const lbl=document.createElement('span');lbl.textContent=labelFn(val);item.appendChild(cb);item.appendChild(lbl);item.onclick=ev=>{if(ev.target!==cb){cb.checked=!cb.checked;toggleMsItem(key,val,cb.checked);}};panel.appendChild(item);});
    fg.appendChild(panel);updateMsBtnLabel(key,labelFn);
  });
}

function toggleMsPanel(key){const panel=document.getElementById('ms-panel-'+key);if(!panel)return;const isOpen=panel.classList.contains('open');closeAllMsPanels();if(!isOpen)panel.classList.add('open');}
function closeAllMsPanels(){document.querySelectorAll('#page-schedule .ms-panel').forEach(p=>p.classList.remove('open'));}
function toggleMsItem(key,val,checked){if(checked)msSel[key].add(val);else msSel[key].delete(val);buildMsFilters();renderCurrentView();}
function updateMsBtnLabel(key,labelFn){const lbl=document.getElementById('ms-lbl-'+key);if(!lbl)return;const sel=msSel[key];if(sel.size===0)lbl.textContent='전체';else if(sel.size===1)lbl.textContent=labelFn([...sel][0]);else{const first=labelFn([...sel][0]);lbl.textContent=`${first} 외 ${sel.size-1}개`;}const btn=document.getElementById('ms-btn-'+key);if(btn)btn.classList.toggle('has-sel',sel.size>0);}

// ── 캘린더 필드 필터 ─────────────────────────────────────────────
function buildCalFilterBar(){
  const bar=document.getElementById('calFilterBar');if(!bar)return;
  const mats=ACTIVE_SCHEMA.materials,works=ACTIVE_SCHEMA.works,semix=ACTIVE_SCHEMA.semix;
  const matKeys=mats.map(m=>m.key),workKeys=works.map(w=>w.key+'Start'),semixKeys=semix.map(s=>s.key);
  let h=`<span class="cf-grp-lbl mat" onclick="toggleFieldGroup(${JSON.stringify(matKeys)})">자재입고</span>`;
  mats.forEach(m=>{h+=`<button class="cf-btn" id="cf-${m.key}" style="color:${m.color};border-color:${m.color}50" onclick="toggleFieldFilt('${m.key}')">${m.short}</button>`;});
  if(works.length){h+=`<div class="cf-sep"></div><span class="cf-grp-lbl work" onclick="toggleFieldGroup(${JSON.stringify(workKeys)})">작업</span>`;works.forEach(w=>{h+=`<button class="cf-btn" id="cf-${w.key+'Start'}" style="color:${w.color};border-color:${w.color}50" onclick="toggleFieldFilt('${w.key+'Start'}')">${w.short}</button>`;});}
  if(semix.length){h+=`<div class="cf-sep"></div>`;semix.forEach(s=>{h+=`<button class="cf-btn" id="cf-${s.key}" style="color:${s.color};border-color:${s.color}50" onclick="toggleFieldFilt('${s.key}')">${s.short}</button>`;});}
  bar.innerHTML=h;syncFieldFilterUI();
}
function toggleFieldFilt(f){fieldFilt[f]=!fieldFilt[f];syncFieldFilterUI();if(curView==='calendar')renderCalendar();}
function toggleFieldGroup(fields){const anyOn=fields.some(f=>fieldFilt[f]);fields.forEach(f=>fieldFilt[f]=!anyOn);syncFieldFilterUI();if(curView==='calendar')renderCalendar();}
function syncFieldFilterUI(){Object.keys(fieldFilt).forEach(f=>{const el=document.getElementById('cf-'+f);if(el)el.classList.toggle('off',!fieldFilt[f]);});}

// ── 캘린더 렌더 ──────────────────────────────────────────────────
function getEventsForDate(ds){
  const evs=[];const FMETA=schemaFMeta();const calFields=schemaCalFields();
  WORK_DATA.filter(r=>passGvFilter(r)).forEach(row=>{
    calFields.forEach(field=>{
      if(!fieldFilt[field])return;const meta=FMETA[field];if(!meta)return;
      if(meta.type==='period'&&meta.endField){const sd=row[field],ed=row[meta.endField];if(!sd)return;if(ed){if(ds>=sd&&ds<=ed)evs.push({row,field,meta,isStart:ds===sd,isEnd:ds===ed,isMid:ds>sd&&ds<ed,startDate:sd,endDate:ed});}else if(ds===sd)evs.push({row,field,meta,isStart:true,isEnd:true,isMid:false,startDate:sd,endDate:sd});}
      else if(row[field]===ds)evs.push({row,field,meta,isStart:false,isEnd:false,isMid:false,startDate:ds,endDate:ds});
    });
  });
  const ord={mat:0,work:1,semix:2};evs.sort((a,b)=>(ord[a.meta.group]||0)-(ord[b.meta.group]||0));return evs;
}
function toggleDateExpand(ds){if(expandedDates.has(ds))expandedDates.delete(ds);else expandedDates.add(ds);renderCalendar();}
function renderCalendar(){
  // v0.46: 저장 후 데이터만 표시 (원본 구조 유지)
  if(!hasScheduleDataReady()){
    const grid0=document.getElementById('calGrid');
    if(grid0){grid0.innerHTML='<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--tm);font-size:12.5px"><div style="font-size:32px;margin-bottom:10px">📅</div>저장된 생산일정 데이터가 없습니다.<br><span style="font-size:11px;color:var(--ts)">생산일정 관리 → 엑셀 업로드 → 저장 후 확인하세요.</span></div>';}
    return;
  }
  const calY=curNavYear,calM=curNavMonth-1;
  const yl=document.getElementById('gnav-year-lbl');if(yl)yl.textContent=calY;syncNavMonthSel();
  const grid=document.getElementById('calGrid');if(!grid)return;grid.innerHTML='';
  // calFilterBar: ribbon-cal이 show/hide 담당 (vis 불필요)
  ['일','월','화','수','목','금','토'].forEach((d,i)=>{const el=document.createElement('div');el.className='cdh'+(i===0?' sun':i===6?' sat':'');el.textContent=d;grid.appendChild(el);});
  const today=new Date().toISOString().slice(0,10),fd=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate(),pd=new Date(calY,calM,0).getDate();
  for(let i=fd-1;i>=0;i--){const c=document.createElement('div');c.className='cc other';c.innerHTML=`<div class="day-num"><span class="day-n">${pd-i}</span></div>`;grid.appendChild(c);}
  for(let d=1;d<=dim;d++){
    const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,dow=new Date(calY,calM,d).getDay(),hol=H[ds],isT=ds===today;
    const cell=document.createElement('div');let cls='cc';if(dow===0)cls+=' sun-cell';if(dow===6)cls+=' sat-cell';if(isT)cls+=' today';if(hol)cls+=' hcell';if(expandedDates.has(ds))cls+=' expanded';cell.className=cls;cell.dataset.date=ds;
    const dn=document.createElement('div');dn.className='day-num';dn.innerHTML=`<span class="day-n">${d}</span>${hol?`<span class="hname">${hol}`+'</span>':''}`;cell.appendChild(dn);
    if(isT){const dot=document.createElement('div');dot.className='today-dot';cell.appendChild(dot);}
    cell.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='move';cell.classList.add('drop-over');});
    cell.addEventListener('dragleave',e=>{if(!cell.contains(e.relatedTarget))cell.classList.remove('drop-over');});
    cell.addEventListener('drop',e=>{e.preventDefault();cell.classList.remove('drop-over');handleCalDrop(ds,e);});
    const evs=getEventsForDate(ds),expanded=expandedDates.has(ds),MAX=expanded?evs.length:5;
    evs.slice(0,MAX).forEach(ev=>{
      const span=document.createElement('div');
      if(ev.isMid){span.className='cal-ev-mid';span.style.background=ev.meta.color+'28';span.style.borderLeftColor=ev.meta.color;span.style.color=ev.meta.color;const midTxt=`${ev.row.batch?ev.row.batch+'차 ':''}${ev.row.model?ev.row.model+' ':''}${machineLbl(ev.row.machine)}`;span.innerHTML=`<span class="ev-txt">— ${midTxt} · ${ev.meta.short}</span><span class="ev-badge" style="background:${ev.meta.color};color:#0c1120">${ev.meta.short}</span>`;span.title=`${midTxt} · ${ev.meta.label} (${ev.startDate}~${ev.endDate})`;span.onclick=e2=>{e2.stopPropagation();openModal(ev.row.id);};
      // v0.50: 날짜 이동 버튼 (보조 팝업) — 상세 모달과 분리
      const mvBtn=document.createElement('span');
      mvBtn.className='cal-mv-btn';mvBtn.textContent='📅';mvBtn.title='날짜 이동';
      mvBtn.onclick=e2=>{
        e2.stopPropagation();
        // v0.54: 기간형 이벤트는 opts에 endField/endDate 전달 → 전체 기간 이동
        const mvOpts=ev.meta&&ev.meta.type==='period'&&ev.meta.endField?{
          endField:ev.meta.endField,
          endDate:ev.endDate||'',
          periodStartField:ev.field,
          periodStartDate:ev.startDate||''
        }:{};
        mvOpts.sourceEvent=e2;
        dpOpen(ev.row.id, ev.field, ev.startDate, mvOpts);
      };
      span.appendChild(mvBtn);
      span.onmouseenter=e2=>showTip(e2,{batch:ev.row.batch,machine:ev.row.machine,label:ev.meta.label+` (${ev.startDate}~${ev.endDate})`,color:ev.meta.color,planDate:`${ev.startDate}~${ev.endDate}`});span.onmouseleave=hideTip;}
      else{span.className='cal-ev';span.style.background=ev.meta.color+'28';span.style.borderLeftColor=ev.meta.color;span.style.color=ev.meta.color;const isPeriod=!!ev.meta.endField&&ev.endDate!==ev.startDate;const ico=ev.isStart?'▶':(ev.isEnd?'◀':'▶');const badgeLbl=isPeriod?(ev.isStart?ev.meta.short+'시':(ev.isEnd?ev.meta.short+'종':ev.meta.short)):ev.meta.short;const labelText=`${ev.row.batch?ev.row.batch+'차 ':''}${ev.row.model?ev.row.model+' ':''}${machineLbl(ev.row.machine)}`;span.innerHTML=`<div class="ev-dot" style="background:${ev.meta.color}"></div><span class="ev-txt">${ico} ${labelText} · ${ev.meta.short}</span><span class="ev-badge" style="background:${ev.meta.color};color:#0c1120">${badgeLbl}</span>`;const tipDate=isPeriod&&ev.endDate&&ev.endDate!==ev.startDate?`${ev.startDate} ~ ${ev.endDate}`:ev.startDate;span.title=`${labelText} · ${ev.meta.label} · ${tipDate}`;span.onclick=e2=>{e2.stopPropagation();openModal(ev.row.id);};span.onmouseenter=e2=>showTip(e2,{batch:ev.row.batch,machine:ev.row.machine,label:ev.meta.label,color:ev.meta.color,planDate:tipDate});span.onmouseleave=hideTip;}
      if(!span.querySelector('.cal-mv-btn')){
        const mvBtn=document.createElement('span');
        mvBtn.className='cal-mv-btn';mvBtn.textContent='📅';mvBtn.title='날짜 이동';
        const anchorDate=ev.isMid?ds:(ev.isEnd?ev.endDate:ev.startDate);
        mvBtn.onclick=e2=>{
          e2.stopPropagation();
          const isPeriod=!!ev.meta.endField&&!!ev.endDate;
          const targetField=(ev.isEnd&&ev.meta.endField)?ev.meta.endField:ev.field;
          dpOpen(ev.row.id,targetField,anchorDate,{endField:isPeriod?ev.meta.endField:'',endDate:isPeriod?ev.endDate:'',periodStartField:ev.field,periodStartDate:ev.startDate,sourceEvent:e2});
        };
        span.appendChild(mvBtn);
      }
      // 기간형 이벤트는 클릭한 날짜를 anchor로 삼고 시작~종료 간격을 유지해 함께 이동한다.
      if(!span.querySelector('.cal-mv-btn')){
        const mvBtn=document.createElement('span');
        mvBtn.className='cal-mv-btn';mvBtn.textContent='📅';mvBtn.title='날짜 이동';
        const anchorDate=ev.isMid?ds:(ev.isEnd?ev.endDate:ev.startDate);
        mvBtn.onclick=e2=>{
          e2.stopPropagation();
          const isPeriod=!!ev.meta.endField&&!!ev.endDate;
          const targetField=(ev.isEnd&&ev.meta.endField)?ev.meta.endField:ev.field;
          dpOpen(ev.row.id,targetField,anchorDate,{endField:isPeriod?ev.meta.endField:'',endDate:isPeriod?ev.endDate:'',periodStartField:ev.field,periodStartDate:ev.startDate,sourceEvent:e2});
        };
        span.appendChild(mvBtn);
      }
      span.draggable=true;span.dataset.rowId=String(ev.row.id);span.dataset.field=ev.field;span.dataset.anchorDate=ev.isMid?ds:(ev.isEnd?ev.endDate:ev.startDate);span.dataset.endField=ev.meta.endField||'';span.dataset.endDate=ev.endDate||'';
      span.addEventListener('dragstart',e2=>{dragId=ev.row.id;dragFld=ev.field;span.classList.add('dragging');e2.stopPropagation();if(e2.dataTransfer){e2.dataTransfer.effectAllowed='move';try{e2.dataTransfer.setData('text/plain',`${ev.row.id}|${ev.field}|${span.dataset.anchorDate}|${span.dataset.endField||''}|${span.dataset.endDate||''}`);}catch(_e){}}});
      span.addEventListener('dragend',()=>{span.classList.remove('dragging');});cell.appendChild(span);
    });
    if(evs.length>5){const btn=document.createElement('div');btn.className='cal-more-btn';btn.textContent=expanded?'▲ 접기':`+${evs.length-5}개 더`;btn.onclick=e=>{e.stopPropagation();toggleDateExpand(ds);};cell.appendChild(btn);}
    grid.appendChild(cell);
  }
  const rem=(fd+dim)%7===0?0:7-(fd+dim)%7;for(let d=1;d<=rem;d++){const c=document.createElement('div');c.className='cc other';c.innerHTML=`<div class="day-num"><span class="day-n">${d}</span></div>`;grid.appendChild(c);}
}

// ── 간트 렌더 ────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
// 생산일정 → 대시보드 상태 브리지
// 유일한 원천: WORK_DATA (생산일정 관리 업로드 데이터)
// 업로드 전 = WORK_DATA 빈 배열 → STATE.eqs 빈 배열
// ════════════════════════════════════════════════════════════════
function syncScheduleToDashboardState() {
  // WORK_DATA → STATE.eqs 변환 (STATE 미정의 시 안전하게 종료)
  // 종합현황 KPI는 renderDashboardKPI()가 담당 — STATE 브릿지는 장비 파생 페이지용
  if(typeof STATE === 'undefined' || !STATE || !STATE.eqs) return;
  STATE.eqs.length = 0;
  STATE.archived.length = 0;

  if (!WORK_DATA || !WORK_DATA.length) return;

  var today = new Date().toISOString().slice(0,10);

  WORK_DATA.forEach(function(row) {
    // v0.48: 장비 파생 상태도 생산일정 확정 기준(calcRowStatus)을 그대로 사용한다.
    // 출고일만으로 완료 처리하지 않는다. 완료는 해체일 기준이다.
    var st = (typeof calcRowStatus === 'function') ? calcRowStatus(row) : (row.status || '대기');

    // 다음 주요 일정: date 필드 중 오늘 이후 최근 날짜
    var allDF = schemaAllDateFields ? schemaAllDateFields() : [];
    var nextDate = null;
    allDF.forEach(function(f) {
      if (row[f] && row[f] > today) {
        if (!nextDate || row[f] < nextDate) nextDate = row[f];
      }
    });

    // 출고일
    var shipDate = row['출고'] || row['출고예정'] || row['출고일'] || null;

    // 현재 단계
    var curStage = '-';
    if (allDF.length) {
      // 오늘 기준 가장 최근 과거 날짜의 필드명
      var lastPastField = null, lastPastDate = null;
      allDF.forEach(function(f) {
        if (row[f] && row[f] <= today) {
          if (!lastPastDate || row[f] > lastPastDate) { lastPastDate = row[f]; lastPastField = f; }
        }
      });
      if (lastPastField) curStage = lastPastField;
    }

    var eqRow = {
      b:   row.batch   || '',
      m:   row.model   || '',
      id:  row.machine || '',
      st:  st,
      note: row.note || row['비고'] || '',
      p_sh: shipDate,
      p_shE: shipDate,
      _nextDate: nextDate,
      _curStage: curStage,
      _raw: row,   // 원본 참조 (상세 표시용)
    };

    if (st === '완료') {
      STATE.archived.push(eqRow);
    } else {
      STATE.eqs.push(eqRow);
    }
  });
}

// ── Active range helper — 전체 range 기준 통일 ──
function getActiveGanttRange(){
  // v0.59_FIXED: 간트 렌더 속도 개선. 전체 데이터 시작~끝을 한 번에 그리지 않고,
  // 현재 선택 월 기준 전월~익월 3개월 창만 렌더한다. 월 이동 시 해당 창을 다시 렌더한다.
  return getGanttViewportRange();
}
function getGanttViewportRange(){
  // 선택 월을 중심으로 좌우 6개월(총 13개월)을 렌더링하고,
  // 좌우 끝에서 팬 스크롤을 계속하면 navMonth(±6)로 다음 페이퍼를 연다.
  var y=curNavYear||new Date().getFullYear(), m=curNavMonth||new Date().getMonth()+1;
  var span=(typeof GANTT_WINDOW_MONTHS==='number'?GANTT_WINDOW_MONTHS:6);
  var start=new Date(y,m-1-span,1);
  var end=new Date(y,m+span,0);
  var days=Math.ceil((end-start)/86400000)+1;
  return {start:start,end:end,days:days,windowMonths:span};
}
// ── Fallback timeline range (데이터 0건이어도 간트 프레임 유지) ──
function getGanttFallbackRange(){
  return getGanttViewportRange();
}
function getGanttRange(){const allDF=schemaAllDateFields();const dates=[];WORK_DATA.forEach(r=>allDF.forEach(f=>{if(r[f])dates.push(r[f]);}));if(!dates.length)return null;dates.sort();const start=new Date(dates[0]),end=new Date(dates[dates.length-1]);start.setDate(start.getDate()-21);end.setDate(end.getDate()+28);return{start,end,days:Math.ceil((end-start)/86400000)};}
function dateToX(ds,sd){if(!ds)return-1;return Math.floor((new Date(ds)-sd)/86400000)*DAY_PX;}
function toggleGFilter(name,e){
  e.stopPropagation();
  document.querySelectorAll('#page-schedule .sched-hdr-dropdown').forEach(d=>{if(d.id!=='gfd-'+name)d.classList.remove('open');});
  const drop=document.getElementById('gfd-'+name);
  if(!drop)return;
  const wasOpen=drop.classList.contains('open');
  drop.classList.remove('open');
  if(wasOpen)return;
  // position:fixed 기준 좌표 계산 (overflow clip 우회)
  const trigger=e.currentTarget||e.target.closest('.sched-th-inner');
  if(trigger){
    const rect=trigger.getBoundingClientRect();
    const vw=window.innerWidth;
    let left=rect.left;
    // 오른쪽 잘림 방지
    if(left+160>vw)left=Math.max(0,vw-165);
    drop.style.top=(rect.bottom+3)+'px';
    drop.style.left=left+'px';
  }
  drop.classList.add('open');
}
// 전역 클릭 → 드롭다운 닫기
document.addEventListener('click',function(ev){
  if(!ev.target.closest('.sched-hdr-dropdown')&&!ev.target.closest('.sched-th-inner')){
    document.querySelectorAll('#page-schedule .sched-hdr-dropdown').forEach(d=>d.classList.remove('open'));
  }
},true);

function applyGanttBodyFilter(kind,val){
  val=String(val||'').trim();
  if(!val)return;
  if(kind==='type'){
    gvTypeFilt=val;const el=document.getElementById('gv-type');if(el)el.value=val;
  }else if(kind==='batch'){
    gvBatchFilt=val;const el=document.getElementById('gv-batch');if(el)el.value=val;
  }else if(kind==='machine'){
    gvMachineFilt=val;const el=document.getElementById('gv-machine');if(el)el.value=val;
  }else if(kind==='model'){
    gvModelFilt=val;const el=document.getElementById('gv-model');if(el)el.value=val;
  }else if(kind==='item'){
    gItemFilt=(gItemFilt===val)?'':val;
    renderGantt();
    return;
  }
  if(selMode){
    const map={type:'type',batch:'batch',machine:'machine',model:'model'};
    const k=map[kind];
    if(k&&msSel[k]){msSel[k].clear();msSel[k].add(val);buildMsFilters();}
  }else{
    viewCrossFilter();
  }
  renderCurrentView();
}
function setGFilter(name,val,e){e.stopPropagation();if(name==='batch'){gBatchFilt=val;activeBatch=null;}else if(name==='type')gTypeFilt=val;else if(name==='machine')gMachineFilt=val;else if(name==='model')gModelFilt=val;else if(name==='item')gItemFilt=val;document.querySelectorAll('#page-schedule .sched-hdr-dropdown').forEach(d=>d.classList.remove('open'));renderGantt();}
function clickBatch(batch,e){e.stopPropagation();activeBatch=(activeBatch===batch)?null:batch;gBatchFilt=activeBatch||'';document.querySelectorAll('#page-schedule .sched-hdr-dropdown').forEach(d=>d.classList.remove('open'));renderGantt();}
function mkFilterTH(cls,labelHtml,filterName,opts,curVal){
  // 필터는 상단 공통 필터바만 사용한다.
  const th=document.createElement('th');
  th.className=(cls||'')+' sched-gantt-static-th';
  th.innerHTML=`<div class="sched-th-inner"><div class="sched-th-lbl">${labelHtml}</div></div>`;
  return th;
}
function addConnSVG(inner,cx1,cx2,color){if(cx1<0||cx2<0)return;const c=color||'#4a6590';const Y1=15,YMID=30,Y2=45;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.style.cssText='position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none;z-index:3';const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M${cx1},${Y1} L${cx1},${YMID} L${cx2},${YMID} L${cx2},${Y2}`);path.setAttribute('stroke',c);path.setAttribute('stroke-width','1.5');path.setAttribute('fill','none');path.setAttribute('stroke-dasharray','4,2');svg.appendChild(path);const arr=document.createElementNS('http://www.w3.org/2000/svg','polygon');arr.setAttribute('points',`${cx2-4},${Y2-6} ${cx2+4},${Y2-6} ${cx2},${Y2}`);arr.setAttribute('fill',c);svg.appendChild(arr);inner.appendChild(svg);}
function buildGanttLegend(){
  const leg=document.getElementById('ganttLegend');if(!leg)return;leg.style.display='flex';let h='';
  ACTIVE_SCHEMA.materials.forEach(m=>{h+=`<div class="sched-leg-item"><div class="sched-leg-dot" style="background:${m.color}"></div>${m.short}</div>`;});
  if(ACTIVE_SCHEMA.works.length)h+=`<div class="sched-leg-sep"></div>`;
  ACTIVE_SCHEMA.works.forEach(w=>{h+=`<div class="sched-leg-item"><div class="sched-leg-bar-p" style="background:${w.color}"></div>${w.short} (기간)</div>`;});
  if(ACTIVE_SCHEMA.semix.length)h+=`<div class="sched-leg-sep"></div>`;
  ACTIVE_SCHEMA.semix.forEach(s=>{h+=`<div class="sched-leg-item"><div class="sched-leg-dot" style="background:${s.color}"></div>${s.short}</div>`;});
  leg.innerHTML=h;
}
function renderGantt(){
  // 이전 방식은 13개월 x 호기 x 공정별로 모든 날짜 td를 생성해 DOM이 폭증했다.
  // 이 버전은 헤더는 유지하되, 본문은 행당 하나의 timeline cell + absolute bar/marker로 렌더링한다.
  const tbl0=document.getElementById('ganttTable'),empty0=document.getElementById('ganttEmpty');
  if(!hasScheduleDataReady()){
    if(tbl0)tbl0.style.display='none';
    if(empty0){empty0.style.display='flex';empty0.innerHTML='<div style="text-align:center;color:var(--tm);font-size:12.5px"><div style="font-size:32px;margin-bottom:10px">📊</div>저장된 생산일정 데이터가 없습니다.<br><span style="font-size:11px;color:var(--ts)">생산일정 관리 → 엑셀 업로드 → 저장 후 확인하세요.</span></div>';}
    return;
  }
  buildGanttLegend();
  const range=getActiveGanttRange();cachedRange=range;
  const gl=document.getElementById('ganttLegend');if(gl)gl.style.display='flex';
  const tbl=document.getElementById('ganttTable'),empty=document.getElementById('ganttEmpty');
  if(!tbl)return;

  const today=new Date().toISOString().slice(0,10);
  const GANTT_ITEMS=schemaGanttItems();
  const filtData=WORK_DATA.filter(r=>passGvFilter(r));
  const machineMap=new Map();
  filtData.forEach(r=>{if(!machineMap.has(r.machine))machineMap.set(r.machine,{machine:r.machine,batch:r.batch,model:r.model,row:r});});
  let machines=[...machineMap.values()];
  if(gModelFilt)machines=machines.filter(m=>m.model===gModelFilt);
  if(gMachineFilt)machines=machines.filter(m=>m.machine===gMachineFilt);
  const itemsToShow=summaryMode?GANTT_ITEMS:GANTT_ITEMS;
  tbl.style.display='';

  const allDates=[];const c=new Date(range.start);
  while(c<=range.end){const ds=c.toISOString().slice(0,10);allDates.push({ds,d:c.getDate(),m:c.getMonth()+1,y:c.getFullYear(),dow:c.getDay()});c.setDate(c.getDate()+1);}
  const timelineWidth=allDates.length*SCHED_DAY_PX;
  const stickyWidth=294;
  tbl.style.minWidth=(stickyWidth+timelineWidth)+'px';
  tbl.style.width=(stickyWidth+timelineWidth)+'px';

  const months=[];let cm=null;
  allDates.forEach(d=>{const mk=`${d.y}-${d.m}`;if(!cm||cm.k!==mk){cm={k:mk,l:`${d.y}년 ${d.m}월`,cnt:0};months.push(cm);}cm.cnt++;});
  const batches=[...new Set(WORK_DATA.map(r=>r.batch).filter(Boolean))].sort();
  const models=[...new Set(WORK_DATA.map(r=>r.model).filter(Boolean))].sort();
  const allMachines=[...new Set(WORK_DATA.map(r=>r.machine).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));
  const showGDay=!!ganttShowDay, showGDow=!!ganttShowDow;
  const ganttHeaderRows=(showGDay||showGDow)?3:2;
  tbl.dataset.grows=String(ganttHeaderRows);
  tbl.style.setProperty('--gantt-static-head-h', (ganttHeaderRows===3 ? '76px' : '48px'));
  const dayCb=document.getElementById('gantt-show-day');if(dayCb)dayCb.checked=showGDay;
  const dowCb=document.getElementById('gantt-show-dow');if(dowCb)dowCb.checked=showGDow;
  const SB='position:sticky;z-index:8;background:var(--sf2);border-right:1px solid var(--bd);border-bottom:1px solid var(--bd);vertical-align:middle;overflow:visible;';
  const mkFTH=(leftPx,wPx,label,fname,opts,cur)=>{
    const th=document.createElement('th');
    th.className='sched-gantt-static-th';
    th.setAttribute('rowspan', String(ganttHeaderRows));
    th.style.cssText=`${SB}left:${leftPx}px;width:${wPx}px;min-width:${wPx}px;max-width:${wPx}px;height:${ganttHeaderRows===3?'76px':'48px'};min-height:${ganttHeaderRows===3?'76px':'48px'};`;
    th.innerHTML=`<div class="sched-th-inner"><div class="sched-th-lbl">${label}</div></div>`;
    return th;
  };
  const weekLabel=(d)=>{const firstDow=new Date(d.y,d.m-1,1).getDay();const w=Math.floor((d.d+firstDow-1)/7)+1;return `${d.m}월 ${w}주`;};
  const weeks=[];let cw=null;
  allDates.forEach(d=>{const wk=`${d.y}-${d.m}-${weekLabel(d)}`;if(!cw||cw.k!==wk){cw={k:wk,l:weekLabel(d),cnt:0};weeks.push(cw);}cw.cnt++;});

  const thead=document.createElement('thead');
  const hr1=document.createElement('tr');
  hr1.appendChild(mkFTH(0,50,'상태','type',[{val:'계획',lbl:'계획'},{val:'대기',lbl:'대기'},{val:'진행',lbl:'진행'},{val:'출고',lbl:'출고'},{val:'완료',lbl:'완료'}],gTypeFilt));
  hr1.appendChild(mkFTH(50,42,'차수','batch',batches.map(b=>({val:b,lbl:b+'차'})),gBatchFilt));
  hr1.appendChild(mkFTH(92,80,'호기','machine',allMachines.map(m=>({val:m,lbl:machineLbl(m)})),gMachineFilt));
  hr1.appendChild(mkFTH(172,52,'모델','model',models.map(m=>({val:m,lbl:m})),gModelFilt));
  hr1.appendChild(mkFTH(224,70,'공정','item',GANTT_ITEMS.map(i=>({val:i.field,lbl:i.label+(i.type==='period'?'(기간)':'')})),gItemFilt));
  months.forEach(mo=>{const th=document.createElement('th');th.className='sched-gmh';th.colSpan=mo.cnt;th.textContent=mo.l;hr1.appendChild(th);});
  thead.appendChild(hr1);
  const hr2=document.createElement('tr');
  weeks.forEach(w=>{const th=document.createElement('th');th.className='sched-gwh';th.colSpan=w.cnt;th.textContent=w.l;hr2.appendChild(th);});
  thead.appendChild(hr2);
  if(showGDay||showGDow){
    const hr3=document.createElement('tr');
    const dowLbl=['일','월','화','수','목','금','토'];
    allDates.forEach(d=>{
      const th=document.createElement('th');
      const we=d.dow===0||d.dow===6,isT=d.ds===today;
      th.className=`sched-gdh${we?' sched-we':''}${isT?' sched-td':''}`;
      const parts=[];
      if(showGDay) parts.push(`<span class="sched-gday-num">${d.d}</span>`);
      if(showGDow) parts.push(`<span class="sched-gday-dow">${dowLbl[d.dow]}</span>`);
      th.innerHTML=`<span class="sched-gday">${parts.join('')}</span>`;
      hr3.appendChild(th);
    });
    thead.appendChild(hr3);
  }
  tbl.innerHTML='';tbl.className='sched-gt sched-gt-fast';tbl.appendChild(thead);

  if(!machines.length){
    if(empty){empty.style.display='block';empty.textContent='필터에 맞는 데이터 없음';}
    const _etb=document.createElement('tbody');
    const _etr=document.createElement('tr');const _etd=document.createElement('td');
    _etd.colSpan=6;
    _etd.style.cssText='padding:36px;text-align:center;color:var(--ts);font-size:13px;border:none';
    _etd.textContent='필터에 맞는 데이터 없음';
    _etr.appendChild(_etd);_etb.appendChild(_etr);tbl.appendChild(_etb);
    requestAnimationFrame(()=>scrollGanttToMonth());
    return;
  }
  if(empty)empty.style.display='none';

  const clipSpan=(sd,ed)=>{
    if(!sd)return null;
    const startDs=range.start.toISOString().slice(0,10), endDs=range.end.toISOString().slice(0,10);
    const s=sd<startDs?startDs:sd;
    const e=(ed||sd)>endDs?endDs:(ed||sd);
    if(e<startDs||s>endDs||e<s)return null;
    const left=schedDateToX(s,range.start);
    const right=schedDateToX(e,range.start)+SCHED_DAY_PX;
    return {left,width:Math.max(4,right-left),startClipped:s!==sd,endClipped:e!==(ed||sd)};
  };
  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const addBars=(layer,row,items,grp,summary)=>{
    const LAYER={mat:{top:2,h:5},work:{top:8,h:10},semix:{top:20,h:8}};
    items.forEach((item,idx)=>{
      const base=summary?(LAYER[item.group]||LAYER.work):{top:4,h:14};
      const ml=esc(item.label);
      if(item.type==='period'){
        const sd=row[item.field]||'',ed=row[item.endField||item.field]||'';
        const span=clipSpan(sd,ed||sd);if(!span)return;
        const el=document.createElement('div');
        el.className='sched-fast-bar';
        el.style.cssText=`left:${span.left}px;width:${span.width}px;top:${base.top}px;height:${base.h}px;background:${item.color};border-radius:${span.startClipped?'0':'4px'} ${span.endClipped?'0':'4px'} ${span.endClipped?'0':'4px'} ${span.startClipped?'0':'4px'};`;
        el.onmouseenter=(event)=>showTip(event,{batch:grp.batch||'',machine:grp.machine||'',label:ml,color:item.color,planDate:sd+(ed&&ed!==sd?' ~ '+ed:'')});
        el.onmouseleave=hideTip;
        layer.appendChild(el);
      }else{
        const ds=row[item.field]||'';if(!ds)return;
        const x=schedDateToX(ds,range.start);if(x<0||x>timelineWidth)return;
        const el=document.createElement('div');
        el.className='sched-fast-dot';
        el.style.cssText=`left:${Math.max(0,x+Math.floor(SCHED_DAY_PX/2)-4)}px;top:${base.top}px;height:${base.h}px;background:${item.color};`;
        el.onmouseenter=(event)=>showTip(event,{batch:grp.batch||'',machine:grp.machine||'',label:ml,color:item.color,planDate:ds});
        el.onmouseleave=hideTip;
        layer.appendChild(el);
      }
    });
    const todayX=schedDateToX(today,range.start);
    if(todayX>=0&&todayX<=timelineWidth){
      const td=document.createElement('div');td.className='sched-fast-today';td.style.left=(todayX+Math.floor(SCHED_DAY_PX/2))+'px';layer.appendChild(td);
    }
  };
  const makeTimelineTd=(row,items,grp,summary)=>{
    const td=document.createElement('td');td.className='sched-fast-cell';td.colSpan=allDates.length;td.style.width=timelineWidth+'px';td.style.minWidth=timelineWidth+'px';
    const layer=document.createElement('div');layer.className='sched-fast-layer';layer.style.width=timelineWidth+'px';layer.style.minHeight=(summary?'32px':'22px');
    addBars(layer,row,items,grp,summary);
    td.appendChild(layer);
    return td;
  };

  const tbody=document.createElement('tbody');
  const ITEMS_N=itemsToShow.length;
  const SD_BASE='position:sticky;z-index:3;background:var(--sf2);border-right:1px solid var(--bd);border-bottom:1px solid var(--bd);height:22px;vertical-align:middle;padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  machines.forEach((grp,mi)=>{
    const status=calcRowStatus(grp.row);
    const firstMatKey=ACTIVE_SCHEMA.materials[0]?.key||'jaje';
    const startDate=grp.row?.[firstMatKey]||'';
    if(summaryMode){
      const tr=document.createElement('tr');
      const mkS=(leftPx,wPx,inner,fn)=>{const td=document.createElement('td');td.style.cssText=`${SD_BASE}left:${leftPx}px;width:${wPx}px;min-width:${wPx}px;`;td.innerHTML=inner;if(fn)fn(td);return td;};
      const tdSt=mkS(0,50,`<span class="st-${status}" style="font-size:8px;padding:1px 4px">${status}</span>`);tdSt.classList.add('sched-sticky-cell','sched-cell-status');tdSt.title='상태 필터';tdSt.onclick=()=>applyGanttBodyFilter('type',status);tr.appendChild(tdSt);
      const tdB=mkS(50,42,`<span class="sched-batch-text">${grp.batch||'—'}차</span>`);tdB.classList.add('sched-sticky-cell','sched-cell-batch');tdB.title='차수 필터';tdB.style.cursor='pointer';tdB.onclick=()=>applyGanttBodyFilter('batch',grp.batch);tr.appendChild(tdB);
      const tdM=mkS(92,80,`<span class="sched-machine-link">${machineLbl(grp.machine)}</span>`);tdM.classList.add('sched-sticky-cell','sched-cell-machine');tdM.title='호기 필터';tdM.style.cursor='pointer';tdM.onclick=()=>applyGanttBodyFilter('machine',grp.machine);tr.appendChild(tdM);
      const tdModel=mkS(172,52,mbadge(grp.model));tdModel.classList.add('sched-sticky-cell','sched-cell-model');tdModel.title='모델 필터';tdModel.style.cursor='pointer';tdModel.onclick=()=>applyGanttBodyFilter('model',grp.model);tr.appendChild(tdModel);
      const tdSum=mkS(224,70,'<span style="font-size:8px;color:var(--ts)">요약</span>');tdSum.classList.add('sched-sticky-cell','sched-cell-process');tr.appendChild(tdSum);
      tr.appendChild(makeTimelineTd(grp.row,GANTT_ITEMS,grp,true));
      tbody.appendChild(tr);
    }else{
      itemsToShow.forEach((item,itemIdx)=>{
        const isFirst=itemIdx===0;
        const tr=document.createElement('tr');
        if(isFirst){
          const mkRS=(leftPx,wPx,inner,fn)=>{const td=document.createElement('td');td.rowSpan=ITEMS_N;td.style.cssText=`${SD_BASE}left:${leftPx}px;width:${wPx}px;min-width:${wPx}px;`;td.innerHTML=inner;if(fn)fn(td);return td;};
          const tdSt=mkRS(0,50,`<span class="st-${status}" style="font-size:8px;padding:1px 4px">${status}</span>`);tdSt.classList.add('sched-sticky-cell','sched-cell-status');tdSt.title='상태 필터';tdSt.onclick=()=>applyGanttBodyFilter('type',status);tr.appendChild(tdSt);
          const tdB=mkRS(50,42,`<span class="sched-batch-text">${grp.batch||'—'}차</span>`);tdB.classList.add('sched-sticky-cell','sched-cell-batch');tdB.title='차수 필터';tdB.style.cursor='pointer';tdB.onclick=()=>applyGanttBodyFilter('batch',grp.batch);tr.appendChild(tdB);
          const tdM=mkRS(92,80,`<span class="sched-machine-link">${machineLbl(grp.machine)}</span>`);tdM.classList.add('sched-sticky-cell','sched-cell-machine');tdM.title='호기 필터';tdM.style.cursor='pointer';tdM.onclick=()=>applyGanttBodyFilter('machine',grp.machine);tr.appendChild(tdM);
          const tdModel=mkRS(172,52,mbadge(grp.model));tdModel.classList.add('sched-sticky-cell','sched-cell-model');tdModel.title='모델 필터';tdModel.style.cursor='pointer';tdModel.onclick=()=>applyGanttBodyFilter('model',grp.model);tr.appendChild(tdModel);
        }
        const tdIt=document.createElement('td');
        tdIt.style.cssText='position:sticky;left:224px;z-index:3;width:70px;min-width:70px;background:var(--sf2);border-right:1px solid var(--bd);border-bottom:0;height:22px;vertical-align:middle;padding:0 5px;font-size:8.5px;white-space:nowrap;overflow:hidden;color:'+item.color+';';
        tdIt.classList.add('sched-sticky-cell','sched-cell-process');tdIt.title='공정 필터';tdIt.style.cursor='pointer';tdIt.onclick=()=>applyGanttBodyFilter('item',item.field);tdIt.textContent=item.label;tr.appendChild(tdIt);
        tr.appendChild(makeTimelineTd(grp.row,[item],grp,false));
        tbody.appendChild(tr);
      });
    }
    if(mi<machines.length-1){const sep=document.createElement('tr');sep.className='sched-mach-sep';const std=document.createElement('td');std.colSpan=6;sep.appendChild(std);tbody.appendChild(sep);}
  });
  tbl.appendChild(tbody);
  requestAnimationFrame(()=>{scrollGanttToMonth();setupGanttPanScroll();});
}

function calcScheduleFieldProgress(row){
  const fields=[];
  try{
    (ACTIVE_SCHEMA.materials||[]).forEach(m=>fields.push(m.key));
    (ACTIVE_SCHEMA.works||[]).forEach(w=>{fields.push(w.key+'Start');fields.push(w.key+'End');});
    (ACTIVE_SCHEMA.semix||[]).forEach(s=>fields.push(s.key));
  }catch(_e){}
  const total=fields.length||1;
  const done=fields.filter(f=>row&&row[f]).length;
  return Math.max(0,Math.min(100,Math.round(done/total*100)));
}
function getDelaySummary(row){
  const d=(row&&row._delay)||{};
  const note=String((row&&row.note)||'').trim();
  const reason=String(d.reason||row.delay_reason||row.delayReason||(/지연|delay/i.test(note)?note:'')).trim();
  const type=String(d.type||row.delay_type||row.delayType||(reason?'기타':'')).trim();
  const owner=String(d.owner||row.delay_owner_team||row.delayOwner||'').trim();
  const status=String(d.status||row.delay_status||row.delayStatus||'').trim();
  const linked=String(d.linked_improvement_id||row.linked_improvement_id||'').trim();
  return {has:!!(reason||type||owner||status||linked),reason,type,owner,status,linked};
}
function renderBatchProgress(p){
  p=Math.max(0,Math.min(100,Number(p)||0));
  return '<div class="batch-prog"><div class="batch-prog-top"><b>'+p+'%</b><span>진행도</span></div><div class="batch-prog-bar"><i style="width:'+p+'%"></i></div></div>';
}
function renderBatchDelay(d){
  if(!d||!d.has)return '<span class="batch-delay-empty">—</span>';
  const type=escHtml(d.type||'지연');
  const reason=escHtml(d.reason||'사유 미입력');
  const tail=[d.owner?('담당 '+escHtml(d.owner)):'',d.status?escHtml(d.status):'',d.linked?escHtml(d.linked):''].filter(Boolean).join(' · ');
  return '<div class="batch-delay"><span class="batch-delay-type">'+type+'</span><span class="batch-delay-reason">'+reason+'</span>'+(tail?'<small>'+tail+'</small>':'')+'</div>';
}

// ── 배치 뷰 렌더 ─────────────────────────────────────────────────
function getBatchViewData(mf){
  const plans=WORK_DATA.filter(r=>passGvFilter(r)&&(!mf||r.model===mf));
  // v0.48: 생산일정용 컬럼으로 개선 — 상태/단계/생산기간/출고일/해체일 포함
  const rows=plans.map(r=>{
    const st=calcRowStatus(r);
    const _stageInfo=(typeof getRowStageInfo==='function')?getRowStageInfo(r):null;
    const stage=(_stageInfo&&(_stageInfo.label||_stageInfo.status))?_stageInfo.label||_stageInfo.status:'—';
    const prodStart=r.jungjiangStart||'';
    const prodEnd=r.jeokjeungEnd||'';
    const prodPeriod=prodStart&&prodEnd?prodStart.slice(5)+'~'+prodEnd.slice(5):prodStart||prodEnd?'일부':'-';
    const progress=(_stageInfo&&typeof _stageInfo.progress==='number')?_stageInfo.progress:calcScheduleFieldProgress(r);
    const delay=getDelaySummary(r);
    return {batch:r.batch,machine:r.machine,model:r.model,status:st,stage:stage,
      prodPeriod:prodPeriod,prodStart:prodStart,prodEnd:prodEnd,
      chulgo:r.chulgo||'',haeje:r.haeje||'',progress:progress,delay:delay,
      batchNum:parseInt(r.batch)||0,isYeonju:YEONJU_IDS&&YEONJU_IDS.has(r.id)};
  });
  rows.sort((a,b)=>{let aV,bV;if(batchSortCol==='batch'){aV=a.batchNum;bV=b.batchNum;}else if(batchSortCol==='machine'){aV=a.machine;bV=b.machine;}else if(batchSortCol==='model'){aV=a.model||'';bV=b.model||'';}else{aV=a.date||'';bV=b.date||'';}const cmp=typeof aV==='number'?aV-bV:aV.localeCompare(bV,'ko');return batchSortDir==='asc'?cmp:-cmp;});
  return rows;
}
function getSArr(col){return`<span class="sort-arr${batchSortCol===col?' on':''}">${batchSortCol===col?(batchSortDir==='asc'?'▼':'▲'):'▽'}</span>`;}
function sortBatchView(col){if(batchSortCol===col)batchSortDir=batchSortDir==='asc'?'desc':'asc';else{batchSortCol=col;batchSortDir='asc';}renderBatchView(batchModelFilt);}
function filterBatchView(model){batchModelFilt=model;renderBatchView(model);}
function buildModelButtons(){const c=document.getElementById('modelBtns');if(!c)return;if(!hasScheduleDataReady()){c.innerHTML='<button class="model-btn active" onclick="filterBatchView(\'\')">전체</button>';return;}const models=[...new Set(WORK_DATA.map(r=>r.model).filter(Boolean))].sort();c.innerHTML=`<button class="model-btn ${!batchModelFilt?'active':''}" onclick="filterBatchView('')">전체</button>`+models.map(m=>`<button class="model-btn ${batchModelFilt===m?'active':''}" onclick="filterBatchView('${m}')">${m}</button>`).join('');}
function renderBatchView(mf=''){
  batchModelFilt=mf;buildModelButtons();
  const wrap=document.getElementById('batchTableWrap');if(!wrap)return;
  // v0.46: 저장 후 데이터만 표시 (원본 구조 유지)
  if(!hasScheduleDataReady()){
    wrap.innerHTML='<div style="padding:40px;text-align:center;color:var(--tm);font-size:12.5px"><div style="font-size:32px;margin-bottom:10px">🗃</div>저장된 생산일정 데이터가 없습니다.<br><span style="font-size:11px;color:var(--ts)">생산일정 관리 → 엑셀 업로드 → 저장 후 확인하세요.</span></div>';
    return;
  }
  const data=getBatchViewData(mf);
  if(!data.length){wrap.innerHTML='<div style="color:var(--ts);padding:20px;text-align:center">해당 조건의 데이터가 없습니다.</div>';return;}let html=`<div style="overflow:visible"><table class="btbl" style="width:100%;min-width:0;border-collapse:collapse;font-size:11.5px">
  <thead><tr style="background:var(--hd)">
    <th onclick="sortBatchView('batch')" style="padding:7px 10px;text-align:left;cursor:pointer;white-space:nowrap">차수 ${getSArr('batch')}</th>
    <th onclick="sortBatchView('machine')" style="padding:7px 10px;text-align:left;cursor:pointer;white-space:nowrap">호기 ${getSArr('machine')}</th>
    <th onclick="sortBatchView('model')" style="padding:7px 10px;text-align:left;cursor:pointer;white-space:nowrap">장비 ${getSArr('model')}</th>
    <th style="padding:7px 10px;white-space:nowrap">구분</th>
    <th style="padding:7px 10px;white-space:nowrap">상태</th>
    <th style="padding:7px 10px;white-space:nowrap">현재 단계</th>
    <th style="padding:7px 10px;white-space:nowrap;min-width:110px">진행도</th>
    <th style="padding:7px 10px;white-space:nowrap;min-width:150px">지연사유</th>
    <th style="padding:7px 10px;white-space:nowrap">생산기간<br><span style="font-weight:400;font-size:9.5px;color:var(--tm)">전장시작~적층종료</span></th>
    <th style="padding:7px 10px;white-space:nowrap">출고일</th>
    <th style="padding:7px 10px;white-space:nowrap">해체일</th>
  </tr></thead><tbody>`;
  data.forEach((row,i)=>{
    const u=(row.model||'').toUpperCase();
    const mBadge=row.model?`<span class="badge ${u.includes('HBM')?'b-hbm':u.includes('OPERA')?'b-opera':'b-md'}">${row.model}</span>`:'-';
    const equipBadge=row.isYeonju?`<span class="badge" style="background:#064e3b;color:#6ee7b7">연구</span>`:`<span class="badge" style="background:#0f2a4a;color:#60a5fa">양산</span>`;
    const stCls={'진행':'b-gr','대기':'b-am','계획':'b-dt','출고':'b-pi','완료':'b-rd'}[row.status]||'b-dt';
    const stBadge=`<span class="badge ${stCls}">${row.status}</span>`;
    const f2=d=>d?d.slice(5):'—';
    html+=`<tr style="${i%2?'background:var(--bd2)':''}">
      <td style="padding:6px 10px">${row.batch||'—'}차</td>
      <td style="padding:6px 10px">${machineLbl(row.machine)}</td>
      <td style="padding:6px 10px">${mBadge}</td>
      <td style="padding:6px 10px">${equipBadge}</td>
      <td style="padding:6px 10px">${stBadge}</td>
      <td style="padding:6px 10px;font-size:10.5px;color:var(--tm)">${row.stage}</td>
      <td style="padding:6px 10px;min-width:110px">${renderBatchProgress(row.progress)}</td>
      <td style="padding:6px 10px;min-width:150px">${renderBatchDelay(row.delay)}</td>
      <td style="padding:6px 10px;font-size:10.5px">${row.prodPeriod}</td>
      <td style="padding:6px 10px;font-size:10.5px">${f2(row.chulgo)}</td>
      <td style="padding:6px 10px;font-size:10.5px">${f2(row.haeje)}</td>
    </tr>`;
  });
  html+='</tbody></table></div>';wrap.innerHTML=html;}

initSchedule=function(){
  if(!_schedInited){
    _schedInited=true;
    // 상태값 초기 동기화 (manage/view 통일)
    _schedPage='manage'; curPage='manage';
    // 스키마·데이터 초기화
    schemaCalFields().forEach(f=>{fieldFilt[f]=true;});
    rebuildMgmtTables();
    syncWorkData();
    commitSavedSnapshot();
    // 탭 UI + 데이터 관리 렌더
    _schedApplyTab('manage');
    populateEditFilters();
    renderEditTable();
    _updateSchedActionBar();
    // 일정보기 사전 초기화 (탭 전환 시 즉시 렌더 가능하도록)
    buildCalFilterBar();
    buildGanttLegend();
    populateGvFilters();
    // v0.48: HTML 기본 active가 어긋나도 내부 상태는 캘린더 기준으로 고정한다.
    curView='calendar'; _schedView='calendar';
    ['calendar','gantt','batch'].forEach(function(v){
      var btn=document.getElementById('sched-vtab-'+v);
      var panel=document.getElementById('sched-vpanel-'+v);
      if(btn)btn.classList.toggle('on',v==='calendar');
      if(panel)panel.classList.toggle('on',v==='calendar');
    });
    ['cal','gantt','batch'].forEach(function(p){
      var el=document.getElementById('ribbon-'+p);
      if(el)el.classList.toggle('active',p==='cal');
    });
    // 편집 상태 UI 초기화 (버튼 disabled 상태 동기화)
    updateEditState();
  } else {
    // 재진입 시: 상태값 3종 모두 동기화
    _schedApplyTab(_schedPage);
    curPage=_schedPage;
    if(_schedPage==='manage'){populateEditFilters();renderEditTable();}
    else if(_schedPage==='view'){populateGvFilters();renderCurrentView();}
  }
  // 버전 배지 업데이트
  const vb=document.getElementById('sched-version-badge');if(vb)vb.textContent='v0.81_FIXED';
  const rb=document.getElementById('sched-verify-badge');
  if(rb){rb.textContent='v0.81_FIXED';rb.classList.add('ok');}
};

// ── 저장 알림 바 ──────────────────────────
function showSaveBar(msg){
  const p=document.getElementById('save-notice-panel');
  if(!p) return;
  const lastEl=document.getElementById('save-last-message');
  if(lastEl) lastEl.textContent=msg;
  p.classList.remove('hidden');
  clearTimeout(p._timer);
  p._timer=setTimeout(()=>p.classList.add('hidden'),3500);
}

// ── 상세 모달 함수 (v0.24) ─────────────────────────────────────────────
function openModal(rowId){
  const row = (typeof WORK_DATA !== 'undefined')
    ? (WORK_DATA.find(r=>r.id===rowId) || [...(YANGSAN_DATA||[]),...(YEONJU_DATA||[])].find(r=>r.id===rowId))
    : null;
  const title = document.getElementById('modalTitle');
  const sub   = document.getElementById('modalSub');
  if(title) title.textContent = row
    ? `${row.machine||''}호기  ${row.model||''}  ${row.batch?row.batch+'차':''}`.trim()
    : '상세 정보';
  if(sub) sub.textContent = row
    ? `${row.isYeonju?'연구':'양산'} · 상태: ${row.status||'—'}`
    : '';

  // 개요 탭 내용
  const overview = document.getElementById('mtab-overview');
  if(overview && row){
    const dates = Object.entries(row)
      .filter(([k,v])=> typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v))
      .map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--sf2);border-radius:4px;margin-bottom:3px;font-size:11.5px"><span style="color:var(--ts)">${k}</span><span style="font-family:monospace;color:var(--ac)">${v}</span></div>`)
      .join('');
    overview.innerHTML = dates || '<div style="color:var(--tm);padding:8px">날짜 데이터 없음</div>';
  }

  // 지연사유 탭
  const delayPanel = document.getElementById('mtab-delay_reason');
  if(delayPanel && row){
    const d = row._delay || {};
    delayPanel.innerHTML = d.reason
      ? `<div style="padding:8px;background:var(--rdd);border-radius:7px;font-size:12px">
          <b style="color:var(--rd)">⚠ ${d.type||'지연'}</b><br>
          ${d.reason}<br>
          ${d.owner?`<span style="color:var(--tm)">담당: ${d.owner}</span>`:''}
        </div>`
      : '<div style="color:var(--tm);padding:8px">지연사유 없음</div>';
  }

  // 공정 상세 탭
  const stagesPanel = document.getElementById('mtab-stages');
  if(stagesPanel && row && typeof schemaGanttItems==='function'){
    const items = schemaGanttItems();
    const rows2 = items.map(item=>{
      const sv = row[item.sKey], ev = row[item.eKey];
      return `<div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:4px;padding:4px 8px;background:var(--sf2);border-radius:4px;margin-bottom:3px;font-size:11px;align-items:center">
        <span style="color:var(--ts)">${item.label}</span>
        <span style="font-family:monospace">${sv||'—'}</span>
        <span style="font-family:monospace">${ev||'—'}</span>
      </div>`;
    }).join('');
    stagesPanel.innerHTML = `
      <div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:4px;padding:4px 8px;font-size:10px;color:var(--tm);margin-bottom:4px">
        <span>공정</span><span>시작</span><span>종료</span>
      </div>${rows2||'<div style="color:var(--tm);padding:8px">공정 데이터 없음</div>'}`;
  }

  switchMTab('overview');
  document.getElementById('modal')?.classList.add('open');
}

function closeModal(){
  document.getElementById('modal')?.classList.remove('open');
}

function closeModalOverlay(e){
  if(e.target.id==='modal') closeModal();
}

function switchMTab(tab){
  document.querySelectorAll('.mtab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.mtab-panel').forEach(p=>p.classList.remove('on'));
  const btn = document.getElementById('mtab-btn-'+tab)
           || document.querySelector(`.mtab[onclick*="${tab}"]`);
  const panel = document.getElementById('mtab-'+tab);
  if(btn)   btn.classList.add('on');
  if(panel) panel.classList.add('on');
}

// ── v0.24 실시간 검수 패널 갱신 ───────────────────────────────────────
function _refreshTestLogPanel(){
  const panel = document.getElementById('dev-test-log-panel');
  if(!panel || panel.style.display==='none') return;
  const log = _schedTestLog;
  const row = (label, val, ok) => {
    const color = ok===true?'var(--gr)':ok===false?'var(--rd)':'var(--ts)';
    return `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--bd2,rgba(255,255,255,.04));font-size:10.5px">
      <span style="color:var(--tm)">${label}</span>
      <span style="color:${color};font-weight:600;font-family:monospace">${String(val)}</span>
    </div>`;
  };
  const isOk = v => v>0||v===true;
  panel.innerHTML =
    `<div style="font-size:11px;font-weight:700;color:var(--pi);margin-bottom:8px">🔬 v0.26 진행단계/업로드 검수 로그</div>` +
    row('파일', log.fileName||'—') +
    row('시트', (log.sheetNames||[]).join(', ')||'—') +
    row('양산 시트', log.ysSheet||'—') +
    row('연구 시트', log.yrSheet||'—') +
    `<div style="height:4px"></div>` +
    row('rawYCount', log.rawYCount, log.rawYCount>0) +
    row('rawRCount', log.rawRCount) +
    row('오류 건수', log.errCount, log.errCount===0) +
    row('pendingOk', log.pendingOk, log.pendingOk) +
    row('신규 자재', (log.newMats||[]).join(',')||'없음', (log.newMats||[]).length===0) +
    row('신규 공정', (log.newWorks||[]).join(',')||'없음', (log.newWorks||[]).length===0) +
    `<div style="height:4px"></div>` +
    row('저장 양산 행', log.savedYSCount, log.savedYSCount>0) +
    row('저장 연구 행', log.savedYRCount) +
    row('저장소 사용', 0, true) +
    row('세션 저장', (log.savedYSCount+log.savedYRCount), (log.savedYSCount+log.savedYRCount)>0) +
    row('KPI 일치', log.kpiMatch, log.kpiMatch) +
    `<div style="height:4px"></div>` +
    row('복원 양산 행', log.restoredYSCount, log.restoredYSCount>0) +
    row('복원 OK', log.restoredOk, log.restoredOk) +
    `<div style="height:4px"></div>` +
    `<div style="padding:5px 8px;border-radius:5px;background:${log.verdict==='통과'?'var(--grd)':log.verdict==='부분통과'?'var(--amd)':'var(--rdd)'};text-align:center;font-size:11px;font-weight:700;color:${log.verdict==='통과'?'var(--gr)':log.verdict==='부분통과'?'var(--am)':'var(--ts)'}">
      판정: ${log.verdict||'미수행'}
    </div>` +
    `<div style="margin-top:8px;font-size:10px;color:var(--tm);border-top:1px solid var(--bd);padding-top:6px">
      📋 v0.24 검수 체크<br>
      ${[
        ['업로드 가능',log.rawYCount>0],
        ['pending 생성',log.pendingOk],
        ['저장 완료',(log.savedYSCount + log.savedYRCount)>0],
        ['세션 저장',(log.savedYSCount + log.savedYRCount)>0],
        ['KPI 일치',log.kpiMatch],
        ['새로고침 복원',log.restoredOk],
      ].map(([l,v])=>`<span style="color:${v?'var(--gr)':'var(--rd)'}">${v?'✓':'✗'} ${l}</span>`).join(' ')}
    </div>`;
}

function toggleTestLogPanel(){
  const p = document.getElementById('dev-test-log-panel');
  if(!p) return;
  const isHidden = p.style.display==='none';
  p.style.display = isHidden ? 'block' : 'none';
  if(isHidden) _refreshTestLogPanel();
}

// ── localStorage 초기화 (v0.30 검수용) ──────────────────────────────────
function resetScheduleStorage(){
  // localStorage 삭제 — 모든 이전 버전/legacy 생산일정 저장소 제거
  // 핵심 원칙: 업로드 전 종합현황에는 어떤 잔여 데이터도 표시하지 않는다.
  Object.keys(localStorage)
    .filter(k => k.startsWith('odi_schedule_'))
    .forEach(k => localStorage.removeItem(k));
  // 메모리 초기화
  YANGSAN_DATA=[]; YEONJU_DATA=[]; WORK_DATA=[]; clearScheduleDataReady();
  PENDING_YANGSAN=null; PENDING_YEONJU=null;
  if(typeof lastSavedYangsan!=='undefined') lastSavedYangsan=[];
  if(typeof lastSavedYeonju !=='undefined') lastSavedYeonju=[];
  if(typeof undoStack!=='undefined') undoStack=[];
  if(typeof redoStack!=='undefined') redoStack=[];
  if(typeof isDirty!=='undefined') isDirty=false;
  // 검수 로그 전체 초기화 (v0.24)
  Object.assign(_schedTestLog, {
    fileName:'', sheetNames:[], autoRecognition:'미수행',
    ysSheet:'', yrSheet:'', headerRows:null, dataStartRow:null,
    rawYCount:0, rawRCount:0, errCount:0, newMats:[], newWorks:[],
    pendingOk:false, uploadErrors:[],
    savedYSCount:0, savedYRCount:0, savedWDCount:0,
    localStorageYSCount:0, localStorageYRCount:0,
    kpiYangsan:0, kpiYeonju:0, kpiDelay:0, kpiDone:0, kpiMatch:false,
    restoredYSCount:0, restoredYRCount:0, restoredOk:false,
    consoleErrors:[], verdict:'미수행'
  });
  console.log('[v0.52(FIXED 기반)] 잔여 데이터 초기화 완료 — 모든 odi_schedule_* key 삭제 / schedule storage disabled');
  // UI 초기화
  const pb = document.getElementById('pendingBar');       if(pb) pb.style.display='none';
  const ep = document.getElementById('rawErrPanel');      if(ep) ep.style.display='none';
  const sm = document.getElementById('sheet-mapping-ui'); if(sm) sm.style.display='none';
  const sb = document.getElementById('sched-save-btn');   if(sb) sb.disabled=true;
  const db = document.getElementById('sched-discard-btn');if(db) db.disabled=true;
  renderDashboardKPI();
  _updateSchedStatusPanel();
  if(typeof renderEditTable==='function') renderEditTable();
  showToast('초기화 완료 — 모든 검수 로그와 UI를 리셋했습니다', 'ok');
  _refreshTestLogPanel();
}



/* ========================================================================
 * TSL SERVER AUTHORITY PATCH v1
 * - 사용자 포털 생산일정 원래 업로드/저장 흐름을 서버 DB와 직접 연결한다.
 * - 외부 패널/관리자 테스트 업로드/강제 DOM 덮어쓰기 없이, 이 파일의 실제 let 변수에 직접 반영한다.
 * ======================================================================== */
(function(){
  'use strict';
  const TSL_API_BASE = 'https://api.techsyslab.com';
  const TSL_STATE = window.TSL_SERVER_AUTHORITY = window.TSL_SERVER_AUTHORITY || { scheduleRows:[], qualityRows:[], lastSync:null };
  function tslWarn(){ try{ console.warn.apply(console, ['[TSL_SERVER_AUTHORITY]'].concat([].slice.call(arguments))); }catch(_){} }
  function tslLog(){ try{ console.log.apply(console, ['[TSL_SERVER_AUTHORITY]'].concat([].slice.call(arguments))); }catch(_){} }
  function nrm(v){ return String(v == null ? '' : v).replace(/[^a-z0-9가-힣]+/gi,'').toLowerCase(); }
  function pick(obj, keys){
    obj = obj || {}; const map = {};
    Object.keys(obj).forEach(k=>{ map[nrm(k)] = obj[k]; });
    for(const key of keys){ const nk=nrm(key); if(Object.prototype.hasOwnProperty.call(map,nk) && map[nk]!=='' && map[nk]!=null) return String(map[nk]); }
    for(const k in obj){ const kk=nrm(k); for(const key of keys){ const want=nrm(key); if(want && kk.includes(want) && obj[k]!=='' && obj[k]!=null) return String(obj[k]); } }
    return '';
  }
  function dateOnly(v){ if(!v) return ''; const s=String(v); return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0,10) : s; }
  function rawOf(r){ return r && r.raw && typeof r.raw === 'object' ? r.raw : {}; }
  function toNativeSchedule(r, idx){
    const raw = rawOf(r);
    const row = {
      id: 930000 + idx,
      batch: pick(raw,['차수','구분','No','NO','번호','수주번호','오더','order_no','order','lot','job']) || r.order_no || String(idx+1),
      model: pick(raw,['모델명','모델','품명','제품명','장비명','item_name','item','part']) || r.item_name || '',
      machine: pick(raw,['호기','장비','설비','라인','line','cell','CELL','machine']) || r.line_name || '',
      note: pick(raw,['비고','메모','기타','note']) || '',
      type: pick(raw,['상태','진행상태','공정상태']) || r.status || '대기',
      _valid: true,
      _errs: []
    };
    const plan = r.plan_date || pick(raw,['계획일','생산일','일자','날짜','납기','출고','출하','해체']);
    if(plan){ row.chulgo = dateOnly(plan); row.planDate = dateOnly(plan); }
    row.jaje = dateOnly(pick(raw,['자재입고','자 재 입 고','부자재','부자재 입고','부자재입고','자재']));
    row.ybase = dateOnly(pick(raw,['YBASE','Y BASE','Y-BASE','와이베이스']));
    row.pod3 = dateOnly(pick(raw,['3POD','3 POD','3-POD']));
    row.wvpz = dateOnly(pick(raw,['WVPZ','WV/PZ','WV PZ']));
    row.elmo = dateOnly(pick(raw,['ELMO','엘모']));
    row.jungjiangStart = dateOnly(pick(raw,['전장/기구/배선 시작','전장기구배선시작','생산 시작','생산시작','작업 시작','작업시작','시작']));
    row.jungjiangEnd = dateOnly(pick(raw,['전장/기구/배선 종료','전장기구배선종료','생산 종료','생산종료','작업 종료','작업종료','종료']));
    row.testStart = dateOnly(pick(raw,['TEST 시작','TEST시작','테스트 시작','검사 시작']));
    row.testEnd = dateOnly(pick(raw,['TEST 종료','TEST종료','테스트 종료','검사 종료']));
    row.jeokjeungStart = dateOnly(pick(raw,['적층 시작','적층시작']));
    row.jeokjeungEnd = dateOnly(pick(raw,['적층 종료','적층종료']));
    row.chulgo = row.chulgo || dateOnly(pick(raw,['출고','출하','출고일','출하일']));
    row.haeje = dateOnly(pick(raw,['해체','해체일','분해']));
    return row;
  }
  function renderScheduleFromServer(reason){
    try{
      const rows = (TSL_STATE.scheduleRows || []).map(toNativeSchedule);
      if(!rows.length){ tslLog('schedule empty from server', reason); return; }
      YANGSAN_DATA = JSON.parse(JSON.stringify(rows));
      YEONJU_DATA = [];
      PENDING_YANGSAN = null;
      PENDING_YEONJU = null;
      WORK_DATA = JSON.parse(JSON.stringify(rows));
      YANGSAN_IDS = new Set(YANGSAN_DATA.map(r=>r.id));
      YEONJU_IDS = new Set();
      SCHEDULE_LAST_SAVED_AT = new Date().toISOString();
      markScheduleDataReady();
      try{ syncWorkData(); }catch(e){}
      try{ commitSavedSnapshot(); }catch(e){}
      try{ populateEditFilters(); }catch(e){}
      try{ renderEditTable(); }catch(e){}
      try{ populateGvFilters(); }catch(e){}
      try{ renderCurrentView(); }catch(e){}
      try{ renderDashboardKPI(); }catch(e){}
      try{ renderDashboardSummaryNotes(); }catch(e){}
      try{ renderUserProdOverviewPage(); }catch(e){}
      try{ renderUserProdHeadcountPage(); }catch(e){}
      try{ renderUserProdProcessPage(); }catch(e){}
      try{ _updateSchedStatusPanel(); }catch(e){}
      try{ updateCards(); }catch(e){}
      const hint=document.getElementById('data-upload-hint');
      if(hint) hint.textContent = '서버 DB 기준으로 동기화됨 · 생산일정 '+YANGSAN_DATA.length+'행';
      const badge=document.getElementById('data-save-status');
      if(badge){ badge.textContent='서버 DB 동기화'; badge.className='badge-pill b-ok'; }
      tslLog('schedule applied', reason, YANGSAN_DATA.length);
    }catch(e){ tslWarn('renderScheduleFromServer failed', e); }
  }
  async function loadScheduleFromServer(reason){
    try{
      const res = await fetch(TSL_API_BASE + '/api/schedule?limit=5000', { cache:'no-store', credentials:'omit' });
      if(!res.ok) throw new Error('schedule HTTP '+res.status);
      const data = await res.json();
      TSL_STATE.scheduleRows = Array.isArray(data.rows) ? data.rows : [];
      TSL_STATE.lastSync = new Date().toISOString();
      renderScheduleFromServer(reason || 'load');
    }catch(e){ tslWarn('schedule server load failed', e && e.message ? e.message : e); }
  }
  window.__TSL_uploadScheduleAfterNativeSave = async function(){
    const file = window.__TSL_LAST_SCHEDULE_FILE;
    if(!file) { loadScheduleFromServer('save-without-file'); return; }
    const fd = new FormData();
    fd.append('file', file, file.name || 'schedule.xlsx');
    fd.append('uploaded_by', 'user-portal-schedule');
    try{
      const res = await fetch(TSL_API_BASE + '/api/public/upload/schedule', { method:'POST', body:fd, credentials:'omit', cache:'no-store' });
      if(!res.ok){ const t=await res.text(); throw new Error('HTTP '+res.status+' '+t.slice(0,240)); }
      const data = await res.json();
      window.__TSL_LAST_SCHEDULE_FILE = null;
      if(typeof showToast === 'function') showToast('생산일정 서버 저장 완료 — '+(data.insertedCount||data.rowCount||'')+'행', 'ok');
      await loadScheduleFromServer('after-schedule-upload');
    }catch(e){
      if(typeof showErr === 'function') showErr('생산일정 서버 저장 실패: '+(e && e.message ? e.message : e));
      tslWarn('schedule upload failed', e);
    }
  };
  const _tslOrigNav = typeof nav === 'function' ? nav : null;
  if(_tslOrigNav){
    nav = function(k){ const ret = _tslOrigNav.apply(this, arguments); setTimeout(()=>loadScheduleFromServer('nav-'+k), 300); setTimeout(()=>renderScheduleFromServer('nav-render-'+k), 1000); return ret; };
    window.nav = nav;
  }
  window.TSL_loadScheduleFromServer = loadScheduleFromServer;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(()=>loadScheduleFromServer('boot'), 600));
  else setTimeout(()=>loadScheduleFromServer('boot'), 600);
  window.addEventListener('focus', ()=>setTimeout(()=>loadScheduleFromServer('focus'), 300));
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) setTimeout(()=>loadScheduleFromServer('visible'), 300); });
})();
