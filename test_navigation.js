const puppeteer = require('puppeteer');

async function testNavigation() {
  console.log('Starting navigation tests...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    // Test main page
    console.log('Testing main page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Test login
    console.log('Testing login...');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Test key navigation routes
    const routes = [
      '#dashboard',
      '#projects', 
      '#campaigns',
      '#tasks',
      '#assets',
      '#content-repository',
      '#service-pages',
      '#smm-posting',
      '#on-page-errors',
      '#backlink-submission',
      '#admin-console',
      '#integrations',
      '#kpi-tracking',
      '#traffic-ranking',
      '#settings'
    ];
    
    for (const route of routes) {
      console.log(`Testing route: ${route}`);
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      
      // Check for error elements
      const errorElements = await page.$$('.text-red-600, .bg-red-50, [data-testid="error"]');
      if (errorElements.length > 0) {
        console.log(`⚠️  Found potential error on ${route}`);
      }
      
      // Check if page has content
      const hasContent = await page.evaluate(() => {
        return document.body.innerText.length > 100;
      });
      
      if (!hasContent) {
        console.log(`❌ Page ${route} appears to be empty or blank`);
      } else {
        console.log(`✅ Route ${route} loaded successfully`);
      }
    }
    
    console.log('Navigation tests completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testNavigation();
