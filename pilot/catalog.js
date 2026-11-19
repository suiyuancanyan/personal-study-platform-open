(() => {
  const { units, chapters } = JSON.parse(document.querySelector('#catalog-data').textContent);
  const form = document.querySelector('.catalog-search');
  const input = form.querySelector('input');
  const resume = document.querySelector('[data-resume]');
  const review = document.querySelector('[data-review]');
  const grid = document.querySelector('.catalog-grid');
  const courseHeading = document.querySelector('.catalog-course-heading');
  const results = document.querySelector('.catalog-results');
  const count = results.querySelector('[data-result-count]');
  const list = results.querySelector('ul');
  const clear = results.querySelector('[data-clear-search]');
  const navigation = [...document.querySelectorAll('.catalog-sidebar nav a')];
  const chapterLists = [...document.querySelectorAll('.catalog-card details, [data-review]')];
  const positionKey = 'personal-study-catalog-position';
  let directoryScroll = 0;
  let searching = false;
  const fold = value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  const searchable = units.map(unit => ({
    unit, title: fold(unit.title), keywords: fold(unit.keywords), body: fold(unit.passages.join(' ')),
    chapter: fold(`${unit.course} ${unit.topic}`),
  }));

  function showResume() {
    resume.hidden = true;
    try {
      const id = localStorage.getItem('personal-study-last-unit');
      const unit = units.find(item => item.id === id);
      if (!unit) return;
      const saved = JSON.parse(localStorage.getItem(`personal-study-${unit.chapter}-curriculum-v1`));
      const recordedLab = JSON.parse(localStorage.getItem('personal-study-last-lab'));
      const lab = recordedLab?.unit === id && /^[a-z][\w-]*$/.test(recordedLab.id) ? recordedLab : null;
      const lastPlace = unit.id === 'pn-junction-5' && localStorage.getItem('personal-study-pn-model-place-v1');
      const position = saved?.guidedProgress?.[unit.id];
      let step = position?.index;
      let total = position?.total;
      if (unit.mergesPractice && !position?.mergedPractice && Number.isInteger(total) && total >= 4) {
        const practiceStart = total - 4;
        if (step >= practiceStart) step = step === total - 1 ? practiceStart + 1 : practiceStart;
        total -= 2;
      }
      const isDiodePlace = !Number.isInteger(step) && lastPlace && /^pn-model-(lab|explanation|check|task-[123])$/.test(lastPlace);
      const reviewing = saved?.recapUnit === unit.id;
      resume.href = `${unit.path}#${lab?.id ?? (reviewing ? `recap-${unit.id}` : isDiodePlace ? lastPlace : unit.id)}`;
      resume.querySelector('[data-resume-label]').textContent = lab ? '返回实验' : '继续学习';
      resume.querySelector('[data-resume-title]').textContent = unit.title;
      resume.querySelector('[data-resume-context]').textContent = `${unit.course} · ${unit.number} ${unit.topic}`;
      const chapterUnits = units.filter(item => item.chapter === unit.chapter);
      const finished = new Set(Array.isArray(saved?.completed) ? saved.completed : []);
      const done = chapterUnits.filter(item => finished.has(item.id)).length;
      resume.querySelector('[data-resume-progress]').textContent = lab ? lab.title : reviewing
        ? (chapterUnits.at(-1).id === unit.id ? '本章回顾' : '本节回顾')
        : Number.isInteger(step)
        ? (Number.isInteger(total) ? `第 ${step + 1} 步 / 共 ${total} 步` : `第 ${step + 1} 步`)
        : `本章已学 ${done}/${chapterUnits.length} 节`;
      resume.hidden = Boolean(input.value.trim());
    } catch { /* Course links still work if browser storage is unavailable. */ }
  }

  function showReview() {
    const items = [];
    let total = 0;
    for (const { chapter, path, course, title, questions } of chapters) {
      let answers;
      try { answers = JSON.parse(localStorage.getItem(`personal-study-${chapter}-curriculum-v1`))?.answers; }
      catch { continue; }
      const wrong = questions.filter(id => answers?.[id] === 'wrong').length;
      if (!wrong) continue;
      total += wrong;
      const item = document.createElement('li');
      const link = document.createElement('a');
      const label = document.createElement('span');
      const number = document.createElement('span');
      link.href = `${path}#wrong-questions`;
      label.textContent = `${course} · ${title}`;
      number.textContent = `${wrong} 道`;
      link.append(label, number);
      item.append(link);
      items.push(item);
    }
    review.hidden = !total;
    review.querySelector('[data-review-count]').textContent = `${total} 道待复习`;
    review.querySelector('ul').replaceChildren(...items);
  }

  function renderSearch() {
    const query = input.value.trim();
    if (query && !searching) directoryScroll = window.scrollY;
    const restore = !query && searching;
    searching = Boolean(query);
    results.hidden = !query;
    grid.hidden = Boolean(query);
    courseHeading.hidden = Boolean(query);
    if (!query) {
      showResume();
      showReview();
      if (restore) window.scrollTo(0, directoryScroll);
      updateCourse();
      return;
    }
    resume.hidden = true;
    review.hidden = true;
    const words = query.split(/\s+/).map(fold);
    const matches = searchable.flatMap(item => {
      const scores = words.map(word => {
        if (item.title.includes(word)) return 6;
        if (item.keywords.includes(word)) return 4;
        if (item.body.includes(word)) return 2;
        return item.chapter.includes(word) ? 1 : 0;
      });
      if (scores.includes(0)) return [];
      const score = scores.reduce((total, value) => total + value, 0) + (item.title.includes(fold(query)) ? 4 : 0);
      return [{ unit: item.unit, score }];
    }).sort((a, b) => b.score - a.score);
    count.textContent = matches.length ? `找到 ${matches.length} 个小节` : `未找到与「${query}」匹配的小节。`;
    list.replaceChildren(...matches.map(({ unit }) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const name = document.createElement('strong');
      const context = document.createElement('span');
      link.href = `${unit.path}?start=${encodeURIComponent(unit.id)}#${unit.id}`;
      name.textContent = unit.title;
      context.textContent = `${unit.course} · ${unit.topic}${words.every(word => fold(unit.title).includes(word)) ? '' : ` · 匹配「${query}」`}`;
      link.append(name, context);
      item.append(link);
      return item;
    }));
    updateCourse();
  }

  function updateCourse() {
    const active = searching ? null : navigation.find(link => link.hash === location.hash)
      ?? navigation.findLast(link => document.querySelector(link.hash).getBoundingClientRect().top <= 85);
    for (const link of navigation) {
      if (link === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  function clearSearch() {
    input.value = '';
    renderSearch();
    input.focus({ preventScroll: true });
  }

  input.addEventListener('input', renderSearch);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && input.value) {
      event.preventDefault();
      clearSearch();
    }
  });
  clear.addEventListener('click', clearSearch);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!results.hidden && list.firstElementChild) list.firstElementChild.querySelector('a').click();
  });
  for (const link of navigation) {
    link.addEventListener('click', () => {
      if (!input.value) return;
      input.value = '';
      renderSearch();
    });
  }
  window.addEventListener('scroll', updateCourse, { passive: true });
  window.addEventListener('hashchange', updateCourse);
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(positionKey, JSON.stringify({ query: input.value, y: window.scrollY, directoryScroll, lists: chapterLists.map(list => list.open) })); }
    catch { /* The catalogue is still usable without browser storage. */ }
  });
  window.addEventListener('pageshow', () => {
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(positionKey)); } catch { /* No saved catalogue position. */ }
    if (Array.isArray(saved?.lists)) chapterLists.forEach((list, index) => { list.open = Boolean(saved.lists[index]); });
    if (saved && !location.hash) input.value = saved.query;
    renderSearch();
    if (saved && !location.hash) {
      directoryScroll = saved.directoryScroll;
      requestAnimationFrame(() => window.scrollTo(0, saved.y));
    }
  });
  form.hidden = false;
  renderSearch();
})();
