console.log('Helo from custom js');

(() => {
    const libchatHash = '1d73d9fc08accd85165ff98853a6f31d';
    const almaStr = `https://${location.hostname}/discovery/delivery/`; // indicates Alma viewer

    // Create style element and set its content
    const style = document.createElement('style');
    style.textContent = `
          #libchat_${libchatHash} button.libchat_online {
              border-radius: 0;
          }
          
          #libchat_modal_23785 {
              z-index: 100 !important;
          }
  
          .__xs ~ #libchat_${libchatHash} {
              display:none;
          }
      `;

    // Create script element for chat script
    const script = document.createElement('script');
    script.src = 'https://libanswers.calvin.edu/load_chat.php?hash=' + libchatHash;

    // Create div element for chat container
    const div = document.createElement('div');
    div.id = 'libchat_' + libchatHash;
    div.style.cssText = 'text-align: right; position:fixed; right: 0; bottom: 0;';

    setTimeout(() => {
        if (location.href.indexOf(almaStr) !== 0) {
            // don't include in Alma viewer
            // Append style, script, and div elements to the document body
            document.getElementsByTagName('body')[0].appendChild(style);
            document.getElementsByTagName('body')[0].appendChild(script);
            document.getElementsByTagName('body')[0].appendChild(div);
        }
    }, 2000);
})();


// Add Google Analytics GA4 gtag.js

(function addGoogleAnalytics() {
  // Avoid adding it twice
  if (document.getElementById('ga-gtag-script')) return;

  // 1) Load gtag.js
  const gtagScript = document.createElement('script');
  gtagScript.id = 'ga-gtag-script';
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-31PBLWBMCJ';
  document.head.appendChild(gtagScript);

  // 2) Inline config script
  const inlineScript = document.createElement('script');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-31PBLWBMCJ');
  `;
  document.head.appendChild(inlineScript);
})();

// --- New Books Carousel ---
(function () {
  let totalDisplayed = 0;
  let attempts = 0; // count processed books

  const MAX_DISPLAY = 20;
  const FALLBACK_COVER = "https://d2jv02qf7xgjwx.cloudfront.net/customers/726/images/default.png";

  const PNXS_URL =
    "/primaws/rest/external/pnxs?" +
    "acTriggered=false" +
    "&blendFacetsSeparately=false" +
    "&citationTrailFilterByAvailability=true" +
    "&disableCache=false" +
    "&getMore=0" +
    "&inst=01CALVIN_INST" +
    "&isCDSearch=false" +
    "&lang=en" +
    "&limit=20" +
    "&multiFacets=facet_location_code,include,8316%E2%80%93127046100008316%E2%80%93new+book%7C,%7Cfacet_location_code,include,8316%E2%80%93127046100008316%E2%80%93new+theo" +
    "&newspapersActive=true" +
    "&newspapersSearch=false" +
    "&offset=0" +
    "&otbRanking=false" +
    "&pcAvailability=false" +
    "&q=any,contains,%27*%27" +
    "&rapido=false" +
    "&refEntryActive=true" +
    "&rtaLinks=true" +
    "&scope=MyInst_and_CI" +
    "&searchInFulltextUserSelection=true" +
    "&skipDelivery=Y" +
    "&sort=rank" +
    "&tab=Everything" +
    "&vid=01CALVIN_INST:01CALVIN_INST";

  fetch(PNXS_URL)
    .then(res => {
      if (!res.ok) throw new Error("PNXS HTTP " + res.status);
      return res.json();
    })
    .then(json => {
      const results = Array.isArray(json.docs) ? json.docs : [];

      console.log("PNXS docs:", results.length);

      // Remove items without ISBN
      let i = 0;
      while (i < results.length) {
        const isbn =
          results[i]?.pnx?.addata?.isbn?.[0] ||
          results[i]?.pnx?.addata?.eisbn?.[0];

        if (!isbn) {
          results.splice(i, 1);
        } else {
          i++;
        }
      }

      console.log("After ISBN filter:", results.length);
      if (!results.length) {
        stopSpinner();
        return;
      }

      const randomIndexes = getRandomNumbers(MAX_DISPLAY, results.length);
      bookCoverGrab({ docs: results }, randomIndexes);
    })
    .catch(err => {
      console.error("PNXS fetch failed:", err);
      stopSpinner();
    });

  // --- Random helper ---
  function getRandomNumbers(howMany, upperLimit) {
    const nums = [];
    while (nums.length < howMany && nums.length < upperLimit) {
      const r = Math.floor(Math.random() * upperLimit);
      if (!nums.includes(r)) nums.push(r);
    }
    return nums;
  }

  // --- JSONP helper (Google Books) ---
  function jsonp(url) {
    return new Promise((resolve, reject) => {
      const cb = "jsonp_cb_" + Math.random().toString(36).slice(2);

      window[cb] = data => {
        resolve(data);
        delete window[cb];
        script.remove();
      };

      const script = document.createElement("script");
      script.src = url.replace("callback=?", `callback=${cb}`);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // --- Cover lookup ---
  function bookCoverGrab(input, randos) {
    for (let i = 0; i < randos.length; i++) {
      if (totalDisplayed >= MAX_DISPLAY) break;

      const item = input.docs[randos[i]];
      if (!item) {
        attempts++;
        stopSpinnerIfDone(randos.length);
        continue;
      }

      const isbn =
        item?.pnx?.addata?.isbn?.[0] ||
        item?.pnx?.addata?.eisbn?.[0];

      if (!isbn) {
        attempts++;
        stopSpinnerIfDone(randos.length);
        continue;
      }

      const title = item.pnx.display.title?.[0] || "Untitled";

      const permalink =
        `https://calvin.primo.exlibrisgroup.com/permalink/01CALVIN_INST/1urmrt3/` +
        `${item.pnx.control.sourceid}${item.pnx.control.sourcerecordid}`;

      const coverURL =
        `https://books.google.com/books?bibkeys=ISBN:${isbn}&jscmd=viewapi&callback=?`;

      jsonp(coverURL)
        .then(data => {
          const key = `ISBN:${isbn}`;
          const cover =
            data?.[key]?.thumbnail_url || FALLBACK_COVER;

          addToDom(cover, title, permalink);
        })
        .catch(err => console.error("Cover fetch error:", err))
        .finally(() => {
          attempts++;
          stopSpinnerIfDone(randos.length);
        });
    }
  }

  // --- DOM insertion ---
  function addToDom(img, title, link) {
    if (totalDisplayed >= MAX_DISPLAY) return;

    const html = `
      <li class="new-books-li">
        <div class="content">
          <a href="${link}" target="_blank">
            <div class="content-overlay"></div>
            <img class="content-image book-cover" src="${img}">
            <div class="content-details fadeIn-bottom">
              <div class="content-title">${title}</div>
            </div>
          </a>
        </div>
      </li>
    `;

    document
      .getElementById("carousel")
      .insertAdjacentHTML("beforeend", html);

    totalDisplayed++;
  }

  // --- Spinner helpers ---
  function stopSpinnerIfDone(total) {
    if (totalDisplayed >= MAX_DISPLAY || attempts >= total) {
      stopSpinner();
    }
  }

  function stopSpinner() {
    const preloader = document.getElementById("library-preloader");
    if (preloader) preloader.style.display = "none";
  }
})();

