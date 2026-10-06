/* Product content lives here. Prices are mock-up values from the reference,
   not a verified catalogue. Replace them before using this as a sales kiosk. */
const products = [
  { name: 'G-600L', price: 29, image: 'assets/demo-poster.jpg', video: 'vo/G600L_PACK_EN_10MB.mp4', categories: ['Keyboards'] },
  { name: 'Freedom Solo', price: 19, image: 'assets/FreedomSolo.png', video: 'vo/FreedomSolo_EN_10MB.mp4', categories: ['Keyboards', 'Karaoke'] },
  { name: 'Stage Rocker', price: 69, image: 'assets/StageRocker2.png', video: 'vo/Stage Rocker 2 DJ_2_HD.mp4', categories: ['Keyboards', 'Drums', 'DJ'] },
  { name: 'Pocket Solo', price: 39, image: 'assets/pocket-solo.png', video: 'vo/so1.mp4', categories: ['Keyboards', 'Pocket'] },
  { name: 'G-900', price: 49, image: 'assets/g900.png', video: 'vo/G900_EN_10MB.mp4', categories: ['Keyboards', 'Party Speakers'] },
  { name: 'G-600AL', price: 35, image: 'assets/g600al.png', video: 'vo/G600LA_ENHD.mp4', categories: ['Keyboards', 'DJ'] },
  { name: 'Key Groove', price: 59, image: 'assets/keyb.png', video: 'vo/pb1.mp4', categories: ['Keyboards', 'Groove Brix'] },
  { name: 'Solo 2', price: 45, image: 'assets/solo-2.png', video: 'vo/so1.mp4', categories: ['Keyboards', 'Party Speakers'] },
];

// Simple inline SVGs stay crisp at any display size and need no icon library.
const icons = {
  Keyboards: '<rect x="5" y="16" width="54" height="35" rx="3"/><path d="M14 17v33m9-33v33m9-33v33m9-33v33m9-33v33M18 17v19m18-19v19m9-19v19"/>',
  Guitars: '<path d="m41 10 9-6 6 6-6 9-5-1-15 17c8 12-9 27-19 16S13 26 21 30l17-16Z"/><path d="m21 43 27-31M17 39l9 8"/>',
  Drums: '<circle cx="32" cy="38" r="17"/><circle cx="32" cy="38" r="12"/><path d="M9 16v41m46-41v41M2 11l18 9m26 0 16-9M7 30h10m32 0h9M20 53l-3 7m27-7 3 7"/>',
  DJ: '<rect x="4" y="13" width="56" height="39" rx="5"/><circle cx="23" cy="32" r="13"/><circle cx="23" cy="32" r="4"/><circle cx="48" cy="24" r="4"/><path d="M42 37h12m-12 7h5m5 0h2"/>',
  Karaoke: '<path d="m30 33-17 23-7-5 16-25"/><circle cx="35" cy="21" r="13"/><path d="m26 12 19 18M9 55l-4 6"/>',
  'Party Speakers': '<rect x="15" y="6" width="34" height="53" rx="5"/><circle cx="32" cy="21" r="7"/><circle cx="32" cy="43" r="10"/><circle cx="32" cy="43" r="3"/>',
  'K-Pop': '<path d="M32 25C8 10 24-2 32 10c8-12 24 0 0 15Zm-4 34L17 47c-4-5 0-10 4-6l6 6-3-18c-1-6 5-7 6-1l3 14 2-8c2-5 7-2 6 3 6-4 10 1 6 6l-8 16Z"/>',
  Pocket: '<rect x="15" y="6" width="35" height="53" rx="6"/><rect x="21" y="13" width="23" height="21" rx="2"/><path d="M22 46h10m-5-5v10m12-7 3 3m0-8 3 3"/>',
  'mini VERSE': '<path d="m32 5 12 7v14l-12 7-12-7V12Zm-12 7 12 7 12-7M32 19v14M7 34l12-7 13 7v15l-13 8-12-8Zm0 0 12 8 13-8M19 42v15m13-23 13-7 12 7v15l-12 8-13-8m0-15 13 8 12-8M45 42v15"/>',
  mySTAGE: '<path d="m18 54 10-31h8l11 31ZM32 4v8M13 12l6 7m32-7-6 7M6 32h9m34 0h9M9 53l7-7m39 7-7-7M27 19h10"/>',
  'Groove Brix': '<path d="M5 12h15v17H5Zm20 0h15v17H25Zm20 0h15v17H45ZM5 35h15v17H5Zm20 0h15v17H25Zm20 0h15v17H45Z"/>',
};

const screen = document.querySelector('#screen');
const main = document.querySelector('#main');
const intro = document.querySelector('#intro');
const introVideo = document.querySelector('#intro-video');
const introSound = document.querySelector('#intro-sound');
const demoVideo = document.querySelector('#demo-video');
const playDemo = document.querySelector('#play-demo');
let selectedProduct = null;
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
let idleTimer;

function updateIntroSound() {
  introSound.textContent = introVideo.muted ? 'Sound on' : 'Mute';
  introSound.setAttribute('aria-label', introVideo.muted ? 'Unmute opening video' : 'Mute opening video');
  introSound.setAttribute('aria-pressed', String(introVideo.muted));
}

