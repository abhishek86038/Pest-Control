const test=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('../../contact-form-service/node_modules/playwright');
const {mkdirSync}=require('node:fs');
let server,browser,base;
test.before(async()=>{
  const {createSiteServer}=await import('../server/index.mjs');
  server=createSiteServer({env:{}});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  base=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({headless:true});
});
test.after(async()=>{await browser?.close();if(server) await new Promise(done=>server.close(done));});
async function pageAt(width=1440,height=1000){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  await page.goto(base+'/');
  return page;
}
test('desktop guide: welcome, service links, keyboard, reset, safe text and all-page loading',async()=>{
  const page=await pageAt();
  try{
    await page.getByRole('button',{name:'Open Andy’s pest control chat'}).click();
    await page.getByRole('heading',{name:'What are we protecting today?'}).waitFor();
    mkdirSync('/tmp/creepy-andy-chat-preview',{recursive:true});
    await page.screenshot({path:'/tmp/creepy-andy-chat-preview/desktop.png'});
    await page.getByRole('button',{name:/Arrange a termite inspection/}).click();
    await page.locator('.cc-chat-message-assistant').waitFor();
    assert.equal(await page.locator('.cc-chat-message-user').count(),1);
    assert.equal(await page.getByRole('link',{name:/Termite inspections & protection/}).getAttribute('href'),'/services.html#residential');
    await page.locator('#ccChatInput').fill('<img src=x onerror=alert(1)>');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    assert.equal(await page.locator('.cc-chat-messages img').count(),0);
    assert.match(await page.locator('.cc-chat-message-user').last().innerText(),/<img/);
    await page.getByRole('button',{name:/New chat/}).click();
    assert.equal(await page.locator('.cc-chat-message').count(),0);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#ccChatPanel').isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Open Andy’s pest control chat');
    await page.goto(base+'/services.html#residential');
    await page.getByRole('button',{name:'Open Andy’s pest control chat'}).waitFor();
  }finally{await page.close();}
});
test('mobile at 390px and 320px: panel and composer fit, conversation remains usable',async()=>{
  for(const width of [390,320]){
    const page=await pageAt(width,740);
    try{
      await page.getByRole('button',{name:'Open Andy’s pest control chat'}).click();
      const panel=await page.locator('#ccChatPanel').boundingBox();
      assert.ok(panel.x>=0 && panel.x+panel.width<=width && panel.y+panel.height<=740);
      const composer=await page.locator('.cc-chat-composer').boundingBox();
      assert.ok(composer.x>=0 && composer.x+composer.width<=width && composer.y+composer.height<=740);
      if(width===390) await page.screenshot({path:'/tmp/creepy-andy-chat-preview/mobile.png'});
      await page.getByRole('button',{name:/Get a treatment quote/}).click();
      await page.getByRole('link',{name:/Request a personalised quote/}).waitFor();
      if(width===390) await page.screenshot({path:'/tmp/creepy-andy-chat-preview/mobile-reply.png'});
      await page.getByRole('button',{name:'Close chat',exact:true}).click();
    }finally{await page.close();}
  }
});
test('AI failure retry keeps one user message and reset cancels an in-flight reply',async()=>{
  const page=await pageAt();
  let calls=0;
  const payloads=[];
  await page.route('**/api/chat',async route=>{
    if(route.request().method()==='GET') return route.fulfill({json:{mode:'ai'}});
    calls++;payloads.push(route.request().postDataJSON());
    if(calls===1) return route.fulfill({status:503,json:{error:'unavailable'}});
    if(calls===3) await new Promise(done=>setTimeout(done,300));
    return route.fulfill({json:{text:'Please request a quote through the contact form.',links:[{title:'Request a quote',href:'/contact.html'},{title:'Bad link',href:'javascript:alert(1)'}],mode:'ai'}}).catch(()=>{});
  });
  try{
    await page.getByRole('button',{name:'Open Andy’s pest control chat'}).click();
    await page.getByText('AI assistant',{exact:true}).waitFor();
    await page.locator('#ccChatInput').fill('How do I request a quote?');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByRole('button',{name:'Retry',exact:true}).click();
    await page.locator('.cc-chat-message-assistant').waitFor();
    assert.equal(await page.locator('.cc-chat-message-user').count(),1);
    assert.deepEqual(payloads[0],payloads[1]);
    assert.equal(await page.locator('a[href^="javascript:"]').count(),0);
    await page.locator('#ccChatInput').fill('What about termites?');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByRole('button',{name:/New chat/}).click();
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.cc-chat-message').count(),0);
    assert.equal(await page.locator('#ccChatInput').isEnabled(),true);
  }finally{await page.close();}
});

