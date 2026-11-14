/* Additive PC1 research topic navigator. Independent of the original axis/WP interface. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const el = (tag, className, text) => {
    const x = document.createElement(tag);
    if (className) x.className = className;
    if (text !== undefined) x.textContent = text;
    return x;
  };
  const axisOf = project => String(project.primaryWP || '').split('.')[0];
  const axisNames = ['Interaction devices & modalities', 'Diversity of users', 'Complex tasks & environments', 'Dynamic transitions'];
  let topics = [], projects = [], mapping = [], selected = { topicId: null, axis: null };
  let search = '', detailOpen = false, expandedProject = null, sortMode = 'cross';
  let membership = new Map();
  const getTopic = id => topics.find(t => t.id === id);
  const entries = tid => membership.get(tid) || [];
  const selectedEntries = () => entries(selected.topicId).filter(e => selected.axis === null || axisOf(e.project) === String(selected.axis));
  const countAxis = (tid, ax) => entries(tid).filter(e => axisOf(e.project) === String(ax)).length;
  const countDistinctAxes = tid => [1, 2, 3, 4].filter(a => countAxis(tid, a) > 0).length;
  const MAX = 6;
  const densityClass = n => n === 0 ? 'tn-density-0' : `tn-density-${Math.min(n, MAX)}`;
  const isSelected = (tid, ax) => tid === selected.topicId && selected.axis === ax;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  function select(tid, ax) {
    selected = { topicId: tid, axis: ax };
    expandedProject = null;
    renderHeatmap();
    renderPreview();
    if (detailOpen) renderDetail();
  }

  function sortTopics(list) {
    return [...list].sort((a, b) => sortMode === 'alphabetic' ? a.label.localeCompare(b.label)
      : countDistinctAxes(b.id) - countDistinctAxes(a.id) || entries(b.id).length - entries(a.id).length || a.label.localeCompare(b.label));
  }

  function renderHeatmap() {
    const area = $('tn-heatmap-rows');
    const oldTop = $('tn-heatmap-scroll').scrollTop;
    area.replaceChildren();
    const list = sortTopics(topics.filter(t => (t.label + ' ' + t.definition).toLowerCase().includes(search.toLowerCase())));
    $('tn-topic-list-count').textContent = search.trim() ? `${list.length} of ${topics.length} topics` : '';
    $('tn-empty-search').hidden = list.length !== 0;
    for (const t of list) {
      const row = el('div', 'tn-heat-row' + (t.id === selected.topicId ? ' tn-is-selected' : ''));
      const topicButton = el('button', 'tn-topic-button', t.label);
      topicButton.type = 'button';
      topicButton.title = `${t.definition}\n${entries(t.id).length} projects across ${countDistinctAxes(t.id)} axes. Click to view all axes.`;
      topicButton.setAttribute('aria-label', `${t.label}: ${entries(t.id).length} projects across ${countDistinctAxes(t.id)} PC1 axes. Click to view all axes.`);
      topicButton.setAttribute('aria-pressed', String(isSelected(t.id, null)));
      topicButton.addEventListener('click', () => select(t.id, null));
      row.append(topicButton);
      for (let a = 1; a <= 4; a++) {
        const n = countAxis(t.id, a);
        const b = el('button', 'tn-cell ' + densityClass(n) + (isSelected(t.id, a) ? ' tn-cell-active' : ''), '');
        b.type = 'button';
        b.title = `${t.label} · Axis ${a}: ${n} ${n === 1 ? 'project' : 'projects'}. Click to focus on this axis.`;
        b.setAttribute('aria-label', `${t.label}, Axis ${a}: ${n} ${n === 1 ? 'project' : 'projects'}.`);
        b.setAttribute('aria-pressed', String(isSelected(t.id, a)));
        b.addEventListener('click', () => select(t.id, a));
        row.append(b);
      }
      area.append(row);
    }
    $('tn-heatmap-scroll').scrollTop = oldTop;
  }

  function renderPreview() {
    const t = getTopic(selected.topicId);
    if (!t) return;
    $('tn-selected-name').textContent = t.label;
    $('tn-selected-desc').textContent = t.definition;
    $('tn-selected-scope').textContent = selected.axis === null ? 'All four PC1 axes' : `Axis ${selected.axis} · ${axisNames[selected.axis - 1]}`;
    const number = selectedEntries().length;
    $('tn-selected-count').textContent = `${number} ${number === 1 ? 'project' : 'projects'} in selection`;
    $('tn-selected-meta').textContent = selected.axis === null
      ? `${entries(t.id).length} in total · present in ${countDistinctAxes(t.id)} of 4 axes`
      : 'Showing only the selected research-topic cell';
    $('tn-selection-tip').textContent = selected.axis === null ? 'Showing all matching projects across axes.' : 'Click the topic name to return to all four axes.';
    const bars = $('tn-preview-bars'); bars.replaceChildren();
    const visibleAxes = selected.axis === null ? [1, 2, 3, 4] : [selected.axis];
    const max = Math.max(...visibleAxes.map(a => countAxis(t.id, a)), 1);
    for (const a of visibleAxes) {
      const n = countAxis(t.id, a);
      const group = el('div', 'tn-bar-group');
      const label = el('span', 'tn-bar-label', `A${a}`);
      const track = el('div', 'tn-bar-track');
      const fill = el('div', 'tn-bar-fill');
      fill.style.width = `${Math.max(0, n / max * 100)}%`;
      track.append(fill);
      const numberEl = el('span', 'tn-bar-count', String(n));
      group.append(label, track, numberEl);
      bars.append(group);
    }
  }

  function makeProjectCard(entry) {
    const p = entry.project;
    const card = el('article', 'tn-project-card');
    const heading = el('button', 'tn-project-title');
    heading.type = 'button';
    const headRow = el('span', 'tn-project-head');
    const titleBox = el('span', 'tn-project-head-inner');
    titleBox.append(el('span', 'tn-project-meta', `Axis ${axisOf(p)} · WP${p.primaryWP} · ${p.fundingYear || 'Year unverified'}`), el('strong', '', p.title));
    const open = expandedProject === p.id;
    headRow.append(titleBox, el('span', 'tn-chevron', open ? '−' : '+'));
    heading.append(headRow);
    heading.setAttribute('aria-expanded', String(open));
    heading.addEventListener('click', () => { expandedProject = open ? null : p.id; renderDetail(); });
    card.append(heading);
    card.append(el('p', 'tn-project-why', entry.reason));
    if (open) {
      const detail = el('div', 'tn-project-extra');
      detail.append(el('p', 'tn-evidence-label', 'Five extracted project keywords'));
      const tagArea = el('div', 'tn-keyword-tags');
      for (const kw of entry.keywords) tagArea.append(el('span', 'tn-keyword', kw));
      detail.append(tagArea);
      const links = el('div', 'tn-project-links');
      const summary = el('button', 'tn-link-button', 'Open existing research summary ↗');
      summary.type = 'button';
      summary.addEventListener('click', () => {
        if (typeof window.openProject === 'function') window.openProject(p.id);
        else { // fallback: original app.js normally declares a global function
          location.hash = encodeURIComponent(p.id);
        }
      });
      links.append(summary);
      if (p.pdfUrl && /^https:\/\//.test(p.pdfUrl)) {
        const a = el('a', 'tn-link-button', 'Original project proposal ↗');
        a.href = p.pdfUrl; a.target = '_blank'; a.rel = 'noopener noreferrer'; links.append(a);
      }
      detail.append(links);
      card.append(detail);
    }
    return card;
  }

  function renderDetail() {
    const area = $('tn-project-explorer');
    area.hidden = !detailOpen;
    if (!detailOpen) return;
    const t = getTopic(selected.topicId);
    $('tn-detail-title').textContent = t.label;
    $('tn-detail-desc').textContent = t.definition;
    const chips = $('tn-detail-axis-filters'); chips.replaceChildren();
    const choices = [{ axis: null, label: 'All axes', n: entries(t.id).length }, ...[1, 2, 3, 4].map(a => ({ axis: a, label: `Axis ${a}`, n: countAxis(t.id, a) }))];
    for (const choice of choices) {
      const b = el('button', 'tn-axis-choice' + (selected.axis === choice.axis ? ' tn-axis-choice-selected' : ''), `${choice.label} · ${choice.n}`);
      b.type = 'button'; b.setAttribute('aria-pressed', String(selected.axis === choice.axis));
      b.addEventListener('click', () => select(t.id, choice.axis)); chips.append(b);
    }
    const matching = selectedEntries();
    $('tn-detail-count').textContent = `${matching.length} ${matching.length === 1 ? 'project' : 'projects'}`;
    const groups = $('tn-detail-projects'); groups.replaceChildren();
    if (!matching.length) { groups.append(el('p', 'tn-no-projects', 'No mapped projects for this topic in the selected axis. Choose another axis or Show all axes.')); return; }
    for (const a of [1, 2, 3, 4]) {
      const subset = matching.filter(e => axisOf(e.project) === String(a));
      if (!subset.length) continue;
      const section = el('section', 'tn-axis-group');
      const heading = el('h4', 'tn-axis-group-title', `Axis ${a} · ${axisNames[a - 1]}`);
      heading.append(el('span', 'tn-axis-group-count', `${subset.length} ${subset.length === 1 ? 'project' : 'projects'}`));
      section.append(heading);
      const cards = el('div', 'tn-project-grid');
      for (const e of [...subset].sort((x, y) => x.project.title.localeCompare(y.project.title))) cards.append(makeProjectCard(e));
      section.append(cards); groups.append(section);
    }
  }

  async function init() {
    try {
      const responses = await Promise.all(['projects.json', 'research-topics.json', 'research-topic-mapping.json'].map(f => fetch('./' + f, { cache: 'no-store' })));
      if (responses.some(r => !r.ok)) throw Error('Could not load one of the navigation data files');
      [projects, topics, mapping] = await Promise.all(responses.map(r => r.json()));
      const projectById = new Map(projects.map(p => [p.id, p]));
      for (const t of topics) membership.set(t.id, []);
      for (const row of mapping) {
        const p = projectById.get(row.project_id);
        if (!p) throw Error('Unknown project ' + row.project_id);
        for (const tag of row.topics) {
          if (!membership.has(tag.topic_id)) throw Error('Unknown topic ' + tag.topic_id);
          membership.get(tag.topic_id).push({ project: p, reason: tag.reason, keywords: row.keywords });
        }
      }
      if (projects.length !== 34 || mapping.length !== 34) throw Error('Expected 34 mapped project descriptions');
      const checked = sortTopics(topics);
      selected.topicId = (topics.find(t => t.id === 'group-coordination') || checked[0]).id;
      selected.axis = null;
      $('tn-counts').textContent = `${topics.length} research topics · ${projects.length} projects · ${mapping.reduce((n, m) => n + m.topics.length, 0)} preliminary topic associations`;
      $('tn-topic-search').addEventListener('input', e => { search = e.target.value; renderHeatmap(); });
      $('tn-topic-sort').addEventListener('change', e => { sortMode = e.target.value; renderHeatmap(); });
      $('tn-explore').addEventListener('click', () => {
        detailOpen = true;
        expandedProject = null;
        renderDetail();
        $('tn-project-explorer').scrollIntoView({ behavior: motion, block: 'start' });
      });
      $('tn-close-explorer').addEventListener('click', () => { detailOpen = false; renderDetail(); $('tn-navigator').scrollIntoView({ behavior: motion, block: 'start' }); });
      $('tn-expand-heatmap').addEventListener('click', () => {
        const x = $('tn-heatmap-scroll'); x.classList.toggle('tn-heatmap-expanded');
        const on = x.classList.contains('tn-heatmap-expanded');
        $('tn-contents').querySelector('.tn-main').classList.toggle('tn-main-expanded', on);
        $('tn-expand-heatmap').textContent = on ? 'Compact overview' : 'Show full heatmap';
        $('tn-expand-heatmap').setAttribute('aria-expanded', String(on));
      });
      renderHeatmap(); renderPreview();
      $('tn-loader').hidden = true;
      $('tn-contents').hidden = false;
    } catch (err) {
      $('tn-loader').textContent = 'Unable to load the research topic map. Run this site through a local web server and check its JSON files.';
      console.error('Topic navigator:', err);
    }
  }
  init();
})();
