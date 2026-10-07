(() => {
  'use strict';

  const body = document.body;
  const root = body.dataset.root || './';
  const pageId = body.dataset.page || 'home';
  const pageTitle = body.dataset.title || document.title;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Some privacy modes, local file previews and embedded sandboxes disable
  // persistent browser storage. Detect that state so the UI can warn the user
  // rather than claiming that notes are safely saved.
  const memoryStorage = window.__playbookStorageFallback || (window.__playbookStorageFallback = new Map());
  let persistentStorageAvailable = false;
  try {
    const testKey = '__atlassian_playbook_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    persistentStorageAvailable = true;
  } catch {
    persistentStorageAvailable = false;
  }
  function storageGet(key) {
    if (persistentStorageAvailable) {
      try { return window.localStorage.getItem(key); } catch { /* fall through */ }
    }
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  }
  function storageSet(key, value) {
    if (persistentStorageAvailable) {
      try { window.localStorage.setItem(key, value); return true; } catch { /* fall through */ }
    }
    memoryStorage.set(key, String(value));
    return false;
  }
  function storageRemove(key) {
    if (persistentStorageAvailable) {
      try { window.localStorage.removeItem(key); return true; } catch { /* fall through */ }
    }
    memoryStorage.delete(key);
    return false;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* use verified fallback */ }
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.left = '-9999px';
    helper.style.top = '0';
    document.body.append(helper);
    helper.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    helper.remove();
    return copied;
  }

  function downloadText(filename, text, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const NAV = [
    {
      title: 'Start',
      items: [
        ['home', 'Home', 'index.html'],
        ['quick-revision', 'Quick Revision', 'pages/quick-revision/index.html']
      ]
    },
    {
      title: 'AI-Enabled Code Design',
      items: [
        ['ai-overview', 'Round Overview', 'pages/ai-code-design/index.html'],
        ['ai-pin', 'PIN: Four Distinct Digits', 'pages/ai-code-design/pin-validation.html', true],
        ['ai-password', 'Password Bug', 'pages/ai-code-design/password-bug.html', true],
        ['ai-rating', 'P40: Agent Rating System', 'pages/ai-code-design/agent-rating-system.html', true],
        ['ai-router', 'P40: Middleware Router', 'pages/ai-code-design/middleware-router.html', true],
        ['ai-rate-limiter', 'P40: API Rate Limiter', 'pages/ai-code-design/api-rate-limiter.html', true],
        ['ai-snake', 'P40: Snake Game', 'pages/ai-code-design/snake-game.html', true],
        ['ai-prompts', 'AI Prompts', 'pages/ai-code-design/prompts.html', true],
        ['ai-concepts', 'Common Concepts', 'pages/ai-code-design/concepts.html', true]
      ]
    },
    {
      title: 'Full-Stack System Design',
      items: [
        ['system-overview', 'Round Overview', 'pages/system-design/index.html'],
        ['tagging-system', 'Product-Agnostic Tagging', 'pages/system-design/tagging-system.html', true],
        ['popular-feed', 'P40: Confluence Engagement Feed', 'pages/system-design/popular-feed.html', true],
        ['jira-board', 'Jira / Trello Board', 'pages/system-design/jira-board.html', true],
        ['system-followups', 'Follow-up Bank', 'pages/system-design/follow-ups.html', true],
        ['system-concepts', 'Concept Reference', 'pages/system-design/concepts.html', true],
        ['candidate-questions', 'Candidate-Reported Topics', 'pages/system-design/candidate-reported.html', true]
      ]
    },
    {
      title: 'Management Interview',
      items: [
        ['management-overview', 'Round Overview', 'pages/management/index.html'],
        ['management-questions', 'Question Bank', 'pages/management/questions.html', true],
        ['management-answers', 'Answer Library', 'pages/management/answers.html', true],
        ['management-projects', 'Project Deep Dives', 'pages/management/project-deep-dives.html', true],
        ['management-mock', 'Mock Interview', 'pages/management/mock.html', true]
      ]
    },
    {
      title: 'Values Interview',
      items: [
        ['values-overview', 'Round Overview', 'pages/values/index.html'],
        ['values-questions', 'Question Bank', 'pages/values/questions.html', true],
        ['values-answers', 'Answer Library', 'pages/values/answers.html', true],
        ['values-stories', 'Story Bank', 'pages/values/story-bank.html', true],
        ['values-intake', 'Practice Notes', 'pages/values/intake.html', true],
        ['values-mock', 'Mock Interview', 'pages/values/mock.html', true]
      ]
    },
    {
      title: 'Revision Tools',
      items: [
        ['official-guide', 'Official Atlassian Guide', 'pages/quick-revision/official-guide.html'],
        ['quick-checklists', 'Interview Checklists', 'pages/quick-revision/checklists.html'],
        ['quick-prompts', 'Prompt Library', 'pages/quick-revision/prompts.html']
      ]
    }
  ];

  const SEARCH_INDEX = [
    ['Home', 'Start', 'Dashboard, interview schedule, four-round preparation and immediate links.', 'index.html', 'dashboard schedule prompts manager values'],
    ['AI-Enabled Code Design Overview', 'AI Code Design', 'Repository workflow, evaluation signals and a 60-minute execution plan.', 'pages/ai-code-design/index.html', 'repository hackerrank plan agent diff tests'],
    ['PIN: Four Distinct Digits', 'AI Code Design', 'Complete interview simulation, Java solution, tests, edge cases and follow-ups.', 'pages/ai-code-design/pin-validation.html', 'pin java distinct digits spring boot validation leading zero'],
    ['Password Functionality Bug', 'AI Code Design', 'Root-cause workflow and representative BCrypt login bug simulation.', 'pages/ai-code-design/password-bug.html', 'password bcrypt encoder matches authentication frontend backend validation'],
    ['P40 Agent Rating System', 'AI Code Design', 'TDD practice for ratings, deterministic leaderboard, monthly windows and concurrency.', 'pages/ai-code-design/agent-rating-system.html', 'p40 rating customer care agent average leaderboard junit concurrency monthly'],
    ['P40 Middleware Router', 'AI Code Design', 'TDD practice for wildcard matching, exact precedence, normalization and Trie trade-offs.', 'pages/ai-code-design/middleware-router.html', 'p40 middleware router wildcard dynamic route mapping trie precedence addRoute getRoute'],
    ['P40 API Rate Limiter', 'AI Code Design', 'TDD practice for injected time, quota boundaries, atomic counters and distributed evolution.', 'pages/ai-code-design/api-rate-limiter.html', 'p40 api rate limiter fixed window token bucket clock concurrency retry after 429'],
    ['P40 Snake Game', 'AI Code Design', 'TDD practice for Nth-food growth, collision, boundary policy and O1 movement.', 'pages/ai-code-design/snake-game.html', 'p40 snake game nth food nextMove collision deque set typescript'],
    ['AI Prompt Library', 'AI Code Design', 'Bounded prompts for discovery, planning, implementation, tests and review.', 'pages/ai-code-design/prompts.html', 'ai prompts plan mode agent mode review diff'],
    ['AI Code Design Concepts', 'AI Code Design', 'Repository mapping, architectural placement, validation and testing concepts.', 'pages/ai-code-design/concepts.html', 'controller service repository test pyramid architecture'],
    ['Full-Stack System Design Overview', 'System Design', 'A repeatable 60-minute framework and full-stack design canvas.', 'pages/system-design/index.html', 'framework requirements scale api frontend backend tradeoffs'],
    ['Product-Agnostic Tagging System', 'Detailed Playbook', 'Jira, Confluence and Bitbucket tags, permissions, search and popular tags.', 'pages/system-design/tagging-system.html', 'tagging top k redis kafka permission tenant search indexing'],
    ['P40 Confluence Engagement Feed', 'Detailed Playbook', 'Personalized most-engaged content, exclusions, permission filtering and stable ranking.', 'pages/system-design/popular-feed.html', 'p40 confluence engaged documents leaderboard unread authored top k stream redis'],
    ['Jira / Trello Board', 'Detailed Playbook', 'P40-calibrated ordering, optimistic drag-and-drop, concurrency and real-time updates.', 'pages/system-design/jira-board.html', 'jira trello p40 lexo rank optimistic ui websocket concurrency'],
    ['System Design Follow-up Bank', 'System Design', 'High-frequency interviewer follow-ups with answer frameworks.', 'pages/system-design/follow-ups.html', 'database down duplicate events scaling cache permissions'],
    ['System Design Concepts', 'Reference', 'Interview-oriented distributed systems and frontend concepts.', 'pages/system-design/concepts.html', 'caching indexes sql nosql websocket sse idempotency consistency'],
    ['Candidate-Reported Questions', 'Research', 'Chat, Notion, scheduler, Google Sheets and full-stack discussion topics.', 'pages/system-design/candidate-reported.html', 'candidate reported chat notion scheduler sheets auth'],
    ['Management Interview Overview', 'Management', 'Official format, evaluation areas, answer framework and story map.', 'pages/management/index.html', 'manager leadership ownership outcomes conflict initiative career'],
    ['Management Question Bank', 'Management', 'Official themes, candidate-reported questions and pressure-test follow-ups.', 'pages/management/questions.html', 'manager questions feedback mentorship conflict end to end ownership'],
    ['Management Answer Library', 'Management', 'Pricing-first STAR-L answers for ownership, feedback, failure, conflict, mentoring and motivation.', 'pages/management/answers.html', 'star answers pricing feedback failure conflict mentoring why atlassian career'],
    ['Management Project Deep Dives', 'Management', 'Pricing fallback, Spark, migration, Promo UI and Wally project depth.', 'pages/management/project-deep-dives.html', 'pricing spark migration promo wally project deep dive'],
    ['Management Mock Interview', 'Management', 'Interactive question deck, timer, interruptions and scorecard.', 'pages/management/mock.html', 'mock timer ownership impact leadership career'],
    ['Values Interview Overview', 'Values', 'Five official Atlassian values, readiness map and answer strategy.', 'pages/values/index.html', 'open company heart balance customer team change values'],
    ['Values Question Bank', 'Values', 'Official prompt families, candidate reports and practice variants.', 'pages/values/questions.html', 'values questions feedback conflict customer teamwork change'],
    ['Values Answer Library', 'Values', 'Primary and backup situations for all five Atlassian values.', 'pages/values/answers.html', 'open company heart balance customer team change pricing triage spark'],
    ['Personal Story Bank', 'Values', 'Ten stories mapped across management and values prompts.', 'pages/values/story-bank.html', 'story matrix pricing spark failure conflict mentor triage promo wally'],
    ['Practice Note Builder', 'Values', 'Loss-safe optional notes with autosave, TXT/JSON export and import.', 'pages/values/intake.html', 'notes export import backup metrics rehearsal'],
    ['Values Mock Interview', 'Values', 'Interactive five-value mock, timers, follow-ups and scorecard.', 'pages/values/mock.html', 'mock values timer open customer team change'],
    ['Quick Revision', 'Revision', 'Ten-minute and twenty-minute review routes across all four rounds.', 'pages/quick-revision/index.html', 'revision cheat sheet manager values opening closing'],
    ['Official Atlassian Guide', 'Revision', 'Official interview signals for TDD, system design, management and values.', 'pages/quick-revision/official-guide.html', 'official guide tdd management values system design'],
    ['Interview Checklists', 'Revision', 'Before, during and final-review checklists for technical and behavioral rounds.', 'pages/quick-revision/checklists.html', 'checklist testing diff design star values'],
    ['Prompt Library', 'Revision', 'High-value AI prompts for technical, management and values practice.', 'pages/quick-revision/prompts.html', 'prompt copy interview ai mock behavioral']
  ];

  function href(path) { return `${root}${path}`; }

  function renderHeader() {
    const host = $('#site-header');
    if (!host) return;
    host.innerHTML = `
      <a class="skip-link" href="#main-content">Skip to content</a>
      <header class="site-header">
        <div class="header-left">
          <button class="icon-button menu-button" id="menu-button" aria-label="Open navigation" aria-expanded="false">☰</button>
          <a class="brand-link" href="${href('index.html')}">
            <span class="brand-mark">AP</span>
            <span><span class="brand-name">Atlassian Playbook</span><span class="brand-subtitle">Interview preparation</span></span>
          </a>
        </div>
        <div class="header-right">
          <button class="search-button" id="search-open" aria-label="Search playbook">
            <span>⌕ <span class="search-label">Search playbook</span></span><span class="search-shortcut">⌘ K</span>
          </button>
          <button class="icon-button" id="theme-toggle" aria-label="Toggle color theme">◐</button>
        </div>
      </header>`;
  }

  function renderSidebar() {
    const host = $('#site-sidebar');
    if (!host) return;
    const sections = NAV.map(section => `
      <div class="nav-section">
        <div class="nav-section-title">${section.title}</div>
        ${section.items.map(([id, label, path, secondary]) => `
          <a class="nav-link ${secondary ? 'secondary' : ''} ${id === pageId ? 'active' : ''}" href="${href(path)}" ${id === pageId ? 'aria-current="page"' : ''}>
            <span class="nav-dot"></span><span>${label}</span>
          </a>`).join('')}
      </div>`).join('');
    host.className = 'site-sidebar';
    host.innerHTML = `${sections}
      <div class="sidebar-progress">
        <div class="sidebar-progress-row"><span>Pages reviewed</span><span id="progress-count">0 / ${SEARCH_INDEX.length}</span></div>
        <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
      </div>`;
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    host.after(overlay);
  }

  function renderFooter() {
    const host = $('#site-footer');
    if (!host) return;
    host.className = 'site-footer';
    host.innerHTML = `<div class="footer-inner"><span>Personal Atlassian interview handbook · Static GitHub Pages site</span><span>Candidate reports are labelled; practice reconstructions are not presented as verified prompts.</span></div>`;
  }

  function renderSearch() {
    const dialog = document.createElement('dialog');
    dialog.className = 'search-dialog';
    dialog.id = 'search-dialog';
    dialog.innerHTML = `
      <div class="search-header">
        <span aria-hidden="true">⌕</span>
        <input class="search-input" id="search-input" type="search" autocomplete="off" placeholder="Search questions, concepts or follow-ups…" aria-label="Search playbook">
        <button class="search-close" id="search-close" aria-label="Close search">Esc</button>
      </div>
      <div class="search-results" id="search-results"></div>`;
    document.body.append(dialog);
    const input = $('#search-input');
    const results = $('#search-results');

    const renderResults = query => {
      const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const matched = SEARCH_INDEX.map(item => {
        const haystack = item.join(' ').toLowerCase();
        const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
        return { item, score };
      }).filter(({score}) => !terms.length || score > 0).sort((a,b) => b.score - a.score).slice(0, 12);
      results.innerHTML = matched.length ? matched.map(({item}) => `
        <a class="search-result" href="${href(item[3])}">
          <div class="search-result-section">${item[1]}</div>
          <div class="search-result-title">${item[0]}</div>
          <div class="search-result-desc">${item[2]}</div>
        </a>`).join('') : '<div class="search-empty">No matching page. Try “ownership”, “feedback”, “customer”, “permissions” or “tagging”.</div>';
    };
    renderResults('');
    input.addEventListener('input', () => renderResults(input.value));
    $('#search-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }

  function bindNavigation() {
    const menu = $('#menu-button');
    const overlay = $('#sidebar-overlay');
    const close = () => { body.classList.remove('nav-open'); menu?.setAttribute('aria-expanded', 'false'); };
    menu?.addEventListener('click', () => {
      const open = body.classList.toggle('nav-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    overlay?.addEventListener('click', close);
    $$('.nav-link').forEach(link => link.addEventListener('click', close));
  }

  function bindTheme() {
    const toggle = $('#theme-toggle');
    const preferred = storageGet('playbook-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = preferred;
    toggle?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      storageSet('playbook-theme', next);
      showToast(`${next === 'dark' ? 'Dark' : 'Light'} theme enabled`);
    });
  }

  function bindSearch() {
    const dialog = $('#search-dialog');
    const input = $('#search-input');
    const open = () => { dialog.showModal(); setTimeout(() => input.focus(), 20); };
    $('#search-open')?.addEventListener('click', open);
    document.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); }
      if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); open(); }
      if (event.key === 'Escape' && dialog.open) dialog.close();
    });
  }

  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  function generateToc() {
    const article = $('.article-content');
    const desktop = $('#page-toc');
    const mobile = $('#mobile-toc-list');
    if (!article || (!desktop && !mobile)) return;
    const headings = $$('h2, h3', article).filter(h => !h.closest('[data-no-toc]'));
    if (!headings.length) return;
    const used = new Map();
    headings.forEach(h => {
      let id = h.id || slugify(h.textContent);
      const count = used.get(id) || 0;
      used.set(id, count + 1);
      if (count) id = `${id}-${count + 1}`;
      h.id = id;
    });
    const html = `<ul class="toc-list">${headings.map(h => `<li class="toc-${h.tagName.toLowerCase()}"><a href="#${h.id}">${h.textContent}</a></li>`).join('')}</ul>`;
    if (desktop) desktop.innerHTML = html;
    if (mobile) mobile.innerHTML = html;

    const links = $$('.toc-list a');
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach(link => link.classList.toggle('current', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-12% 0px -75% 0px', threshold: [0,1] });
    headings.forEach(h => observer.observe(h));
  }

  function bindProgressBar() {
    const bar = $('#reading-progress');
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const pct = max > 0 ? (scrollY / max) * 100 : 0;
      bar.style.width = `${Math.min(100, pct)}%`;
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }

  const REVIEW_KEY = 'atlassian-playbook-reviewed-v1';
  function getReviewed() { try { return JSON.parse(storageGet(REVIEW_KEY) || '[]'); } catch { return []; } }
  function setReviewed(list) { storageSet(REVIEW_KEY, JSON.stringify([...new Set(list)])); }
  function updateReviewUI() {
    const reviewed = getReviewed();
    const total = SEARCH_INDEX.length;
    const count = $('#progress-count');
    const fill = $('#progress-fill');
    if (count) count.textContent = `${reviewed.length} / ${total}`;
    if (fill) fill.style.width = `${Math.min(100, (reviewed.length / total) * 100)}%`;
    const button = $('#review-page');
    if (button) {
      const done = reviewed.includes(pageId);
      button.classList.toggle('reviewed', done);
      button.textContent = done ? '✓ Reviewed' : 'Mark as reviewed';
      button.setAttribute('aria-pressed', String(done));
    }
    $$('[data-progress-percent]').forEach(el => el.textContent = `${Math.round((reviewed.length / total) * 100)}%`);
  }
  function bindReview() {
    $('#review-page')?.addEventListener('click', () => {
      const reviewed = getReviewed();
      const next = reviewed.includes(pageId) ? reviewed.filter(id => id !== pageId) : [...reviewed, pageId];
      setReviewed(next); updateReviewUI(); showToast(next.includes(pageId) ? `${pageTitle} marked reviewed` : 'Review status removed');
    });
    updateReviewUI();
  }

  function showToast(message) {
    let toast = $('#toast');
    if (!toast) { toast = document.createElement('div'); toast.id = 'toast'; toast.className = 'toast'; document.body.append(toast); }
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function bindCopy() {
    // Mermaid reads the text content of <pre class="mermaid"> as diagram source.
    // Adding the code-copy toolbar inside those elements corrupts the source and
    // makes every diagram fail with "Syntax error in text". Keep diagram
    // containers untouched and add copy controls only to actual code blocks.
    $$('pre:not(.mermaid)').forEach(pre => {
      if (pre.querySelector('.code-toolbar')) return;
      const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
      const button = document.createElement('button'); button.className = 'copy-button'; button.textContent = 'Copy';
      button.addEventListener('click', async () => {
        const copied = await copyText(pre.querySelector('code')?.innerText || pre.innerText);
        button.textContent = copied ? 'Copied' : 'Select text';
        showToast(copied ? 'Code copied' : 'Clipboard unavailable');
        setTimeout(() => button.textContent = 'Copy', 1400);
      });
      toolbar.append(button); pre.append(toolbar);
    });
    $$('.prompt-card').forEach(card => {
      if (card.querySelector('.prompt-copy')) return;
      const button = document.createElement('button'); button.className = 'prompt-copy'; button.setAttribute('aria-label','Copy prompt'); button.textContent = '⧉';
      button.addEventListener('click', async () => {
        const copied = await copyText(card.querySelector('.prompt-text')?.innerText || card.innerText);
        showToast(copied ? 'Prompt copied' : 'Clipboard unavailable');
      });
      card.append(button);
    });
  }

  function bindDetails() {
    $$('[data-details-actions]').forEach(host => {
      const scope = host.closest('section') || document;
      const expand = host.querySelector('[data-expand]');
      const collapse = host.querySelector('[data-collapse]');
      expand?.addEventListener('click', () => $$('details', scope).forEach(item => item.open = true));
      collapse?.addEventListener('click', () => $$('details', scope).forEach(item => item.open = false));
    });
  }

  function bindTabs() {
    $$('.tabs').forEach(tabs => {
      const buttons = $$('.tab-button', tabs);
      const panels = $$('.tab-panel', tabs);
      buttons.forEach(button => button.addEventListener('click', () => {
        buttons.forEach(item => item.setAttribute('aria-selected', String(item === button)));
        panels.forEach(panel => panel.hidden = panel.id !== button.getAttribute('aria-controls'));
      }));
    });
  }

  function bindCountdown() {
    const el = $('[data-countdown]');
    if (!el) return;
    const target = new Date(el.dataset.countdown);
    const render = () => {
      const delta = target - new Date();
      if (delta <= 0) { el.textContent = 'Interview day'; return; }
      const days = Math.floor(delta / 86400000);
      const hours = Math.floor((delta % 86400000) / 3600000);
      el.textContent = `${days} days · ${hours} hours`;
    };
    render(); setInterval(render, 60000);
  }


  function bindQuestionDecks() {
    $$('[data-question-deck]').forEach(deck => {
      const button = $('[data-draw-question]', deck);
      const output = $('[data-drawn-question]', deck);
      const items = $$('[data-question-item]', deck);
      if (!button || !output || !items.length) return;
      let previous = -1;
      button.addEventListener('click', () => {
        let index = Math.floor(Math.random() * items.length);
        if (items.length > 1 && index === previous) index = (index + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length;
        previous = index;
        const item = items[index];
        output.replaceChildren();
        if (item.dataset.value) {
          const chip = document.createElement('span');
          chip.className = 'source-chip official';
          chip.textContent = item.dataset.value;
          output.append(chip);
        }
        const question = document.createElement('strong');
        question.textContent = item.textContent.trim();
        output.append(question);
        output.classList.add('question-revealed');
      });
    });
  }

  function bindTimers() {
    $$('[data-question-deck]').forEach(deck => {
      const display = $('[data-timer-display]', deck);
      const buttons = $$('[data-timer-seconds]', deck);
      if (!display || !buttons.length) return;
      let timer = null;
      let remaining = Number(buttons[0].dataset.timerSeconds || 90);
      const render = () => {
        const minutes = Math.floor(Math.max(0, remaining) / 60);
        const seconds = Math.max(0, remaining) % 60;
        display.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        display.classList.toggle('timer-finished', remaining <= 0);
      };
      buttons.forEach(button => {
        button.dataset.originalText = button.textContent;
        button.addEventListener('click', () => {
          clearInterval(timer);
          buttons.forEach(item => item.textContent = item.dataset.originalText);
          remaining = Number(button.dataset.timerSeconds || 90);
          render();
          button.textContent = 'Reset timer';
          timer = setInterval(() => {
            remaining -= 1;
            render();
            if (remaining <= 0) {
              clearInterval(timer);
              timer = null;
              button.textContent = button.dataset.originalText;
              showToast('Time');
            }
          }, 1000);
        });
      });
      render();
    });
  }

  function bindPersistentNotes() {
    const fields = $$('[data-persist]');
    if (!fields.length) return;
    const status = $('[data-intake-status]');
    const warning = $('[data-storage-warning]');
    if (warning) warning.hidden = persistentStorageAvailable;

    const setStatus = (message, isWarning = false) => {
      if (!status) return;
      status.textContent = message;
      status.style.color = isWarning ? 'var(--warning)' : 'var(--success)';
      clearTimeout(status.timer);
      status.timer = setTimeout(() => {
        status.textContent = persistentStorageAvailable ? 'Persistent autosave active' : 'Temporary session only — export before leaving';
        status.style.color = persistentStorageAvailable ? 'var(--success)' : 'var(--warning)';
      }, 1800);
    };

    const fieldKey = field => `playbook-note-${field.id || field.name}`;
    fields.forEach(field => {
      field.value = storageGet(fieldKey(field)) || '';
      field.addEventListener('input', () => {
        const persisted = storageSet(fieldKey(field), field.value);
        setStatus(persisted ? 'Saved to this browser' : 'Saved only for this open session', !persisted);
      });
    });
    setStatus(persistentStorageAvailable ? 'Persistent autosave active' : 'Temporary session only — export before leaving', !persistentStorageAvailable);

    const collect = () => {
      const lines = ['ATLASSIAN INTERVIEW PRACTICE NOTES', `Exported: ${new Date().toISOString()}`, ''];
      const values = {};
      $$('[data-intake-section]').forEach(section => {
        const heading = $('h2', section)?.textContent.trim();
        if (heading) lines.push(heading.toUpperCase());
        $$('.intake-field', section).forEach(label => {
          const prompt = $('span', label)?.textContent.trim() || 'Field';
          const field = $('[data-persist]', label);
          const value = field?.value.trim() || '[Not completed]';
          if (field) values[field.id || field.name] = field.value;
          lines.push(`${prompt}:
${value}
`);
        });
      });
      return { text: lines.join('\n'), values };
    };

    $('[data-copy-intake]')?.addEventListener('click', async () => {
      const { text } = collect();
      const copied = await copyText(text);
      setStatus(copied ? 'Copied successfully' : 'Copy failed — use Download TXT', !copied);
      showToast(copied ? 'Practice notes copied' : 'Clipboard unavailable; download instead');
    });

    $('[data-download-intake]')?.addEventListener('click', () => {
      const { text } = collect();
      downloadText(`atlassian-practice-notes-${new Date().toISOString().slice(0,10)}.txt`, text);
      setStatus('TXT backup downloaded');
      showToast('TXT backup downloaded');
    });

    $('[data-export-intake-json]')?.addEventListener('click', () => {
      const { values } = collect();
      const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), fields: values }, null, 2);
      downloadText(`atlassian-practice-notes-${new Date().toISOString().slice(0,10)}.json`, payload, 'application/json;charset=utf-8');
      setStatus('JSON backup exported');
      showToast('JSON backup exported');
    });

    const fileInput = $('[data-import-intake-file]');
    $('[data-import-intake]')?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        const imported = parsed.fields && typeof parsed.fields === 'object' ? parsed.fields : parsed;
        let count = 0;
        fields.forEach(field => {
          const id = field.id || field.name;
          if (Object.prototype.hasOwnProperty.call(imported, id)) {
            field.value = String(imported[id] ?? '');
            storageSet(fieldKey(field), field.value);
            count += 1;
          }
        });
        setStatus(`Imported ${count} fields`);
        showToast(`Imported ${count} fields`);
      } catch {
        setStatus('Import failed — select a valid exported JSON file', true);
        showToast('Invalid JSON backup');
      } finally {
        fileInput.value = '';
      }
    });

    $('[data-clear-intake]')?.addEventListener('click', () => {
      if (!confirm('Clear every practice-note field on this device? Download a backup first if you need one.')) return;
      fields.forEach(field => {
        storageRemove(fieldKey(field));
        field.value = '';
      });
      setStatus('Practice notes cleared');
      showToast('Practice notes cleared');
    });
  }

  function renderSyntaxHighlighting() {
    if (window.Prism) window.Prism.highlightAll();
  }

  async function renderMermaid() {
    if (!window.mermaid || !$$('.mermaid').length) return;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        themeVariables: {
          primaryColor: '#e8f1ff',
          primaryTextColor: '#172033',
          primaryBorderColor: '#5b7cfa',
          secondaryColor: '#eefbf6',
          secondaryTextColor: '#172033',
          secondaryBorderColor: '#38a169',
          tertiaryColor: '#fff6df',
          tertiaryTextColor: '#172033',
          tertiaryBorderColor: '#d69e2e',
          lineColor: '#64748b',
          textColor: '#172033',
          mainBkg: '#e8f1ff',
          nodeBorder: '#5b7cfa',
          clusterBkg: '#f5f7ff',
          clusterBorder: '#a7b5dd',
          edgeLabelBackground: '#ffffff',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
        },
        flowchart: { curve: 'basis', htmlLabels: true, padding: 16, useMaxWidth: false },
        sequence: { useMaxWidth: false, mirrorActors: false }
      });
      await window.mermaid.run({ querySelector: '.mermaid' });
      $$('.mermaid').forEach((el) => {
        const svg = el.querySelector('svg');
        if (!svg) return;
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.width = 'max-content';
        svg.style.minWidth = '720px';
        svg.style.maxWidth = 'none';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
        el.scrollLeft = 0;
      });
    } catch (error) {
      console.warn('Mermaid rendering failed:', error);
    }
  }

  function initialize() {
    renderHeader(); renderSidebar(); renderFooter(); renderSearch();
    bindNavigation(); bindTheme(); bindSearch(); bindProgressBar(); bindReview();
    generateToc(); renderSyntaxHighlighting(); bindCopy(); bindDetails(); bindTabs(); bindCountdown();
    bindQuestionDecks(); bindTimers(); bindPersistentNotes(); renderMermaid();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
