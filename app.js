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
let toastTimer;
function setMediaZoom(enabled) {
  dialog.classList.toggle('is-zoomed', enabled);
  if (mediaZoom) {
    mediaZoom.setAttribute('aria-pressed', String(enabled));
    mediaZoom.textContent = enabled ? '适合窗口' : '放大';
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
  const pdfLabel = document.createElement('span'); pdfLabel.textContent = '完整课件 PDF';
  const pdfLink = document.createElement('a'); pdfLink.href = item.pdf;
  pdfLink.target = '_blank'; pdfLink.rel = 'noopener noreferrer'; pdfLink.textContent = '单独打开 ↗';
  pdfBar.append(pdfLabel); pdfBar.append(pdfLink);
  head.append(replayLabel); head.append(replay); head.append(pdfBar);
  const frame = document.createElement('iframe');
  frame.src = item.pdf + '#view=FitH'; frame.title = item.title + ' · 完整课件 PDF';
  documentPanel.append(head); documentPanel.append(frame);
  viewer.append(poster); viewer.append(documentPanel); mediaBody.append(viewer);
  if (typeof dialog.showModal !== 'function') { window.open(item.pdf,'_blank','noopener,noreferrer'); return; }
  dialog.showModal(); document.body.style.overflow = 'hidden';
}));
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
