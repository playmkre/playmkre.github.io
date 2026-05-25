/* TechSysLab temporary client-side access gate
 * Purpose: temporary visual gate for GitHub Pages static frontend.
 * Security note: this is not server-grade authentication. Do not store sensitive data in static assets.
 */
(function(){
  'use strict';
  var REQUIRED_USER = 'superadmin';
  var REQUIRED_PASSWORD = 'Temp@2026!';
  var STORAGE_KEY = 'techsyslab.tempAccess.v1';
  var OVERLAY_ID = 'tsl-temp-login-overlay';

  function safeGet(key){ try { return sessionStorage.getItem(key); } catch(e){ return null; } }
  function safeSet(key, value){ try { sessionStorage.setItem(key, value); } catch(e){} }
  function safeRemove(key){ try { sessionStorage.removeItem(key); } catch(e){} }
  function qs(name){ try { return new URLSearchParams(location.search).get(name); } catch(e){ return null; } }

  if (qs('logout') === '1') {
    safeRemove(STORAGE_KEY);
    try { history.replaceState(null, document.title, location.pathname + location.hash); } catch(e){}
  }

  function isUnlocked(){ return safeGet(STORAGE_KEY) === '1'; }

  function unlock(){
    safeSet(STORAGE_KEY, '1');
    document.documentElement.classList.remove('tsl-auth-pending');
    document.documentElement.classList.add('tsl-auth-unlocked');
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.style.display = 'none';
  }

  function lock(){
    document.documentElement.classList.remove('tsl-auth-unlocked');
    document.documentElement.classList.add('tsl-auth-pending');
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.style.display = 'flex';
  }

  function createOverlay(){
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.innerHTML = '' +
      '<div class="tsl-temp-login-card">' +
        '<div class="tsl-temp-login-eyebrow">TechSysLab</div>' +
        '<h1>접속 인증</h1>' +
        '<p class="tsl-temp-login-desc">승인된 사용자만 접속할 수 있습니다.</p>' +
        '<form id="tsl-temp-login-form" autocomplete="off">' +
          '<label>아이디<input id="tsl-temp-login-user" type="text" autocomplete="username" /></label>' +
          '<label>비밀번호<input id="tsl-temp-login-pass" type="password" autocomplete="current-password" /></label>' +
          '<p id="tsl-temp-login-error" class="tsl-temp-login-error" aria-live="polite"></p>' +
          '<button type="submit">로그인</button>' +
        '</form>' +
        '<p class="tsl-temp-login-note">임시 프론트 잠금입니다. 운영 데이터 보호는 서버 인증/RBAC 적용 후 확정합니다.</p>' +
      '</div>';
    document.body.insertBefore(overlay, document.body.firstChild);
    return overlay;
  }

  function bindGate(){
    var overlay = document.getElementById(OVERLAY_ID) || createOverlay();
    if (overlay.getAttribute('data-bound') === '1') return;
    overlay.setAttribute('data-bound', '1');

    var form = document.getElementById('tsl-temp-login-form');
    var user = document.getElementById('tsl-temp-login-user');
    var pass = document.getElementById('tsl-temp-login-pass');
    var error = document.getElementById('tsl-temp-login-error');
    if (!form || !user || !pass || !error) return;

    user.value = '';
    pass.value = '';
    setTimeout(function(){ try { user.focus(); } catch(e){} }, 0);

    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var u = (user.value || '').trim();
      var p = pass.value || '';
      if (u === REQUIRED_USER && p === REQUIRED_PASSWORD) {
        error.textContent = '';
        unlock();
        return;
      }
      error.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
      pass.value = '';
      pass.focus();
    });
  }

  function init(){
    if (isUnlocked()) {
      unlock();
    } else {
      lock();
      bindGate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
