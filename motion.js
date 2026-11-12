(() => {
  const directory=document.querySelector('#project-directory');
  let directoryOpener=null, directoryScroll=0;
  if(directory){
    document.querySelectorAll('[data-directory-open]').forEach(button=>button.addEventListener('click',()=>{
      if(directory.open)return;
      directoryOpener=button;directoryScroll=window.scrollY;
      directory.showModal();document.body.style.overflow='hidden';
    }));
    directory.querySelector('[data-directory-close]').addEventListener('click',()=>directory.close());
    directory.addEventListener('close',()=>{
      document.body.style.overflow='';
      window.scrollTo({top:directoryScroll,behavior:'instant'});
      directoryOpener?.focus({preventScroll:true});
    });
    directory.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>directory.close()));
  }
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero=document.querySelector('.hero');
  const picture=hero?.querySelector('.hero-picture');
  if(picture&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let pending=0, x=0, y=0;
    const paint=()=>{pending=0;picture.style.setProperty('--hero-x',x+'px');picture.style.setProperty('--hero-y',y+'px');};
    hero.addEventListener('pointermove',event=>{
      if(reduced.matches)return;
      const rect=hero.getBoundingClientRect();
      x=(event.clientX-rect.left-rect.width/2)/rect.width*8;
      y=(event.clientY-rect.top-rect.height/2)/rect.height*6;
      if(!pending)pending=window.requestAnimationFrame(paint);
    },{passive:true});
    const reset=()=>{x=0;y=0;if(pending)window.cancelAnimationFrame(pending);pending=0;paint();};
    hero.addEventListener('pointerleave',reset);
    reduced.addEventListener('change',event=>{if(event.matches)reset();});
  }
  const main=document.querySelector('.detail-page main');
  if(main){
    const headings=[...main.querySelectorAll('h2')].filter(h=>!h.closest('.method-notes'));
    if(headings.length>2){
      const toc=document.createElement('details');toc.className='case-contents';
      const summary=document.createElement('summary');summary.textContent='本页内容';
      const nav=document.createElement('nav');nav.setAttribute('aria-label','本页章节');
      headings.forEach((heading,index)=>{
        if(!heading.id)heading.id='section-'+(index+1);
        const link=document.createElement('a');link.href='#'+heading.id;
        const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
        link.append(number);link.append(document.createTextNode(heading.textContent));
        link.addEventListener('click',event=>{
          event.preventDefault();heading.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
          heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
          history.replaceState(null,'','#'+heading.id);
        });
        nav.append(link);
      });
      toc.append(summary);toc.append(nav);
      const lead=main.querySelector(':scope > header');
      if(lead)lead.after(toc);else main.prepend(toc);
    }
  }
})();
