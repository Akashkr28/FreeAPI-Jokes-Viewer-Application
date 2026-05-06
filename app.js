const API_BASE = 'https://api.freeapi.app/api/v1/public/randomjokes';
const TOTAL_JOKES = 1465;
const PAGE_SIZE = 10;

/* ── State ── */
const state = {
  jokes: [],
  index: 0,
  page: 1,
  totalPages: 147,
  loading: false,
  favorites: JSON.parse(localStorage.getItem('jv_favorites') || '[]'),
};

/* ── DOM refs ── */
const $ = (id) => document.getElementById(id);

const jokeCard       = $('jokeCard');
const jokeText       = $('jokeText');
const jokeId         = $('jokeId');
const jokeContent    = $('jokeContent');
const loadingState   = $('loadingState');
const errorState     = $('errorState');
const errorMsg       = $('errorMsg');
const jokeCounter    = $('jokeCounter');
const categoryBadges = $('categoryBadges');
const progressFill   = $('progressFill');

const prevBtn        = $('prevBtn');
const nextBtn        = $('nextBtn');
const copyBtn        = $('copyBtn');
const favoriteBtn    = $('favoriteBtn');
const shareBtn       = $('shareBtn');
const retryBtn       = $('retryBtn');

const themeToggleBtn = $('themeToggleBtn');
const favToggleBtn   = $('favToggleBtn');
const favCount       = $('favCount');
const favoritesPanel = $('favoritesPanel');
const favOverlay     = $('favOverlay');
const closeFavBtn    = $('closeFavBtn');
const favoritesList  = $('favoritesList');

const toast          = $('toast');

/* ── API ── */
async function fetchPage(page) {
  const res = await fetch(`${API_BASE}?page=${page}&limit=${PAGE_SIZE}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

async function loadJokes(page = 1) {
  state.loading = true;
  showLoading();

  try {
    const data = await fetchPage(page);
    state.jokes = data.data;
    state.totalPages = data.totalPages;
    state.page = page;
    state.index = 0;
    renderJoke();
  } catch (err) {
    showError('Could not load jokes. Check your connection and try again.');
  } finally {
    state.loading = false;
  }
}

async function loadNextPage() {
  if (state.page >= state.totalPages) return;
  state.loading = true;
  showLoading();
  try {
    const nextPage = state.page + 1;
    const data = await fetchPage(nextPage);
    state.jokes = data.data;
    state.page = nextPage;
    state.index = 0;
    renderJoke();
  } catch {
    showError('Failed to load next batch.');
  } finally {
    state.loading = false;
  }
}

async function loadPrevPage() {
  if (state.page <= 1) return;
  state.loading = true;
  showLoading();
  try {
    const prevPage = state.page - 1;
    const data = await fetchPage(prevPage);
    state.jokes = data.data;
    state.page = prevPage;
    state.index = data.data.length - 1;
    renderJoke();
  } catch {
    showError('Failed to load previous batch.');
  } finally {
    state.loading = false;
  }
}

/* ── Render ── */
function renderJoke(direction = null) {
  const joke = state.jokes[state.index];
  if (!joke) return;

  if (direction) {
    jokeCard.classList.remove('slide-left', 'slide-right');
    void jokeCard.offsetWidth; // reflow
    jokeCard.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');
  }

  jokeText.textContent = joke.content;
  jokeId.textContent = `#${joke.id}`;

  // Categories
  categoryBadges.innerHTML = '';
  if (joke.categories && joke.categories.length) {
    joke.categories.forEach((cat) => {
      const span = document.createElement('span');
      span.className = `badge badge-${cat.toLowerCase() === 'explicit' ? 'explicit' : 'general'}`;
      span.textContent = cat;
      categoryBadges.appendChild(span);
    });
  }

  // Counter
  const globalIndex = (state.page - 1) * PAGE_SIZE + state.index + 1;
  jokeCounter.innerHTML = `Joke <strong>${globalIndex}</strong> of <strong>${TOTAL_JOKES.toLocaleString()}</strong>`;

  // Progress
  progressFill.style.width = `${(globalIndex / TOTAL_JOKES) * 100}%`;

  // Favorite button state
  updateFavBtn(joke.id);

  // Nav buttons
  const isFirst = state.index === 0 && state.page === 1;
  prevBtn.disabled = isFirst;

  showContent();
}

function showLoading() {
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  jokeContent.classList.add('hidden');
}

function showContent() {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  jokeContent.classList.remove('hidden');
}

function showError(msg) {
  errorMsg.textContent = msg;
  loadingState.classList.add('hidden');
  jokeContent.classList.add('hidden');
  errorState.classList.remove('hidden');
}

/* ── Navigation ── */
async function goNext() {
  if (state.loading) return;
  if (state.index < state.jokes.length - 1) {
    state.index++;
    renderJoke('next');
  } else {
    await loadNextPage();
  }
}

async function goPrev() {
  if (state.loading) return;
  if (state.index > 0) {
    state.index--;
    renderJoke('prev');
  } else {
    await loadPrevPage();
  }
}

/* ── Favorites ── */
function isFavorite(id) {
  return state.favorites.some((j) => j.id === id);
}

function toggleFavorite() {
  const joke = state.jokes[state.index];
  if (!joke) return;

  if (isFavorite(joke.id)) {
    state.favorites = state.favorites.filter((j) => j.id !== joke.id);
    showToast('Removed from saved jokes');
  } else {
    state.favorites.push(joke);
    showToast('Joke saved! ❤️');
  }

  localStorage.setItem('jv_favorites', JSON.stringify(state.favorites));
  updateFavBtn(joke.id);
  updateFavCount();
  if (!favoritesPanel.classList.contains('hidden')) renderFavorites();
}

function updateFavBtn(jokeId) {
  const fav = isFavorite(jokeId);
  const icon = favoriteBtn.querySelector('i');
  icon.className = fav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  favoriteBtn.classList.toggle('active-fav', fav);
}

function updateFavCount() {
  const count = state.favorites.length;
  favCount.textContent = count;
  favCount.classList.toggle('hidden', count === 0);
}

function renderFavorites() {
  if (!state.favorites.length) {
    favoritesList.innerHTML = `
      <div class="empty-fav">
        <span>🤷</span>
        <p>No saved jokes yet.<br/>Hit the heart on any joke!</p>
      </div>`;
    return;
  }

  favoritesList.innerHTML = state.favorites
    .map(
      (j) => `
      <div class="fav-item">
        <p>${escapeHtml(j.content)}</p>
        <div class="fav-item-actions">
          <span class="fav-item-id">#${j.id}</span>
          <button class="fav-remove" data-id="${j.id}" title="Remove">
            <i class="fa-solid fa-trash-can"></i> Remove
          </button>
        </div>
      </div>`
    )
    .join('');

  favoritesList.querySelectorAll('.fav-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      state.favorites = state.favorites.filter((j) => j.id !== id);
      localStorage.setItem('jv_favorites', JSON.stringify(state.favorites));
      updateFavCount();
      renderFavorites();
      const current = state.jokes[state.index];
      if (current) updateFavBtn(current.id);
    });
  });
}

