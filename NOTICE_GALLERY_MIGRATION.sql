-- WBSL Board / Gallery 날짜·기간·설명 필드 추가
-- Supabase > SQL Editor 에서 한 번만 실행하세요.
-- 기존 데이터는 삭제되지 않습니다.

alter table public.news
  add column if not exists event_start date,
  add column if not exists event_end date,
  add column if not exists description text not null default '';

alter table public.news
  drop constraint if exists news_event_period_check;

alter table public.news
  add constraint news_event_period_check
  check (event_end is null or event_start is null or event_end >= event_start);

comment on column public.news.event_start is 'Board/Gallery activity start date';
comment on column public.news.event_end is 'Board/Gallery activity end date. NULL means single-day/no end date';
comment on column public.news.description is 'Short Board/Gallery description';

-- 기존 Category를 새 분류에 최대한 맞춰 정리합니다.
update public.news
set category = case
  when lower(category) like '%award%' or category like '%수상%' then '수상'
  when lower(category) like '%conference%' or lower(category) like '%seminar%'
       or category like '%학회%' or category like '%세미나%' or category like '%외부%' then '외부 활동'
  when lower(category) like '%lab%' or category like '%연구실%' then '연구실 활동'
  else category
end
where category is not null;
