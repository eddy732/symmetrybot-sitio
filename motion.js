/* Symmetrybot · capa de movimiento (complementa site.js). */
(()=>{'use strict';
const header=document.querySelector('.site-header');
if(header){const f=()=>header.classList.toggle('is-scrolled',scrollY>8);addEventListener('scroll',f,{passive:true});f();}
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
// Escalonado de los elementos que ya usan .reveal en listas (soluciones, pasos)
document.querySelectorAll('.solution-list,.process-grid').forEach(g=>[...g.children].forEach((el,i)=>{el.style.transitionDelay=Math.min(i*90,270)+'ms';}));
})();
