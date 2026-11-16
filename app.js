const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('#site-header');
const progress = document.querySelector('.reading-progress span');
const yearGroups = [...document.querySelectorAll('.year-group')];
const yearLinks = [...document.querySelectorAll('.year-link')];
const yearSelect = document.querySelector('#year-select');
let framePending = false;

function updateReadingPosition() {
  framePending = false;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${total > 0 ? Math.min(window.scrollY / total, 1) : 0})`;
  header.classList.toggle('is-fixed', window.scrollY > 100);
  let current = yearGroups[0];
  for (const group of yearGroups) {
    if (group.getBoundingClientRect().top <= window.innerHeight * .36) current = group;
  }
  if (!current) return;
  for (const link of yearLinks) {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  if (yearSelect) yearSelect.value = current.id;
}
function requestReadingUpdate() {
  if (framePending) return;
  framePending = true;
  window.requestAnimationFrame(updateReadingPosition);
}
window.addEventListener('scroll', requestReadingUpdate, { passive: true });
window.addEventListener('resize', requestReadingUpdate);
document.querySelectorAll('.experience').forEach(detail => detail.addEventListener('toggle', requestReadingUpdate));
updateReadingPosition();

function navigateTo(target, openDetail = false) {
  const element = document.getElementById(target);
  if (!element) return;
  if (openDetail && element.tagName === 'DETAILS') element.open = true;
  element.scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth', block: 'start' });
  const focusTarget = element.querySelector('summary, h2') || element;
  if (!focusTarget.hasAttribute('tabindex') && focusTarget.tagName !== 'SUMMARY') focusTarget.setAttribute('tabindex', '-1');
  focusTarget.focus({ preventScroll: true });
  history.replaceState(null, '', `#${target}`);
}
yearLinks.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  navigateTo(link.hash.slice(1));
}));
yearSelect?.addEventListener('change', () => navigateTo(yearSelect.value));
document.querySelectorAll('[data-experience]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  navigateTo(link.dataset.experience, true);
}));

if ('IntersectionObserver' in window && !motionQuery.matches) {
  document.documentElement.classList.add('js-motion');
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  motionQuery.addEventListener('change', event => {
    if (event.matches) {
      document.documentElement.classList.remove('js-motion');
      revealObserver.disconnect();
    }
  });
}

