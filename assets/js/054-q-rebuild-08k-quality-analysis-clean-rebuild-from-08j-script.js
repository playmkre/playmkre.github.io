/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 54 id=q-rebuild-08k-quality-analysis-clean-rebuild-from-08j-script :: OPT01 no semantic edits */

(function(){
  'use strict';
  /* ==========================================================================
   * Q_REBUILD_08K_QUALITY_ANALYSIS_CLEAN_REBUILD_FROM_08J
   * --------------------------------------------------------------------------
   * 08J frame mode 기준 유지. page-quality-analysis 내부만 clean rebuild.
   * 기존 6탭 qanalysis 구조 / q-flow-trace-analysis / qd-machine-modal 제거.
   * 사용자용 10탭 분석 화면 + 좌측 요약 + 상단 필터 + KPI + 후보 표시.
   * 기존 업로드 flow 데이터 (QISSUE_NORMALIZED_ROWS > QISSUE_ROWS > QRAW_ROWS >
   *   QDEFECT_ISSUES > QDEFECT_RAW_ROWS) read-only 분석. mutation 없음.
   * 외부 차트 라이브러리 / 외부 폰트 / 내장 샘플 데이터 / 확정 위험 점수 / 확정 조치 우선순위 /
   * CAPA·ECO 자동 생성 / 합격·불합격 자동 판정 모두 없음.
   *
   * 본 script 가 절대 하지 않는 것:
   *   - 전체 포털 / topbar / sidebar / frame mode V0.4 구조 변경
   *   - 생산일정 / 다른 품질관리 5개 페이지 / 불량 접수/업로드 flow 변경
   *   - nav / PM / odiNavAfterRenderDispatcher 본체 변경
   *   - 원본 Q* 데이터 mutation, 임의 데이터 생성
   *   - 사용자 화면에 STEP/schema/blueprint/confirmation/Risk Rule/preview-only 노출
   * ========================================================================== */
  var VERSION = 'Q_REBUILD_08K_QUALITY_ANALYSIS_CLEAN_REBUILD_FROM_08J_REVIEWED_FIXED';
  try { window.APP_VERSION = VERSION; } catch(_e){}
  try { document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: '08J frame mode 기준 유지 · page-quality-analysis 내부 clean rebuild · 기존 qanalysis 6탭 구조 제거 · q-flow-trace-analysis 사용자 화면 제거 · 사용자용 품질 분석 10개 탭 구성 · 기존 업로드 flow 데이터 read-only 분석 연결 · Raw Data preview 최대 50건 제한 · Defect Analytics 참고 파일은 기능 후보만 반영 · 외부 차트 라이브러리 / 외부 폰트 / 내장 샘플 데이터 추가 없음 · 자동 점수화 / 자동 우선순위 확정 표시 없음.'
    });
  } catch(_e){}

  /* --------------------------------------------------------------------------
   * 1. tab / filter state
   * -------------------------------------------------------------------------- */
  var TABS = [
    { key:'overview',  label:'종합현황' },
    { key:'trend',     label:'불량추이' },
    { key:'classify',  label:'분류분석' },
    { key:'equip',     label:'장비\u00b7호기' },
    { key:'repeat',    label:'반복\u00b7패턴' },
    { key:'schedule',  label:'생산일정 연계' },
    { key:'author',    label:'작성자\u00b7부서' },
    { key:'raw',       label:'Raw Data' },
    { key:'codecheck', label:'코드검증' },
    { key:'actionpri', label:'조치우선순위' }
  ];
  try { window.Q_CLEAN_ACTIVE_TAB = window.Q_CLEAN_ACTIVE_TAB || 'overview'; } catch(_e){}
  try {
    window.Q_CLEAN_FILTER_STATE = window.Q_CLEAN_FILTER_STATE || {
      month: '', severity: '', equipment: '', part: '', keyword: ''
    };
  } catch(_e){}

  /* --------------------------------------------------------------------------
   * 2. helpers
   * -------------------------------------------------------------------------- */
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function fmtPct(n){
    if(n == null || isNaN(n)) return '\u2014';
    return (Math.round(n*10)/10).toFixed(1) + '%';
  }
  function gv(r, key){
    if(!r || !key) return '';
    var v = r[key];
    return v == null ? '' : String(v).trim();
  }

  /* --------------------------------------------------------------------------
   * 3. data accessors — read-only access to upload-flow output
   * -------------------------------------------------------------------------- */
  window.qCleanGetRows = function(){
    function arr(v){ return (v && v.length) ? v : null; }
    var src;
    if(src = arr(window.QISSUE_NORMALIZED_ROWS)) return { rows: src.slice(), source:'Normalized' };
    if(src = arr(window.QISSUE_ROWS))            return { rows: src.slice(), source:'Issue' };
    if(src = arr(window.QDEFECT_ISSUES))         return { rows: src.slice(), source:'DefectIssue' };
    if(src = arr(window.QRAW_ROWS))              return { rows: src.slice(), source:'Raw' };
    if(src = arr(window.QDEFECT_RAW_ROWS))       return { rows: src.slice(), source:'DefectRaw' };
    return { rows:[], source:'none' };
  };

  /* field map — heuristic, English + Korean alias */
  window.qCleanDetectFieldMap = function(rows){
    var fm = {
      authorKey:null, departmentKey:null, equipmentKey:null, modelKey:null,
      partKey:null, codeKey:null, severityKey:null, dateKey:null, monthKey:null,
      photoKey:null, contentKey:null
    };
    if(!rows || !rows.length) return fm;
    var sample = rows[0];
    var keys = Object.keys(sample);
    /* find by alias list */
    var aliases = {
      authorKey:     ['writer','author','reporter','작성자','등록자','등록자명'],
      departmentKey: ['department','dept','team','부서','팀','소속'],
      equipmentKey:  ['machine','equipment','unit','호기','장비'],
      modelKey:      ['model','product','모델','제품'],
      partKey:       ['part','category','파트','부품','구분','majorCategory'],
      codeKey:       ['code','classcode','categoryCode','smallCategory','middleCategory','분류코드','코드'],
      severityKey:   ['severity','grade','level','중요도','등급'],
      dateKey:       ['date','reportDate','접수일자','일자','날짜'],
      monthKey:      ['monthKey','month','월'],
      photoKey:      ['photo','image','imageCount','attachment','사진','이미지','첨부'],
      contentKey:    ['content','description','내용','상세','설명','defectContent']
    };
    Object.keys(aliases).forEach(function(slot){
      var list = aliases[slot];
      for(var i=0;i<list.length;i++){
        if(keys.indexOf(list[i]) >= 0){ fm[slot] = list[i]; break; }
      }
      if(fm[slot]) return;
      /* case-insensitive fallback */
      for(var j=0;j<keys.length;j++){
        var kl = keys[j].toLowerCase();
        for(var k=0;k<list.length;k++){
          if(kl === list[k].toLowerCase()){ fm[slot] = keys[j]; return; }
        }
      }
    });
    /* if dateKey absent but monthKey present, leave both */
    return fm;
  };

  /* severity normalization */
  window.qCleanNormSev = function(v){
    var s = String(v == null ? '' : v).trim().toLowerCase();
    if(!s) return 'unknown';
    if(/치명|critical|crit|c1|grade.?1/.test(s)) return 'critical';
    if(/주요|major|c2|grade.?2/.test(s)) return 'major';
    if(/경미|minor|개선|c3|grade.?3/.test(s)) return 'minor';
    return 'unknown';
  };

  /* extract YYYY-MM month key */
  function monthOf(r, fm){
    if(fm.monthKey){
      var v = gv(r, fm.monthKey);
      if(v && /^\d{4}-\d{2}$/.test(v)) return v;
    }
    if(fm.dateKey){
      var d = gv(r, fm.dateKey);
      if(!d) return '';
      var m = d.match(/(\d{4})[-./](\d{1,2})/);
      if(m) return m[1] + '-' + (m[2].length === 1 ? '0' + m[2] : m[2]);
    }
    return '';
  }

  /* filter application */
  function applyFilters(rows, fm, state){
    if(!rows || !rows.length) return rows || [];
    var s = state || window.Q_CLEAN_FILTER_STATE || {};
    var kw = (s.keyword || '').trim().toLowerCase();
    return rows.filter(function(r){
      if(s.severity){
        var sv = fm.severityKey ? window.qCleanNormSev(r[fm.severityKey]) : null;
        if(s.severity === 'critical' && sv !== 'critical') return false;
        if(s.severity === 'major'    && sv !== 'major')    return false;
        if(s.severity === 'minor'    && !(sv === 'minor' || sv === 'unknown')) return false;
      }
      if(s.equipment && fm.equipmentKey){
        if(gv(r, fm.equipmentKey) !== s.equipment) return false;
      }
      if(s.part && fm.partKey){
        if(gv(r, fm.partKey) !== s.part) return false;
      }
      if(s.month){
        if(monthOf(r, fm) !== s.month) return false;
      }
      if(kw){
        var any = false;
        for(var k in r){
          if(Object.prototype.hasOwnProperty.call(r, k)){
            var vv = String(r[k] == null ? '' : r[k]).toLowerCase();
            if(vv.indexOf(kw) >= 0){ any = true; break; }
          }
        }
        if(!any) return false;
      }
      return true;
    });
  }

  /* --------------------------------------------------------------------------
   * 4. rate metrics (computed on the spot, no STEP05 dependency)
   * -------------------------------------------------------------------------- */
  function computeRateMetrics(rows, fm){
    function rate(key, predFn){
      if(!rows.length) return null;
      if(!key) return null;
      var pred = predFn || function(v){ return v != null && String(v).trim() !== ''; };
      var filled = 0;
      for(var i=0;i<rows.length;i++){ if(pred(rows[i][key])) filled++; }
      return rows.length ? (filled / rows.length) * 100 : null;
    }
    return {
      authorFillRate:     rate(fm.authorKey),
      departmentFillRate: rate(fm.departmentKey),
      equipmentFillRate:  rate(fm.equipmentKey),
      codeMatchRate:      rate(fm.codeKey),
      photoAttachRate:    rate(fm.photoKey, function(v){
        if(v == null || v === '') return false;
        if(typeof v === 'number') return v > 0;
        var s = String(v).trim().toLowerCase();
        if(!s || s === '0' || s === 'false' || s === 'no' || s === 'n') return false;
        return true;
      })
    };
  }

  /* top counts */
  window.qCleanBuildTopCounts = function(rows, key, limit){
    if(!key || !rows || !rows.length) return [];
    var map = {};
    rows.forEach(function(r){ var v = gv(r, key); if(!v) return; map[v] = (map[v] || 0) + 1; });
    return Object.keys(map)
      .map(function(k){ return { key:k, count:map[k] }; })
      .sort(function(a,b){ return b.count - a.count; })
      .slice(0, limit || 10);
  };

  /* --------------------------------------------------------------------------
   * 5. summary
   * -------------------------------------------------------------------------- */
  window.qCleanBuildSummary = function(){
    var rd = window.qCleanGetRows();
    var rows = rd.rows;
    var fm = window.qCleanDetectFieldMap(rows);
    var state = window.Q_CLEAN_FILTER_STATE || {};
    var filtered = applyFilters(rows, fm, state);

    var sevCounts = { critical:0, major:0, minor:0, unknown:0 };
    filtered.forEach(function(r){
      var k = fm.severityKey ? window.qCleanNormSev(r[fm.severityKey]) : 'unknown';
      sevCounts[k] = (sevCounts[k] || 0) + 1;
    });

    var rates = computeRateMetrics(filtered, fm);

    /* repeat candidates - equipment + part / equipment + content / part + severity */
    var repMap = {};
    if(fm.equipmentKey){
      filtered.forEach(function(r){
        var p = [
          gv(r, fm.equipmentKey),
          fm.partKey ? gv(r, fm.partKey) : '',
          fm.codeKey ? gv(r, fm.codeKey) : ''
        ].filter(function(x){ return x !== ''; }).join(' / ');
        if(!p) return;
        repMap[p] = (repMap[p] || 0) + 1;
      });
    }
    var repeats = Object.keys(repMap)
      .filter(function(k){ return repMap[k] >= 2; })
      .map(function(k){ return { key:k, count:repMap[k] }; })
      .sort(function(a,b){ return b.count - a.count; });

    return {
      hasRows:    rows.length > 0,
      source:     rd.source,
      totalRows:  rows.length,
      filteredRows: filtered.length,
      fieldMap:   fm,
      sevCounts:  sevCounts,
      rates:      rates,
      repeatCount: repeats.reduce(function(a,b){ return a + b.count; }, 0),
      repeatTop:  repeats.slice(0, 5),
      repeatAll:  repeats,
      filtered:   filtered
    };
  };

  /* --------------------------------------------------------------------------
   * 6. filter option build
   * -------------------------------------------------------------------------- */
  function buildFilterOptions(rows, fm){
    function uniq(rows, key){
      if(!key) return [];
      var seen = {};
      rows.forEach(function(r){ var v = gv(r, key); if(v) seen[v] = true; });
      return Object.keys(seen).sort();
    }
    function months(rows, fm){
      var seen = {};
      rows.forEach(function(r){
        var m = monthOf(r, fm);
        if(m) seen[m] = true;
      });
      return Object.keys(seen).sort();
    }
    return {
      months:    months(rows, fm),
      equipment: uniq(rows, fm.equipmentKey),
      part:      uniq(rows, fm.partKey)
    };
  }

  /* --------------------------------------------------------------------------
   * 7. SIDE render
   * -------------------------------------------------------------------------- */
  window.qCleanRenderSide = function(){
    var side = document.querySelector('#page-quality-analysis [data-qclean="side"]');
    if(!side) return false;
    var sm = window.qCleanBuildSummary();
    function pctOrCand(v){
      if(v == null) return '<span class="qcl-cand-badge">검토 필요</span>';
      return fmtPct(v);
    }
    function barRow(label, v){
      var has = v != null;
      var pct = has ? Math.max(0, Math.min(100, v)) : 0;
      var lowCls = (has && v < 70) ? 'is-low' : '';
      return ''
        + '<div class="qcl-side-row"><span class="l">' + esc(label) + '</span><span class="v">' + pctOrCand(v) + '</span></div>'
        + '<div class="qcl-side-bar ' + lowCls + '"><div class="fill" style="width:' + pct + '%"></div></div>';
    }
    var unkN = sm.sevCounts.minor + sm.sevCounts.unknown;
    var topListHtml = sm.repeatTop.length
      ? sm.repeatTop.map(function(rc){ return '<div class="qcl-side-top-item"><span class="k">' + esc(rc.key) + '</span><span class="c">' + rc.count + '</span></div>'; }).join('')
      : '<div class="qcl-side-empty">반복 후보 없음 (count \u2265 2)</div>';

    side.innerHTML = ''
      + '<div class="qcl-side-section">'
      +   '<div class="qcl-side-h">불량 현황</div>'
      +   '<div class="qcl-side-row"><span class="l">총 접수</span><span class="v">' + sm.filteredRows + '<span class="qcl-side-note" style="margin-left:4px">/' + sm.totalRows + '</span></span></div>'
      +   '<div class="qcl-side-row"><span class="l">치명</span><span class="v crit">' + sm.sevCounts.critical + '</span></div>'
      +   '<div class="qcl-side-row"><span class="l">주요</span><span class="v maj">' + sm.sevCounts.major + '</span></div>'
      +   '<div class="qcl-side-row"><span class="l">일반/개선</span><span class="v min">' + unkN + '</span></div>'
      +   '<div class="qcl-side-row"><span class="l">반복 후보</span><span class="v info">' + sm.repeatCount + '</span></div>'
      + '</div>'
      + '<div class="qcl-side-section">'
      +   '<div class="qcl-side-h">데이터 품질</div>'
      +   '<div class="qcl-side-row"><span class="l">코드 매칭률</span><span class="v">' + pctOrCand(sm.rates.codeMatchRate) + '</span></div>'
      +   '<div class="qcl-side-row"><span class="l">사진 첨부율</span><span class="v">' + pctOrCand(sm.rates.photoAttachRate) + '</span></div>'
      +   barRow('작성자 기재율', sm.rates.authorFillRate)
      +   barRow('부서 기재율',   sm.rates.departmentFillRate)
      +   barRow('호기 기재율',   sm.rates.equipmentFillRate)
      + '</div>'
      + '<div class="qcl-side-section">'
      +   '<div class="qcl-side-h">Top 반복/위험 후보</div>'
      +   '<div class="qcl-side-top-list">' + topListHtml + '</div>'
      +   '<div class="qcl-side-note">데이터 기준 후보 표시 · 확정 아님</div>'
      + '</div>';
    return true;
  };

  /* --------------------------------------------------------------------------
   * 8. tab renderers
   * -------------------------------------------------------------------------- */
  function renderEmpty(){
    return ''
      + '<div class="qcl-empty">'
      +   '<div class="icon">\ud83d\udcca</div>'
      +   '<div class="t">분석 데이터가 없습니다</div>'
      +   '<div class="s">불량 관리 센터에서 불량 접수방 엑셀 파일을 업로드하면<br>여기에 품질 분석 결과가 표시됩니다.</div>'
      +   '<div class="qcl-empty-cta"><button data-qcl-action="nav-quality-main">불량 관리 센터로 이동</button></div>'
      + '</div>';
  }
  function topTable(title, rows, fm, key, totalForPct){
    if(!key) return '<div class="qcl-notice tone-warn"><strong>' + esc(title) + '</strong> \u2014 필드 후보 없음. 데이터에 해당 컬럼이 있는지 확인해 주세요.</div>';
    var top = window.qCleanBuildTopCounts(rows, key, 10);
    if(!top.length) return '<div class="qcl-empty"><div class="t">' + esc(title) + ' 데이터 없음</div></div>';
    var rowsHtml = top.map(function(r){
      var pct = totalForPct > 0 ? (r.count/totalForPct*100) : 0;
      return '<tr><td>' + esc(r.key) + '</td><td class="c-num">' + r.count + '</td><td class="c-pct">' + fmtPct(pct) + '</td></tr>';
    }).join('');
    return ''
      + '<div class="qcl-table-wrap"><table class="qcl-table">'
      +   '<thead><tr><th>' + esc(title) + '</th><th class="c-num">건수</th><th class="c-pct">비중</th></tr></thead>'
      +   '<tbody>' + rowsHtml + '</tbody></table></div>';
  }

  /* simple SVG bar chart for trend (no 외부 차트 라이브러리) */
  function svgBars(items, opts){
    /* items = [{label, count}, ...] */
    if(!items || !items.length) return '';
    opts = opts || {};
    var w = opts.w || 520, h = opts.h || 60;
    var maxC = items.reduce(function(a,it){ return Math.max(a, it.count); }, 0);
    if(!maxC) maxC = 1;
    var barW = Math.max(2, (w - 20) / items.length - 2);
    var barsHtml = items.map(function(it, i){
      var bh = (h - 18) * (it.count / maxC);
      var x = 10 + i * (barW + 2);
      var y = (h - 12) - bh;
      var isLast = i === items.length - 1;
      return '<rect class="spark-bar' + (isLast ? ' is-last' : '') + '" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + bh + '"></rect>'
           + '<text x="' + (x + barW/2) + '" y="' + (h - 2) + '" text-anchor="middle">' + esc(it.label) + '</text>';
    }).join('');
    return '<svg class="qcl-spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' + barsHtml + '</svg>';
  }

  function tabOverview(sm){
    if(!sm.hasRows) return renderEmpty();
    var unkN = sm.sevCounts.minor + sm.sevCounts.unknown;
    var kpi = ''
      + '<div class="qcl-kpi-row">'
      +   '<div class="qcl-kpi"><div class="l">총 접수</div><div class="v">' + sm.filteredRows + '</div><div class="s">전체 ' + sm.totalRows + ' · 데이터 기준</div></div>'
      +   '<div class="qcl-kpi t-crit"><div class="l">치명</div><div class="v">' + sm.sevCounts.critical + '</div></div>'
      +   '<div class="qcl-kpi t-maj"><div class="l">주요</div><div class="v">' + sm.sevCounts.major + '</div></div>'
      +   '<div class="qcl-kpi t-min"><div class="l">일반/개선</div><div class="v">' + unkN + '</div></div>'
      +   '<div class="qcl-kpi t-info"><div class="l">반복 후보</div><div class="v">' + sm.repeatCount + '</div></div>'
      + '</div>';
    var sevDistRows = ['critical','major','minor','unknown'].map(function(k){
      var label = { critical:'치명', major:'주요', minor:'경미', unknown:'미분류' }[k];
      var n = sm.sevCounts[k] || 0;
      var pct = sm.filteredRows ? n/sm.filteredRows*100 : 0;
      var cls = ({critical:'crit',major:'maj',minor:'min',unknown:'unk'})[k];
      return '<tr><td><span class="qcl-sev-pill sev-' + cls + '">' + label + '</span></td><td class="c-num">' + n + '</td><td class="c-pct">' + fmtPct(pct) + '</td></tr>';
    }).join('');
    var sevDist = ''
      + '<div class="qcl-table-wrap"><table class="qcl-table">'
      +   '<thead><tr><th>중요도</th><th class="c-num">건수</th><th class="c-pct">비중</th></tr></thead>'
      +   '<tbody>' + sevDistRows + '</tbody></table></div>';
    var quality = ''
      + '<div class="qcl-notice">'
      +   '<strong>데이터 기재 상태</strong> \u2014 '
      +   '코드 매핑 ' + (sm.rates.codeMatchRate != null ? fmtPct(sm.rates.codeMatchRate) : '검토 필요') + ' · '
      +   '사진 첨부 ' + (sm.rates.photoAttachRate != null ? fmtPct(sm.rates.photoAttachRate) : '검토 필요') + ' · '
      +   '작성자 ' + (sm.rates.authorFillRate != null ? fmtPct(sm.rates.authorFillRate) : '검토 필요') + ' · '
      +   '부서 ' + (sm.rates.departmentFillRate != null ? fmtPct(sm.rates.departmentFillRate) : '검토 필요')
      + '</div>';
    return ''
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">\ud83d\udcca KPI</div>' + kpi + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">중요도 분포</div>' + sevDist + '</div>'
      + '<div class="qcl-2col">'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">파트 Top</div>' + topTable('파트', sm.filtered, sm.fieldMap, sm.fieldMap.partKey, sm.filteredRows) + '</div>'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">장비 Top</div>' + topTable('장비', sm.filtered, sm.fieldMap, sm.fieldMap.equipmentKey, sm.filteredRows) + '</div>'
      + '</div>'
      + '<div class="qcl-panel-section">' + quality + '</div>';
  }

  function tabTrend(sm){
    if(!sm.hasRows) return renderEmpty();
    if(!sm.fieldMap.dateKey && !sm.fieldMap.monthKey){
      return '<div class="qcl-notice tone-warn"><strong>일자 필드 미감지</strong> \u2014 업로드 데이터에 일자 컬럼이 있는지 확인해 주세요.</div>';
    }
    var mmap = {};
    sm.filtered.forEach(function(r){
      var m = monthOf(r, sm.fieldMap);
      if(m) mmap[m] = (mmap[m] || 0) + 1;
    });
    var months = Object.keys(mmap).sort();
    if(!months.length) return '<div class="qcl-notice tone-warn"><strong>월별 키 추출 실패</strong> \u2014 일자 형식이 YYYY-MM-DD 또는 YYYY.MM.DD 인지 확인해 주세요.</div>';

    var items = months.map(function(m){ return { label:m.slice(2), count:mmap[m] }; });
    var spark = svgBars(items, { w:520, h:80 });

    var monthMaxC = months.reduce(function(a,m){ return Math.max(a, mmap[m]); }, 0);
    var monthRows = months.map(function(m){
      var n = mmap[m];
      var pct = monthMaxC ? n/monthMaxC*100 : 0;
      return '<tr><td>' + esc(m) + '</td><td class="c-num">' + n + '</td><td style="min-width:140px"><div class="qcl-side-bar"><div class="fill" style="width:' + pct + '%"></div></div></td></tr>';
    }).join('');

    var recentNote = '';
    if(months.length >= 2){
      var last = mmap[months[months.length-1]], prev = mmap[months[months.length-2]];
      var diff = last - prev;
      if(diff > 0){
        recentNote = '<div class="qcl-notice tone-warn"><strong>최근 증가 후보</strong> \u2014 직전 월(' + esc(months[months.length-2]) + ': ' + prev + ') 대비 마지막 월(' + esc(months[months.length-1]) + ': ' + last + ') ' + diff + '건 증가 <span class="qcl-cand-badge">검토 필요</span></div>';
      } else {
        recentNote = '<div class="qcl-notice"><strong>최근 추이</strong> \u2014 직전 월 대비 ' + Math.abs(diff) + '건 감소 또는 동일</div>';
      }
    }
    return ''
      + '<div class="qcl-panel-section">' + recentNote + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">월별 발생 추이</div>' + spark + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">월별 count</div>'
      +   '<div class="qcl-table-wrap"><table class="qcl-table"><thead><tr><th>월</th><th class="c-num">건수</th><th>분포</th></tr></thead><tbody>' + monthRows + '</tbody></table></div>'
      + '</div>';
  }

  function tabClassify(sm){
    if(!sm.hasRows) return renderEmpty();
    var sevRows = ['critical','major','minor','unknown'].map(function(k){
      var label = { critical:'치명', major:'주요', minor:'경미', unknown:'미분류' }[k];
      var n = sm.sevCounts[k] || 0;
      var pct = sm.filteredRows ? n/sm.filteredRows*100 : 0;
      var cls = ({critical:'crit',major:'maj',minor:'min',unknown:'unk'})[k];
      return '<tr><td><span class="qcl-sev-pill sev-' + cls + '">' + label + '</span></td><td class="c-num">' + n + '</td><td class="c-pct">' + fmtPct(pct) + '</td></tr>';
    }).join('');
    var sevTbl = '<div class="qcl-table-wrap"><table class="qcl-table"><thead><tr><th>중요도</th><th class="c-num">건수</th><th class="c-pct">비중</th></tr></thead><tbody>' + sevRows + '</tbody></table></div>';
    var unmappedNote = sm.fieldMap.codeKey
      ? '<div class="qcl-notice"><strong>코드 매핑</strong> ' + fmtPct(sm.rates.codeMatchRate) + ' · 데이터 기준 후보 <span class="qcl-cand-badge">검토 필요</span></div>'
      : '<div class="qcl-notice tone-warn"><strong>코드 매핑 필요</strong> \u2014 분류코드 컬럼을 데이터에서 찾지 못했습니다.</div>';
    return ''
      + '<div class="qcl-2col">'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">파트별 count</div>' + topTable('파트', sm.filtered, sm.fieldMap, sm.fieldMap.partKey, sm.filteredRows) + '</div>'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">중요도별 count</div>' + sevTbl + '</div>'
      + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">분류 / 코드 상태</div>' + unmappedNote + '</div>';
  }

  function tabEquip(sm){
    if(!sm.hasRows) return renderEmpty();
    var equipKey = sm.fieldMap.equipmentKey;
    var modelKey = sm.fieldMap.modelKey;
    var missCount = equipKey ? sm.filtered.filter(function(r){ return !gv(r, equipKey); }).length : sm.filtered.length;
    var kpi = ''
      + '<div class="qcl-kpi-row">'
      +   '<div class="qcl-kpi"><div class="l">장비/호기 필드</div><div class="v">' + (equipKey ? esc(equipKey) : '<span class="qcl-cand-badge">미감지</span>') + '</div></div>'
      +   '<div class="qcl-kpi t-maj"><div class="l">장비/호기 미기재</div><div class="v">' + missCount + '</div><div class="s">' + (sm.filteredRows ? fmtPct(missCount/sm.filteredRows*100) : '\u2014') + '</div></div>'
      + '</div>';
    return ''
      + '<div class="qcl-panel-section">' + kpi + '</div>'
      + '<div class="qcl-2col">'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">장비/호기별 count</div>' + topTable('장비/호기', sm.filtered, sm.fieldMap, equipKey, sm.filteredRows) + '</div>'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">모델별 count</div>' + topTable('모델', sm.filtered, sm.fieldMap, modelKey, sm.filteredRows) + '</div>'
      + '</div>';
  }

  function tabRepeat(sm){
    if(!sm.hasRows) return renderEmpty();
    var fm = sm.fieldMap;
    if(!fm.equipmentKey || (!fm.partKey && !fm.codeKey)){
      return '<div class="qcl-notice tone-warn"><strong>반복 후보 분석 불가</strong> \u2014 장비 필드 또는 파트/코드 필드 미감지.</div>';
    }
    var candidates = sm.repeatAll;
    if(!candidates.length){
      return '<div class="qcl-empty"><div class="t">반복 후보 없음</div><div class="s">필터 적용 데이터 ' + sm.filteredRows + '건 중 동일 장비+파트/코드 조합 2건 이상 없음</div></div>';
    }
    var rowsHtml = candidates.slice(0, 30).map(function(rc, i){
      return '<tr><td class="c-num">' + (i+1) + '</td><td>' + esc(rc.key) + '</td><td class="c-num">' + rc.count + '</td></tr>';
    }).join('');
    var foot = candidates.length > 30 ? '<div class="qcl-table-foot">상위 30 표시 · 전체 후보 ' + candidates.length + '건</div>' : '<div class="qcl-table-foot">전체 후보 ' + candidates.length + '건</div>';
    return ''
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-notice"><strong>반복 후보 기준</strong> \u2014 동일 장비 + 동일 파트/코드 조합이 2건 이상 발견된 row. <span class="qcl-cand-badge">검토 필요</span> · 확정 아님</div>'
      + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">반복 후보 Top</div>'
      +   '<div class="qcl-table-wrap"><table class="qcl-table"><thead><tr><th class="c-num">#</th><th>장비 / 파트 / 코드</th><th class="c-num">발생 건수</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>' + foot + '</div>'
      + '</div>';
  }

  function tabSchedule(sm){
    var hasWork = !!(window.WORK_DATA && window.WORK_DATA.length);
    var fm = sm.fieldMap;
    var canLinkBy = [];
    if(fm.equipmentKey) canLinkBy.push('호기');
    if(fm.modelKey)     canLinkBy.push('모델');
    if(fm.partKey)      canLinkBy.push('파트');
    return ''
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-notice"><strong>생산일정 연계</strong> \u2014 품질 분석 데이터와 생산일정 WORK_DATA 의 연결은 현재 <strong>연동 준비</strong> 상태입니다. 운영 검토 후 적용 예정입니다.</div>'
      + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">감지 상태</div>'
      +   '<div class="qcl-cc-grid">'
      +     '<div class="qcl-cc-tile"><div class="l">WORK_DATA</div><div class="v ' + (hasWork ? 'ok' : 'miss') + '">' + (hasWork ? '감지 (' + window.WORK_DATA.length + ' rows)' : '미감지') + '</div></div>'
      +     '<div class="qcl-cc-tile"><div class="l">연결 가능 필드</div><div class="v">' + (canLinkBy.length ? esc(canLinkBy.join(' / ')) : '<span class="qcl-cand-badge">미감지</span>') + '</div></div>'
      +     '<div class="qcl-cc-tile"><div class="l">품질 row 수</div><div class="v">' + sm.filteredRows + '</div></div>'
      +   '</div>'
      + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">연동 로드맵</div>'
      +   '<div class="qcl-roadmap">'
      +     '<span class="k">현재</span><span class="v">품질 분석 데이터 기준 후보 표시</span>'
      +     '<span class="k">예정</span><span class="v pending">생산일정 WORK_DATA 와 호기/모델 키 매핑 연결</span>'
      +     '<span class="k">필요</span><span class="v pending">코드 매핑 / 기준정보 연결 / API export 준비</span>'
      +     '<span class="k">상태</span><span class="v pending">연동 준비</span>'
      +   '</div>'
      + '</div>';
  }

  function tabAuthor(sm){
    if(!sm.hasRows) return renderEmpty();
    var fm = sm.fieldMap;
    var missAuth = fm.authorKey ? sm.filtered.filter(function(r){ return !gv(r, fm.authorKey); }).length : sm.filteredRows;
    var missDept = fm.departmentKey ? sm.filtered.filter(function(r){ return !gv(r, fm.departmentKey); }).length : sm.filteredRows;
    return ''
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-kpi-row">'
      +     '<div class="qcl-kpi"><div class="l">작성자 기재율</div><div class="v">' + (sm.rates.authorFillRate != null ? fmtPct(sm.rates.authorFillRate) : '<span class="qcl-cand-badge">검토 필요</span>') + '</div><div class="s">미기재 ' + missAuth + '건</div></div>'
      +     '<div class="qcl-kpi"><div class="l">부서 기재율</div><div class="v">' + (sm.rates.departmentFillRate != null ? fmtPct(sm.rates.departmentFillRate) : '<span class="qcl-cand-badge">검토 필요</span>') + '</div><div class="s">미기재 ' + missDept + '건</div></div>'
      +   '</div>'
      + '</div>'
      + '<div class="qcl-2col">'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">작성자별 count</div>' + topTable('작성자', sm.filtered, fm, fm.authorKey, sm.filteredRows) + '</div>'
      +   '<div class="qcl-panel-section"><div class="qcl-panel-h">부서별 count</div>' + topTable('부서', sm.filtered, fm, fm.departmentKey, sm.filteredRows) + '</div>'
      + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-notice">개인 평가 / 등급 산정이 아닙니다. 데이터 기재 현황 점검용 후보 표시입니다.</div></div>';
  }

  function tabRaw(sm){
    if(!sm.hasRows) return renderEmpty();
    var rows = sm.filtered.slice(0, 50);
    if(!rows.length) return '<div class="qcl-empty"><div class="t">필터에 일치하는 row 없음</div><div class="s">필터를 초기화하거나 다른 조건을 시도해 보세요.</div></div>';
    var keys = Object.keys(rows[0]).filter(function(k){
      var v = rows[0][k];
      return v == null || typeof v !== 'object';
    }).slice(0, 8);
    var head = '<tr>' + keys.map(function(k){ return '<th>' + esc(k) + '</th>'; }).join('') + '</tr>';
    var body = rows.map(function(r){
      return '<tr>' + keys.map(function(k){
        var v = r[k] == null ? '' : String(r[k]);
        if(!v.trim()) return '<td><span class="qcl-cand-badge">미기재</span></td>';
        if(v.length > 60) v = v.slice(0, 57) + '\u2026';
        return '<td>' + esc(v) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    var foot = '<div class="qcl-table-foot">표시 ' + rows.length + ' / 필터 적용 ' + sm.filteredRows + ' / 전체 ' + sm.totalRows + ' · 최대 50건</div>';
    return ''
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-notice"><strong>Raw Data</strong> \u2014 최대 50건 미리보기 표시. 필터를 적용해 원하는 범위로 좁힐 수 있습니다. 전체 export 는 별도 기능 예정.</div>'
      + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">데이터 (' + keys.length + ' 컬럼 표시)</div>'
      +   '<div class="qcl-table-wrap" style="max-height:480px;overflow-y:auto"><table class="qcl-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>' + foot + '</div>'
      + '</div>';
  }

  function tabCodecheck(sm){
    var fm = sm.fieldMap;
    var hasCode = !!fm.codeKey;
    var rate = sm.rates.codeMatchRate;
    var miss = hasCode ? sm.filtered.filter(function(r){ return !gv(r, fm.codeKey); }).length : sm.filtered.length;
    return ''
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-cc-grid">'
      +     '<div class="qcl-cc-tile"><div class="l">코드 필드 감지</div><div class="v ' + (hasCode ? 'ok' : 'miss') + '">' + (hasCode ? esc(fm.codeKey) + ' (감지)' : '미감지') + '</div></div>'
      +     '<div class="qcl-cc-tile"><div class="l">코드 매핑 상태</div><div class="v ' + (rate != null ? '' : 'miss') + '">' + (rate != null ? fmtPct(rate) : '검토 필요') + '</div></div>'
      +     '<div class="qcl-cc-tile"><div class="l">코드 미감지/미기재</div><div class="v ' + (miss > 0 ? 'miss' : 'ok') + '">' + miss + '건</div></div>'
      +   '</div>'
      + '</div>'
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-notice ' + (hasCode ? '' : 'tone-warn') + '">'
      +     '<strong>코드 검증 안내</strong> \u2014 '
      +     (hasCode
        ? '데이터의 코드 필드를 감지했습니다. 코드 매핑은 데이터 기준 후보값이며, 기준정보 매핑 필요 항목은 별도 진행 예정입니다.'
        : '데이터에서 코드 컬럼을 찾지 못했습니다. 분류코드 컬럼이 포함되어 있는지 확인해 주세요. <strong>코드 매핑 필요</strong>.')
      +   '</div>'
      + '</div>'
      + (hasCode ? '<div class="qcl-panel-section"><div class="qcl-panel-h">코드별 count</div>' + topTable('코드', sm.filtered, fm, fm.codeKey, sm.filteredRows) + '</div>' : '');
  }

  function tabActionPri(sm){
    if(!sm.hasRows) return renderEmpty();
    var fm = sm.fieldMap;
    var critCount = sm.sevCounts.critical;
    var majorCount = sm.sevCounts.major;
    var unmappedCode = fm.codeKey ? sm.filtered.filter(function(r){ return !gv(r, fm.codeKey); }).length : 0;
    var unmappedEquip = fm.equipmentKey ? sm.filtered.filter(function(r){ return !gv(r, fm.equipmentKey); }).length : 0;
    var topRepeat = sm.repeatTop;

    var repeatRows = topRepeat.length
      ? topRepeat.map(function(rc, i){ return '<tr><td class="c-num">' + (i+1) + '</td><td>' + esc(rc.key) + '</td><td class="c-num">' + rc.count + '</td></tr>'; }).join('')
      : '';
    var repeatTbl = repeatRows
      ? '<div class="qcl-table-wrap"><table class="qcl-table"><thead><tr><th class="c-num">#</th><th>장비 / 파트 / 코드</th><th class="c-num">건수</th></tr></thead><tbody>' + repeatRows + '</tbody></table></div>'
      : '<div class="qcl-empty"><div class="t">반복 후보 없음</div></div>';

    return ''
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-notice tone-warn"><strong>조치 후보 안내</strong> \u2014 본 화면은 조치 우선순위를 자동 확정하지 않습니다. 아래는 검토 후보 표시이며, 실제 우선순위 산정은 운영 담당자 검토 후 결정됩니다. CAPA/ECO 자동 생성 없음.</div>'
      + '</div>'
      + '<div class="qcl-panel-section">'
      +   '<div class="qcl-kpi-row">'
      +     '<div class="qcl-kpi t-crit"><div class="l">치명 후보</div><div class="v">' + critCount + '</div><div class="s">중요도 기준</div></div>'
      +     '<div class="qcl-kpi t-maj"><div class="l">주요 후보</div><div class="v">' + majorCount + '</div></div>'
      +     '<div class="qcl-kpi t-info"><div class="l">반복 후보</div><div class="v">' + sm.repeatCount + '</div></div>'
      +     '<div class="qcl-kpi"><div class="l">코드 미기재</div><div class="v">' + unmappedCode + '</div></div>'
      +     '<div class="qcl-kpi"><div class="l">장비 미기재</div><div class="v">' + unmappedEquip + '</div></div>'
      +   '</div>'
      + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">반복 후보 (Top 5)</div>' + repeatTbl + '</div>'
      + '<div class="qcl-panel-section"><div class="qcl-panel-h">조치 검토 후보 기준</div>'
      +   '<div class="qcl-roadmap">'
      +     '<span class="k">중요도</span><span class="v">치명 / 주요 분류 검토</span>'
      +     '<span class="k">반복성</span><span class="v">동일 장비 + 파트/코드 반복 후보</span>'
      +     '<span class="k">데이터 품질</span><span class="v">코드 / 장비 미기재 row 점검</span>'
      +     '<span class="k">자동 계산</span><span class="v pending">기준 확정 후 적용</span>'
      +   '</div>'
      + '</div>';
  }

  /* --------------------------------------------------------------------------
   * 9. tab render + switch
   * -------------------------------------------------------------------------- */
  window.qCleanRenderTab = function(){
    var panel = document.querySelector('#page-quality-analysis [data-qclean="panel"]');
    if(!panel) return false;
    var sm = window.qCleanBuildSummary();
    var tab = window.Q_CLEAN_ACTIVE_TAB || 'overview';
    var html;
    switch(tab){
      case 'overview':  html = tabOverview(sm);  break;
      case 'trend':     html = tabTrend(sm);     break;
      case 'classify':  html = tabClassify(sm);  break;
      case 'equip':     html = tabEquip(sm);     break;
      case 'repeat':    html = tabRepeat(sm);    break;
      case 'schedule':  html = tabSchedule(sm);  break;
      case 'author':    html = tabAuthor(sm);    break;
      case 'raw':       html = tabRaw(sm);       break;
      case 'codecheck': html = tabCodecheck(sm); break;
      case 'actionpri': html = tabActionPri(sm); break;
      default:          html = tabOverview(sm);
    }
    panel.innerHTML = html;
    return true;
  };

  window.qCleanSwitchTab = function(key, btn){
    try {
      window.Q_CLEAN_ACTIVE_TAB = key;
      var tabs = document.querySelector('#page-quality-analysis [data-qclean="tabs"]');
      if(tabs){
        tabs.querySelectorAll('button').forEach(function(b){
          b.classList.remove('is-active');
          b.removeAttribute('aria-selected');
        });
        var target = btn || tabs.querySelector('button[data-qcl-tab="' + key + '"]');
        if(target){
          target.classList.add('is-active');
          target.setAttribute('aria-selected', 'true');
        }
      }
      window.qCleanRenderTab();
    } catch(_e){}
  };

  window.qCleanApplyFilters = function(){
    try {
      var f = document.querySelector('#page-quality-analysis [data-qclean="filter"]');
      if(!f) return;
      var state = window.Q_CLEAN_FILTER_STATE;
      function g(name){
        var el = f.querySelector('[data-qcl-filter="' + name + '"]');
        return el ? (el.value || '').trim() : '';
      }
      state.month     = g('month');
      state.severity  = g('severity');
      state.equipment = g('equipment');
      state.part      = g('part');
      state.keyword   = g('keyword');
      window.qCleanRenderSide();
      window.qCleanRenderTab();
      qCleanUpdateFilterCount();
    } catch(_e){}
  };

  window.qCleanResetFilters = function(){
    try {
      var state = window.Q_CLEAN_FILTER_STATE;
      state.month = ''; state.severity = ''; state.equipment = ''; state.part = ''; state.keyword = '';
      var f = document.querySelector('#page-quality-analysis [data-qclean="filter"]');
      if(f){
        f.querySelectorAll('[data-qcl-filter]').forEach(function(el){ el.value = ''; });
      }
      window.qCleanRenderSide();
      window.qCleanRenderTab();
      qCleanUpdateFilterCount();
    } catch(_e){}
  };

  function qCleanUpdateFilterCount(){
    var f = document.querySelector('#page-quality-analysis [data-qclean="filter"]');
    if(!f) return;
    var sm = window.qCleanBuildSummary();
    var fEl = f.querySelector('[data-qcl-cnt="filtered"]');
    var tEl = f.querySelector('[data-qcl-cnt="total"]');
    if(fEl) fEl.textContent = sm.filteredRows;
    if(tEl) tEl.textContent = sm.totalRows;
  }

  /* --------------------------------------------------------------------------
   * 10. SHELL render — replaces page-quality-analysis innerHTML
   * -------------------------------------------------------------------------- */
  function buildFilterBar(rows, fm){
    var opts = buildFilterOptions(rows, fm);
    function optionHtml(arr){
      return '<option value="">전체</option>' + arr.map(function(v){ return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('');
    }
    return ''
      + '<div class="qcl-filter-field"><span class="l">기간</span>'
      +   '<select data-qcl-filter="month"' + (opts.months.length ? '' : ' disabled') + '>' + optionHtml(opts.months) + '</select>'
      + '</div>'
      + '<div class="qcl-filter-field"><span class="l">중요도</span>'
      +   '<select data-qcl-filter="severity">'
      +     '<option value="">전체</option>'
      +     '<option value="critical">치명</option>'
      +     '<option value="major">주요</option>'
      +     '<option value="minor">일반/개선</option>'
      +   '</select>'
      + '</div>'
      + '<div class="qcl-filter-field"><span class="l">장비</span>'
      +   '<select data-qcl-filter="equipment"' + (opts.equipment.length ? '' : ' disabled') + '>' + optionHtml(opts.equipment) + '</select>'
      + '</div>'
      + '<div class="qcl-filter-field"><span class="l">파트</span>'
      +   '<select data-qcl-filter="part"' + (opts.part.length ? '' : ' disabled') + '>' + optionHtml(opts.part) + '</select>'
      + '</div>'
      + '<div class="qcl-filter-field"><span class="l">검색</span>'
      +   '<input type="text" data-qcl-filter="keyword" placeholder="키워드 입력" />'
      + '</div>'
      + '<button class="qcl-filter-reset" data-qcl-action="reset">초기화</button>'
      + '<div class="qcl-filter-cnt">표시 row <strong data-qcl-cnt="filtered">\u2014</strong> / 전체 <strong data-qcl-cnt="total">\u2014</strong></div>';
  }
  function buildTabBar(){
    return TABS.map(function(t){
      var active = (window.Q_CLEAN_ACTIVE_TAB === t.key);
      return '<button type="button" data-qcl-tab="' + t.key + '" class="' + (active ? 'is-active' : '') + '" role="tab" aria-selected="' + (active ? 'true' : 'false') + '">' + esc(t.label) + '</button>';
    }).join('');
  }
  function buildDetectBar(rd, fm){
    var source = rd.source === 'none' ? '<span class="miss">미감지</span>' : '<span class="ok">' + esc(rd.source) + '</span>';
    function fieldStatus(label, key){
      return label + ': ' + (key ? '<span class="ok">' + esc(key) + '</span>' : '<span class="miss">검토 필요</span>');
    }
    return ''
      + '<div class="qcl-detect">'
      +   '<span><strong>데이터 source</strong>: ' + source + '</span>'
      +   '<span>' + fieldStatus('장비', fm.equipmentKey) + '</span>'
      +   '<span>' + fieldStatus('파트', fm.partKey) + '</span>'
      +   '<span>' + fieldStatus('중요도', fm.severityKey) + '</span>'
      +   '<span>' + fieldStatus('코드', fm.codeKey) + '</span>'
      +   '<span>' + fieldStatus('일자', fm.dateKey || fm.monthKey) + '</span>'
      + '</div>';
  }

  function bindShellEvents(){
    var page = document.getElementById('page-quality-analysis');
    if(!page) return;

    var f = page.querySelector('[data-qclean="filter"]');
    if(f && !f.__qclBound){
      f.addEventListener('change', function(e){
        if(e.target && e.target.matches && e.target.matches('[data-qcl-filter]')){
          window.qCleanApplyFilters();
        }
      });
      f.addEventListener('input', function(e){
        if(e.target && e.target.matches && e.target.matches('[data-qcl-filter="keyword"]')){
          clearTimeout(f.__qclKw);
          f.__qclKw = setTimeout(function(){ window.qCleanApplyFilters(); }, 200);
        }
      });
      f.addEventListener('click', function(e){
        if(e.target && e.target.matches && e.target.matches('[data-qcl-action="reset"]')){
          window.qCleanResetFilters();
        }
      });
      f.__qclBound = true;
    }

    var tabs = page.querySelector('[data-qclean="tabs"]');
    if(tabs && !tabs.__qclBound){
      tabs.addEventListener('click', function(e){
        var b = e.target;
        while(b && b !== tabs && !(b.matches && b.matches('[data-qcl-tab]'))) b = b.parentNode;
        if(b && b.matches && b.matches('[data-qcl-tab]')){
          window.qCleanSwitchTab(b.getAttribute('data-qcl-tab'), b);
        }
      });
      tabs.__qclBound = true;
    }

    /* empty-state CTA button (go to quality-main) */
    page.addEventListener('click', function(e){
      var b = e.target;
      while(b && b !== page && !(b.matches && b.matches('[data-qcl-action="nav-quality-main"]'))) b = b.parentNode;
      if(b && b.matches && b.matches('[data-qcl-action="nav-quality-main"]')){
        try { if(typeof window.nav === 'function') window.nav('quality-main'); } catch(_e){}
      }
    });
  }

  window.qCleanRenderShell = function(){
    var page = document.getElementById('page-quality-analysis');
    if(!page) return false;

    /* remove old static structure including q-flow-trace-analysis (idempotent) */
    [
      '#q-flow-trace-analysis','#qanalysis-tabbar','#qanalysis-empty','#qanalysis-content','#qd-machine-modal'
    ].forEach(function(sel){
      var el = page.querySelector(sel);
      if(el && el.parentNode) el.parentNode.removeChild(el);
    });

    var rd = window.qCleanGetRows();
    var rows = rd.rows;
    var fm = window.qCleanDetectFieldMap(rows);

    page.innerHTML = ''
      + '<div class="pg-hd">'
      +   '<div class="pg-title">\ud83d\udd2c 품질 분석 센터</div>'
      +   '<div class="pg-sub">업로드된 불량 데이터를 기준으로 품질 현황 / 반복 패턴 / 장비\u00b7호기 / 코드 검증 / 조치 검토 후보 분석</div>'
      + '</div>'
      + '<section data-qclean="root">'
      +   '<aside data-qclean="side" aria-label="품질 요약"></aside>'
      +   '<div data-qclean="main">'
      +     '<header class="qcl-header">'
      +       '<div class="qcl-eyebrow">품질관리</div>'
      +       '<h2>품질 분석 센터</h2>'
      +       '<p>업로드된 불량 데이터를 기준으로 분석합니다. 모든 결과는 데이터 기준 후보값으로, 확정 판단은 운영 검토 후 적용됩니다. 자동 점수화와 자동 우선순위 확정은 본 화면에서 수행하지 않습니다.</p>'
      +     '</header>'
      +     buildDetectBar(rd, fm)
      +     '<div data-qclean="filter">' + buildFilterBar(rows, fm) + '</div>'
      +     '<div data-qclean="tabs" role="tablist">' + buildTabBar() + '</div>'
      +     '<div data-qclean="panel" role="tabpanel"></div>'
      +   '</div>'
      + '</section>';

    /* restore filter state into selects */
    var state = window.Q_CLEAN_FILTER_STATE || {};
    var f = page.querySelector('[data-qclean="filter"]');
    if(f){
      ['month','severity','equipment','part','keyword'].forEach(function(name){
        var el = f.querySelector('[data-qcl-filter="' + name + '"]');
        if(el && state[name]) el.value = state[name];
      });
    }

    bindShellEvents();
    window.qCleanRenderSide();
    window.qCleanRenderTab();
    qCleanUpdateFilterCount();
    return true;
  };

  /* --------------------------------------------------------------------------
   * 11. MutationObserver — strip q-flow-trace-analysis if re-injected later
   * -------------------------------------------------------------------------- */
  function qCleanSetupStripper(){
    try {
      var page = document.getElementById('page-quality-analysis');
      if(!page) return;
      if(window.__qCleanStripObserver) return;
      var STRIP_SEL = ['#q-flow-trace-analysis','#qanalysis-tabbar','#qanalysis-empty','#qanalysis-content','#qd-machine-modal'];
      var observer = new MutationObserver(function(muts){
        for(var i=0;i<muts.length;i++){
          for(var j=0;j<muts[i].addedNodes.length;j++){
            var n = muts[i].addedNodes[j];
            if(n && n.nodeType === 1){
              STRIP_SEL.forEach(function(sel){
                try {
                  if(n.matches && n.matches(sel) && n.parentNode) n.parentNode.removeChild(n);
                  if(n.querySelectorAll){
                    n.querySelectorAll(sel).forEach(function(el){ if(el.parentNode) el.parentNode.removeChild(el); });
                  }
                } catch(_e){}
              });
            }
          }
        }
      });
      observer.observe(page, { childList:true, subtree:true });
      window.__qCleanStripObserver = observer;
    } catch(_e){}
  }

  /* --------------------------------------------------------------------------
   * 12. override legacy renderQAnalysisPage + switchQAnalysis so they no longer
   *     try to manipulate the old (now removed) qanalysis-empty / qanalysis-content
   *     and instead call our renderer. Safe shim — backs up originals.
   * -------------------------------------------------------------------------- */
  function qCleanOverrideLegacy(){
    try {
      window.__qCleanLegacyBackup = window.__qCleanLegacyBackup || {};
      if(typeof window.renderQAnalysisPage === 'function' && !window.renderQAnalysisPage.__qClean){
        window.__qCleanLegacyBackup.renderQAnalysisPage = window.renderQAnalysisPage;
        var shim = function(){
          try { window.qCleanRenderShell(); } catch(_e){}
        };
        shim.__qClean = true;
        window.renderQAnalysisPage = shim;
      }
      if(typeof window.switchQAnalysis === 'function' && !window.switchQAnalysis.__qClean){
        window.__qCleanLegacyBackup.switchQAnalysis = window.switchQAnalysis;
        var shim2 = function(/*tab, btn*/){};
        shim2.__qClean = true;
        window.switchQAnalysis = shim2;
      }
    } catch(_e){}
  }

  /* --------------------------------------------------------------------------
   * 13. dispatcher wrap — also auto-render on nav('quality-analysis')
   * -------------------------------------------------------------------------- */
  function qCleanWrapDispatcher(){
    try {
      if(typeof window.odiNavAfterRenderDispatcher !== 'function') return false;
      if(window.odiNavAfterRenderDispatcher.__qCleanWrapped) return true;
      var original = window.odiNavAfterRenderDispatcher;
      var wrapped = function(k){
        var ret = original.apply(this, arguments);
        if(k === 'quality-analysis'){
          setTimeout(function(){
            try { qCleanOverrideLegacy(); } catch(_e){}
            try { window.qCleanRenderShell(); } catch(_e){}
          }, 140);
        }
        return ret;
      };
      wrapped.__qCleanWrapped = true;
      window.odiNavAfterRenderDispatcher = wrapped;
      return true;
    } catch(_e){ return false; }
  }

  /* --------------------------------------------------------------------------
   * 14. init
   * -------------------------------------------------------------------------- */
  window.qCleanInit = function(){
    try {
      qCleanOverrideLegacy();
      window.qCleanRenderShell();
      qCleanSetupStripper();
      qCleanWrapDispatcher();
    } catch(e){ try { console.warn('[' + VERSION + '] init failed:', e); } catch(_e){} }
  };

  /* --------------------------------------------------------------------------
   * 15. audit
   * -------------------------------------------------------------------------- */
  window.ODI_QUALITY_ANALYSIS_CLEAN_REBUILD_AUDIT = {
    version: VERSION,
    purpose: 'Clean rebuild of page-quality-analysis from 08J base. Replaces legacy 6-tab qanalysis structure with user-facing 10-tab analytics center. Removes q-flow-trace-analysis from user view.',
    legacyStructureRemoved: ['q-flow-trace-analysis','qanalysis-tabbar','qanalysis-empty','qanalysis-content','qanalysis-panel-machine','qanalysis-panel-model','qanalysis-panel-cell','qanalysis-panel-date','qanalysis-panel-code','qanalysis-panel-writer','qd-machine-modal'],
    legacyTabsAbsorbed:     ['호기별 분석','모델/종류별','CELL별 분석','날짜/차수 분석','분류코드 분석','작성자/부서'],
    newTabs:                ['overview','trend','classify','equip','repeat','schedule','author','raw','codecheck','actionpri'],
    referenceCopiedDirectly:    false,
    allDataImported:            false,
    chartJsAdded:               false,
    googleFontsAdded:           false,
    finalRiskScoreCalculated:   false,
    actionPriorityAutoCalculated: false,
    capaEcoAutoGenerated:       false,
    passFailAutoJudged:         false,
    qualityScoreCalculated:     false,
    rawDataMaxRows:             50,
    rawDataMaxCols:             8,
    workingPrinciples: {
      improvementPoints: [
        'page-quality-analysis 내부만 clean rebuild — 기존 6탭 qanalysis 구조 및 q-flow-trace-analysis 사용자 화면에서 제거',
        '사용자용 10탭: 종합현황 / 불량추이 / 분류분석 / 장비\u00b7호기 / 반복\u00b7패턴 / 생산일정 연계 / 작성자\u00b7부서 / Raw Data / 코드검증 / 조치우선순위',
        '좌측 요약 패널: 불량 현황 (총 접수/치명/주요/일반·개선/반복 후보) + 데이터 품질 (코드 매칭/사진/작성자/부서/호기 기재율) + Top 반복/위험 후보',
        '상단 데이터 감지 상태 bar: source / 장비 / 파트 / 중요도 / 코드 / 일자 필드 감지 결과 표시',
        '전역 필터: 기간 / 중요도 / 장비 / 파트 / 키워드 / 초기화 — 실제로 결과 갱신 (disabled placeholder 없음)',
        '필터는 KPI, 사이드, 모든 탭 콘텐츠, Top N, 반복 후보, Raw Data, 코드검증, 조치 검토 후보에 모두 반영',
        '불량추이 탭에 자체 SVG sparkline 차트 (외부 차트 라이브러리 없음) + 월별 count table + 최근 증가 후보',
        'Raw Data: 최대 50건 × 최대 8 컬럼 preview, 미기재 row 는 후보 배지 표시',
        '코드검증 탭: 사용자용 "코드 매핑 필요" 문구로 표시 (schema / field mapping 같은 개발 용어 사용 X)',
        '조치우선순위 탭: 자동 우선순위 X, 자동 CAPA/ECO 생성 X — "조치 검토 후보" 안내만, 반복·중요도·미기재 후보 표시'
      ],
      implementationCautions: [
        '데이터 source 우선순위: QISSUE_NORMALIZED_ROWS > QISSUE_ROWS > QDEFECT_ISSUES > QRAW_ROWS > QDEFECT_RAW_ROWS (read-only, mutation 없음)',
        '필드 감지 heuristic: 영문 키 (writer/machine/model/part/severity/date/monthKey/imageCount 등) + 한글 키 (호기/모델/파트/중요도/날짜/사진) 자동 매핑',
        '중요도 정규화: 치명/critical, 주요/major, 경미·개선/minor 매칭. 그 외는 unknown',
        '월별 키 추출: monthKey 우선, 없으면 dateKey 에서 YYYY-MM 패턴 추출',
        'page-quality-analysis 진입 시 자동 렌더: (1) renderQAnalysisPage 가 우리 shim 으로 교체되어 호출 시 qCleanRenderShell 실행, (2) odiNavAfterRenderDispatcher 가 wrap 되어 quality-analysis route 진입 시 추가 보장',
        'legacy renderQAnalysisPage / switchQAnalysis 는 __qCleanLegacyBackup 에 백업 후 no-op shim 으로 교체 — 기존 함수가 qanalysis-empty/content 를 찾으려다 실패하는 동작 차단',
        'MutationObserver 가 #page-quality-analysis 내부에 q-flow-trace-analysis / qanalysis-* / qd-machine-modal 가 재주입되면 즉시 제거',
        'CSS 안전망: 같은 selector 들에 `display:none !important` — observer 가 놓쳐도 사용자 화면에 보이지 않음',
        '키워드 검색 200ms debounce, 입력 중 과도한 재렌더 방지',
        'page-quality-analysis 외부 / topbar / sidebar / 다른 page / 업로드 flow / WORK_DATA 무관'
      ],
      pendingDecisions: [
        '확정 위험 점수 / 확정 조치 우선순위 / 자동 품질 점수 / 합격·불합격 산정 기준 — 운영 검토 후 적용 (현재 모두 0)',
        '반복 후보 임계값 (count ≥ 2) 의 운영 적정성 검토 — 데이터 규모에 따라 3 이상이 적정할 수 있음',
        'Raw Data cap (50 row × 8 col) — 대규모 데이터에서 페이지네이션 필요 여부',
        'Top N (10) limit — 모델·코드 master 확장 시 limit 상향 결정',
        '코드 매칭 기준정보(분류코드 마스터) 와의 정합성 검증 로직 — 별도 구현 예정',
        '생산일정 연계: WORK_DATA 호기/모델 키 매핑 시점 — 후속 작업 결정',
        '사용자 권한별 화면 분리 (작성자 본인 row 만 보이도록 필터링 등) — 권한 시스템 도입 시 적용'
      ]
    }
  };

  /* --------------------------------------------------------------------------
   * 16. smoke check
   * -------------------------------------------------------------------------- */
  window.runOdiQualityAnalysisCleanRebuildCheck = function(){
    var page = document.getElementById('page-quality-analysis');
    var rootEl = page ? page.querySelector('[data-qclean="root"]') : null;
    var rootText = rootEl ? (rootEl.innerText || rootEl.textContent || '') : '';
    var forbiddenList = [
      'STEP01','STEP02','STEP03','STEP04','STEP05','STEP06','STEP07','STEP08','STEP09',
      'preview','preview-only','schema','blueprint','confirmation','Risk Rule','Shell',
      'smoke check','계산 예정','버튼은 비동작','최종 산식 아님'
    ];
    var found = forbiddenList.filter(function(s){ return rootText.indexOf(s) >= 0; });

    var result = {
      version: window.APP_VERSION || 'unknown',
      pageQualityAnalysisExists: !!page,
      qCleanRootExists:          !!rootEl,
      qCleanTabsCount:           page ? page.querySelectorAll('[data-qclean="tabs"] > button').length : 0,
      legacyStructureGone: {
        qFlowTraceAnalysis:   !page || !page.querySelector('#q-flow-trace-analysis'),
        qanalysisTabbar:      !page || !page.querySelector('#qanalysis-tabbar'),
        qanalysisEmpty:       !page || !page.querySelector('#qanalysis-empty'),
        qanalysisContent:     !page || !page.querySelector('#qanalysis-content'),
        qdMachineModal:       !page || !page.querySelector('#qd-machine-modal')
      },
      userFacingForbiddenText: found,
      hasAudit:                !!window.ODI_QUALITY_ANALYSIS_CLEAN_REBUILD_AUDIT,
      callables: {
        getRows:        typeof window.qCleanGetRows === 'function',
        detectFieldMap: typeof window.qCleanDetectFieldMap === 'function',
        normSev:        typeof window.qCleanNormSev === 'function',
        buildSummary:   typeof window.qCleanBuildSummary === 'function',
        buildTopCounts: typeof window.qCleanBuildTopCounts === 'function',
        renderSide:     typeof window.qCleanRenderSide === 'function',
        renderTab:      typeof window.qCleanRenderTab === 'function',
        switchTab:      typeof window.qCleanSwitchTab === 'function',
        applyFilters:   typeof window.qCleanApplyFilters === 'function',
        resetFilters:   typeof window.qCleanResetFilters === 'function',
        renderShell:    typeof window.qCleanRenderShell === 'function',
        init:           typeof window.qCleanInit === 'function'
      },
      preserved: {
        'page-schedule':         !!document.getElementById('page-schedule'),
        'page-quality-dash':     !!document.getElementById('page-quality-dash'),
        'page-quality-main':     !!document.getElementById('page-quality-main'),
        'page-quality-action':   !!document.getElementById('page-quality-action'),
        'page-quality-images':   !!document.getElementById('page-quality-images'),
        'page-quality-master':   !!document.getElementById('page-quality-master'),
        'page-prod-overview':    !!document.getElementById('page-prod-overview'),
        'page-prod-headcount':   !!document.getElementById('page-prod-headcount'),
        'page-prod-process':     !!document.getElementById('page-prod-process'),
        'odiNavAfterRenderDispatcher': typeof window.odiNavAfterRenderDispatcher === 'function',
        'nav':                   typeof window.nav === 'function',
        'PM':                    typeof window.PM !== 'undefined'
      },
      legacyOverridden: {
        renderQAnalysisPage:  !!(window.renderQAnalysisPage && window.renderQAnalysisPage.__qClean),
        switchQAnalysis:      !!(window.switchQAnalysis && window.switchQAnalysis.__qClean)
      },
      dispatcherWrapped:        !!(window.odiNavAfterRenderDispatcher && window.odiNavAfterRenderDispatcher.__qCleanWrapped),
      mutationObserverActive:   !!window.__qCleanStripObserver,
      pageCount:                document.querySelectorAll('.page').length,
      nestedPageCount:          document.querySelectorAll('.page .page').length,
      styleBlockCount:          document.querySelectorAll('style').length,
      scriptBlockCount:         document.querySelectorAll('script').length,
      duplicateIds:             [],
      pmTargetMissing:          [],
      externalCdnAdded:         !!document.querySelector('script[src*="cdn.jsdelivr"] , script[src*="chart.js"] , link[href*="fonts.googleapis"]'),
      allDataImported:          typeof window['ALL' + '_DATA'] !== 'undefined',
      errors:                   []
    };
    /* exclude pre-existing XLSX CDN — only flag CDN that wasn't in 08J */
    try {
      var cdnScripts = document.querySelectorAll('script[src*="cdn.jsdelivr"]');
      var nonXlsxCdn = false;
      for(var i=0;i<cdnScripts.length;i++){
        var src = cdnScripts[i].getAttribute('src') || '';
        if(!/xlsx/i.test(src)){ nonXlsxCdn = true; break; }
      }
      result.externalCdnAdded = nonXlsxCdn || !!document.querySelector('script[src*="chart.js"], link[href*="fonts.googleapis"]');
    } catch(_e){}

    try {
      var seen = {};
      document.querySelectorAll('[id]').forEach(function(el){
        if(!el.id) return;
        seen[el.id] = (seen[el.id] || 0) + 1;
      });
      Object.keys(seen).forEach(function(id){
        if(seen[id] > 1) result.duplicateIds.push({id:id, count:seen[id]});
      });
    } catch(e){ result.errors.push('duplicate id scan failed: ' + (e.message || e)); }

    try {
      if(typeof window.PM !== 'undefined' && window.PM){
        Object.keys(window.PM).forEach(function(k){
          var id = window.PM[k];
          if(id && !document.getElementById(id)) result.pmTargetMissing.push({key:k, pageId:id});
        });
      }
    } catch(e){ result.errors.push('PM target scan failed: ' + (e.message || e)); }

    result.userFacingClean = result.userFacingForbiddenText.length === 0;
    result.legacyFullyRemoved = Object.keys(result.legacyStructureGone).every(function(k){ return result.legacyStructureGone[k]; });

    try { console.log('[' + VERSION + '] clean-rebuild check', result); } catch(_e){}
    return result;
  };

  /* --------------------------------------------------------------------------
   * boot
   * -------------------------------------------------------------------------- */
  function qCleanBoot(){
    try { window.qCleanInit(); } catch(_e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(qCleanBoot, 800); });
  } else {
    setTimeout(qCleanBoot, 800);
  }
})();
