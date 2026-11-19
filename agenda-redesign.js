/* FIATA agenda redesign: additive enhancement, preserving existing app data and routes. */
(function(){
  if(!SESSIONS.some(s=>s.id==='demo-d4-1')){
    SESSIONS.push(
      {id:'demo-d4-1',d:3,t:'09:00',e:'10:00',ti:'Morning Coffee & Networking',rm:'Foyer',brk:1},
      {id:'demo-d4-2',d:3,t:'10:00',e:'11:30',ti:'Digital Transformation in Global Freight and Logistics',rm:'Main Hall',sp:['s2','s5'],ds:'Practical strategies for using technology to improve freight operations and collaboration.'},
      {id:'demo-d4-3',d:3,t:'11:45',e:'12:45',ti:'Emerging Trade Corridors',rm:'Room 1',sp:['s4','s8'],ds:'An exploration of new routes, customs approaches, and opportunities for supply chains.'},
      {id:'demo-d4-4',d:3,t:'12:45',e:'14:00',ti:'Lunch Break',rm:'Terrace',brk:1},
      {id:'demo-d4-5',d:3,t:'14:00',e:'15:00',ti:'Collaborative Closing Discussion',rm:'Main Hall',sp:['s1'],ds:'Closing discussion, action points, and a review of key themes.'}
    );
  }
  function dateAt(index){
    const d=DAYS[index],year=Number((ev().date.match(/20\d{2}/)||['2026'])[0]);
    const monthToken=(d.label.match(/[A-Za-z]+/)||['Oct'])[0];
    const month=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(monthToken.slice(0,3).toLowerCase());
    return new Date(year,month<0?9:month,Number(d.num));
  }
  function times(s){
    const d=dateAt(s.d),a=s.t.split(':').map(Number),b=s.e.split(':').map(Number);
    return [new Date(d.getFullYear(),d.getMonth(),d.getDate(),a[0],a[1]).getTime(),
      new Date(d.getFullYear(),d.getMonth(),d.getDate(),b[0],b[1]).getTime()];
  }
  const started=s=>Date.now()>=times(s)[0];
  const running=s=>{const [a,b]=times(s),n=Date.now();return n>=a&&n<b};
  agendaV=function(){
    const month=dateAt(S.day).toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const items=SESSIONS.filter(s=>s.d===S.day);
    return tabbed(`<div class="scroll agenda-scroll" data-k="ag">
      ${tabTitle('Agenda',esc(ev().name))}
      <div class="agenda-date-sticky">
        <div class="agenda-month">${esc(month)}</div>
        <div class="agenda-day-row ${DAYS.length>5?'is-long':''}" data-k="days" role="tablist" aria-label="Event dates">
          ${DAYS.map((d,i)=>`<button type="button" role="tab" aria-selected="${S.day===i}" class="agenda-day ${S.day===i?'is-selected':''}" data-a="day" data-p="${i}" aria-label="${esc(d.dow)} ${esc(d.label)}">
            <span class="agenda-dow">${esc(d.dow)}</span><span class="agenda-num">${Number(d.num)}</span>
          </button>`).join('')}
        </div>
      </div>
      <div class="agenda-session-list" data-day="${S.day}" aria-label="Sessions for ${esc(DAYS[S.day].label)}">
        ${items.length?items.map(s=>{
          const speakers=(s.sp||[]).map(x=>byId(SPEAKERS,x)).filter(Boolean);
          return `<button type="button" class="agenda-session-card ${running(s)?'agenda-now':''}" data-a="push" data-p="sessionDetail:${s.id}" aria-label="${esc(s.ti)}, ${esc(s.t)} to ${esc(s.e)}, ${esc(s.rm)}">
            <span class="agenda-session-title">${esc(s.ti)}</span>
            <span class="agenda-session-meta">${esc(s.t)} – ${esc(s.e)} · ${esc(s.rm)}</span>
            ${speakers.length?`<span class="agenda-session-speakers">
              <span class="agenda-avatar-stack">${speakers.slice(0,3).map(x=>av(x.n,26)).join('')}</span>
              <span class="agenda-speaker-names">${esc(speakers.map(x=>x.n).join(', '))}</span>
            </span>`:''}
          </button>`;
        }).join(''):`<p class="agenda-empty">No sessions scheduled for this day.</p>`}
      </div>
      <section class="agenda-sponsor-footer" aria-label="Event sponsors">
        <h2>Sponsors & Partners</h2>
        <div class="agenda-sponsor-logos">${SOURCE_SPONSOR_LOGOS.map(l=>`<img src="${l.image}" alt="${esc(l.name)}" loading="lazy">`).join('')}</div>
      </section>
    </div>`);
  };
  PV.sessionDetail=function(id){
    const s=byId(SESSIONS,id);
    if(!s)return `<div class="screen">${phdr('Session Details')}<div class="scroll agenda-detail"><p>Session not found.</p></div></div>`;
    const people=(s.sp||[]).map(x=>byId(SPEAKERS,x)).filter(Boolean),r=S.ratings[id],canRate=started(s);
    const date=dateAt(s.d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    return `<div class="screen">${phdr('Session Details')}<div class="scroll agenda-detail" data-k="session-${id}">
      <h1>${esc(s.ti)}</h1>
      <p class="agenda-detail-time">${esc(date)} · ${s.t} – ${s.e}</p>
      <section class="agenda-detail-box"><h2>Room</h2><p>${esc(s.rm)}</p></section>
      <section class="agenda-detail-box"><h2>About this session</h2><p>${esc(s.ds||'No further description is available for this session.')}</p></section>
      ${people.length?`<section class="agenda-detail-box"><h2>Speakers</h2>
        ${people.map(x=>`<button class="agenda-detail-speaker" data-a="push" data-p="speaker:${x.id}">${av(x.n,40)}<span><strong>${esc(x.n)}</strong><small>${esc(x.r)} · ${esc(x.c)}</small></span></button>`).join('')}
        </section>`:''}
      ${!s.brk?`<button class="agenda-rate-btn" data-a="rate" data-p="${id}" ${canRate?'':'disabled aria-disabled="true"'}>${r?'Rated '+r.v+'/5':'Rate Session'}</button>
        ${canRate?'':`<p class="agenda-rate-hint">Rating is available once the session starts.</p>`}`:''}
    </div></div>`;
  };
  PV.sponsors=function(){
    const categories=new Map();
    SOURCE_SPONSOR_LOGOS.forEach(l=>{
      const name=(l.category||'Category to be confirmed').trim()||'Category to be confirmed';
      if(!categories.has(name))categories.set(name,[]);
      categories.get(name).push(l);
    });
    SPONSOR_CATS.forEach(c=>{if(!categories.has(c.n))categories.set(c.n,[])});
    return `<div class="screen">${phdr('Sponsors & Partners')}<div class="scroll" data-k="sps">
      <div class="partner-page-intro"><h2>Sponsors & Partners</h2><p>Explore sponsors by category</p></div>
      ${Array.from(categories,([name,logos],i)=>`<details class="sponsor-accordion" ${i===0?'open':''}>
        <summary><strong>${esc(name)}</strong><span class="sponsor-accordion-count">${logos.length} ${logos.length===1?'logo':'logos'}</span><span class="sponsor-accordion-caret" aria-hidden="true"></span></summary>
        <div class="sponsor-accordion-content">
          ${logos.length?`<div class="partner-logo-grid">${logos.map(l=>`<div class="partner-logo-card"><img src="${l.image}" alt="${esc(l.name)}" loading="lazy"><span class="sponsor-logo-name">${esc(l.name)}</span></div>`).join('')}</div>`:`<p class="sponsor-accordion-empty">No sponsor logos assigned yet.</p>`}
        </div>
      </details>`).join('')}
    </div></div>`;
  };
  A.day=function(p){
    const next=Number(p);if(!Number.isInteger(next)||next<0||next>=DAYS.length)return;
    S.day=next;render();const sc=$app.querySelector('[data-k="ag"]');if(sc)sc.scrollTop=0;
  };
  const originalRate=A.rate;
  A.rate=function(id){
    const s=byId(SESSIONS,id);
    if(!s||s.brk)return;
    if(!started(s)){toast('You can rate this session after it starts.','info');return;}
    return originalRate.call(A,id);
  };
  A.sesFromSpk=function(id){const s=byId(SESSIONS,id);if(!s)return;S.day=s.d;closeSheet(()=>push('sessionDetail',id))};
  // Card list swipe changes dates, but scrolling the list vertically still works.
  let sx=null,sy=null;
  document.addEventListener('touchstart',e=>{
    if(!e.target.closest('.agenda-session-list')||e.touches.length!==1)return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if(sx===null||!e.changedTouches.length)return;
    const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;sy=null;
    if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.35)A.day(S.day+(dx<0?1:-1));
  },{passive:true});
  const oldRender=render;
  render=function(anim){
    oldRender(anim);
    const page=topS()?.n;
    if(page==='agenda'||page==='sessionDetail'||S.tab==='agenda'){
      const root=$app.querySelector('.screen');
      root?.querySelector('.fixed-sponsor-strip')?.remove();
      root?.classList.remove('has-fixed-sponsors');
    }
    const strip=$app.querySelector('.agenda-day-row'),selected=strip?.querySelector('.is-selected');
    if(strip&&selected&&DAYS.length>5){
      requestAnimationFrame(()=>strip.scrollTo({left:selected.offsetLeft-(strip.clientWidth-selected.offsetWidth)/2,behavior:'smooth'}));
    }
  };
  render();
})();