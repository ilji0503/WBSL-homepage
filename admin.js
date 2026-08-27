const SUPABASE_URL = 'https://ubkcilywcmherkxgxkyq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LSsW-k61u9wlXUzDipys3Q_kcvbTRxe';
const SUPABASE_CONFIGURED = true;

const setupPanel = document.getElementById('setup-panel');
const loginPanel = document.getElementById('login-panel');
const dashboard = document.getElementById('dashboard');
const nav = document.getElementById('admin-nav');
const logoutBtn = document.getElementById('logout-btn');
const accountEmail = document.getElementById('account-email');
const toast = document.getElementById('toast');

let supabase = null;
let state = {
  publications: [],
  news: [],
  members: [],
  slides: []
};

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function setVisible(el, visible) {
  if (!el) return;
  el.hidden = !visible;
}

function safe(value) {
  return value == null ? '' : String(value);
}

function monthInputToDate(value) {
  return value ? `${value}-01` : null;
}

function dateToMonthInput(value) {
  return value ? String(value).slice(0, 7) : '';
}

function formatMonth(value) {
  if (!value) return '';
  const raw = String(value).slice(0, 7);
  const [year, month] = raw.split('-');
  return year && month ? `${year}.${month}` : raw;
}

function memberPeriodText(item) {
  const start = formatMonth(item.start_month);
  const end = formatMonth(item.end_month);
  if (!start && !end) return '';
  if (start && !end) return `${start} – Present`;
  if (!start && end) return `– ${end}`;
  return `${start} – ${end}`;
}

function formValue(form, name) {
  return form.elements[name]?.value?.trim?.() ?? form.elements[name]?.value ?? '';
}

function numberValue(form, name, fallback = 0) {
  const value = Number(form.elements[name]?.value);
  return Number.isFinite(value) ? value : fallback;
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value ?? '';
  });
}

function resetForm(form) {
  form.reset();
  if (form.elements.id) form.elements.id.value = '';
  if (form.elements.sort_order) form.elements.sort_order.value = '1';
  if (form.elements.year) form.elements.year.value = String(new Date().getFullYear());
  if (form.id === 'slide-form' && form.elements.is_active) form.elements.is_active.checked = true;
  if (form.id === 'member-form') {
    if (form.elements.start_month) form.elements.start_month.value = '';
    if (form.elements.end_month) form.elements.end_month.value = '';
  }

  const previewMap = {
    'news-form': 'news-image-preview',
    'member-form': 'member-image-preview',
    'slide-form': 'slide-image-preview'
  };
  const previewId = previewMap[form.id];
  if (previewId) renderPreview(document.getElementById(previewId), '');
}

function renderPreview(container, url) {
  if (!container) return;
  container.innerHTML = '';
  if (!url) {
    container.textContent = '사진 미리보기';
    container.classList.add('empty');
    return;
  }
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'preview';
  container.appendChild(img);
  container.classList.remove('empty');
}

async function uploadImage(file, folder) {
  if (!file) return '';
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const path = `${folder}/${unique}.${ext}`;

  const { error } = await supabase.storage.from('wbsl-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  });
  if (error) throw error;

  const { data } = supabase.storage.from('wbsl-images').getPublicUrl(path);
  return data.publicUrl;
}

async function verifyAdmin(session) {
  if (!session?.user?.email) return false;
  const { data, error } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', session.user.email)
    .maybeSingle();
  if (error) {
    console.warn(error);
    return false;
  }
  return Boolean(data);
}

async function fetchAll() {
  const queries = await Promise.all([
    supabase.from('publications').select('*').order('year', { ascending: false }).order('sort_order', { ascending: false }).order('id', { ascending: false }),
    supabase.from('news').select('*').order('year', { ascending: false }).order('sort_order', { ascending: false }).order('id', { ascending: false }),
    supabase.from('members').select('*').order('group_name', { ascending: true }).order('sort_order', { ascending: true }).order('id', { ascending: true }),
    supabase.from('slides').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true })
  ]);

  const names = ['publications', 'news', 'members', 'slides'];
  queries.forEach((result, i) => {
    if (result.error) throw result.error;
    state[names[i]] = result.data || [];
  });

  renderAllLists();
}

