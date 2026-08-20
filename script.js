const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.cssText = open
      ? ''
      : 'display:flex; position:absolute; top:86px; left:0; right:0; background:#fff; flex-direction:column; padding:20px 28px; gap:18px; border-bottom:1px solid #e2e8f2;';
  });
}

let wbslSupabase = null;

async function initSupabase() {
  try {
    const config = await import('./supabase-config.js?v=20260820-admin1');
    if (!config.SUPABASE_CONFIGURED) return null;

    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (error) {
    console.warn('[WBSL] Supabase is not configured or could not be loaded.', error);
    return null;
  }
}

function safeText(value) {
  return value == null ? '' : String(value);
}

function createTag(text, isNew = false) {
  const tag = document.createElement('span');
  tag.className = isNew ? 'tag new' : 'tag';
  tag.textContent = text;
  return tag;
}

function createLinkOrText(text, url, className) {
  const el = url ? document.createElement('a') : document.createElement('span');
  if (url) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener';
  }
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

async function loadTable(table, orderFields = []) {
  if (!wbslSupabase) return null;
  try {
    let query = wbslSupabase.from(table).select('*');
    orderFields.forEach(({ field, ascending }) => {
      query = query.order(field, { ascending });
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn(`[WBSL] Failed to load ${table}`, error);
    return null;
  }
}

function initHeroSlider() {
  const heroSlider = document.querySelector('[data-hero-slider]');
  if (!heroSlider) return;

  const slides = [...heroSlider.querySelectorAll('.hero-slide')];
  const dots = [...heroSlider.querySelectorAll('.hero-slider-dot')];
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = index;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };

  const startSlider = () => {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => {
      showSlide((current + 1) % slides.length);
    }, 4200);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startSlider();
    });
  });

  heroSlider.addEventListener('mouseenter', () => {
    if (timer) window.clearInterval(timer);
  });
  heroSlider.addEventListener('mouseleave', startSlider);

  showSlide(0);
  if (slides.length > 1) startSlider();
}