const dialog = document.querySelector('.media-dialog');
const mediaBody = dialog.querySelector('.media-body');
const mediaTitle = dialog.querySelector('#media-title');
const mediaCaption = dialog.querySelector('.media-caption');
const mediaZoom = dialog.querySelector('.media-zoom');
let mediaOpener = null;
let savedScrollPosition = 0;
let recordingControls = null;
let toastTimer;
function setMediaZoom(enabled) {
  dialog.classList.toggle('is-zoomed', enabled);
  if (mediaZoom) {
    mediaZoom.setAttribute('aria-pressed', String(enabled));
    mediaZoom.textContent = enabled ? '适合窗口' : dialog.classList.contains?.('is-recording') ? '放大课件' : '放大';
  }
}
mediaZoom?.addEventListener('click', () => setMediaZoom(mediaZoom.getAttribute('aria-pressed') !== 'true'));
function showToast(message) {
  const toast = document.querySelector('.toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
}
document.querySelectorAll('[data-media]').forEach(button => button.addEventListener('click', () => {
  let item;
  try { item = JSON.parse(button.dataset.media); } catch { return; }
  mediaOpener = button;
  savedScrollPosition = window.scrollY;
  mediaBody.replaceChildren();
  dialog.classList.remove('is-recording');
  setMediaZoom(false);
  if (mediaZoom) mediaZoom.hidden = item.type !== 'image';
  mediaTitle.textContent = item.title || '作品预览';
  mediaCaption.textContent = item.caption || '';
  const media = document.createElement(item.type === 'video' ? 'video' : 'img');
  media.src = item.src;
  if (item.type === 'video') {
    media.controls = true;
    media.playsInline = true;
    media.preload = 'metadata';
    if (item.poster) media.poster = item.poster;
  } else media.alt = item.alt || item.title || '作品图片';
  media.addEventListener('error', () => {
    setMediaZoom(false);
    if (mediaZoom) mediaZoom.hidden = true;
    const message = document.createElement('p');
    message.style.padding = '40px 24px';
    message.textContent = '这份作品暂时无法加载，请稍后重试。';
    media.replaceWith(message);
  }, { once: true });
  mediaBody.append(media);
  if (typeof dialog.showModal !== 'function') {
    window.open(item.src, '_blank', 'noopener,noreferrer');
    return;
  }
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.querySelectorAll('[data-recording]').forEach(button => button.addEventListener('click', () => {
  let item;
  try { item = JSON.parse(button.dataset.recording); } catch { return; }
  mediaOpener = button;
  savedScrollPosition = window.scrollY;
  mediaBody.replaceChildren();
  setMediaZoom(false);
  if (mediaZoom) mediaZoom.hidden = true;
  dialog.classList.add('is-recording');
  if (mediaZoom) {mediaZoom.hidden = false; mediaZoom.textContent = '放大课件';}
  dialog.classList.remove('poster-hidden');
  dialog.dataset.recordingView = 'pdf';
  mediaTitle.textContent = item.title;
  mediaCaption.textContent = '';
  const viewer = document.createElement('div');
  viewer.className = 'recording-viewer';
  const poster = document.createElement('div');
  poster.className = 'recording-poster';
  const image = document.createElement('img');
  image.src = item.poster; image.alt = item.title + ' · 拆片王海报';
  poster.append(image);
  const documentPanel = document.createElement('div');
  documentPanel.className = 'recording-document';
  const head = document.createElement('div');
  head.className = 'recording-doc-head';
  const replayLabel = document.createElement('p');
  replayLabel.className = 'recording-replay-label'; replayLabel.textContent = '飞书回放';
  const replay = document.createElement('a');
  replay.className = 'recording-replay'; replay.href = item.href;
  replay.target = '_blank'; replay.rel = 'noopener noreferrer'; replay.textContent = item.title + ' ↗';
  const pdfBar = document.createElement('div');
  pdfBar.className = 'recording-pdf-bar';
  const pdfLabel = document.createElement('span'); pdfLabel.textContent = `完整课件 · ${item.pages.length} 页`;
  const pdfLink = document.createElement('a'); pdfLink.href = item.pdf;
  pdfLink.download = item.title + '.pdf'; pdfLink.textContent = '下载原 PDF ↧';
  pdfBar.append(pdfLabel); pdfBar.append(pdfLink);
  head.append(replayLabel); head.append(replay); head.append(pdfBar);
  const sheets = document.createElement('div');
  sheets.className = 'course-pages'; sheets.setAttribute('aria-label',item.title+' · 全部课件');
  item.pages.forEach((page,index)=>{
    const figure = document.createElement('figure'); figure.className = 'course-page';
    const sheet = document.createElement('img');
    sheet.src = page.src; sheet.alt = `${item.title} · 第 ${index+1} 页`;
    sheet.width = page.width; sheet.height = page.height;
    sheet.loading = index === 0 ? 'eager' : 'lazy'; sheet.decoding = 'async';
    if (index === 0) sheet.fetchPriority = 'high';
    sheet.addEventListener('error',()=>{
      const retry = document.createElement('button'); retry.type = 'button';
      retry.className = 'course-retry'; retry.textContent = `第 ${index+1} 页未加载，点击重试`;
      retry.addEventListener('click',()=>{ sheet.src = page.src + '?retry=' + Date.now(); retry.remove(); });
      figure.append(retry);
    });
    const caption = document.createElement('figcaption'); caption.textContent = `${index+1} / ${item.pages.length}`;
    figure.append(sheet); figure.append(caption); sheets.append(figure);
  });
  documentPanel.append(head); documentPanel.append(sheets);
  viewer.append(poster); viewer.append(documentPanel); mediaBody.append(viewer);
  recordingControls?.remove?.();
  recordingControls = document.createElement('div');
  recordingControls.className = 'recording-controls';
  const switcher = document.createElement('div');
  switcher.className = 'recording-view-switch';
  switcher.setAttribute('aria-label','查看课件或海报');
  const viewButtons = [];
  for (const [view,label] of [['pdf','课件'],['poster','海报']]) {
    const control = document.createElement('button');
    control.type = 'button'; control.className = 'recording-control';
    control.textContent = label; control.setAttribute('aria-pressed',String(view === 'pdf'));
    control.addEventListener('click',()=>{
      dialog.dataset.recordingView = view;
      for (const [value,button] of viewButtons) button.setAttribute('aria-pressed',String(value === view));
    });
    viewButtons.push([view,control]); switcher.append(control);
  }
  const posterToggle = document.createElement('button');
  posterToggle.type = 'button'; posterToggle.className = 'recording-control recording-poster-toggle';
  posterToggle.textContent = '收起海报'; posterToggle.setAttribute('aria-expanded','true');
  posterToggle.addEventListener('click',()=>{
    const hide = posterToggle.getAttribute('aria-expanded') === 'true';
    dialog.classList.toggle('poster-hidden',hide);
    posterToggle.setAttribute('aria-expanded',String(!hide));
    posterToggle.textContent = hide ? '显示海报' : '收起海报';
  });
  recordingControls.append(switcher); recordingControls.append(posterToggle);
  dialog.querySelector('.media-actions')?.append(recordingControls);
  if (typeof dialog.showModal !== 'function') { window.open(item.pdf,'_blank','noopener,noreferrer'); return; }
  dialog.showModal(); document.body.style.overflow = 'hidden';
}));

// Warm the first sheet near a poster, so opening it does not initialize another document viewer.
const warmedCourses = new Map();
function warmCourse(button) {
  let first;
  try { first = JSON.parse(button.dataset.recording).pages?.[0]?.src; } catch { return; }
  if (!first || warmedCourses.has(first)) return;
  const image = document.createElement('img'); image.decoding = 'async';
  image.src = first; warmedCourses.set(first,image);
}
const courseButtons = [...document.querySelectorAll('[data-recording]')];
if (courseButtons.length && 'IntersectionObserver' in window) {
  const previewObserver = new IntersectionObserver(entries=>{
    for (const entry of entries) if (entry.isIntersecting) {warmCourse(entry.target); previewObserver.unobserve(entry.target);}
  },{rootMargin:'180px'});
  courseButtons.forEach(button=>previewObserver.observe(button));
}
courseButtons.forEach(button=>{
  button.addEventListener('pointerenter',()=>warmCourse(button),{once:true});
  button.addEventListener('focus',()=>warmCourse(button),{once:true});
  button.addEventListener('touchstart',()=>warmCourse(button),{once:true,passive:true});
});
dialog.querySelector('.media-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  const video = mediaBody.querySelector('video');
  if (video) video.pause();
  mediaBody.replaceChildren();
  dialog.classList.remove('is-recording');
  dialog.classList.remove('poster-hidden');
  delete dialog.dataset.recordingView;
  recordingControls?.remove?.(); recordingControls = null;
  setMediaZoom(false);
  document.body.style.overflow = '';
  window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
  mediaOpener?.focus({ preventScroll: true });
});
document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => {
  if (dialog.open) dialog.close();
  showToast('在打印窗口中选择“另存为 PDF”，即可保存简历。');
  try {
    if (typeof window.print !== 'function') throw new Error('Print unavailable');
    window.print();
  } catch {
    showToast('当前浏览器不支持打印，请在系统浏览器中打开后保存 PDF。');
  }
}));
if (location.hash) {
  try {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target?.tagName === 'DETAILS') target.open = true;
  } catch { /* A malformed hash should not interrupt browsing. */ }
}
