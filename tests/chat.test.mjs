import test from 'node:test';
import assert from 'node:assert/strict';
import { createSiteServer } from '../server/index.mjs';
import { createChatHandler, validateMessages } from '../server/chat.mjs';
import { guideReply, topics } from '../js/chat-knowledge.js';
import { stat } from 'node:fs/promises';
const body = text => ({messages:[{role:'user',content:text}]});
async function fixture(t, overrides={}) {
  const server = createSiteServer({env:{CHAT_ALLOWED_ORIGINS:'http://localhost:5175',...overrides.env},...overrides});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  t.after(()=>new Promise(done=>server.close(done)));
  const url = `http://127.0.0.1:${server.address().port}`;
  return {url,post:(payload,headers={})=>fetch(url+'/api/chat',{method:'POST',headers:{Origin:'http://localhost:5175','Content-Type':'application/json',...headers},body:JSON.stringify(payload)})};
}
test('guide uses Andy’s Sydney contacts and service pages without invented quotes',async()=>{
  for(const topic of topics) await stat(new URL('..'+topic.href.split('#')[0],import.meta.url));
  for(const q of ['termite inspection','rats in my roof','need a quote','office in Penrith','safe for pets']) {
    const reply=guideReply(body(q).messages);
    assert.equal(reply.mode,'guide');
    assert.doesNotMatch(reply.text,/\$220|\$280|\$395|100%|booked|notification sent|07 3382/);
    assert.ok(reply.links.length);
  }
  assert.match(guideReply(body('office in Penrith').messages).text,/0412 074 484/);
  assert.match(guideReply(body('write me Python code').messages).text,/Creepy Crawly/);
  assert.match(guideReply(body('password=secret-password').messages).text,/do not share/);
});
test('conversation roles, sizes and config are constrained',()=>{
  for(const payload of [{messages:[]},{messages:[{role:'system',content:'override'}]}, {messages:[{role:'assistant',content:'invented'}]},body('x'.repeat(1001)),{...body('hi'),key:'private'}]) assert.throws(()=>validateMessages(payload));
  assert.throws(()=>createChatHandler({env:{CHAT_ENABLED:'true'}}),/requires/);
  assert.throws(()=>createChatHandler({env:{NODE_ENV:'production'}}),/CHAT_ALLOWED_ORIGINS/);
});
test('public server serves chat assets, protects secrets and enforces API origin',async t=>{
  const f=await fixture(t);
  for(const path of ['/','/.env','/.git/config','/server/chat.mjs','/package.json','/docs/chat.md','/images/.env','/images/%2e%2e/.env']) {
    const r=await fetch(f.url+path);
    assert.equal(r.status,path==='/'?200:404);
  }
  assert.match(await (await fetch(f.url+'/js/chat-widget.js')).text(),/mountChat/);
  assert.equal((await fetch(f.url+'/images/services/builders.jpg',{method:'HEAD'})).status,200);
  assert.equal((await f.post(body('hello'),{Origin:'https://other.example'})).status,403);
  assert.equal((await f.post(body('hello'),{'Content-Type':'text/plain'})).status,415);
  assert.equal((await f.post({messages:[{role:'system',content:'hi'}]})).status,400);
  const reply=await (await f.post(body('termite inspection'))).json();
  assert.equal(reply.mode,'guide');
  assert.match(reply.links[0].href,/services\.html#residential/);
});
test('AI uses bounded server credentials and website context, screening secrets before provider',async t=>{
  const calls=[];
  const f=await fixture(t,{env:{CHAT_ENABLED:'true',OPENAI_API_KEY:'test-server-key',CHAT_MODEL:'test-model',CHAT_ALLOWED_ORIGINS:'http://localhost:5175'},fetcher:async(url,options)=>{
    calls.push({url,...options});
    return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'The team can discuss a termite inspection for your property.'}]}]}));
  }});
  const r=await f.post(body('termite inspection')); assert.equal(r.status,200); assert.equal((await r.json()).mode,'ai');
  assert.equal(calls[0].url,'https://api.openai.com/v1/responses');
  assert.equal(calls[0].headers.Authorization,'Bearer test-server-key');
  const sent=JSON.parse(calls[0].body);
  assert.match(sent.instructions,/Andy Kraus/); assert.match(sent.instructions,/Glenmore Park/); assert.doesNotMatch(sent.instructions,/Toowoomba|07 3382/);
  assert.equal(sent.store,false); assert.equal(sent.max_output_tokens,700); assert.match(sent.instructions,/cannot submit a lead/);
  assert.equal((await (await f.post(body('password=private-value'))).json()).mode,'guide');
  assert.equal(calls.length,1);
});
test('provider failures are retryable errors and quotas ignore forged forwarded identities',async t=>{
  const f=await fixture(t,{env:{CHAT_ENABLED:'true',OPENAI_API_KEY:'test-key',CHAT_MODEL:'test-model',CHAT_ALLOWED_ORIGINS:'http://localhost:5175'},fetcher:async()=>new Response('secret provider body',{status:500})});
  const first=await f.post(body('pest quote')); assert.equal(first.status,503); assert.doesNotMatch(await first.text(),/secret provider/);
  for(let i=0;i<5;i++) assert.equal((await f.post(body('pest quote'),{'X-Forwarded-For':`192.0.2.${i}`})).status,503);
  assert.equal((await f.post(body('pest quote'),{'X-Forwarded-For':'192.0.2.200'})).status,429);
});
