/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 24 id=v080-gantt-final-script :: OPT01 no semantic edits */

(function(){
  function cleanText(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function rawMachineFromLabel(lbl){
    var txt=cleanText(lbl);if(!txt)return '';
    try{var row=(WORK_DATA||[]).find(function(r){return cleanText(machineLbl(r.machine))===txt||cleanText(r.machine)===txt;});if(row)return row.machine;}catch(_e){}
    return txt.replace(/호기$/,'').trim();
  }
  function rawProcessFromLabel(lbl){
    var txt=cleanText(lbl);if(!txt)return '';
    try{var item=(schemaGanttItems&&schemaGanttItems()||[]).find(function(i){return cleanText(i.label)===txt||cleanText(i.field)===txt;});if(item)return item.field;}catch(_e){}
    return txt;
  }
  window.applyGanttBodyFilter=function(kind,val){
    val=cleanText(val);if(!val)return;
    if(kind==='type'){gvTypeFilt=val;var st=document.getElementById('gv-type');if(st)st.value=val;}
    else if(kind==='batch'){val=val.replace(/차$/,'').trim();gvBatchFilt=val;var ba=document.getElementById('gv-batch');if(ba)ba.value=val;}
    else if(kind==='machine'){val=rawMachineFromLabel(val);gvMachineFilt=val;var mc=document.getElementById('gv-machine');if(mc)mc.value=val;}
    else if(kind==='model'){gvModelFilt=val;var mo=document.getElementById('gv-model');if(mo)mo.value=val;}
    else if(kind==='item'){val=rawProcessFromLabel(val);gItemFilt=(gItemFilt===val)?'':val;if(typeof renderGantt==='function')renderGantt();return;}
    if(typeof selMode!=='undefined'&&selMode){var map={type:'type',batch:'batch',machine:'machine',model:'model'};var k=map[kind];if(k&&msSel&&msSel[k]){msSel[k].clear();msSel[k].add(val);if(typeof buildMsFilters==='function')buildMsFilters();}}
    else if(typeof viewCrossFilter==='function'){viewCrossFilter();}
    if(typeof renderCurrentView==='function')renderCurrentView();
  };
  function bindGanttAutoFilter(){
    var tbl=document.getElementById('ganttTable');if(!tbl)return;
    tbl.querySelectorAll('tbody td.sched-cell-status').forEach(function(td){td.onclick=function(ev){ev.stopPropagation();applyGanttBodyFilter('type',td.textContent);};});
    tbl.querySelectorAll('tbody td.sched-cell-batch').forEach(function(td){td.onclick=function(ev){ev.stopPropagation();applyGanttBodyFilter('batch',td.textContent);};});
    tbl.querySelectorAll('tbody td.sched-cell-machine').forEach(function(td){td.onclick=function(ev){ev.stopPropagation();applyGanttBodyFilter('machine',td.textContent);};});
    tbl.querySelectorAll('tbody td.sched-cell-model').forEach(function(td){td.onclick=function(ev){ev.stopPropagation();applyGanttBodyFilter('model',td.textContent);};});
    tbl.querySelectorAll('tbody td.sched-cell-process').forEach(function(td){td.onclick=function(ev){ev.stopPropagation();applyGanttBodyFilter('item',td.textContent);};});
  }
  window.bindGanttAutoFilter=bindGanttAutoFilter;
  function patchRender(){
    var r=window.renderGantt;if(!r||r._v080Patched)return;
    var wrapped=function(){var out=r.apply(this,arguments);requestAnimationFrame(function(){bindGanttAutoFilter();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();});return out;};
    wrapped._v080Patched=true;window.renderGantt=wrapped;
  }
  patchRender();setTimeout(function(){patchRender();bindGanttAutoFilter();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},500);
})();
