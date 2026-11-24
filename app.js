const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
}
menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menu.focus(); } });
if ('IntersectionObserver' in window) {
  const links = Array.from(nav.querySelectorAll('a'));
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const link = links.find(item => item.hash === '#' + entry.target.id);
      if (entry.isIntersecting) {
        for (const item of links) item.removeAttribute('aria-current');
        link.setAttribute('aria-current', 'location');
      }
    }
  }, {rootMargin: '-18% 0px -60% 0px'});
  for (const link of links) observer.observe(document.querySelector(link.hash));
}
const field = document.querySelector('.field');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const pauseButton = document.querySelector('[data-field-pause]');
const photos = Array.from(field.children);
function copyPhoto(photo) {
  const copy = photo.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  return copy;
}
field.prepend(...photos.map(copyPhoto));
field.append(...photos.map(copyPhoto));
field.classList.add('field-loop');
const firstCopy = field.children[0];
const nextCopy = field.children[photos.length * 2];
const fieldStart = () => photos[0].offsetLeft - firstCopy.offsetLeft;
const fieldLength = () => nextCopy.offsetLeft - photos[0].offsetLeft;
const photoWidth = () => photos[1].offsetLeft - photos[0].offsetLeft;
let position = fieldStart();
let previousTime = 0;
let userPaused = false;
let interactingUntil = 0;
let dragging = false;
let onScreen = false;
field.scrollLeft = position;
function adjustPosition() {
  const start = fieldStart();
  const length = fieldLength();
  if (length && (position < start || position >= start + length)) {
    position = start + ((position - start) % length + length) % length;
  }
}
pauseButton.addEventListener('click', () => {
  userPaused = !userPaused;
  pauseButton.textContent = userPaused ? '자동 이동 재개' : '자동 이동 정지';
});
function updateMotion() {
  pauseButton.hidden = motion.matches;
}
motion.addEventListener('change', updateMotion);
updateMotion();
function delayAuto() { interactingUntil = performance.now() + 1200; }
field.addEventListener('wheel', delayAuto, {passive: true});
field.addEventListener('keydown', delayAuto);
field.addEventListener('pointerdown', () => { dragging = true; delayAuto(); });
function endDrag() {
  if (dragging) delayAuto();
  dragging = false;
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);
const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
observer.observe(field);
for (const control of document.querySelectorAll('[data-scroll]')) {
  control.addEventListener('click', () => {
    delayAuto();
    position = field.scrollLeft;
    adjustPosition();
    field.scrollLeft = position;
    field.scrollBy({
      left: Number(control.dataset.scroll) * photoWidth(),
      behavior: motion.matches ? 'instant' : 'smooth'
    });
  });
}
function advanceField(time) {
  const elapsed = Math.min(time - previousTime, 50);
  previousTime = time;
  const manual = dragging || time < interactingUntil;
  const auto = onScreen && !manual && !userPaused && !motion.matches &&
    !field.matches(':hover, :focus-within');
  if (manual || !auto || Math.abs(field.scrollLeft - position) > 2) {
    position = field.scrollLeft;
  }
  if (!manual) {
    adjustPosition();
    if (auto) position += elapsed * 0.034;
    if (Math.round(position) !== field.scrollLeft) field.scrollLeft = position;
  }
  requestAnimationFrame(advanceField);
}
requestAnimationFrame(advanceField);

const dialog = document.querySelector('dialog');
const player = dialog.querySelector('video');
for (const button of document.querySelectorAll('[data-film]')) {
  button.addEventListener('click', () => {
    dialog.querySelector('h2').textContent = button.dataset.title;
    player.src = 'assets/' + button.dataset.film + '.mp4';
    dialog.showModal();
  });
}
dialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); player.load(); });
const filters = Array.from(document.querySelectorAll('[data-filter]'));
for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const item of filters) item.setAttribute('aria-pressed', String(item === filter));
    for (const group of document.querySelectorAll('[data-group]')) {
      group.hidden = filter.dataset.filter !== 'all' && filter.dataset.filter !== group.dataset.group;
    }
  });
}
for (const image of document.querySelectorAll('[data-brand]')) {
  image.addEventListener('error', () => { image.hidden = true; });
  image.src = image.dataset.brand;
}const topBar = document.querySelector('.top');
const returnTop = document.querySelector('.return-top');
function updatePageScroll() {
  topBar.classList.toggle('is-scrolled', window.scrollY > 16);
  returnTop.hidden = window.scrollY < 500;
}
window.addEventListener('scroll', updatePageScroll, { passive: true });
updatePageScroll();
if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  for (const title of document.querySelectorAll('main > .band h2')) reveal.observe(title);
}

