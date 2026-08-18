/* Elementalis v27 — Atelier d'édition avancé
   Ajoute ce script juste avant </body> dans index.html.
*/
(() => {
  'use strict';
  const boot = () => {
    const modal = document.getElementById('editor-modal');
    const app = document.getElementById('editor-app');
    if (!modal || !app) return;

    const style = document.createElement('style');
    style.textContent = `
      #editor-modal .editor-window{width:min(1280px,98vw);height:min(94vh,980px);max-height:94vh;padding:26px;display:flex;flex-direction:column}
      #editor-modal .editor-head{flex:0 0 auto}
      #editor-modal .editor-grid{flex:1;min-height:0;grid-template-columns:250px minmax(0,1fr)}
      #editor-modal .editor-grid>div:last-child{min-height:0;overflow:auto;padding-right:4px}
      .v27-toolbar{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;gap:6px;padding:10px;margin:-2px 0 14px;border:1px solid #59432d;border-radius:11px;background:rgba(20,14,11,.96);backdrop-filter:blur(8px);box-shadow:0 10px 24px rgba(0,0,0,.25)}
      .v27-toolbar button,.v27-toolbar select{height:34px;border:1px solid #5a422c;background:#1c1511;color:#dfc69d;border-radius:7px;padding:0 9px;cursor:pointer}
      .v27-toolbar button:hover,.v27-toolbar select:hover{border-color:#a77b45;background:#291e16}
      .v27-toolbar .sep{width:1px;background:#493725;margin:3px 2px}
      .v27-editor-note{font-size:11px;color:#8f806d;margin:0 0 10px}
      body.editing .section{position:relative;outline:1px dashed rgba(197,154,90,.12);outline-offset:3px}
      .v27-block-tools{position:absolute;right:10px;top:10px;z-index:8;display:none;gap:4px;padding:4px;border:1px solid #5a422c;border-radius:8px;background:rgba(18,12,9,.95);box-shadow:0 8px 18px rgba(0,0,0,.35)}
      body.editing .section:hover>.v27-block-tools{display:flex}
      .v27-block-tools button{border:1px solid #493725;background:#211711;color:#d9bf91;border-radius:6px;min-width:28px;height:27px;cursor:pointer}
      .v27-block-tools button:hover{border-color:#a77b45;background:#2a1e16}
      .v27-block-tools .danger{color:#e1a89b}
      .v27-selected{outline:1px solid #b1844c !important;box-shadow:0 0 0 3px rgba(177,132,76,.09)}
      body.editing .section p,body.editing .intro,body.editing .home-note,
      body.editing .section h2,body.editing .home-card h3,body.editing .home-card p,
      body.editing .chapter h1,body.editing #accueil h2{white-space:pre-wrap}
      .v27-add-zone{display:flex;justify-content:center;margin:8px 0}
      .v27-add-zone button{border:1px dashed #665036;background:transparent;color:#b99561;border-radius:999px;padding:7px 14px;cursor:pointer;font-size:11px}
      .v27-add-zone button:hover{background:#1d1510;border-color:#a77b45;color:#e2c594}
      .v27-format-help{padding:11px 12px;border:1px dashed #4f3b29;border-radius:9px;color:#978773;font-size:11px;line-height:1.6;margin-top:10px}
      @media(max-width:760px){
        #editor-modal .editor-window{padding:14px;width:100vw;height:100vh;max-height:none;border-radius:0}
        #editor-modal .editor-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);

    const makeButton=(label,title,fn)=>{
      const b=document.createElement('button'); b.type='button'; b.textContent=label; b.title=title;
      b.addEventListener('mousedown',e=>e.preventDefault()); b.addEventListener('click',fn); return b;
    };
    let savedRange=null;
    const saveSelection=()=>{const s=window.getSelection();if(s&&s.rangeCount)savedRange=s.getRangeAt(0).cloneRange()};
    const restoreSelection=()=>{if(!savedRange)return;const s=window.getSelection();s.removeAllRanges();s.addRange(savedRange)};
    const command=(cmd,val=null)=>{restoreSelection();document.execCommand(cmd,false,val);saveSelection()};

    function buildToolbar(panel){
      if(panel.querySelector('.v27-toolbar'))return;
      const bar=document.createElement('div');bar.className='v27-toolbar';
      [['B','Gras','bold'],['I','Italique','italic'],['U','Souligné','underline'],['S','Barré','strikeThrough']].forEach(([l,t,c])=>bar.append(makeButton(l,t,()=>command(c))));
      const sep=()=>{const x=document.createElement('span');x.className='sep';return x};bar.append(sep());
      [['←','Gauche','justifyLeft'],['↔','Centrer','justifyCenter'],['→','Droite','justifyRight']].forEach(([l,t,c])=>bar.append(makeButton(l,t,()=>command(c))));
      bar.append(sep());
      const font=document.createElement('select');font.title='Police';
      [['Inter','Inter, sans-serif'],['Georgia','Georgia, serif'],['Garamond','Garamond, serif'],['Courier','Courier New, monospace'],['Arial','Arial, sans-serif']].forEach(([n,v])=>{const o=document.createElement('option');o.textContent=n;o.value=v;font.appendChild(o)});
      font.onchange=()=>command('fontName',font.value);bar.append(font);
      const size=document.createElement('select');size.title='Taille';
      [['Petite','2'],['Normale','3'],['Grande','4'],['Très grande','5'],['Titre','6']].forEach(([n,v])=>{const o=document.createElement('option');o.textContent=n;o.value=v;size.appendChild(o)});
      size.onchange=()=>command('fontSize',size.value);bar.append(size);
      bar.append(makeButton('• Liste','Liste à puces',()=>command('insertUnorderedList')));
      bar.append(makeButton('1. Liste','Liste numérotée',()=>command('insertOrderedList')));
      bar.append(makeButton('↶','Annuler',()=>command('undo')));
      bar.append(makeButton('↷','Rétablir',()=>command('redo')));
      bar.append(makeButton('Tx','Effacer la mise en forme',()=>command('removeFormat')));
      const note=document.createElement('p');note.className='v27-editor-note';note.textContent='Sélectionne du texte puis utilise la barre. Les retours à la ligne sont conservés.';
      panel.prepend(bar,note);
    }

    const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    const makeEditable=root=>root.querySelectorAll('h1,h2,h3,p,small,.home-note,.home-card h3,.home-card p,.world-page-title h2,.world-page-title p').forEach(el=>{
      if(!el.closest('#editor-modal')&&!el.closest('.v27-block-tools')&&!el.closest('.v27-add-zone'))el.contentEditable='true';
    });

    const move=(sec,dir)=>{
      const p=sec.parentElement,s=[...p.querySelectorAll(':scope>.section')],i=s.indexOf(sec),j=i+dir;
      if(j<0||j>=s.length)return;
      if(dir<0)p.insertBefore(sec,s[j]);else p.insertBefore(sec,s[j].nextSibling);
    };
    const removeBlock=sec=>{if(confirm('Supprimer définitivement cet encadré ?'))sec.remove()};
    const insertBlock=(target,where)=>{
      const title=prompt('Titre de l’encadré :','Nouvel encadré');if(title===null)return;
      const text=prompt('Texte de l’encadré :','Écris ici ton nouveau contenu…');if(text===null)return;
      const sec=document.createElement('section');sec.className='section';
      sec.innerHTML=`<h2>${escapeHTML(title)}</h2><p>${escapeHTML(text)}</p>`;
      if(where==='before')target.parentElement.insertBefore(sec,target);
      else if(where==='after')target.parentElement.insertBefore(sec,target.nextSibling);
      else target.appendChild(sec);
      decorate(sec);makeEditable(sec);sec.scrollIntoView({behavior:'smooth',block:'center'});
    };
    const decorate=sec=>{
      if(sec.querySelector(':scope>.v27-block-tools'))return;
      const tools=document.createElement('div');tools.className='v27-block-tools';
      [['↑','Monter',()=>move(sec,-1)],['↓','Descendre',()=>move(sec,1)],['+↑','Ajouter au-dessus',()=>insertBlock(sec,'before')],['+↓','Ajouter en dessous',()=>insertBlock(sec,'after')],['×','Supprimer',()=>removeBlock(sec)]].forEach(([l,t,f])=>tools.append(makeButton(l,t,f)));
      tools.lastChild.classList.add('danger');sec.appendChild(tools);
    };
    const addZones=()=>{
      document.querySelectorAll('main>.chapter').forEach(ch=>{
        if(ch.querySelector(':scope>.v27-add-zone'))return;
        const z=document.createElement('div');z.className='v27-add-zone';
        z.appendChild(makeButton('+ Ajouter un encadré à la fin','Ajouter un encadré',()=>insertBlock(ch,'end')));ch.appendChild(z);
      });
    };
    const decorateAll=()=>{document.querySelectorAll('main .section').forEach(decorate);makeEditable(document);addZones()};
    const cleanTools=()=>document.querySelectorAll('.v27-block-tools,.v27-add-zone').forEach(x=>x.remove());

    const panel=app.querySelector('[data-editor-panel="content"]');
    if(panel){
      buildToolbar(panel);
      const h=document.createElement('div');h.className='v27-format-help';
      h.innerHTML='<strong>Encadrés :</strong> survole un encadré pour le modifier, le déplacer, en ajouter un au-dessus/au-dessous ou le supprimer.';
      panel.appendChild(h);
    }
    document.querySelectorAll('.section p,.intro,.home-note,.home-card p').forEach(el=>el.style.whiteSpace='pre-wrap');
    document.addEventListener('selectionchange',()=>{if(document.activeElement?.isContentEditable)saveSelection()});

    const observer=new MutationObserver(()=>{if(document.body.classList.contains('editing'))decorateAll();else cleanTools()});
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});
    const main=document.querySelector('main');
    if(main)new MutationObserver(m=>{if(document.body.classList.contains('editing'))m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1){makeEditable(n);decorateAll()}}))}).observe(main,{childList:true,subtree:true});

    const save=document.getElementById('save-edits');
    if(save)save.addEventListener('click',()=>{cleanTools();setTimeout(decorateAll,0)},true);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();