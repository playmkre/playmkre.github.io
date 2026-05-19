/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 23 id=v075-fixes-script :: OPT01 no semantic edits */

(function(){
  function escAttr(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}

  // 간트 스크롤 시 날짜 헤더/좌측 항목 고정: 실제 fixed overlay를 사용한다.
  window.setupGanttStickyHeader = function setupGanttStickyHeader(){
    var outer=document.getElementById('ganttOuter');
    var tbl=document.getElementById('ganttTable');
    var main=document.getElementById('main-content');
    var panel=document.getElementById('sched-vpanel-gantt');
    if(!outer||!tbl||!main||!panel)return;
    var overlay=document.getElementById('ganttStickyHead');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='ganttStickyHead';
      overlay.innerHTML='<div class="gsh-scroll"></div><div class="gsh-static"></div>';
      document.body.appendChild(overlay);
    }
    var scrollBox=overlay.querySelector('.gsh-scroll');
    var staticBox=overlay.querySelector('.gsh-static');
    var lastSig='';

    function build(){
      if(!tbl.tHead){overlay.style.display='none';return;}
      // v0.79: 실제 th 치수 기반 overlay 생성
      var sig=(tbl.dataset.grows||'')+'|'+(tbl.tHead.textContent||'').length+'|'+tbl.offsetWidth+'|'+tbl.scrollWidth;
      if(sig===lastSig)return;
      lastSig=sig;

      var firstRow=tbl.tHead.rows&&tbl.tHead.rows[0];
      // 앞 5개 th의 실제 width 측정
      var fixedWidths=[];
      var fixedTotalW=0;
      if(firstRow){
        Array.prototype.slice.call(firstRow.cells,0,5).forEach(function(th){
          var rect=th.getBoundingClientRect();
          var w=Math.round(rect.width)||th.offsetWidth||54;
          fixedWidths.push(w);
          fixedTotalW+=w;
        });
      }
      if(!fixedTotalW)fixedTotalW=294;

      // ── staticBox: 좌측 고정 5컬럼 overlay ──
      var staticTable=document.createElement('table');
      staticTable.className=tbl.className;
      staticTable.style.cssText='width:'+fixedTotalW+'px;min-width:'+fixedTotalW+'px;max-width:'+fixedTotalW+'px;border-collapse:collapse;table-layout:fixed;position:relative;z-index:1;';
      var stHead=document.createElement('thead');
      if(firstRow){
        Array.prototype.from(tbl.tHead.rows).forEach(function(row,ri){
          var stRow=document.createElement('tr');
          // 각 행에서 앞 5 셀만 클론
          var cells=Array.prototype.slice.call(row.cells,0,5);
          cells.forEach(function(th,ci){
            var cloned=th.cloneNode(true);
            var w=fixedWidths[ci]||(fixedTotalW/5);
            // computed style 복사
            var cs=window.getComputedStyle(th);
            cloned.style.cssText='';
            cloned.style.position='static';
            cloned.style.left=''; cloned.style.top=''; cloned.style.zIndex='';
            cloned.style.width=w+'px';
            cloned.style.minWidth=w+'px';
            cloned.style.maxWidth=w+'px';
            cloned.style.fontSize=cs.fontSize;
            cloned.style.fontWeight=cs.fontWeight;
            cloned.style.lineHeight=cs.lineHeight;
            cloned.style.padding=cs.padding;
            cloned.style.textAlign=cs.textAlign;
            cloned.style.verticalAlign=cs.verticalAlign;
            cloned.style.color=cs.color;
            cloned.style.backgroundColor=cs.backgroundColor||'var(--hd)';
            cloned.style.borderBottom=cs.borderBottom;
            cloned.style.borderRight=cs.borderRight;
            cloned.style.boxSizing='border-box';
            cloned.style.overflow='hidden';
            cloned.style.whiteSpace='nowrap';
            stRow.appendChild(cloned);
          });
          stHead.appendChild(stRow);
        });
      }
      staticTable.appendChild(stHead);
      staticBox.innerHTML='';
      staticBox.style.width=fixedTotalW+'px';
      staticBox.style.minWidth=fixedTotalW+'px';
      staticBox.style.flexShrink='0';
      staticBox.style.overflow='hidden';
      staticBox.style.background='var(--hd)';
      staticBox.style.zIndex='12';
      staticBox.appendChild(staticTable);

      // ── scrollBox: 전체 thead clone (좌측 5열 포함) + translateX 동기화 ──
      var fullTable=document.createElement('table');
      fullTable.className=tbl.className;
      var tW=tbl.offsetWidth||tbl.scrollWidth||0;
      fullTable.style.cssText='width:'+tW+'px;min-width:'+tW+'px;border-collapse:collapse;table-layout:fixed;';
      fullTable.appendChild(tbl.tHead.cloneNode(true));
      scrollBox.innerHTML='';
      scrollBox.style.overflow='hidden';
      scrollBox.style.flex='1';
      scrollBox.style.position='relative';
      scrollBox.appendChild(fullTable);
    }

    function update(){
      if(!panel.classList.contains('on')||!tbl.tHead||tbl.style.display==='none'){
        overlay.style.display='none';return;
      }
      var mr=main.getBoundingClientRect();
      var or=outer.getBoundingClientRect();
      var headH=(tbl.tHead.getBoundingClientRect&&tbl.tHead.getBoundingClientRect().height)||((tbl.dataset.grows==='3')?76:48);
      var visible=or.top<mr.top && or.bottom>mr.top+headH+8;
      if(!visible){overlay.style.display='none';return;}
      build();
      overlay.style.display='flex';overlay.style.flexWrap='nowrap';overlay.style.alignItems='stretch';overlay.style.overflow='hidden';
      overlay.style.left=Math.round(or.left)+'px';
      overlay.style.top=Math.round(mr.top)+'px';
      overlay.style.width=Math.round(or.width)+'px';
      overlay.style.height=Math.round(headH)+'px';
      // v0.79: scrollBox table을 고정 영역 폭만큼 보정하여 translateX 적용
      var table=scrollBox.querySelector('table');
      var staticTbl=staticBox.querySelector('table');
      var fixedW=staticBox.offsetWidth||0;
      if(table){
        var tW=(tbl.offsetWidth||tbl.scrollWidth||0);
        // translateX: scrollLeft 이동 + 고정 영역 폭만큼 왼쪽으로 상쇄
        table.style.transform='translateX('+(-outer.scrollLeft+fixedW)+'px)';
        table.style.width=tW+'px';
        table.style.minWidth=tW+'px';
      }
      if(staticTbl){
        staticTbl.style.height=Math.round(headH)+'px';
      }
    }

    if(!outer._stickyHeadBoundV79){
      outer._stickyHeadBoundV79=true;
      outer.addEventListener('scroll',update,{passive:true});
      main.addEventListener('scroll',update,{passive:true});
      window.addEventListener('resize',update,{passive:true});
      document.addEventListener('click',function(){setTimeout(update,30);},true);
    }
    requestAnimationFrame(update);
  };

  function patchRenderGantt(){
    var original=window.renderGantt;
    if(!original||original._v75StickyPatched)return;
    var wrapped=function(){
      var ret=original.apply(this,arguments);
      requestAnimationFrame(function(){
        if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();
      });
      return ret;
    };
    wrapped._v75StickyPatched=true;
    window.renderGantt=wrapped;
  }
  patchRenderGantt();
  setTimeout(function(){
    patchRenderGantt();
    if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();
  },600);

  // 멀티선택 목록: 상태는 기본 5개 + 일반 상태 필터 옵션 + 실제 데이터 + 선택값을 모두 유지한다.
  window.buildMsFilters=function buildMsFilters(){
    if(typeof msSel==='undefined')return;
    var STATUS_ORDER=['계획','대기','진행','출고','완료'];
    var selectedUnion=function(items,key){
      var set=new Set(items.filter(function(v){return v!==undefined&&v!==null&&String(v)!=='';}));
      if(msSel[key])msSel[key].forEach(function(v){set.add(v);});
      return Array.from(set);
    };
    var singleOptions=function(id){
      var el=document.getElementById(id);
      if(!el)return [];
      return Array.prototype.slice.call(el.options||[]).map(function(o){return o.value;}).filter(Boolean);
    };
    var passExcept=function(r,exclude){
      if(exclude!=='equip'&&msSel.equip&&msSel.equip.size>0){
        var isY=YANGSAN_IDS.has(r.id),isR=YEONJU_IDS.has(r.id);
        if(!((msSel.equip.has('양산')&&isY)||(msSel.equip.has('연구')&&isR)))return false;
      }
      if(exclude!=='type'&&msSel.type&&msSel.type.size>0&&!msSel.type.has(calcRowStatus(r)))return false;
      if(exclude!=='model'&&msSel.model&&msSel.model.size>0&&!msSel.model.has(r.model))return false;
      if(exclude!=='batch'&&msSel.batch&&msSel.batch.size>0&&!msSel.batch.has(r.batch))return false;
      if(exclude!=='machine'&&msSel.machine&&msSel.machine.size>0&&!msSel.machine.has(r.machine))return false;
      return true;
    };
    var rowsExcept=function(key){return (WORK_DATA||[]).filter(function(r){return passExcept(r,key);});};
    var typeItems=selectedUnion([].concat(STATUS_ORDER,singleOptions('gv-type'),(WORK_DATA||[]).map(function(r){return calcRowStatus(r);})), 'type');
    var modelItems=selectedUnion(Array.from(new Set(rowsExcept('model').map(function(r){return r.model;}).filter(Boolean))).sort(), 'model');
    var batchItems=selectedUnion(Array.from(new Set(rowsExcept('batch').map(function(r){return r.batch;}).filter(Boolean))).sort(function(a,b){return Number(a)-Number(b);}), 'batch');
    var machineItems=selectedUnion(Array.from(new Set(rowsExcept('machine').map(function(r){return r.machine;}).filter(Boolean))).sort(function(a,b){return String(a).localeCompare(String(b),'ko');}), 'machine');
    var equipBase=[];
    if(rowsExcept('equip').some(function(r){return YANGSAN_IDS.has(r.id);}))equipBase.push('양산');
    if(rowsExcept('equip').some(function(r){return YEONJU_IDS.has(r.id);}))equipBase.push('연구');
    var configs=[
      {key:'equip',id:'fg-equip',items:selectedUnion(equipBase,'equip'),labelFn:function(v){return v;}},
      {key:'type',id:'fg-type',items:typeItems,labelFn:function(v){return v;}},
      {key:'model',id:'fg-model',items:modelItems,labelFn:function(v){return v;}},
      {key:'batch',id:'fg-batch',items:batchItems,labelFn:function(v){return v+'차';}},
      {key:'machine',id:'fg-machine',items:machineItems,labelFn:function(v){return machineLbl(v);}}
    ];
    configs.forEach(function(cfg){
      var fg=document.getElementById(cfg.id);if(!fg)return;
      var sel=fg.querySelector('select.f-sel');if(sel)sel.style.display='none';
      fg.querySelectorAll('.ms-btn,.ms-panel').forEach(function(el){el.remove();});
      var btn=document.createElement('button');
      btn.type='button';btn.className='ms-btn';btn.id='ms-btn-'+cfg.key;
      btn.innerHTML='<span class="ms-btn-lbl" id="ms-lbl-'+cfg.key+'">전체</span><span class="ms-btn-arr">▾</span>';
      btn.onclick=function(ev){ev.stopPropagation();toggleMsPanel(cfg.key);};
      fg.appendChild(btn);
      var panel=document.createElement('div');
      panel.className='ms-panel';panel.id='ms-panel-'+cfg.key;
      cfg.items.forEach(function(val){
        var item=document.createElement('div');item.className='ms-item'+(msSel[cfg.key].has(val)?' checked':'');
        var cb=document.createElement('input');cb.type='checkbox';cb.value=val;cb.checked=msSel[cfg.key].has(val);
        cb.onclick=function(ev){ev.stopPropagation();toggleMsItem(cfg.key,val,cb.checked);};
        var lbl=document.createElement('span');lbl.textContent=cfg.labelFn(val);
        item.appendChild(cb);item.appendChild(lbl);
        item.onclick=function(ev){if(ev.target!==cb){cb.checked=!cb.checked;toggleMsItem(cfg.key,val,cb.checked);}};
        panel.appendChild(item);
      });
      fg.appendChild(panel);
      updateMsBtnLabel(cfg.key,cfg.labelFn);
    });
  };

  window.positionMsPanel=function positionMsPanel(key){
    var btn=document.getElementById('ms-btn-'+key);
    var panel=document.getElementById('ms-panel-'+key);
    if(!btn||!panel)return;
    var r=btn.getBoundingClientRect();
    panel.style.display='block';
    var pw=panel.offsetWidth||150;
    var ph=Math.min(panel.offsetHeight||220, window.innerHeight-24);
    var left=r.left;
    var top=r.bottom+6;
    if(left+pw>window.innerWidth-12)left=Math.max(12,window.innerWidth-pw-12);
    if(top+ph>window.innerHeight-12)top=Math.max(12,r.top-ph-6);
    panel.style.left=Math.round(left)+'px';
    panel.style.top=Math.round(top)+'px';
    panel.style.display='';
  };

  window.toggleMsPanel=function toggleMsPanel(key){
    var panel=document.getElementById('ms-panel-'+key);if(!panel)return;
    var isOpen=panel.classList.contains('open');
    closeAllMsPanels();
    if(!isOpen){
      panel.classList.add('open');
      positionMsPanel(key);
    }
  };
  window.closeAllMsPanels=function closeAllMsPanels(){
    document.querySelectorAll('#page-schedule .ms-panel').forEach(function(p){p.classList.remove('open');});
  };
  if(!window._msPanelCloseV75){
    window._msPanelCloseV75=true;
    document.addEventListener('click',function(ev){
      if(ev.target&&ev.target.closest&&ev.target.closest('#page-schedule .ms-btn,#page-schedule .ms-panel'))return;
      closeAllMsPanels();
    },true);
    var main=document.getElementById('main-content');
    if(main)main.addEventListener('scroll',closeAllMsPanels,{passive:true});
    window.addEventListener('resize',closeAllMsPanels,{passive:true});
  }

  // 데이터관리/간트 화면 진입 후 sticky overlay 재계산
  setTimeout(function(){
    try{if(window.buildMsFilters&&typeof selMode!=='undefined'&&selMode)window.buildMsFilters();}catch(_e){}
    try{if(window.setupGanttStickyHeader)window.setupGanttStickyHeader();}catch(_e){}
  },1200);
})();
