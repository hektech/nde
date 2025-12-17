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

