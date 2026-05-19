/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 30 id=v086-refresh-filter-empty-script :: OPT01 no semantic edits */

(function(){
  const STATUS_BASE_VALUES=['계획','대기','진행','출고','완료'];
  window.SCHEDULE_STATUS_BASE_VALUES=STATUS_BASE_VALUES.slice();
  window.SCHEDULE_STATUS_RULES={
    '계획':'부자재 입고 전',
    '대기':'부자재 입고 후, 작업 시작 전',
    '진행':'전장/기구/배선 또는 TEST/세팅 또는 적층 등 작업 시작 후',
    '출고':'출고일 있음, 해체일 없음',
    '완료':'해체일 있음'
  };
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function setVal(id,val){const el=document.getElementById(id);if(el)el.value=val||'';}
  function clearSet(s){try{if(s&&s.clear)s.clear();}catch(e){}}
  function clearMultiAndSummary(){
    try{
      if(typeof msSel!=='undefined')Object.values(msSel).forEach(clearSet);
      if(typeof selMode!=='undefined')selMode=false;
      const selChip=document.getElementById('selChip');
      if(selChip)selChip.classList.remove('on');
    }catch(e){}
    try{
      if(typeof summaryMode!=='undefined')summaryMode=false;
      const summaryChip=document.getElementById('summaryChip');
      if(summaryChip)summaryChip.classList.remove('on');
    }catch(e){}
    try{document.querySelectorAll('#page-schedule .ms-panel.open').forEach(p=>p.classList.remove('open'));}catch(e){}
  }
  function resetViewFilters(){
    clearMultiAndSummary();
    try{gvEquipFilt='';gvTypeFilt='';gvModelFilt='';gvBatchFilt='';gvMachineFilt='';}catch(e){}
    try{gTypeFilt='';gBatchFilt='';gMachineFilt='';gModelFilt='';gItemFilt='';activeBatch=null;batchModelFilt='';}catch(e){}
    ['gv-equip','gv-type','gv-model','gv-batch','gv-machine'].forEach(id=>setVal(id,''));
    try{if(typeof viewCrossFilter==='function')viewCrossFilter();}catch(e){}
    ['gv-equip','gv-type','gv-model','gv-batch','gv-machine'].forEach(id=>setVal(id,''));
    try{if(typeof buildMsFilters==='function')buildMsFilters();}catch(e){}
  }
  function syncNavToToday(){
    const t=new Date();
    try{curNavYear=t.getFullYear();curNavMonth=t.getMonth()+1;}catch(e){}
    const yl=document.getElementById('gnav-year-lbl');if(yl)yl.textContent=String(t.getFullYear());
    const ms=document.getElementById('gnav-month-sel');if(ms)ms.value=String(t.getMonth()+1);
  }
  function scrollGanttToday(){
    setTimeout(function(){
      try{
        const t=new Date().toISOString().slice(0,10);
        const range=window.cachedRange||((typeof getActiveGanttRange==='function')?getActiveGanttRange():null);
        const outer=document.getElementById('ganttOuter');
        if(!range||!outer||typeof schedDateToX!=='function')return;
        const x=schedDateToX(t,range.start);
        if(x>=0){const vw=outer.clientWidth||0;outer.scrollTo({left:Math.max(0,x-(vw-294)/2),behavior:'auto'});}
      }catch(e){}
    },80);
  }
  function isRefreshAllowed(){return typeof curView!=='undefined' && (curView==='calendar'||curView==='gantt');}
  function updateButtons(){
    const refresh=document.getElementById('schedDetailRefreshBtn');
    if(refresh)refresh.disabled=!isRefreshAllowed();
    const today=document.getElementById('todayBtn');
    if(today)today.disabled=!(typeof curView!=='undefined'&&curView==='gantt');
  }
  window.updateScheduleRefreshStateV086=updateButtons;
  function currentFilteredRowsForGantt(){
    try{
      let rows=(WORK_DATA||[]).filter(r=>typeof passGvFilter==='function'?passGvFilter(r):true);
      if(typeof gModelFilt!=='undefined'&&gModelFilt)rows=rows.filter(r=>r.model===gModelFilt);
      if(typeof gMachineFilt!=='undefined'&&gMachineFilt)rows=rows.filter(r=>r.machine===gMachineFilt);
      return rows;
    }catch(e){return [];}
  }
  function hasReadyData(){try{return typeof hasScheduleDataReady==='function'?hasScheduleDataReady():!!((WORK_DATA||[]).length);}catch(e){return false;}}
  function repairEmptyGanttState(){
    if(!(typeof curView!=='undefined'&&curView==='gantt'))return;
    const tbl=document.getElementById('ganttTable');
    const empty=document.getElementById('ganttEmpty');
    if(!tbl||!empty||!hasReadyData())return;
    const rows=currentFilteredRowsForGantt();
    if(rows.length===0){
      tbl.style.display='none';
      empty.classList.add('v086-empty-state');
      empty.innerHTML='<div><div style="font-size:30px;margin-bottom:8px">🔎</div><b>필터에 맞는 생산일정 데이터가 없습니다.</b><br><span style="font-size:11px;color:var(--ts)">새로고침을 누르면 필터/멀티선택/요약을 초기화하고 오늘 기준으로 돌아갑니다.</span></div>';
      empty.style.display='flex';
    }else{
      empty.classList.remove('v086-empty-state');
    }
  }
  window.repairGanttEmptyStateV086=repairEmptyGanttState;
  window.refreshScheduleDetailTable=function(){
    if(!isRefreshAllowed()){updateButtons();return;}
    resetViewFilters();
    syncNavToToday();
    try{
      if(curView==='calendar'&&typeof renderCalendar==='function')renderCalendar();
      else if(curView==='gantt'&&typeof renderGantt==='function'){renderGantt();scrollGanttToday();}
      else if(typeof renderCurrentView==='function')renderCurrentView();
    }catch(e){try{if(typeof renderCurrentView==='function')renderCurrentView();}catch(_e){}}
    setTimeout(function(){
      try{if(typeof repairGanttModelCells==='function')repairGanttModelCells();}catch(e){}
      try{if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();}catch(e){}
      repairEmptyGanttState();
      updateButtons();
    },120);
  };
  const oldSwitch=window.schedSwitchView;
  if(oldSwitch&&!oldSwitch._v086Wrapped){
    const wrapped=function(view){const out=oldSwitch.apply(this,arguments);setTimeout(function(){updateButtons();repairEmptyGanttState();},0);return out;};
    wrapped._v086Wrapped=true;window.schedSwitchView=wrapped;
  }
  const oldRender=window.renderGantt;
  if(oldRender&&!oldRender._v086EmptyWrapped){
    const wrapped=function(){const out=oldRender.apply(this,arguments);requestAnimationFrame(repairEmptyGanttState);setTimeout(repairEmptyGanttState,80);return out;};
    wrapped._v086EmptyWrapped=true;window.renderGantt=wrapped;
  }
  const oldFilter=window.onGvFilter;
  if(oldFilter&&!oldFilter._v086Wrapped){
    const wrapped=function(){const out=oldFilter.apply(this,arguments);setTimeout(function(){repairEmptyGanttState();updateButtons();},0);return out;};
    wrapped._v086Wrapped=true;window.onGvFilter=wrapped;
  }
  function init(){updateButtons();repairEmptyGanttState();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,300);setTimeout(init,1200);
})();
