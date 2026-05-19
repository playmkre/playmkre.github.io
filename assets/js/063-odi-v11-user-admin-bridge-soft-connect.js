/* ODI v1.1 User/Admin Bridge Soft Connect
   Purpose: read admin-produced odi.v1.* keys without enforcing menu/permission changes.
   Safe mode: diagnostics + preview only. No route blocking, no hard menu removal.
*/
(function(){
  'use strict';
  var VERSION='v1.1_USER_ADMIN_BRIDGE_SOFT_CONNECT';
  var KEYS=[
    'odi.v1.users','odi.v1.teams','odi.v1.roles','odi.v1.userOverrides',
    'odi.v1.permissionMatrix','odi.v1.menuConfig','odi_menu_config','odi.v1.pageStatus',
    'odi.v1.featureFlags','odi.v1.systemSettings','odi.v1.downloadRequests',
    'odi.v1.downloadLog','odi.v1.auditLog','odi.v1.codeMaster','odi.v1.dataReadiness','odi.v1.dataReadinessHistory'
  ];
  function safeParse(raw){
    if(raw===null || raw===undefined || raw==='') return {state:'EMPTY', value:null, count:0};
    try{
      var v=JSON.parse(raw); var c=0;
      if(Array.isArray(v)) c=v.length; else if(v && typeof v==='object') c=Object.keys(v).length; else c=1;
      return {state:'READY', value:v, count:c};
    }catch(e){ return {state:'WARN', value:null, count:0, error:String(e&&e.message||e)}; }
  }
  function readKey(k){ return Object.assign({key:k}, safeParse(localStorage.getItem(k))); }
  function diagnostics(){
    var rows=KEYS.map(readKey);
    var ready=rows.filter(function(r){return r.state==='READY';}).length;
    var warn=rows.filter(function(r){return r.state==='WARN';}).length;
    var empty=rows.filter(function(r){return r.state==='EMPTY';}).length;
    var core=['odi.v1.menuConfig','odi.v1.pageStatus','odi.v1.permissionMatrix','odi.v1.auditLog','odi.v1.codeMaster','odi.v1.dataReadiness'];
    var coreReady=core.filter(function(k){return readKey(k).state==='READY';}).length;
    var state=warn?'WARN':(ready?'READY':'EMPTY');
    return {version:VERSION,state:state,ready:ready,warn:warn,empty:empty,coreReady:coreReady,coreTotal:core.length,rows:rows,checkedAt:new Date().toISOString()};
  }
  function menuPreview(){
    var newer=readKey('odi.v1.menuConfig');
    var legacy=readKey('odi_menu_config');
    var src=newer.state==='READY'?newer:(legacy.state==='READY'?legacy:null);
    if(!src) return {state:'EMPTY', source:null, count:0, visibleCount:0, items:[]};
    var items=Array.isArray(src.value)?src.value:[];
    var visible=items.filter(function(x){return x && x.visible!==false && x.status!=='HIDDEN';});
    return {state:'READY', source:src.key, count:items.length, visibleCount:visible.length, items:items.slice(0,50)};
  }
  function dataReadinessPreview(){
    var r=readKey('odi.v1.dataReadiness');
    if(r.state!=='READY') return {state:r.state, summary:'관리자 데이터 준비 상태 없음'};
    var v=r.value||{};
    return {state:'READY', dashboardReadyCandidate:!!v.dashboardReadyCandidate, dashboardReadyApproved:!!v.dashboardReadyApproved, warnings:Array.isArray(v.warnings)?v.warnings.length:0, errors:Array.isArray(v.errors)?v.errors.length:0, lastUploadAt:v.lastUploadAt||'', approvedAt:v.approvedAt||''};
  }
  function ensureStyle(){
    if(document.getElementById('odi-v11-bridge-style')) return;
    var st=document.createElement('style'); st.id='odi-v11-bridge-style';
    st.textContent='.odi-v11-bridge{position:fixed;left:14px;bottom:14px;z-index:9998;background:var(--sf,#161b22);color:var(--tp,#e6edf3);border:1px solid var(--bd,rgba(255,255,255,.12));border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.35);font-size:11px;max-width:360px;overflow:hidden}.odi-v11-bridge.min .odi-v11-body{display:none}.odi-v11-head{display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;user-select:none}.odi-v11-dot{width:8px;height:8px;border-radius:50%;background:#8b949e;flex-shrink:0}.odi-v11-ready .odi-v11-dot{background:#3fb950}.odi-v11-warn .odi-v11-dot{background:#d29922}.odi-v11-empty .odi-v11-dot{background:#8b949e}.odi-v11-title{font-weight:800;letter-spacing:.2px;flex:1}.odi-v11-body{border-top:1px solid var(--bd,rgba(255,255,255,.08));padding:9px 10px;line-height:1.55;color:var(--ts,#8b949e)}.odi-v11-row{display:flex;justify-content:space-between;gap:12px}.odi-v11-k{color:var(--tm,#6b7280)}.odi-v11-v{color:var(--tp,#e6edf3);font-weight:700}.odi-v11-note{margin-top:6px;color:var(--tm,#6b7280)}';
    document.head.appendChild(st);
  }
  function renderBadge(){
    ensureStyle();
    var d=diagnostics(); var mp=menuPreview(); var rd=dataReadinessPreview();
    var el=document.getElementById('odi-v11-bridge');
    if(!el){ el=document.createElement('div'); el.id='odi-v11-bridge'; document.body.appendChild(el); }
    el.className='odi-v11-bridge odi-v11-'+d.state.toLowerCase()+' min';
    el.innerHTML='<div class="odi-v11-head" title="클릭하여 펼치기"><span class="odi-v11-dot"></span><span class="odi-v11-title">Bridge '+d.state+'</span><span>'+d.coreReady+'/'+d.coreTotal+'</span></div><div class="odi-v11-body"><div class="odi-v11-row"><span class="odi-v11-k">ready/warn/empty</span><span class="odi-v11-v">'+d.ready+' / '+d.warn+' / '+d.empty+'</span></div><div class="odi-v11-row"><span class="odi-v11-k">menu</span><span class="odi-v11-v">'+mp.count+'개 · visible '+mp.visibleCount+'</span></div><div class="odi-v11-row"><span class="odi-v11-k">dashboard ready</span><span class="odi-v11-v">'+(rd.dashboardReadyApproved?'APPROVED':(rd.dashboardReadyCandidate?'CANDIDATE':'-'))+'</span></div><div class="odi-v11-note">v1.1은 읽기/미리보기 전용입니다. 메뉴 숨김·권한 차단은 적용하지 않습니다.</div></div>';
    el.querySelector('.odi-v11-head').onclick=function(){el.classList.toggle('min');};
  }
  window.ODIBridgeSoftConnect={version:VERSION, keys:KEYS, diagnostics:diagnostics, menuPreview:menuPreview, dataReadinessPreview:dataReadinessPreview, render:renderBadge};
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(renderBadge, 80); });
  window.addEventListener('storage', function(e){ if(KEYS.indexOf(e.key)>=0) renderBadge(); });
})();
