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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
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
