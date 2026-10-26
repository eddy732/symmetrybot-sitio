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
