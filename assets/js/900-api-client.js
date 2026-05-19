/* TechSysLab / ODI API Client Phase 01
 * Purpose: connect the existing static GitHub Pages portal to the future FastAPI server.
 * This file is intentionally read-only for UI data. It must not hide menus, block routes,
 * or overwrite legacy localStorage bridge data.
 */
(function () {
  'use strict';

  var DEFAULT_API_BASE = 'https://api.techsyslab.com';
  var STORAGE_KEY = 'techsyslab.api.base';
  var TIMEOUT_MS = 8000;

  function normalizeBase(value) {
    var raw = String(value || '').trim();
    if (!raw) return DEFAULT_API_BASE;
    return raw.replace(/\/+$/, '');
  }

  function getApiBase() {
    try {
      var configured = window.TECHSYSLAB_API_BASE || localStorage.getItem(STORAGE_KEY);
      return normalizeBase(configured);
    } catch (err) {
      return DEFAULT_API_BASE;
    }
  }

  function setApiBase(value) {
    var base = normalizeBase(value);
    window.TECHSYSLAB_API_BASE = base;
    try { localStorage.setItem(STORAGE_KEY, base); } catch (err) {}
    return base;
  }

  function withTimeout(promise, timeoutMs) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs || TIMEOUT_MS);
    return {
      signal: controller.signal,
      run: function (executor) {
        return executor(controller.signal).finally(function () { clearTimeout(timer); });
      }
    };
  }

  async function request(path, options) {
    var opts = options || {};
    var targetPath = String(path || '');
    if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
    var url = getApiBase() + targetPath;
    var timeout = withTimeout(null, opts.timeoutMs || TIMEOUT_MS);
    return timeout.run(async function (signal) {
      var res = await fetch(url, {
        method: opts.method || 'GET',
        headers: Object.assign({ 'Accept': 'application/json' }, opts.headers || {}),
        body: opts.body,
        credentials: opts.credentials || 'omit',
        signal: signal
      });
      var text = await res.text();
      var data = null;
      if (text) {
        try { data = JSON.parse(text); }
        catch (err) { data = { raw: text, parseError: String(err && err.message || err) }; }
      }
      if (!res.ok) {
        var error = new Error('API error ' + res.status + ' for ' + targetPath);
        error.status = res.status;
        error.data = data;
        error.url = url;
        throw error;
      }
      return data;
    });
  }

  function get(path, options) { return request(path, Object.assign({}, options || {}, { method: 'GET' })); }
  function postJson(path, body, options) {
    return request(path, Object.assign({}, options || {}, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, (options && options.headers) || {}),
      body: JSON.stringify(body || {})
    }));
  }

  window.TechSysLabApiClient = {
    version: 'API_SERVER_EXPANSION_PHASE_01',
    storageKey: STORAGE_KEY,
    defaultApiBase: DEFAULT_API_BASE,
    getApiBase: getApiBase,
    setApiBase: setApiBase,
    request: request,
    get: get,
    postJson: postJson
  };

  window.techsyslabApiGet = get;
  window.techsyslabApiPostJson = postJson;
})();
