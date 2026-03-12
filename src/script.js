// ✅ Check-Check: Is JS Connected?
console.log('👍 JS Connected');

// ✅ Check-Check: Is data source accessible?
const API_BASE = "https://api.artic.edu/api/v1/artworks";
const PAGE_SIZE = 9;

const IIIF = "https://www.artic.edu/iiif/2";

const risoInks = [
  { bg: '#f7e642', ink: '#1a1a1a' },
  { bg: '#06c8c8', ink: '#1a1a1a' },
  { bg: '#e63946', ink: '#f7e642' },
  { bg: '#f7e642', ink: '#e63946' },
  { bg: '#06c8c8', ink: '#e63946' },
  { bg: '#e63946', ink: '#1a1a1a' },
];

// Get container for data
const dataContainer = document.querySelector(".dataContainer");

// Get DOM elements for search + count
const searchForm   = document.getElementById("search-form");
const searchInput  = document.getElementById("search-input");
const searchStatus = document.getElementById("search-status");
const statusText   = document.getElementById("search-status-text");
const clearBtn     = document.getElementById("clear-btn");
const totalCount   = document.getElementById("total-count");
const prevBtn      = document.getElementById("btn-prev");
const nextBtn      = document.getElementById("btn-next");
const pageText     = document.querySelector("#pagination span");

// Track current search query
let currentQuery = "";
let currentPage = 1;
let totalPages = 1;

// Build the URL based on whether there is a search query or not
function buildUrl( query, page = 1 ) {
  const fields = "id,title,artist_display,date_display,medium_display,image_id";

  if ( query ) {
    return `${API_BASE}/search?q=${encodeURIComponent(query)}&fields=${fields}&limit=${PAGE_SIZE}&page=${page}&query[term][is_public_domain]=true`;
  }
  return `${API_BASE}?fields=${fields}&limit=${PAGE_SIZE}&page=${page}&query[term][is_public_domain]=true`;
}

function updatePaginationUI() {
  if ( pageText ) {
    pageText.textContent = `${currentPage} / ${totalPages}`;
  }

  if ( prevBtn ) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.style.opacity = currentPage <= 1 ? "0.45" : "1";
    prevBtn.style.cursor = currentPage <= 1 ? "not-allowed" : "pointer";
  }

  if ( nextBtn ) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.style.opacity = currentPage >= totalPages ? "0.45" : "1";
    nextBtn.style.cursor = currentPage >= totalPages ? "not-allowed" : "pointer";
  }
}

// Get data
function fetchArtworks( query = "", page = 1 ) {

  const url = buildUrl( query, page );

  fetch( url )
    .then( response => response.json() )
    .then( collection => {

      // ✅ Check-Check: Is the data good?
      console.log( collection );

      // Update total count in the header
      const total = collection.pagination?.total ?? 0;
      currentPage = collection.pagination?.current_page ?? page;
      totalPages = collection.pagination?.total_pages ?? 1;
      if ( totalCount ) {
        totalCount.textContent = total.toLocaleString() + " Works";
      }

      // Show or hide search status bar
      if ( searchStatus && statusText ) {
        if ( query ) {
          statusText.textContent = `Results for "${query}" - ${total.toLocaleString()} works`;
          searchStatus.classList.replace("hidden", "flex");
        } else {
          searchStatus.classList.replace("flex", "hidden");
        }
      }

      // Clear previous cards
      dataContainer.innerHTML = "";

      // ✅ Check-Check: Are you accessing an array of records?
      collection.data.forEach( (record, index) => {

        // Skip records with no image
        if ( !record.image_id ) return;

        // Build image URL using the IIIF server
        const imageUrl = `${IIIF}/${record.image_id}/full/400,/0/default.jpg`;

        // Pick riso ink colors based on card index
        const { bg, ink } = risoInks[ index % risoInks.length ];

        // Pull out the fields we need
        const title  = record.title ?? "Untitled";
        const artist = ( record.artist_display ?? "Unknown Artist" ).split("\n")[0];
        const date   = record.date_display ?? "";
        const medium = ( record.medium_display ?? "Work" ).split(" ")[0];
        const year   = date.split("–")[0];

        // Template
        const template = `
          <figure
            class="card relative overflow-hidden transition-[transform,box-shadow] duration-200 ease-out"
            style="background:${bg}; box-shadow:4px 4px 0 ${ink}88;"
          >
            <!-- Artwork image -->
            <div
              class="overflow-hidden mx-3 mt-3 relative z-10"
              style="aspect-ratio:4/3; outline:2px solid ${ink}; outline-offset:-2px; background:${ink}11;"
            >
              <img
                src="${imageUrl}"
                alt="${title}"
                loading="lazy"
                class="card-img w-full h-full object-cover block"
              />
            </div>

            <!-- Caption -->
            <figcaption class="relative z-20 px-5 pt-4 pb-5">

              <!-- Medium badge -->
              <span
                class="inline-block text-[0.58rem] font-bold tracking-widest uppercase px-2.5 py-0.5 mb-2.5"
                style="background:${ink}; color:${bg};"
              >${medium}</span>

              <!-- Title -->
              <div
                class="font-extrabold text-[1.05rem] leading-tight mb-3 uppercase tracking-tight"
                style="color:${ink};"
              >${title}</div>

              <!-- Artist + ghost year -->
              <div class="flex justify-between items-end">
                <span class="text-[0.7rem] leading-relaxed opacity-75" style="color:${ink};">${artist}</span>
                <span class="font-extrabold text-[1.3rem] leading-none opacity-[0.12]" style="color:${ink};">${year}</span>
              </div>

              <!-- Date -->
              <div class="mt-3 text-[0.6rem] tracking-wide opacity-45" style="color:${ink};">${date}</div>

            </figcaption>
          </figure>
        `;

        // Insert each record into the container
        dataContainer.insertAdjacentHTML("afterbegin", template);
      });

      updatePaginationUI();

    });
}

// Search: listen for form submit
if ( searchForm && searchInput ) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    fetchArtworks( currentQuery, currentPage );
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Clear button: reset back to default
if ( clearBtn && searchInput ) {
  clearBtn.addEventListener("click", () => {
    currentQuery      = "";
    currentPage       = 1;
    searchInput.value = "";
    if ( searchStatus ) {
      searchStatus.classList.replace("flex", "hidden");
    }
    fetchArtworks( "", currentPage );
  });
}

if ( prevBtn ) {
  prevBtn.addEventListener("click", () => {
    if ( currentPage <= 1 ) return;
    currentPage -= 1;
    fetchArtworks( currentQuery, currentPage );
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if ( nextBtn ) {
  nextBtn.addEventListener("click", () => {
    if ( currentPage >= totalPages ) return;
    currentPage += 1;
    fetchArtworks( currentQuery, currentPage );
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ✅ Initial load
fetchArtworks( "", currentPage );