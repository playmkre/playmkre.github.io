# TechSysLab 임시 접속 잠금 패치

이 패치는 GitHub Pages 정적 웹에 임시 아이디/비밀번호 게이트를 추가합니다.

## 기본 임시 계정

- 아이디: `superadmin`
- 비밀번호: `Temp@2026!`

## 적용 범위

- `/index.html`
- `/admin/index.html`
- `assets/js/000-temp-access-gate.js`

## 주의

이 방식은 정적 프론트 잠금입니다. HTML/JS를 직접 볼 수 있는 사용자는 비밀번호 값을 확인할 수 있습니다. 운영용 보안은 서버 인증/RBAC 또는 Cloudflare Access로 확정해야 합니다.

## 화면 깜빡임 방지

`<head>` 최상단에서 `tsl-auth-pending` 클래스를 먼저 걸고, 인증 전에는 body 하위 요소를 숨기므로 웹페이지가 순간적으로 보인 뒤 로그인창이 뜨는 현상을 줄입니다.
