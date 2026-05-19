# ODI WEB DEPLOY v1.0 USER ADMIN OPERATING CANDIDATE 검수 보고서

## 목적

사용자 포털 웹 배포 구조 v0.1의 루트 `index.html`을 유지하고, 관리자 포털 v0.9를 `/admin/index.html`에 반영한 운영 후보 패키지입니다.

## 폴더 구조

```text
/
  index.html
  assets/
  admin/
    index.html
  docs/
```

## 통합 홈 제거 상태

- `app-shell.html`: 없음
- `tools/`: 없음
- `/user` 중첩 폴더: 없음
- 사용자/관리자 iframe 런처: 없음

## 주요 수치

| 항목 | 값 |
|---|---:|
| 전체 파일 수 | 111 |
| 전체 용량 | 4,530,810 bytes |
| 사용자 index.html | 151,475 bytes |
| 관리자 admin/index.html | 214,665 bytes |
| JS 검사 수 | 65 |
| JS 오류 수 | 0 |

## Asset 참조 검수

```json
{
  "index.html": {
    "refs": 96,
    "missing": []
  },
  "admin/index.html": {
    "refs": 0,
    "missing": []
  }
}
```

## 전환 링크 검수

```json
{
  "user_has_admin_link": true,
  "admin_has_user_link": true,
  "no_integrated_home_word_in_top_links": true
}
```

## 예시 데이터 잔여 검수

```json
{}
```

## 판단

정적 검수 기준으로 배포 구조는 정상입니다. 사용자 포털은 루트 `/index.html`, 관리자 포털은 `/admin/index.html`로 분리되어 있으며, 통합 홈과 app-shell은 포함하지 않았습니다.