function emptyNode(text = '등록된 항목이 없습니다.') {
  const el = document.createElement('div');
  el.className = 'empty-list';
  el.textContent = text;
  return el;
}

function makeButton(text, action, id, danger = false) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `small-btn${danger ? ' danger' : ''}`;
  btn.textContent = text;
  btn.dataset.action = action;
  btn.dataset.id = String(id);
  return btn;
}

function renderPublicationList() {
  const list = document.getElementById('publication-admin-list');
  const count = document.getElementById('publication-count');
  list.innerHTML = '';

  const sorted = [...state.publications].sort((a, b) => {
    const ad = a.publish_date ? String(a.publish_date) : `${a.year || 0}-00-00`;
    const bd = b.publish_date ? String(b.publish_date) : `${b.year || 0}-00-00`;
    return bd.localeCompare(ad)
      || ((a.sort_order || 1) - (b.sort_order || 1))
      || ((b.id || 0) - (a.id || 0));
  });

  count.textContent = String(sorted.length);
  if (!sorted.length) return list.appendChild(emptyNode());

  sorted.forEach((item) => {
    const row = document.createElement('article');
    row.className = 'list-item';
    const main = document.createElement('div'); main.className = 'item-main';
    const meta = document.createElement('div'); meta.className = 'item-meta';

    const date = document.createElement('span');
    date.className = 'mini-pill';
    date.textContent = item.publish_date ? String(item.publish_date).replaceAll('-', '.') : safe(item.year);

    const journal = document.createElement('span');
    journal.textContent = safe(item.journal);
    meta.append(date, journal);

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = safe(item.title);

    main.append(meta, title);

    if (item.title_ko) {
      const ko = document.createElement('div');
      ko.className = 'item-sub';
      ko.textContent = safe(item.title_ko);
      main.appendChild(ko);
    }

    if (item.authors) {
      const authors = document.createElement('div');
      authors.className = 'item-sub';
      authors.textContent = safe(item.authors);
      main.appendChild(authors);
    }

    const actions = document.createElement('div'); actions.className = 'item-actions';
    actions.append(makeButton('수정', 'edit-publication', item.id), makeButton('삭제', 'delete-publication', item.id, true));
    row.append(main, actions); list.appendChild(row);
  });
}

function renderNewsList() {
  const list = document.getElementById('news-admin-list');
  const count = document.getElementById('news-count');
  list.innerHTML = '';
  count.textContent = String(state.news.length);
  if (!state.news.length) return list.appendChild(emptyNode());

  state.news.forEach((item) => {
    const row = document.createElement('article'); row.className = 'list-item';
    const main = document.createElement('div'); main.className = 'item-main';
    const content = document.createElement('div'); content.className = item.image_url ? 'thumb-row' : '';
    if (item.image_url) {
      const img = document.createElement('img'); img.className = 'list-thumb'; img.src = item.image_url; img.alt = item.title; content.appendChild(img);
    }
    const text = document.createElement('div');
    const meta = document.createElement('div'); meta.className = 'item-meta';
    const y = document.createElement('span'); y.className = 'mini-pill'; y.textContent = item.year;
    const cat = document.createElement('span'); cat.textContent = safe(item.category);
    meta.append(y, cat);
    const title = document.createElement('div'); title.className = 'item-title'; title.textContent = item.title;
    text.append(meta, title); content.appendChild(text); main.appendChild(content);
    const actions = document.createElement('div'); actions.className = 'item-actions';
    actions.append(makeButton('수정', 'edit-news', item.id), makeButton('삭제', 'delete-news', item.id, true));
    row.append(main, actions); list.appendChild(row);
  });
}

