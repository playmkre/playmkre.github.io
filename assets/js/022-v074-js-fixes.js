/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 22 id=v074-js-fixes :: OPT01 no semantic edits */

(function(){
  window.toggleMsPanel = function(key){
    const panel=document.getElementById('ms-panel-'+key);
    const btn=document.getElementById('ms-btn-'+key);
    if(!panel||!btn)return;
    const isOpen=panel.classList.contains('open');
    closeAllMsPanels();
    if(isOpen)return;
    panel.classList.add('open');
    panel.style.visibility='hidden';
    panel.style.display='block';
    const r=btn.getBoundingClientRect();
    const pw=Math.max(panel.offsetWidth||136,136), ph=Math.max(panel.offsetHeight||120,80);
    let left=r.left;
    let top=r.bottom+4;
    if(left+pw>window.innerWidth-8) left=window.innerWidth-pw-8;
    if(left<8) left=8;
    if(top+ph>window.innerHeight-8) top=Math.max(8,r.top-ph-4);
    panel.style.left=left+'px';
    panel.style.top=top+'px';
    panel.style.visibility='';
    panel.style.display='';
  };
  window.closeAllMsPanels=function(){
    document.querySelectorAll('#page-schedule .ms-panel').forEach(p=>{
      p.classList.remove('open');
      p.style.left='';p.style.top='';p.style.visibility='';p.style.display='';
    });
  };
  document.addEventListener('scroll',function(){ if(typeof closeAllMsPanels==='function') closeAllMsPanels(); },true);
})();
