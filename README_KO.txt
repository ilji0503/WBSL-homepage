WBSL Board/Gallery + 사진 자르기 + 전체 로고 통일 업데이트

1) Supabase > SQL Editor에서 NOTICE_GALLERY_MIGRATION.sql 전체를 한 번 실행하세요.
   - 기존 데이터는 삭제되지 않습니다.
   - 이미 실행했어도 다시 실행해도 안전합니다.

2) GitHub 저장소에서 아래 3개 파일을 같은 이름으로 덮어쓰세요.
   - admin.html
   - board.html
   - style.css

3) GitHub Actions의 Pages 배포가 초록색이 된 뒤 Ctrl + Shift + R로 새로고침하세요.

반영 내용
- Board 설명 문구 삭제
- Board: 전체 / 수상 / 연구실 활동 / 외부 활동
- Board 사진: 4:3 자르기 후 저장
- Member 사진: 1:1 자르기 후 저장
- Main Slider 사진: 16:9 자르기 후 저장
- Home / Professor / Research / Publication / People / Board / Contact 상단 로고 통일
- 모든 공개 페이지 Footer 로고도 새 칩 로고로 통일
