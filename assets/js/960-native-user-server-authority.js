(function(){
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var STATE = {
    lastScheduleFile: null,
    lastQualityFile: null,
    health: null,
    scheduleRows: [],
    qualityRows: [],
    loading: false,
    hooked: false,
    appliedAt: null
  };
  window.TechSysLabUserServerAuthority = STATE;

  function log(){ try{ console.log.apply(console, ['[server-authority]'].concat([].slice.call(arguments))); }catch(_){} }
  function warn(){ try{ console.warn.apply(console, ['[server-authority]'].concat([].slice.call(arguments))); }catch(_){} }
  function nrm(v){ return String(v == null ? '' : v).replace(/[^a-z0-9가-힣]+/gi,'').toLowerCase(); }
  function ge(code){ return (0, eval)(code); }
  function gtry(code){ try{ return ge(code); }catch(e){ return undefined; } }

  function fetchJson(path, opt){
    return fetch(API_BASE + path, Object.assign({ credentials:'omit', cache:'no-store' }, opt || {})).then(function(r){
      if(!r.ok){ return r.text().then(function(t){ throw new Error(path+' HTTP '+r.status+' '+String(t).slice(0,240)); }); }
      return r.json();
    });
  }

  function pick(obj, keys){
    obj = obj || {};
    var map = {};
    Object.keys(obj).forEach(function(k){ map[nrm(k)] = obj[k]; });
    for(var i=0;i<keys.length;i++){
      var nk = nrm(keys[i]);
      if(Object.prototype.hasOwnProperty.call(map,nk) && map[nk] !== '' && map[nk] != null) return String(map[nk]);
    }
    for(var k in obj){
      var kk=nrm(k);
      for(var j=0;j<keys.length;j++){
        var want=nrm(keys[j]);
        if(want && kk.indexOf(want) >= 0 && obj[k] !== '' && obj[k] != null) return String(obj[k]);
      }
    }
    return '';
  }

  function rawOf(serverRow){ return serverRow && serverRow.raw && typeof serverRow.raw === 'object' ? serverRow.raw : {}; }
  function dateOnly(v){ return v ? String(v).slice(0,10) : ''; }

  function toScheduleRow(serverRow, idx){
    var raw = rawOf(serverRow);
    var row = {
      id: 910000 + idx,
      batch: pick(raw, ['차수','batch','구분','No','NO','번호','수주번호','오더']) || serverRow.order_no || String(idx+1),
      model: pick(raw, ['모델','모델명','품명','제품명','장비명','item_name']) || serverRow.item_name || '',
      machine: pick(raw, ['호기','장비','설비','라인','line_name','machine']) || serverRow.line_name || '',
      note: pick(raw, ['비고','메모','기타','note']) || '',
      type: pick(raw, ['상태','진행상태']) || serverRow.status || '대기',
      _valid: true,
      _errs: []
    };
    var plan = serverRow.plan_date || pick(raw, ['계획일','생산일','일자','날짜','납기','출고','출하','해체']);
    if(plan){ row.chulgo = dateOnly(plan); row.planDate = dateOnly(plan); }

    // Hard-coded native schedule field aliases.  This avoids relying on window.ACTIVE_SCHEMA,
    // because ACTIVE_SCHEMA is a top-level let in the original portal and is not a window property.
    row.jaje           = dateOnly(pick(raw, ['부자재','부자재 입고','부 자재','부자재입고','자재입고']));
    row.ybase          = dateOnly(pick(raw, ['YBASE','Y BASE','XYBASE','와이베이스']));
    row.pod3           = dateOnly(pick(raw, ['3POD','3 POD','쓰리팟']));
    row.wvpz           = dateOnly(pick(raw, ['WV/PZ','WVPZ','WV PZ']));
    row.elmo           = dateOnly(pick(raw, ['엘모','ELMO']));
    row.jungjiangStart = dateOnly(pick(raw, ['전장/기구/배선 시작','전장기구배선시작','생산 시작','생산시작','전장 시작','기구 시작','배선 시작']));
    row.jungjiangEnd   = dateOnly(pick(raw, ['전장/기구/배선 종료','전장기구배선종료','생산 종료','생산종료','전장 종료','기구 종료','배선 종료']));
    row.testStart      = dateOnly(pick(raw, ['TEST 시작','TEST시작','테스트 시작','세팅 시작','SETTING 시작']));
    row.testEnd        = dateOnly(pick(raw, ['TEST 종료','TEST종료','테스트 종료','세팅 종료','SETTING 종료']));
    row.jeokjeungStart = dateOnly(pick(raw, ['적층 시작','적층시작']));
    row.jeokjeungEnd   = dateOnly(pick(raw, ['적층 종료','적층종료']));
    row.chulgo         = row.chulgo || dateOnly(pick(raw, ['출고','출하','출고일','출하일','shipping']));
    row.haeje          = dateOnly(pick(raw, ['해체','해체일','분해','disassembly']));
    return row;
  }

  function toQualityRow(serverRow, idx){
    var raw = rawOf(serverRow);
    var date = dateOnly(pick(raw, ['날짜','일자','발생일','접수일','date']));
    var severity = serverRow.severity || pick(raw, ['중요도','심각도','등급','severity']) || '일반';
    var content = serverRow.defect_type || pick(raw, ['내용','불량내용','현상','이슈내용','사유','불량','defect_type']) || '원본내용확인필요';
    return {
      id: 'server_Q_' + (serverRow.id || idx),
      sourceSheet: 'server-db',
      sourceRow: Number(serverRow.row_index || idx+1),
      monthKey: date ? date.slice(0,7) : 'server',
      no: serverRow.issue_no || pick(raw,['No','NO','번호','구분','이슈번호','불량번호']) || String(idx+1),
      date: date,
      writer: pick(raw,['작성자','writer','담당자']) || '',
      dept: pick(raw,['부서','dept','팀']) || '',
      model: pick(raw,['종류','모델','모델명','장비','품명']) || serverRow.item_name || '',
      machine: pick(raw,['호기','설비','machine','장비번호']) || '',
      cell: pick(raw,['CELL','cell','셀']) || '',
      severity: severity,
      content: content,
      part: pick(raw,['파트','part','품명','부품']) || serverRow.item_name || '',
      majorCategory: pick(raw,['대분류','major']) || '',
      middleCategory: pick(raw,['중분류','middle']) || '',
      smallCategory: pick(raw,['소분류','small']) || '',
      etc: pick(raw,['기타','비고','etc']) || '',
      imageCount: 0,
      images: [],
      parseStatus: 'ok',
      parseWarnings: [],
      isCritical: severity === '치명',
      modelMachineKey: '',
      categoryPath: ''
    };
  }

  function applyScheduleToNative(serverRows){
    var rows = (serverRows || []).slice().reverse().map(toScheduleRow);
    STATE.scheduleRows = rows;
    window.__TSL_SCHEDULE_AUTH_ROWS = rows;

    // Root cause fix: original schedule variables are top-level `let`, so `window.YANGSAN_DATA = ...`
    // does not affect the real portal.  This indirect eval writes to the original lexical bindings.
    gtry('YANGSAN_DATA = window.__TSL_SCHEDULE_AUTH_ROWS;');
    gtry('YEONJU_DATA = [];');
    gtry('PENDING_YANGSAN = null; PENDING_YEONJU = null;');
    gtry('WORK_DATA = YANGSAN_DATA.slice();');
    gtry('YANGSAN_IDS = new Set(YANGSAN_DATA.map(function(r){return r.id;})); YEONJU_IDS = new Set();');
    gtry('SCHEDULE_DATA_READY = YANGSAN_DATA.length > 0; SCHEDULE_LAST_SAVED_AT = new Date().toISOString();');
    gtry('lastSavedYangsan = JSON.parse(JSON.stringify(YANGSAN_DATA)); lastSavedYeonju = []; undoStack = []; redoStack = []; isDirty = false;');
    gtry('syncWorkData();');
    gtry('commitSavedSnapshot();');
    gtry('populateEditFilters();');
    gtry('renderEditTable();');
    gtry('populateGvFilters();');
    gtry('renderCurrentView();');
    gtry('renderDashboardKPI();');
    gtry('renderDashboardSummaryNotes();');
    gtry('_updateSchedStatusPanel();');
    gtry('updateCards();');
    gtry('renderUserProdOverviewPage();');
    gtry('renderUserProdHeadcountPage();');
    gtry('renderUserProdProcessPage();');
    // Re-render active schedule page after the original nav/scheduleInit has had a chance to clear memory.
    setTimeout(function(){
      gtry('syncWorkData(); renderEditTable(); renderCurrentView(); renderDashboardKPI(); renderDashboardSummaryNotes(); _updateSchedStatusPanel(); updateCards();');
    }, 300);
  }

  function applyQualityToNative(serverRows){
    var rows = (serverRows || []).slice().reverse().map(toQualityRow);
    STATE.qualityRows = rows;
    window.__TSL_QUALITY_AUTH_ROWS = rows;
    gtry('QDEFECT_RAW_ROWS = window.__TSL_QUALITY_AUTH_ROWS;');
    gtry('QDEFECT_WORKBOOK_READY = QDEFECT_RAW_ROWS.length > 0;');
    gtry('QDEFECT_FILE = {name:"server-db-quality.xlsx", size:0};');
    gtry('QDEFECT_ANALYTICS = (typeof buildQDefectAnalytics === "function") ? buildQDefectAnalytics(QDEFECT_RAW_ROWS) : QDEFECT_ANALYTICS;');
    gtry('refreshQDefectAllPages();');
    gtry('renderQDashPage();');
    gtry('renderQMainPage();');
    gtry('renderQAnalysisPage();');
    gtry('renderQActionPage();');
    gtry('renderQImagesPage();');
    gtry('renderQMasterPage();');
  }

  function loadServerData(reason){
    if(STATE.loading) return Promise.resolve();
    STATE.loading = true;
    return Promise.all([
      fetchJson('/api/health'),
      fetchJson('/api/schedule?limit=5000'),
      fetchJson('/api/quality/issues?limit=5000')
    ]).then(function(res){
      STATE.health = res[0];
      applyScheduleToNative(res[1] && res[1].rows ? res[1].rows : []);
      applyQualityToNative(res[2] && res[2].rows ? res[2].rows : []);
      STATE.appliedAt = new Date().toISOString();
      log('applied from server', reason || '', STATE.health && STATE.health.db);
    }).catch(function(e){
      warn('server load failed', reason || '', e && e.message ? e.message : e);
    }).finally(function(){ STATE.loading = false; });
  }

  function uploadFile(type, file){
    if(!file) return Promise.resolve(null);
    var endpoint = type === 'schedule' ? '/api/public/upload/schedule' : '/api/public/upload/quality';
    var fd = new FormData();
    fd.append('file', file, file.name || (type + '.xlsx'));
    fd.append('uploaded_by', 'user-portal-native');
    return fetch(API_BASE + endpoint, { method:'POST', body:fd, credentials:'omit', cache:'no-store' }).then(function(r){
      if(!r.ok) return r.text().then(function(t){ throw new Error(endpoint+' HTTP '+r.status+' '+String(t).slice(0,240)); });
      return r.json();
    }).then(function(data){
      if(typeof showToast === 'function') showToast((type==='schedule'?'생산일정':'품질/불량') + ' 서버 저장 완료', 'ok');
      return loadServerData('after-upload-'+type).then(function(){ return data; });
    }).catch(function(e){
      warn('upload failed', type, e && e.message ? e.message : e);
      if(typeof showErr === 'function') showErr((type==='schedule'?'생산일정':'품질/불량') + ' 서버 저장 실패: ' + (e.message || e));
      throw e;
    });
  }

  function hookNativeFunctions(){
    if(STATE.hooked) return;
    STATE.hooked = true;

    if(typeof window.handleUpload === 'function'){
      var origHandleUpload = window.handleUpload;
      window.handleUpload = function(input){
        try{ STATE.lastScheduleFile = input && input.files && input.files[0] ? input.files[0] : null; }catch(_){ STATE.lastScheduleFile = null; }
        return origHandleUpload.apply(this, arguments);
      };
    }

    if(typeof window.schedSaveData === 'function'){
      var origSchedSaveData = window.schedSaveData;
      window.schedSaveData = function(){
        var ret = origSchedSaveData.apply(this, arguments);
        if(STATE.lastScheduleFile){
          uploadFile('schedule', STATE.lastScheduleFile).finally(function(){ STATE.lastScheduleFile = null; });
        }else{
          setTimeout(function(){ loadServerData('schedule-save-no-file'); }, 500);
        }
        return ret;
      };
    }

    if(typeof window.handleQDefectUpload === 'function'){
      var origQUpload = window.handleQDefectUpload;
      window.handleQDefectUpload = function(file){
        STATE.lastQualityFile = file || null;
        var ret = origQUpload.apply(this, arguments);
        if(file){
          setTimeout(function(){ uploadFile('quality', file).finally(function(){ STATE.lastQualityFile = null; }); }, 700);
        }
        return ret;
      };
    }

    if(typeof window.nav === 'function'){
      var origNav = window.nav;
      window.nav = function(k){
        var ret = origNav.apply(this, arguments);
        setTimeout(function(){ loadServerData('nav-'+k); }, 450);
        setTimeout(function(){ loadServerData('nav-late-'+k); }, 1500);
        return ret;
      };
    }
  }

  function boot(){
    hookNativeFunctions();
    loadServerData('boot');
    setTimeout(function(){ hookNativeFunctions(); loadServerData('boot-1'); }, 900);
    setTimeout(function(){ loadServerData('boot-2'); }, 2400);
    setTimeout(function(){ loadServerData('boot-3'); }, 5000);
    window.addEventListener('focus', function(){ setTimeout(function(){ loadServerData('focus'); }, 200); });
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) setTimeout(function(){ loadServerData('visible'); }, 200); });
    document.addEventListener('tsl:gate-unlocked', function(){ setTimeout(function(){ loadServerData('gate-unlocked'); }, 200); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