function renderMemberList() {
  const list = document.getElementById('member-admin-list');
  const count = document.getElementById('member-count');
  list.innerHTML = '';
  count.textContent = String(state.members.length);
  if (!state.members.length) return list.appendChild(emptyNode());

  state.members.forEach((item) => {
    const row = document.createElement('article'); row.className = 'list-item';
    const main = document.createElement('div'); main.className = 'item-main';
    const content = document.createElement('div'); content.className = item.photo_url ? 'thumb-row' : '';
    if (item.photo_url) {
      const img = document.createElement('img'); img.className = 'list-thumb'; img.src = item.photo_url; img.alt = item.name; content.appendChild(img);
    }
    const text = document.createElement('div');
    const meta = document.createElement('div'); meta.className = 'item-meta';
    const group = document.createElement('span'); group.className = 'mini-pill'; group.textContent = item.group_name;
    const role = document.createElement('span'); role.textContent = safe(item.role);
    meta.append(group, role);
    const title = document.createElement('div'); title.className = 'item-title'; title.textContent = item.name + (item.english_name ? ` · ${item.english_name}` : '');
    const sub = document.createElement('div'); sub.className = 'item-sub';
    const period = memberPeriodText(item);
    sub.textContent = [safe(item.research), period].filter(Boolean).join(' · ');
    text.append(meta, title, sub); content.appendChild(text); main.appendChild(content);
    const actions = document.createElement('div'); actions.className = 'item-actions';
    actions.append(makeButton('수정', 'edit-member', item.id), makeButton('삭제', 'delete-member', item.id, true));
    row.append(main, actions); list.appendChild(row);
  });
}

function renderSlideList() {
  const list = document.getElementById('slide-admin-list');
  const count = document.getElementById('slide-count');
  list.innerHTML = '';
  count.textContent = String(state.slides.length);
  if (!state.slides.length) return list.appendChild(emptyNode('슬라이드를 추가하면 메인 화면에 자동 표시됩니다.'));

  state.slides.forEach((item) => {
    const row = document.createElement('article'); row.className = 'list-item';
    const main = document.createElement('div'); main.className = 'item-main';
    const content = document.createElement('div'); content.className = 'thumb-row';
    const img = document.createElement('img'); img.className = 'list-thumb'; img.src = item.image_url; img.alt = item.title;
    const text = document.createElement('div');
    const meta = document.createElement('div'); meta.className = 'item-meta';
    const order = document.createElement('span'); order.className = 'mini-pill'; order.textContent = `#${item.sort_order}`;
    const active = document.createElement('span'); active.textContent = item.is_active ? '표시 중' : '숨김';
    meta.append(order, active);
    const title = document.createElement('div'); title.className = 'item-title'; title.textContent = item.title;
    text.append(meta, title); content.append(img, text); main.appendChild(content);
    const actions = document.createElement('div'); actions.className = 'item-actions';
    actions.append(makeButton('수정', 'edit-slide', item.id), makeButton('삭제', 'delete-slide', item.id, true));
    row.append(main, actions); list.appendChild(row);
  });
}

function renderAllLists() {
  renderPublicationList(); renderNewsList(); renderMemberList(); renderSlideList();
}

function bindFilePreview(formId, fileFieldName, hiddenFieldName, previewId) {
  const form = document.getElementById(formId);
  const fileInput = form.elements[fileFieldName];
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) renderPreview(document.getElementById(previewId), URL.createObjectURL(file));
    else renderPreview(document.getElementById(previewId), form.elements[hiddenFieldName]?.value || '');
  });
}

async function savePublication(form) {
  const id = formValue(form, 'id');
  const publishDate = formValue(form, 'publish_date');
  const year = numberValue(form, 'year', publishDate ? Number(publishDate.slice(0, 4)) : new Date().getFullYear());

  const payload = {
    year,
    publish_date: publishDate || null,
    sort_order: Math.max(1, numberValue(form, 'sort_order', 1)),
    journal: formValue(form, 'journal'),
    title: formValue(form, 'title'),
    title_ko: formValue(form, 'title_ko'),
    authors: formValue(form, 'authors'),
    url: formValue(form, 'url'),
    updated_at: new Date().toISOString()
  };

  const query = id ? supabase.from('publications').update(payload).eq('id', id) : supabase.from('publications').insert(payload);
  const { error } = await query;
  if (error) throw error;
}

