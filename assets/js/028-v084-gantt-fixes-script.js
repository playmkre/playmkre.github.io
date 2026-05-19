/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 28 id=v084-gantt-fixes-script :: OPT01 no semantic edits */

(function(){
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function statusVal(v){var t=clean(v);return ['계획','대기','진행','출고','완료'].find(function(s){return t.indexOf(s)>-1;})||t;}
  function batchVal(v){return clean(v).replace(/차$/,'').trim().replace(/^—$/,'');}
  function machineVal(v){var t=clean(v);try{var hit=(WORK_DATA||[]).find(function(r){return clean(machineLbl(r.machine))===t||clean(r.machine)===t||clean(r.machine)+'호기'===t;});if(hit)return hit.machine;}catch(e){}return t.replace(/호기$/,'').trim();}
  function modelVal(v){var t=clean(v);try{var models=Array.from(new Set((WORK_DATA||[]).map(function(r){return r.model;}).filter(Boolean))).sort(function(a,b){return String(b).length-String(a).length;});var hit=models.find(function(m){return t===String(m)||t.indexOf(String(m))>-1;});if(hit)return hit;}catch(e){}return t;}
  function setSelect(id,val){var el=document.getElementById(id);if(!el)return;val=String(val||'');if(val&&!Array.from(el.options).some(function(o){return o.value===val;})){var opt=document.createElement('option');opt.value=val;opt.textContent=(id==='gv-batch'?val+'차':(id==='gv-machine'&&typeof machineLbl==='function'?machineLbl(val):val));el.appendChild(opt);}el.value=val;}
  function clearMulti(){try{if(typeof msSel!=='undefined')Object.values(msSel).forEach(function(s){if(s&&s.clear)s.clear();});}catch(e){}try{if(typeof selMode!=='undefined'&&selMode){selMode=false;var chip=document.getElementById('selChip');if(chip)chip.classList.remove('on');if(typeof restoreSingleFilters==='function')restoreSingleFilters();}}catch(e){}}
  function setOnly(kind,val){
    val=clean(val);if(!val)return;
    if(kind==='type')val=statusVal(val); if(kind==='batch')val=batchVal(val); if(kind==='machine')val=machineVal(val); if(kind==='model')val=modelVal(val); if(!val)return;
    clearMulti();
    try{gvEquipFilt='';gvTypeFilt='';gvBatchFilt='';gvMachineFilt='';gvModelFilt='';gTypeFilt='';gBatchFilt='';gMachineFilt='';gModelFilt='';activeBatch=null;}catch(e){}
    if(kind==='type'){gvTypeFilt=val;gTypeFilt=val;} else if(kind==='batch'){gvBatchFilt=val;gBatchFilt=val;} else if(kind==='machine'){gvMachineFilt=val;gMachineFilt=val;} else if(kind==='model'){gvModelFilt=val;gModelFilt=val;}
    setSelect('gv-equip','');setSelect('gv-type',gvTypeFilt||'');setSelect('gv-batch',gvBatchFilt||'');setSelect('gv-machine',gvMachineFilt||'');setSelect('gv-model',gvModelFilt||'');
    try{if(typeof viewCrossFilter==='function')viewCrossFilter();}catch(e){}
    setSelect('gv-equip','');setSelect('gv-type',gvTypeFilt||'');setSelect('gv-batch',gvBatchFilt||'');setSelect('gv-machine',gvMachineFilt||'');setSelect('gv-model',gvModelFilt||'');
    if(typeof renderGantt==='function')renderGantt();
    setTimeout(function(){setSelect('gv-type',gvTypeFilt||'');setSelect('gv-batch',gvBatchFilt||'');setSelect('gv-machine',gvMachineFilt||'');setSelect('gv-model',gvModelFilt||'');repairGanttModelCells();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},60);
  }
  window.applyGanttBodyFilter=function(kind,val){setOnly(kind,val);};
  function getModelByMachine(machine){try{var row=(WORK_DATA||[]).find(function(r){return clean(r.machine)===clean(machine)||clean(machineLbl(r.machine))===clean(machine)||clean(r.machine)+'호기'===clean(machine);});return row&&row.model||'';}catch(e){return '';}}
  function badgeHtml(model){try{if(typeof mbadge==='function')return mbadge(model);}catch(e){}var u=String(model||'').toUpperCase();var cls=u.includes('HBM')?'b-hbm':(u.includes('OPERA')?'b-opera':'b-md');return '<span class="badge '+cls+'">'+String(model||'')+'</span>';}
  function repairGanttModelCells(){
    var tbl=document.getElementById('ganttTable');if(!tbl)return;
    tbl.querySelectorAll('tbody tr').forEach(function(tr){var mCell=tr.querySelector('td.sched-cell-model');if(!mCell)return;var txt=modelVal(mCell.textContent);if(!txt){var mach=tr.querySelector('td.sched-cell-machine');txt=getModelByMachine(mach?mach.textContent:'');}if(txt){mCell.dataset.filterKind='model';mCell.dataset.filterVal=txt;if(!clean(mCell.textContent)||clean(mCell.textContent)==='—')mCell.innerHTML=badgeHtml(txt);}mCell.style.setProperty('visibility','visible','important');mCell.style.setProperty('opacity','1','important');mCell.querySelectorAll('*').forEach(function(el){el.style.setProperty('visibility','visible','important');el.style.setProperty('opacity','1','important');});});
    tbl.querySelectorAll('tbody td.sched-cell-status').forEach(function(td){td.dataset.filterKind='type';td.dataset.filterVal=statusVal(td.textContent);});
    tbl.querySelectorAll('tbody td.sched-cell-batch').forEach(function(td){td.dataset.filterKind='batch';td.dataset.filterVal=batchVal(td.textContent);});
    tbl.querySelectorAll('tbody td.sched-cell-machine').forEach(function(td){td.dataset.filterKind='machine';td.dataset.filterVal=machineVal(td.textContent);});
  }
  window.repairGanttModelCells=repairGanttModelCells;
  function installFilterClicks(){
    if(window._v084GanttFilterBound)return;window._v084GanttFilterBound=true;
    var handler=function(ev){var td=ev.target&&ev.target.closest&&ev.target.closest('#ganttTable tbody td.sched-cell-status,#ganttTable tbody td.sched-cell-batch,#ganttTable tbody td.sched-cell-machine,#ganttTable tbody td.sched-cell-model');if(!td)return;ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();repairGanttModelCells();var kind=td.dataset.filterKind;if(!kind){if(td.classList.contains('sched-cell-status'))kind='type';else if(td.classList.contains('sched-cell-batch'))kind='batch';else if(td.classList.contains('sched-cell-machine'))kind='machine';else if(td.classList.contains('sched-cell-model'))kind='model';}setOnly(kind,td.dataset.filterVal||td.textContent);};
    document.addEventListener('pointerdown',handler,true);document.addEventListener('click',handler,true);
  }
  function normalizeOverlayText(){var ov=document.getElementById('ganttStickyHeadV82');if(!ov)return;ov.querySelectorAll('.sched-th-lbl,.sched-gmh,.sched-gwh,.sched-gdh,.sched-gday-num,.sched-gday-dow').forEach(function(el){el.style.setProperty('font-weight','700','important');el.style.setProperty('visibility','visible','important');el.style.setProperty('opacity','1','important');el.style.setProperty('letter-spacing','normal','important');});}
  function patchRender(){var r=window.renderGantt;if(!r||r._v084Patched)return;var w=function(){var out=r.apply(this,arguments);requestAnimationFrame(function(){repairGanttModelCells();normalizeOverlayText();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();setTimeout(function(){repairGanttModelCells();normalizeOverlayText();},40);});return out;};w._v084Patched=true;window.renderGantt=w;}
  var prev=window.setupGanttStickyHeader;if(prev&&!prev._v084Wrapped){var wrap=function(){var out=prev.apply(this,arguments);requestAnimationFrame(normalizeOverlayText);setTimeout(normalizeOverlayText,50);return out;};wrap._v084Wrapped=true;window.setupGanttStickyHeader=wrap;}
  installFilterClicks();patchRender();setTimeout(function(){repairGanttModelCells();normalizeOverlayText();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},250);setTimeout(function(){repairGanttModelCells();normalizeOverlayText();},1200);
})();
