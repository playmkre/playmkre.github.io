# ODI 사용자/관리자 웹 배포 v1.0 운영 후보

## 구조

```text
/
  index.html              # 사용자 포털
  assets/                 # 사용자 포털 CSS/JS/media
  admin/
    index.html            # 관리자 포털
  docs/                   # 배포 문서
```

## 운영 원칙

- 통합 홈, app-shell, iframe 런처는 포함하지 않습니다.
- `/index.html`은 사용자 포털입니다.
- `/admin/index.html`은 관리자 포털입니다.
- 사용자 포털만 수정하면 `/index.html`과 필요한 `/assets`만 업로드합니다.
- 관리자 포털만 수정하면 `/admin/index.html`만 업로드합니다.
- 관리자 포털은 `odi.v1.*` localStorage를 쓰는 producer입니다.
- 사용자 포털은 read-only bridge로 `odi.v1.*`를 읽는 consumer입니다.

## 부분 업로드 기준

| 변경 유형 | 업로드 대상 |
|---|---|
| 사용자 HTML만 변경 | `/index.html` |
| 사용자 CSS/JS/media 변경 | `/index.html` + 변경된 `/assets/...` |
| 관리자 HTML만 변경 | `/admin/index.html` |
| 공통 저장 key 계약 변경 | 사용자/관리자 양쪽 검수 후 관련 파일 전체 |

## 금지

- 통합 홈 재생성 금지
- 사용자/관리자 HTML 물리 병합 금지
- 예시 seed 데이터 자동 삽입 금지
- 사용자 포털에서 관리자 key 쓰기 금지
