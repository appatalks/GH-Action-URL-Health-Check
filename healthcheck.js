const https = require('https');
const { exec } = require('child_process');
const puppeteer = require('puppeteer'); // Import Puppeteer

const urlToCheck = process.env.URL_TO_CHECK;

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0', // Set a User-Agent header
  },
};

function checkHealth(url) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      const statusCode = res.statusCode;
      const failed = statusCode !== 200 ? 'true' : 'false'; // Set 'true' when failed
      resolve({ statusCode, failed });
    }).on('error', (err) => {
      resolve({ statusCode: 0, failed: 'true', error: err.message }); // Set 'true' for errors
    });
  });
}

async function captureScreenshot(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.screenshot({ path: 'screenshot.png' }); // Capture screenshot
  await browser.close();
}

async function run() {
  const { statusCode, failed } = await checkHealth(urlToCheck);
  console.log(`URL: ${urlToCheck}`);
  console.log(`Status Code: ${statusCode}`);
  console.log(`Failed: ${failed}`);

const fs = require('fs');

if (failed) {
    console.error(`Health check failed for URL: ${urlToCheck}`);
    console.error(`Status Code: ${statusCode}`);

    // Capture a screenshot of the URL
    await captureScreenshot(urlToCheck);
    
    // Convert statusCode to a string and write it to the file
    fs.writeFileSync('STATUS_CODE.txt', statusCode.toString());
    
    // Write the failedUrls to the file
    fs.writeFileSync('FAILED_URLS.txt', urlToCheck);
    
    process.exit(1); // This will cause the script to exit with a non-zero status code
}

}
run();
