import { guideReply } from './chat-knowledge.js';
import { readSession, saveSession, clearSession, safeLinks } from './chat-session.js?v=1';

if (!document.getElementById('ccChatWidget')) mountChat();
function mountChat() {
  const icon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>';
  const wrapper = document.createElement('div');
  wrapper.id = 'ccChatWidget';
  wrapper.className = 'cc-chat';
  wrapper.innerHTML = `
    <button class="cc-chat-launcher" type="button" aria-expanded="false" aria-controls="ccChatPanel" aria-label="Open Andy’s pest control chat"><span class="cc-chat-orb cc-chat-orb-small">${icon}</span><span>Ask Andy</span><span class="cc-chat-dot" aria-hidden="true"></span></button>
    <section id="ccChatPanel" class="cc-chat-panel" role="dialog" aria-modal="false" aria-labelledby="ccChatTitle" hidden>
      <div class="cc-chat-aura" aria-hidden="true"></div>
      <header class="cc-chat-header"><div><span class="cc-chat-eyebrow">CREEPY CRAWLY SYDNEY</span><h2 id="ccChatTitle">Andy’s pest control assistant</h2></div><button type="button" class="cc-chat-close" aria-label="Close chat">✕</button></header>
      <div class="cc-chat-toolbar"><span class="cc-chat-mode"><span class="cc-chat-dot" aria-hidden="true"></span><span id="ccChatMode">Website guide</span></span><button type="button" class="cc-chat-reset">New chat <span aria-hidden="true">↻</span></button></div>
      <div class="cc-chat-scroll">
        <div class="cc-chat-welcome"><div class="cc-chat-orb cc-chat-orb-hero" aria-hidden="true"></div><h3>What are we<br><span>protecting today?</span></h3><p class="cc-chat-intro">Let’s find the right service for you.</p>
          <div class="cc-chat-suggestions" aria-label="Suggested questions"><button type="button" data-question="I'd like a termite inspection"><span aria-hidden="true">✦</span> Arrange a termite inspection <span aria-hidden="true">↗</span></button><button type="button" data-question="Which pests do you treat?"><span aria-hidden="true">✦</span> Help with a pest problem <span aria-hidden="true">↗</span></button><button type="button" data-question="How do I get a treatment quote?"><span aria-hidden="true">✦</span> Get a treatment quote <span aria-hidden="true">↗</span></button></div>
        </div>
        <div class="cc-chat-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions"></div>
        <p class="cc-chat-thinking" role="status" hidden><span class="cc-chat-orb cc-chat-orb-tiny" aria-hidden="true"></span> Finding an answer<span aria-hidden="true">…</span></p>
      </div>
      <div class="cc-chat-error" role="alert" hidden><span></span><button type="button">Retry</button></div>
      <footer class="cc-chat-footer"><form class="cc-chat-composer"><label class="cc-chat-sr-only" for="ccChatInput">Your message</label><input id="ccChatInput" name="message" placeholder="Ask about pests or services…" maxlength="1000" autocomplete="off" required><button type="submit" aria-label="Send message"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></form><p class="cc-chat-privacy">Website guidance, not a live agent. Recent messages are saved in this tab.</p><a class="cc-chat-call" href="tel:0412074484">Prefer a person? Call Andy 0412 074 484 <span aria-hidden="true">↗</span></a></footer>
    </section>`;
  document.body.append(wrapper);
  const $ = selector => wrapper.querySelector(selector);
  const panel = $('.cc-chat-panel'), launcher = $('.cc-chat-launcher'), input = $('#ccChatInput');
  const log = $('.cc-chat-messages'), scroll = $('.cc-chat-scroll'), error = $('.cc-chat-error');
  let messages = [], busy = false, failed = false, mode = 'guide', backend = false, controller, epoch = 0;
  let configPromise;
  function setMode(value) {
    mode = value;
    $('#ccChatMode').textContent = value === 'ai' ? 'AI assistant' : 'Website guide';
    $('.cc-chat-privacy').textContent = value === 'ai'
      ? 'AI can make mistakes. Messages are sent to OpenAI. Avoid sensitive details.'
      : 'Website guidance, not a live agent. Recent messages are saved in this tab.';
    if (value === 'ai') $('.cc-chat-privacy').textContent += ' Recent messages are saved in this tab.';
  }
  function configure() {
    if (!configPromise) configPromise = fetch('/api/chat',{signal:AbortSignal.timeout(5000),cache:'no-store'})
      .then(async res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return;
        const data = await res.json();
        if (['ai','guide'].includes(data.mode)) { backend = true; setMode(data.mode); }
      }).catch(()=>{});
    return configPromise;
  }
  function persist() { saveSession(messages, !panel.hidden); }
  function open(focus = true) {
    panel.hidden = false; launcher.hidden = true; launcher.setAttribute('aria-expanded','true');
    wrapper.classList.add('is-open');
    void configure(); if (focus) input.focus({preventScroll:true});
    bottom(); persist();
  }
  function close() { panel.hidden = true; launcher.hidden = false; launcher.setAttribute('aria-expanded','false'); wrapper.classList.remove('is-open'); launcher.focus({preventScroll:true}); persist(); }
  function bottom() { requestAnimationFrame(()=>{scroll.scrollTop = log.childElementCount ? scroll.scrollHeight : 0;}); }
  function setBusy(value) {
    busy = value; input.disabled = value;
    $('.cc-chat-composer button').disabled = value || failed;
    $('.cc-chat-thinking').hidden = !value;
    wrapper.querySelectorAll('[data-question]').forEach(button=>{button.disabled = value;});
    bottom();
  }
  function render(role,text,links=[]) {
    $('.cc-chat-welcome').hidden = true;
    const row = document.createElement('div'); row.className = `cc-chat-message cc-chat-message-${role}`;
    if (role === 'assistant') { const orb = document.createElement('span'); orb.className='cc-chat-orb cc-chat-orb-tiny'; orb.setAttribute('aria-hidden','true'); row.append(orb); }
    const bubble = document.createElement('div'); bubble.className='cc-chat-bubble';
    const label = document.createElement('span'); label.className='cc-chat-sr-only'; label.textContent=role==='user'?'You: ':'Assistant: ';
    const textEl = document.createElement('p'); textEl.textContent=text; bubble.append(label,textEl);
    const linksToRender = safeLinks(links);
    if (linksToRender.length) {
      const nav = document.createElement('div'); nav.className='cc-chat-links';
      for (const link of linksToRender) { const a=document.createElement('a'); a.href=link.href; a.textContent=link.title+' ↗'; nav.append(a); }
      bubble.append(nav);
    }
    row.append(bubble); log.append(row); bottom();
  }
  async function reply() {
    const turn = epoch;
    failed=false; error.hidden=true; setBusy(true);
    const requestController=new AbortController();
    controller=requestController;
    const deadline=setTimeout(()=>requestController.abort(),30000);
    try {
      await configure();
      if (turn!==epoch) return;
      let result;
      if (backend && mode==='ai') {
        const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:messages.map(({role,content})=>({role,content}))}),signal:requestController.signal});
        if (!res.ok) throw new Error(res.status===429?'Chat is busy. Please try again later or call the team.':'The reply could not be completed. Please retry.');
        result=await res.json();
        if (typeof result.text!=='string' || !result.text.trim() || result.text.length>6000 || !Array.isArray(result.links) || !['ai','guide'].includes(result.mode)) throw new Error('The reply could not be read. Please retry.');
      } else result=guideReply(messages);
      if (turn!==epoch) return;
      render('assistant',result.text,result.links); messages.push({role:'assistant',content:result.text,links:safeLinks(result.links)});
      // Keep complete user/assistant turns, within the server's history budget.
      while(messages.length>14 || messages.reduce((n,m)=>n+m.content.length,0)>12000) messages.splice(0,2);
      persist();
    } catch(e) {
      if (turn!==epoch) return;
      failed=true; error.hidden=false;
      error.querySelector('span').textContent=e.name==='AbortError'?'The reply took too long. Please retry.':e.message;
    } finally {
      clearTimeout(deadline);
      if(turn===epoch) { setBusy(false); if(!panel.hidden) input.focus({preventScroll:true}); }
    }
  }
  function send(text) {
    if(busy || failed || !text.trim()) return;
    const content=text.trim().slice(0,1000); messages.push({role:'user',content}); render('user',content); input.value=''; persist(); void reply();
  }
  launcher.addEventListener('click',open); $('.cc-chat-close').addEventListener('click',close);
  $('.cc-chat-composer').addEventListener('submit',e=>{e.preventDefault();send(input.value);});
  wrapper.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>send(button.dataset.question)));
  error.querySelector('button').addEventListener('click',()=>{if(!busy) void reply();});
  $('.cc-chat-reset').addEventListener('click',()=>{
    epoch++; controller?.abort(); messages=[]; failed=false; error.hidden=true; log.replaceChildren(); $('.cc-chat-welcome').hidden=false; setBusy(false); input.value=''; input.focus({preventScroll:true});
    clearSession();
  });
  function interrupted() {
    failed=true; error.hidden=false;
    error.querySelector('span').textContent='Your previous reply was interrupted. Retry to continue.';
    setBusy(false);
  }
  setMode('guide');
  function restore() {
    const saved = readSession();
    messages = saved?.messages || [];
    failed=false; error.hidden=true; log.replaceChildren(); $('.cc-chat-welcome').hidden=messages.length>0;
    for (const message of messages) render(message.role, message.content, message.links);
    if (messages.at(-1)?.role === 'user') interrupted();
    setBusy(false);
    if (saved?.open) open(false);
    else { panel.hidden=true; launcher.hidden=false; launcher.setAttribute('aria-expanded','false'); wrapper.classList.remove('is-open'); }
  }
  restore();
  window.addEventListener('pageshow',event=>{ if (event.persisted) restore(); });
  // Navigation must not silently repeat a paid request; offer a manual retry.
  // Update the current document too, in case it is restored from the back/forward cache.
  window.addEventListener('pagehide',()=>{
    if (busy) { epoch++; controller?.abort(); interrupted(); }
    persist();
  });
  panel.addEventListener('keydown',e=>{
    if(e.key==='Escape') {e.preventDefault();close();}
    if(e.key==='Tab') {
      const focusable=[...panel.querySelectorAll('button:not(:disabled),a,input:not(:disabled)')].filter(el=>el.getClientRects().length);
      if(e.shiftKey && document.activeElement===focusable[0]) {e.preventDefault();focusable.at(-1).focus();}
      else if(!e.shiftKey && document.activeElement===focusable.at(-1)) {e.preventDefault();focusable[0].focus();}
    }
  });
  // Fit the visible area when a phone's on-screen keyboard opens.
  function viewport() {
    if(window.visualViewport && window.innerWidth<=600) {
      panel.style.setProperty('--cc-visible-height',`${window.visualViewport.height}px`);
      panel.style.setProperty('--cc-visible-top',`${window.visualViewport.offsetTop}px`);
    }
  }
  window.visualViewport?.addEventListener('resize',viewport);
  window.visualViewport?.addEventListener('scroll',viewport); viewport();
}
