/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 57 id=q-rebuild-08o-quality-aux-script :: OPT01 no semantic edits */

(function(){
'use strict';
/* ============================================================================
 * Q_REBUILD_08O_QUALITY_AUX_PAGE_PATCH
 * ----------------------------------------------------------------------------
 * 작업 범위 (딱 3개 페이지):
 *   §1. page-quality-action — 조치 후보 표 (담당/기한/상태) + 반복 후보 CAPA 섹션
 *   §2. page-quality-images — 이미지 있음/없음 / 미매칭 증빙 / 파일 연결 상태
 *   §3. page-quality-master — 코드 매핑 현황 + 미분류 + 기준정보 후보 + 검토 필요
 *
 * 절대 금지:
 *   - page-quality-analysis (10탭 구조) 재구축 X
 *   - quality-dash / quality-main / schedule * 변경 X
 *   - 기존 renderQActionPage / renderQImagesPage / renderQMasterPage 덮어쓰기 X
 *   - ECO/CAPA 자동 생성/확정 X, 자동 합격/불합격 판정 X
 *   - 외부 CDN / Chart.js / Google Fonts / ALL_DATA 내장 X
 *   - 원본 Q*_ROWS mutation X
 * ========================================================================== */
var VERSION = 'Q_REBUILD_08O_QUALITY_AUX_PAGE_PATCH_REVIEWED_FIXED';
try { window.APP_VERSION = VERSION; } catch(_e){}
try { document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
try {
  window.CHANGELOG = window.CHANGELOG || [];
  window.CHANGELOG.push({
    version: VERSION,
    note: '08O: 품질관리 보조 3개 (quality-action / quality-images / quality-master) 보강. QRAW_ROWS 기반 조치 후보 표 (담당/기한/상태 컬럼) + 반복 후보 CAPA 패널 + 이미지 KPI (있음/없음 비율) + 코드 매핑 현황. 기존 renderQ*Page 무변경. quality-analysis 10탭 무변경. 외부 CDN 0.'
  });
} catch(_e){}

/* ─────────── helpers ─────────── */
function o08Esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function o08GetQRaw(){
  try{
    if(typeof window.QDEFECT_WORKBOOK_READY !== 'undefined' && window.QDEFECT_WORKBOOK_READY && Array.isArray(window.QDEFECT_RAW_ROWS)) return window.QDEFECT_RAW_ROWS;
    if(Array.isArray(window.QISSUE_ROWS) && window.QISSUE_ROWS.length) return window.QISSUE_ROWS;
    if(Array.isArray(window.QRAW_ROWS) && window.QRAW_ROWS.length) return window.QRAW_ROWS;
    if(Array.isArray(window.QDEFECT_RAW_ROWS)) return window.QDEFECT_RAW_ROWS;
  } catch(_e){}
  return [];
}
function o08GetImages(){ try{ return (window.QDEFECT_IMAGES||[]); } catch(_e){ return []; } }
function o08GetUnmatched(){ try{ return (window.QDEFECT_UNMATCHED_IMAGES||[]); } catch(_e){ return []; } }
function o08G(r,key){ if(!r||!key) return ''; var v=r[key]; return v==null?'':String(v).trim(); }
function o08HasData(){ return o08GetQRaw().length > 0; }

/* ─────────── §1. renderO08QualityAction ─────────── */
/* 기존 renderQActionPage 를 override 하지 않고, 보충 패널을 별도 DOM에 삽입.
   전략:
   - page-quality-action 에 #o08-action-supplement ID 패널 삽입 (idempotent)
   - QRAW_ROWS 기반으로 조치 후보 표 + 반복 후보 CAPA 패널 렌더
   - ECO/CAPA 자동 확정 X — "조치 후보" / "반복 후보" 표시만 */
window.renderO08QualityAction = function(){
  try {
    var page = document.getElementById('page-quality-action');
    if(!page) return false;
    var rows = o08GetQRaw();

    /* idempotent — remove prior */
    var prev = document.getElementById('o08-action-supplement');
    if(prev && prev.parentNode) prev.parentNode.removeChild(prev);

    /* compute candidates */
    var crit  = rows.filter(function(r){ return /치명|critical|crit/i.test(o08G(r,'severity')||o08G(r,'중요도')||''); });
    var major = rows.filter(function(r){ return /주요|major/i.test(o08G(r,'severity')||o08G(r,'중요도')||''); });
    var cands = crit.concat(major);

    /* repeat candidates by category (CAPA) */
    var catMap = {};
    rows.forEach(function(r){
      var cat = o08G(r,'majorCategory') || o08G(r,'smallCategory') || o08G(r,'분류코드') || o08G(r,'middleCategory');
      if(cat) catMap[cat] = (catMap[cat]||0)+1;
    });
    var capaCands = Object.keys(catMap)
      .filter(function(k){ return catMap[k] >= 2; })
      .map(function(k){ return {cat:k, n:catMap[k]}; })
      .sort(function(a,b){ return b.n-a.n; });

    /* repeat candidates by machine (ECO proxy) */
    var machMap = {};
    rows.forEach(function(r){
      var eq = o08G(r,'machine') || o08G(r,'호기');
      if(eq) machMap[eq] = (machMap[eq]||0)+1;
    });
    var ecoCands = Object.keys(machMap)
      .filter(function(k){ return machMap[k] >= 3; })
      .map(function(k){ return {eq:k, n:machMap[k]}; })
      .sort(function(a,b){ return b.n-a.n; });

    var hasData = rows.length > 0;

    /* build HTML */
    var html = '<div id="o08-action-supplement" style="margin-top:10px">';

    /* A. data note */
    if(!hasData){
      html += '<div class="o08-note warn">품질 데이터 미업로드 — 불량 관리 센터에서 엑셀을 업로드하면 조치 후보가 표시됩니다.'
            + ' <button onclick="nav(\'quality-main\')" style="padding:2px 9px;border-radius:4px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:9px;cursor:pointer;margin-left:6px">불량 관리 센터 →</button></div>';
    } else {
      html += '<div class="o08-note"><strong>데이터 연결됨</strong> — QRAW ' + rows.length + ' row 기반 · ECO/CAPA 자동 확정 없음 · 조치 우선순위 자동 산출 없음</div>';
    }

    /* B. 조치 후보 표 (스펙 §1: 조치 후보, 담당/기한/상태) */
    html += '<div class="o08-action-panel">';
    html +=   '<div class="h"><span>📋 조치 후보 (치명/주요) <span class="o08-badge ' + (cands.length > 0 ? 'crit' : 'miss') + '">' + cands.length + '건</span></span>'
            +   '<span style="font-size:9px;color:var(--tm,#8da0c1)">담당·기한·상태는 데이터 입력 후 연동됩니다</span></div>';
    if(!cands.length){
      html += '<div style="padding:16px;text-align:center;background:rgba(255,255,255,0.02);border:1px dashed var(--bd,rgba(168,162,158,0.30));border-radius:6px;color:var(--tm,#8da0c1);font-size:11px">'
            +   (hasData ? '✅ 조치 대상 (치명/주요) 없음' : '품질 업로드 후 표시됩니다.')
            + '</div>';
    } else {
      html += '<div style="overflow:auto;max-height:280px"><table class="o08-cand-tbl"><thead><tr>'
            +   '<th>#</th><th>내용</th><th>중요도</th><th>호기</th><th>분류</th><th>날짜</th>'
            +   '<th>이미지</th><th>담당</th><th>기한</th><th>상태</th><th>비고</th>'
            + '</tr></thead><tbody>';
      cands.slice(0,50).forEach(function(r, i){
        var sev = o08G(r,'severity') || o08G(r,'중요도') || '';
        var isCrit = /치명|critical|crit/i.test(sev);
        var rowCls = isCrit ? ' class="crit-row"' : ' class="major-row"';
        var content = o08G(r,'content') || o08G(r,'불량내용') || o08G(r,'description') || '';
        var machine = o08G(r,'machine') || o08G(r,'호기') || '\u2014';
        var cat = o08G(r,'majorCategory') || o08G(r,'middleCategory') || o08G(r,'분류코드') || '\u2014';
        var date = (o08G(r,'date') || o08G(r,'일자') || '').slice(0,10) || '\u2014';
        var imgN = o08G(r,'imageCount') || o08G(r,'사진') || '0';
        var imgBadge = (imgN && imgN !== '0')
          ? '<span class="o08-badge info">🖼 '+imgN+'</span>'
          : '<span class="o08-badge miss">없음</span>';
        /* 담당/기한/상태 — 데이터에 있으면 표시, 없으면 —(미입력 안내) */
        var assignee = o08G(r,'assignee') || o08G(r,'담당') || o08G(r,'담당자') || '';
        var deadline  = o08G(r,'deadline') || o08G(r,'기한') || o08G(r,'dueDate') || '';
        var status    = o08G(r,'actionStatus') || o08G(r,'조치상태') || o08G(r,'status2') || '';
        var note      = o08G(r,'actionNote') || o08G(r,'비고') || '';
        html += '<tr'+rowCls+'>'
              +   '<td class="dim mono">' + (i+1) + '</td>'
              +   '<td style="max-width:160px"><span style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + o08Esc(content.slice(0,60)) + '</span></td>'
              +   '<td><span class="o08-badge ' + (isCrit?'crit':'major') + '">' + o08Esc(sev) + '</span></td>'
              +   '<td class="mono">' + o08Esc(machine) + '</td>'
              +   '<td class="dim" style="max-width:100px"><span style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">' + o08Esc(cat.slice(0,20)) + '</span></td>'
              +   '<td class="mono dim">' + o08Esc(date) + '</td>'
              +   '<td>' + imgBadge + '</td>'
              +   '<td class="dim">' + (assignee ? o08Esc(assignee) : '<span style="color:rgba(168,162,158,0.50);font-style:italic">미입력</span>') + '</td>'
              +   '<td class="mono dim">' + (deadline ? o08Esc(deadline.slice(0,10)) : '<span style="color:rgba(168,162,158,0.50);font-style:italic">미입력</span>') + '</td>'
              +   '<td>' + (status ? '<span class="o08-badge info">' + o08Esc(status) + '</span>' : '<span class="o08-badge miss">Open</span>') + '</td>'
              +   '<td class="dim">' + o08Esc(note.slice(0,20)) + '</td>'
              + '</tr>';
      });
      html += '</tbody></table></div>';
      if(cands.length > 50) html += '<div style="text-align:right;padding:5px 8px;font-size:9px;color:var(--tm,#8da0c1)">상위 50건 표시 / 전체 '+cands.length+'건</div>';
    }
    html += '</div>';

    /* C. 반복 후보 — CAPA + ECO proxy (스펙 §1: 반복 후보) */
    html += '<div class="o08-action-panel" style="margin-top:8px">';
    html +=   '<div class="h"><span>🔁 반복 후보 <span class="o08-badge capa">CAPA ' + capaCands.length + '</span> <span class="o08-badge info" style="margin-left:4px">ECO 후보 ' + ecoCands.length + '</span></span>'
            +   '<span style="font-size:9px;color:var(--tm,#8da0c1)">자동 확정 없음 — 검토 후 적용</span></div>';
    if(!capaCands.length && !ecoCands.length){
      html += '<div style="padding:14px;text-align:center;color:var(--tm,#8da0c1);font-size:11px">'
            +   (hasData ? '반복 후보 기준 미달 (분류 2회 이상, 호기 3회 이상)' : '품질 업로드 후 표시됩니다.')
            + '</div>';
    } else {
      if(capaCands.length){
        html += '<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:#d8b4fe;margin-bottom:6px">📊 분류 반복 (CAPA 후보) — 2회 이상 발생</div>'
              + '<div class="o08-repeat-cards">';
        capaCands.slice(0,8).forEach(function(c){
          html += '<div class="o08-repeat-card">'
                +   '<div class="rt">' + o08Esc(c.cat.slice(0,22)) + '</div>'
                +   '<div style="display:flex;align-items:baseline;gap:8px">'
                +     '<div class="rv">' + c.n + '</div>'
                +     '<div class="rc">건</div>'
                +   '</div>'
                +   '<span class="o08-badge capa" style="margin-top:4px">CAPA 후보</span>'
                + '</div>';
        });
        if(capaCands.length > 8) html += '<div style="display:flex;align-items:center;justify-content:center;color:var(--tm,#8da0c1);font-size:10px;padding:8px">+ '+(capaCands.length-8)+'개 더</div>';
        html += '</div></div>';
      }
      if(ecoCands.length){
        html += '<div><div style="font-size:10px;font-weight:700;color:#67e8f9;margin-bottom:6px">🏭 호기 반복 (ECO 후보) — 3회 이상 발생</div>'
              + '<div class="o08-repeat-cards">';
        ecoCands.slice(0,6).forEach(function(e){
          html += '<div class="o08-repeat-card" style="border-color:rgba(34,211,238,0.25);background:rgba(34,211,238,0.04)">'
                +   '<div class="rt" style="color:#67e8f9">' + o08Esc(e.eq) + '</div>'
                +   '<div style="display:flex;align-items:baseline;gap:8px">'
                +     '<div class="rv" style="color:#22d3ee">' + e.n + '</div>'
                +     '<div class="rc">건</div>'
                +   '</div>'
                +   '<span class="o08-badge info" style="margin-top:4px">ECO 후보</span>'
                + '</div>';
        });
        html += '</div></div>';
      }
    }
    html += '</div>';
    html += '</div>'; /* o08-action-supplement */

    page.insertAdjacentHTML('beforeend', html);
    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderO08QualityAction failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §2. renderO08QualityImages ─────────── */
/* 기존 renderQImagesPage/KPI 는 QDEFECT_IMAGES/QDEFECT_UNMATCHED_IMAGES 기반.
   이 함수는 QRAW_ROWS 기반으로 이미지 있음/없음 / 미매칭 증빙 / 파일 연결 상태를
   별도 패널로 표시 (스펙 §2). */
window.renderO08QualityImages = function(){
  try {
    var page = document.getElementById('page-quality-images');
    if(!page) return false;
    var rows = o08GetQRaw();
    var imgs   = o08GetImages();
    var unmatched = o08GetUnmatched();

    /* idempotent */
    var prev = document.getElementById('o08-images-supplement');
    if(prev && prev.parentNode) prev.parentNode.removeChild(prev);

    /* compute from raw rows */
    var withImg  = rows.filter(function(r){ var ic = o08G(r,'imageCount') || o08G(r,'사진') || o08G(r,'photo') || o08G(r,'image'); return ic && ic !== '0'; }).length;
    var noImg    = rows.length - withImg;
    var pctWith  = rows.length > 0 ? Math.round(withImg / rows.length * 100) : 0;
    var pctNo    = 100 - pctWith;

    /* from QDEFECT_IMAGES (if QDEFECT_WORKBOOK_READY) */
    var linked   = imgs.length;
    var unmatchN = unmatched.length;
    var totalImg = linked + unmatchN;

    /* per-machine image status */
    var byMach = {};
    rows.forEach(function(r){
      var eq = o08G(r,'machine') || o08G(r,'호기');
      if(!eq) return;
      if(!byMach[eq]) byMach[eq]={withImg:0, noImg:0, total:0};
      byMach[eq].total++;
      var ic = o08G(r,'imageCount') || o08G(r,'사진') || '0';
      if(ic && ic !== '0') byMach[eq].withImg++;
      else byMach[eq].noImg++;
    });
    var machList = Object.keys(byMach).sort(function(a,b){ return byMach[b].withImg - byMach[a].withImg; });

    var hasData = rows.length > 0;

    var html = '<div id="o08-images-supplement" style="margin-top:10px">';

    /* A. note */
    if(!hasData){
      html += '<div class="o08-note warn">품질 데이터 미업로드 — 업로드 후 이미지 연결 상태가 표시됩니다.'
            + ' <button onclick="nav(\'quality-main\')" style="padding:2px 9px;border-radius:4px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:9px;cursor:pointer;margin-left:6px">불량 관리 센터 →</button></div>';
    } else {
      html += '<div class="o08-note"><strong>QRAW_ROWS 기반 이미지 분석</strong> — 데이터의 imageCount/사진 컬럼 기준 · 단일 HTML 환경에서 실제 이미지 파일 저장 불가 · 이미지 파일 연결은 서버 연동 후 완성</div>';
    }

    /* B. KPI (스펙 §2) */
    html += '<div class="o08-img-kpi">'
          +   '<div class="k"><div class="l">전체 불량 row</div><div class="v">' + rows.length + '</div></div>'
          +   '<div class="k" style="border-color:rgba(34,197,94,0.30)"><div class="l">이미지 있음</div><div class="v" style="color:#86efac">' + withImg + '</div></div>'
          +   '<div class="k" style="border-color:rgba(168,162,158,0.40)"><div class="l">이미지 없음</div><div class="v" style="color:var(--tm,#8da0c1)">' + noImg + '</div></div>'
          +   '<div class="k"><div class="l">첨부율</div><div class="v" style="color:#67e8f9">' + pctWith + '%</div></div>'
          +   '<div class="k" style="border-color:rgba(34,211,238,0.30)"><div class="l">연결 성공 (QDEFECT)</div><div class="v" style="color:#67e8f9">' + linked + '</div></div>'
          +   '<div class="k" style="border-color:' + (unmatchN > 0 ? 'rgba(239,68,68,0.30)' : 'rgba(168,162,158,0.30)') + '"><div class="l">미매칭 (QDEFECT)</div><div class="v" style="color:' + (unmatchN > 0 ? '#fca5a5' : 'var(--tm,#8da0c1)') + '">' + unmatchN + '</div></div>'
          + '</div>';

    /* C. image coverage bar */
    if(rows.length > 0){
      html += '<div style="margin-bottom:10px">'
            +   '<div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--tm,#8da0c1);margin-bottom:3px"><span>이미지 첨부 비율</span><span>' + withImg + '/' + rows.length + ' (' + pctWith + '%)</span></div>'
            +   '<div class="o08-img-bar"><div class="seg-ok" style="width:' + pctWith + '%"></div><div class="seg-miss" style="width:' + pctNo + '%"></div></div>'
            +   '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--tm,#8da0c1);margin-top:2px"><span>■ 이미지 있음 (' + pctWith + '%)</span><span>□ 없음 (' + pctNo + '%)</span></div>'
            + '</div>';
    }

    /* D. 증빙 파일 연결 상태 (스펙 §2: 파일 연결 상태) */
    html += '<div class="o08-action-panel">';
    html +=   '<div class="h"><span>🔗 증빙 파일 연결 상태</span></div>';
    if(totalImg === 0 && rows.length > 0){
      html += '<div style="padding:12px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:5px;font-size:10.5px;color:#fcd34d">'
            +   '⚠ QDEFECT_IMAGES 데이터 없음 — 불량 관리 센터 업로드 파일의 이미지 추출이 아직 완료되지 않았거나, 첨부 이미지가 없습니다.'
            + '</div>';
    } else if(totalImg > 0){
      var matchRate = totalImg > 0 ? Math.round(linked / totalImg * 100) : 0;
      html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'
            +   '<div style="padding:8px 10px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.20);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">연결 성공</div><div style="font-size:16px;font-weight:800;color:#86efac;font-family:monospace">' + linked + '</div></div>'
            +   '<div style="padding:8px 10px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.22);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">미매칭</div><div style="font-size:16px;font-weight:800;color:#fca5a5;font-family:monospace">' + unmatchN + '</div></div>'
            +   '<div style="padding:8px 10px;background:rgba(34,211,238,0.05);border:1px solid rgba(34,211,238,0.22);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">연결율</div><div style="font-size:16px;font-weight:800;color:#67e8f9;font-family:monospace">' + matchRate + '%</div></div>'
            + '</div>';
    } else {
      html += '<div style="padding:12px;text-align:center;color:var(--tm,#8da0c1);font-size:10px">업로드 후 파일 연결 상태가 표시됩니다.</div>';
    }
    html += '</div>';

    /* E. 호기별 이미지 현황 (스펙 §2: 호기별) */
    if(machList.length > 0){
      html += '<div class="o08-action-panel" style="margin-top:8px">';
      html +=   '<div class="h"><span>🏭 호기별 이미지 첨부 현황</span></div>';
      html += '<div style="overflow:auto;max-height:220px"><table class="o08-cand-tbl"><thead><tr><th>호기</th><th>전체</th><th>이미지 있음</th><th>없음</th><th>첨부율</th><th>상태</th></tr></thead><tbody>';
      machList.slice(0,20).forEach(function(eq){
        var d = byMach[eq];
        var pct = d.total > 0 ? Math.round(d.withImg / d.total * 100) : 0;
        var statusBadge = pct >= 80 ? '<span class="o08-badge ok">우수</span>'
                        : pct >= 50 ? '<span class="o08-badge info">보통</span>'
                        : pct > 0   ? '<span class="o08-badge major">낮음</span>'
                        :             '<span class="o08-badge miss">없음</span>';
        html += '<tr>'
              +   '<td class="mono">' + o08Esc(eq) + '</td>'
              +   '<td class="mono dim">' + d.total + '</td>'
              +   '<td class="mono" style="color:#86efac">' + d.withImg + '</td>'
              +   '<td class="mono" style="color:var(--tm,#8da0c1)">' + d.noImg + '</td>'
              +   '<td class="mono" style="color:#67e8f9">' + pct + '%</td>'
              +   '<td>' + statusBadge + '</td>'
              + '</tr>';
      });
      html += '</tbody></table></div>';
      if(machList.length > 20) html += '<div style="text-align:right;padding:4px 8px;font-size:9px;color:var(--tm,#8da0c1)">상위 20 호기 / 전체 '+machList.length+'개</div>';
      html += '</div>';
    }

    html += '</div>'; /* o08-images-supplement */
    page.insertAdjacentHTML('beforeend', html);
    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderO08QualityImages failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §3. renderO08QualityMaster ─────────── */
/* 코드 매핑 현황 + 미분류 + 기준정보 후보 + 검토 필요 (스펙 §3). */
window.renderO08QualityMaster = function(){
  try {
    var page = document.getElementById('page-quality-master');
    if(!page) return false;
    var rows = o08GetQRaw();

    /* idempotent */
    var prev = document.getElementById('o08-master-supplement');
    if(prev && prev.parentNode) prev.parentNode.removeChild(prev);

    /* code key detection */
    var codeKeys = ['majorCategory','middleCategory','smallCategory','분류대분류','분류중분류','분류소분류','분류코드'];
    var partKeys  = ['part','파트','공정'];

    /* per-row code state */
    var withMajor = 0, withMiddle = 0, withSmall = 0, noPart = 0;
    var majorMap = {}, middleMap = {}, partMap = {};
    rows.forEach(function(r){
      var maj  = o08G(r,'majorCategory')  || o08G(r,'분류대분류') || o08G(r,'분류코드');
      var mid  = o08G(r,'middleCategory') || o08G(r,'분류중분류');
      var sml  = o08G(r,'smallCategory')  || o08G(r,'분류소분류');
      var part = o08G(r,'part') || o08G(r,'파트') || o08G(r,'공정');
      if(maj) { withMajor++; majorMap[maj]=(majorMap[maj]||0)+1; }
      if(mid) { withMiddle++; middleMap[mid]=(middleMap[mid]||0)+1; }
      if(sml) withSmall++;
      if(!part) noPart++;
      if(part) partMap[part]=(partMap[part]||0)+1;
    });
    var noMajor = rows.length - withMajor;
    var noMiddle = rows.length - withMiddle;

    /* code lists */
    var majorList = Object.keys(majorMap).map(function(k){ return {k:k, n:majorMap[k]}; }).sort(function(a,b){return b.n-a.n;});
    var middleList = Object.keys(middleMap).map(function(k){ return {k:k, n:middleMap[k]}; }).sort(function(a,b){return b.n-a.n;});
    var partList   = Object.keys(partMap).map(function(k){ return {k:k, n:partMap[k]}; }).sort(function(a,b){return b.n-a.n;});

    /* "검토 필요" candidates: rows with no code at all */
    var noCodeRows = rows.filter(function(r){
      return !o08G(r,'majorCategory') && !o08G(r,'middleCategory') && !o08G(r,'smallCategory')
          && !o08G(r,'분류대분류') && !o08G(r,'분류코드');
    }).length;

    var hasData = rows.length > 0;

    var html = '<div id="o08-master-supplement" style="margin-top:10px">';

    /* A. note */
    if(!hasData){
      html += '<div class="o08-note warn">품질 데이터 미업로드 — 업로드 후 코드 매핑 현황이 표시됩니다.'
            + ' <button onclick="nav(\'quality-main\')" style="padding:2px 9px;border-radius:4px;border:1px solid var(--ac,#58a6ff);background:rgba(88,166,255,0.10);color:var(--ac,#58a6ff);font-size:9px;cursor:pointer;margin-left:6px">불량 관리 센터 →</button></div>';
    } else {
      html += '<div class="o08-note"><strong>코드 매핑 현황</strong> — QRAW ' + rows.length + ' row 기준 · 코드 CRUD 미구현 · 자동 코드 확정 없음</div>';
    }

    /* B. 코드 매핑 통계 (스펙 §3: 코드 매핑 현황 + 미분류) */
    html += '<div class="o08-code-stats">'
          +   '<div class="cs ' + (withMajor===rows.length?'ok':'warn') + '"><div class="l">대분류 기재</div><div class="v">' + withMajor + '</div><div class="n">/ '+rows.length+'건</div></div>'
          +   '<div class="cs ' + (noMajor===0?'ok':'warn') + '"><div class="l">대분류 미기재</div><div class="v">' + noMajor + '</div><div class="n">' + (rows.length?Math.round(noMajor/rows.length*100)+'%':'—') + '</div></div>'
          +   '<div class="cs info"><div class="l">중분류 기재</div><div class="v">' + withMiddle + '</div><div class="n">/ '+rows.length+'건</div></div>'
          +   '<div class="cs warn"><div class="l">중분류 미기재</div><div class="v">' + noMiddle + '</div><div class="n">' + (rows.length?Math.round(noMiddle/rows.length*100)+'%':'—') + '</div></div>'
          +   '<div class="cs info"><div class="l">소분류 기재</div><div class="v">' + withSmall + '</div><div class="n">/ '+rows.length+'건</div></div>'
          +   '<div class="cs ' + (noCodeRows===0?'ok':'warn') + '"><div class="l">코드 없음 (검토)</div><div class="v">' + noCodeRows + '</div><div class="n">검토 필요</div></div>'
          + '</div>';

    /* C. 파트별 분포 (스펙 §3: 기준정보 후보) */
    if(partList.length > 0){
      html += '<div class="o08-action-panel">';
      html +=   '<div class="h"><span>⚙ 파트/공정별 불량 분포</span></div>';
      html += '<div style="overflow:auto;max-height:180px"><table class="o08-code-tbl"><thead><tr><th>파트/공정</th><th>건수</th><th>비율</th><th>상태</th></tr></thead><tbody>';
      partList.slice(0,20).forEach(function(p){
        var pct = rows.length ? Math.round(p.n/rows.length*100) : 0;
        html += '<tr><td class="mono">' + o08Esc(p.k) + '</td><td class="mono dim" style="text-align:right">' + p.n + '</td><td class="mono dim" style="text-align:right">' + pct + '%</td><td><span class="o08-badge info">기재됨</span></td></tr>';
      });
      if(noPart > 0) html += '<tr><td class="dim" style="font-style:italic">파트/공정 미기재</td><td class="mono dim" style="text-align:right">' + noPart + '</td><td class="mono dim" style="text-align:right">' + (rows.length ? Math.round(noPart/rows.length*100) : 0) + '%</td><td><span class="o08-badge miss">미기재</span></td></tr>';
      html += '</tbody></table></div>';
      html += '</div>';
    }

    /* D. 대분류 코드 목록 (스펙 §3: 코드 매핑 + 검토 필요) */
    if(majorList.length > 0){
      html += '<div class="o08-action-panel" style="margin-top:8px">';
      html +=   '<div class="h"><span>📋 대분류 코드 목록 (검토 기준)</span><span style="font-size:9px;color:var(--tm,#8da0c1)">코드 CRUD는 서버 연동 후</span></div>';
      html += '<div style="overflow:auto;max-height:220px"><table class="o08-code-tbl"><thead><tr><th>대분류 코드</th><th>건수</th><th>비율</th><th>중분류 연결</th><th>상태</th></tr></thead><tbody>';
      majorList.slice(0,30).forEach(function(m){
        var pct = rows.length ? Math.round(m.n/rows.length*100) : 0;
        /* count rows with this major that have middle code */
        var withMid = rows.filter(function(r){
          return (o08G(r,'majorCategory') || o08G(r,'분류대분류') || o08G(r,'분류코드')) === m.k
              && (o08G(r,'middleCategory') || o08G(r,'분류중분류'));
        }).length;
        var midRate = m.n ? Math.round(withMid/m.n*100) : 0;
        var statusBadge = midRate >= 80 ? '<span class="o08-badge ok">정상</span>'
                        : midRate >= 40 ? '<span class="o08-badge major">부분 매핑</span>'
                        :                '<span class="o08-badge miss">매핑 필요</span>';
        html += '<tr>'
              +   '<td class="mono">' + o08Esc(m.k.slice(0,30)) + '</td>'
              +   '<td class="mono dim" style="text-align:right">' + m.n + '</td>'
              +   '<td class="mono dim" style="text-align:right">' + pct + '%</td>'
              +   '<td class="mono dim" style="text-align:right">' + withMid + '/' + m.n + ' (' + midRate + '%)</td>'
              +   '<td>' + statusBadge + '</td>'
              + '</tr>';
      });
      if(majorList.length > 30) html += '<tr><td colspan="5" class="dim" style="text-align:right;font-size:9px">상위 30건 / 전체 '+majorList.length+'건</td></tr>';
      html += '</tbody></table></div>';
      html += '</div>';
    }

    /* E. 검토 필요 summary (스펙 §3: 검토 필요 상태) */
    if(hasData){
      var reviewItems = [];
      if(noCodeRows > 0) reviewItems.push({ k:'코드 없는 row', n:noCodeRows, badge:'miss', action:'분류 코드 기재 필요' });
      if(noMajor > 0)    reviewItems.push({ k:'대분류 미기재', n:noMajor,   badge:'warn', action:'원본 데이터 대분류 확인' });
      if(noMiddle > 0)   reviewItems.push({ k:'중분류 미기재', n:noMiddle,  badge:'info', action:'중분류 코드 매핑 필요' });
      if(noPart > 0)     reviewItems.push({ k:'파트/공정 미기재', n:noPart, badge:'major', action:'파트 필드 확인' });

      if(reviewItems.length > 0){
        html += '<div class="o08-action-panel" style="margin-top:8px">';
        html +=   '<div class="h"><span>⚠ 검토 필요 항목</span><span style="font-size:9px;color:var(--tm,#8da0c1)">코드 자동 확정 없음 — 검토 후 수동 보정</span></div>';
        html += '<div style="display:flex;flex-direction:column;gap:6px">';
        reviewItems.forEach(function(ri){
          html += '<div style="display:grid;grid-template-columns:140px 60px 1fr auto;gap:8px;align-items:center;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(168,162,158,0.20);border-radius:5px">'
                +   '<div style="font-size:10.5px;color:var(--tp,#e6ecf5)">' + o08Esc(ri.k) + '</div>'
                +   '<div style="font-size:13px;font-weight:800;color:var(--ts,#cfd6e4);font-family:monospace">' + ri.n + '건</div>'
                +   '<div style="font-size:10px;color:var(--tm,#8da0c1)">' + o08Esc(ri.action) + '</div>'
                +   '<span class="o08-badge ' + ri.badge + '">검토</span>'
                + '</div>';
        });
        html += '</div></div>';
      } else {
        html += '<div class="o08-note ok" style="margin-top:8px">✅ 검토 필요 항목 없음 — 코드 기재 상태 정상</div>';
      }
    }

    html += '</div>'; /* o08-master-supplement */
    page.insertAdjacentHTML('beforeend', html);
    return true;
  } catch(e){
    try { console.warn('['+VERSION+'] renderO08QualityMaster failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── Dispatcher wrap ─────────── */
function o08WrapDispatcher(){
  try {
    if(typeof window.odiNavAfterRenderDispatcher !== 'function') return false;
    if(window.odiNavAfterRenderDispatcher.__o08Wrapped) return true;
    var original = window.odiNavAfterRenderDispatcher;
    var wrapped = function(k){
      var ret = original.apply(this, arguments);
      setTimeout(function(){
        try {
          /* quality aux 3 pages — run AFTER existing renderQ*Page (250ms after original 60ms) */
          if(k === 'quality-action') window.renderO08QualityAction();
          if(k === 'quality-images') window.renderO08QualityImages();
          if(k === 'quality-master') window.renderO08QualityMaster();
        } catch(_e){}
      }, 280);
      return ret;
    };
    wrapped.__o08Wrapped = true;
    window.odiNavAfterRenderDispatcher = wrapped;
    return true;
  } catch(_e){ return false; }
}

/* ─────────── audit ─────────── */
window.ODI_QUALITY_AUX_PATCH_AUDIT = {
  version: VERSION,
  scope: 'quality-action / quality-images / quality-master',
  rendersAdded: ['renderO08QualityAction','renderO08QualityImages','renderO08QualityMaster'],
  protectedPages: ['page-quality-analysis','page-quality-dash','page-quality-main',
                   'page-schedule','page-schedule-log','page-schedule-model','page-schedule-period'],
  noAutoEcoCapa: true,       /* ECO/CAPA 자동 확정 없음 */
  noAutoJudgment: true,      /* 자동 합격/불합격 없음 */
  noCodeCRUD: true,          /* 코드 CRUD 미구현 */
  noExternalCdn: true, noGoogleFonts: true, noChartjs: true,
  noAllData: true, noOriginalDataMutation: true,
  workingPrinciples: {
    improvementPoints: [
      'quality-action: 조치 후보 표 (담당/기한/상태 컬럼) — 데이터에 해당 컬럼 없으면 "미입력" 표시. 기존 kanban/workflow 무변경',
      'quality-action: 반복 후보 (분류 반복 CAPA, 호기 반복 ECO proxy) 카드 — ECO/CAPA 자동 확정 없음 명시',
      'quality-images: QRAW_ROWS 기반 이미지 있음/없음 KPI 6종 + 비율 바 + 호기별 첨부 현황 표',
      'quality-images: QDEFECT_IMAGES/QDEFECT_UNMATCHED 기반 연결율 표시 — 단일 HTML 이미지 파일 저장 불가 명시',
      'quality-master: 대/중/소 분류 기재율 6개 카드 + 파트별 분포 표 + 대분류 코드별 중분류 연결율 + 검토 필요 항목 목록',
      '기존 renderQActionPage/renderQImagesPage/renderQMasterPage 무변경 — 보충 패널은 별도 insertAdjacentHTML'
    ],
    implementationCautions: [
      '모든 3개 render 함수 read-only — QRAW_ROWS / QDEFECT_RAW_ROWS / QDEFECT_IMAGES mutation 없음',
      'dispatcher wrap __o08Wrapped, 280ms delay — 기존 quality render (60ms) 완료 후 실행',
      'idempotent: o08-action-supplement / o08-images-supplement / o08-master-supplement 매번 기존 ID 제거 후 재삽입',
      'QRAW_ROWS 우선 접근: QDEFECT_WORKBOOK_READY true → QDEFECT_RAW_ROWS, 아니면 QISSUE_ROWS → QRAW_ROWS fallback',
      'QDEFECT_IMAGES/QDEFECT_UNMATCHED_IMAGES 는 window.QDEFECT_WORKBOOK_READY 와 별개로 항상 try-catch 접근',
      '신규 CSS 전부 .o08-* prefix. 전역 .qd-* / .card / .btn 무변경',
      '조치 후보 표 담당/기한/상태 컬럼 — 현재 데이터에 없으면 "미입력" italic 표시 (서버 연동 후 채워질 예정)',
      '코드 CRUD 없음 명시 — "코드 등록/수정/삭제는 서버 연동 후" 명시'
    ],
    pendingDecisions: [
      '조치 담당/기한/상태 컬럼 실제 저장 기능 — 서버 연동 후 결정',
      'ECO/CAPA 워크플로우 자동화 — 자동 확정 금지 유지, 운영 검토 후 결정',
      '분류 코드 CRUD — 단일 HTML 한계상 미구현, 서버 연동 후',
      '이미지 파일 실제 업로드/저장 — 단일 HTML 한계상 불가, 서버 연동 후',
      '미매칭 증빙 자동 보정 — 수동 보정 기능은 서버 연동 후'
    ]
  }
};

window.runOdiQualityAuxPatchAudit = function(){
  var routes = ['quality-action','quality-images','quality-master'];
  var pmHas = {}, pageDomHas = {};
  routes.forEach(function(k){
    pmHas[k]     = !!(window.PM && window.PM[k]);
    var pid       = window.PM ? window.PM[k] : null;
    pageDomHas[k] = pid ? !!document.getElementById(pid) : false;
  });
  var rendersAvail = {};
  ['renderO08QualityAction','renderO08QualityImages','renderO08QualityMaster'].forEach(function(n){
    rendersAvail[n] = typeof window[n] === 'function';
  });
  var existingPreserved = {
    renderQActionPage:  typeof window.renderQActionPage === 'function',
    renderQImagesPage:  typeof window.renderQImagesPage === 'function',
    renderQMasterPage:  typeof window.renderQMasterPage === 'function',
    switchQAction:      typeof window.switchQAction === 'function',
    switchQImages:      typeof window.switchQImages === 'function',
    switchQMaster:      typeof window.switchQMaster === 'function'
  };
  var preserved = {
    'page-quality-analysis': !!document.getElementById('page-quality-analysis'),
    'page-quality-dash':     !!document.getElementById('page-quality-dash'),
    'page-quality-main':     !!document.getElementById('page-quality-main'),
    'page-schedule':         !!document.getElementById('page-schedule')
  };
  var qCleanTabs = document.querySelectorAll('#page-quality-analysis [data-qclean="tabs"] > button').length;
  var supplPanels = {
    'o08-action-supplement': !!document.getElementById('o08-action-supplement'),
    'o08-images-supplement': !!document.getElementById('o08-images-supplement'),
    'o08-master-supplement': !!document.getElementById('o08-master-supplement')
  };
  return {
    version: window.APP_VERSION,
    routes: routes, pmHas: pmHas, pageDomHas: pageDomHas,
    rendersAvail: rendersAvail,
    existingPreserved: existingPreserved,
    dispatcherWrapped: !!(window.odiNavAfterRenderDispatcher && window.odiNavAfterRenderDispatcher.__o08Wrapped),
    preserved: preserved,
    qCleanTabsCount: qCleanTabs,
    supplementPanels: supplPanels,
    externalCdnAdded: !!document.querySelector('script[src*="cdn.jsdelivr"], script[src*="chart.js"], link[href*="fonts.googleapis"]'),
    allDataImported: typeof window.ALL_DATA !== 'undefined',
    errors: []
  };
};

/* ─────────── init ─────────── */
function o08Init(){
  try {
    o08WrapDispatcher();
    /* if user is currently on one of these pages, run immediately */
    var page = document.querySelector('.page.active');
    if(page){
      var pid = page.id || '';
      setTimeout(function(){
        if(pid === 'page-quality-action') window.renderO08QualityAction();
        if(pid === 'page-quality-images') window.renderO08QualityImages();
        if(pid === 'page-quality-master') window.renderO08QualityMaster();
      }, 350);
    }
  } catch(e){ try{console.warn('['+VERSION+'] init failed:',e);}catch(_e){} }
}
function o08Boot(){ setTimeout(o08Init, 1000); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', o08Boot);
else o08Boot();

})();
