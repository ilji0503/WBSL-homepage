WBSL 최종 정리 패키지

이번 패키지에 포함된 정리
- 모든 HTML에 WBSL 컬러칩 favicon 적용
  → 브라우저 탭 / 북마크에서 wbsl_logo1 사용
- Lab Meeting 페이지의
  "실제 PPT/PDF 파일은 Google Drive에 저장됩니다. 공유 권한이 있는 계정만 열람할 수 있습니다."
  문구 삭제
- Contact의 Send Email / Call Lab 버튼 삭제
- Contact의 WBSL 로고 지도 마커 유지
- Header = wbsl_logo1 / Footer = wbsl_logo2 유지
- 남색 page-banner 높이 약 25% 축소, 글씨 크기 유지
- Home Updates 카드 디자인 유지
- Publication 날짜/영문/한글 제목 및 컴팩트 디자인 유지
- Board 포스터 분리 + 일반 활동 4:3 + 페이지네이션 구조 유지
- Lab Meeting 기능 유지

GitHub에 덮어쓸 파일
- index.html
- professor.html
- research.html
- publication.html
- people.html
- board.html
- board-detail.html
- contact.html
- labmeeting.html
- admin.html
- style.css
- script.js
- admin.js

중요
- assets/wbsl_logo1.png
- assets/wbsl_logo2.png
는 기존 GitHub assets 폴더에 그대로 두면 됩니다.

이번 수정 때문에 Supabase SQL을 새로 실행할 필요는 없습니다.
