-- WBSL Board category rename
-- 기존 '수상' 데이터를 '학술 활동'으로 변경합니다.
-- 다른 데이터는 변경하지 않습니다.

update public.news
set category = '학술 활동',
    updated_at = now()
where category = '수상';

notify pgrst, 'reload schema';

select category, count(*)
from public.news
group by category
order by category;