function openFavorites() {
  renderFavorites();
  favoritesPanel.classList.remove('hidden');
  favOverlay.classList.remove('hidden');
}

function closeFavorites() {
  favoritesPanel.classList.add('hidden');
  favOverlay.classList.add('hidden');
}

/* ── Copy ── */
async function copyJoke() {
  const joke = state.jokes[state.index];
  if (!joke) return;
  try {
    await navigator.clipboard.writeText(joke.content);
    showToast('Joke copied to clipboard!');
  } catch {
    showToast('Could not copy — try manually.');
  }
}

/* ── Share ── */
async function shareJoke() {
  const joke = state.jokes[state.index];
  if (!joke) return;
  const shareData = { title: 'Check out this joke!', text: joke.content };
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try { await navigator.share(shareData); } catch { /* user cancelled */ }
  } else {
    await navigator.clipboard.writeText(joke.content);
    showToast('Link copied — share it!');
  }
}

/* ── Theme ── */
function initTheme() {
  const saved = localStorage.getItem('jv_theme') || 'light';
  applyTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('jv_theme', next);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = themeToggleBtn.querySelector('i');
  icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* ── Toast ── */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2200);
}

/* ── Helpers ── */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Keyboard Navigation ── */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight' || e.key === 'l') goNext();
  if (e.key === 'ArrowLeft'  || e.key === 'h') goPrev();
  if (e.key === 'c') copyJoke();
  if (e.key === 's') toggleFavorite();
  if (e.key === 'Escape') closeFavorites();
});

/* ── Event Listeners ── */
nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);
copyBtn.addEventListener('click', copyJoke);
favoriteBtn.addEventListener('click', toggleFavorite);
shareBtn.addEventListener('click', shareJoke);
retryBtn.addEventListener('click', () => loadJokes(state.page));
themeToggleBtn.addEventListener('click', toggleTheme);
favToggleBtn.addEventListener('click', openFavorites);
closeFavBtn.addEventListener('click', closeFavorites);
favOverlay.addEventListener('click', closeFavorites);

/* ── Init ── */
initTheme();
updateFavCount();
loadJokes(1);
