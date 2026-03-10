// Config
const IIIF   = 'https://www.artic.edu/iiif/2';
const API    = 'https://api.artic.edu/api/v1';
const FIELDS = 'id,title,artist_display,date_display,medium_display,image_id';
const LIMIT  = 9;

const risoInks = [
  { bg: '#f7e642', ink: '#1a1a1a' },
  { bg: '#06c8c8', ink: '#1a1a1a' },
  { bg: '#e63946', ink: '#f7e642' },
  { bg: '#f7e642', ink: '#e63946' },
  { bg: '#06c8c8', ink: '#e63946' },
  { bg: '#e63946', ink: '#1a1a1a' },
];

// State
let currentQuery = '';
let currentPage  = 1;
let totalPages   = 1;

// DOM refs
const grid         = document.getElementById('grid');
const pagination   = document.getElementById('pagination');
const searchForm   = document.getElementById('search-form');
const searchInput  = document.getElementById('search-input');
const searchBtn    = document.getElementById('search-btn');
const searchStatus = document.getElementById('search-status');
const statusText   = document.getElementById('search-status-text');
const totalCount   = document.getElementById('total-count');

// Helpers
const imgUrl = (id, size = 400) =>
  id ? `${IIIF}/${id}/full/${size},/0/default.jpg` : null;

// Render: Skeletons
function renderSkeletons() {
  grid.innerHTML = '';
  for (let i = 0; i < LIMIT; i++) {
    const { bg, ink } = risoInks[i % risoInks.length];
    const el = document.createElement('div');
    el.className = 'card relative overflow-hidden opacity-50';
    el.style.cssText = `background:${bg}; box-shadow:4px 4px 0 ${ink}44;`;
    el.innerHTML = `
      <div class="mx-3 mt-3 relative overflow-hidden" style="aspect-ratio:4/3; background:${ink}22; outline:2px solid ${ink}; outline-offset:-2px;">
        <div class="shimmer absolute inset-0" style="background:linear-gradient(90deg,transparent 0%,${ink}11 50%,transparent 100%);"></div>
      </div>
      <div class="p-5">
        <div class="h-3 rounded-sm mb-2.5" style="background:${ink}33; width:40%;"></div>
        <div class="h-[18px] rounded-sm mb-2" style="background:${ink}33; width:85%;"></div>
        <div class="h-3 rounded-sm" style="background:${ink}22; width:60%;"></div>
      </div>
    `;
    grid.appendChild(el);
  }
}

// Render: Cards
function renderCards(artworks) {
  grid.innerHTML = '';

  if (artworks.length === 0) {
    grid.innerHTML = `
      <div class="col-span-3 py-16 text-center">
        <div class="text-2xl font-extrabold uppercase tracking-tight mb-2">No results found</div>
        <div class="text-sm opacity-45">Try a different search term</div>
      </div>`;
    return;
  }

  artworks.forEach((artwork, i) => {
    const { bg, ink } = risoInks[i % risoInks.length];
    const image  = imgUrl(artwork.image_id);
    const artist = (artwork.artist_display ?? 'Unknown Artist').split('\n')[0];
    const medium = (artwork.medium_display ?? 'Work').split(' ')[0];
    const year   = (artwork.date_display ?? '').split('–')[0];

    const fig = document.createElement('figure');
    fig.className = 'card relative overflow-hidden cursor-pointer transition-[transform,box-shadow] duration-200 ease-out';
    fig.style.cssText = `background:${bg}; box-shadow:4px 4px 0 ${ink}88;`;

    fig.innerHTML = `
      <div class="overflow-hidden mx-3 mt-3 relative z-10"
        style="aspect-ratio:4/3; outline:2px solid ${ink}; outline-offset:-2px; background:${ink}11;">
        ${image
          ? `<img src="${image}" alt="${artwork.title}" loading="lazy" class="card-img w-full h-full object-cover block" />`
          : `<div class="w-full h-full flex items-center justify-center text-[0.65rem] tracking-widest opacity-30" style="color:#1a1a1a;">NO IMAGE</div>`
        }
      </div>

      <figcaption class="relative z-20 px-5 pt-4 pb-5">
        <span class="inline-block text-[0.58rem] font-bold tracking-widest uppercase px-2.5 py-0.5 mb-2.5"
          style="background:${ink}; color:${bg};">${medium}</span>

        <div class="font-extrabold text-[1.05rem] leading-tight mb-3 uppercase tracking-tight"
          style="color:#1a1a1a;">${artwork.title}</div>

        <div class="flex justify-between items-end">
          <span class="text-[0.7rem] leading-relaxed opacity-75" style="color:#1a1a1a;">${artist}</span>
          <span class="font-extrabold text-[1.3rem] leading-none opacity-[0.12]" style="color:#1a1a1a;">${year}</span>
        </div>

        <div class="mt-3 text-[0.6rem] tracking-wide opacity-45" style="color:#1a1a1a;">${artwork.date_display ?? ''}</div>
      </figcaption>
    `;

    // Hover effect
    fig.addEventListener('mouseenter', () => {
      fig.style.transform = 'translate(-4px,-4px)';
      fig.style.boxShadow = `8px 8px 0 ${ink}`;
    });
    fig.addEventListener('mouseleave', () => {
      fig.style.transform = 'translate(0,0)';
      fig.style.boxShadow = `4px 4px 0 ${ink}88`;
    });

    // Image fade-in once loaded
    const img = fig.querySelector('img');
    if (img) {
      img.addEventListener('load', () => img.classList.add('loaded'));
      if (img.complete) img.classList.add('loaded');
    }

    grid.appendChild(fig);
  });
}

