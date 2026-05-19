# 관리자 포털 배포 위치

이 폴더의 `index.html`은 `ODI_ADMIN_CONSOLE_IMPL_v0.9_CODEMASTER_DATA_READY.html` 기반 관리자 포털입니다.

- 사용자 포털: `/index.html`
- 관리자 포털: `/admin/index.html`
- 사용자 페이지 상단의 `관리자 포털` 버튼은 `admin/index.html`로 이동합니다.
- 관리자 페이지 상단의 `사용자 포털` 버튼은 `../index.html`로 이동합니다.

향후 관리자만 수정할 경우, asset 구조가 변경되지 않는 한 `/admin/index.html`만 교체하면 됩니다.
