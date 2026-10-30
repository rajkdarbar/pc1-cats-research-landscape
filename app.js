/* PC1 CATS landscape — edit projects.json to add or update projects. */
'use strict';

const AXIS = {
  id: '1',
  title: 'Interaction devices & modalities',
  subtitle: 'Heterogeneous collaboration spaces'
};
const WORK_PACKAGES = [
  ['1.1', 'Shared spatial layouts and views'],
  ['1.2', 'Multisensory collaboration'],
  ['1.3', 'Collaborative interaction techniques']
];
const FUNDING = {
  'pc1-full': 'PC1 fully funded',
  'support': 'PC1 support grant'
};
const RELEVANCE = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
  none: 'No direct link'
};

const $ = id => document.getElementById(id);
const node = (tag, className = '', text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};
let projects = [], current = null, lastFocus = null;

function projectCard(p) {
  const card = node('article', 'project-card');
  card.dataset.relevance = p.hybridRelevance || 'none';

  // Row 1: complete project title.
  card.append(node('h4', 'card-title', p.title));

  // Row 2: five items (year, funding, summary, PDF, relevance).
  const tags = node('div', 'card-tags');
  tags.append(node('span', 'year-tag', p.fundingYear ? String(p.fundingYear) : 'Year unverified'));
  tags.append(node('span', 'funding ' + (p.fundingType || ''), FUNDING[p.fundingType] || 'Funding unverified'));

  const summary = node('button', 'card-link summary-link', 'Research summary ↗');
  summary.type = 'button';
  summary.setAttribute('aria-label', 'Open research summary: ' + p.title);
  summary.addEventListener('click', () => openProject(p.id));
  tags.append(summary);

  if (p.pdfUrl && /^https:\/\//.test(p.pdfUrl)) {
    const pdf = node('a', 'card-link pdf-card-link', 'Original PDF ↗');
    pdf.href = p.pdfUrl;
    pdf.target = '_blank';
    pdf.rel = 'noopener noreferrer';
    pdf.setAttribute('aria-label', 'Open original PDF: ' + p.title);
    tags.append(pdf);
  } else {
    tags.append(node('span', 'card-link unavailable-pdf', 'PDF unavailable'));
  }

  const relevanceKey = RELEVANCE[p.hybridRelevance] ? p.hybridRelevance : 'none';
  const relevance = node('span', 'relevance-tag ' + relevanceKey);
  relevance.append(node('i', 'dot ' + relevanceKey));
  relevance.append(node('span', '', 'Relevance to my research: ' + RELEVANCE[relevanceKey]));
  tags.append(relevance);
  card.append(tags);
  return card;
}

function render() {
  const area = $('landscape');
  area.replaceChildren();
  const grouped = projects.filter(p => String(p.primaryWP || '').startsWith('1.'));

  const axis = node('details', 'axis');
  axis.open = true;
  const header = node('summary');
  header.append(node('span', 'axis-number', '1'));
  const axisText = node('span', 'axis-text');
  axisText.append(node('strong', '', AXIS.title), node('small', '', AXIS.subtitle));
  header.append(axisText,
    node('span', 'axis-count', `${grouped.length} project${grouped.length === 1 ? '' : 's'}`),
    node('span', 'axis-chevron', '⌄'));
  axis.append(header);

  const list = node('div', 'wp-list');
  for (const [wp, label] of WORK_PACKAGES) {
    const group = grouped.filter(p => p.primaryWP === wp);
    if (!group.length) continue;
    const section = node('section', 'wp');
    const heading = node('div', 'wp-head');
    heading.append(node('span', 'wp-num', 'WP' + wp), node('h3', '', label),
      node('span', 'wp-count', `${group.length} project${group.length === 1 ? '' : 's'}`));
    section.append(heading);
    const cards = node('div', 'cards');
    // Chronological order within each work package; unknown years appear last.
    group.sort((a, b) => {
      const yearOf = project => project.fundingYear && Number.isFinite(Number(project.fundingYear))
        ? Number(project.fundingYear) : Infinity;
      return yearOf(a) - yearOf(b) || a.title.localeCompare(b.title);
    }).forEach(p => cards.append(projectCard(p)));
    section.append(cards);
    list.append(section);
  }
  axis.append(list);
  area.append(axis);
}

function detailSection(label, value) {
  if (!value) return null;
  const section = node('section', 'detail-section');
  section.append(node('h3', '', label), node('p', '', value));
  return section;
}

function openProject(id, fromHash = false) {
  const p = projects.find(project => project.id === id);
  if (!p) return;
  if (!current) lastFocus = document.activeElement;
  current = p.id;

  const content = $('detail-content');
  content.replaceChildren();
  const title = node('h2', 'drawer-title', p.title);
  title.id = 'detail-title';
  content.append(title);

  // The PDF, funding, year and relevance are already displayed on the project card.
  for (const [label, value] of [
    ['Research focus', p.researchFocus],
    ['Collaboration', p.collaboration],
    ['Evaluation', p.evaluation],
    ['Relationship to my proposed Hybrid MR research', p.myResearch]
  ]) {
    const section = detailSection(label, value);
    if (section) content.append(section);
  }

  $('dialog-backdrop').hidden = false;
  $('detail-drawer').classList.add('open');
  $('detail-drawer').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('close-detail').focus();
  if (!fromHash) history.replaceState(null, '', '#' + encodeURIComponent(p.id));
}

function closeProject(fromHash = false) {
  if (!current) return;
  current = null;
  $('detail-drawer').classList.remove('open');
  $('detail-drawer').setAttribute('aria-hidden', 'true');
  $('dialog-backdrop').hidden = true;
  document.body.style.overflow = '';
  if (!fromHash && location.hash) history.replaceState(null, '', location.pathname + location.search);
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
}

function initEvents() {
  $('close-detail').addEventListener('click', () => closeProject());
  $('dialog-backdrop').addEventListener('click', () => closeProject());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && current) closeProject();
    if (e.key === 'Tab' && current) {
      const focusable = [...$('detail-drawer').querySelectorAll('button,a[href]')]
        .filter(el => el.getClientRects().length);
      if (!focusable.length) return;
      if (e.shiftKey && document.activeElement === focusable[0]) {
        e.preventDefault(); focusable.at(-1).focus();
      } else if (!e.shiftKey && document.activeElement === focusable.at(-1)) {
        e.preventDefault(); focusable[0].focus();
      }
    }
  });
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && id !== current) openProject(id, true);
    else if (!id && current) closeProject(true);
  });
}

async function init() {
  initEvents();
  try {
    const response = await fetch('./projects.json', {cache: 'no-store'});
    if (!response.ok) throw Error('Could not load projects.json');
    const raw = await response.json();
    if (!Array.isArray(raw)) throw Error('projects.json must contain an array');
    // Current mapping is PC1 Axis 1, excluding projects fully funded by other PCs.
    projects = raw.filter(p => String(p.primaryWP || '').startsWith('1.') &&
      ['pc1-full', 'support'].includes(p.fundingType));
    $('project-count').textContent = projects.length;
    $('pc1-full-count').textContent = projects.filter(p => p.fundingType === 'pc1-full').length;
    $('pc1-support-count').textContent = projects.filter(p => p.fundingType === 'support').length;
    render();
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) openProject(id, true);
  } catch (error) {
    $('error-message').hidden = false;
    $('error-message').textContent = 'Unable to display projects. Please check the browser console for details.';
    console.error(error);
  }
}
init();