async function saveNews(form) {
  const id = formValue(form, 'id');
  let imageUrl = formValue(form, 'image_url');
  const file = form.elements.image_file.files?.[0];
  if (file) imageUrl = await uploadImage(file, 'news');
  const payload = {
    year: numberValue(form, 'year', new Date().getFullYear()),
    sort_order: numberValue(form, 'sort_order', 0),
    category: formValue(form, 'category'),
    title: formValue(form, 'title'),
    url: formValue(form, 'url'),
    image_url: imageUrl,
    updated_at: new Date().toISOString()
  };
  const query = id ? supabase.from('news').update(payload).eq('id', id) : supabase.from('news').insert(payload);
  const { error } = await query;
  if (error) throw error;
}

async function saveMember(form) {
  const id = formValue(form, 'id');
  let photoUrl = formValue(form, 'photo_url');
  const file = form.elements.photo_file.files?.[0];
  if (file) photoUrl = await uploadImage(file, 'members');
  const startMonth = formValue(form, 'start_month');
  const endMonth = formValue(form, 'end_month');
  if (startMonth && endMonth && endMonth < startMonth) throw new Error('종료 연월은 시작 연월보다 빠를 수 없습니다.');
  const payload = {
    name: formValue(form, 'name'), english_name: formValue(form, 'english_name'),
    role: formValue(form, 'role'), group_name: formValue(form, 'group_name'),
    research: formValue(form, 'research'), email: formValue(form, 'email'),
    start_month: monthInputToDate(startMonth), end_month: monthInputToDate(endMonth),
    photo_url: photoUrl, sort_order: Math.max(1, numberValue(form, 'sort_order', 1)), updated_at: new Date().toISOString()
  };
  const query = id ? supabase.from('members').update(payload).eq('id', id) : supabase.from('members').insert(payload);
  const { error } = await query;
  if (error) throw error;
}

async function saveSlide(form) {
  const id = formValue(form, 'id');
  let imageUrl = formValue(form, 'image_url');
  const file = form.elements.image_file.files?.[0];
  if (file) imageUrl = await uploadImage(file, 'slides');
  if (!imageUrl) throw new Error('슬라이드 사진을 선택해 주세요.');
  const payload = {
    title: formValue(form, 'title'), subtitle: '', image_url: imageUrl,
    sort_order: Math.max(1, numberValue(form, 'sort_order', 1)), is_active: form.elements.is_active.checked,
    updated_at: new Date().toISOString()
  };
  const query = id ? supabase.from('slides').update(payload).eq('id', id) : supabase.from('slides').insert(payload);
  const { error } = await query;
  if (error) throw error;
}

function bindForm(formId, saveFn) {
  const form = document.getElementById(formId);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true; button.textContent = '저장 중...';
    try {
      await saveFn(form);
      resetForm(form);
      await fetchAll();
      showToast('저장했습니다.');
    } catch (error) {
      console.error(error);
      showToast(error.message || '저장 중 오류가 발생했습니다.', true);
    } finally {
      button.disabled = false; button.textContent = '저장';
    }
  });
}

