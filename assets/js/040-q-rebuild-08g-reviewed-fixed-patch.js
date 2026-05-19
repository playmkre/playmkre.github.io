/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 40 id=q-rebuild-08g-reviewed-fixed-patch :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION='Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN';
  try{ window.APP_VERSION=VERSION; }catch(e){}
  function _el(id){return document.getElementById(id);} 
  function _txt(id,v){var e=_el(id); if(e) e.textContent=v;}
  function _safeArr(v){return Array.isArray(v)?v:[];}
  function _esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function _rowLabel(r){
    if(!r) return '-';
    var m=r.machine||r.machineNo||r.호기||r.MACHINE||'-';
    var model=r.model||r.MODEL||r.모델||r.modelName||'-';
    var batch=r.batch||r.차수||r.lot||r.LOT||'';
    return (m!=='-'?'호기 '+m:'호기 미기재')+' / '+model+(batch?' / '+batch:'');
  }
  function _dateNowLabel(){
    try{return new Date().toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}catch(e){return '현재 세션';}
  }
  function _detectType(x){
    var raw=String((x&&x.type)||(x&&x.kind)||(x&&x.action)||(x&&x.field)||'').toLowerCase();
    var msg=String((x&&x.message)||(x&&x.note)||(x&&x.reason)||'').toLowerCase();
    var all=raw+' '+msg;
    if(/date|날짜|일정/.test(all)) return 'date';
    if(/status|상태|진행|완료|출고/.test(all)) return 'status';
    if(/delay|지연|경고|warning|warn/.test(all)) return 'delay';
    if(/upload|업로드|file|파일/.test(all)) return 'upload';
    return 'manual';
  }
  function _typeLabel(t){return {date:'날짜 변경',status:'상태 변경',delay:'지연/경고',upload:'파일 업로드',manual:'수동 보정'}[t]||'수동 보정';}
  function _normalizeEvent(x, fallbackIndex){
    var t=_detectType(x||{});
    var target=(x&&x.target)||(x&&x.rowLabel)||(x&&x.label)||(x&&x.title)||_rowLabel(x&&x.row);
    var before=(x&&x.before)||(x&&x.oldValue)||(x&&x.from)||(x&&x.prev)||'-';
    var after=(x&&x.after)||(x&&x.newValue)||(x&&x.to)||(x&&x.next)||((x&&x.message)||(x&&x.note)||'-');
    var time=(x&&x.time)||(x&&x.ts)||(x&&x.createdAt)||(x&&x.updatedAt)||_dateNowLabel();
    var impact=(x&&x.impact)||(x&&x.reason)||(t==='delay'?'검증 또는 지연 확인 필요':(t==='upload'?'업로드 이후 데이터 재확인 필요':'업무 영향 확인 필요'));
    return {type:t,target:target,before:before,after:after,time:time,impact:impact,idx:fallbackIndex||0};
  }
  function _collectChangeEvents(){
    var events=[];
    ['SCHEDULE_CHANGE_LOG','SCHED_CHANGE_LOG','SCHEDULE_AUDIT_LOG','CHANGE_LOG','PENDING_CHANGES'].forEach(function(k){
      try{ var a=window[k]; if(Array.isArray(a)) a.forEach(function(x){events.push(_normalizeEvent(x, events.length));}); }catch(e){}
    });
    try{
      _safeArr(window.WORK_DATA).forEach(function(r,i){
        var hist=[];
        if(Array.isArray(r&&r._history)) hist=r._history;
        hist.forEach(function(h){ events.push(_normalizeEvent(Object.assign({row:r},h), events.length)); });
        if(r&&(r._dirty||r._changed)) events.push(_normalizeEvent({type:'manual',row:r,before:'원본',after:'수동 수정 감지',impact:'현재 세션 내 수정 표시'}, events.length));
      });
    }catch(e){}
    return events;
  }
  function _scheduleRows(){return _safeArr(window.WORK_DATA);} 
  function _isSundayYmd(ds){
    var m=String(ds||'').match(/^(\d{4})-(\d{2})-(\d{2})/); if(!m) return false;
    return new Date(Date.UTC(+m[1],+m[2]-1,+m[3])).getUTCDay()===0;
  }
  window._slogRender=function(){
    try{
      var rows=_scheduleRows();
      var events=_collectChangeEvents();
      var delay=0, validWarn=0, sunday=0;
      rows.forEach(function(r){
        try{ if(typeof window.hasScheduleDelay==='function' && window.hasScheduleDelay(r)) delay++; }catch(e){}
        try{ if(typeof window.validateRow==='function' && _safeArr(window.validateRow(r)).length>0) validWarn++; }catch(e){}
        try{ var info=typeof window.getRowStageInfo==='function'?window.getRowStageInfo(r):null; if(info&&_isSundayYmd(info.date)) sunday++; }catch(e){}
      });
      _txt('slog-total',rows.length||0); _txt('slog-delay',delay||0); _txt('slog-valid-warn',validWarn||0); _txt('slog-sunday',sunday||0);
      var c={date:0,status:0,delay:0,upload:0,manual:0}; events.forEach(function(ev){c[ev.type]=(c[ev.type]||0)+1;});
      _txt('slog-c-date',c.date||0); _txt('slog-c-status',c.status||0); _txt('slog-c-delay',c.delay||0); _txt('slog-c-upload',c.upload||0); _txt('slog-c-manual',c.manual||0);
      var badge=_el('slog-status-badge'); if(badge){badge.textContent=events.length?'세션 이력 '+events.length+'건':'세션 이력 소스 없음'; badge.style.color=events.length?'var(--ac)':'var(--tm)';}
      _txt('slog-last-time',events.length?('마지막 확인: '+_dateNowLabel()):'');
      var type=(_el('slog-filter-type')||{}).value||'all';
      var list=events.filter(function(e){return type==='all'||e.type===type;}).slice(-80).reverse();
      var tl=_el('slog-timeline');
      if(tl){
        if(!list.length){
          tl.innerHTML='<div class="sg-event-empty">현재 세션에서 기록된 변경 이력이 없습니다.<br>일정 날짜·상태·지연 사유를 수정하면 이 영역에 변경 전/후 비교가 표시됩니다.<br><span style="color:var(--am)">서버 감사 로그가 아니라 브라우저 세션 기준 화면입니다.</span></div>';
        }else{
          tl.innerHTML=list.map(function(ev){return '<div class="sg-event-card"><div class="sg-event-time">'+_esc(ev.time)+'</div><div class="sg-event-main"><div class="sg-event-type">'+_esc(_typeLabel(ev.type))+'</div><div class="sg-event-target">'+_esc(ev.target)+'</div><div class="sg-event-diff"><span>전: '+_esc(ev.before)+'</span><span>후: '+_esc(ev.after)+'</span></div><div class="sg-event-impact">영향: '+_esc(ev.impact)+'</div></div></div>';}).join('');
        }
      }
    }catch(err){ console.warn('[08G reviewed] _slogRender failed',err); }
  };
  window.odi08gReviewedSmoke=function(){
    var routes=['schedule-log','schedule-model','schedule-period'];
    return routes.map(function(r){return {route:r,page:!!document.getElementById('page-'+r),nav:typeof window.nav==='function'};});
  };
  function _refresh(){ try{window._slogRender();}catch(e){} try{ if(typeof window._smBuild==='function') window._smBuild(); }catch(e){} try{ if(typeof window._spBuild==='function') window._spBuild(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(_refresh,350);}); else setTimeout(_refresh,350);
  try{
    var oldNav=window.nav;
    if(typeof oldNav==='function' && !oldNav.__odi08gReviewedWrapped){
      // [STEP02] nav-wrap neutralized; schedule-log/model/period refresh merged into odiNavAfterRenderDispatcher
      try { oldNav.__odi08gReviewedWrapped=true; } catch(_e){}
    }
  }catch(e){}
})();
