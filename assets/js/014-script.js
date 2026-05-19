/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 14 id=(none) :: OPT01 no semantic edits */

          (function(){
            var NAV_TARGETS=['dashboard','schedule','equip-status','team-overview','prod-overview','prod-headcount','prod-process','quality-dash','quality-main','quality-analysis','quality-action','quality-images','quality-master','data-equip','download','test-management','change-log','system-guide','notification','menu-admin'];
            var cont=document.getElementById('test-nav-smoke');
            if(!cont)return;
            NAV_TARGETS.forEach(function(k){
              var d=document.createElement('div');
              d.style.display='flex';d.style.gap='6px';d.style.alignItems='center';
              var btn=document.createElement('button');
              btn.textContent='nav: '+k;
              btn.style.cssText='font-size:9px;padding:1px 6px;border-radius:4px;border:1px solid var(--bd);background:var(--sf);color:var(--ts);cursor:pointer';
              btn.onclick=function(){
                try{nav(k);btn.style.background='rgba(34,197,94,.15)';btn.style.borderColor='#22c55e';}
                catch(e){btn.style.background='rgba(239,68,68,.15)';btn.style.borderColor='#ef4444';}
              };
              d.appendChild(btn);cont.appendChild(d);
            });
          })();
        