function renderDynamicSlides(slides) {
  const heroSlider = document.querySelector('[data-hero-slider]');
  if (!heroSlider || !slides || !slides.length) {
    initHeroSlider();
    return;
  }

  heroSlider.innerHTML = '';

  slides.forEach((item, index) => {
    const slide = document.createElement('div');
    slide.className = `hero-slide${index === 0 ? ' active' : ''}`;
    slide.style.backgroundImage = `url("${safeText(item.image_url).replace(/"/g, '%22')}")`;

    const copy = document.createElement('div');
    copy.className = 'hero-slide-copy';

    const kicker = document.createElement('span');
    kicker.className = 'slide-kicker';
    kicker.textContent = 'Research Highlight';

    const title = document.createElement('h3');
    title.textContent = safeText(item.title);

    copy.append(kicker, title);
    if (item.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.textContent = safeText(item.subtitle);
      copy.appendChild(subtitle);
    }

    slide.appendChild(copy);
    heroSlider.appendChild(slide);
  });

  const dots = document.createElement('div');
  dots.className = 'hero-slider-dots';
  dots.setAttribute('aria-label', '슬라이드 선택');
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `hero-slider-dot${index === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `슬라이드 ${index + 1}`);
    dots.appendChild(dot);
  });
  heroSlider.appendChild(dots);
  initHeroSlider();
}

function normalizePublications(rows) {
  return (rows || []).map((item) => ({
    ...item,
    order: item.sort_order ?? item.order ?? 0
  })).sort((a, b) => (b.year - a.year) || ((b.order || 0) - (a.order || 0)));
}

function normalizeNews(rows) {
  return (rows || []).map((item) => ({
    ...item,
    order: item.sort_order ?? item.order ?? 0,
    image: item.image_url || item.image || ''
  })).sort((a, b) => (b.year - a.year) || ((b.order || 0) - (a.order || 0)));
}

function renderHomeNews(news) {
  const target = document.getElementById('home-news-list');
  if (!target) return;
  target.innerHTML = '';

  if (!news.length) {
    target.innerHTML = '<p class="empty-state">등록된 소식이 없습니다.</p>';
    return;
  }

  news.slice(0, 3).forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'news-item';
    row.appendChild(createTag(index === 0 ? 'NEW' : String(item.year), index === 0));

    const p = document.createElement('p');
    if (item.category) {
      const category = document.createElement('b');
      category.textContent = `${item.category} · `;
      p.appendChild(category);
    }
    p.appendChild(createLinkOrText(item.title, item.url));
    row.appendChild(p);
    target.appendChild(row);
  });
}

function renderHomePublications(publications) {
  const target = document.getElementById('home-publication-list');
  if (!target) return;
  target.innerHTML = '';

  if (!publications.length) {
    target.innerHTML = '<p class="empty-state">등록된 논문이 없습니다.</p>';
    return;
  }

  publications.slice(0, 3).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'news-item';
    row.appendChild(createTag(String(item.year)));

    const p = document.createElement('p');
    const journal = document.createElement('i');
    journal.textContent = safeText(item.journal);
    p.appendChild(journal);
    p.appendChild(document.createTextNode(' — '));
    p.appendChild(createLinkOrText(item.title, item.url, 'publication-link'));
    row.appendChild(p);
    target.appendChild(row);
  });
}

function renderPublicationPage(publications) {
  const target = document.getElementById('publication-list');
  if (!target) return;
  target.innerHTML = '';

  if (!publications.length) {
    target.innerHTML = '<p class="empty-state">등록된 논문이 없습니다.</p>';
    return;
  }

  let currentYear = null;
  publications.forEach((item) => {
    if (item.year !== currentYear) {
      currentYear = item.year;
      const yearTitle = document.createElement('div');
      yearTitle.className = 'people-section-title publication-year';
      yearTitle.textContent = String(currentYear);
      target.appendChild(yearTitle);
    }

    const row = document.createElement('article');
    row.className = 'publication-item';

    const meta = document.createElement('div');
    meta.className = 'publication-meta';
    meta.appendChild(createTag(String(item.year)));
    const journal = document.createElement('span');
    journal.className = 'publication-journal';
    journal.textContent = safeText(item.journal);
    meta.appendChild(journal);

    const body = document.createElement('div');
    body.className = 'publication-body';
    body.appendChild(createLinkOrText(item.title, item.url, 'publication-title'));
    if (item.authors) {
      const authors = document.createElement('p');
      authors.className = 'publication-authors';
      authors.textContent = safeText(item.authors);
      body.appendChild(authors);
    }

    row.append(meta, body);
    target.appendChild(row);
  });
}

function renderBoardPage(news) {
  const target = document.getElementById('board-list');
  if (!target) return;
  target.innerHTML = '';

  if (!news.length) {
    target.innerHTML = '<p class="empty-state">등록된 소식이 없습니다.</p>';
    return;
  }

  let currentYear = null;
  news.forEach((item, index) => {
    if (item.year !== currentYear) {
      currentYear = item.year;
      const yearTitle = document.createElement('div');
      yearTitle.className = 'people-section-title board-year';
      yearTitle.textContent = String(currentYear);
      target.appendChild(yearTitle);
    }

    const row = document.createElement('article');
    row.className = item.image ? 'board-item has-image' : 'board-item';

    if (item.image) {
      const img = document.createElement('img');
      img.className = 'board-thumb';
      img.src = item.image;
      img.alt = safeText(item.title);
      img.loading = 'lazy';
      row.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'board-body';

    const meta = document.createElement('div');
    meta.className = 'board-meta';
    meta.appendChild(createTag(index === 0 ? 'NEW' : String(item.year), index === 0));
    if (item.category) {
      const category = document.createElement('span');
      category.className = 'board-category';
      category.textContent = safeText(item.category);
      meta.appendChild(category);
    }

    body.append(meta, createLinkOrText(item.title, item.url, 'board-title'));
    row.appendChild(body);
    target.appendChild(row);
  });
}

function memberAvatar(member) {
  const avatar = document.createElement('div');
  avatar.className = 'p-avatar';
  if (member.photo_url) {
    const img = document.createElement('img');
    img.src = member.photo_url;
    img.alt = member.name;
    img.loading = 'lazy';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    avatar.appendChild(img);
  } else {
    avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';
  }
  return avatar;
}

function renderPeoplePage(members) {
  if (!members || !members.length) return;
  if (!document.title.toLowerCase().includes('people')) return;

  const contentSection = [...document.querySelectorAll('section')].find((section) =>
    !section.classList.contains('page-banner') && section.querySelector('.people-grid')
  );
  if (!contentSection) return;
  const wrap = contentSection.querySelector('.wrap');
  if (!wrap) return;

  wrap.innerHTML = '';

  const groupPriority = [
    'Ph.D. / Postdoc',
    'Ph.D. Students',
    'M.S. Students',
    'Undergraduate Interns',
    'Alumni'
  ];

  const grouped = new Map();
  members
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.id - b.id)
    .forEach((member) => {
      const key = member.group_name || 'Members';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(member);
    });

  const groups = [...grouped.keys()].sort((a, b) => {
    const ai = groupPriority.indexOf(a);
    const bi = groupPriority.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  groups.forEach((group) => {
    const title = document.createElement('div');
    title.className = 'people-section-title';
    title.textContent = group;
    wrap.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'people-grid';

    grouped.get(group).forEach((member) => {
      const card = document.createElement('div');
      card.className = 'p-card';
      card.appendChild(memberAvatar(member));

      const name = document.createElement('b');
      name.textContent = member.name + (member.english_name ? ` · ${member.english_name}` : '');
      card.appendChild(name);

      const role = document.createElement('span');
      role.textContent = [member.role, member.research].filter(Boolean).join(' · ');
      card.appendChild(role);

      if (member.email) {
        const email = document.createElement('a');
        email.href = `mailto:${member.email}`;
        email.textContent = member.email;
        email.style.display = 'block';
        email.style.marginTop = '7px';
        email.style.fontSize = '11.5px';
        email.style.color = 'var(--cyan-dark)';
        card.appendChild(email);
      }
      grid.appendChild(card);
    });

    wrap.appendChild(grid);
  });
}

async function main() {
  wbslSupabase = await initSupabase();

  const staticPublications = Array.isArray(window.WBSL_PUBLICATIONS) ? window.WBSL_PUBLICATIONS : [];
  const staticNews = Array.isArray(window.WBSL_NEWS) ? window.WBSL_NEWS : [];

  let publications = null;
  let news = null;
  let members = null;
  let slides = null;

  if (wbslSupabase) {
    [publications, news, members, slides] = await Promise.all([
      loadTable('publications', [
        { field: 'year', ascending: false },
        { field: 'sort_order', ascending: false }
      ]),
      loadTable('news', [
        { field: 'year', ascending: false },
        { field: 'sort_order', ascending: false }
      ]),
      loadTable('members', [
        { field: 'sort_order', ascending: true },
        { field: 'id', ascending: true }
      ]),
      wbslSupabase.from('slides').select('*').eq('is_active', true).order('sort_order', { ascending: true }).order('id', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }).catch((error) => {
          console.warn('[WBSL] Failed to load slides', error);
          return null;
        })
    ]);
  }

  const publicationData = normalizePublications(publications ?? staticPublications);
  const newsData = normalizeNews(news ?? staticNews);

  renderHomePublications(publicationData);
  renderPublicationPage(publicationData);
  renderHomeNews(newsData);
  renderBoardPage(newsData);
  renderPeoplePage(members || []);
  renderDynamicSlides(slides || []);
}

main();
