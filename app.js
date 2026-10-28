/* Edit projects.json to add projects. The web page groups by one primary WP. */
'use strict';
const AXES=[
{id:'1',title:'Interaction devices & modalities',subtitle:'Heterogeneous collaboration spaces'},
{id:'2',title:'Users & collaboration experience',subtitle:'Diversity, embodiment, and evaluation'},
{id:'3',title:'Complex tasks & environments',subtitle:'Collaboration at scale and hybrid spaces'},
{id:'4',title:'Transitions between collaboration spaces',subtitle:'Movement, context, and group dynamics'}];
const WORK_PACKAGES=[
['1.1','Shared spatial layouts and views'],['1.2','Multisensory collaboration'],['1.3','Collaborative interaction techniques'],
['2.1','User diversity and accessibility'],['2.2','Embodiment and agency'],['2.3','Collaborative experience evaluation'],
['3.1','Collaborative analysis of large datasets'],['3.2','Complex collaborative tasks'],['3.3','Hybrid environments'],
['4.1','Transitions between spaces and interaction techniques'],['4.2','Transitions between users and groups'],['4.3','Transitions between complex environments']];
const FUNDING={'pc1-full':'PC1 fully funded','support':'Support grant','pc5-full':'PC5 fully funded'};
const RELEVANCE={'strong':'Strong','moderate':'Moderate','weak':'Weak','none':'No direct link','potential':'Potential'};
const $=id=>document.getElementById(id);
const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
let projects=[];let lastFocus=null;let current=null;
function projectCard(p){
const card=node('article','project-card');
card.append(node('h4','card-title',p.title));
const meta=node('div','card-meta');meta.append(node('span','',String(p.fundingYear||'Year not verified')));meta.append(node('span','funding '+p.fundingType,FUNDING[p.fundingType]||p.fundingType));card.append(meta);
if(p.researchFocus)card.append(node('p','card-focus',p.researchFocus));
const exp=p.example||p.collaboration;
if(exp){const para=node('p','card-example');para.append(node('b','',p.example?'Example: ':'Collaboration: '));para.append(document.createTextNode(exp));card.append(para);}
const rel=node('div','card-relevance');const dot=node('i','circle '+(p.hybridRelevance||'none'));rel.append(dot,node('span','',RELEVANCE[p.hybridRelevance]||'Not assessed'));card.append(rel);
const actions=node('div','card-actions');const detail=node('button','details-button','Read short summary ↗');detail.type='button';detail.setAttribute('aria-label','Read summary of '+p.title);detail.addEventListener('click',()=>openProject(p.id));actions.append(detail);
if(p.pdfUrl&&/^https:\/\//.test(p.pdfUrl)){const link=node('a','pdf-small','Original PDF ↗');link.href=p.pdfUrl;link.rel='noopener noreferrer';link.target='_blank';actions.append(link);}card.append(actions);return card;
}
function render(){const landscape=$('landscape');landscape.replaceChildren();
for(const axis of AXES){const grouped=projects.filter(p=>String(p.primaryWP).startsWith(axis.id+'.'));const sec=node('details','axis');sec.dataset.axis=axis.id;sec.open=true;
const sum=node('summary','');sum.append(node('span','axis-number',axis.id));const title=node('span','axis-text');title.append(node('strong','',axis.title),node('small','',axis.subtitle));sum.append(title,node('span','axis-count',`${grouped.length} project${grouped.length===1?'':'s'}`),node('span','axis-chevron','⌄'));sec.append(sum);
const wps=node('div','wp-list');for(const [wp,title] of WORK_PACKAGES.filter(([id])=>id.startsWith(axis.id+'.'))){const set=grouped.filter(p=>p.primaryWP===wp);if(!set.length)continue;const section=node('section','wp');const head=node('div','wp-head');head.append(node('span','wp-num','WP'+wp),node('h3','',title),node('span','wp-count',`${set.length} project${set.length===1?'':'s'}`));section.append(head);const list=node('div','cards');set.sort((a,b)=>a.title.localeCompare(b.title)).forEach(p=>list.append(projectCard(p)));section.append(list);wps.append(section);}
if(!wps.children.length){const t=node('p','empty-wp','No projects mapped under this axis yet.');wps.append(t);}sec.append(wps);landscape.append(sec);}
}
function detailSection(label,val){if(!val)return null;const part=node('section','detail-section');part.append(node('h3','',label),node('p','',val));return part;}
function openProject(id,fromHash=false){const p=projects.find(x=>x.id===id);if(!p)return;lastFocus=document.activeElement;current=p.id;
const content=$('detail-content');content.replaceChildren();const meta=node('div','detail-meta');meta.append(node('span','','WP'+p.primaryWP),node('span','',String(p.fundingYear||'Year not verified')),node('span','',FUNDING[p.fundingType]||p.fundingType));content.append(meta);const title=node('h2','drawer-title',p.title);title.id='detail-title';content.append(title);
const relevance=node('div','card-relevance');relevance.append(node('i','circle '+(p.hybridRelevance||'none')),node('span','',(RELEVANCE[p.hybridRelevance]||'Not assessed')+' connection to Hybrid MR'));content.append(relevance);
for(const [label,val] of [['Research focus',p.researchFocus],['Collaboration',p.collaboration],['Illustrative example',p.example],['Evaluation (from proposal)',p.evaluation],['Connection to my Hybrid MR research',p.myResearch]]){const sect=detailSection(label,val);if(sect)content.append(sect);}
const pdf=$('pdf-link');if(p.pdfUrl&&/^https:\/\//.test(p.pdfUrl)){pdf.href=p.pdfUrl;pdf.classList.remove('hidden');}else{pdf.removeAttribute('href');pdf.classList.add('hidden');}
$('dialog-backdrop').hidden=false;$('detail-drawer').classList.add('open');$('detail-drawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('close-detail').focus();if(!fromHash)history.replaceState(null,'','#'+encodeURIComponent(p.id));}
function closeProject(){if(!current)return;current=null;$('detail-drawer').classList.remove('open');$('detail-drawer').setAttribute('aria-hidden','true');$('dialog-backdrop').hidden=true;document.body.style.overflow='';if(location.hash)history.replaceState(null,'',location.pathname+location.search);if(lastFocus&&lastFocus.isConnected)lastFocus.focus();}
async function copyLink(){if(!current)return;const url=location.href.split('#')[0]+'#'+encodeURIComponent(current);try{await navigator.clipboard.writeText(url);$('copy-link').textContent='Copied!';}catch{window.prompt('Copy project link:',url);}setTimeout(()=>$('copy-link').textContent='Copy project link',1400);}
function initEvents(){$('close-detail').addEventListener('click',closeProject);$('dialog-backdrop').addEventListener('click',closeProject);$('copy-link').addEventListener('click',copyLink);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProject();if(e.key==='Tab'&&current){const els=[...$('detail-drawer').querySelectorAll('button,a[href]')].filter(x=>x.getClientRects().length);if(!els.length)return;if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus();}}});
window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));if(id&&id!==current)openProject(id,true);else if(!id&&current)closeProject();});}
async function init(){initEvents();try{const res=await fetch('./projects.json',{cache:'no-store'});if(!res.ok)throw Error('Failed to load project data');const raw=await res.json();if(!Array.isArray(raw))throw Error('The projects data must be a JSON array');projects=raw;$('project-count').textContent=projects.length;for(const [type,id] of [['pc1-full','pc1-count'],['support','support-count'],['pc5-full','pc5-count']])$(id).textContent=projects.filter(p=>p.fundingType===type).length;render();const id=decodeURIComponent(location.hash.slice(1));if(id)openProject(id,true);}catch(e){$('error-message').hidden=false;$('error-message').textContent='Could not load projects.json. Use a local server when viewing on your computer (see README.md).';console.error(e);}}
init();
