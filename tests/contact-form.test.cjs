const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { chromium } = require('../../contact-form-service/node_modules/playwright');
const { createApp } = require('../../contact-form-service/src/app');
const { createSiteRegistry } = require('../../contact-form-service/src/sites');
const { TEST_CONFIG, fakeMailer } = require('../../contact-form-service/test/helpers');

const listen = server => new Promise(done => server.listen(0, '127.0.0.1', () => done(`http://127.0.0.1:${server.address().port}`)));
const close = server => new Promise(done => server.close(done));

test('quote form uses shared JSON API; lost acknowledgement retries once; phone-only requests work', async () => {
  const {createSiteServer} = await import('../server/index.mjs');
  const siteServer = createSiteServer({env:{}});
  const siteUrl = await listen(siteServer);
  const source = createSiteRegistry().get('creepycrawly-andy');
  const mailer = fakeMailer();
  const apiServer = createServer(createApp({ config: TEST_CONFIG,
    sites: new Map([[source.id, { ...source, allowedOrigins: [siteUrl] }]]), mailer,
  }));
  const apiUrl = await listen(apiServer);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.route('**/*', route => new URL(route.request().url()).origin === siteUrl ? route.continue() : route.abort());
    const sent = [];
    await page.route('http://localhost:10000/v1/contact/creepycrawly-andy', async route => {
      sent.push(route.request().postDataJSON());
      const response = await route.fetch({ url: `${apiUrl}/v1/contact/creepycrawly-andy` });
      if (sent.length === 1) await route.fulfill({ status: 502, contentType: 'application/json', body: '{"ok":false}' });
      else await route.fulfill({ response });
    });
    await page.goto(`${siteUrl}/`);
    await page.getByRole('button', {name:'Open Andy’s pest control chat'}).click();
    await page.getByRole('button', {name:/Get a treatment quote/}).click();
    await page.getByRole('link', {name:/Request a personalised quote/}).click();
    await page.waitForURL('**/contact.html');
    await page.locator('.cc-chat-message-assistant').waitFor();
    await page.getByRole('button', {name:'Close chat', exact:true}).click();
    assert.equal(await page.locator('input[name="access_key"]').count(), 0);
    await page.getByRole('button', { name: 'Send quote request' }).click();
    assert.equal(sent.length, 0);
    await page.locator('#qName').fill('Local Quote Test');
    await page.locator('#qPhone').fill('0400000000');
    await page.locator('#qSuburb').fill('Glenmore Park');
    await page.locator('#qService').selectOption('Termite inspection');
    await page.locator('#qMessage').fill('Please call me about an inspection.');
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await page.locator('#quoteFormStatus.is-error').waitFor();
    assert.equal(await page.locator('#qName').inputValue(), 'Local Quote Test');
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await page.locator('#quoteFormStatus.is-success').waitFor();
    assert.deepEqual(sent[0], sent[1]);
    assert.equal(sent[0].email, '');
    assert.equal(sent[0].company, '');
    assert.equal(mailer.messages.length, 1);
    assert.deepEqual(mailer.messages[0].to, ['info@creepycrawly.com.au', 'creepysw@gmail.com']);
    assert.equal(mailer.messages[0].replyTo, undefined);
    assert.equal(await page.locator('#qName').inputValue(), '');
    // A fresh successful form gets a new identity and keeps optional email.
    await page.locator('#qName').fill('Second Visitor');
    await page.locator('#qPhone').fill('0400000000');
    await page.locator('#qSuburb').fill('Penrith');
    await page.locator('#qEmail').fill('visitor@example.com');
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await page.locator('#quoteFormStatus.is-success').waitFor();
    assert.notEqual(sent[2].submissionId, sent[0].submissionId);
    assert.equal(mailer.messages.length, 2);
    assert.equal(mailer.messages[1].replyTo, 'visitor@example.com');
    await page.getByRole('button', {name:'Open Andy’s pest control chat'}).click();
    assert.equal(await page.locator('.cc-chat-message').count(), 2);
  } finally {
    await browser?.close();
    await close(apiServer);
    await close(siteServer);
  }
});
