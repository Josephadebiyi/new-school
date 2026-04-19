const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' }); // assuming standard debug port or what?
  // Not possible easily. Let's just use curl.
})();