function playIntro() {
  return introVideo.play().catch(() => {
    introVideo.muted = true;
    updateIntroSound();
    return introVideo.play().catch(() => {});
  });
}

introSound.addEventListener('click', () => {
  introVideo.muted = !introVideo.muted;
  updateIntroSound();
  playIntro();
});
introVideo.addEventListener('volumechange', updateIntroSound);

function restartIntro() {
  clearTimeout(idleTimer);
  demoVideo.pause();
  demoVideo.currentTime = 0;
  selectedProduct = null;
  selectCategory('Keyboards');
  main.inert = true;
  intro.hidden = false;
  introSound.hidden = false;
  introVideo.currentTime = 0;
  playIntro();
  intro.focus({ preventScroll: true });
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  // The opening video already loops; only time inactivity on the main screen.
  if (intro.hidden) idleTimer = setTimeout(restartIntro, IDLE_TIMEOUT_MS);
}

// Count real user input, not video playback or background animation.
['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'touchmove'].forEach(event => {
  document.addEventListener(event, resetIdleTimer, { passive: true });
});
// Spread particles across a grid so every area gets notes and dots.
function createMusicBackground() {
  const background = document.querySelector('#music-background');
  const fragment = document.createDocumentFragment();
  const columns = 6;
  const rows = 12;
  for (let index = 0; index < columns * rows; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const particle = document.createElement('span');
    const isNote = (column + row) % 3 === 0;
    particle.className = `music-particle${isNote ? '' : ' dot'}`;
    particle.textContent = isNote ? ['♪', '♫', '♬'][Math.floor((column + row) / 3) % 3] : '';
    particle.style.setProperty('--x', `${(column + 0.35 + (row % 2) * 0.2) * 100 / columns}%`);
    particle.style.setProperty('--y', `${(row + 0.5) * 100 / rows}%`);
    particle.style.setProperty('--size', `${isNote ? 32 + index % 4 * 8 : 4 + index % 5 * 2}px`);
    particle.style.setProperty('--duration', `${8 + index % 7}s`);
    particle.style.setProperty('--delay', `${-index * 1.7}s`);
    particle.style.setProperty('--particle-color', index % 2 ? '#08e2ef' : '#bb65ef');
    fragment.append(particle);
  }
  background.append(fragment);
}

function fitScreen() {
  const scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
  screen.style.transform = `scale(${scale})`;
  screen.style.left = `${(window.innerWidth - 1080 * scale) / 2}px`;
  screen.style.top = `${(window.innerHeight - 1920 * scale) / 2}px`;
}

function selectCategory(category) {
  document.querySelectorAll('.category').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.category === category));
  });
  const filtered = products.filter(product => product.categories.includes(category));
  document.querySelector('#product-count').textContent = `${category} / ${filtered.length} products`;
  const grid = document.querySelector('#products');
  grid.replaceChildren();

  filtered.forEach(product => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'product';
    card.setAttribute('aria-pressed', String(selectedProduct === product));
    card.innerHTML = `<img src="${product.image}" alt="" draggable="false"><span class="product-name">${product.name}</span><span class="price"><span class="currency">€</span>${product.price}</span>`;
    card.addEventListener('click', () => {
      selectedProduct = product;
      grid.querySelectorAll('.product').forEach(item => {
        item.setAttribute('aria-pressed', String(item === card));
      });
      playProductVideo(product);
    });
    grid.append(card);
  });

  if (!filtered.length) {
    const message = document.createElement('p');
    message.className = 'empty-state';
    message.textContent = 'More sounds coming soon. Explore another category.';
    grid.append(message);
  }
}

// Product cards share the main player instead of opening a separate window.
function playProductVideo(product) {
  demoVideo.pause();
  demoVideo.poster = product.image;
  demoVideo.src = product.video;
  demoVideo.setAttribute('aria-label', `${product.name} demonstration`);
  demoVideo.load();
  playDemo.hidden = false;
  // If autoplay is blocked, the centered play button remains available.
  demoVideo.play().catch(() => {});
}

Object.entries(icons).forEach(([name, drawing]) => {
  const button = document.createElement('button');
  button.className = 'category';
  button.dataset.category = name;
  button.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">${drawing}</svg><span>${name}</span>`;
  button.addEventListener('click', () => selectCategory(name));
  document.querySelector('#categories').append(button);
});

intro.addEventListener('click', () => {
  introVideo.pause();
  intro.hidden = true;
  introSound.hidden = true;
  main.inert = false;
  playDemo.focus({ preventScroll: true });
  resetIdleTimer();
});

playDemo.addEventListener('click', () => demoVideo.play().catch(() => {}));
demoVideo.addEventListener('play', () => { playDemo.hidden = true; });
demoVideo.addEventListener('pause', () => { playDemo.hidden = false; });
demoVideo.addEventListener('ended', () => { playDemo.hidden = false; });
window.addEventListener('resize', fitScreen);
fitScreen();
createMusicBackground();
selectCategory('Keyboards');
updateIntroSound();
playIntro();
