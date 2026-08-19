const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.cssText = open
      ? ''
      : 'display:flex; position:absolute; top:78px; left:0; right:0; background:#fff; flex-direction:column; padding:20px 28px; gap:18px; border-bottom:1px solid #e2e8f2;';
  });
}

const publications = Array.isArray(window.WBSL_PUBLICATIONS)
  ? [...window.WBSL_PUBLICATIONS].sort((a, b) => (b.year - a.year) || ((b.order || 0) - (a.order || 0)))
  : [];

const news = Array.isArray(window.WBSL_NEWS)
  ? [...window.WBSL_NEWS].sort((a, b) => (b.year - a.year) || ((b.order || 0) - (a.order || 0)))
  : [];

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

function renderHomeNews() {
  const target = document.getElementById('home-news-list');
  if (!target) return;

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

function renderHomePublications() {
  const target = document.getElementById('home-publication-list');
  if (!target) return;

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
    journal.textContent = item.journal;
    p.appendChild(journal);
    p.appendChild(document.createTextNode(' — '));
    p.appendChild(createLinkOrText(item.title, item.url, 'publication-link'));
    row.appendChild(p);
    target.appendChild(row);
  });
}

function renderPublicationPage() {
  const target = document.getElementById('publication-list');
  if (!target) return;

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
    journal.textContent = item.journal;
    meta.appendChild(journal);

    const body = document.createElement('div');
    body.className = 'publication-body';
    const title = createLinkOrText(item.title, item.url, 'publication-title');
    body.appendChild(title);
    if (item.authors) {
      const authors = document.createElement('p');
      authors.className = 'publication-authors';
      authors.textContent = item.authors;
      body.appendChild(authors);
    }

    row.append(meta, body);
    target.appendChild(row);
  });
}

function renderBoardPage() {
  const target = document.getElementById('board-list');
  if (!target) return;

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
      img.alt = item.title;
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
      category.textContent = item.category;
      meta.appendChild(category);
    }

    const title = createLinkOrText(item.title, item.url, 'board-title');
    body.append(meta, title);
    row.appendChild(body);
    target.appendChild(row);
  });
}

renderHomeNews();
renderHomePublications();
renderPublicationPage();
renderBoardPage();
