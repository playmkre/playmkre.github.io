/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 25 id=v081-gantt-corrections-script :: OPT01 no semantic edits */

(function(){
  function cleanText(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function processColorByLabel(label){
    var txt=cleanText(label);
    try{var items=(typeof schemaGanttItems==='function'?schemaGanttItems():[])||[];var hit=items.find(function(i){return cleanText(i.label)===txt||cleanText(i.field)===txt;});if(hit&&hit.color)return hit.color;}catch(_e){}
    if(/입고|부자재|자재/.test(txt))return '#60a5fa';
    if(/TEST|세팅|전장|기구|배선|생산|YBASE|3POD|WV|PZ|엘모/.test(txt))return '#6ee7b7';
    if(/적층|출고|해체/.test(txt))return '#f59e0b';
    return 'var(--tp)';
  }
  function normalizeGanttCells(){
    var tbl=document.getElementById('ganttTable');if(!tbl)return;
    tbl.querySelectorAll('tbody td.sched-cell-process').forEach(function(td){var c=processColorByLabel(td.textContent);td.style.setProperty('--gantt-process-color',c);td.style.color=c;td.style.visibility='visible';td.style.opacity='1';td.dataset.filterKind='item';});
    tbl.querySelectorAll('tbody td.sched-cell-status').forEach(function(td){td.dataset.filterKind='type';td.style.visibility='visible';td.style.opacity='1';});
    tbl.querySelectorAll('tbody td.sched-cell-batch').forEach(function(td){td.dataset.filterKind='batch';td.style.visibility='visible';td.style.opacity='1';});
    tbl.querySelectorAll('tbody td.sched-cell-machine').forEach(function(td){td.dataset.filterKind='machine';td.style.visibility='visible';td.style.opacity='1';});
    tbl.querySelectorAll('tbody td.sched-cell-model').forEach(function(td){td.dataset.filterKind='model';td.style.visibility='visible';td.style.opacity='1';td.querySelectorAll('*').forEach(function(el){el.style.visibility='visible';el.style.opacity='1';});});
  }
  function rawMachineFromLabel(lbl){var txt=cleanText(lbl);if(!txt)return '';try{var row=(WORK_DATA||[]).find(function(r){return cleanText(machineLbl(r.machine))===txt||cleanText(r.machine)===txt;});if(row)return row.machine;}catch(_e){}return txt.replace(/호기$/,'').trim();}
  function rawProcessFromLabel(lbl){var txt=cleanText(lbl);if(!txt)return '';try{var item=((typeof schemaGanttItems==='function'?schemaGanttItems():[])||[]).find(function(i){return cleanText(i.label)===txt||cleanText(i.field)===txt;});if(item)return item.field;}catch(_e){}return txt;}
  window.applyGanttBodyFilter=function(kind,val){
    val=cleanText(val);if(!val)return;
    if(kind==='type'){if(typeof gvTypeFilt!=='undefined')gvTypeFilt=val;var st=document.getElementById('gv-type');if(st)st.value=val;}
    else if(kind==='batch'){val=val.replace(/차$/,'').trim();if(typeof gvBatchFilt!=='undefined')gvBatchFilt=val;var ba=document.getElementById('gv-batch');if(ba)ba.value=val;}
    else if(kind==='machine'){val=rawMachineFromLabel(val);if(typeof gvMachineFilt!=='undefined')gvMachineFilt=val;var mc=document.getElementById('gv-machine');if(mc)mc.value=val;}
    else if(kind==='model'){if(typeof gvModelFilt!=='undefined')gvModelFilt=val;var mo=document.getElementById('gv-model');if(mo)mo.value=val;}
    else if(kind==='item'){val=rawProcessFromLabel(val);if(typeof gItemFilt!=='undefined')gItemFilt=(gItemFilt===val)?'':val;if(typeof renderGantt==='function')renderGantt();return;}
    try{if(typeof selMode!=='undefined'&&selMode&&typeof msSel!=='undefined'){var map={type:'type',batch:'batch',machine:'machine',model:'model'};var k=map[kind];if(k&&msSel[k]){msSel[k].clear();msSel[k].add(val);if(typeof buildMsFilters==='function')buildMsFilters();}}else if(typeof viewCrossFilter==='function')viewCrossFilter();}catch(_e){}
    if(typeof renderCurrentView==='function')renderCurrentView();else if(typeof renderGantt==='function')renderGantt();
  };
  function bindGanttAutoFilterV81(){
    normalizeGanttCells();
    var tbl=document.getElementById('ganttTable');if(!tbl||tbl._v081ClickBound)return;
    tbl._v081ClickBound=true;
    tbl.addEventListener('click',function(ev){var td=ev.target.closest('td.sched-cell-status,td.sched-cell-batch,td.sched-cell-machine,td.sched-cell-model,td.sched-cell-process');if(!td||!tbl.contains(td))return;ev.preventDefault();ev.stopPropagation();var kind=td.dataset.filterKind;if(!kind){if(td.classList.contains('sched-cell-status'))kind='type';else if(td.classList.contains('sched-cell-batch'))kind='batch';else if(td.classList.contains('sched-cell-machine'))kind='machine';else if(td.classList.contains('sched-cell-model'))kind='model';else if(td.classList.contains('sched-cell-process'))kind='item';}window.applyGanttBodyFilter(kind,td.textContent);},true);
  }
  window.bindGanttAutoFilter=bindGanttAutoFilterV81;
  window.setupGanttStickyHeader=function setupGanttStickyHeaderV81(){
    var outer=document.getElementById('ganttOuter'),tbl=document.getElementById('ganttTable'),main=document.getElementById('main-content'),panel=document.getElementById('sched-vpanel-gantt');
    if(!outer||!tbl||!main||!panel)return;
    var old=document.getElementById('ganttStickyHead');if(old){old.style.display='none';old.id='ganttStickyHeadLegacy';}
    var overlay=document.getElementById('ganttStickyHeadV81');if(!overlay){overlay=document.createElement('div');overlay.id='ganttStickyHeadV81';overlay.innerHTML='<div class="v081-scroll"></div><div class="v081-static"></div>';document.body.appendChild(overlay);}
    var scrollBox=overlay.querySelector('.v081-scroll'),staticBox=overlay.querySelector('.v081-static');var lastSig='';
    function measureFixed(){var firstRow=tbl.tHead&&tbl.tHead.rows&&tbl.tHead.rows[0];var labels=['상태','차수','호기','모델','공정'];var widths=[50,42,80,52,70];if(firstRow){Array.prototype.slice.call(firstRow.cells,0,5).forEach(function(th,i){var r=th.getBoundingClientRect();widths[i]=Math.round(r.width)||th.offsetWidth||widths[i];labels[i]=cleanText(th.textContent)||labels[i];});}return {labels:labels,widths:widths,total:widths.reduce(function(a,b){return a+b;},0)};}
    function build(force){if(!tbl.tHead){overlay.style.display='none';return;}var m=measureFixed();var headH=Math.round(tbl.tHead.getBoundingClientRect().height)||((tbl.dataset.grows==='3')?76:48);var sig=[tbl.dataset.grows||'',tbl.offsetWidth,tbl.scrollWidth,headH,m.widths.join(','),tbl.tHead.textContent.length].join('|');if(!force&&sig===lastSig)return m;lastSig=sig;staticBox.innerHTML='';staticBox.style.width=m.total+'px';staticBox.style.minWidth=m.total+'px';staticBox.style.height=headH+'px';staticBox.style.display='flex';m.labels.forEach(function(label,i){var cell=document.createElement('div');cell.className='v081-static-cell';cell.style.width=m.widths[i]+'px';cell.style.minWidth=m.widths[i]+'px';cell.style.maxWidth=m.widths[i]+'px';cell.style.height=headH+'px';cell.innerHTML='<span class="v081-static-label">'+label+'</span>';staticBox.appendChild(cell);});var fullTable=document.createElement('table');fullTable.className=tbl.className;var tW=tbl.offsetWidth||tbl.scrollWidth||0;fullTable.style.cssText='width:'+tW+'px;min-width:'+tW+'px;border-collapse:separate;border-spacing:0;table-layout:fixed;';fullTable.appendChild(tbl.tHead.cloneNode(true));fullTable.querySelectorAll('.sched-th-lbl').forEach(function(el){el.style.visibility='visible';el.style.opacity='1';el.style.display='flex';el.style.alignItems='center';el.style.justifyContent='center';el.style.color='var(--tp)';});scrollBox.innerHTML='';scrollBox.appendChild(fullTable);return m;}
    function update(){if(!panel.classList.contains('on')||!tbl.tHead||tbl.style.display==='none'){overlay.style.display='none';return;}var mr=main.getBoundingClientRect(),or=outer.getBoundingClientRect();var headH=Math.round(tbl.tHead.getBoundingClientRect().height)||((tbl.dataset.grows==='3')?76:48);var visible=or.top<mr.top&&or.bottom>mr.top+headH+8;if(!visible){overlay.style.display='none';return;}var m=build(false)||measureFixed();overlay.style.display='block';overlay.style.left=Math.round(or.left)+'px';overlay.style.top=Math.round(mr.top)+'px';overlay.style.width=Math.round(or.width)+'px';overlay.style.height=headH+'px';staticBox.style.width=m.total+'px';staticBox.style.height=headH+'px';var table=scrollBox.querySelector('table');if(table){var tW=tbl.offsetWidth||tbl.scrollWidth||0;table.style.width=tW+'px';table.style.minWidth=tW+'px';table.style.transform='translateX('+(-outer.scrollLeft)+'px)';}normalizeGanttCells();}
    if(!outer._v081StickyBound){outer._v081StickyBound=true;outer.addEventListener('scroll',update,{passive:true});main.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',function(){lastSig='';update();},{passive:true});document.addEventListener('click',function(){setTimeout(function(){lastSig='';update();},40);},true);}requestAnimationFrame(function(){build(true);update();});
  };
  function patchRenderV81(){var r=window.renderGantt;if(!r||r._v081Patched)return;var wrapped=function(){var out=r.apply(this,arguments);requestAnimationFrame(function(){normalizeGanttCells();bindGanttAutoFilterV81();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();});return out;};wrapped._v081Patched=true;window.renderGantt=wrapped;}
  patchRenderV81();setTimeout(function(){patchRenderV81();normalizeGanttCells();bindGanttAutoFilterV81();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},300);setTimeout(function(){normalizeGanttCells();bindGanttAutoFilterV81();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},1200);
})();
