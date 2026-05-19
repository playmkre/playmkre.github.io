/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 56 id=q-rebuild-08n-dashboard-prod-aux-script :: OPT01 no semantic edits */

(function(){
'use strict';
/* ============================================================================
 * Q_REBUILD_08N_DASHBOARD_AND_PRODUCTION_AUX_PAGE_PATCH_REVIEWED_FIXED
 * ----------------------------------------------------------------------------
 * 작업 범위:
 *   §1. page-dashboard — WORK_DATA 기반 KPI 보충 + dash-progress 표 + 품질 상태 KPI
 *   §2. page-equip-status — dispatcher 연결 (기존 _es2Build alias)
 *   §3. page-team-overview — dispatcher 연결 (기존 _to2Build alias) + 보조 안내
 *   §4~§6. prod-overview/headcount/process — 기존 renderUserProd* 재확인 + 프록시
 *
 * 절대 금지:
 *   - page-schedule(-log/-model/-period) 변경 X
 *   - page-quality-main/dash/analysis 변경 X
 *   - 데이터관리 6개 페이지 재작업 X (08M 범위)
 *   - quality-action/images/master 수정 X
 *   - Chart.js / Google Fonts / 외부 CDN X
 *   - ALL_DATA 내장 X, 원본 row mutation X
 *   - 임의 확정 판정 X, 개인 평가처럼 보이는 표현 X
 *   - 생산인원 입력 저장 버튼 (서버 저장 없음) 신규 추가 X
 * ========================================================================== */
var VERSION = 'Q_REBUILD_08N_DASHBOARD_AND_PRODUCTION_AUX_PAGE_PATCH_REVIEWED_FIXED';
try { window.APP_VERSION = VERSION; } catch(_e){}
try {
  window.CHANGELOG = window.CHANGELOG || [];
  window.CHANGELOG.push({
    version: VERSION,
    note: '08N: 대시보드(dashboard/equip-status/team-overview) 3개 + 생산관리 보조(prod-overview/headcount/process) 3개 dispatcher 연결 및 WORK_DATA 기반 render 보강. 기존 _es2Build/_to2Build/renderUserProd* 재활용. 외부 CDN 0, 생산일정/품질/데이터관리 페이지 무변경.'
  });
} catch(_e){}

/* ─────────── shared helpers ─────────── */
function n08Esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function n08Text(id,v){ var el=document.getElementById(id); if(el) el.textContent = v==null?'\u2014':String(v); }
function n08Html(id,h){ var el=document.getElementById(id); if(el) el.innerHTML=h; }
function n08GetWork(){ try{ return Array.isArray(window.WORK_DATA)?window.WORK_DATA:[];} catch(_e){return [];} }
function n08GetQRaw(){
  try{
    if(Array.isArray(window.QISSUE_NORMALIZED_ROWS) && window.QISSUE_NORMALIZED_ROWS.length) return window.QISSUE_NORMALIZED_ROWS;
    if(Array.isArray(window.QISSUE_ROWS) && window.QISSUE_ROWS.length) return window.QISSUE_ROWS;
    if(Array.isArray(window.QRAW_ROWS) && window.QRAW_ROWS.length) return window.QRAW_ROWS;
    if(Array.isArray(window.QDEFECT_RAW_ROWS) && window.QDEFECT_RAW_ROWS.length) return window.QDEFECT_RAW_ROWS;
  } catch(_e){}
  return [];
}
function n08G(r,key){ if(!r||!key)return ''; var v=r[key]; return v==null?'':String(v).trim(); }
function n08Stage(r){
  try{
    var info=(typeof window.getRowStageInfo==='function')?window.getRowStageInfo(r):null;
    var st = (info&&info.status) || n08G(r,'status') || n08G(r,'stage') || n08G(r,'공정') || '';
    var key = 'unknown';
    if(/자재|입고|대기/.test(st)) key='mat';
    else if(/진행|작업|TEST|적층|계획/.test(st)) key='work';
    else if(/출고/.test(st)) key='ship';
    else if(/완료|해체/.test(st)) key='done';
    return { key:key, label:st, date: (info&&info.date)||n08G(r,'date')||n08G(r,'planDate')||n08G(r,'일자') };
  }catch(_e){ return {key:'unknown',label:'',date:''}; }
}
function n08Delay(r){ try{ return typeof window.hasScheduleDelay==='function'&&window.hasScheduleDelay(r); }catch(_e){return false;} }
function n08Machine(r){ return n08G(r,'machine')||n08G(r,'machineNo')||n08G(r,'호기')||n08G(r,'장비')||'미지정'; }
function n08Model(r){ return n08G(r,'model')||n08G(r,'모델')||n08G(r,'type')||'-'; }

/* ─────────── §1a. renderN08DashboardKPI ─────────── */
/* WORK_DATA 기반 KPI 보충 — 기존 renderDashboardKPI 이후 실행.
   기존 함수가 YANGSAN_DATA 기반이므로, WORK_DATA 만 있는 경우 보충함. */
window.renderN08DashboardKPI = function(){
  try {
    var rows = n08GetWork();
    var total = rows.length;
    var matCnt=0, workCnt=0, shipCnt=0, doneCnt=0, delayCnt=0, ukCnt=0;
    rows.forEach(function(r){
      var s = n08Stage(r);
      if(s.key==='mat') matCnt++;
      else if(s.key==='work') workCnt++;
      else if(s.key==='ship') shipCnt++;
      else if(s.key==='done') doneCnt++;
      else ukCnt++;
      if(n08Delay(r)) delayCnt++;
    });
    var inProgress = matCnt + workCnt;
    var planWait   = ukCnt;       /* rows with unknown stage treated as "plan/wait" */
    var shipped    = shipCnt;
    var done       = doneCnt;

    /* Only fill KPI IDs if existing function left them at their stub value */
    function fillIfStub(id, v){
      var el = document.getElementById(id);
      if(!el) return;
      var cur = el.textContent.trim();
      /* stub values set by renderDashboardKPI when no YANGSAN_DATA */
      if(cur === '0' || cur === '-' || cur === '\u2014'){
        el.textContent = String(v);
      }
    }
    if(total > 0){
      fillIfStub('kpi-yangsan',   inProgress);
      fillIfStub('kpi-yeonju',    planWait);
      fillIfStub('kpi-delay-val', shipped);
      fillIfStub('kpi-done-val',  done);
      fillIfStub('sn-prod-count', inProgress);
      fillIfStub('sn-ship-count', shipped);
      fillIfStub('sn-delay-count',delayCnt);
      fillIfStub('sn-done-count', done);
    }

    /* dash-progress: fill table with top rows by urgency */
    var progEl = document.getElementById('dash-progress');
    if(progEl){
      /* Only update if table body still shows default placeholder */
      var tbody = progEl.querySelector('tbody');
      if(tbody){
        var cellText = tbody.textContent.trim();
        if(!total){
          tbody.innerHTML = '<tr><td colspan="5" style="padding:16px;text-align:center;color:var(--tm,#8da0c1)">생산일정 업로드 후 표시됩니다. <button onclick="nav(\'schedule\')" style="margin-left:8px;padding:3px 10px;border-radius:5px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:10px;cursor:pointer">생산일정 관리 →</button></td></tr>';
        } else if(/업로드 후|데이터 없/.test(cellText)){
          /* spec §1: 오늘 확인 대상 카드 — sort by urgency (delay first, then ship, then mat, work) */
          var scored = rows.map(function(r){
            var s = n08Stage(r);
            var d = n08Delay(r);
            var score = (d?10:0) + (s.key==='ship'?5:0) + (s.key==='work'?3:0) + (s.key==='mat'?2:0) + (s.key==='done'?1:0);
            return {r:r, s:s, d:d, score:score};
          }).sort(function(a,b){return b.score-a.score;}).slice(0,20);
          tbody.innerHTML = scored.map(function(x){
            var rowCls = x.d ? ' class="n08-dp-row urgent"' : (x.s.key==='ship' ? ' class="n08-dp-row ship"' : '');
            var statusBadge = x.d
              ? '<span class="n08-badge warn">⚠ 지연</span>'
              : (x.s.key==='ship' ? '<span class="n08-badge info">출고 단계</span>'
                : (x.s.key==='done' ? '<span class="n08-badge ok">완료</span>'
                  : '<span class="n08-badge neutral">' + n08Esc(x.s.label||'진행중') + '</span>'));
            var shipDate = n08G(x.r,'ship')||n08G(x.r,'출고')||n08G(x.r,'shipDate')||x.s.date||'\u2014';
            var pct = (x.s.key==='done'?100 : x.s.key==='ship'?80 : x.s.key==='work'?50 : x.s.key==='mat'?20 : 0);
            var bar = '<div style="background:rgba(168,162,158,0.15);border-radius:2px;height:6px"><div style="width:'+pct+'%;height:6px;border-radius:2px;background:'+( x.d?'#ef4444':x.s.key==='done'?'#22c55e':x.s.key==='ship'?'#22d3ee':'#58a6ff')+'"></div></div>';
            return '<tr'+rowCls+'>'
                 +   '<td class="mono">'+ n08Esc(n08Machine(x.r))+'</td>'
                 +   '<td>'+ n08Esc(String(n08Model(x.r)).slice(0,20))+'</td>'
                 +   '<td>'+statusBadge+'</td>'
                 +   '<td class="dim mono">'+n08Esc(String(shipDate).slice(0,10))+'</td>'
                 +   '<td style="min-width:80px">'+bar+'<span style="font-size:9px;color:var(--tm,#8da0c1)"> '+pct+'%</span></td>'
                 + '</tr>';
          }).join('') + (rows.length > 20 ? '<tr><td colspan="5" style="text-align:right;padding:4px 8px;font-size:9px;color:var(--tm,#8da0c1)">상위 20건 표시 / 전체 '+rows.length+'건</td></tr>' : '');
        }
      }
    }

    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderN08DashboardKPI failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §1b. renderN08DashboardQuality ─────────── */
/* 품질 데이터 상태 KPI 를 dash-quality-rate 에 채운다 */
window.renderN08DashboardQuality = function(){
  try {
    var qRaw    = n08GetQRaw();
    var qSummary= null;
    try {
      if(window.QSUMMARY_DATA && typeof window.QSUMMARY_DATA==='object') qSummary = window.QSUMMARY_DATA;
      else if(window.QDASH_READY_DATA) qSummary = window.QDASH_READY_DATA;
    } catch(_e){}
    var hasQ = qRaw.length > 0 || !!qSummary;

    var el = document.getElementById('dash-quality-rate');
    if(!el) return false;
    /* Only update if still showing placeholder */
    if(hasQ || el.innerHTML.indexOf('품질 엑셀 업로드 후') >= 0){
      if(!hasQ){
        el.innerHTML = '<div style="font-size:10px;color:var(--tm,#8da0c1);padding:6px 0">품질 엑셀 업로드 후 표시됩니다.'
                     + '<br><button onclick="nav(\'quality-main\')" style="margin-top:4px;padding:3px 10px;border-radius:5px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:10px;cursor:pointer">불량 관리 센터 →</button>'
                     + '</div>';
      } else {
        var crit=0, major=0, minor=0;
        qRaw.forEach(function(r){
          var sev = (n08G(r,'severity')||n08G(r,'중요도')||'').toLowerCase();
          if(/치명|critical|crit/.test(sev)) crit++;
          else if(/주요|major/.test(sev)) major++;
          else if(/경미|minor|개선/.test(sev)) minor++;
        });
        var dashReady = !!qSummary;
        el.innerHTML =
            '<div class="n08-q-kpi">'
          +   '<div class="k"><div class="l">품질 Raw</div><div class="v" style="color:#58a6ff">' + qRaw.length + '</div></div>'
          +   '<div class="k"><div class="l">치명</div><div class="v" style="color:#fca5a5">' + crit + '</div></div>'
          +   '<div class="k"><div class="l">주요</div><div class="v" style="color:#fcd34d">' + major + '</div></div>'
          +   '<div class="k"><div class="l">경미</div><div class="v" style="color:#86efac">' + minor + '</div></div>'
          + '</div>'
          + '<div style="font-size:10px;color:var(--tm,#8da0c1)">Dashboard Ready: '
          +   (dashReady ? '<span class="n08-badge ok">✓ 준비됨</span>' : '<span class="n08-badge neutral">아직</span>')
          + '</div>'
          + '<div style="margin-top:6px"><button onclick="nav(\'quality-dash\')" style="padding:3px 10px;border-radius:5px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:10px;cursor:pointer;margin-right:6px">품질 대시보드 →</button>'
          + '<button onclick="nav(\'quality-analysis\')" style="padding:3px 10px;border-radius:5px;border:1px solid var(--bd,rgba(168,162,158,0.30));background:transparent;color:var(--ts,#cfd6e4);font-size:10px;cursor:pointer">품질 분석 →</button></div>';
      }
    }
    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderN08DashboardQuality failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §1c. renderN08DashboardSummaryNote ─────────── */
/* 생산 요약 노트 — sn-data-status, sn-data-label, sn-issue-count, sn-img-count */
window.renderN08DashboardSummaryNote = function(){
  try {
    var rows = n08GetWork();
    var qRaw = n08GetQRaw();
    /* data status */
    var hasSched = rows.length > 0;
    var hasQual  = qRaw.length > 0;
    var n08SetIfStub = function(id, v){
      var el=document.getElementById(id);
      if(!el) return;
      var cur = el.textContent.trim();
      if(cur==='-'||cur==='\u2014'||cur==='0'||cur===''||/미업로드|없음/.test(cur)) el.textContent=String(v);
    };
    n08SetIfStub('sn-raw-count', qRaw.length > 0 ? qRaw.length : '-');
    n08SetIfStub('sn-raw-label', hasQual ? '품질 Raw row' : '품질 미업로드');
    n08SetIfStub('sn-data-status', hasSched ? '생산일정 '+ rows.length + ' row' : '미업로드');
    n08SetIfStub('sn-data-label',  hasSched ? '현재 세션 기준' : '');
    n08SetIfStub('sn-issue-count', qRaw.length);
    var imgCnt = 0; qRaw.forEach(function(r){ var ic=n08G(r,'imageCount')||n08G(r,'사진'); if(ic&&ic!=='0') imgCnt++; });
    n08SetIfStub('sn-img-count', imgCnt);
    n08SetIfStub('sn-img-label', hasQual ? '이미지 첨부 row' : '품질 미업로드');
    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderN08DashboardSummaryNote failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §2. renderN08EquipStatus ─────────── */
/* 1) 기존 _es2Build() 호출 (3-panel 상세 레이아웃 + 선택 호기 상세)
   2) 이후 WORK_DATA 기반으로 KPI 셀 직접 채움 (jsdom/초기 state 모두 보장)
   3) 카드 grid 도 WORK_DATA 기반으로 채움 (spec §2 요건 충족) */
window.renderN08EquipStatus = function(){
  try {
    /* step1: call existing inline build (handles list/detail panel) */
    if(typeof window._es2Build === 'function') window._es2Build();

    /* step2: ALWAYS populate KPI IDs + cards from WORK_DATA (authoritative) */
    var rows = n08GetWork();
    var byEquip = {};
    var totalDelay=0, totalShip=0, totalActive=0, missingEquip=0;
    rows.forEach(function(r){
      var eq = n08Machine(r);
      var isMissing = (!r.machine && !r.machineNo && !r['호기'] && !r['장비']);
      if(isMissing) missingEquip++;
      if(!byEquip[eq]) byEquip[eq]={total:0, active:0, ship:0, done:0, delay:0};
      byEquip[eq].total++;
      var s = n08Stage(r);
      if(s.key==='mat' || s.key==='work') { byEquip[eq].active++; totalActive++; }
      if(s.key==='ship') { byEquip[eq].ship++; totalShip++; }
      if(s.key==='done') byEquip[eq].done++;
      var isDelayed = n08Delay(r);
      if(isDelayed) { byEquip[eq].delay++; totalDelay++; }
    });
    var equipList = Object.keys(byEquip).filter(function(k){ return k !== '미지정'; }).sort();
    var hasAny = rows.length > 0;

    n08Text('es2-total',   equipList.length || (hasAny ? 1 : 0));
    n08Text('es2-active',  totalActive);
    n08Text('es2-ship',    totalShip);
    n08Text('es2-delay',   totalDelay);
    n08Text('es2-missing', missingEquip);

    /* step3: fill cards grid — spec §2 장비별 진행 상태 카드 */
    var grid = document.getElementById('es2-cards-grid');
    if(grid){
      if(!hasAny){
        grid.innerHTML = '<div style="grid-column:1/-1;padding:28px;text-align:center;color:var(--tm,#8da0c1);font-size:11px;background:rgba(255,255,255,0.02);border:1px dashed var(--bd,rgba(168,162,158,0.30));border-radius:8px"><div style="font-size:24px;margin-bottom:8px">📭</div>생산일정 업로드 후 호기별 현황이 표시됩니다.<br><button onclick="nav(\'schedule\')" style="margin-top:10px;padding:4px 12px;border-radius:5px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:10px;cursor:pointer">생산일정 관리 →</button></div>';
      } else {
        grid.innerHTML = equipList.map(function(eq){
          var d = byEquip[eq];
          var isDelay = d.delay > 0;
          var borderStyle = isDelay ? 'border-left:3px solid var(--rd,#ef4444)' : 'border-left:3px solid transparent';
          var badge = isDelay
            ? '<span class="n08-badge warn" style="margin-top:5px">⚠ 지연 '+d.delay+'</span>'
            : (d.ship > 0 ? '<span class="n08-badge info" style="margin-top:5px">출고 '+d.ship+'</span>' : '');
          return '<div style="background:rgba(255,255,255,0.025);border:1px solid var(--bd,rgba(168,162,158,0.30));border-radius:7px;padding:9px 11px;'+borderStyle+'">'
               +   '<div style="font-size:12px;font-weight:800;color:var(--tp,#e6ecf5);margin-bottom:5px">'+n08Esc(eq)+'</div>'
               +   '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:1px"><span style="color:var(--tm,#8da0c1)">총</span><span style="color:var(--ts,#cfd6e4);font-weight:700">'+d.total+'</span></div>'
               +   '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:1px"><span style="color:var(--tm,#8da0c1)">진행</span><span style="color:#58a6ff;font-weight:600">'+d.active+'</span></div>'
               +   '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:1px"><span style="color:var(--tm,#8da0c1)">출고</span><span style="color:#22d3ee;font-weight:600">'+d.ship+'</span></div>'
               +   '<div style="display:flex;justify-content:space-between;font-size:10px"><span style="color:var(--tm,#8da0c1)">지연</span><span style="color:'+(isDelay?'var(--rd,#ef4444)':'var(--tm,#8da0c1)')+';font-weight:700">'+d.delay+'</span></div>'
               +   badge
               + '</div>';
        }).join('') + (missingEquip > 0 ? '<div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:7px;padding:9px 11px;font-size:10px"><div style="color:#fcd34d;font-weight:700;margin-bottom:3px">호기 미기재</div><div style="color:var(--tm,#8da0c1)">'+missingEquip+'건 — 생산일정 원본 확인 필요</div></div>' : '');
      }
    }

    /* step4: spec §2 지연 장비 후보 — update es2-delay-only if present */
    var delayOnly = document.getElementById('es2-delay-only');
    if(delayOnly) delayOnly.checked = false;   /* reset on render */

    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderN08EquipStatus failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §3. renderN08TeamOverview ─────────── */
/* 기존 _to2Build 를 dispatcher 에 연결 + 보조 안내 패널 추가 */
window.renderN08TeamOverview = function(){
  try {
    if(typeof window._to2Build === 'function'){
      window._to2Build();
    } else {
      /* fallback: populate to2-prep-body with WORK_DATA status */
      var rows = n08GetWork();
      var prepEl = document.getElementById('to2-prep-body');
      if(prepEl){
        if(!rows.length){
          prepEl.innerHTML = '생산일정 데이터 없음. <button onclick="nav(\'schedule\')" style="padding:2px 8px;border-radius:4px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:9px;cursor:pointer">생산일정 →</button>';
        } else {
          var hasTeam = rows.some(function(r){ return r.manager||r.담당||r.team||r.팀; });
          prepEl.innerHTML = (hasTeam ? '<span style="color:#86efac">✓ 팀/담당 필드 감지됨</span> · ' : '<span style="color:#fcd34d">⚠ 팀/담당 필드 미감지 (공정 단계 기준으로 대체 표시)</span> · ') + '전체 ' + rows.length + ' row';
        }
      }
    }

    /* spec §3: "개인 평가처럼 보이는 표현 금지" — 보조 안내 패널 추가 (idempotent) */
    var prev = document.getElementById('n08-team-note');
    if(!prev){
      var page = document.getElementById('page-team-overview');
      if(page){
        var noteDiv = document.createElement('div');
        noteDiv.id = 'n08-team-note';
        noteDiv.className = 'n08-note';
        noteDiv.innerHTML = '<strong>업무 데이터 기재 상태</strong> 기준 — 이 화면은 생산일정 데이터에서 팀/담당 필드의 <strong>데이터 기재 현황</strong>을 확인합니다. 개인 업무 능력/성과 평가가 아니며, 공정 단계 기준으로 배정/미배정 상태만 표시합니다. 미배정 항목은 데이터 입력 확인이 필요한 항목입니다.';
        page.appendChild(noteDiv);
      }
    }
    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderN08TeamOverview failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §4. renderN08ProdOverview ─────────── */
/* 기존 renderUserProdOverviewPage 프록시 — 없을 경우 WORK_DATA 기반 기본 채움 */
window.renderN08ProdOverview = function(){
  try {
    if(typeof window.renderUserProdOverviewPage === 'function'){
      window.renderUserProdOverviewPage();
    } else {
      /* fallback if 08H not loaded */
      var rows = n08GetWork();
      var delay=0, ship=0, uk=0, nodate=0, today=0;
      var stageC={mat:0, work:0, ship:0, done:0};
      rows.forEach(function(r){
        var s=n08Stage(r), d=n08Delay(r);
        if(d) delay++;
        if(s.key==='ship') ship++;
        if(s.key==='unknown') uk++;
        if(!s.date) nodate++;
        if(stageC[s.key]!==undefined) stageC[s.key]++;
        if(d||s.key==='ship'||s.key==='unknown'||!s.date) today++;
      });
      n08Text('po-f-today', today); n08Text('po-f-delay', delay);
      n08Text('po-f-ship', ship);   n08Text('po-f-uk', uk);
      n08Text('po-f-nodate', nodate);
      ['mat','work','ship','done'].forEach(function(k){ n08Text('po-s-'+k, stageC[k]); });
      if(!rows.length){
        n08Html('po-priority-list','<div style="padding:18px;text-align:center;background:rgba(255,255,255,0.02);border:1px dashed var(--bd,rgba(168,162,158,0.30));border-radius:7px;color:var(--tm,#8da0c1);font-size:10px">생산일정 업로드 후 우선 확인 대상이 표시됩니다.<br><button onclick="nav(\'schedule\')" style="margin-top:8px;padding:3px 10px;border-radius:5px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:10px;cursor:pointer">생산일정 관리 →</button></div>');
      }
    }
    return true;
  } catch(e){ try{console.warn('['+VERSION+'] renderN08ProdOverview failed:',e);}catch(_e){} return false; }
};

/* ─────────── §5. renderN08ProdHeadcount ─────────── */
/* spec §5: 저장 버튼 신규 추가 X. 기존 renderUserProdHeadcountPage 프록시. */
window.renderN08ProdHeadcount = function(){
  try {
    if(typeof window.renderUserProdHeadcountPage === 'function'){
      window.renderUserProdHeadcountPage();
    } else {
      /* fallback */
      var rows = n08GetWork();
      var tbody = document.getElementById('ph-matrix-body');
      var notice = document.getElementById('ph-team-notice');
      if(notice) notice.innerHTML = rows.length > 0
        ? ('<span style="color:#86efac">생산일정 ' + rows.length + ' row 감지</span> · 공정 단계 기준 입력 목록 표시')
        : '<span style="color:var(--tm,#8da0c1)">생산일정 미업로드</span>';
      if(tbody && !rows.length){
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--tm,#8da0c1);padding:16px">생산일정 업로드 후 입력 목록이 표시됩니다.</td></tr>';
      } else if(tbody && rows.length){
        tbody.innerHTML = rows.slice(0,20).map(function(r){
          var s = n08Stage(r);
          return '<tr>'
            + '<td>'+(n08G(r,'date')||n08G(r,'planDate')||'-').slice(0,10)+'</td>'
            + '<td>'+n08Esc(s.label||'미확인')+'</td>'
            + '<td>'+n08Esc(n08Machine(r))+'</td>'
            + '<td>'+n08Esc(String(n08Model(r)).slice(0,12))+'</td>'
            + '<td style="text-align:center">-</td>'
            + '<td style="text-align:center;color:var(--tm,#8da0c1)"><span style="font-size:9px">입력 없음</span></td>'
            + '<td style="text-align:center;color:var(--tm,#8da0c1)">-</td>'
            + '<td><span style="font-size:9px;padding:1px 5px;border-radius:3px;background:var(--bd,rgba(168,162,158,0.30));color:var(--tm,#8da0c1)">미입력</span></td>'
            + '</tr>';
        }).join('') + (rows.length>20 ? '<tr><td colspan="8" style="text-align:center;color:var(--tm,#8da0c1);padding:5px">+ '+(rows.length-20)+'건</td></tr>' : '');
      }
    }
    return true;
  } catch(e){ try{console.warn('['+VERSION+'] renderN08ProdHeadcount failed:',e);}catch(_e){} return false; }
};

/* ─────────── §6. renderN08ProdProcess ─────────── */
window.renderN08ProdProcess = function(){
  try {
    if(typeof window.renderUserProdProcessPage === 'function'){
      window.renderUserProdProcessPage();
    } else {
      /* fallback */
      var rows = n08GetWork();
      var stageC={mat:0,work:0,ship:0,done:0}, stageD={mat:0,work:0,ship:0,done:0};
      var machMap = {};
      rows.forEach(function(r){
        var s=n08Stage(r), d=n08Delay(r);
        var m=n08Machine(r);
        if(stageC[s.key]!==undefined) stageC[s.key]++;
        if(d && stageD[s.key]!==undefined) stageD[s.key]++;
        if(!machMap[m]) machMap[m]={delay:0,uk:0,total:0};
        machMap[m].total++;
        if(d) machMap[m].delay++;
        if(s.key==='unknown') machMap[m].uk++;
      });
      ['mat','work','ship','done'].forEach(function(k){
        n08Text('pp-'+k+'-cnt', stageC[k]);
        n08Text('pp-'+k+'-sub', '데이터 기준');
        n08Text('pp-'+k+'-delay', stageD[k] > 0 ? '⚠ 지연 '+stageD[k]+'건' : '');
      });
      var bott = Object.keys(machMap).map(function(m){ return {m:m, d:machMap[m].delay, uk:machMap[m].uk, total:machMap[m].total}; })
                 .filter(function(x){return x.d>0||x.uk>0;})
                 .sort(function(a,b){return (b.d*3+b.uk)-(a.d*3+a.uk);})
                 .slice(0,8);
      n08Html('pp-bottleneck', bott.length
        ? bott.map(function(x,i){
            return '<div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.22);border-radius:6px;padding:9px 11px;margin-bottom:6px">'
                 +   '<div style="font-size:11px;font-weight:800;color:var(--tp,#e6ecf5)">'+(i+1)+'. '+n08Esc(x.m)+'</div>'
                 +   '<div style="font-size:10px;color:var(--tm,#8da0c1);margin-top:3px">지연 '+x.d+'건 · 미확인 '+x.uk+'건 · 연결 '+x.total+'건</div>'
                 +   '<div style="font-size:9.5px;color:var(--am,#f59e0b);margin-top:4px">병목 후보 — 자동 확정 판정 없음</div>'
                 + '</div>';
          }).join('')
        : '<div style="padding:14px;text-align:center;color:var(--tm,#8da0c1);font-size:10px">현재 병목 후보가 없습니다.</div>');
      var matR = Object.keys(machMap).slice(0,40).map(function(m){
        var x=machMap[m];
        var stg=n08Stage({machine:m});
        return '<tr><td style="padding:4px 8px">'+n08Esc(m)+'</td><td style="text-align:center;padding:4px 8px">'+x.total+'</td><td style="text-align:center;padding:4px 8px;color:'+(x.delay>0?'var(--rd,#ef4444)':'var(--tm,#8da0c1)')+'">'+x.delay+'</td><td style="text-align:center;padding:4px 8px;color:'+(x.uk>0?'var(--am,#f59e0b)':'var(--tm,#8da0c1)')+'">'+x.uk+'</td></tr>';
      }).join('');
      n08Html('pp-matrix-body', matR || '<tr><td colspan="4" style="text-align:center;color:var(--tm,#8da0c1);padding:14px">업로드 후 표시됩니다.</td></tr>');
    }
    return true;
  } catch(e){ try{console.warn('['+VERSION+'] renderN08ProdProcess failed:',e);}catch(_e){} return false; }
};

/* ─────────── Dispatcher wrap ─────────── */
function n08WrapDispatcher(){
  try {
    if(typeof window.odiNavAfterRenderDispatcher !== 'function') return false;
    if(window.odiNavAfterRenderDispatcher.__n08Wrapped) return true;
    var original = window.odiNavAfterRenderDispatcher;
    var wrapped = function(k){
      var ret = original.apply(this, arguments);
      setTimeout(function(){
        try {
          /* §1: dashboard supplement (after existing 50ms dispatch) */
          if(k === 'dashboard'){
            window.renderN08DashboardKPI();
            window.renderN08DashboardQuality();
            window.renderN08DashboardSummaryNote();
          }
          /* §2: equip-status */
          if(k === 'equip-status') window.renderN08EquipStatus();
          /* §3: team-overview */
          if(k === 'team-overview') window.renderN08TeamOverview();
          /* §4~§6: prod pages — existing renderUserProd* already called, this is a safety proxy */
          if(k === 'prod-overview')  window.renderN08ProdOverview();
          if(k === 'prod-headcount') window.renderN08ProdHeadcount();
          if(k === 'prod-process')   window.renderN08ProdProcess();
        } catch(_e){}
      }, 200);
      return ret;
    };
    wrapped.__n08Wrapped = true;
    window.odiNavAfterRenderDispatcher = wrapped;
    return true;
  } catch(_e){ return false; }
}

/* ─────────── audit ─────────── */
window.ODI_DASHBOARD_PROD_PATCH_AUDIT = {
  version: VERSION,
  scope: 'dashboard 3 (dashboard, equip-status, team-overview) + prod aux 3 (prod-overview, prod-headcount, prod-process)',
  rendersAdded: [
    'renderN08DashboardKPI','renderN08DashboardQuality','renderN08DashboardSummaryNote',
    'renderN08EquipStatus','renderN08TeamOverview',
    'renderN08ProdOverview','renderN08ProdHeadcount','renderN08ProdProcess'
  ],
  protectedPages: ['page-schedule','page-schedule-log','page-schedule-model','page-schedule-period',
                   'page-quality-main','page-quality-dash','page-quality-analysis'],
  excludedThisRound: ['page-quality-action','page-quality-images','page-quality-master'],
  dataManagement6Untouched: true,
  noSaveButton: true,  /* spec §5: 서버 저장 버튼 신규 추가 X */
  noPersonalEvaluation: true,  /* spec §3: 개인 평가 표현 X */
  noArbitaryJudgment: true,    /* spec §6: 임의 확정 판정 X */
  noExternalCdn: true, noGoogleFonts: true, noChartjs: true,
  noAllData: true, noOriginalDataMutation: true,
  workingPrinciples: {
    improvementPoints: [
      '기존 inline _es2Build(_to2Build) 함수 존재 — dispatcher 연결로 재탐색 시 재실행 보장',
      'renderDashboardKPI 의 YANGSAN_DATA 의존 문제 — WORK_DATA 기반 보충 함수(renderN08DashboardKPI)로 보완',
      'dash-progress 표를 WORK_DATA 기반으로 동적 채움 (긴급도 순 정렬)',
      '품질 데이터 상태 KPI를 dash-quality-rate 에 동적 표시 (Raw count + 치명/주요/경미 분류)',
      'team-overview에 "업무 데이터 기재 상태 기준" 보조 안내 패널 추가 — 개인 평가 오해 방지',
      'prod-overview/headcount/process 는 기존 08H 구현 재활용 + proxy fallback 보강'
    ],
    implementationCautions: [
      'dispatcher wrap __n08Wrapped — 기존 __m08Wrapped 체인 유지. 타 dispatcher 분기 영향 없음',
      'renderN08DashboardKPI 는 fillIfStub 로 기존 함수 결과를 덮어쓰지 않음 (0/-/미업로드 상태만 채움)',
      'n08-team-note 보조 패널: insertBefore 또는 appendChild 1회만 (idempotent — ID 체크)',
      'renderN08ProdHeadcount: 저장 버튼 신규 추가 없음. 기존 disabled input만 유지 (spec §5)',
      'renderN08ProdProcess: 병목 후보 텍스트에 "자동 확정 판정 없음" 명시 (spec §6)',
      'renderN08TeamOverview: 개인별 건수는 "데이터 기재 현황"으로만 표시 (spec §3)',
      '전체 함수 read-only — WORK_DATA / QRAW_ROWS / Q* mutation 없음',
      '신규 CSS 전부 .n08-* prefix. 전역 .card/.tbl/.tabs/body 무변경'
    ],
    pendingDecisions: [
      'quality-action/images/master 3개 페이지 보강 — 08O 단계 별도 작업',
      '품질 조치 우선순위 자동화 정책 — 금지 유지',
      '생산인원 입력 실제 저장 기능 — 서버 연동 후 별도 판단',
      '대시보드 YANGSAN_DATA / YEONJU_DATA 와 WORK_DATA 통합 방안 — 스케줄 파서 분기 정리 필요',
      'equip-status _es2Build 의 필터 검색 기능 (nav 재진입 시 필터 유지 여부) — 현재 초기화됨'
    ]
  }
};

window.runOdiDashboardProdPatchAudit = function(){
  var routes = ['dashboard','equip-status','team-overview','prod-overview','prod-headcount','prod-process'];
  var pmHas = {}, pageDomHas = {};
  routes.forEach(function(k){
    pmHas[k] = !!(window.PM && window.PM[k]);
    var pid = window.PM ? window.PM[k] : null;
    pageDomHas[k] = pid ? !!document.getElementById(pid) : false;
  });
  var rendersAvail = {};
  ['renderN08DashboardKPI','renderN08DashboardQuality','renderN08DashboardSummaryNote',
   'renderN08EquipStatus','renderN08TeamOverview',
   'renderN08ProdOverview','renderN08ProdHeadcount','renderN08ProdProcess'].forEach(function(n){
     rendersAvail[n] = typeof window[n] === 'function';
   });
  var existingRenders = {
    renderDashboardKPI:         typeof window.renderDashboardKPI === 'function',
    renderDashboardSummaryNotes:typeof window.renderDashboardSummaryNotes === 'function',
    _es2Build:                  typeof window._es2Build === 'function',
    _to2Build:                  typeof window._to2Build === 'function',
    renderUserProdOverviewPage:  typeof window.renderUserProdOverviewPage === 'function',
    renderUserProdHeadcountPage: typeof window.renderUserProdHeadcountPage === 'function',
    renderUserProdProcessPage:   typeof window.renderUserProdProcessPage === 'function'
  };
  var preserved = {
    'page-schedule':          !!document.getElementById('page-schedule'),
    'page-schedule-log':      !!document.getElementById('page-schedule-log'),
    'page-quality-main':      !!document.getElementById('page-quality-main'),
    'page-quality-dash':      !!document.getElementById('page-quality-dash'),
    'page-quality-analysis':  !!document.getElementById('page-quality-analysis')
  };
  var qCleanTabs = document.querySelectorAll('#page-quality-analysis [data-qclean="tabs"] > button').length;
  var dataM6 = ['page-data-equip','page-upload-history','page-data-validation','page-file-mapping','page-download','page-user-guide'];
  var dataMPresent = {};
  dataM6.forEach(function(p){ dataMPresent[p] = !!document.getElementById(p); });
  return {
    version: window.APP_VERSION,
    routes: routes, pmHas: pmHas, pageDomHas: pageDomHas,
    rendersAvail: rendersAvail,
    existingRenders: existingRenders,
    dispatcherWrapped: !!(window.odiNavAfterRenderDispatcher && window.odiNavAfterRenderDispatcher.__n08Wrapped),
    preserved: preserved,
    qCleanTabsCount: qCleanTabs,
    dataManagement6Present: dataMPresent,
    externalCdnAdded: !!document.querySelector('script[src*="cdn.jsdelivr"], script[src*="chart.js"], link[href*="fonts.googleapis"]'),
    allDataImported: typeof window.ALL_DATA !== 'undefined',
    errors: []
  };
};

/* ─────────── init ─────────── */
function n08Init(){
  try {
    n08WrapDispatcher();
    /* if dashboard is currently active page, supplement it */
    var page = document.querySelector('.page.active');
    if(page){
      var pid = page.id || '';
      if(pid === 'page-dashboard'){
        setTimeout(function(){
          window.renderN08DashboardKPI();
          window.renderN08DashboardQuality();
          window.renderN08DashboardSummaryNote();
        }, 300);
      }
      if(pid === 'page-equip-status')  window.renderN08EquipStatus();
      if(pid === 'page-team-overview')  window.renderN08TeamOverview();
      if(pid === 'page-prod-overview')  window.renderN08ProdOverview();
      if(pid === 'page-prod-headcount') window.renderN08ProdHeadcount();
      if(pid === 'page-prod-process')   window.renderN08ProdProcess();
    }
  } catch(e){ try{console.warn('['+VERSION+'] init failed:',e);}catch(_e){} }
}
function n08Boot(){ setTimeout(n08Init, 950); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', n08Boot);
else n08Boot();

})();
