# ODI WEB DEPLOY v1.1 USER/ADMIN BRIDGE SOFT CONNECT REPORT

## Summary

- version: v1.1_USER_ADMIN_BRIDGE_SOFT_CONNECT
- file count: 118
- total size: 4,566,428 bytes
- user index: 151,627 bytes
- admin index: 218,352 bytes
- missing assets: 0
- JS syntax errors: 0

## Added

- `assets/js/063-odi-v11-user-admin-bridge-soft-connect.js`
- user bridge status badge and preview API: `window.ODIBridgeSoftConnect`
- admin bridge contract panel: `window.ODIAdminBridgeContract`

## Connection Scope

This package is a separated integration structure. User and admin remain separate entry points.

- `/index.html`: user portal
- `/admin/index.html`: admin portal
- localStorage `odi.v1.*`: data contract

## Safety

v1.1 is soft-connect only. It does not apply hard menu hiding, route blocking, or permission enforcement to the user portal.
