# ODI WEB DEPLOY v1.1 USER/ADMIN BRIDGE SOFT CONNECT

## 목적

이 패키지는 사용자 포털(`/index.html`)과 관리자 포털(`/admin/index.html`)을 하나의 웹사이트 안에서 분리 유지하면서 `odi.v1.*` localStorage 계약으로 연결하는 분리형 통합구조입니다.

## 포함 구조

```text
/
  index.html          # 사용자 포털
  assets/             # 사용자 포털 CSS/JS/media
  admin/index.html    # 관리자 포털
  docs/
  reports/
```

통합 홈, app-shell, tools 폴더, iframe 런처는 포함하지 않습니다.

## v1.1 연결 범위

- 사용자 포털: 관리자 Store key 읽기, Bridge 상태 배지, 메뉴/데이터 준비 상태 미리보기
- 관리자 포털: User Bridge Contract 패널 표시, key 상태 진단
- 아직 미적용: 메뉴 강제 숨김, 권한 차단, route guard, 서버 로그인

## 업로드

운영에 필요한 최소 파일:

```text
/index.html
/assets/
/admin/index.html
```

`docs/`, `reports/`는 검수용입니다.
