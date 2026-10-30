/* PC1 CATS research landscape. Add more projects to projects.json as they are reviewed. */
'use strict';
const AXIS={id:'1',title:'Interaction devices & modalities',subtitle:'Heterogeneous collaboration spaces'};
const WORK_PACKAGES=[['1.1','Shared spatial layouts and views'],['1.2','Multisensory collaboration'],['1.3','Collaborative interaction techniques']];
const FUNDING={'pc1-full':'PC1 fully funded','support':'Support grant','pc5-full':'PC5 fully funded'};
const RELEVANCE={strong:'Strong',moderate:'Moderate',weak:'Weak',none:'No direct link'};
const $=id=>document.getElementById(id);
const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
let projects=[],current=null,lastFocus=null;
function projectCard(p){
  const card=node('article','project-card');card.dataset.relevance=p.hybridRelevance||'none';
  const mark=node('span','project-marker');mark.setAttribute('aria-label',(RELEVANCE[p.hybridRelevance]||'Not assessed')+' relevance to Hybrid MR');mark.title=(RELEVANCE[p.hybridRelevance]||'Not assessed')+' relevance to Hybrid MR';card.append(mark);
  const main=node('div','card-main');const title=node('button','card-title',p.title);title.type='button';title.addEventListener('click',()=>openProject(p.id));main.append(title);card.append(main);
  const meta=node('div','card-meta');meta.append(node('span','year-tag',p.fundingYear?String(p.fundingYear):'Year unverified'),node('span','funding '+(p.fundingType||''),FUNDING[p.fundingType]||'Funding unverified'));card.append(meta);
  const button=node('button','view-summary','Research summary ↗');button.type='button';button.setAttribute('aria-label','Open research summary: '+p.title);button.addEventListener('click',()=>openProject(p.id));card.append(button);return card;
}
function render(){
 const area=$('landscape');area.replaceChildren();const grouped=projects.filter(p=>p.primaryWP&&String(p.primaryWP).startsWith('1.'));
 const axis=node('details','axis');axis.open=true;
 const sum=node('summary');sum.append(node('span','axis-number','1'));
 const title=node('span','axis-text');title.append(node('strong','',AXIS.title),node('small','',AXIS.subtitle));sum.append(title,node('span','axis-count',`${grouped.length} project${grouped.length===1?'':'s'}`),node('span','axis-chevron','⌄'));axis.append(sum);
 const list=node('div','wp-list');for(const [wp,label] of WORK_PACKAGES){const group=grouped.filter(p=>p.primaryWP===wp);if(!group.length)continue;const section=node('section','wp');const head=node('div','wp-head');head.append(node('span','wp-num','WP'+wp),node('h3','',label),node('span','wp-count',`${group.length} project${group.length===1?'':'s'}`));section.append(head);const cards=node('div','cards');group.sort((a,b)=>a.title.localeCompare(b.title)).forEach(p=>cards.append(projectCard(p)));section.append(cards);list.append(section);}axis.append(list);area.append(axis);
}
function detailSection(label,value){if(!value)return null;const el=node('section','detail-section');el.append(node('h3','',label),node('p','',value));return el;}
function openProject(id,fromHash=false){
 const p=projects.find(p=>p.id===id);if(!p)return;
 if(!current)lastFocus=document.activeElement;current=p.id;
 const content=$('detail-content');content.replaceChildren();const meta=node('div','detail-meta');meta.append(node('span','','WP'+p.primaryWP),node('span','',p.fundingYear?'Cohort '+p.fundingYear:'Year unverified'),node('span','',FUNDING[p.fundingType]||'Funding unverified'));content.append(meta);
 const title=node('h2','drawer-title',p.title);title.id='detail-title';content.append(title);
 const relevance=node('div','detail-relevance');relevance.append(node('i','dot '+(p.hybridRelevance||'none')),node('span','',(RELEVANCE[p.hybridRelevance]||'Not assessed')+' relevance to Hybrid MR'));content.append(relevance);
 for(const [label,value] of [['Research focus',p.researchFocus],['Collaboration',p.collaboration],['Example',p.example],['Evaluation (from proposal)',p.evaluation],['Relationship to my Hybrid MR proposal',p.myResearch]]){const section=detailSection(label,value);if(section)content.append(section);}
 const link=$('pdf-link');if(p.pdfUrl&&/^https:\/\//.test(p.pdfUrl)){link.href=p.pdfUrl;link.hidden=false;}else{link.removeAttribute('href');link.hidden=true;}
 $('dialog-backdrop').hidden=false;$('detail-drawer').classList.add('open');$('detail-drawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('close-detail').focus();if(!fromHash)history.replaceState(null,'','#'+encodeURIComponent(p.id));
}
function closeProject(fromHash=false){if(!current)return;current=null;$('detail-drawer').classList.remove('open');$('detail-drawer').setAttribute('aria-hidden','true');$('dialog-backdrop').hidden=true;document.body.style.overflow='';if(!fromHash&&location.hash)history.replaceState(null,'',location.pathname+location.search);if(lastFocus&&lastFocus.isConnected)lastFocus.focus();}
function initEvents(){
 $('close-detail').addEventListener('click',()=>closeProject());$('dialog-backdrop').addEventListener('click',()=>closeProject());
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&current)closeProject();if(e.key==='Tab'&&current){const focusable=[...$('detail-drawer').querySelectorAll('button,a[href]')].filter(el=>el.getClientRects().length);if(!focusable.length)return;if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus();}}});
 window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));if(id&&id!==current)openProject(id,true);else if(!id&&current)closeProject(true);});
}
async function init(){initEvents();try{const res=await fetch('./projects.json',{cache:'no-store'});if(!res.ok)throw Error('Could not load projects.json');const raw=await res.json();if(!Array.isArray(raw))throw Error('projects.json must contain an array');projects=raw.filter(p=>String(p.primaryWP||'').startsWith('1.'));$('project-count').textContent=projects.length;render();const id=decodeURIComponent(location.hash.slice(1));if(id)openProject(id,true);}catch(err){$('error-message').hidden=false;$('error-message').textContent='Project data could not be loaded. If testing locally, run a local web server (instructions in README).';console.error(err);}}
init();