function editPublication(id) {
  const item = state.publications.find((x) => String(x.id) === String(id)); if (!item) return;
  const form = document.getElementById('publication-form');
  setFormValues(form, item); form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function editNews(id) {
  const item = state.news.find((x) => String(x.id) === String(id)); if (!item) return;
  const form = document.getElementById('news-form');
  setFormValues(form, item); renderPreview(document.getElementById('news-image-preview'), item.image_url); form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function editMember(id) {
  const item = state.members.find((x) => String(x.id) === String(id)); if (!item) return;
  const form = document.getElementById('member-form');
  const values = {
    ...item,
    start_month: dateToMonthInput(item.start_month),
    end_month: dateToMonthInput(item.end_month),
    sort_order: item.sort_order || 1
  };
  setFormValues(form, values); renderPreview(document.getElementById('member-image-preview'), item.photo_url); form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function editSlide(id) {
  const item = state.slides.find((x) => String(x.id) === String(id)); if (!item) return;
  const form = document.getElementById('slide-form');
  setFormValues(form, item); renderPreview(document.getElementById('slide-image-preview'), item.image_url); form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteRow(table, id) {
  if (!window.confirm('정말 삭제할까요?')) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  await fetchAll();
  showToast('삭제했습니다.');
}

document.addEventListener('click', async (event) => {
  const reset = event.target.closest('[data-reset-form]');
  if (reset) {
    const map = { publication: 'publication-form', news: 'news-form', member: 'member-form', slide: 'slide-form' };
    resetForm(document.getElementById(map[reset.dataset.resetForm]));
    return;
  }

  const action = event.target.closest('[data-action]');
  if (!action) return;
  const id = action.dataset.id;
  try {
    if (action.dataset.action === 'edit-publication') editPublication(id);
    if (action.dataset.action === 'edit-news') editNews(id);
    if (action.dataset.action === 'edit-member') editMember(id);
    if (action.dataset.action === 'edit-slide') editSlide(id);
    if (action.dataset.action === 'delete-publication') await deleteRow('publications', id);
    if (action.dataset.action === 'delete-news') await deleteRow('news', id);
    if (action.dataset.action === 'delete-member') await deleteRow('members', id);
    if (action.dataset.action === 'delete-slide') await deleteRow('slides', id);
  } catch (error) {
    console.error(error); showToast(error.message || '작업 중 오류가 발생했습니다.', true);
  }
});

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === tab));
  const labels = { publications: 'Publications', news: 'Board / News', members: 'Members', slides: 'Main Slider' };
  document.getElementById('page-title').textContent = labels[tab] || tab;
}

document.querySelectorAll('.nav-item').forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

bindForm('publication-form', savePublication);
bindForm('news-form', saveNews);
bindForm('member-form', saveMember);
bindForm('slide-form', saveSlide);
bindFilePreview('news-form', 'image_file', 'image_url', 'news-image-preview');
bindFilePreview('member-form', 'photo_file', 'photo_url', 'member-image-preview');
bindFilePreview('slide-form', 'image_file', 'image_url', 'slide-image-preview');
['publication-form','news-form','member-form','slide-form'].forEach((id) => resetForm(document.getElementById(id)));

async function showDashboard(session) {
  const admin = await verifyAdmin(session);
  if (!admin) {
    await supabase.auth.signOut();
    setVisible(loginPanel, true);
    document.getElementById('login-message').textContent = '이 계정은 admin_users에 등록되어 있지 않습니다.';
    return;
  }

  accountEmail.textContent = session.user.email;
  setVisible(setupPanel, false); setVisible(loginPanel, false); setVisible(dashboard, true);
  setVisible(nav, true); setVisible(logoutBtn, true);
  await fetchAll();
}

async function init() {
  if (!SUPABASE_CONFIGURED) {
    setVisible(setupPanel, true);
    return;
  }

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  const { data: { session } } = await supabase.auth.getSession();
  if (session) await showDashboard(session);
  else setVisible(loginPanel, true);

  supabase.auth.onAuthStateChange(async (event, nextSession) => {
    if (event === 'SIGNED_OUT') {
      setVisible(dashboard, false); setVisible(nav, false); setVisible(logoutBtn, false); setVisible(loginPanel, true);
    } else if (nextSession) {
      await showDashboard(nextSession);
    }
  });
}

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('login-message');
  message.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await showDashboard(data.session);
  } catch (error) {
    console.error(error);
    message.textContent = error.message || '로그인에 실패했습니다.';
  }
});

logoutBtn.addEventListener('click', () => supabase?.auth.signOut());

init().catch((error) => {
  console.error(error);
  setVisible(setupPanel, true);
  const p = setupPanel.querySelector('p');
  p.textContent = `초기화 중 오류가 발생했습니다: ${error.message}`;
});
