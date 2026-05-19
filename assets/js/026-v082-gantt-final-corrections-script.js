/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 26 id=v082-gantt-final-corrections-script :: OPT01 no semantic edits */

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
  function rawMachineFromLabel(lbl){var txt=cleanText(lbl);if(!txt)return '';try{var row=(WORK_DATA||[]).find(function(r){return cleanText(machineLbl(r.machine))===txt||cleanText(r.machine)===txt;});if(row)return row.machine;}catch(_e){}return txt.replace(/호기$/,'').trim();}
  function rawProcessFromLabel(lbl){var txt=cleanText(lbl);if(!txt)return '';try{var item=((typeof schemaGanttItems==='function'?schemaGanttItems():[])||[]).find(function(i){return cleanText(i.label)===txt||cleanText(i.field)===txt;});if(item)return item.field;}catch(_e){}return txt;}
  function rawStatusFromLabel(lbl){var txt=cleanText(lbl);var hit=['계획','대기','진행','출고','완료'].find(function(s){return txt.indexOf(s)>-1;});return hit||txt;}
  function rawBatchFromLabel(lbl){var txt=cleanText(lbl).replace(/차$/,'').trim();if(!txt||txt==='—'||txt==='-')return '';return txt;}
  function rawModelFromLabel(lbl){var txt=cleanText(lbl);if(!txt)return '';try{var models=Array.from(new Set((WORK_DATA||[]).map(function(r){return r.model;}).filter(Boolean))).sort(function(a,b){return String(b).length-String(a).length;});var hit=models.find(function(m){return txt===String(m)||txt.indexOf(String(m))>-1;});if(hit)return hit;}catch(_e){}return txt;}
  function normalizeGanttCellsV82(){
    var tbl=document.getElementById('ganttTable');if(!tbl)return;
    tbl.querySelectorAll('tbody td.sched-cell-status').forEach(function(td){td.dataset.filterKind='type';td.dataset.filterVal=rawStatusFromLabel(td.textContent);td.style.visibility='visible';td.style.opacity='1';});
    tbl.querySelectorAll('tbody td.sched-cell-batch').forEach(function(td){td.dataset.filterKind='batch';td.dataset.filterVal=rawBatchFromLabel(td.textContent);td.style.visibility='visible';td.style.opacity='1';});
    tbl.querySelectorAll('tbody td.sched-cell-machine').forEach(function(td){td.dataset.filterKind='machine';td.dataset.filterVal=rawMachineFromLabel(td.textContent);td.style.visibility='visible';td.style.opacity='1';});
    tbl.querySelectorAll('tbody td.sched-cell-model').forEach(function(td){td.dataset.filterKind='model';td.dataset.filterVal=rawModelFromLabel(td.textContent);td.style.visibility='visible';td.style.opacity='1';td.querySelectorAll('*').forEach(function(el){el.style.visibility='visible';el.style.opacity='1';});});
    tbl.querySelectorAll('tbody td.sched-cell-process').forEach(function(td){var label=cleanText(td.textContent);td.dataset.filterKind='item';td.dataset.filterVal=rawProcessFromLabel(label);var c=processColorByLabel(label);td.style.setProperty('--gantt-process-color',c);td.style.color=c;td.style.visibility='visible';td.style.opacity='1';});
  }
  function setSelectValue(id,val){var el=document.getElementById(id);if(el)el.value=val||'';}
  function setSingleFilterOnly(kind,val){
    val=cleanText(val);if(!val)return;
    try{if(typeof selMode!=='undefined'&&selMode){selMode=false;var chip=document.getElementById('selChip');if(chip)chip.classList.remove('on');if(typeof msSel!=='undefined')Object.values(msSel).forEach(function(s){if(s&&s.clear)s.clear();});}}catch(_e){}
    if(typeof gvEquipFilt!=='undefined')gvEquipFilt='';
    if(typeof gvTypeFilt!=='undefined')gvTypeFilt='';
    if(typeof gvBatchFilt!=='undefined')gvBatchFilt='';
    if(typeof gvMachineFilt!=='undefined')gvMachineFilt='';
    if(typeof gvModelFilt!=='undefined')gvModelFilt='';
    if(typeof gItemFilt!=='undefined')gItemFilt='';
    if(kind==='type'){val=rawStatusFromLabel(val);if(typeof gvTypeFilt!=='undefined')gvTypeFilt=val;}
    else if(kind==='batch'){val=rawBatchFromLabel(val);if(!val)return;if(typeof gvBatchFilt!=='undefined')gvBatchFilt=val;}
    else if(kind==='machine'){val=rawMachineFromLabel(val);if(!val)return;if(typeof gvMachineFilt!=='undefined')gvMachineFilt=val;}
    else if(kind==='model'){val=rawModelFromLabel(val);if(!val)return;if(typeof gvModelFilt!=='undefined')gvModelFilt=val;}
    else if(kind==='item'){val=rawProcessFromLabel(val);if(!val)return;if(typeof gItemFilt!=='undefined')gItemFilt=val;}
    try{if(typeof viewCrossFilter==='function')viewCrossFilter();}catch(_e){}
    setSelectValue('gv-type',typeof gvTypeFilt!=='undefined'?gvTypeFilt:'');
    setSelectValue('gv-batch',typeof gvBatchFilt!=='undefined'?gvBatchFilt:'');
    setSelectValue('gv-machine',typeof gvMachineFilt!=='undefined'?gvMachineFilt:'');
    setSelectValue('gv-model',typeof gvModelFilt!=='undefined'?gvModelFilt:'');
    if(kind==='item'){if(typeof renderGantt==='function')renderGantt();}
    else if(typeof renderCurrentView==='function')renderCurrentView();
    else if(typeof renderGantt==='function')renderGantt();
  }
  window.applyGanttBodyFilter=function(kind,val){setSingleFilterOnly(kind,val);};
  function bindGanttAutoFilterV82(){
    normalizeGanttCellsV82();
    var tbl=document.getElementById('ganttTable');if(!tbl||tbl._v082ClickBound)return;
    tbl._v082ClickBound=true;
    tbl.addEventListener('click',function(ev){
      var td=ev.target.closest('td.sched-cell-status,td.sched-cell-batch,td.sched-cell-machine,td.sched-cell-model,td.sched-cell-process');
      if(!td||!tbl.contains(td))return;
      ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
      var kind=td.dataset.filterKind;
      if(!kind){if(td.classList.contains('sched-cell-status'))kind='type';else if(td.classList.contains('sched-cell-batch'))kind='batch';else if(td.classList.contains('sched-cell-machine'))kind='machine';else if(td.classList.contains('sched-cell-model'))kind='model';else if(td.classList.contains('sched-cell-process'))kind='item';}
      setSingleFilterOnly(kind,td.dataset.filterVal||td.textContent);
    },true);
  }
  window.bindGanttAutoFilter=bindGanttAutoFilterV82;
  function copyBoxStyle(src,dst,w,h){
    var cs=window.getComputedStyle(src);
    dst.style.position='static';dst.style.left='auto';dst.style.top='auto';dst.style.zIndex='auto';dst.style.boxSizing='border-box';
    dst.style.width=w+'px';dst.style.minWidth=w+'px';dst.style.maxWidth=w+'px';dst.style.height=h+'px';dst.style.minHeight=h+'px';dst.style.maxHeight=h+'px';
    dst.style.padding=cs.padding;dst.style.margin='0';dst.style.fontSize=cs.fontSize;dst.style.fontWeight=cs.fontWeight;dst.style.lineHeight=cs.lineHeight;
    dst.style.textAlign=cs.textAlign;dst.style.verticalAlign=cs.verticalAlign;dst.style.display='table-cell';dst.style.color=cs.color;dst.style.backgroundColor=cs.backgroundColor;
    dst.style.borderRight=cs.borderRight;dst.style.borderBottom=cs.borderBottom;dst.style.borderTop=cs.borderTop;dst.style.borderLeft=cs.borderLeft;dst.style.overflow='hidden';dst.style.whiteSpace='nowrap';dst.style.visibility='visible';dst.style.opacity='1';
    var sInner=src.querySelector('.sched-th-inner'),dInner=dst.querySelector('.sched-th-inner');
    if(sInner&&dInner){var is=window.getComputedStyle(sInner);dInner.style.display=is.display;dInner.style.alignItems=is.alignItems;dInner.style.justifyContent=is.justifyContent;dInner.style.flexDirection=is.flexDirection;dInner.style.width='100%';dInner.style.height='100%';dInner.style.minHeight='100%';dInner.style.padding=is.padding;dInner.style.fontSize=is.fontSize;dInner.style.fontWeight=is.fontWeight;dInner.style.lineHeight=is.lineHeight;dInner.style.color=is.color;dInner.style.visibility='visible';dInner.style.opacity='1';}
    dst.querySelectorAll('.sched-th-lbl,.sched-gday-num,.sched-gday-dow').forEach(function(el){el.style.visibility='visible';el.style.opacity='1';});
  }
  function syncFullHeaderClone(srcHead,cloneHead){Array.prototype.forEach.call(srcHead.rows,function(row,ri){var crow=cloneHead.rows[ri];if(!crow)return;Array.prototype.forEach.call(row.cells,function(cell,ci){var cc=crow.cells[ci];if(!cc)return;var r=cell.getBoundingClientRect();copyBoxStyle(cell,cc,Math.round(r.width)||cell.offsetWidth||24,Math.round(r.height)||cell.offsetHeight||24);});});}
  window.setupGanttStickyHeader=function setupGanttStickyHeaderV82(){
    var outer=document.getElementById('ganttOuter'),tbl=document.getElementById('ganttTable'),main=document.getElementById('main-content'),panel=document.getElementById('sched-vpanel-gantt');if(!outer||!tbl||!main||!panel)return;
    ['ganttStickyHead','ganttStickyHeadV81'].forEach(function(id){var o=document.getElementById(id);if(o){o.style.display='none';o.style.visibility='hidden';}});
    var overlay=document.getElementById('ganttStickyHeadV82');if(!overlay){overlay=document.createElement('div');overlay.id='ganttStickyHeadV82';overlay.innerHTML='<div class="v082-scroll"></div><div class="v082-static"></div>';document.body.appendChild(overlay);} 
    var scrollBox=overlay.querySelector('.v082-scroll'),staticBox=overlay.querySelector('.v082-static');var lastSig='';
    function measure(){var first=tbl.tHead&&tbl.tHead.rows&&tbl.tHead.rows[0];var widths=[],total=0,headH=Math.round(tbl.tHead.getBoundingClientRect().height)||((tbl.dataset.grows==='3')?76:48);if(first){Array.prototype.slice.call(first.cells,0,5).forEach(function(th){var r=th.getBoundingClientRect();var w=Math.round(r.width)||th.offsetWidth||54;widths.push(w);total+=w;});}if(!total){widths=[50,42,80,52,70];total=294;}return {widths:widths,total:total,headH:headH};}
    function build(force){if(!tbl.tHead){overlay.style.display='none';return measure();}var m=measure();var sig=[tbl.dataset.grows||'',tbl.offsetWidth,tbl.scrollWidth,m.headH,m.widths.join(','),tbl.tHead.textContent.length,document.body.getAttribute('data-theme')||''].join('|');if(!force&&sig===lastSig)return m;lastSig=sig;var first=tbl.tHead.rows[0];var staticTable=document.createElement('table');staticTable.className=tbl.className;staticTable.style.cssText='width:'+m.total+'px;min-width:'+m.total+'px;max-width:'+m.total+'px;height:'+m.headH+'px;border-collapse:separate;border-spacing:0;table-layout:fixed;';var stHead=document.createElement('thead');var stRow=document.createElement('tr');if(first){Array.prototype.slice.call(first.cells,0,5).forEach(function(th,i){var clone=th.cloneNode(true);clone.rowSpan=1;clone.colSpan=1;copyBoxStyle(th,clone,m.widths[i],m.headH);stRow.appendChild(clone);});}stHead.appendChild(stRow);staticTable.appendChild(stHead);staticBox.innerHTML='';staticBox.style.width=m.total+'px';staticBox.style.minWidth=m.total+'px';staticBox.style.height=m.headH+'px';staticBox.appendChild(staticTable);var fullTable=document.createElement('table');fullTable.className=tbl.className;var tW=tbl.offsetWidth||tbl.scrollWidth||0;fullTable.style.cssText='width:'+tW+'px;min-width:'+tW+'px;border-collapse:separate;border-spacing:0;table-layout:fixed;';var clonedHead=tbl.tHead.cloneNode(true);fullTable.appendChild(clonedHead);syncFullHeaderClone(tbl.tHead,clonedHead);scrollBox.innerHTML='';scrollBox.appendChild(fullTable);return m;}
    function update(){if(!panel.classList.contains('on')||!tbl.tHead||tbl.style.display==='none'){overlay.style.display='none';return;}var mr=main.getBoundingClientRect(),or=outer.getBoundingClientRect();var m=build(false)||measure();var visible=or.top<mr.top&&or.bottom>mr.top+m.headH+8;if(!visible){overlay.style.display='none';return;}overlay.style.display='block';overlay.style.visibility='visible';overlay.style.left=Math.round(or.left)+'px';overlay.style.top=Math.round(mr.top)+'px';overlay.style.width=Math.round(or.width)+'px';overlay.style.height=m.headH+'px';staticBox.style.width=m.total+'px';staticBox.style.height=m.headH+'px';var table=scrollBox.querySelector('table');if(table){var tW=tbl.offsetWidth||tbl.scrollWidth||0;table.style.width=tW+'px';table.style.minWidth=tW+'px';table.style.transform='translateX('+(-outer.scrollLeft)+'px)';}normalizeGanttCellsV82();}
    if(!outer._v082StickyBound){outer._v082StickyBound=true;outer.addEventListener('scroll',update,{passive:true});main.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',function(){lastSig='';update();},{passive:true});document.addEventListener('click',function(){setTimeout(function(){lastSig='';update();},40);},true);}requestAnimationFrame(function(){build(true);update();});
  };
  function patchRenderV82(){var r=window.renderGantt;if(!r||r._v082Patched)return;var wrapped=function(){var out=r.apply(this,arguments);requestAnimationFrame(function(){normalizeGanttCellsV82();bindGanttAutoFilterV82();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();});return out;};wrapped._v082Patched=true;window.renderGantt=wrapped;}
  patchRenderV82();setTimeout(function(){patchRenderV82();normalizeGanttCellsV82();bindGanttAutoFilterV82();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},250);setTimeout(function(){normalizeGanttCellsV82();bindGanttAutoFilterV82();if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();},1200);
})();
