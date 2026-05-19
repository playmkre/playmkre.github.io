# ODI 사용자 포털 웹 배포 구조 v0.1

## 목적

이 패키지는 사용자 포털을 웹 서버 루트에 바로 업로드할 수 있는 구조입니다. 통합 홈, app-shell, 개발용 tools, 관리자 실제 파일은 포함하지 않습니다.

## 핵심 구조

```text
/
  index.html                 # 사용자 포털 실제 진입점
  assets/                    # 사용자 포털 CSS/JS/media 고정 자산
    css/
    js/
    media/
  admin/
    index.html               # 관리자 포털 자리표시자. 추후 실제 관리자 파일로 교체
  docs/
```

## 배포 방법

1. 이 폴더의 내용물을 웹 서버 루트에 업로드합니다.
2. 브라우저에서 `/index.html` 또는 도메인 루트로 접속합니다.
3. 사용자 포털 상단의 `관리자 포털` 버튼은 `/admin/index.html`로 이동합니다.

## 향후 사용자 페이지만 수정할 때

아래 조건이면 `index.html`만 교체해도 됩니다.

- `assets/css` 파일명과 경로가 바뀌지 않음
- `assets/js` 파일명과 경로가 바뀌지 않음
- `assets/media` 파일명과 경로가 바뀌지 않음
- HTML 마크업, 탑바, 문구, 페이지 구조만 변경됨

CSS/JS/media 내용이나 파일명이 바뀌면 해당 asset도 같이 업로드해야 합니다.

## 향후 관리자 페이지를 올릴 때

실제 관리자 콘솔이 완성되면 아래 파일만 교체합니다.

```text
admin/index.html
```

관리자 전용 assets가 생기면 다음 구조를 추가합니다.

```text
admin/assets/css/
admin/assets/js/
admin/assets/media/
```

## 금지

- 통합 홈 index를 다시 만들지 않습니다.
- user/admin을 한 HTML로 물리 병합하지 않습니다.
- 사용자 포털 assets를 관리자 작업 중 임의 수정하지 않습니다.
