/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 61 id=q-rebuild-08s-tv-status-board-script :: OPT01 no semantic edits */

(function(){
'use strict';
/* ============================================================================
 * Q_REBUILD_08S TV STATUS BOARD JS START
 * ----------------------------------------------------------------------------
 * TV용 전체화면 현황판 신규 구축
 *   - 상단 메뉴바 "📺 현황판" 버튼 자동 주입
 *   - 12개 슬라이드 자동 전환 (정보 10s, 차트 3개 5s, 주의툰 10s)
 *   - 실데이터 즉시 표시 (_qGetRows / WORK_DATA / YANGSAN_DATA / YEONJU_DATA)
 *   - 이번달 / 전월 대비 기준
 *   - SVG 내부 긴 한글 라벨 금지 — HTML grid row 분리
 *   - 라이트 모드 TV UI
 * ========================================================================== */

var VERSION = 'Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT';
try { window.APP_VERSION = VERSION; document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
try {
  window.CHANGELOG = window.CHANGELOG || [];
  window.CHANGELOG.push({
    version: VERSION,
    note: '08U: TV 현황판 전체화면/슬라이드 레이아웃 보정. 현황판 overlay를 100vw×100dvh 전체창으로 강제하고, KPI 슬라이드 하단 잘림/차트 가림을 수정. KPI 카드 중복 수치 제거 및 카드 높이 축소. 현재 작업중인 제품 슬라이드 제거 후 품질 데이터 기반 집중관리 슬라이드로 대체. 품질/불량 현황 Top5 텍스트 overflow와 조치 참고 잘림 수정. 월별 불량추이 모든 월 수치 표시 및 현재월 월중 집계 표기 보정. 달력 공휴일은 내장/수동 공휴일 테이블 기준으로 처리(2026 음력 공휴일 static 보강 포함).'
  });
} catch(_e){}

/* ── 슬라이드 설정 ───────────────────────────────────────────── */
var ODI_TV_SLIDES = [
  { key:'kpi-month',        label:'이번달 KPI 현황 / 전월 대비', type:'dashboard', duration:10000 },
  { key:'toon-01',          label:'작업자 주의툰 01',            type:'toon',      duration:10000, toonIndex:0 },
  { key:'quality-focus',    label:'이번달 품질 집중관리 항목',   type:'chart',     duration:10000 },
  { key:'toon-02',          label:'작업자 주의툰 02',            type:'toon',      duration:10000, toonIndex:1 },
  { key:'quality-overview', label:'품질 / 불량 현황',            type:'chart',     duration:10000 },
  { key:'toon-03',          label:'작업자 주의툰 03',            type:'toon',      duration:10000, toonIndex:2 },
  { key:'monthly-trend',    label:'월별 불량추이',               type:'chart',     duration:5000  },
  { key:'severity-compare', label:'중요도 분포',                 type:'chart',     duration:5000  },
  { key:'category-compare', label:'분류별 불량',                 type:'chart',     duration:5000  },
  { key:'toon-04',          label:'작업자 주의툰 04',            type:'toon',      duration:10000, toonIndex:3 },
  { key:'month-calendar',   label:'월간 일정',                   type:'data',      duration:10000 },
  { key:'toon-05',          label:'작업자 주의툰 05',            type:'toon',      duration:10000, toonIndex:4 }
];
window.ODI_TV_SLIDES = ODI_TV_SLIDES;

/* ── 공휴일 (외부 API 금지, 내장 + 2026 음력 static 보강) ─────────
   기본은 양력 고정 공휴일 (매년 동일)
   2026년 음력/대체공휴일은 ODI_HOLIDAY_2026_LUNAR static 테이블로 보강
   사용자 운영 시 window.ODI_HOLIDAY_MAP로 override 가능
   주의: 외부 API 자동 검색 표시 금지 */
var ODI_HOLIDAY_FIXED = {
  '01-01':'신정', '03-01':'삼일절', '05-05':'어린이날',
  '06-06':'현충일', '08-15':'광복절',
  '10-03':'개천절', '10-09':'한글날', '12-25':'성탄절',
  '05-01':'근로자의 날'
};
/* 2026년 음력/대체공휴일 static 보강 — 사용자 운영 전 확인 가능, ODI_HOLIDAY_MAP에서 덮어쓰기 가능 */
var ODI_HOLIDAY_2026_LUNAR = {
  '2026-02-16':'설날',
  '2026-02-17':'설날',
  '2026-02-18':'설날',
  '2026-02-19':'대체휴일',
  '2026-03-02':'대체휴일',
  '2026-05-24':'부처님오신날',
  '2026-05-25':'대체휴일',
  '2026-08-17':'대체휴일',
  '2026-10-04':'추석',
  '2026-10-05':'추석',
  '2026-10-06':'추석 연휴'
};
window.ODI_HOLIDAY_MAP = window.ODI_HOLIDAY_MAP || {}; /* 음력 공휴일 수동 확장/오버라이드용 */
window.ODI_HOLIDAY_PROVIDER = null; /* 추후 외부 hook용 */

/* 공휴일 맵 조회 — 연도별 최종 맵 반환 (override 적용 순서: fixed → lunar static → ODI_HOLIDAY_MAP) */
function tvGetHolidayMap(year){
  var map = {};
  /* 1) 양력 고정 (연도 prefix 붙여 dk 형태로) */
  for (var k in ODI_HOLIDAY_FIXED){
    if (ODI_HOLIDAY_FIXED.hasOwnProperty(k)) map[year + '-' + k] = ODI_HOLIDAY_FIXED[k];
  }
  /* 2) 2026 음력 static */
  if (String(year) === '2026'){
    for (var k2 in ODI_HOLIDAY_2026_LUNAR){
      if (ODI_HOLIDAY_2026_LUNAR.hasOwnProperty(k2)) map[k2] = ODI_HOLIDAY_2026_LUNAR[k2];
    }
  }
  /* 3) 사용자 override */
  for (var k3 in window.ODI_HOLIDAY_MAP){
    if (window.ODI_HOLIDAY_MAP.hasOwnProperty(k3)) map[k3] = window.ODI_HOLIDAY_MAP[k3];
  }
  return map;
}
function tvIsHoliday(year, month, day){
  var dk = year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
  var map = tvGetHolidayMap(year);
  return map[dk] || '';
}

/* ── 런타임 상태 ─────────────────────────────────────────── */
var tvState = {
  open:false, playing:true, idx:0,
  timer:null, progressTimer:null, clockTimer:null,
  data:null, theme:'light',
  initialized:false, slideStart:0, slideDuration:0
};
window.ODI_TV_BOARD_THEME = window.ODI_TV_BOARD_THEME || 'light';
window.ODI_TV_RENDER_ERRORS = [];
window.ODI_TV_DATA_AUDIT = { renderStatus:{} };

/* =====================================================================
 * §1. 데이터 수집 — 품질
 * ===================================================================== */
function tvGetCanonicalQualityData(){
  var rows = []; var rowsSource = 'none';
  var analytics = null; var analyticsSource = 'none';

  /* 1. _qGetRows() 최우선 */
  try{
    if (typeof window._qGetRows === 'function'){
      var r = window._qGetRows();
      if (Array.isArray(r) && r.length){ rows = r; rowsSource = '_qGetRows()'; }
      else if (r && Array.isArray(r.rows) && r.rows.length){ rows = r.rows; rowsSource = '_qGetRows().rows'; }
    }
  }catch(_e){}

  /* 2. _qGetAnalytics() */
  try{
    if (typeof window._qGetAnalytics === 'function'){
      analytics = window._qGetAnalytics();
      if (analytics) analyticsSource = '_qGetAnalytics()';
    }
  }catch(_e){}

  /* 3. fallback 배열 순차 탐색 */
  if (!rows.length){
    var candidates = [
      ['QDEFECT_RAW_ROWS',           window.QDEFECT_RAW_ROWS],
      ['QISSUE_NORMALIZED_ROWS',     window.QISSUE_NORMALIZED_ROWS],
      ['QISSUE_ROWS',                window.QISSUE_ROWS],
      ['QDEFECT_ISSUES',             window.QDEFECT_ISSUES],
      ['QRAW_ROWS',                  window.QRAW_ROWS]
    ];
    for (var i=0;i<candidates.length;i++){
      var nm = candidates[i][0], arr = candidates[i][1];
      if (Array.isArray(arr) && arr.length){ rows = arr; rowsSource = nm; break; }
    }
  }

  return { rows:rows, rowsSource:rowsSource, analytics:analytics, analyticsSource:analyticsSource };
}

/* ── 필드 추출 헬퍼 ───────────────────────── */
function tvPick(row, keys){
  if (!row || typeof row !== 'object') return null;
  for (var i=0;i<keys.length;i++){
    var k = keys[i];
    if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
  }
  return null;
}
function tvSafeStr(v){ return (v==null) ? '' : String(v); }

/* monthKey 추출 */
function tvGetMonthKey(row){
  var direct = tvPick(row, ['monthKey','month_key','월']);
  if (direct){
    var s = tvSafeStr(direct);
    var m = s.match(/(\d{4})[\-\.\/]?(\d{1,2})/);
    if (m) return m[1] + '-' + (m[2].length===1?'0'+m[2]:m[2]);
  }
  var d = tvPick(row, ['date','날짜','발생일','접수일','검사일','등록일','createdAt','created_at']);
  if (!d) return '';
  var ds = tvSafeStr(d);
  var mm = ds.match(/(\d{4})[\-\.\/](\d{1,2})/);
  if (mm) return mm[1] + '-' + (mm[2].length===1?'0'+mm[2]:mm[2]);
  /* Date 객체 가능성 */
  try{
    var dt = new Date(ds);
    if (!isNaN(dt.getTime())){
      return dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0');
    }
  }catch(_e){}
  return '';
}

/* 중요도 추출 + 정규화 */
function tvGetSeverity(row){
  var raw = tvPick(row, ['severity','중요도','심각도','criticality','등급','defectLevel','level','판정등급','grade']);
  if (!raw) return '기타';
  var s = String(raw).toLowerCase().trim();
  if (/치명|critical|crit|severe|high[\-\s]?risk|중대/.test(s)) return '치명';
  if (/주요|major|high/.test(s)) return '주요';
  if (/일반|minor|normal|low|경미/.test(s)) return '일반';
  if (s === '' || /^(기타|미분류|미정)$/.test(s)) return '기타';
  /* 한글 직접 매핑 */
  if (raw === '치명') return '치명';
  if (raw === '주요') return '주요';
  if (raw === '일반') return '일반';
  return '기타';
}

/* 분류 추출 */
function tvGetCategory(row){
  var v = tvPick(row, [
    '불량유형','유형','defectType','category','분류',
    'majorCategory','middleCategory','minorCategory',
    '대분류','중분류','소분류',
    'CELL','cell','model','모델','part','파트'
  ]);
  if (!v) return '미분류';
  var s = String(v).trim();
  return s || '미분류';
}

/* 조치 상태 */
function tvGetStatus(row){
  var v = tvPick(row, ['status','조치상태','처리상태','closeStatus','완료여부','상태']);
  return v ? String(v).trim() : '';
}

/* 이미지 있는지 */
function tvHasImage(row){
  var c = tvPick(row, ['imageCount','imgCount','사진','photo','photoCount','첨부','증빙']);
  if (typeof c === 'number') return c > 0;
  if (typeof c === 'string' && /^\d+$/.test(c)) return parseInt(c,10) > 0;
  var b = tvPick(row, ['imageMatched','hasImage']);
  if (typeof b === 'boolean') return b;
  if (b === 'Y' || b === 'y' || b === 'true' || b === '1') return true;
  return false;
}

/* =====================================================================
 * §2. 데이터 수집 — 생산
 * ===================================================================== */
function tvGetCanonicalProductionData(){
  var rows = []; var rowsSource = 'none';

  /* 1. WORK_DATA 최우선 */
  if (typeof window.WORK_DATA !== 'undefined' && Array.isArray(window.WORK_DATA) && window.WORK_DATA.length){
    rows = window.WORK_DATA; rowsSource = 'WORK_DATA';
  }
  /* 2. YANGSAN_DATA + YEONJU_DATA 병합 */
  else if (
    (typeof window.YANGSAN_DATA !== 'undefined' && Array.isArray(window.YANGSAN_DATA) && window.YANGSAN_DATA.length) ||
    (typeof window.YEONJU_DATA  !== 'undefined' && Array.isArray(window.YEONJU_DATA)  && window.YEONJU_DATA.length)
  ){
    var y = (window.YANGSAN_DATA||[]).slice();
    var r = (window.YEONJU_DATA||[]).slice();
    rows = y.concat(r); rowsSource = 'YANGSAN_DATA+YEONJU_DATA';
  }
  /* 3. 기타 후보 */
  else {
    var cands = [
      ['SCHEDULE_DATA',   window.SCHEDULE_DATA],
      ['SCHED_ROWS',      window.SCHED_ROWS],
      ['SCHEDULE_ROWS',   window.SCHEDULE_ROWS],
      ['scheduleData',    window.scheduleData]
    ];
    for (var i=0;i<cands.length;i++){
      if (Array.isArray(cands[i][1]) && cands[i][1].length){
        rows = cands[i][1]; rowsSource = cands[i][0]; break;
      }
    }
  }

  /* 4. hasScheduleDataReady 보조 */
  var ready = false;
  try{ if (typeof window.hasScheduleDataReady === 'function') ready = !!window.hasScheduleDataReady(); }catch(_e){}

  /* 5. §8. DOM fallback (read-only, 최후 수단) — 전역 배열 모두 비었지만 page-schedule에 렌더된 row가 있을 때 */
  if (rows.length === 0){
    try {
      var schedPage = document.getElementById('page-schedule');
      if (schedPage){
        var domRows = tvScanScheduleDomReadOnly(schedPage);
        if (domRows && domRows.length){
          rows = domRows; rowsSource = 'page-schedule DOM fallback';
        }
      }
    } catch(_e){
      try{ window.ODI_TV_RENDER_ERRORS.push('dom-fallback:' + String(_e && _e.message || _e)); }catch(__){}
    }
  }

  return { rows:rows, rowsSource:rowsSource, ready:ready };
}

/* §8. DOM fallback: page-schedule 내부 테이블/카드를 read-only로 스캔 */
function tvScanScheduleDomReadOnly(rootEl){
  var out = [];
  if (!rootEl) return out;
  /* 테이블 형태 우선 — thead의 헤더 텍스트로 컬럼 인덱스 추정 */
  var tables = rootEl.querySelectorAll('table');
  for (var t=0;t<tables.length;t++){
    var tbl = tables[t];
    var headerCells = tbl.querySelectorAll('thead th, thead td');
    if (!headerCells.length) headerCells = tbl.querySelectorAll('tr:first-child th, tr:first-child td');
    var colMap = {};
    for (var hi=0;hi<headerCells.length;hi++){
      var txt = (headerCells[hi].textContent||'').trim();
      if (/호기|machine|equip/i.test(txt))      colMap['호기'] = hi;
      if (/모델|model|품명|제품|part/i.test(txt)) colMap['model'] = hi;
      if (/공정|process|단계|stage/i.test(txt))  colMap['공정'] = hi;
      if (/상태|status|state/i.test(txt))        colMap['상태'] = hi;
      if (/시작|start/i.test(txt))               colMap['시작일'] = hi;
      if (/종료|end|완료/i.test(txt))            colMap['endDate'] = hi;
      if (/출하|ship|납기|due/i.test(txt))       colMap['출하일'] = hi;
    }
    if (Object.keys(colMap).length === 0) continue;
    var bodyRows = tbl.querySelectorAll('tbody tr');
    if (!bodyRows.length) bodyRows = tbl.querySelectorAll('tr');
    for (var br=0;br<bodyRows.length;br++){
      var cells = bodyRows[br].querySelectorAll('td');
      if (cells.length === 0) continue;
      var rec = {};
      for (var k in colMap){
        if (colMap.hasOwnProperty(k) && cells[colMap[k]]){
          rec[k] = (cells[colMap[k]].textContent||'').trim();
        }
      }
      if (rec['model'] || rec['호기']) out.push(rec);
    }
  }
  return out;
}

/* =====================================================================
 * §3. 기간 계산
 * ===================================================================== */
function tvGetCurrentAndPreviousMonth(qualityRows){
  var now = new Date();
  var curKey = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  var prevDate = new Date(now.getFullYear(), now.getMonth()-1, 1);
  var prevKey = prevDate.getFullYear() + '-' + String(prevDate.getMonth()+1).padStart(2,'0');

  /* 데이터 보정: 현재월 데이터 0건 + 더 최신 월 존재 시 fallback */
  var hasCurrent = false;
  var allMonths = {};
  if (Array.isArray(qualityRows)){
    for (var i=0;i<qualityRows.length;i++){
      var mk = tvGetMonthKey(qualityRows[i]);
      if (mk){ allMonths[mk] = (allMonths[mk]||0)+1; if (mk === curKey) hasCurrent = true; }
    }
  }

  var didFallback = false;
  if (!hasCurrent){
    var keys = Object.keys(allMonths).sort();
    if (keys.length){
      var latest = keys[keys.length-1];
      if (latest > curKey || (!hasCurrent && latest < curKey)){
        /* 미래 데이터가 있거나, 현재월에 데이터가 전혀 없으면 최신 가용 월로 fallback */
        curKey = latest;
        var ly = parseInt(latest.split('-')[0],10), lm = parseInt(latest.split('-')[1],10);
        var pd = new Date(ly, lm-2, 1);
        prevKey = pd.getFullYear() + '-' + String(pd.getMonth()+1).padStart(2,'0');
        didFallback = true;
      }
    }
  }

  return {
    currentMonthKey: curKey,
    previousMonthKey: prevKey,
    didFallback: didFallback,
    todayISO: now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')
  };
}

function tvFilterRowsByMonth(rows, monthKey){
  if (!Array.isArray(rows) || !monthKey) return [];
  var out = [];
  for (var i=0;i<rows.length;i++){
    if (tvGetMonthKey(rows[i]) === monthKey) out.push(rows[i]);
  }
  return out;
}

function tvMonthLabel(monthKey){
  if (!monthKey) return '';
  var parts = monthKey.split('-');
  return parts[0] + '년 ' + parseInt(parts[1],10) + '월';
}

/* =====================================================================
 * §4. 품질 메트릭 빌드
 * ===================================================================== */
function tvBuildQualityMetrics(rows, period){
  var cur = tvFilterRowsByMonth(rows, period.currentMonthKey);
  var prev = tvFilterRowsByMonth(rows, period.previousMonthKey);

  /* 중요도 카운트 */
  function countSev(arr){
    var c = { '치명':0, '주요':0, '일반':0, '기타':0 };
    for (var i=0;i<arr.length;i++){ var s = tvGetSeverity(arr[i]); if (c[s]==null) c['기타']++; else c[s]++; }
    return c;
  }
  var curSev  = countSev(cur);
  var prevSev = countSev(prev);

  /* 분류 카운트 */
  function countCat(arr){
    var m = {};
    for (var i=0;i<arr.length;i++){
      var k = tvGetCategory(arr[i]);
      m[k] = (m[k]||0) + 1;
    }
    return m;
  }
  var curCat = countCat(cur);
  var prevCat = countCat(prev);

  /* Top 5 + 기타 */
  var catEntries = Object.keys(curCat).map(function(k){ return { name:k, n:curCat[k], prev:(prevCat[k]||0) }; });
  catEntries.sort(function(a,b){ return b.n - a.n; });
  var top5 = catEntries.slice(0,5);
  var others = catEntries.slice(5);
  var otherN = 0; for (var oi=0;oi<others.length;oi++) otherN += others[oi].n;

  /* 이미지 누락 */
  var missingImg = 0;
  for (var i=0;i<cur.length;i++){ if (!tvHasImage(cur[i])) missingImg++; }

  return {
    period: period,
    rowsTotal: rows.length,
    currentRows: cur,
    previousRows: prev,
    currentCount: cur.length,
    previousCount: prev.length,
    currentSeverity: curSev,
    previousSeverity: prevSev,
    currentCategoryTop5: top5,
    currentCategoryOtherN: otherN,
    currentCategoryOtherCount: others.length,
    currentCategoryMap: curCat,
    previousCategoryMap: prevCat,
    missingImageCount: missingImg
  };
}

/* =====================================================================
 * §5. 생산 메트릭 빌드
 * ===================================================================== */
function tvBuildProductionMetrics(rows, period){
  var work=0, inspect=0, ship=0, delay=0;
  var todayDate = new Date(); todayDate.setHours(0,0,0,0);
  var shipThisMonth = 0;
  var workCandidateCount = 0; /* lane 미지정 + 시작일~종료일 사이인 후보 (status 비어있어도 진행중 가능) */

  var prodCards = [];
  var hasRows = Array.isArray(rows) && rows.length > 0;

  if (Array.isArray(rows)){
    for (var i=0;i<rows.length;i++){
      var r = rows[i];
      var status = tvGetStatus(r);
      var sLow = status.toLowerCase();

      /* 완료/취소는 제외 */
      if (/완료|출고완료|해체완료|종료|취소|cancel|complet/.test(sLow)) continue;

      var lane = '';
      if (/지연|delay|overdue|납기초과/.test(sLow))      lane = 'delay';
      else if (/출고준비|출하준비|출고\s*예정|출하\s*예정|ship/.test(sLow)) lane = 'ship';
      else if (/검사|품질확인|QC|검수|inspect/.test(sLow)) lane = 'inspect';
      else if (/진행|작업중|가공|출고준비|생산중|조립중|production|work/.test(sLow)) lane = 'work';

      /* 명시 상태 없어도 시작일~종료일 사이면 작업중 후보로 판정 */
      var startRaw = tvPick(r, ['startDate','start','작업시작','시작일']);
      var endRaw   = tvPick(r, ['endDate','dueDate','완료예정일','출하일','출고예정일','납기','shipDate','targetDate']);
      var sd = startRaw ? new Date(String(startRaw).replace(/\./g,'-')) : null;
      var ed = endRaw   ? new Date(String(endRaw  ).replace(/\./g,'-')) : null;
      var inRange = (sd && ed && !isNaN(sd.getTime()) && !isNaN(ed.getTime()) && sd <= todayDate && todayDate <= ed);
      if (!lane && inRange) lane = 'work';
      if (inRange) workCandidateCount++;

      if (lane === 'work')    work++;
      if (lane === 'inspect') inspect++;
      if (lane === 'ship')    ship++;
      if (lane === 'delay')   delay++;

      /* 출하 예정 카운트 (이번달) */
      var ship1 = tvPick(r, ['shipDate','출하일','출고예정일','dueDate','납기','완료예정일','targetDate']);
      if (ship1){
        var sk = tvSafeStr(ship1).match(/(\d{4})[\-\.\/](\d{1,2})/);
        if (sk){
          var smk = sk[1]+'-'+(sk[2].length===1?'0'+sk[2]:sk[2]);
          if (smk === period.currentMonthKey) shipThisMonth++;
        }
      }

      /* 카드 후보 */
      if (lane){
        prodCards.push({
          hoki: tvSafeStr(tvPick(r, ['호기','호기명','machineNo','machine','equipNo','equipment','machineId'])) || '-',
          model: tvSafeStr(tvPick(r, ['model','모델','제품','품명','product','partName','spec'])) || '-',
          process: tvSafeStr(tvPick(r, ['공정','process','currentProcess','currentStage','stage','단계'])) || '-',
          status: status || '-',
          shipDate: tvSafeStr(tvPick(r, ['shipDate','출하일','출고예정일','dueDate','납기'])) || '',
          lane: lane
        });
      }
    }
  }

  /* 카드는 우선순위: delay → inspect → ship → work, 최대 8개 */
  var laneOrder = { 'delay':0, 'inspect':1, 'ship':2, 'work':3 };
  prodCards.sort(function(a,b){ return (laneOrder[a.lane]||9) - (laneOrder[b.lane]||9); });
  var cards = prodCards.slice(0,8);

  /* §7. 데이터 상태 진단 (rows 없음 vs 작업중 0건 vs 출하 예정 있음) */
  var reason = '';
  if (!hasRows) reason = 'no-rows';
  else if (cards.length === 0 && (work+inspect+ship+delay) === 0) {
    reason = shipThisMonth > 0 ? 'only-ship-this-month' : 'no-active';
  } else reason = 'has-active';

  return {
    working: work,
    inspecting: inspect,
    shipReady: ship,
    delayed: delay,
    totalActive: work + inspect + ship + delay,
    shipThisMonth: shipThisMonth,
    cards: cards,
    /* 진단 필드 */
    rowsCount: Array.isArray(rows) ? rows.length : 0,
    hasRows: hasRows,
    workCandidateCount: workCandidateCount,
    currentProductsCount: cards.length,
    reason: reason
  };
}

/* =====================================================================
 * §6. 차트용 데이터: 최근 6개월 추이
 * ===================================================================== */
function tvBuildMonthlyTrend(rows, period){
  var months = [];
  var baseY = parseInt(period.currentMonthKey.split('-')[0],10);
  var baseM = parseInt(period.currentMonthKey.split('-')[1],10);
  for (var i=5;i>=0;i--){
    var d = new Date(baseY, baseM-1-i, 1);
    var mk = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    var n = 0;
    if (Array.isArray(rows)){
      for (var j=0;j<rows.length;j++){ if (tvGetMonthKey(rows[j]) === mk) n++; }
    }
    months.push({
      monthKey: mk,
      label: (d.getMonth()+1) + '월',
      n: n
    });
  }
  return months;
}

/* =====================================================================
 * §7. 달력 데이터 빌드
 * ===================================================================== */
function tvBuildCalendarData(prodRows, monthKey){
  if (!monthKey) return { monthKey:monthKey, events:{}, label:'' };
  var ymY = parseInt(monthKey.split('-')[0],10);
  var ymM = parseInt(monthKey.split('-')[1],10);

  var events = {}; /* dateKey -> [{type, label}] */
  function add(date, type, label){
    if (!date) return;
    var s = tvSafeStr(date).match(/(\d{4})[\-\.\/](\d{1,2})[\-\.\/](\d{1,2})/);
    if (!s) return;
    var key = s[1] + '-' + (s[2].length===1?'0'+s[2]:s[2]) + '-' + (s[3].length===1?'0'+s[3]:s[3]);
    var emk = s[1] + '-' + (s[2].length===1?'0'+s[2]:s[2]);
    if (emk !== monthKey) return;
    events[key] = events[key] || [];
    events[key].push({ type:type, label:label||'' });
  }

  if (Array.isArray(prodRows)){
    for (var i=0;i<prodRows.length;i++){
      var r = prodRows[i];
      var status = tvGetStatus(r);
      var mdl   = tvSafeStr(tvPick(r, ['model','모델','제품','품명','partName'])) || '제품';
      var hoki  = tvSafeStr(tvPick(r, ['호기','호기명','machineNo','machine'])) || '';
      var lbl   = (hoki?hoki+' ':'') + mdl;

      var ship  = tvPick(r, ['shipDate','출하일','출고예정일','dueDate','납기']);
      var insp  = tvPick(r, ['inspectDate','검사일','품질검사일','qcDate']);
      var start = tvPick(r, ['startDate','시작일','작업시작일','planDate']);
      var due   = tvPick(r, ['targetDate','완료예정일','완료일']);
      var date  = tvPick(r, ['date','날짜']);

      var isDelay = /지연|delay|overdue|납기초과/.test(status.toLowerCase());

      if (ship)  add(ship,  isDelay?'delay':'ship',    '출하 ' + lbl);
      if (insp)  add(insp,  'inspect', '검사 ' + lbl);
      if (start) add(start, 'work',    '작업 ' + lbl);
      if (due && !ship) add(due, isDelay?'delay':'ship', '완료 ' + lbl);
      if (date && !ship && !start) add(date, 'work', '작업 ' + lbl);
    }
  }

  return { monthKey:monthKey, year:ymY, month:ymM, events:events, label: ymY + '년 ' + ymM + '월' };
}

/* =====================================================================
 * §8. 통합 collect
 * ===================================================================== */
function odiTvCollectData(){
  var q = tvGetCanonicalQualityData();
  var p = tvGetCanonicalProductionData();
  var period = tvGetCurrentAndPreviousMonth(q.rows);
  var qm = tvBuildQualityMetrics(q.rows, period);
  var pm = tvBuildProductionMetrics(p.rows, period);
  var trend = tvBuildMonthlyTrend(q.rows, period);
  var cal = tvBuildCalendarData(p.rows, period.currentMonthKey);

  return {
    meta: { generatedAt: new Date().toISOString(), version: VERSION },
    period: period,
    quality: { source:q.rowsSource, rowsSource:q.rowsSource, analyticsSource:q.analyticsSource, rows:q.rows, metrics:qm },
    production: { source:p.rowsSource, rowsSource:p.rowsSource, ready:p.ready, rows:p.rows, metrics:pm },
    charts: { monthlyTrend: trend },
    calendar: cal
  };
}
window.odiTvCollectData = odiTvCollectData;

/* =====================================================================
 * §9. 유틸: delta 표시
 * ===================================================================== */
function tvFormatDelta(cur, prev){
  if (prev > 0){
    var d = cur - prev;
    var r = Math.round(d / prev * 100);
    if (d === 0)  return { tx:'전월 동일', cls:'flat', delta:0, rate:0 };
    if (d > 0)    return { tx:'전월 +' + d + ' (' + (r>0?'+':'') + r + '%)', cls:'up',   delta:d, rate:r };
    return        { tx:'전월 ' + d + ' (' + r + '%)', cls:'down', delta:d, rate:r };
  } else {
    if (cur === 0) return { tx:'전월 0 / 이번달 0', cls:'flat', delta:0, rate:0 };
    return { tx:'전월 0 → 이번달 +' + cur, cls:'up', delta:cur, rate:100 };
  }
}

/* color helper */
var TV_SEV_COLORS = {
  '치명': '#ef4444', '주요': '#f59e0b', '일반': '#22c55e', '기타': '#94a3b8'
};

/* category color rotation */
function tvCatColor(idx){
  var palette = ['#3b82f6','#06b6d4','#8b5cf6','#ec4899','#f97316'];
  return palette[idx % palette.length];
}

/* HTML escape */
function tvEsc(s){
  return tvSafeStr(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* =====================================================================
 * §10. 슬라이드 렌더러
 * ===================================================================== */
function tvRenderAllSlides(data){
  var stage = document.getElementById('tvBoardStage');
  if (!stage) return;
  stage.innerHTML = '';
  window.ODI_TV_RENDER_ERRORS = [];
  window.ODI_TV_DATA_AUDIT.renderStatus = {};

  for (var i=0;i<ODI_TV_SLIDES.length;i++){
    var s = ODI_TV_SLIDES[i];
    var el = document.createElement('section');
    el.className = (s.type === 'toon' ? 'tv-toon-slide' : 'tv-slide');
    el.setAttribute('data-slide-key', s.key);
    el.setAttribute('data-slide-idx', String(i));
    stage.appendChild(el);

    (function(sl, target){
      tvSafeRender(sl.key, function(){
        if (sl.type === 'toon')          tvRenderSlideToon(target, sl, data);
        else if (sl.key === 'kpi-month') tvRenderSlideKpiMonth(target, data);
        else if (sl.key === 'quality-focus')    tvRenderSlideQualityFocus(target, data);
        else if (sl.key === 'current-products') tvRenderSlideCurrentProducts(target, data);
        else if (sl.key === 'quality-overview') tvRenderSlideQualityOverview(target, data);
        else if (sl.key === 'monthly-trend')    tvRenderSlideMonthlyTrend(target, data);
        else if (sl.key === 'severity-compare') tvRenderSlideSeverityCompare(target, data);
        else if (sl.key === 'category-compare') tvRenderSlideCategoryCompare(target, data);
        else if (sl.key === 'month-calendar')   tvRenderSlideCalendar(target, data);
        else target.innerHTML = '';
      });
    })(s, el);
  }

  /* dots */
  var dots = document.getElementById('tvBoardDots');
  if (dots){
    dots.innerHTML = '';
    for (var k=0;k<ODI_TV_SLIDES.length;k++){
      var d = document.createElement('span');
      d.className = 'd' + (k===tvState.idx?' is-active':'');
      d.title = ODI_TV_SLIDES[k].label;
      (function(ix){ d.onclick = function(){ tvGoSlide(ix); }; })(k);
      dots.appendChild(d);
    }
  }
}

function tvSafeRender(name, fn){
  try {
    fn();
    window.ODI_TV_DATA_AUDIT.renderStatus[name] = 'ok';
  } catch(e) {
    window.ODI_TV_DATA_AUDIT.renderStatus[name] = 'fail';
    window.ODI_TV_RENDER_ERRORS.push({
      name:name,
      message: (e && e.message) ? e.message : String(e),
      at: new Date().toISOString()
    });
    try{ console.warn('[TV_RENDER_ERROR]', name, e); }catch(_e){}
  }
}

/* ─────────────────────────────────────────────────────────
 * SLIDE: 주의툰
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideToon(el, slide, data){
  var src = (window.ODI_TV_TOON_IMAGES && window.ODI_TV_TOON_IMAGES[slide.toonIndex]) || '';
  el.innerHTML =
    '<div class="tv-toon-frame">' +
      (src
        ? '<img class="tv-toon-img" src="' + src + '" alt="">'
        : '<div class="tv-empty" style="background:#0f172a;color:#cbd5e1;border-color:#334155;width:100%;height:100%">' +
          '<div class="emoji">🖼️</div><div class="ttl" style="color:#fff">주의툰 이미지 없음</div>' +
          '<div class="sub" style="color:#94a3b8">window.ODI_TV_TOON_IMAGES[' + slide.toonIndex + ']</div></div>') +
    '</div>';
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 1: 이번달 KPI 현황 / 전월 대비
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideKpiMonth(el, data){
  /* §FIX: 데이터 가드 — metrics/sev/top5가 어떤 이유로 비어도 슬라이드는 살아남도록 */
  var qm = (data && data.quality && data.quality.metrics) ? data.quality.metrics : {};
  var pm = (data && data.production && data.production.metrics) ? data.production.metrics : {};
  var period = (data && data.period) ? data.period : { currentMonthKey:'', previousMonthKey:'', todayISO:'' };
  var noQuality = !(data && data.quality && data.quality.rows && data.quality.rows.length > 0);
  var noProd = !(data && data.production && data.production.rows && data.production.rows.length > 0);

  /* metrics 기본값 보강 */
  if (typeof qm.currentCount === 'undefined') qm.currentCount = 0;
  if (typeof qm.previousCount === 'undefined') qm.previousCount = 0;
  if (typeof qm.rowsTotal === 'undefined') qm.rowsTotal = 0;
  if (!qm.currentSeverity)  qm.currentSeverity  = {'치명':0,'주요':0,'일반':0,'기타':0};
  if (!qm.previousSeverity) qm.previousSeverity = {'치명':0,'주요':0,'일반':0,'기타':0};
  if (!qm.currentCategoryTop5) qm.currentCategoryTop5 = [];
  if (typeof pm.shipThisMonth === 'undefined') pm.shipThisMonth = 0;
  if (typeof pm.working === 'undefined') pm.working = 0;

  var deltaTotal = tvFormatDelta(qm.currentCount, qm.previousCount);
  var monthLabel = tvMonthLabel(period.currentMonthKey);
  var prevLabel  = tvMonthLabel(period.previousMonthKey);

  /* 현재월 / 월중 판정 */
  var now = new Date();
  var endOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 0);
  var nowMK = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var isCurrent = (period.currentMonthKey === nowMK);
  var isMid = isCurrent && (now.getDate() < endOfMonth.getDate());
  var midBadgeTxt = isMid ? '⏳ 월중 집계 · ' + period.todayISO + ' 기준' : '';

  var trend = data.charts.monthlyTrend;
  var lineSvg = tvBuildLineChart(trend, {
    height:300, compact:false,
    showAllPointLabels:true, labelMode:'number-only', alternateLabelOffset:true,
    currentIdx: trend.length-1, isMid:isMid, minHeight:300
  });

  /* §8. 분류 top5 mini bar — row height 30~34, font 16-20, ellipsis */
  var top5 = qm.currentCategoryTop5.slice(0, 5);
  var maxN = 1; for (var i=0;i<top5.length;i++) if (top5[i].n>maxN) maxN = top5[i].n;
  var miniBars = top5.length ? top5.map(function(c, idx){
    var pct = Math.round(c.n/maxN*100);
    var dlt = tvFormatDelta(c.n, c.prev);
    return '<div class="tv-bar-row tv-bar-row-kpi-bot">' +
      '<div class="tv-bar-name">' + tvEsc(c.name) + '</div>' +
      '<div class="tv-bar-track"><i style="width:' + pct + '%;background:' + tvCatColor(idx) + '"></i></div>' +
      '<div class="tv-bar-value">' + c.n + '</div>' +
      '<div class="tv-delta ' + dlt.cls + '">' + tvEsc(dlt.tx) + '</div>' +
    '</div>';
  }).join('') : '<div class="tv-empty" style="padding:14px"><div class="ttl">분류 데이터 없음</div></div>';

  /* §8. 중요도 요약 — compact bar */
  var sev = qm.currentSeverity;
  var prevSev = qm.previousSeverity;
  var sevTotal = sev['치명']+sev['주요']+sev['일반']+sev['기타'];
  var sevHtml = ['치명','주요','일반','기타'].map(function(k){
    var n = sev[k]||0;
    var prevN = prevSev[k]||0;
    var pct = sevTotal? Math.round(n/sevTotal*100):0;
    var dlt = tvFormatDelta(n, prevN);
    return '<div class="tv-bar-row tv-bar-row-sev">' +
      '<div class="tv-bar-name" style="color:' + TV_SEV_COLORS[k] + '">' + k + '</div>' +
      '<div class="tv-bar-track"><i style="width:' + pct + '%;background:' + TV_SEV_COLORS[k] + '"></i></div>' +
      '<div class="tv-bar-value">' + n + '</div>' +
      '<div class="tv-delta ' + dlt.cls + '">' + tvEsc(dlt.tx) + '</div>' +
    '</div>';
  }).join('');

  /* §6. 이번달 불량 카드 inline 전월 대비 */
  var deltaInline = noQuality ? '' :
    '<span class="tv-kpi-inline-delta ' + deltaTotal.cls + '">' +
      (deltaTotal.cls==='up'?'▲ ':deltaTotal.cls==='down'?'▼ ':'· ') +
      '전월 ' + (deltaTotal.delta>=0?'+':'') + deltaTotal.delta + '건 / ' + deltaTotal.rate + '%' +
    '</span>';

  el.innerHTML =
    '<div class="tv-kpi-page">' +
      /* 슬라이드 타이틀 (헤더 영역 안에 통합 — page-grid 96/1fr/210에서 KPI 카드 row의 일부) */
      '<div class="tv-kpi-cards">' +
        /* 카드 1: 이번달 불량 + inline 전월 대비 */
        '<div class="tv-kpi-card tv-kpi-card-c blue tv-kpi-primary">' +
          '<div class="tv-kpi-label">이번달 불량 (' + monthLabel + ')' +
            (isMid ? '<span class="tv-mid-chip">월중</span>' : '') +
          '</div>' +
          '<div class="tv-kpi-inline">' +
            '<strong>' + (noQuality?'-':qm.currentCount) + '<span class="u">건</span></strong>' +
            deltaInline +
          '</div>' +
        '</div>' +
        /* 카드 2: 치명 */
        '<div class="tv-kpi-card tv-kpi-card-c red">' +
          '<div class="tv-kpi-label">치명 이슈</div>' +
          '<div class="tv-kpi-value">' + (noQuality?'-':sev['치명']) + '<span class="u">건</span></div>' +
        '</div>' +
        /* 카드 3: 주요 */
        '<div class="tv-kpi-card tv-kpi-card-c orange">' +
          '<div class="tv-kpi-label">주요 이슈</div>' +
          '<div class="tv-kpi-value">' + (noQuality?'-':sev['주요']) + '<span class="u">건</span></div>' +
        '</div>' +
        /* 카드 4: 이번달 출하 (생산 데이터 — 불안정해도 KPI 한 칸만) */
        '<div class="tv-kpi-card tv-kpi-card-c green">' +
          '<div class="tv-kpi-label">이번달 출하</div>' +
          '<div class="tv-kpi-value">' + (noProd?'-':pm.shipThisMonth) + '<span class="u">건</span></div>' +
        '</div>' +
        /* 카드 5: 품질 데이터 source/총건수 */
        '<div class="tv-kpi-card tv-kpi-card-c gray">' +
          '<div class="tv-kpi-label">품질 데이터</div>' +
          '<div class="tv-kpi-value tv-kpi-value-sm">' +
            (noQuality?'-':qm.currentCount) + '<span class="u">건</span>' +
            '<span class="tv-kpi-sub">/ 전체 ' + (qm.rowsTotal||0) + '건</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* 2단: 차트(65%) + 전월 요약(35%) */
      '<div class="tv-kpi-main-grid">' +
        '<div class="tv-kpi-trend-panel tv-panel">' +
          '<div class="tv-panel-head">' +
            '<div class="tv-panel-title">📈 최근 6개월 불량 추이</div>' +
            (midBadgeTxt ? '<span class="tv-mid-badge tv-mid-badge-sm">' + midBadgeTxt + '</span>' : '') +
          '</div>' +
          (qm.rowsTotal>0
            ? '<div class="tv-kpi-trend-area">' + lineSvg + '</div>'
            : '<div class="tv-empty"><div class="emoji">📊</div><div class="ttl">품질 데이터 없음</div></div>') +
        '</div>' +
        '<div class="tv-kpi-compare-panel tv-panel">' +
          '<div class="tv-panel-title">📐 전월 비교</div>' +
          (noQuality
            ? '<div class="tv-empty" style="padding:18px"><div class="ttl">데이터 없음</div></div>'
            : '<div class="tv-compare-block">' +
                '<div class="tv-compare-row">' +
                  '<div class="lbl">이번달 (' + monthLabel + ')</div>' +
                  '<div class="val">' + qm.currentCount + '<span class="u">건</span></div>' +
                '</div>' +
                '<div class="tv-compare-row">' +
                  '<div class="lbl">전월 (' + prevLabel + ')</div>' +
                  '<div class="val">' + qm.previousCount + '<span class="u">건</span></div>' +
                '</div>' +
                '<div class="tv-compare-row tv-compare-delta ' + deltaTotal.cls + '">' +
                  '<div class="lbl">증감</div>' +
                  '<div class="val">' + (deltaTotal.cls==='up'?'▲ ':deltaTotal.cls==='down'?'▼ ':'· ') +
                    Math.abs(deltaTotal.delta) + '<span class="u">건 · ' + deltaTotal.rate + '%</span></div>' +
                '</div>' +
              '</div>') +
        '</div>' +
      '</div>' +

      /* 3단: 중요도 + 분류 Top5 (잘림 방지: 210px 고정) */
      '<div class="tv-kpi-bottom-grid">' +
        '<div class="tv-panel"><div class="tv-panel-title">⚡ 이번달 중요도 분포</div>' +
          '<div class="tv-kpi-bot-list">' + sevHtml + '</div>' +
        '</div>' +
        '<div class="tv-panel"><div class="tv-panel-title">📋 이번달 분류별 불량 Top 5</div>' +
          '<div class="tv-kpi-bot-list">' + miniBars + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function tvKpiCard(label, value, unit, delta, color){
  var deltaHtml = '';
  if (delta && delta.tx){
    deltaHtml = '<div class="tv-kpi-delta ' + delta.cls + '">' +
      (delta.cls==='up'?'▲ ':delta.cls==='down'?'▼ ':'· ') +
      tvEsc(delta.tx) + '</div>';
  }
  return '<div class="tv-kpi-card ' + color + '">' +
    '<div class="tv-kpi-label">' + tvEsc(label) + '</div>' +
    '<div class="tv-kpi-value">' + tvEsc(value) + (unit?'<span class="unit">' + unit + '</span>':'') + '</div>' +
    deltaHtml +
  '</div>';
}

function tvMiniLane(label, n, color){
  var c = ({blue:'#3b82f6',orange:'#f59e0b',green:'#22c55e',red:'#ef4444'})[color]||'#3b82f6';
  return '<div style="display:flex;align-items:center;gap:14px;padding:10px 14px;background:#f8fafc;border-radius:12px;border:1px solid var(--tv-border-soft)">' +
    '<div style="width:14px;height:60px;border-radius:6px;background:' + c + '"></div>' +
    '<div style="display:flex;flex-direction:column;gap:2px"><div style="font-size:20px;font-weight:800;color:#475569">' + label + '</div>' +
    '<div style="font-size:38px;font-weight:900;color:#0f172a;font-variant-numeric:tabular-nums">' + n + '<span style="font-size:18px;color:#475569;font-weight:700">건</span></div></div>' +
  '</div>';
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 3: 현재 작업중인 제품
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideCurrentProducts(el, data){
  var pm = data.production.metrics;
  var prodSource = data.production.rowsSource || 'none';
  var period = data.period;
  var reason = pm.reason || 'no-rows';

  /* §7. 진단 배지 — 화면 하단에 작게 표시할 source/rows/candidate/ship 진단 */
  function buildDiagnosticBar(){
    return '<div class="tv-prod-diagnostic">' +
      '<span class="tv-diag-item"><span class="k">생산 source</span><span class="v">' + tvEsc(prodSource) + '</span></span>' +
      '<span class="tv-diag-item"><span class="k">생산 rows</span><span class="v">' + pm.rowsCount + '행</span></span>' +
      '<span class="tv-diag-item"><span class="k">작업중 후보</span><span class="v">' + pm.workCandidateCount + '건</span></span>' +
      '<span class="tv-diag-item"><span class="k">출하 예정</span><span class="v">' + pm.shipThisMonth + '건</span></span>' +
      '<span class="tv-diag-item"><span class="k">판정 기준일</span><span class="v">' + period.todayISO + '</span></span>' +
    '</div>';
  }

  /* 상태별 메인 영역 분기 */
  var mainHtml = '';
  if (reason === 'no-rows'){
    /* 1. 생산 rows 없음 — 데이터 연결 실패 */
    mainHtml =
      '<div class="tv-empty tv-empty-prod" style="flex:1">' +
        '<div class="emoji">🔌</div>' +
        '<div class="ttl">생산일정 데이터 연결 대기</div>' +
        '<div class="sub">탐색 source: WORK_DATA · YANGSAN_DATA · YEONJU_DATA · SCHEDULE_DATA · page-schedule DOM</div>' +
      '</div>';
  } else if (reason === 'no-active' || reason === 'only-ship-this-month'){
    /* 2. 생산 rows 있음 + 현재 작업중 제품 0건 */
    mainHtml =
      '<div class="tv-empty tv-empty-prod" style="flex:1">' +
        '<div class="emoji">🟢</div>' +
        '<div class="ttl">현재 작업중 제품 없음</div>' +
        '<div class="sub">생산 rows ' + pm.rowsCount + '행 · 작업중 후보 ' + pm.workCandidateCount + '건' +
          (pm.shipThisMonth>0 ? ' · 이번달 출하 예정 ' + pm.shipThisMonth + '건' : '') +
        '</div>' +
      '</div>';
  } else {
    /* 3. 정상 — 작업중 카드 표시 */
    mainHtml =
      '<div class="tv-prod-grid">' + pm.cards.map(function(c){
        var cls = 'tv-prod-card';
        if (c.lane==='inspect') cls += ' is-inspect';
        if (c.lane==='ship')    cls += ' is-ship';
        if (c.lane==='delay')   cls += ' is-delay';
        var laneLbl = ({work:'진행', inspect:'검사', ship:'출고준비', delay:'지연'})[c.lane] || c.status;
        return '<div class="' + cls + '">' +
          '<div class="hg">' + tvEsc(c.hoki) + '</div>' +
          '<div class="mdl">' + tvEsc(c.model) + '</div>' +
          (c.process && c.process!=='-' ? '<div style="font-size:17px;color:#475569;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">공정: ' + tvEsc(c.process) + '</div>' : '') +
          '<div class="meta">' +
            '<span class="badge">' + tvEsc(laneLbl) + '</span>' +
            (c.shipDate ? '<span class="date">' + tvEsc(c.shipDate) + '</span>' : '') +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
  }

  /* KPI 표시는 rows가 있을 때만 실값, 없으면 "-" */
  var noRows = !pm.hasRows;
  el.innerHTML =
    '<div class="tv-slide-title"><span class="tv-emoji">⚙</span>현재 작업중인 제품' +
      '<span class="tv-sub-label">기준 ' + period.todayISO + '</span>' +
    '</div>' +
    /* KPI */
    '<div class="tv-kpi-grid cols-4">' +
      tvKpiCard('작업중',   noRows?'-':pm.working,    '건', null, 'blue') +
      tvKpiCard('검사중',   noRows?'-':pm.inspecting, '건', null, 'orange') +
      tvKpiCard('출고준비', noRows?'-':pm.shipReady,  '건', null, 'green') +
      tvKpiCard('지연',     noRows?'-':pm.delayed,    '건', null, 'red') +
    '</div>' +
    mainHtml +
    buildDiagnosticBar();
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 3 (08U 신규): 이번달 품질 집중관리 항목
 *   - 실제 품질 데이터만 사용 (생산 데이터 불안정 회피)
 *   - 전월 대비 증가 분류 Top 5 + 중요도별 조치 우선순위
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideQualityFocus(el, data){
  /* §FIX: 데이터 가드 */
  var qm = (data && data.quality && data.quality.metrics) ? data.quality.metrics : {};
  var period = (data && data.period) ? data.period : { currentMonthKey:'', previousMonthKey:'', todayISO:'' };
  var noQ = !(data && data.quality && data.quality.rows && data.quality.rows.length > 0);
  var qSource = (data && data.quality && (data.quality.rowsSource || data.quality.source)) || 'none';
  if (!qm.currentSeverity)  qm.currentSeverity  = {'치명':0,'주요':0,'일반':0,'기타':0};
  if (!qm.previousSeverity) qm.previousSeverity = {'치명':0,'주요':0,'일반':0,'기타':0};
  if (!qm.currentCategoryTop5) qm.currentCategoryTop5 = [];
  var monthLabel = tvMonthLabel(period.currentMonthKey);
  var prevLabel  = tvMonthLabel(period.previousMonthKey);

  /* §4. 전월 대비 증가 분류 Top 5 — currentCategoryTop5에 prev 필드 활용 */
  var cats = (qm.currentCategoryTop5||[]).slice().sort(function(a,b){
    return ((b.n-(b.prev||0)) - (a.n-(a.prev||0)));
  });
  var increasing = cats.filter(function(c){ return c.n - (c.prev||0) > 0; }).slice(0,5);
  var increasingCount = increasing.length;

  /* 중요도 합계: 주요+치명 */
  var sev = qm.currentSeverity;
  var prevSev = qm.previousSeverity;
  var critMajor = (sev['치명']||0) + (sev['주요']||0);
  var critMajorPrev = (prevSev['치명']||0) + (prevSev['주요']||0);
  var deltaCM = tvFormatDelta(critMajor, critMajorPrev);

  /* 조치필요 추정 — 치명 + 주요 (조치 상태 필드가 데이터에 따라 다를 수 있어 보수적 산정) */
  var needAction = critMajor;

  /* 증가 분류 bar 렌더 */
  var incBars = increasing.length ? increasing.map(function(c, idx){
    var delta = c.n - (c.prev||0);
    var pct = Math.min(100, Math.round(delta / Math.max(1, c.n) * 100) + 25);
    return '<div class="tv-bar-row tv-bar-row-focus">' +
      '<div class="tv-bar-name">' + tvEsc(c.name) + '</div>' +
      '<div class="tv-bar-track"><i style="width:' + pct + '%;background:' + tvCatColor(idx) + '"></i></div>' +
      '<div class="tv-bar-value">' + c.n + '<span class="u-sm">/' + (c.prev||0) + '</span></div>' +
      '<div class="tv-delta up">+' + delta + '</div>' +
    '</div>';
  }).join('') : '<div class="tv-empty" style="padding:18px"><div class="ttl">전월 대비 증가 분류 없음</div></div>';

  /* 중요도 우선순위 (조치 시각화) */
  var sevRows = ['치명','주요','일반','기타'].map(function(k){
    var n = sev[k]||0;
    var pn = prevSev[k]||0;
    var dlt = tvFormatDelta(n, pn);
    var priority = ({'치명':'P1 최우선','주요':'P2 우선','일반':'P3','기타':'P4'})[k];
    return '<div class="tv-focus-sev-row">' +
      '<div class="tv-focus-sev-tag" style="background:' + TV_SEV_COLORS[k] + '">' + k + '</div>' +
      '<div class="tv-focus-sev-mid">' +
        '<div class="tv-focus-sev-priority">' + priority + '</div>' +
        '<div class="tv-focus-sev-count">' + n + '<span class="u">건</span>' +
          '<span class="tv-delta-inline ' + dlt.cls + '">' + tvEsc(dlt.tx) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  el.innerHTML =
    '<div class="tv-focus-page">' +
      '<div class="tv-slide-title"><span class="tv-emoji">🎯</span>이번달 품질 집중관리 항목' +
        '<span class="tv-sub-label">기준 ' + monthLabel + ' · 전월 ' + prevLabel + '</span>' +
      '</div>' +
      /* 상단 KPI 3개 */
      '<div class="tv-kpi-grid cols-3 tv-focus-kpis">' +
        '<div class="tv-kpi-card tv-kpi-card-c red">' +
          '<div class="tv-kpi-label">이번달 주요·치명 합계</div>' +
          '<div class="tv-kpi-value">' + (noQ?'-':critMajor) + '<span class="u">건</span></div>' +
          (noQ?'':'<div class="tv-kpi-delta ' + deltaCM.cls + '">' +
            (deltaCM.cls==='up'?'▲ ':deltaCM.cls==='down'?'▼ ':'· ') + tvEsc(deltaCM.tx) + '</div>') +
        '</div>' +
        '<div class="tv-kpi-card tv-kpi-card-c orange">' +
          '<div class="tv-kpi-label">전월 대비 증가 분류</div>' +
          '<div class="tv-kpi-value">' + (noQ?'-':increasingCount) + '<span class="u">건</span></div>' +
        '</div>' +
        '<div class="tv-kpi-card tv-kpi-card-c blue">' +
          '<div class="tv-kpi-label">조치 필요 추정</div>' +
          '<div class="tv-kpi-value">' + (noQ?'-':needAction) + '<span class="u">건</span></div>' +
        '</div>' +
      '</div>' +
      /* 중앙: 증가 Top5 + 중요도 우선순위 */
      '<div class="tv-focus-main-grid">' +
        '<div class="tv-panel">' +
          '<div class="tv-panel-title">📈 전월 대비 증가한 분류 Top 5</div>' +
          (noQ
            ? '<div class="tv-empty"><div class="ttl">품질 데이터 없음</div><div class="sub">source: ' + tvEsc(qSource) + '</div></div>'
            : '<div class="tv-focus-bars">' + incBars + '</div>') +
        '</div>' +
        '<div class="tv-panel">' +
          '<div class="tv-panel-title">⚡ 중요도별 조치 우선순위</div>' +
          '<div class="tv-focus-sev-list">' + sevRows + '</div>' +
        '</div>' +
      '</div>' +
      /* 하단: 작업자 확인 문구 */
      '<div class="tv-focus-notes">' +
        '<div class="tv-focus-note"><span class="ico">⚠</span>증가 분류는 원인 확인 필요</div>' +
        '<div class="tv-focus-note"><span class="ico">🔧</span>주요·치명 이슈는 조치 상태 확인 필요</div>' +
      '</div>' +
    '</div>';
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 5: 품질 / 불량 현황
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideQualityOverview(el, data){
  /* §FIX: 데이터 가드 */
  var qm = (data && data.quality && data.quality.metrics) ? data.quality.metrics : {};
  var period = (data && data.period) ? data.period : { currentMonthKey:'' };
  var noQ = !(data && data.quality && data.quality.rows && data.quality.rows.length > 0);
  if (!qm.currentSeverity)  qm.currentSeverity  = {'치명':0,'주요':0,'일반':0,'기타':0};
  if (!qm.previousSeverity) qm.previousSeverity = {'치명':0,'주요':0,'일반':0,'기타':0};
  if (!qm.currentCategoryTop5) qm.currentCategoryTop5 = [];
  if (typeof qm.currentCount === 'undefined') qm.currentCount = 0;
  if (typeof qm.previousCount === 'undefined') qm.previousCount = 0;
  var sev = qm.currentSeverity;
  var prevSev = qm.previousSeverity;
  var deltaTotal = tvFormatDelta(qm.currentCount, qm.previousCount);

  /* Top5 분류 bar */
  var top5 = qm.currentCategoryTop5;
  var maxN = 1; for (var i=0;i<top5.length;i++) if (top5[i].n>maxN) maxN = top5[i].n;
  var bars = top5.length ? top5.map(function(c, idx){
    var pct = Math.round(c.n/maxN*100);
    var dlt = tvFormatDelta(c.n, c.prev);
    return '<div class="tv-bar-row">' +
      '<div class="tv-bar-name">' + tvEsc(c.name) + '</div>' +
      '<div class="tv-bar-track"><i style="width:' + pct + '%;background:' + tvCatColor(idx) + '"></i></div>' +
      '<div class="tv-bar-value">' + c.n + '<span class="unit">건</span></div>' +
      '<div class="tv-delta ' + dlt.cls + '">' + tvEsc(dlt.tx) + '</div>' +
    '</div>';
  }).join('') : '<div class="tv-empty" style="min-height:200px"><div class="emoji">📭</div><div class="ttl">분류 데이터 없음</div></div>';

  /* Donut */
  var donut = tvBuildDonut([
    { k:'치명', n:sev['치명'], c:TV_SEV_COLORS['치명'] },
    { k:'주요', n:sev['주요'], c:TV_SEV_COLORS['주요'] },
    { k:'일반', n:sev['일반'], c:TV_SEV_COLORS['일반'] },
    { k:'기타', n:sev['기타'], c:TV_SEV_COLORS['기타'] }
  ]);

  /* 경고 */
  var warns = [];
  if (sev['치명']>0) warns.push({ cls:'crit', em:'⚠️', tx:'치명 ' + sev['치명'] + '건 즉시 확인 필요' });
  if (sev['주요']>0) warns.push({ cls:'warn', em:'⚡', tx:'주요 ' + sev['주요'] + '건 모니터링 필요' });
  if (warns.length === 0 && !noQ) warns.push({ cls:'ok', em:'✅', tx:'이번달 치명/주요 이슈 없음' });
  /* 증가 분류 경고 */
  var increased = top5.filter(function(c){ return c.n > c.prev; });
  if (increased.length>0){
    warns.push({ cls:'warn', em:'📈', tx:'전월 대비 증가 분류: ' + increased.slice(0,2).map(function(c){return c.name;}).join(', ') });
  }
  /* 증빙 확인 보조 카드 */
  if (qm.missingImageCount > 0){
    warns.push({ cls:'warn', em:'📷', tx:'증빙 확인 필요 ' + qm.missingImageCount + '건' });
  }

  el.innerHTML =
    '<div class="tv-quality-page">' +
      '<div class="tv-slide-title"><span class="tv-emoji">🔬</span>품질 / 불량 현황 — 이번달 기준' +
        '<span class="tv-sub-label">' + tvMonthLabel(period.currentMonthKey) + '</span>' +
      '</div>' +
      /* KPI 4개 — KPI 카드 inline (이번달 불량은 inline 전월대비 포함) */
      '<div class="tv-quality-kpis">' +
        '<div class="tv-kpi-card tv-kpi-card-c blue tv-kpi-primary">' +
          '<div class="tv-kpi-label">이번달 불량</div>' +
          '<div class="tv-kpi-inline">' +
            '<strong>' + (noQ?'-':qm.currentCount) + '<span class="u">건</span></strong>' +
            (noQ?'':'<span class="tv-kpi-inline-delta ' + deltaTotal.cls + '">' +
              (deltaTotal.cls==='up'?'▲ ':deltaTotal.cls==='down'?'▼ ':'· ') +
              '전월 ' + (deltaTotal.delta>=0?'+':'') + deltaTotal.delta + '건 / ' + deltaTotal.rate + '%' +
            '</span>') +
          '</div>' +
        '</div>' +
        '<div class="tv-kpi-card tv-kpi-card-c red">' +
          '<div class="tv-kpi-label">치명</div>' +
          '<div class="tv-kpi-value">' + (noQ?'-':sev['치명']) + '<span class="u">건</span></div>' +
        '</div>' +
        '<div class="tv-kpi-card tv-kpi-card-c orange">' +
          '<div class="tv-kpi-label">주요</div>' +
          '<div class="tv-kpi-value">' + (noQ?'-':sev['주요']) + '<span class="u">건</span></div>' +
        '</div>' +
        '<div class="tv-kpi-card tv-kpi-card-c gray">' +
          '<div class="tv-kpi-label">일반 / 기타</div>' +
          '<div class="tv-kpi-value">' + (noQ?'-':(sev['일반']+sev['기타'])) + '<span class="u">건</span></div>' +
        '</div>' +
      '</div>' +
      /* MID: bar (1.2fr) + donut (0.8fr) */
      '<div class="tv-quality-main-grid tv-quality-overview">' +
        '<div class="tv-panel">' +
          '<div class="tv-panel-title">📋 이번달 분류별 불량 Top 5</div>' +
          '<div class="tv-bar-list">' + bars + '</div>' +
          (qm.currentCategoryOtherN>0 ? '<div class="tv-cat-other">📦 기타 분류 ' + qm.currentCategoryOtherCount + '종 / 합계 ' + qm.currentCategoryOtherN + '건</div>' : '') +
        '</div>' +
        '<div class="tv-panel">' +
          '<div class="tv-panel-title">⚡ 이번달 중요도 분포</div>' +
          (noQ
            ? '<div class="tv-empty"><div class="emoji">⚪</div><div class="ttl">중요도 데이터 없음</div></div>'
            : donut) +
        '</div>' +
      '</div>' +
      /* 하단: 조치 참고 (2열 grid + 2-line clamp) */
      '<div class="tv-quality-bottom tv-action-note">' +
        (warns.length === 0
          ? '<div class="note"><span class="ico">✅</span>이번달 특이사항 없음</div>'
          : warns.slice(0,2).map(function(w){
              return '<div class="note ' + w.cls + '"><span class="ico">' + w.em + '</span>' + tvEsc(w.tx) + '</div>';
            }).join('')) +
      '</div>' +
    '</div>';
}

/* Donut builder */
function tvBuildDonut(items){
  var total = 0; for (var i=0;i<items.length;i++) total += items[i].n;
  var cx = 170, cy = 170, R = 130, r = 78;
  var segs = '';
  if (total > 0){
    var ang = -Math.PI/2;
    for (var j=0;j<items.length;j++){
      var n = items[j].n; if (!n) continue;
      var p = n / total;
      var a2 = ang + p * Math.PI * 2;
      var x1 = cx + R*Math.cos(ang), y1 = cy + R*Math.sin(ang);
      var x2 = cx + R*Math.cos(a2),  y2 = cy + R*Math.sin(a2);
      var xi1 = cx + r*Math.cos(ang), yi1 = cy + r*Math.sin(ang);
      var xi2 = cx + r*Math.cos(a2),  yi2 = cy + r*Math.sin(a2);
      var large = (a2 - ang) > Math.PI ? 1 : 0;
      var dPath = 'M ' + x1 + ' ' + y1 + ' A ' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 +
                  ' L ' + xi2 + ' ' + yi2 + ' A ' + r + ' ' + r + ' 0 ' + large + ' 0 ' + xi1 + ' ' + yi1 + ' Z';
      segs += '<path d="' + dPath + '" fill="' + items[j].c + '"></path>';
      ang = a2;
    }
  } else {
    segs = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#e8edf4"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff"/>';
  }

  var legendRows = items.map(function(it){
    var pct = total ? Math.round(it.n/total*100) : 0;
    return '<div class="tv-donut-legend-row">' +
      '<div class="sw" style="background:' + it.c + '"></div>' +
      '<div class="nm">' + tvEsc(it.k) + '</div>' +
      '<div class="bar"><i style="width:' + pct + '%;background:' + it.c + '"></i></div>' +
      '<div class="vl">' + it.n + '<span style="font-size:14px;color:#475569;font-weight:700;margin-left:2px">건</span></div>' +
    '</div>';
  }).join('');

  return '<div class="tv-donut-wrap">' +
    '<div><svg class="tv-donut-svg" viewBox="0 0 340 340">' + segs +
    '<text class="tv-donut-center" x="170" y="170" text-anchor="middle" dominant-baseline="central" style="font-size:42px;fill:var(--tv-text)">' + total + '</text>' +
    '<text class="tv-donut-center" x="170" y="210" text-anchor="middle" dominant-baseline="central" style="font-size:16px;fill:var(--tv-sub);font-weight:700">건</text>' +
    '</svg></div>' +
    '<div class="tv-donut-legend">' + legendRows + '</div>' +
  '</div>';
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 7: 월별 불량추이
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideMonthlyTrend(el, data){
  var trend = data.charts.monthlyTrend;
  var qm = data.quality.metrics;
  var period = data.period;
  var noQ = (data.quality.rows.length === 0);

  /* 월간 목표 (참고 목표: 직전 5개월 평균 * 0.9) */
  var sum=0, cnt=0;
  for (var i=0;i<trend.length-1;i++){ sum += trend[i].n; cnt++; }
  var target = cnt? Math.round(sum/cnt * 0.9) : 0;
  var thisMonth = trend.length ? trend[trend.length-1].n : 0;
  var prevMonth = trend.length>1 ? trend[trend.length-2].n : 0;
  var deltaPM = tvFormatDelta(thisMonth, prevMonth);
  var targetRate = target>0 ? Math.round(thisMonth / target * 100) : 0;

  /* 현재월 / 월중 판정 */
  var now = new Date();
  var endOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 0);
  var nowMK = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var isCurrent = (period.currentMonthKey === nowMK);
  var isMid = isCurrent && (now.getDate() < endOfMonth.getDate());
  var curMonthLbl = isCurrent ? ((now.getMonth()+1) + '월 현재까지') : tvMonthLabel(period.currentMonthKey);
  var midBadge = isMid ? '<span class="tv-mid-badge">⏳ 월중 집계 · ' + period.todayISO + ' 기준</span>' : '';

  /* §11. 모든 월 수치 표시 + alternateLabelOffset */
  var chart = tvBuildLineChart(trend, {
    compact:false, height:430, target:target,
    showAllPointLabels:true, labelMode:'number-only', alternateLabelOffset:true,
    currentIdx: trend.length-1, isMid:isMid
  });

  el.innerHTML =
    '<div class="tv-monthly-page">' +
      '<div class="tv-slide-title"><span class="tv-emoji">📈</span>월별 불량추이' +
        '<span class="tv-sub-label">최근 6개월</span>' +
      '</div>' +
      /* 차트 카드 — 1fr 가로 풀, 모든 월 수치 표시 */
      '<div class="tv-monthly-chart-card tv-panel">' +
        '<div class="tv-monthly-chart-head">' +
          '<div class="tv-monthly-chart-subtitle">최근 6개월 불량 발생 추이' +
            (isMid ? ' <span class="tv-mid-chip">' + ((new Date()).getMonth()+1) + '월 현재까지</span>' : '') +
          '</div>' +
          '<div class="tv-chart-legend">' +
            '<div class="tv-chart-legend-item" style="color:#3b82f6"><span class="sw line" style="background:#3b82f6"></span>실적</div>' +
            '<div class="tv-chart-legend-item" style="color:#22c55e"><span class="sw line dashed" style="background:#22c55e"></span>참고 목표 ' + target + '건</div>' +
            (isMid ? '<div class="tv-chart-legend-item" style="color:#f59e0b"><span class="sw dot" style="background:#fff;border:3px solid #f59e0b"></span>월중</div>' : '') +
          '</div>' +
        '</div>' +
        (noQ
          ? '<div class="tv-empty" style="flex:1"><div class="emoji">📊</div><div class="ttl">품질 데이터 없음</div></div>'
          : '<div class="tv-monthly-chart-area">' + chart + '</div>') +
      '</div>' +
      /* 하단 KPI 4개 — 현재월은 "5월 현재까지" 표기 */
      '<div class="tv-kpi-grid cols-4 tv-monthly-kpis">' +
        tvKpiCard(curMonthLbl, noQ?'-':thisMonth, '건', null, isMid?'cyan':'blue') +
        tvKpiCard('전월 대비', noQ?'-':((deltaPM.delta>=0?'+':'')+deltaPM.delta),'건',
          noQ?null:{tx:deltaPM.rate+'%',cls:deltaPM.cls,delta:0,rate:0},
          deltaPM.cls==='up'?'red':deltaPM.cls==='down'?'green':'gray') +
        tvKpiCard('참고 목표', target, '건', null, 'green') +
        tvKpiCard(isMid?'월중 목표 대비':'목표 달성률', noQ?'-':(target>0?(thisMonth<=target?'달성':(targetRate+'%')):'-'),'',null,
          (target>0 && thisMonth<=target)?'green':'red') +
      '</div>' +
      /* 월중 기준일 표시 — 별도 chip */
      (isMid ? '<div class="tv-monthly-chart-foot"><span class="tv-mid-badge">⏳ ' + period.todayISO + ' 기준 · 월중 집계</span></div>' : '') +
    '</div>';
}

/* Line chart builder — 08U: viewBox 1100×430, showAllPointLabels alternate offset, hollow dot for current month */
function tvBuildLineChart(points, opts){
  opts = opts || {};
  var W = opts.width || 1100, H = opts.height || 430;
  var padL = 64, padR = 42, padT = 42, padB = 58;
  var n = points.length || 1;
  var maxV = 1;
  for (var i=0;i<points.length;i++) if (points[i].n>maxV) maxV = points[i].n;
  if (opts.target && opts.target>maxV) maxV = opts.target;
  maxV = Math.max(maxV, 5);
  var stepY = Math.ceil(maxV / 4);
  maxV = stepY * 4;

  function px(i){ return padL + (i/(n-1||1)) * (W - padL - padR); }
  function py(v){ return padT + (1 - v/maxV) * (H - padT - padB); }

  /* gridlines */
  var grid = '';
  for (var g=0;g<=4;g++){
    var y = padT + g * ((H-padT-padB)/4);
    var val = Math.round(maxV - g*stepY);
    grid += '<line class="tv-line-grid" x1="' + padL + '" y1="' + y + '" x2="' + (W-padR) + '" y2="' + y + '"/>';
    grid += '<text class="tv-line-axis" x="' + (padL-12) + '" y="' + (y+7) + '" text-anchor="end">' + val + '</text>';
  }
  /* x labels */
  var xlbl = '';
  for (var k=0;k<n;k++){
    xlbl += '<text class="tv-line-axis" x="' + px(k) + '" y="' + (H-padB+30) + '" text-anchor="middle">' + tvEsc(points[k].label) + '</text>';
  }
  /* target line */
  var targetLine = '';
  if (opts.target){
    var yT = py(opts.target);
    targetLine = '<line x1="' + padL + '" y1="' + yT + '" x2="' + (W-padR) + '" y2="' + yT +
      '" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="8 6"/>';
  }
  /* line path */
  var d = '', dotsSvg = '';
  for (var p=0;p<n;p++){
    var x=px(p), yv=py(points[p].n);
    d += (p===0?'M ':'L ') + x + ' ' + yv + ' ';
    /* 현재월은 hollow dot (마감값 아님 시각 표시) */
    var isCurrentPt = (opts.currentIdx === p);
    var isMidPt = isCurrentPt && opts.isMid;
    var ringColor = isMidPt ? '#f59e0b' : '#3b82f6';
    var ringR = isMidPt ? 9 : 6;
    /* 월중일 때만 hollow + 점선 ring 효과: 외곽선 두껍게 */
    var strokeW = isMidPt ? 4 : 3;
    dotsSvg += '<circle cx="' + x + '" cy="' + yv + '" r="' + ringR + '" fill="#fff" stroke="' + ringColor + '" stroke-width="' + strokeW + '"/>';
  }
  var area = d + 'L ' + px(n-1) + ' ' + (H-padB) + ' L ' + px(0) + ' ' + (H-padB) + ' Z';

  /* §7+§11. 라벨 — showAllPointLabels (08U 신규) 또는 showAllLabels (08T 호환) 모두 인식 */
  var labels = '';
  var showAll = opts.showAllPointLabels || opts.showAllLabels;
  if (showAll){
    /* alternateLabelOffset: 짝수 인덱스는 위, 홀수는 아래 */
    var alt = opts.alternateLabelOffset !== false;
    for (var pi=0;pi<n;pi++){
      var lx = px(pi), ly = py(points[pi].n);
      var yOff;
      var isCur = (opts.currentIdx === pi);
      /* 우선순위: clamp(상하단) > 현재월(-24) > 최대값(-26) > alternate */
      var isMax = true;
      for (var mi=0;mi<n;mi++) if (points[mi].n > points[pi].n) { isMax = false; break; }
      if (ly < padT + 30) yOff = 28;                     /* 차트 상단 너무 가까우면 무조건 아래 */
      else if (ly > H - padB - 28) yOff = -22;           /* 차트 하단 가까우면 무조건 위 */
      else if (isCur) yOff = -24;                        /* 현재월 위 */
      else if (isMax) yOff = -26;                        /* 최대값 위 */
      else if (alt) yOff = (pi%2===0) ? -20 : 26;        /* 짝수 위, 홀수 아래 */
      else yOff = -20;
      /* clamp 최종 안전망 */
      if (ly + yOff < 12) yOff = 28;
      if (ly + yOff > H - 6) yOff = -22;
      var color = isCur ? (opts.isMid?'#f59e0b':'#3b82f6') : '#0f172a';
      /* §7. labelMode:'number-only' 강제 — 단위 없음, "월중" 텍스트 라벨에 안 붙임 */
      var labelText = String(points[pi].n);
      labels += '<text class="tv-chart-point-label" x="' + lx + '" y="' + (ly+yOff) +
        '" text-anchor="middle" style="fill:' + color + '">' + labelText + '</text>';
    }
  } else {
    /* compact 모드: 마지막/전월/최대만 */
    var maxIdx2 = 0;
    for (var mj=0;mj<n;mj++) if (points[mj].n > points[maxIdx2].n) maxIdx2 = mj;
    function lblFor(idx, color){
      var x = px(idx), y = py(points[idx].n);
      var yOff = (y < padT + 36) ? 24 : -16;
      return '<text class="tv-chart-point-label" x="' + x + '" y="' + (y+yOff) + '" text-anchor="middle" style="fill:' + color + '">' + points[idx].n + '</text>';
    }
    if (n>=2) labels += lblFor(n-1, '#0f172a');
    if (n>=3 && maxIdx2 !== n-1 && maxIdx2 !== n-2) labels += lblFor(maxIdx2, '#ef4444');
    if (n>=2 && maxIdx2 !== n-2) labels += lblFor(n-2, '#475569');
  }

  return '<svg class="tv-line-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' +
    grid +
    '<path d="' + area + '" fill="rgba(59,130,246,.10)"/>' +
    targetLine +
    '<path d="' + d + '" fill="none" stroke="#3b82f6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    dotsSvg + xlbl + labels +
  '</svg>';
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 8: 중요도 분포 (이번달 vs 전월)
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideSeverityCompare(el, data){
  var qm = data.quality.metrics;
  var period = data.period;
  var noQ = (data.quality.rows.length === 0);
  var cur = qm.currentSeverity, prev = qm.previousSeverity;

  var donut = tvBuildDonut([
    { k:'치명', n:cur['치명'], c:TV_SEV_COLORS['치명'] },
    { k:'주요', n:cur['주요'], c:TV_SEV_COLORS['주요'] },
    { k:'일반', n:cur['일반'], c:TV_SEV_COLORS['일반'] },
    { k:'기타', n:cur['기타'], c:TV_SEV_COLORS['기타'] }
  ]);

  var rows = ['치명','주요','일반','기타'].map(function(k, i){
    var n = cur[k]||0, pn = prev[k]||0;
    var dlt = tvFormatDelta(n, pn);
    return '<div class="c first ' + (i===3?'row-last':'') + '"><div class="sw" style="background:' + TV_SEV_COLORS[k] + '"></div>' + k + '</div>' +
      '<div class="c ' + (i===3?'row-last':'') + '">' + n + '</div>' +
      '<div class="c ' + (i===3?'row-last':'') + '" style="color:#475569">' + pn + '</div>' +
      '<div class="c ' + (i===3?'row-last':'') + ' tv-delta ' + dlt.cls + '">' + (dlt.delta>0?'+':'') + dlt.delta + '</div>';
  }).join('');

  var warn = '';
  if ((cur['치명']||0) > (prev['치명']||0)) warn = '<div class="tv-warn-card crit"><div class="em">⚠️</div><div class="tx">치명 이슈 전월 대비 증가 (' + (prev['치명']||0) + '→' + (cur['치명']||0) + '건)</div></div>';
  else if ((cur['주요']||0) > (prev['주요']||0)) warn = '<div class="tv-warn-card warn"><div class="em">⚡</div><div class="tx">주요 이슈 전월 대비 증가 (' + (prev['주요']||0) + '→' + (cur['주요']||0) + '건)</div></div>';
  else if (!noQ) warn = '<div class="tv-warn-card ok"><div class="em">✅</div><div class="tx">전월 대비 안정</div></div>';

  el.innerHTML =
    '<div class="tv-slide-title"><span class="tv-emoji">⚡</span>중요도 분포 — 이번달 / 전월 대비' +
      '<span class="tv-sub-label">' + tvMonthLabel(period.currentMonthKey) + ' vs ' + tvMonthLabel(period.previousMonthKey) + '</span>' +
    '</div>' +
    '<div class="tv-sev-grid">' +
      '<div class="tv-panel">' +
        '<div class="tv-panel-title">이번달 중요도 분포</div>' +
        (noQ
          ? '<div class="tv-empty"><div class="emoji">⚪</div><div class="ttl">데이터 없음</div></div>'
          : donut) +
      '</div>' +
      '<div class="tv-panel">' +
        '<div class="tv-panel-title">전월 대비 비교표</div>' +
        '<div class="tv-cmp-table">' +
          '<div class="h first">중요도</div>' +
          '<div class="h">이번달</div>' +
          '<div class="h">전월</div>' +
          '<div class="h">증감</div>' +
          rows +
        '</div>' +
        '<div style="margin-top:auto">' + warn + '</div>' +
        '<div style="font-size:13px;color:var(--tv-muted);font-weight:600;text-align:right">전체 누적 ' + qm.rowsTotal + '건</div>' +
      '</div>' +
    '</div>';
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 9: 분류별 불량
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideCategoryCompare(el, data){
  var qm = data.quality.metrics;
  var period = data.period;
  var noQ = (data.quality.rows.length === 0);
  var top5 = qm.currentCategoryTop5;

  var maxN = 1; for (var i=0;i<top5.length;i++) if (top5[i].n>maxN) maxN = top5[i].n;
  var bars = top5.map(function(c, idx){
    var pct = Math.round(c.n/maxN*100);
    var dlt = tvFormatDelta(c.n, c.prev);
    return '<div class="tv-bar-row" style="grid-template-columns:260px 1fr 110px 130px;min-height:64px">' +
      '<div class="tv-bar-name" style="font-size:28px">' + tvEsc(c.name) + '</div>' +
      '<div class="tv-bar-track" style="height:38px"><i style="width:' + pct + '%;background:' + tvCatColor(idx) + '"></i></div>' +
      '<div class="tv-bar-value" style="font-size:32px">' + c.n + '<span class="unit">건</span></div>' +
      '<div class="tv-delta ' + dlt.cls + '" style="font-size:20px">' + tvEsc(dlt.tx) + '</div>' +
    '</div>';
  }).join('');

  el.innerHTML =
    '<div class="tv-slide-title"><span class="tv-emoji">📋</span>분류별 불량 — 이번달 / 전월 대비' +
      '<span class="tv-sub-label">' + tvMonthLabel(period.currentMonthKey) + '</span>' +
    '</div>' +
    '<div class="tv-cat-grid">' +
      '<div class="tv-panel" style="flex:1">' +
        '<div class="tv-panel-title">이번달 분류 Top 5 (전월 비교 포함)</div>' +
        (noQ
          ? '<div class="tv-empty"><div class="emoji">📊</div><div class="ttl">품질 데이터 없음</div></div>'
          : (top5.length===0
            ? '<div class="tv-empty"><div class="emoji">📭</div><div class="ttl">이번달 불량 0건</div></div>'
            : '<div class="tv-bar-list">' + bars + '</div>')) +
      '</div>' +
      (qm.currentCategoryOtherN>0
        ? '<div class="tv-cat-other">📦 기타 분류 ' + qm.currentCategoryOtherCount + '종 / 합계 ' + qm.currentCategoryOtherN + '건 (Top5 외)</div>'
        : '') +
    '</div>';
}

/* ─────────────────────────────────────────────────────────
 * SLIDE 11: 이번달 일정 달력
 * ───────────────────────────────────────────────────────── */
function tvRenderSlideCalendar(el, data){
  var cal = data.calendar;
  var noProd = (data.production.rows.length === 0);

  /* 달력 grid 생성 */
  var y = cal.year, m = cal.month;
  var firstDay = new Date(y, m-1, 1);
  var startWeekday = firstDay.getDay();
  var lastDate = new Date(y, m, 0).getDate();
  var prevLastDate = new Date(y, m-1, 0).getDate();

  /* 6주 표시 */
  var cells = [];
  for (var i=0;i<42;i++){
    var dayInGrid = i - startWeekday + 1;
    var cell = { isOut:false, day:0, mk:'', dk:'', wd:i%7, isToday:false, hol:'' };
    if (dayInGrid < 1){
      cell.isOut = true; cell.day = prevLastDate + dayInGrid;
      var pm = (m===1?12:m-1), py2 = (m===1?y-1:y);
      cell.mk = py2 + '-' + String(pm).padStart(2,'0');
    } else if (dayInGrid > lastDate){
      cell.isOut = true; cell.day = dayInGrid - lastDate;
      var nm2 = (m===12?1:m+1), ny2 = (m===12?y+1:y);
      cell.mk = ny2 + '-' + String(nm2).padStart(2,'0');
    } else {
      cell.day = dayInGrid; cell.mk = cal.monthKey;
    }
    cell.dk = cell.mk + '-' + String(cell.day).padStart(2,'0');
    /* today check */
    var now = new Date();
    var tk = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    if (cell.dk === tk) cell.isToday = true;
    /* 공휴일 체크 */
    var mdKey = String(m).padStart(2,'0') + '-' + String(cell.day).padStart(2,'0');
    /* §12. 공휴일 체크 — tvGetHolidayMap (양력 고정 + 2026 음력 static + ODI_HOLIDAY_MAP override) */
    if (!cell.isOut){
      var yk = (cell.mk||'').split('-')[0];
      var holMap = tvGetHolidayMap(yk);
      if (holMap[cell.dk]) cell.hol = holMap[cell.dk];
    }
    cells.push(cell);
  }
  /* 마지막 행이 모두 다음달이면 자르기 */
  var fullWeeks = 6;
  if (cells.slice(35, 42).every(function(c){ return c.isOut; })) fullWeeks = 5;

  var cellsHtml = '';
  for (var ci=0;ci<fullWeeks*7;ci++){
    var c = cells[ci];
    var cls = 'tv-cal-cell';
    if (c.isOut) cls += ' is-out';
    if (c.isToday) cls += ' is-today';
    if (c.wd === 6) cls += ' is-sat';
    if (c.wd === 0) cls += ' is-sun';
    if (c.hol) cls += ' is-hol';
    var evs = cal.events[c.dk] || [];
    var visible = evs.slice(0,2);
    var moreN = evs.length - visible.length;
    cellsHtml += '<div class="' + cls + '">' +
      '<div class="dn">' + c.day + (c.hol?'<span class="hol">' + tvEsc(c.hol) + '</span>':'') + '</div>' +
      visible.map(function(e){
        return '<div class="tv-cal-chip t-' + e.type + '">' + tvEsc(e.label) + '</div>';
      }).join('') +
      (moreN>0?'<div class="tv-cal-more">+' + moreN + '건</div>':'') +
    '</div>';
  }

  /* 이벤트 통계 */
  var evCount = 0;
  for (var ek in cal.events) if (cal.events.hasOwnProperty(ek)) evCount += cal.events[ek].length;

  el.innerHTML =
    /* §13. tv-calendar-page grid 58px / 1fr */
    '<div class="tv-calendar-page">' +
      '<div class="tv-calendar-page-head">' +
        '<div id="tvCalendarMonthTitle" class="tv-calendar-month-title">' + cal.label + '</div>' +
        '<div class="tv-cal-legend">' +
          '<div class="it"><div class="sw" style="background:var(--tv-green)"></div>출하</div>' +
          '<div class="it"><div class="sw" style="background:var(--tv-orange)"></div>검사/품질</div>' +
          '<div class="it"><div class="sw" style="background:var(--tv-blue)"></div>작업/생산</div>' +
          '<div class="it"><div class="sw" style="background:var(--tv-red)"></div>지연</div>' +
          (noProd ? '<div class="it" style="color:#94a3b8">· 생산 데이터 없음</div>' : '<div class="it" style="color:#94a3b8">· 이벤트 ' + evCount + '건</div>') +
        '</div>' +
      '</div>' +
      '<div class="tv-cal-grid-wrap">' +
        '<div class="tv-cal-grid">' +
          '<div class="tv-cal-week-header">' +
            '<div class="wd sun">일</div><div class="wd">월</div><div class="wd">화</div>' +
            '<div class="wd">수</div><div class="wd">목</div><div class="wd">금</div>' +
            '<div class="wd sat">토</div>' +
          '</div>' +
          '<div class="tv-cal-body">' + cellsHtml + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* =====================================================================
 * §11. 슬라이드 컨트롤
 * ===================================================================== */
function tvGoSlide(idx){
  if (!tvState.initialized) return;
  if (idx < 0) idx = ODI_TV_SLIDES.length - 1;
  if (idx >= ODI_TV_SLIDES.length) idx = 0;
  tvState.idx = idx;

  var stage = document.getElementById('tvBoardStage');
  if (!stage) return;
  var sections = stage.children;
  for (var i=0;i<sections.length;i++){
    if (i === idx) sections[i].classList.add('is-active');
    else sections[i].classList.remove('is-active');
  }

  /* dots */
  var dotsWrap = document.getElementById('tvBoardDots');
  if (dotsWrap){
    var ds = dotsWrap.children;
    for (var j=0;j<ds.length;j++){
      if (j === idx) ds[j].classList.add('is-active');
      else ds[j].classList.remove('is-active');
    }
  }

  /* slide label */
  var lbl = document.getElementById('tvBoardSlideLabel');
  if (lbl){
    var s = ODI_TV_SLIDES[idx];
    lbl.textContent = (idx+1) + ' / ' + ODI_TV_SLIDES.length + ' — ' + s.label;
  }

  tvStartTimer();
}
window.odiTvNextSlide = function(){ tvGoSlide(tvState.idx+1); };
window.odiTvPrevSlide = function(){ tvGoSlide(tvState.idx-1); };

function tvStartTimer(){
  tvStopTimer();
  if (!tvState.playing) return;
  var dur = ODI_TV_SLIDES[tvState.idx].duration || 10000;
  tvState.slideStart = Date.now();
  tvState.slideDuration = dur;
  tvState.timer = setTimeout(function(){ window.odiTvNextSlide(); }, dur);

  /* progress */
  var fill = document.getElementById('tvProgressFill');
  if (fill){
    fill.style.transition = 'none';
    fill.style.width = '0%';
    /* trigger reflow */
    fill.offsetHeight;
    fill.style.transition = 'width ' + (dur/1000) + 's linear';
    fill.style.width = '100%';
  }
}
function tvStopTimer(){
  if (tvState.timer){ clearTimeout(tvState.timer); tvState.timer = null; }
}

window.odiTvTogglePlay = function(){
  tvState.playing = !tvState.playing;
  var btn = document.getElementById('tvPlayBtn');
  if (btn) btn.textContent = tvState.playing ? '⏸ 일시정지' : '▶ 재생';
  if (tvState.playing) tvStartTimer();
  else {
    tvStopTimer();
    /* pause progress at current position */
    var fill = document.getElementById('tvProgressFill');
    if (fill){
      var elapsed = Date.now() - tvState.slideStart;
      var pct = Math.min(100, (elapsed / tvState.slideDuration) * 100);
      fill.style.transition = 'none';
      fill.style.width = pct + '%';
    }
  }
};

function tvStartClock(){
  tvStopClock();
  function update(){
    var now = new Date();
    var dEl = document.getElementById('tvBoardDate');
    var tEl = document.getElementById('tvBoardTime');
    if (dEl){
      var wd = ['일','월','화','수','목','금','토'][now.getDay()];
      dEl.textContent = now.getFullYear() + '년 ' +
        String(now.getMonth()+1).padStart(2,'0') + '월 ' +
        String(now.getDate()).padStart(2,'0') + '일 ' + wd + '요일';
    }
    if (tEl){
      tEl.textContent = String(now.getHours()).padStart(2,'0') + ':' +
        String(now.getMinutes()).padStart(2,'0') + ':' +
        String(now.getSeconds()).padStart(2,'0');
    }
  }
  update();
  tvState.clockTimer = setInterval(update, 1000);
}
function tvStopClock(){
  if (tvState.clockTimer){ clearInterval(tvState.clockTimer); tvState.clockTimer = null; }
}

/* =====================================================================
 * §12. open / close / refresh
 * ===================================================================== */
function tvApplyTheme(){
  var ov = document.getElementById('odiTvStatusBoard');
  if (!ov) return;
  ov.classList.remove('tv-board-theme-light','tv-board-theme-dark');
  var t = (window.ODI_TV_BOARD_THEME || 'light');
  if (t === 'follow'){
    try{
      var page = document.documentElement.getAttribute('data-theme') || 'dark';
      t = (page === 'light') ? 'light' : 'dark';
    }catch(_e){ t = 'light'; }
  }
  /* 최초 구현 기본값 light: dark는 향후 확장 */
  ov.classList.add('tv-board-theme-' + (t==='dark'?'dark':'light'));
}

function tvRenderDataBadge(data, reason){
  var badge = document.getElementById('tvBoardDataBadge');
  if (!badge) return;
  var qSrc = (data && data.quality)    ? (data.quality.source||data.quality.rowsSource||'none')    : 'none';
  var pSrc = (data && data.production) ? (data.production.source||data.production.rowsSource||'none') : 'none';
  var qN = (data && data.quality && data.quality.rows) ? data.quality.rows.length : 0;
  var pN = (data && data.production && data.production.rows) ? data.production.rows.length : 0;
  var errs = (window.ODI_TV_RENDER_ERRORS||[]);
  var errN = errs.length;
  var parts = [];
  parts.push((qN>0 || pN>0) ? '실데이터' : '데이터 대기');
  if (qN>0) parts.push('품질:' + qSrc + ' ' + qN + '행');
  else parts.push('품질: ' + qSrc + ' (' + qN + '행)');
  if (pN>0) parts.push('생산:' + pSrc + ' ' + pN + '행');
  else parts.push('생산: ' + pSrc + ' (' + pN + '행)');
  if (data && data.period) parts.push('기준월:' + data.period.currentMonthKey);
  /* §FIX: 어느 슬라이드가 깨졌는지 명시 — 즉시 진단 가능 */
  if (errN > 0){
    var names = errs.slice(-3).map(function(e){ return (e && e.name) || '?'; }).join(',');
    parts.push('⚠ 렌더오류 ' + errN + '건 (' + names + ')');
  } else {
    parts.push('오류 0건');
  }
  badge.textContent = parts.join(' · ');
  badge.classList.toggle('has-err', errN>0);
}

function tvCollectAndRender(reason){
  var data = odiTvCollectData();
  window.ODI_TV_LAST_DATA = data;
  tvState.data = data;
  tvRenderAllSlides(data);
  tvRenderDataBadge(data, reason);
}
window.tvCollectAndRender = tvCollectAndRender;

function tvOpenOverlay(){
  var ov = document.getElementById('odiTvStatusBoard');
  if (!ov) return;
  ov.classList.add('is-open');
  ov.classList.add('open');
  ov.setAttribute('aria-hidden','false');
  /* lock body scroll + 전체화면 강제용 body class */
  try{
    document.body.classList.add('odi-tv-board-open');
    document.body.classList.add('tv-board-open');
    document.body.style.overflow = 'hidden';
  }catch(_e){}
}
function tvCloseOverlay(){
  var ov = document.getElementById('odiTvStatusBoard');
  if (!ov) return;
  ov.classList.remove('is-open');
  ov.classList.remove('open');
  ov.setAttribute('aria-hidden','true');
  try{
    document.body.classList.remove('odi-tv-board-open');
    document.body.classList.remove('tv-board-open');
    document.body.style.overflow = '';
  }catch(_e){}
}

window.openOdiTvStatusBoard = function(){
  tvState.initialized = true;
  tvState.open = true;
  tvState.playing = true;
  tvOpenOverlay();
  tvApplyTheme();
  tvCollectAndRender('open');
  tvGoSlide(0);
  tvStartClock();
  /* Play button label */
  var btn = document.getElementById('tvPlayBtn');
  if (btn) btn.textContent = '⏸ 일시정지';
  /* 전체화면 자동 진입 — 토픽바 버튼 클릭이 사용자 제스처이므로 허용됨 */
  try { tvRequestFullscreen(); } catch(_e){}
};

window.closeOdiTvStatusBoard = function(){
  tvState.open = false;
  tvStopTimer();
  tvStopClock();
  /* 전체화면 상태였으면 먼저 빠져나옴 */
  try { tvExitFullscreen(); } catch(_e){}
  tvCloseOverlay();
};

/* 전체화면 헬퍼 — 크로스 브라우저 prefix 대응 */
function tvRequestFullscreen(){
  var el = document.getElementById('odiTvStatusBoard');
  if (!el) return;
  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) return;
  var fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (typeof fn === 'function'){
    try {
      var p = fn.call(el);
      if (p && typeof p.catch === 'function') p.catch(function(_e){});
    } catch(_e){}
  }
}
function tvExitFullscreen(){
  if (!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) return;
  var fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (typeof fn === 'function'){
    try {
      var p = fn.call(document);
      if (p && typeof p.catch === 'function') p.catch(function(_e){});
    } catch(_e){}
  }
}
window.odiTvToggleFullscreen = function(){
  var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  if (isFs) tvExitFullscreen();
  else tvRequestFullscreen();
};
/* 전체화면 상태 변경 시 버튼 라벨 동기화 (ESC로 빠져도 라벨 갱신) */
function tvUpdateFsBtnLabel(){
  var b = document.getElementById('tvFsBtn');
  if (!b) return;
  var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  b.textContent = isFs ? '⛶ 창모드' : '⛶ 전체화면';
  b.title = isFs ? '전체화면 종료 (F / Esc)' : '전체화면 (F)';
}
document.addEventListener('fullscreenchange',       tvUpdateFsBtnLabel, false);
document.addEventListener('webkitfullscreenchange', tvUpdateFsBtnLabel, false);
document.addEventListener('msfullscreenchange',     tvUpdateFsBtnLabel, false);

window.odiTvRefreshData = function(){
  if (!tvState.open) return;
  var keepIdx = tvState.idx;
  tvCollectAndRender('refresh');
  tvGoSlide(keepIdx);
};

/* =====================================================================
 * §13. 키보드 이벤트
 * ===================================================================== */
document.addEventListener('keydown', function(e){
  if (!tvState.open) return;
  /* Esc: 전체화면 상태면 브라우저가 fullscreen만 종료 — overlay는 살아있게 */
  var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  if (e.key === 'Escape')        { if (!isFs) { e.preventDefault(); window.closeOdiTvStatusBoard(); } }
  else if (e.key === ' ')        { e.preventDefault(); window.odiTvTogglePlay(); }
  else if (e.key === 'ArrowLeft'){ e.preventDefault(); window.odiTvPrevSlide(); }
  else if (e.key === 'ArrowRight'){ e.preventDefault(); window.odiTvNextSlide(); }
  else if (e.key === 'f' || e.key === 'F'){ e.preventDefault(); window.odiTvToggleFullscreen(); }
}, false);

/* =====================================================================
 * §14. topbar 버튼 자동 주입
 * ===================================================================== */
function tvInjectTopbarButton(){
  if (document.getElementById('odiTvStatusBtn')) return;
  var topbar = document.getElementById('topbar');
  if (!topbar) return;
  var tbRight = topbar.querySelector('.tb-right');
  if (!tbRight) return;
  var btn = document.createElement('button');
  btn.id = 'odiTvStatusBtn';
  btn.type = 'button';
  btn.className = 'tb-btn tv-status-btn';
  btn.title = 'TV 현황판 (전체화면)';
  btn.style.cssText =
    'font-size:12px;padding:5px 10px;border-radius:6px;' +
    'background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;' +
    'border:1px solid rgba(59,130,246,.4);font-weight:700;cursor:pointer;' +
    'margin-right:6px;letter-spacing:-.2px;';
  btn.innerHTML = '📺 현황판';
  btn.onclick = function(){ window.openOdiTvStatusBoard(); };
  /* 첫 자식에 삽입 */
  tbRight.insertBefore(btn, tbRight.firstChild);
}

/* DOMContentLoaded 시 주입 */
function tvBoot(){
  setTimeout(function(){
    try { tvInjectTopbarButton(); } catch(e){ try{console.warn('[TV] inject error', e);}catch(_e){} }
  }, 300);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tvBoot);
else tvBoot();

/* =====================================================================
 * §15. ODI_TV_TOON_IMAGES placeholder
 *   실제 base64는 파일 하단 별도 블록에서 주입
 * ===================================================================== */
window.ODI_TV_TOON_IMAGES = [
  "../media/media-001-c89cdbf8d6.png",
  "../media/media-002-a3ed451355.png",
  "../media/media-003-4b5074825c.png",
  "../media/media-004-523f6f7184.png",
  "../media/media-005-8eb0cd825f.png"
];


/* Q_REBUILD_08S TV STATUS BOARD JS END */
})();
