// ✅ Check-Check: Is JS Connected?
console.log('👍 JS Connected');

// ✅ Check-Check: Is data source accessible?
const dataSource = "https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,date_display,medium_display,image_id&limit=9&query[term][is_public_domain]=true";

const IIIF = "https://www.artic.edu/iiif/2";

const risoInks = [
  { bg: '#f7e642', ink: '#1a1a1a' },
  { bg: '#06c8c8', ink: '#1a1a1a' },
  { bg: '#e63946', ink: '#f7e642' },
  { bg: '#f7e642', ink: '#e63946' },
  { bg: '#06c8c8', ink: '#e63946' },
  { bg: '#e63946', ink: '#1a1a1a' },
];

// Get data
fetch( dataSource )
  .then( response => response.json() )
  .then( collection => {

    // ✅ Check-Check: Is the data good?
    console.log( collection );

    // Get container for data
    const dataContainer = document.querySelector(".dataContainer");

    // Clear the static template card now that real data is loading
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
          class="card relative overflow-hidden cursor-pointer transition-[transform,box-shadow] duration-200 ease-out"
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

  });