WBSL 학생 활동기간 + 메인 슬라이드 수정본

[변경 내용]
1. 관리자 Members에 시작 연월 / 종료 연월 추가
   - 종료 연월을 비우면 People 페이지에 Present로 표시됩니다.
2. People 페이지에 예: 2024.03 – Present 형태로 활동 기간 표시
3. 홈 메인 슬라이드 사진 영역 확대
4. 메인 슬라이드 사진 위의 Research Highlight / 제목 / 설명 문구 제거
5. Main Slider의 Title은 관리용 이름으로만 사용

[적용 순서]
1. Supabase → SQL Editor → New query
2. MEMBER_PERIOD_MIGRATION.sql 내용을 붙여넣고 Run
3. GitHub WBSL-homepage 저장소에서 아래 7개 파일을 같은 이름으로 덮어쓰기
   - admin.html
   - admin.js
   - admin.css
   - index.html
   - people.html
   - script.js
   - style.css
4. supabase-config.js는 건드리지 마세요.
5. GitHub Actions의 pages build and deployment가 초록색이 된 뒤 새로고침

[확인 주소]
관리자: https://ilji0503.github.io/WBSL-homepage/admin.html?v=member1
홈: https://ilji0503.github.io/WBSL-homepage/index.html?v=member1
People: https://ilji0503.github.io/WBSL-homepage/people.html?v=member1
