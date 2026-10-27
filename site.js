(()=>{'use strict';
const nav=document.querySelector('#siteNav'),menu=document.querySelector('#menuToggle');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
const landing=document.querySelector('#landingView'),privacy=document.querySelector('#privacyView');
function route(){let hash;try{hash=decodeURIComponent(location.hash||'#inicio');}catch{hash='#inicio';}const isPolicy=hash==='#privacidad'||hash.startsWith('#privacidad-');landing.hidden=isPolicy;privacy.hidden=!isPolicy;document.title=isPolicy?'Política de privacidad | Symmetrybot':'Symmetrybot — Menos mensajes pendientes. Más negocio.';closeMenu();if(isPolicy)document.querySelector('#caseVideo').pause();requestAnimationFrame(()=>{const target=isPolicy&&hash==='#privacidad'?privacy:document.getElementById(hash.slice(1));if(target)target.scrollIntoView({behavior:'instant',block:'start'});});}
window.addEventListener('hashchange',route);route();
const video=document.querySelector('#caseVideo'),play=document.querySelector('#videoPlay');
play.addEventListener('click',async()=>{try{await video.play();play.hidden=true;}catch{play.hidden=true;video.controls=true;video.focus();}});
video.addEventListener('play',()=>{play.hidden=true;});
video.addEventListener('ended',()=>{play.hidden=false;});
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));}
})();

