const https = require('https');
const { exec } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');

let urlToCheck = process.env.URL_TO_CHECK;

// Ensure URL has protocol prefix
if (urlToCheck && !urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
  urlToCheck = 'https://' + urlToCheck;
}

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0',
  },
};

function checkHealth(url) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      const statusCode = res.statusCode;
      const failed = statusCode !== 200;
      resolve({ statusCode, failed });
    }).on('error', (err) => {
      resolve({ statusCode: 0, failed: true, error: err.message });
    });
  });
}

async function captureScreenshot(url) {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
}

async function run() {
  const { statusCode, failed } = await checkHealth(urlToCheck);
  console.log(`URL: ${urlToCheck}`);
  console.log(`Status Code: ${statusCode}`);
  console.log(`Failed: ${failed}`);

  // Always capture screenshot
  try {
    await captureScreenshot(urlToCheck);
    console.log('Screenshot captured successfully');
  } catch (err) {
    console.error('Failed to capture screenshot:', err.message);
  }

  // Always write status code file
  fs.writeFileSync('STATUS_CODE.txt', statusCode.toString());

  if (failed) {
    console.error(`Health check failed for URL: ${urlToCheck}`);
    console.error(`Status Code: ${statusCode}`);
    
    fs.writeFileSync('FAILED_URLS.txt', urlToCheck);
    
    process.exit(1);
  }
}

run();
