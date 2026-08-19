WBSL GitHub Pages 수정본
기준 저장소: ilji0503/WBSL-homepage (main)

반영 사항
1) 상단 WBSL 로고/텍스트 확대
2) Professor 페이지 Contact 버튼 우측 하단 이동
3) Career / Research Interests 제목의 긴 선 제거
   - 밝은 청록/회색 계열 배경 라벨로 변경
   - 두 블록 사이 세로 간격 축소
4) Research 페이지 남색 배너 아래 흰 여백 축소
5) Research의 “Open Lab 자료의 WBSL 영역을 기준으로...” 문장 삭제
6) 상단 Contact us 버튼 높이와 테두리 두께 축소
7) WBSL / Board / 전체 내비게이션 글꼴을 Pretendard 계열로 통일하고 굵게 조정
8) Home의 “와이드밴드갭 반도체의” 뒤 강제 줄바꿈
9) Home 우측을 3장 자동 슬라이드로 변경
   - 4.2초마다 자동 전환
   - 마우스를 올리면 일시 정지
   - 우측 상단 점 버튼으로 직접 전환 가능
10) 모바일 반응형 유지

중요: Home 슬라이드 이미지
현재는 동작 확인용 외부 이미지(Unsplash)를 사용했습니다.
실제 연구실 사진으로 바꾸려면 style.css에서 아래 세 줄의 URL만 교체하면 됩니다.
  .hero-slide.slide-1
  .hero-slide.slide-2
  .hero-slide.slide-3

People 페이지
현재 GitHub 원본처럼 OOO placeholder를 유지했습니다.
실제 Lab Member 이름/과정/연구분야 정보가 확정되면 people.html에서 바꾸는 것이 맞습니다.
임의의 인물 정보를 넣지는 않았습니다.

업로드 방법
1) 기존 저장소의 파일을 백업합니다.
2) 이 폴더의 파일/폴더를 WBSL-homepage 저장소 루트에 그대로 업로드합니다.
3) 동일 이름 파일은 Replace/Overwrite 합니다.
4) GitHub Pages 반영까지 보통 잠시 시간이 걸릴 수 있습니다.

로컬 확인
index.html을 브라우저에서 열어도 기본 화면은 확인할 수 있습니다.
GitHub Pages에 올리면 상대경로 링크가 정상 동작합니다.

[2026-08-19 compact revision]
- 메인 홈 배너 세로 여백 축소: 92/80px → 60/54px
- 메인 이미지 슬라이더 최소 높이 축소: 410px → 350px
- Hero 버튼/통계 사이 세로 간격 축소
- 하단 Footer 전체 높이 축소: 56/26px → 34/18px
- Footer WBSL / Sitemap / Lab / Contact 영역의 항목 간격과 행간 축소
- Footer 하단 copyright 영역 높이 축소