/* Symmetrybot: live n8n assistant. No API credentials belong in this file. */
(() => {
  'use strict';
  if (document.getElementById('symmetryAssistant')) return;
  const endpoint = 'https://andgg.app.n8n.cloud/webhook/2514fc0b-71fe-40f6-b14c-86b86e8d5f9e/chat';
  const contact = 'symmetrybot.app@gmail.com';
  const style = document.createElement('style');
  style.textContent = `
    .sb-launch{position:fixed;bottom:24px;right:24px;z-index:90;display:flex;align-items:center;gap:10px;padding:14px 19px;border:1px solid #406456;border-radius:30px;background:#193d34;color:white;font:600 13px/1.4 Inter,'Segoe UI',sans-serif;box-shadow:0 6px 26px #193d3430;min-height:50px}
    .sb-launch:hover{background:#2b5a49}.sb-launch svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7}
    .sb-panel{position:fixed;z-index:91;right:24px;bottom:86px;width:390px;height:580px;max-height:calc(100dvh - 110px);display:flex;flex-direction:column;background:#f7f8f4;border:1px solid #dce4d9;border-radius:18px;box-shadow:0 16px 60px #173f3530;overflow:hidden;font:13px/1.6 Inter,'Segoe UI',sans-serif;color:#2c453e}
    .sb-panel[hidden]{display:none}.sb-top{display:flex;align-items:center;gap:11px;background:#193d34;color:#fff;padding:17px 18px}.sb-avatar{width:36px;height:36px;border:1px solid #8fae95;border-radius:50%;display:grid;place-items:center;font:24px Georgia,serif;flex-shrink:0}.sb-top h2{margin:0;color:#fff;font:600 15px/1.4 Inter,'Segoe UI',sans-serif;letter-spacing:0}.sb-top p{color:#c7d7c6;font-size:11px;margin:2px 0 0}.sb-top-actions{display:flex;margin-left:auto;gap:3px}.sb-icon{border:0;border-radius:6px;background:transparent;color:inherit;width:32px;height:32px;padding:0;display:grid;place-items:center;font-size:22px;cursor:pointer}.sb-icon:hover{background:#ffffff16}.sb-icon:disabled{opacity:.5}
    .sb-log{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px 16px;display:flex;flex-direction:column;gap:13px;scrollbar-width:thin}.sb-msg{flex-shrink:0;max-width:94%;border:1px solid #e2e8dc;background:white;border-radius:12px;padding:11px 13px;overflow-wrap:anywhere;white-space:pre-wrap;line-height:1.65}.sb-msg strong.sb-speaker{display:block;font-size:10px;letter-spacing:.03em;margin-bottom:4px;color:#596951;font-weight:500}.sb-msg-user{align-self:flex-end;background:#e4eddc;border-color:#d5e2ca}.sb-msg a{color:#245b45;text-decoration:underline;text-underline-offset:3px}.sb-msg-error{border-color:#cda98b;background:#fff9ef}.sb-suggestions{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 13px}.sb-suggestions button{border:1px solid #cbd9c4;background:#fff;color:#33553f;border-radius:18px;padding:7px 11px;font-size:11px}.sb-suggestions button:hover{background:#eaf0e4}.sb-status{padding:0 18px;min-height:23px;color:#56664f;font-size:11px}.sb-bottom{padding:12px 14px 13px;background:white;border-top:1px solid #e1e7db}.sb-form{display:flex;gap:7px;align-items:center;border:1px solid #cdd9c5;border-radius:10px;padding:6px}.sb-form:focus-within{outline:2px solid #8ba27c;outline-offset:2px}.sb-input{font:13px/1.4 Inter,'Segoe UI',sans-serif;min-width:0;flex:1;border:0;background:transparent;color:#193d34;padding:7px;outline:none!important}.sb-send{border:0;background:#193d34;color:white;width:35px;height:35px;border-radius:7px;display:grid;place-items:center;flex-shrink:0}.sb-send svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7}.sb-contact{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:11px;font-size:10px;color:#56664f}.sb-contact a{font-size:11px;color:#284c39;font-weight:600;border-bottom:1px solid #afc3a2}.sb-notice{font-size:10px;line-height:1.5;color:#56664f;margin:10px 0 0}.sb-notice a{text-decoration:underline}.sb-panel :focus-visible,.sb-launch:focus-visible{outline:3px solid #bb7357;outline-offset:3px}
    @media(max-width:520px){.sb-launch{bottom:16px;right:16px}.sb-panel{left:12px;right:12px;bottom:79px;width:auto;height:590px;max-height:calc(100dvh - 95px);border-radius:14px}.sb-top{padding:13px 14px}.sb-input{font-size:16px}.sb-msg{font-size:13px}}
    @media(prefers-reduced-motion:reduce){.sb-panel *{scroll-behavior:auto}}
  `;
  document.head.append(style);
  const root = document.createElement('div');
  root.id = 'symmetryAssistant';
  // Static interface only. Conversation text is always rendered as text nodes.
  root.innerHTML = `
    <button class="sb-launch" type="button" aria-expanded="false" aria-controls="sbPanel" aria-label="Abrir chat con Symmetrybot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H4l1.3-4A8 8 0 1 1 20 11Z"/><path d="M8 10h8m-8 4h5"/></svg><span>¿Hablamos?</span></button>
    <section class="sb-panel" id="sbPanel" role="dialog" aria-label="Asistente virtual de Symmetrybot" hidden>
      <header class="sb-top"><span class="sb-avatar" aria-hidden="true">s.</span><div><h2>Symmetrybot</h2><p>Tu idea, el siguiente paso.</p></div><div class="sb-top-actions"><button class="sb-icon sb-reset" type="button" aria-label="Nueva conversación" title="Nueva conversación">↺</button><button class="sb-icon sb-close" type="button" aria-label="Cerrar chat">×</button></div></header>
      <div class="sb-log" role="log" aria-label="Conversación con Symmetrybot" aria-live="polite" aria-relevant="additions"></div>
      <div class="sb-suggestions" aria-label="Preguntas sugeridas"><button type="button">¿Qué puedo automatizar?</button><button type="button">Quiero una demo</button><button type="button">¿Cuánto cuesta?</button></div>
      <div class="sb-status" role="status" aria-live="polite"></div>
      <div class="sb-bottom"><form class="sb-form"><label class="sr-only" for="sbMessage">Tu mensaje para Symmetrybot</label><input class="sb-input" id="sbMessage" placeholder="Cuéntanos sobre tu negocio…" maxlength="1200" autocomplete="off" required><button class="sb-send" type="submit" aria-label="Enviar a Symmetrybot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/></svg></button></form><div class="sb-contact"><a class="sb-whatsapp" href="https://wa.me/18099641618" target="_blank" rel="noopener noreferrer">Habla con nosotros ↗</a><a class="sb-demo" href="mailto:symmetrybot.app@gmail.com?subject=Quiero%20una%20demo%20de%20Symmetrybot" title="Abre tu correo con un resumen. Tú decides si enviarlo.">Solicitar demo ↗</a></div><p class="sb-notice">Asistente con IA. Al enviar, n8n y OpenAI procesan tu mensaje. No compartas datos sensibles. <a href="#privacidad-chat-web" class="sb-privacy">Sobre tus datos</a>.</p></div>
    </section>`;
  document.body.append(root);
  const $ = selector => root.querySelector(selector);
  const launcher = $('.sb-launch'), panel = $('.sb-panel'), log = $('.sb-log');
  const input = $('.sb-input'), form = $('.sb-form'), status = $('.sb-status');
  const sendButton = $('.sb-send'), resetButton = $('.sb-reset'), suggestions = $('.sb-suggestions');
  let sessionId = crypto.randomUUID(), pending = false, sent = 0, visitorMessages = [];

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Cerrar chat con Symmetrybot' : 'Abrir chat con Symmetrybot');
    if (open) { input.focus(); log.scrollTop = log.scrollHeight; } else launcher.focus();
  }
  function safeLink(value) {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && ['symmetrybot.app','www.symmetrybot.app'].includes(url.hostname)) return url.href;
      if (url.protocol === 'https:' && url.hostname === 'wa.me' && url.pathname === '/18099641618') return url.href;
      if (url.protocol === 'mailto:' && url.pathname === contact) return url.href;
    } catch {}
    return null;
  }
  function renderText(target, text) {
    const pattern = /\[([^\]]+)\]\(([^\s)]+)\)|(https:\/\/[^\s<>]+|mailto:[^\s<>]+)/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      target.append(document.createTextNode(text.slice(cursor, match.index)));
      const raw = match[2] || match[3], value = raw.replace(/[.,;!?]+$/, ''), href = safeLink(value);
      if (href) {
        const a = document.createElement('a');
        a.href = href; a.textContent = match[1] || (href.startsWith('mailto:') ? 'Solicitar demo por correo' : href.startsWith('https://wa.me/') ? 'Habla con nosotros por WhatsApp' : value);
        if (href.startsWith('https:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        target.append(a);
        if (!match[2] && raw.length > value.length) target.append(document.createTextNode(raw.slice(value.length)));
      } else target.append(document.createTextNode(match[0]));
      cursor = match.index + match[0].length;
    }
    target.append(document.createTextNode(text.slice(cursor)));
  }
  function message(text, role = 'assistant') {
    const item = document.createElement('div');
    item.className = `sb-msg sb-msg-${role}`;
    const label = document.createElement('strong'); label.className = 'sb-speaker';
    label.textContent = role === 'user' ? 'Tú' : role === 'error' ? 'No pudimos responder' : 'Symmetrybot · IA';
    item.append(label); renderText(item, text); log.append(item); log.scrollTop = log.scrollHeight;
  }
  function start() {
    sessionId = crypto.randomUUID(); sent = 0; visitorMessages = []; log.replaceChildren();
    status.textContent = ''; suggestions.hidden = false; updateDemo();
    message('¡Hola! Soy el asistente virtual de Symmetrybot. Te ayudo a descubrir qué puedes automatizar y cómo empezar. ¿Qué tipo de negocio tienes?');
  }
  function updateDemo() {
    const summary = visitorMessages.slice(-4).map(text => '• ' + text.slice(0,350)).join('\n');
    const body = 'Hola, quiero una demostración de Symmetrybot.\n\n' + (summary ? 'Lo que me gustaría resolver:\n' + summary : 'Mi negocio es:\nMe gustaría automatizar:') + '\n\nMi nombre:\nMi contacto preferido:';
    $('.sb-demo').href = 'mailto:' + contact + '?subject=' + encodeURIComponent('Quiero una demo de Symmetrybot') + '&body=' + encodeURIComponent(body);
  }
  async function send(text) {
    text = text.trim();
    if (!text || pending) return;
    if (text.length > 1200) { status.textContent = 'Resume tu mensaje en 1.200 caracteres o menos.'; return; }
    if (sent >= 30) { status.textContent = 'Puedes iniciar una nueva conversación o solicitar tu demo por correo.'; return; }
    pending = true; sendButton.disabled = true; resetButton.disabled = true; input.readOnly = true;
    suggestions.hidden = true; input.value = ''; input.focus(); message(text, 'user');
    status.textContent = 'Symmetrybot está preparando tu respuesta…';
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'omit', body:JSON.stringify({action:'sendMessage',sessionId,chatInput:text}), signal:controller.signal });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json(), payload = Array.isArray(data) ? data[0] : data;
      const answer = payload?.output ?? payload?.text;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('Empty response');
      message(answer.slice(0,10000)); sent++; visitorMessages.push(text); updateDemo(); status.textContent = '';
    } catch {
      message('La conexión no está disponible en este momento. Puedes intentarlo de nuevo o usar «Solicitar demo» para escribir al equipo.', 'error');
      input.value = text; status.textContent = 'Tu mensaje está listo para volver a intentarlo.';
    } finally {
      clearTimeout(timeout); pending = false; sendButton.disabled = false; resetButton.disabled = false; input.readOnly = false;
      if (!panel.hidden && (document.activeElement === input || document.activeElement === sendButton)) input.focus();
    }
  }
  launcher.addEventListener('click', () => setOpen(panel.hidden));
  $('.sb-close').addEventListener('click', () => setOpen(false));
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.stopPropagation(); setOpen(false); } });
  form.addEventListener('submit', event => { event.preventDefault(); send(input.value); });
  suggestions.addEventListener('click', event => { const button=event.target.closest('button'); if(button) send(button.textContent); });
  resetButton.addEventListener('click', () => { if(!pending) { start(); input.focus(); } });
  $('.sb-privacy').addEventListener('click', () => setOpen(false));
  const policy = document.querySelector('.policy-content');
  if (policy && !document.getElementById('privacidad-chat-web')) {
    const section = document.createElement('section'); section.id = 'privacidad-chat-web';
    section.innerHTML = '<h2>Chat con el asistente de Symmetrybot</h2><p>El chat flotante usa inteligencia artificial para responder preguntas sobre nuestros servicios. Cuando envías un mensaje, su contenido y un identificador aleatorio de conversación se transmiten a nuestro flujo en n8n Cloud y al modelo de OpenAI para generar una respuesta. Las conversaciones pueden quedar en el historial de ejecuciones de n8n para operar y revisar el servicio. Evita compartir contraseñas, datos de pago u otra información sensible.</p><p>El contexto del chat se mantiene mientras conversas. Al recargar la página o iniciar una nueva conversación, se crea un identificador nuevo; esto no elimina los registros que ya existan en los proveedores. El botón «Solicitar demo» abre tu aplicación de correo con un resumen de tus mensajes para que lo revises y decidas si lo envías. El asistente no envía ese correo ni confirma reservas por sí solo. Las demostraciones interactivas de citas y pedidos siguen siendo ejemplos locales.</p><p>Para consultar sobre tus datos o solicitar su eliminación, escribe a <a href="mailto:symmetrybot.app@gmail.com">symmetrybot.app@gmail.com</a>.</p>';
    policy.prepend(section);
  }
  start();
})();
