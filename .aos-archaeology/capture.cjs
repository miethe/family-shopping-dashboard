const {chromium}=require('../apps/web/node_modules/@playwright/test');
const fs=require('fs');
(async()=>{const root=process.cwd()+ '/.aos-archaeology'; const browser=await chromium.launch({headless:true,executablePath:'/Users/miethe/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
await context.route('**/*',route=>{let u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)?route.continue():route.abort();});
const page=await context.newPage();const events=[];page.on('pageerror',e=>events.push({type:'pageerror',text:e.message}));page.on('response',r=>{if(r.status()>=400) events.push({type:'http',url:r.url(),status:r.status()});});
try {
 await page.goto('http://localhost:3030/login',{waitUntil:'networkidle',timeout:120000});
 await page.locator('input[type=email]').fill('archaeology-demo@example.invalid');await page.locator('input[type=password]').fill('FakeDemoOnly2026!');
 await page.getByRole('button',{name:/log in/i}).click();await page.waitForTimeout(4000);
 for(const [name,url] of [['login-error','/login'],['register','/register'],['component-library','/ui-demo']]){
  if(!page.url().endsWith(url))await page.goto('http://localhost:3030'+url,{waitUntil:'networkidle',timeout:120000});
  await page.waitForTimeout(3000); await page.screenshot({path:root+'/'+name+'.png'});
  fs.writeFileSync(root+'/'+name+'-dom.txt',await page.locator('body').innerText());
  events.push({type:'capture',name,url:page.url(),title:await page.title(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
} finally {fs.writeFileSync(root+'/browser-results.json',JSON.stringify(events,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
