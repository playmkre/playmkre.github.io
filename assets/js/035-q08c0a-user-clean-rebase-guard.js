/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 35 id=q08c0a-user-clean-rebase-guard :: OPT01 no semantic edits */

(function(){
  var USER_FORBIDDEN_ROUTES={
    'test-management':1,'change-log':1,'system-guide':1,'notification':1,
    'menu-admin':1,'master-data-admin':1,'export-center':1,
    'smoke-check':1,'regression-check':1,'permission-guide':1,'user-role-guide':1,
    'dev-audit':1,'file-metrics':1
  };
  var USER_ALLOWED_QUALITY={
    'quality-main':1,'quality-dash':1,'quality-analysis':1,'quality-action':1,'quality-images':1,'quality-master':1
  };
  window.ODI_USER_FORBIDDEN_ROUTES=USER_FORBIDDEN_ROUTES;
  function isForbiddenRoute(k){return !!USER_FORBIDDEN_ROUTES[k];}
  function removeForbiddenSidebarItems(){
    try{
      document.querySelectorAll('.sb-item').forEach(function(item){
        var oc=item.getAttribute('onclick')||'';
        Object.keys(USER_FORBIDDEN_ROUTES).forEach(function(k){
          if(oc.indexOf("nav('"+k+"')")>=0 || oc.indexOf('nav("'+k+'")')>=0){ item.remove(); }
        });
      });
      // REVIEWED_FIXED_V4_SAFE: 빈 그룹 정리 과정에서 #sidebar 자체가 제거되는 회귀가 발생할 수 있어
      // 사용자 포털에서는 그룹/부모 삭제를 수행하지 않는다. 필요한 항목만 위에서 item.remove()로 숨긴다.
      var btn=document.getElementById('dev-testlog-btn'); if(btn) btn.style.display='none';
    }catch(e){console.warn('[08C0A user clean] sidebar hardening failed',e);}
  }
  function ensureQualityMenuVisible(){
    try{
      var labels=['quality-main','quality-dash','quality-analysis','quality-action','quality-images','quality-master'];
      labels.forEach(function(k){
        var pid=(window.PM||{})[k];
        if(pid){ var el=document.getElementById(pid); if(el) el.dataset.userBusinessPage='quality'; }
      });
    }catch(e){}
  }
  var originalNav=window.nav;
  if(typeof originalNav==='function' && !originalNav.__q08c0aUserCleanWrapped){
    // [STEP02] nav-wrap neutralized; forbidden-route guard moved into base nav() (step 1 of new nav structure)
    try { originalNav.__q08c0aUserCleanWrapped=true; } catch(_e){}
  }
  document.addEventListener('DOMContentLoaded',function(){removeForbiddenSidebarItems();ensureQualityMenuVisible();});
  setTimeout(function(){removeForbiddenSidebarItems();ensureQualityMenuVisible();},0);
  setTimeout(function(){removeForbiddenSidebarItems();ensureQualityMenuVisible();},400);
})();
