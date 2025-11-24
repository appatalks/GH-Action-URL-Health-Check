const puppeteer = require('puppeteer');
const fs = require('fs');

let urlToCheck = process.env.URL_TO_CHECK;

// Ensure URL has protocol prefix
if (urlToCheck && !urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
  urlToCheck = 'https://' + urlToCheck;
}

async function checkHealthAndCapture(url) {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set viewport and user agent
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  let statusCode = 0;
  let failed = true;
  
  try {
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    statusCode = response.status();
    failed = statusCode !== 200;
    
    // Capture screenshot
    await page.screenshot({ path: 'screenshot.png', fullPage: false });
    
  } catch (err) {
    console.error('Error during page load:', err.message);
    statusCode = 0;
    failed = true;
    
    // Try to capture screenshot even on error
    try {
      await page.screenshot({ path: 'screenshot.png', fullPage: false });
    } catch (screenshotErr) {
      console.error('Failed to capture screenshot:', screenshotErr.message);
    }
  } finally {
    await browser.close();
  }
  
  return { statusCode, failed };
}

async function run() {
  console.log(`Checking URL: ${urlToCheck}`);
  
  const { statusCode, failed } = await checkHealthAndCapture(urlToCheck);
  
  console.log(`URL: ${urlToCheck}`);
  console.log(`Status Code: ${statusCode}`);
  console.log(`Failed: ${failed}`);

  // Always write status code file
  fs.writeFileSync('STATUS_CODE.txt', statusCode.toString());

  if (failed) {
    console.error(`Health check failed for URL: ${urlToCheck}`);
    console.error(`Status Code: ${statusCode}`);
    
    fs.writeFileSync('FAILED_URLS.txt', urlToCheck);
    
    process.exit(1);
  } else {
    console.log('Health check passed!');
  }
}

run();
