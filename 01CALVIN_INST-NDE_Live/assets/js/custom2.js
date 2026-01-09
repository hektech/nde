
(function () {
  let totalDisplayed = 0;

  const PRIMO_URL =
    "https://calvin.primo.exlibrisgroup.com/primaws/rest/external/pnxs?acTriggered=false&blendFacetsSeparately=false&citationTrailFilterByAvailability=true&disableCache=false&getMore=0&inst=01CALVIN_INST&isCDSearch=false&lang=en&limit=20&multiFacets=facet_location_code,include,8316%E2%80%93127046100008316%E2%80%93new+book%7C,%7Cfacet_location_code,include,8316%E2%80%93127046100008316%E2%80%93new+theo&newspapersActive=true&newspapersSearch=false&offset=0&otbRanking=false&pcAvailability=false&q=any,contains,%27*%27&qExclude=&qInclude=&rapido=false&refEntryActive=true&rtaLinks=true&scope=MyInst_and_CI&searchInFulltextUserSelection=true&skipDelivery=Y&sort=rank&tab=Everything&vid=01CALVIN_INST:01CALVIN_INST";

  // Fetch Primo results
  fetch(PRIMO_URL)
    .then(response => response.json())
    .then(result => {
      const docs = result.docs;
      const total = docs.length;

      const randomIndexes = getRandomNumbers(10, total);
      bookCoverGrab(result, randomIndexes);
    })
    .catch(err => console.error("Primo API error:", err));

  // Generate unique random numbers
  function getRandomNumbers(howMany, upperLimit) {
    const numbers = new Set();
    while (numbers.size < howMany && numbers.size < upperLimit) {
      numbers.add(Math.floor(Math.random() * upperLimit));
    }
    return Array.from(numbers);
  }

  // Get Google Books covers
  function bookCoverGrab(input, randos) {
    randos.forEach(index => {
      const doc = input.docs[index];
      const isbn = doc?.pnx?.search?.isbn?.[0];
      if (!isbn) return;

      const title = doc.pnx.display.title;
      const catalogLink = `
        <a href="https://calvin.primo.exlibrisgroup.com/permalink/01CALVIN_INST/1urmrt3/${item.pnx.control.sourceid}${item.pnx.control.sourcerecordid}"
        target="_blank">
      `;

      fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        .then(res => res.json())
        .then(data => {
          const thumbnail =
            data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;

          if (thumbnail) {
            addToDom(thumbnail, title, catalogLink);
            totalDisplayed++;
          }
        })
        .catch(err => console.error("Google Books API error:", err));
    });
  }
})();
