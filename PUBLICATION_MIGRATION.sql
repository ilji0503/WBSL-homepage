-- ============================================================
-- WBSL Publications: 발행일 + 한글 제목
-- Supabase > SQL Editor에서 전체 실행
-- 기존 논문 데이터는 삭제하지 않습니다.
-- ============================================================

alter table public.publications
  add column if not exists publish_date date,
  add column if not exists title_ko text not null default '';

update public.publications
set title_ko = ''
where title_ko is null;

notify pgrst, 'reload schema';

select
  'publications ready' as status,
  count(*) as current_rows
from public.publications;
