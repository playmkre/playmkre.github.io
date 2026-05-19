/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 39 id=(none) :: OPT01 no semantic edits */


function _shellKpi(id, val, label, sub, color) {
  var e = document.getElementById(id);
  if (!e) return;
  var vEl = e.querySelector('.skv');
  var sEl = e.querySelector('.sks');
  if (vEl) { vEl.textContent = val; if (color) vEl.className = 'skv ' + color; }
  if (sEl && sub) sEl.textContent = sub;
}
function _shellRows(tbodyId, rows, emptyMsg) {
  var tb = document.getElementById(tbodyId);
  if (!tb) return;
  tb.innerHTML = rows.length
    ? rows.map(function(r){ return '<tr>' + r.map(function(c){return '<td>'+c+'</td>';}).join('') + '</tr>'; }).join('')
    : '<tr><td colspan="20" style="text-align:center;color:var(--tm);padding:18px">' + (emptyMsg||'데이터 없음') + '</td></tr>';
}

