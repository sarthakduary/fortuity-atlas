'use strict';
(() => {
  const $ = (selector) => document.querySelector(selector);
  const els = {search: $('#search'), year: $('#year'), kind: $('#kind'), sort: $('#sort'), topics: $('#topic-filters'), papers: $('#papers'), count: $('#results-count'), empty: $('#empty-state'), error: $('#load-error')};
  let papers = [];
  let topic = 'all';
  let toastTimer;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const normalize = (s) => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const dateText = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
  const arxivUrl = (paper, pdf = false) => `https://arxiv.org/${pdf ? 'pdf' : 'abs'}/${encodeURIComponent(paper.id)}`;
  function bibtex(paper) {
    const tex = (value) => String(value).replace(/\\/g, '\\textbackslash{}').replace(/([&%#_])/g, '\\$1').replace(/Ψ/g, '\\ensuremath{\\Psi}').replace(/\^/g, '\\textasciicircum{}');
    const author = (name) => name === 'Robert de Mello Koch' ? '{de Mello Koch}, Robert' : name === 'Leonardo Pipolo de Gioia' ? '{Pipolo de Gioia}, Leonardo' : tex(name);
    return `@misc{arxiv${paper.id.replace(/[^a-z0-9]/gi, '')},\n  title = {{${tex(paper.title)}}},\n  author = {${paper.authors.map(author).join(' and ')}},\n  year = {${paper.date.slice(0, 4)}},\n  eprint = {${paper.id}},\n  archivePrefix = {arXiv},\n  primaryClass = {hep-th},\n  url = {${arxivUrl(paper)}}\n}`;
  }
  function notify(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }
  function filteredPapers() {
    const terms = normalize(els.search.value.trim()).split(/\s+/).filter(Boolean);
    const year = els.year.value;
    const filtered = papers.filter((paper) => (topic === 'all' || paper.topics.includes(topic)) && (els.kind.value === 'all' || paper.kind === els.kind.value) && (year === 'all' || paper.date.startsWith(year)) && terms.every((term) => paper.searchText.includes(term)));
    return filtered.sort((a, b) => els.sort.value === 'title' ? a.title.localeCompare(b.title) : els.sort.value === 'oldest' ? a.date.localeCompare(b.date) || a.id.localeCompare(b.id) : b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }
  function render() {
    const filtered = filteredPapers();
    els.count.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${papers.length}</strong> papers`;
    els.empty.hidden = filtered.length !== 0;
    els.papers.innerHTML = filtered.map((paper) => `<article class="paper" aria-labelledby="paper-${esc(paper.id)}">
      <div class="paper-meta"><time class="paper-date" datetime="${esc(paper.date)}">${esc(dateText(paper.date))}</time><a class="paper-id" href="${arxivUrl(paper)}" target="_blank" rel="noopener noreferrer" aria-label="arXiv ${esc(paper.id)}">${esc(paper.id)}</a><span class="paper-kind">${paper.kind === 'background' ? 'Background' : 'Core research'}</span></div>
      <div class="paper-content"><h3 class="paper-title" id="paper-${esc(paper.id)}"><a href="${arxivUrl(paper)}" target="_blank" rel="noopener noreferrer">${esc(paper.title)}</a></h3><p class="paper-authors">${paper.authors.map(esc).join(' · ')}</p><div class="paper-topics">${paper.topics.map((tag) => `<span class="paper-tag">${esc(tag)}</span>`).join('')}</div><details class="paper-summary"><summary>Read summary <span class="chevron" aria-hidden="true">+</span></summary><p>${esc(paper.summary)}</p></details></div>
      <div class="paper-links"><a href="${arxivUrl(paper)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${esc(paper.title)} on arXiv">arXiv <span aria-hidden="true">↗</span></a><a href="${arxivUrl(paper, true)}" target="_blank" rel="noopener noreferrer" aria-label="Open PDF of ${esc(paper.title)}">PDF <span aria-hidden="true">↗</span></a><button class="cite-button" type="button" data-cite="${esc(paper.id)}" aria-label="Copy BibTeX for ${esc(paper.title)}">Copy BibTeX</button></div>
    </article>`).join('');
  }
  function reset() {
    topic = 'all'; els.search.value = ''; els.year.value = 'all'; els.kind.value = 'all'; els.sort.value = 'newest';
    els.topics.querySelectorAll('button').forEach((button) => {const selected = button.dataset.topic === 'all'; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected));});
    render();
  }
  els.search.addEventListener('input', render);
  els.year.addEventListener('change', render);
  els.kind.addEventListener('change', render);
  els.sort.addEventListener('change', render);
  $('#search-form').addEventListener('submit', (event) => event.preventDefault());
  els.topics.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-topic]');
    if (!button) return;
    topic = button.dataset.topic;
    els.topics.querySelectorAll('button').forEach((item) => {const selected = item === button; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected));});
    render();
  });
  $('#clear-filters').addEventListener('click', reset);
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !event.ctrlKey && !event.metaKey && !event.altKey) {event.preventDefault(); els.search.focus();}
  });
  els.papers.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-cite]');
    if (!button) return;
    const paper = papers.find((item) => item.id === button.dataset.cite);
    if (!paper) return;
    const citation = bibtex(paper);
    try {await navigator.clipboard.writeText(citation); notify('BibTeX citation copied');}
    catch {$('#bib-fallback').value = citation; $('#bib-dialog').showModal(); $('#bib-fallback').focus(); $('#bib-fallback').select();}
  });
  $('#close-dialog').addEventListener('click', () => $('#bib-dialog').close());
  $('#download-bib').addEventListener('click', () => {
    const selected = filteredPapers();
    if (!selected.length) {notify('No papers match the current filters'); return;}
    const blob = new Blob([selected.map(bibtex).join('\n\n') + '\n'], {type: 'application/x-bibtex;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'fortuity-atlas.bib'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`Downloaded ${selected.length} citations`);
  });
  async function load() {
    try {
      const response = await fetch('papers.json');
      if (!response.ok) throw new Error('Could not load bibliography');
      const data = await response.json();
      if (!Array.isArray(data.papers)) throw new Error('Invalid bibliography');
      papers = data.papers.map((paper) => ({...paper, topics: paper.topics || [], authors: Array.isArray(paper.authors) ? paper.authors : [paper.authors], searchText: normalize([paper.title, ...(Array.isArray(paper.authors) ? paper.authors : [paper.authors]), paper.id, paper.summary, ...(paper.topics || []), paper.kind, paper.category].join(' '))}));
      $('#total-count').textContent = papers.length;
      if (data.updated) $('#verified-date').textContent = dateText(data.updated);
      const years = [...new Set(papers.map((paper) => paper.date.slice(0, 4)))].sort().reverse();
      els.year.innerHTML = '<option value="all">All years</option>' + years.map((year) => `<option value="${esc(year)}">${esc(year)}</option>`).join('');
      const topics = [...new Set(papers.flatMap((paper) => paper.topics))].sort((a, b) => a.localeCompare(b));
      els.topics.innerHTML += topics.map((label) => `<button type="button" class="topic-chip" data-topic="${esc(label)}" aria-pressed="false">${esc(label)}</button>`).join('');
      render();
      // The bibliography changes the height above About after the initial anchor jump.
      if (window.location.hash === '#about') {
        document.getElementById('about').scrollIntoView({behavior: 'instant', block: 'start'});
      }
    } catch (error) {
      els.error.hidden = false; els.count.textContent = 'Collection unavailable'; $('#download-bib').disabled = true;
      console.error('Fortuity Atlas:', error.message);
    } finally {els.papers.setAttribute('aria-busy', 'false');}
  }
  load();
})();
