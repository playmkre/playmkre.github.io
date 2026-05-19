/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 38 id=(none) :: OPT01 no semantic edits */

var SCHED_FILTER_GROUPS={
  material:{label:'자재입고',items:{
    jaje:{label:'부자재',on:true},
    ybase:{label:'YBASE',on:true},
    pod3:{label:'3POD',on:true},
    wvpz:{label:'WV/PZ',on:true},
    elmo:{label:'엘모',on:true}
  }},
  work:{label:'작업',items:{
    jungjiang:{label:'생산',on:true},
    test:{label:'TEST',on:true},
    jeokjeung:{label:'적층',on:true}
  }},
  shipping:{label:'출고',on:true,standalone:true},
  disassembly:{label:'해체',on:true,standalone:true}
};
function sfgGetGroupState(gk){
  var g=SCHED_FILTER_GROUPS[gk];
  if(!g||g.standalone)return g?(g.on?'all-on':'all-off'):'all-off';
  var vals=Object.values(g.items);
  var n=vals.filter(function(i){return i.on;}).length;
  return n===0?'all-off':n===vals.length?'all-on':'partial';
}
function sfgToggleGroup(gk){
  var g=SCHED_FILTER_GROUPS[gk];if(!g)return;
  if(g.standalone){g.on=!g.on;}
  else{var s=sfgGetGroupState(gk);var nv=s==='all-on'?false:true;Object.values(g.items).forEach(function(i){i.on=nv;});}
  sfgSyncFilterBar();
  if(typeof renderCurrentView==='function')renderCurrentView();
  else if(typeof renderGantt==='function')renderGantt();
}
function sfgToggleItem(gk,ik){
  var g=SCHED_FILTER_GROUPS[gk];
  if(!g||!g.items||!g.items[ik])return;
  g.items[ik].on=!g.items[ik].on;
  sfgSyncFilterBar();
  if(typeof renderCurrentView==='function')renderCurrentView();
  else if(typeof renderGantt==='function')renderGantt();
}
function sfgSyncFilterBar(){
  ['material','work'].forEach(function(gk){
    var b=document.getElementById('sfg-parent-'+gk);
    if(b)b.className='sfg-parent-btn '+sfgGetGroupState(gk);
  });
  Object.keys(SCHED_FILTER_GROUPS).forEach(function(gk){
    var g=SCHED_FILTER_GROUPS[gk];
    if(!g||g.standalone){
      var sb=document.getElementById('sfg-standalone-'+gk);
      if(sb)sb.className='sfg-standalone-btn'+(g.on?' on':'');
      return;
    }
    Object.keys(g.items).forEach(function(ik){
      var cb=document.getElementById('sfg-child-'+gk+'-'+ik);
      if(cb)cb.className='sfg-child-btn'+(g.items[ik].on?' on':'');
    });
  });
}
function sfgRenderBar(cid){
  var el=document.getElementById(cid);if(!el)return;
  var p=[];
  p.push('<div class="sfg-bar">');
  var mg=SCHED_FILTER_GROUPS.material,ms=sfgGetGroupState('material');
  p.push('<div class="sfg-group">');
  p.push('<button id="sfg-parent-material" class="sfg-parent-btn '+ms+'" onclick="sfgToggleGroup(\'material\')" title="자재입고 전체 토글">자재입고</button>');
  Object.keys(mg.items).forEach(function(ik){
    var oc=mg.items[ik].on?' on':'';
    p.push('<button id="sfg-child-material-'+ik+'" class="sfg-child-btn'+oc+'" onclick="sfgToggleItem(\'material\',\''+ik+'\')">' + mg.items[ik].label + '</button>');
  });
  p.push('</div>');
  var wg=SCHED_FILTER_GROUPS.work,ws=sfgGetGroupState('work');
  p.push('<div class="sfg-group">');
  p.push('<button id="sfg-parent-work" class="sfg-parent-btn '+ws+'" onclick="sfgToggleGroup(\'work\')" title="작업 전체 토글">작업</button>');
  Object.keys(wg.items).forEach(function(ik){
    var oc=wg.items[ik].on?' on':'';
    p.push('<button id="sfg-child-work-'+ik+'" class="sfg-child-btn'+oc+'" onclick="sfgToggleItem(\'work\',\''+ik+'\')">' + wg.items[ik].label + '</button>');
  });
  p.push('</div>');
  p.push('<div class="sfg-sep"></div>');
  p.push('<button id="sfg-standalone-shipping" class="sfg-standalone-btn'+(SCHED_FILTER_GROUPS.shipping.on?' on':'')+" onclick=\"sfgToggleGroup('shipping')\""+'>출고</button>');
  p.push('<button id="sfg-standalone-disassembly" class="sfg-standalone-btn'+(SCHED_FILTER_GROUPS.disassembly.on?' on':'')+" onclick=\"sfgToggleGroup('disassembly')\""+'>해체</button>');
  p.push('</div>');
  el.innerHTML=p.join('');
}