// Render: Error
function renderError(msg) {
  grid.innerHTML = `
    <div class="col-span-3 font-bold text-sm text-[#e63946] bg-white border-2 border-[#e63946] px-6 py-4">
      ✕ ${msg}
    </div>`;
}

// Render: Pagination
function renderPagination() {
  if (totalPages <= 1) { pagination.innerHTML = ''; return; }

  pagination.innerHTML = `
    <button id="btn-prev"
      class="font-extrabold text-[0.7rem] tracking-widest uppercase text-[#f2ede4] bg-black border-[2.5px] border-black px-5 py-2.5 hover:bg-[#e63946] hover:border-[#e63946] transition-colors disabled:bg-[#e0dbd4] disabled:text-[#aaa] disabled:border-[#ccc] disabled:cursor-default"
      style="box-shadow:3px 3px 0 #e63946;"
      ${currentPage <= 1 ? 'disabled' : ''}>← Prev</button>

    <span class="font-bold text-[0.75rem] tracking-widest">${currentPage} / ${totalPages}</span>

    <button id="btn-next"
      class="font-extrabold text-[0.7rem] tracking-widest uppercase text-[#f2ede4] bg-black border-[2.5px] border-black px-5 py-2.5 hover:bg-[#06c8c8] hover:border-[#06c8c8] transition-colors disabled:bg-[#e0dbd4] disabled:text-[#aaa] disabled:border-[#ccc] disabled:cursor-default"
      style="box-shadow:3px 3px 0 #06c8c8;"
      ${currentPage >= totalPages ? 'disabled' : ''}>Next →</button>
  `;

  document.getElementById('btn-prev')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; fetchData(); scrollToTop(); }
  });
  document.getElementById('btn-next')?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage++; fetchData(); scrollToTop(); }
  });
}

// Fetch
async function fetchData() {
  renderSkeletons();
  pagination.innerHTML = '';
  searchBtn.textContent = '···';

  try {
    const url = currentQuery.trim()
      ? `${API}/artworks/search?q=${encodeURIComponent(currentQuery)}&fields=${FIELDS}&limit=${LIMIT}&page=${currentPage}&query[term][is_public_domain]=true`
      : `${API}/artworks?fields=${FIELDS}&limit=${LIMIT}&page=${currentPage}&query[term][is_public_domain]=true`;

    const res  = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const json = await res.json();

    const artworks = json.data.filter(a => a.image_id);
    const total    = json.pagination?.total ?? 0;
    totalPages     = Math.min(Math.ceil(total / LIMIT), 100);

    if (totalCount) totalCount.textContent = total.toLocaleString() + ' Works';

    if (currentQuery) {
      statusText.innerHTML = `Results for <strong>"${currentQuery}"</strong> — ${total.toLocaleString()} works`;
      searchStatus.classList.replace('hidden', 'flex');
    } else {
      searchStatus.classList.replace('flex', 'hidden');
    }

    renderCards(artworks);
    renderPagination();

  } catch (err) {
    renderError(err.message);
  } finally {
    searchBtn.textContent = 'Search';
  }
}

// Events
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentPage  = 1;
  fetchData();
  scrollToTop();
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Init
fetchData();