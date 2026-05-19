/*
  ODI Admin Read-only Bridge Diagnostics - OPT09.
  This script does not apply menu/permission changes. It only checks read-only bridge availability.
*/
(function(){
  'use strict';
  var VERSION = 'OPT09_READONLY_BRIDGE_DIAGNOSTIC_INSERT';
  function q(sel){ return document.querySelector(sel); }
  function countFound(diag){
    if (!diag || !diag.keys) return 0;
    return Object.keys(diag.keys).reduce(function(acc, key){ return acc + (diag.keys[key].found ? 1 : 0); }, 0);
  }
  function countParseErrors(diag){
    if (!diag || !diag.keys) return 0;
    return Object.keys(diag.keys).reduce(function(acc, key){ return acc + (diag.keys[key].parseOk ? 0 : 1); }, 0);
  }
  function createPanel(diag){
    var panel = document.createElement('div');
    panel.id = 'odi-opt09-readonly-bridge-diagnostic';
    panel.setAttribute('data-opt09', 'readonly-bridge-diagnostic');
    var found = countFound(diag);
    var parseErrors = countParseErrors(diag);
    var state = parseErrors ? 'WARN' : (found ? 'READY' : 'EMPTY');
    var color = parseErrors ? 'var(--am,#d29922)' : (found ? 'var(--gr,#3fb950)' : 'var(--ts,#8b949e)');
    panel.style.cssText = [
      'position:fixed', 'right:12px', 'bottom:12px', 'z-index:9500',
      'max-width:360px', 'font-size:10.5px', 'line-height:1.45',
      'background:var(--sf,#161b22)', 'color:var(--ts,#8b949e)',
      'border:1px solid var(--bd,rgba(255,255,255,.08))', 'border-left:3px solid '+color,
      'border-radius:8px', 'padding:8px 10px', 'box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.35))',
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'opacity:.88'
    ].join(';');
    panel.innerHTML = ''+
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">'+
        '<b style="color:'+color+'">OPT09 Bridge '+state+'</b>'+
        '<button type="button" aria-label="close bridge diagnostic" style="margin-left:auto;background:transparent;border:0;color:var(--tm,#484f58);cursor:pointer;font-size:13px">×</button>'+
      '</div>'+
      '<div>read-only admin keys: <b style="color:var(--tp,#e6edf3)">'+found+'</b> / '+Object.keys((diag && diag.keys) || {}).length+'</div>'+
      '<div>parse errors: <b style="color:'+(parseErrors ? 'var(--am,#d29922)' : 'var(--gr,#3fb950)')+'">'+parseErrors+'</b></div>'+
      '<div style="margin-top:2px;color:var(--tm,#484f58)">No menu/permission mutation applied.</div>';
    panel.querySelector('button').onclick = function(){ panel.remove(); };
    return panel;
  }
  function runDiagnostics(){
    var reader = window.ODIStoreReader;
    var diag = reader && typeof reader.diagnostics === 'function' ? reader.diagnostics() : { version:VERSION, keys:{} };
    var found = countFound(diag);
    var parseErrors = countParseErrors(diag);
    window.ODIAdminBridgeDiagnostics = Object.freeze({
      VERSION: VERSION,
      lastRunAt: new Date().toISOString(),
      foundKeyCount: found,
      parseErrorCount: parseErrors,
      diagnostics: diag
    });
    try { console.info('[OPT09][ReadOnlyBridge]', window.ODIAdminBridgeDiagnostics); } catch(e) {}
    if (!q('#odi-opt09-readonly-bridge-diagnostic')) {
      document.body.appendChild(createPanel(diag));
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostics, { once:true });
  } else {
    setTimeout(runDiagnostics, 0);
  }
})();
