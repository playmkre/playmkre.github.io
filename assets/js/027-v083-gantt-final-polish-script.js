/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 27 id=v083-gantt-final-polish-script :: OPT01 no semantic edits */

(function(){
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function setImp(el,prop,val){if(el&&val!==undefined&&val!==null&&val!=='')el.style.setProperty(prop,val,'important');}
  function copyTextStyle(src,dst){
    if(!src||!dst)return;
    var cs=getComputedStyle(src);
    ['font-size','font-weight','line-height','letter-spacing','color','text-align','vertical-align','padding-top','padding-right','padding-bottom','padding-left','display','align-items','justify-content','flex-direction'].forEach(function(p){setImp(dst,p,cs.getPropertyValue(p));});
    setImp(dst,'visibility','visible');setImp(dst,'opacity','1');
  }
  function syncOverlayFontsV83(){
    var tbl=document.getElementById('ganttTable'),ov=document.getElementById('ganttStickyHeadV82');
    if(!tbl||!tbl.tHead||!ov)return;
    var srcTh=Array.prototype.slice.call(tbl.tHead.querySelectorAll('th'));
    var scrollTh=Array.prototype.slice.call(ov.querySelectorAll('.v082-scroll th'));
    srcTh.forEach(function(src,i){var dst=scrollTh[i];if(!dst)return;copyTextStyle(src,dst);var si=src.querySelector('.sched-th-inner'),di=dst.querySelector('.sched-th-inner');copyTextStyle(si,di);['.sched-th-lbl','.sched-gday-num','.sched-gday-dow','.sched-gday'].forEach(function(sel){var ss=src.querySelector(sel),dd=dst.querySelector(sel);copyTextStyle(ss,dd);});});
    var srcStatic=tbl.tHead.rows&&tbl.tHead.rows[0]?Array.prototype.slice.call(tbl.tHead.rows[0].cells,0,5):[];
    var dstStatic=Array.prototype.slice.call(ov.querySelectorAll('.v082-static th'));
    srcStatic.forEach(function(src,i){var dst=dstStatic[i];if(!dst)return;copyTextStyle(src,dst);var si=src.querySelector('.sched-th-inner'),di=dst.querySelector('.sched-th-inner');copyTextStyle(si,di);var sl=src.querySelector('.sched-th-lbl'),dl=dst.querySelector('.sched-th-lbl');copyTextStyle(sl,dl);});
  }
  function rawStatus(v){var t=clean(v);return (['계획','대기','진행','출고','완료'].find(function(s){return t.indexOf(s)>-1;})||t);}
  function rawBatch(v){var t=clean(v).replace(/차$/,'').trim();return (t==='—'||t==='-')?'':t;}
  function rawMachine(v){var t=clean(v);try{var r=(WORK_DATA||[]).find(function(x){return clean(machineLbl(x.machine))===t||clean(x.machine)===t||clean(x.machine)+'호기'===t;});if(r)return r.machine;}catch(e){}return t.replace(/호기$/,'').trim();}
  function rawModel(v){var t=clean(v);try{var models=Array.from(new Set((WORK_DATA||[]).map(function(r){return r.model;}).filter(Boolean))).sort(function(a,b){return String(b).length-String(a).length;});var hit=models.find(function(m){return t===String(m)||t.indexOf(String(m))>-1;});if(hit)return hit;}catch(e){}return t;}
  function rawItem(v){var t=clean(v);try{var hit=((typeof schemaGanttItems==='function'?schemaGanttItems():[])||[]).find(function(i){return clean(i.label)===t||clean(i.field)===t;});if(hit)return hit.field;}catch(e){}return t;}
  function setSel(id,val){var el=document.getElementById(id);if(!el)return;if(val && !Array.from(el.options).some(function(o){return o.value===val;})){var opt=document.createElement('option');opt.value=val;opt.textContent=val;el.appendChild(opt);}el.value=val||'';}
  function clearMulti(){try{if(typeof msSel!=='undefined')Object.values(msSel).forEach(function(s){if(s&&s.clear)s.clear();});}catch(e){}try{if(typeof selMode!=='undefined'&&selMode){selMode=false;var chip=document.getElementById('selChip');if(chip)chip.classList.remove('on');}}catch(e){}}
  function applyOnly(kind,val){
    val=clean(val);if(!val)return;
    clearMulti();
    try{gvEquipFilt='';gvTypeFilt='';gvBatchFilt='';gvMachineFilt='';gvModelFilt='';gBatchFilt='';gTypeFilt='';gMachineFilt='';gModelFilt='';gItemFilt='';activeBatch=null;}catch(e){}
    if(kind==='type'){val=rawStatus(val);gvTypeFilt=val;gTypeFilt=val;}
    else if(kind==='batch'){val=rawBatch(val);if(!val)return;gvBatchFilt=val;gBatchFilt=val;}
    else if(kind==='machine'){val=rawMachine(val);if(!val)return;gvMachineFilt=val;gMachineFilt=val;}
    else if(kind==='model'){val=rawModel(val);if(!val)return;gvModelFilt=val;gModelFilt=val;}
    else if(kind==='item'){val=rawItem(val);if(!val)return;gItemFilt=val;}
    setSel('gv-equip','');setSel('gv-type',gvTypeFilt||'');setSel('gv-batch',gvBatchFilt||'');setSel('gv-machine',gvMachineFilt||'');setSel('gv-model',gvModelFilt||'');
    try{if(typeof viewCrossFilter==='function')viewCrossFilter();}catch(e){}
    setSel('gv-type',gvTypeFilt||'');setSel('gv-batch',gvBatchFilt||'');setSel('gv-machine',gvMachineFilt||'');setSel('gv-model',gvModelFilt||'');
    if(typeof renderCurrentView==='function')renderCurrentView();else if(typeof renderGantt==='function')renderGantt();
    setTimeout(function(){setSel('gv-type',gvTypeFilt||'');setSel('gv-batch',gvBatchFilt||'');setSel('gv-machine',gvMachineFilt||'');setSel('gv-model',gvModelFilt||'');if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},50);
  }
  window.applyGanttBodyFilter=function(kind,val){applyOnly(kind,val);};
  function normalize(){
    var tbl=document.getElementById('ganttTable');if(!tbl)return;
    tbl.querySelectorAll('tbody td.sched-cell-status').forEach(function(td){td.dataset.filterKind='type';td.dataset.filterVal=rawStatus(td.textContent);});
    tbl.querySelectorAll('tbody td.sched-cell-batch').forEach(function(td){td.dataset.filterKind='batch';td.dataset.filterVal=rawBatch(td.textContent);});
    tbl.querySelectorAll('tbody td.sched-cell-machine').forEach(function(td){td.dataset.filterKind='machine';td.dataset.filterVal=rawMachine(td.textContent);});
    tbl.querySelectorAll('tbody td.sched-cell-model').forEach(function(td){td.dataset.filterKind='model';td.dataset.filterVal=rawModel(td.textContent);td.style.setProperty('visibility','visible','important');td.style.setProperty('opacity','1','important');td.querySelectorAll('*').forEach(function(el){el.style.setProperty('visibility','visible','important');el.style.setProperty('opacity','1','important');});});
    tbl.querySelectorAll('tbody td.sched-cell-process').forEach(function(td){td.dataset.filterKind='item';td.dataset.filterVal=rawItem(td.textContent);});
  }
  function installClick(){
    if(document._v083GanttClickBound)return;document._v083GanttClickBound=true;
    document.addEventListener('click',function(ev){
      var td=ev.target.closest&&ev.target.closest('#ganttTable tbody td.sched-cell-status,#ganttTable tbody td.sched-cell-batch,#ganttTable tbody td.sched-cell-machine,#ganttTable tbody td.sched-cell-model,#ganttTable tbody td.sched-cell-process');
      if(!td)return;
      ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
      normalize();
      var kind=td.dataset.filterKind;if(!kind){if(td.classList.contains('sched-cell-status'))kind='type';else if(td.classList.contains('sched-cell-batch'))kind='batch';else if(td.classList.contains('sched-cell-machine'))kind='machine';else if(td.classList.contains('sched-cell-model'))kind='model';else kind='item';}
      applyOnly(kind,td.dataset.filterVal||td.textContent);
    },true);
  }
  function patchRender(){var r=window.renderGantt;if(!r||r._v083Patched)return;var w=function(){var out=r.apply(this,arguments);requestAnimationFrame(function(){normalize();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();setTimeout(syncOverlayFontsV83,0);});return out;};w._v083Patched=true;window.renderGantt=w;}
  var prevSetup=window.setupGanttStickyHeader;
  if(prevSetup&&!prevSetup._v083Wrapped){var wrapped=function(){var out=prevSetup.apply(this,arguments);requestAnimationFrame(syncOverlayFontsV83);setTimeout(syncOverlayFontsV83,30);return out;};wrapped._v083Wrapped=true;window.setupGanttStickyHeader=wrapped;}
  installClick();patchRender();
  var main=document.getElementById('main-content'),outer=document.getElementById('ganttOuter');
  if(main&&!main._v083FontSync){main._v083FontSync=true;main.addEventListener('scroll',function(){requestAnimationFrame(syncOverlayFontsV83);},{passive:true});}
  if(outer&&!outer._v083FontSync){outer._v083FontSync=true;outer.addEventListener('scroll',function(){requestAnimationFrame(syncOverlayFontsV83);},{passive:true});}
  setTimeout(function(){normalize();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();syncOverlayFontsV83();},250);
  setTimeout(function(){normalize();syncOverlayFontsV83();},1200);
})();
