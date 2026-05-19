# 업로드 체크리스트

## 최초 업로드

- [ ] `index.html` 업로드
- [ ] `assets/` 전체 업로드
- [ ] `admin/index.html` 업로드 또는 추후 관리자 파일 업로드 예정 확인
- [ ] `docs/` 필요 시 업로드

## 사용자 포털 HTML만 수정한 경우

- [ ] `index.html`만 교체
- [ ] asset 파일명/경로 변경 없음 확인
- [ ] 브라우저 강력 새로고침

## 사용자 포털 CSS/JS/media 수정한 경우

- [ ] `index.html` 교체
- [ ] 변경된 asset 파일 같이 교체
- [ ] 캐시 문제 발생 시 version query 또는 파일명 version 검토

## 관리자 포털 수정한 경우

- [ ] `admin/index.html` 교체
- [ ] 관리자 전용 asset이 있으면 `admin/assets/`도 같이 교체
- [ ] 사용자 포털 `index.html`은 건드리지 않음
