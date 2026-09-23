const planData={59:{title:'일상을 채우는<br>알찬 공간.',src:'assets/plan59.webp'},84:{title:'가족의 시간을 담는<br>여유로운 공간.',src:'assets/plan84.webp'}};
let activeType='59';
const tabs=[...document.querySelectorAll('[role="tab"]')];
function selectType(type){activeType=type;tabs.forEach(t=>{const selected=t.dataset.type===type;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;});document.querySelector('#type-number').textContent=type;document.querySelector('#plan-title').innerHTML=planData[type].title;const img=document.querySelector('#plan-image');img.src=planData[type].src;img.alt=type+'㎡ 타입 공간 계획 이미지';document.querySelector('#zoom-plan').setAttribute('aria-label',type+'㎡ 평면 크게 보기');document.querySelector('#plan-panel').setAttribute('aria-labelledby','tab'+type);}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectType(tab.dataset.type));tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-i;selectType(tabs[next].dataset.type);tabs[next].focus();}});});
document.querySelector('#type-consult').addEventListener('click',()=>{const frame=document.querySelector('#consult-frame');const url=new URL(frame.src);url.searchParams.set('type',activeType);frame.src=url.href;document.querySelector('#form-direct').href=url.href;document.querySelector('#consult').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
const dialog=document.querySelector('#plan-dialog');document.querySelector('#zoom-plan').addEventListener('click',()=>{document.querySelector('#dialog-image').src=planData[activeType].src;document.querySelector('#dialog-image').alt=activeType+'㎡ 평면 확대';dialog.showModal();});document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
// Reveal each section once; respect the visitor's motion preference.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (!entry.isIntersecting) return;
   entry.target.animate([{opacity:0.3,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'ease-out'});
   revealObserver.unobserve(entry.target);
  });
 },{threshold:0.12});
 document.querySelectorAll('.section-top,.benefit-copy,.benefit-value,.consult-copy,.facts').forEach(el=>revealObserver.observe(el));
}