test('tab history keeps links, visibility and AI context across navigation; reset clears it',async()=>{
  const page=await pageAt();
  const payloads=[];
  await page.route('**/api/chat',route=>{
    if(route.request().method()==='GET') return route.fulfill({json:{mode:'ai'}});
    payloads.push(route.request().postDataJSON());
    return route.fulfill({json:{text:'You can request a quote here.',links:[{title:'Request a quote',href:'/contact.html'}],mode:'ai'}});
  });
  try {
    await page.getByRole('button',{name:'Open Andy’s pest control chat'}).click();
    await page.getByText('AI assistant',{exact:true}).waitFor();
    await page.locator('#ccChatInput').fill('I need help with termites.');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.locator('.cc-chat-links a').click();
    await page.waitForURL('**/contact.html');
    await page.locator('.cc-chat-message-assistant').waitFor();
    assert.equal(await page.locator('#ccChatPanel').isVisible(),true);
    assert.equal(await page.locator('.cc-chat-links a').getAttribute('href'),'/contact.html');
    await page.locator('#ccChatInput').fill('And a quote?');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.waitForFunction(()=>document.querySelectorAll('.cc-chat-message-assistant').length===2);
    assert.deepEqual(payloads[1].messages,[
      {role:'user',content:'I need help with termites.'},
      {role:'assistant',content:'You can request a quote here.'},
      {role:'user',content:'And a quote?'},
    ]);
    await page.getByRole('button',{name:'Close chat',exact:true}).click();
    await page.goto(base+'/services.html#residential');
    await page.locator('.cc-chat-launcher').waitFor();
    assert.equal(await page.locator('#ccChatPanel').isVisible(),false);
    await page.getByRole('button',{name:'Open Andy’s pest control chat'}).click();
    assert.equal(await page.locator('.cc-chat-message').count(),4);
    // A separate browsing context starts without this tab's conversation.
    const other=await pageAt();
    assert.equal(await other.locator('.cc-chat-message').count(),0);
    await other.close();
    await page.getByRole('button',{name:/New chat/}).click();
    await page.reload();
    await page.locator('#ccChatPanel').waitFor();
    assert.equal(await page.locator('.cc-chat-message').count(),0);
    assert.equal(payloads.length,2);
  } finally { await page.close(); }
});

test('interrupted requests restore with manual retry, without a duplicate user message',async()=>{
  const page=await pageAt();
  let calls=0;
  let release;
  const pending=new Promise(done=>{release=done;});
  await page.route('**/api/chat',async route=>{
    if(route.request().method()==='GET') return route.fulfill({json:{mode:'ai'}});
    calls++;
    if(calls===1) await pending;
    await route.fulfill({json:{text:'Please contact the team.',links:[],mode:'ai'}}).catch(()=>{});
  });
  try {
    await page.getByRole('button',{name:'Open Andy’s pest control chat'}).click();
    await page.getByText('AI assistant',{exact:true}).waitFor();
    const requested=page.waitForRequest(req=>req.url().endsWith('/api/chat') && req.method()==='POST');
    await page.locator('#ccChatInput').fill('Please help with termites');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await requested;
    await page.goto(base+'/contact.html');
    release();
    await page.getByText('Your previous reply was interrupted. Retry to continue.',{exact:true}).waitFor();
    assert.equal(calls,1);
    await page.getByRole('button',{name:'Retry',exact:true}).click();
    await page.locator('.cc-chat-message-assistant').waitFor();
    assert.equal(calls,2);
    assert.equal(await page.locator('.cc-chat-message-user').count(),1);
  } finally { release(); await page.close(); }
});

test('unavailable or malformed session storage does not break chat',async()=>{
  for(const blocked of [false,true]) {
    const page=await pageAt();
    try {
      await page.addInitScript(blocked=>{
        if(blocked) Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Storage disabled');}});
        else sessionStorage.setItem('creepycrawly-andy:chat:v1','{"version":1,"open":true,"messages":[null]}');
      },blocked);
      await page.reload();
      await page.getByRole('button',{name:'Open Andy’s pest control chat'}).click();
      await page.getByRole('button',{name:/Arrange a termite inspection/}).click();
      await page.locator('.cc-chat-message-assistant').waitFor();
      await page.getByRole('button',{name:/New chat/}).click();
      assert.equal(await page.locator('.cc-chat-message').count(),0);
    } finally { await page.close(); }
  }
});
