const cards=[...document.querySelectorAll('.project')];const count=document.querySelector('#count');function filter(category){let total=0;cards.forEach(card=>{card.hidden=category!=='All'&&card.dataset.category!==category;if(!card.hidden)total++});count.textContent=`${total} projects`;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)))}document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter)));filter('All');document.querySelector('#theme').addEventListener('click',()=>{document.body.classList.toggle('light');document.querySelector('#theme').setAttribute('aria-pressed',String(document.body.classList.contains('light')))});

// Motion is progressive enhancement: all content remains visible without JS.
(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const progress = document.querySelector('.reading-progress');
 const visual = document.querySelector('.neural-visual');
 const steps = [...document.querySelectorAll('[data-stage]')];
 const core = document.querySelector('.story-core');
 const stage = document.querySelector('.story-stage');
 const graphic = document.querySelector('.story-graphic');
 const reveals = [...document.querySelectorAll('.project, .skill-group, .job, .education, .section-head')];
 let observer;
 function setupReveals(){
  if(observer)observer.disconnect();
  reveals.forEach(el=>el.classList.remove('reveal-pending','reveal-arrived'));
  if(reduced.matches || !('IntersectionObserver' in window))return;
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   const el=entry.target;
   if(el.hidden)return;
   if(entry.isIntersecting){
    el.classList.remove('reveal-pending');
    el.classList.add('reveal-arrived');
   }else if(entry.boundingClientRect.bottom<=0 || entry.boundingClientRect.top>=innerHeight){
    // Reset only after fully leaving the viewport, so tall cards stay readable.
    el.classList.remove('reveal-arrived');
    if(!el.contains(document.activeElement))el.classList.add('reveal-pending');
   }
  }),{threshold:[0,0.06]});
  reveals.forEach((el,i)=>{
   el.classList.remove('reveal-arrived');
   const rect=el.getBoundingClientRect();
   if(rect.top>=innerHeight || rect.bottom<=0)el.classList.add('reveal-pending');
   el.style.setProperty('--reveal-delay',`${i%3*65}ms`);
   observer.observe(el);
  });
 }
 let scheduled=false;
 function renderScroll(){
  scheduled=false;
  const range=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${range>0?Math.min(1,scrollY/range):0})`;
  if(visual)visual.style.setProperty('--parallax',reduced.matches?'0px':`${Math.min(scrollY*.09,42)}px`);
  const active=steps.reduce((best,el)=>Math.abs(el.getBoundingClientRect().top-innerHeight*.4)<Math.abs(best.getBoundingClientRect().top-innerHeight*.4)?el:best,steps[0]);
  if(active){core.textContent=active.dataset.stage;stage.textContent=active.dataset.label;graphic.dataset.active=active.dataset.stage;steps.forEach(el=>el.classList.toggle('story-active',el===active))}
 }
 function queueScroll(){if(!scheduled){scheduled=true;requestAnimationFrame(renderScroll)}}
 addEventListener('scroll',queueScroll,{passive:true});addEventListener('resize',queueScroll);
 reduced.addEventListener('change',()=>{setupReveals();queueScroll()});
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  reveals.filter(el=>!el.hidden).forEach(el=>el.classList.remove('reveal-pending'));queueScroll();
 }));
 document.addEventListener('focusin',event=>{const target=event.target.closest('.reveal-pending');if(target)target.classList.remove('reveal-pending')});
 document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',queueScroll));
 setupReveals();renderScroll();
})();
