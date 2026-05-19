/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 34 id=q08b-quality-ui-recheck-js :: OPT01 no semantic edits */

(function(){
  var VERSION='Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN';
  try{ document.title=document.title.replace(/Q_REBUILD_08B_QUALITY_MAIN_TAB_PURPOSE_AND_LAYOUT_REPAIR/g, VERSION); }catch(e){}
  function q08bHardenQualityDom(){
    try{
      var p=document.getElementById('page-quality-main'); if(!p) return;
      var badDetail=document.getElementById('qmain-panel-detail');
      if(badDetail){ badDetail.style.display='none'; badDetail.setAttribute('aria-hidden','true'); }
      var badge=document.getElementById('qmain-badge');
      if(badge){ badge.style.background='var(--sf2)'; badge.style.border='1px solid var(--bd)'; badge.style.color='var(--ts)'; }
      var issueShell=p.querySelector('.q-issue-layout-shell');
      var issueContent=document.getElementById('qmain-issues-content');
      var issueEmpty=document.getElementById('qmain-issues-empty');
      var detail=document.getElementById('qmain-issues-detail-panel');
      if(issueShell && issueContent && !detail){
        detail=document.createElement('aside');
        detail.id='qmain-issues-detail-panel'; detail.className='q-issue-detail-shell';
        detail.innerHTML='<div class="q-detail-title">선택 이슈 상세</div><div class="q-detail-empty">이슈를 선택하면 상세 정보, 원본 Raw row, 이미지/증빙, 조치 이력이 표시됩니다.</div>';
        issueShell.appendChild(detail);
      }
      p.querySelectorAll('button,label').forEach(function(el){
        var txt=(el.textContent||'').trim();
        if(/다시s*업로드/.test(txt)){ el.classList.add('q-btn-reupload'); }
        if(/초기화|리셋/.test(txt)){ el.classList.add('q-btn-reset-upload'); }
      });
      p.querySelectorAll('[style]').forEach(function(el){
        var st=el.getAttribute('style')||'';
        if(/backgrounds*:s*(#fff|white)/i.test(st)){
          el.style.background='var(--sf)'; el.style.color='var(--tp)'; el.style.borderColor='var(--bd)';
        }
      });
    }catch(e){ console.warn('[08B quality harden]',e); }
  }
  window.q08bHardenQualityDom=q08bHardenQualityDom;
  var _nav=typeof nav==='function'?nav:null;
  if(_nav && !_nav.__q08bQualityReviewed){
    // [STEP02] nav-wrap neutralized; q08bHardenQualityDom call merged into odiNavAfterRenderDispatcher (quality branch)
    try { nav.__q08bQualityReviewed=true; } catch(_e){}
  }
  var _switch=typeof switchQMain==='function'?switchQMain:null;
  if(_switch && !_switch.__q08bQualityReviewed){
    switchQMain=function(tab,btn){ var r=_switch.apply(this,arguments); setTimeout(q08bHardenQualityDom,30); return r; };
    switchQMain.__q08bQualityReviewed=true;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',q08bHardenQualityDom); else q08bHardenQualityDom();
})();
