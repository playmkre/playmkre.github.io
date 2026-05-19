/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 31 id=v087-fixes-script :: OPT01 no semantic edits */

(function(){
  function renameMultiChip(){
    var chip=document.getElementById('selChip');
    if(!chip)return;
    chip.title='멀티 필터';
    chip.innerHTML='<span class="fchip-check">✓</span>멀티';
  }
  function normalizeFilterControlWidths(){
    var specs={'fg-equip':'86px','fg-type':'86px','fg-model':'96px','fg-batch':'96px','fg-machine':'96px'};
    Object.keys(specs).forEach(function(id){
      var fg=document.getElementById(id);if(!fg)return;
      var w=specs[id];
      fg.querySelectorAll('select.f-sel,.ms-btn').forEach(function(el){el.style.width=w;el.style.minWidth=w;el.style.maxWidth=w;el.style.flexBasis=w;el.style.boxSizing='border-box';});
    });
  }
  function wrap(name){
    var fn=window[name];
    if(typeof fn!=='function'||fn._v087Wrapped)return;
    var wrapped=function(){
      var out=fn.apply(this,arguments);
      setTimeout(function(){renameMultiChip();normalizeFilterControlWidths();},0);
      setTimeout(normalizeFilterControlWidths,80);
      return out;
    };
    wrapped._v087Wrapped=true;
    window[name]=wrapped;
  }
  function init(){
    renameMultiChip();
    normalizeFilterControlWidths();
    wrap('buildMsFilters');
    wrap('restoreSingleFilters');
    wrap('onSelModeToggle');
    wrap('populateGvFilters');
    wrap('viewCrossFilter');
    wrap('onGvFilter');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,200);setTimeout(init,800);setTimeout(init,1500);
})();
