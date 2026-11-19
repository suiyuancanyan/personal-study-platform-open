(() => {
  const root = document.querySelector('#curriculum');
  if (!root) return;
  const chapter = root.dataset.chapter;
  const key = `personal-study-${chapter}-curriculum-v1`;
  const bank = document.querySelector('#question-bank');
  const figureIndex = document.querySelector('#figure-directory');
  const figureLink = document.querySelector('.outline-tools a[href="#figure-directory"]');
  const curated = bank.hasAttribute('data-curated');
  const sections = [...root.querySelectorAll('[data-unit]')];
  const outline = document.querySelector('.outline-disclosure');
  const tabs = [...outline.querySelectorAll('[data-unit-select]')];
  const groups = [...bank.querySelectorAll('[data-bank-unit]')];
  const filters = [...bank.querySelectorAll('[data-filter]')];
  const progress = document.querySelector('#unit-progress');
  const progressBar = document.querySelector('#chapter-progress');
  const compactOutline = window.matchMedia('(width < 1024px)');
  const start = new URL(location.href).searchParams.get('start');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key)) ?? {}; } catch { /* The lesson remains available. */ }
  const completed = new Set(saved.completed ?? []);
  const answers = saved.answers ?? {};
  const solutions = saved.solutions ?? {};
  const guidedProgress = saved.guidedProgress ?? {};
  const unitNotes = saved.unitNotes ?? {};
  const guidedLessons = new Map();
  const note = document.querySelector('[data-unit-note]');
  const noteLabel = document.querySelector('[data-note-label]');
  const noteStatus = document.querySelector('[data-note-status]');
  const noteDirectory = document.querySelector('[data-unit-notes]');
  const bankLink = document.querySelector('.study-nav [data-current-jump]');
  const notesBack = document.querySelector('[data-note-return]');
  const outlinePosition = outline.querySelector('[data-outline-position]');
  const figureQuestions = new Map([...figureIndex?.querySelectorAll('a[data-experiment-link]') ?? []]
    .filter(link => link.hash.startsWith('#question-')).map(link => [link.hash.slice(1), link]));
  const questionViews = new Map();
  let current;
  let lastReading = saved.lastReading ?? saved.current;
  let recapUnit = saved.recapUnit;
  let filter = filters.some(button => button.dataset.filter === saved.bankFilter) ? saved.bankFilter : curated ? 'all' : 'current';
  let readingScroll = 0;
  let bankScroll = 0;
  let readingHash = '';
  let readingOpener;
  let notePlace;
  let figurePlace;
  let bankUndo;
  const notice = bank.querySelector('.bank-notice');
  let linkedQuestion;

  function highlightQuestion(question) {
    linkedQuestion?.removeAttribute('data-linked');
    if (linkedQuestion) linkedQuestion.querySelector('[data-question-context]').hidden = true;
    linkedQuestion = question;
    if (question) {
      question.setAttribute('data-linked', '');
      const context = question.querySelector('[data-question-context]');
      const unit = sectionFor(questionUnit());
      context.querySelector('[data-question-unit]').textContent = unit ? `所属小节：${unit.dataset.title}` : '本章综合题';
      context.hidden = false;
      setReturnLink();
    }
    renderOutline();
  }

  const sectionFor = id => sections.find(section => section.id === id);
  const questionUnit = () => linkedQuestion?.closest('[data-bank-unit]')?.dataset.bankUnit;
  const browseUnit = () => linkedQuestion ? questionUnit() : current;

  function renderOutline() {
    for (const tab of tabs) tab.setAttribute('aria-pressed', tab.dataset.unitSelect === browseUnit());
    const previous = tabs.findIndex(tab => tab.dataset.unitSelect === lastReading);
    outlinePosition.hidden = !linkedQuestion || previous < 0 || lastReading === questionUnit();
    outlinePosition.textContent = outlinePosition.hidden ? '' : `上次学到第 ${previous + 1} 节 · ${sectionFor(lastReading).dataset.title}`;
    showCurrentTab();
  }

  function setReturnLink() {
    const links = [bankLink, bank.querySelector('.curriculum-header [data-return-reading]')];
    if (linkedQuestion) links.push(linkedQuestion.querySelector('[data-return-reading]'));
    for (const link of links) {
      link.href = readingHash || `#${current}`;
      link.textContent = readingHash === '#figure-directory' ? '返回图文例题' : '回到本节';
    }
  }

  function showView(showBank) {
    if (showBank === !bank.hidden) return;
    if (showBank) readingScroll = window.scrollY;
    else bankScroll = window.scrollY;
    bank.hidden = !showBank;
    if (!showBank) highlightQuestion(null);
    document.body.classList.toggle('view-bank', showBank);
    bankLink.toggleAttribute('data-return-reading', showBank);
    bankLink.href = showBank ? '#curriculum' : '#question-bank';
    bankLink.textContent = showBank ? '回到本节' : '题库';
    if (showBank) setReturnLink();
    window.scrollTo(0, showBank ? bankScroll : readingScroll);
    window.dispatchEvent(new Event('study-view-changed'));
  }

  function showFigures(show) {
    if (!figureIndex || show === !figureIndex.hidden) return;
    figureIndex.hidden = !show;
    document.body.classList.toggle('view-figures', show);
    if (show) figureLink?.setAttribute('aria-current', 'location');
    else figureLink?.removeAttribute('aria-current');
    window.dispatchEvent(new Event('study-view-changed'));
  }

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify({
        current, lastReading, completed: [...completed], answers, solutions, guidedProgress, unitNotes, recapUnit, bankFilter: filter,
      }));
      return true;
    } catch {
      progress.textContent = '浏览器无法保存学习进度。';
      return false;
    }
  }

  function rememberReading(lab) {
    if (!lab) lastReading = current;
    save();
    try {
      localStorage.setItem('personal-study-last-unit', current);
      if (lab) {
        localStorage.setItem('personal-study-last-lab', JSON.stringify({
          unit: current, id: lab.id, title: lab.getAttribute('aria-label') ?? lab.querySelector('h3')?.textContent,
        }));
      } else localStorage.removeItem('personal-study-last-lab');
    } catch { /* Resume remains unavailable. */ }
  }

  function rememberExperiment(event) {
    const lab = event.target.closest('#experiment, [data-unit-lab], #pn-model-lab');
    if (lab?.id && lab.getClientRects().length && lab.closest('[data-unit]')?.id === current) rememberReading(lab);
  }
  root.addEventListener('input', event => {
    if (event.target.matches('input[type="range"], #pnml-own-words')) rememberExperiment(event);
  });
  root.addEventListener('click', event => {
    if (event.target.closest('[data-lab-preset], #advance, #reset-lab, [data-choice], [data-play], [data-reset], [data-source], #pnml-submit')) rememberExperiment(event);
  });

  function renderNotes() {
    const linked = sections.filter(section => unitNotes[section.dataset.unit]?.trim());
    noteDirectory.hidden = !linked.length;
    noteDirectory.querySelector('ul').replaceChildren(...linked.map(section => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const body = document.createElement('p');
      link.href = `#${section.id}`;
      link.setAttribute('data-experiment-link', '');
      link.textContent = section.dataset.title;
      body.textContent = unitNotes[section.id];
      item.append(link, body);
      return item;
    }));
  }

  note.addEventListener('input', () => {
    if (note.value.trim()) unitNotes[current] = note.value;
    else delete unitNotes[current];
    const message = save() ? '已保存到此浏览器' : '当前浏览器无法保存笔记';
    if (noteStatus.textContent !== message) noteStatus.textContent = message;
    renderNotes();
    if (!notePlace?.inBank && current !== lastReading) rememberReading();
  });

  for (const unit of sections) {
    const guide = unit.querySelector('[data-guided-lesson]');
    if (!guide) continue;
    const steps = [...guide.querySelectorAll('[data-guided-step]')];
    const unitId = unit.dataset.unit;
    const recorded = guidedProgress[unitId];
    const previous = guide.querySelector('[data-guided-back]');
    const next = guide.querySelector('[data-guided-next]');
    const finish = guide.querySelectorAll('.guided-actions > [data-practice], .guided-actions > [data-complete]');
    const stepCounter = guide.querySelector('[data-guided-progress]');
    const meter = guide.querySelector('[data-guided-meter]');
    const responses = Array.isArray(recorded?.responses) ? recorded.responses : [];
    let index = Number.isInteger(recorded?.index) ? Math.max(0, Math.min(recorded.index, steps.length - 1)) : 0;
    const mergedAt = steps.findIndex(step => step.hasAttribute('data-merged-practice'));
    const position = () => ({ index, responses, total: steps.length, ...(mergedAt >= 0 && { mergedPractice: true }) });
    if (mergedAt >= 0 && recorded?.total === steps.length + 2 && recorded.index >= mergedAt) {
      index = recorded.index >= mergedAt + 3 ? mergedAt + 1 : mergedAt;
    }
    let stepAnimation;

    function showStep(nextIndex, focus = false) {
      const direction = Math.sign(nextIndex - index);
      index = nextIndex;
      const last = index === steps.length - 1;
      for (const [stepIndex, step] of steps.entries()) step.hidden = stepIndex !== index;
      previous.disabled = index === 0;
      next.hidden = last;
      for (const button of finish) button.hidden = !last;
      stepCounter.textContent = `第 ${index + 1} 步 / 共 ${steps.length} 步`;
      meter.value = index + 1;
      meter.parentElement.style.setProperty('--step-progress', (index + 1) / steps.length);
      stepAnimation?.cancel();
      if (focus && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        stepAnimation = steps[index].animate([{ opacity: 0, translate: `${direction * 18}px 0` }, { opacity: 1, translate: '0 0' }],
          { duration: 300, easing: 'cubic-bezier(.22, .72, .24, 1)' });
      }
      if (focus) {
        const heading = steps[index].querySelector('h3');
        heading.focus({ preventScroll: true });
        guide.scrollIntoView({ block: 'start' });
      }
      if (current === unitId) window.dispatchEvent(new Event('study-step-changed'));
    }

    function savePosition(remember = true) {
      guidedProgress[unitId] = position();
      if (remember && recapUnit === unitId) recapUnit = undefined;
      if (remember) rememberReading();
      else save();
    }

    for (const [stepIndex, step] of steps.entries()) {
      const choices = [...step.querySelectorAll('[data-guided-answer]')];
      const feedback = step.querySelector('[data-guided-feedback]');
      if (!feedback) continue;
      function showAnswer(choiceIndex) {
        for (const [i, choice] of choices.entries()) choice.setAttribute('aria-pressed', i === choiceIndex);
        const answer = choices[choiceIndex]?.nextElementSibling;
        feedback.replaceChildren(...Array.from(answer?.childNodes ?? [], node => node.cloneNode(true)));
      }
      showAnswer(responses[stepIndex]);
      for (const [choiceIndex, choice] of choices.entries()) {
        choice.addEventListener('click', () => {
          responses[stepIndex] = choiceIndex;
          showAnswer(choiceIndex);
          savePosition();
        });
      }
    }

    function navigate(delta) {
      const destination = index + delta;
      if (destination < 0 || destination >= steps.length) return;
      const linked = document.getElementById(location.hash.slice(1));
      if (linked?.closest('[data-guided-lesson]') === guide) {
        history.replaceState(null, '', `#${unitId}`);
      }
      showStep(destination, true);
      savePosition();
    }
    previous.addEventListener('click', event => { if (event.detail <= 1) navigate(-1); });
    next.addEventListener('click', event => { if (event.detail <= 1) navigate(1); });
    if (start === unitId) index = 0;
    showStep(index);
    guidedProgress[unitId] = position();
    guidedLessons.set(guide, target => {
      const destination = steps.indexOf(target.closest('[data-guided-step]'));
      if (destination < 0 || destination === index) return;
      showStep(destination);
      savePosition(false);
    });
  }

  function renderBank() {
    const shown = [];
    const selectedGroup = filter === 'current' ? current : filter === 'review' ? 'review' : null;
    for (const group of groups) {
      const items = [...group.querySelectorAll('[data-question]')];
      const visible = items.filter(item => {
        if (filter === 'wrong') return answers[item.dataset.question] === 'wrong';
        if (filter === 'illustrated') return item.hasAttribute('data-illustrated');
        if (filter === 'archive') return item.hasAttribute('data-archive-example');
        return true;
      });
      group.hidden = (selectedGroup !== null && group.dataset.bankUnit !== selectedGroup) || !visible.length;
      const extra = group.querySelector('[data-pn-bank-extra]');
      if (extra) {
        extra.open = filter !== 'current';
        group.querySelector('[data-pn-bank-start]').hidden = filter !== 'current';
      }
      for (const item of items) item.hidden = !visible.includes(item);
      if (!group.hidden) shown.push(...visible);
    }
    for (const [index, item] of shown.entries()) {
      const link = item.querySelector('[data-next-question]');
      const next = shown[index + 1];
      link.hidden = !next;
      if (next) link.href = `#${next.id}`;
    }
    for (const button of filters) button.setAttribute('aria-pressed', button.dataset.filter === filter);
    const wrongCount = groups.flatMap(group => [...group.querySelectorAll('[data-question]')])
      .filter(item => answers[item.dataset.question] === 'wrong').length;
    bank.querySelector('#wrong-questions').textContent = wrongCount ? `错题 ${wrongCount}` : '错题';
    const empty = document.querySelector('#bank-empty');
    const practiceReview = bank.querySelector('[data-pn-practice-review]');
    if (practiceReview) practiceReview.hidden = filter !== 'wrong' || !practiceReview.querySelector('li');
    empty.hidden = shown.length > 0 || Boolean(practiceReview && !practiceReview.hidden);
    empty.querySelector('p').textContent = filter === 'wrong' ? '还没有加入错题的题目。' : filter === 'illustrated' ? '本章暂时没有读图练习。' : '这个范围内暂无习题。';
    empty.querySelector('button').hidden = filter !== 'wrong';
    for (const [id, link] of figureQuestions) {
      const answer = answers[document.getElementById(id).dataset.question];
      link.querySelector('[data-figure-practice-state]').textContent = answer === 'correct' ? '已掌握' : answer === 'wrong' ? '待复习' : '未练习';
    }
  }

  function select(id) {
    current = sections.some(section => section.dataset.unit === id) ? id : sections[0].dataset.unit;
    for (const section of sections) section.hidden = section.dataset.unit !== current;
    for (const tab of tabs) {
      const id = tab.dataset.unitSelect;
      tab.querySelector('[data-unit-done]').hidden = !completed.has(id);
    }
    renderOutline();
    progress.textContent = `已学 ${completed.size} / ${sections.length} 节`;
    progressBar.value = completed.size;
    const selected = sections.find(section => section.dataset.unit === current);
    noteLabel.textContent = selected.dataset.title;
    note.value = unitNotes[current] ?? '';
    noteStatus.textContent = note.value ? '已保存到此浏览器' : '';
    renderNotes();
    window.activeStudyUnit = selected.dataset.title;
    window.activeStudyUnitId = current;
    window.dispatchEvent(new Event('study-unit-changed'));
    renderBank();
    save();
  }

  function showRecap(unit, show) {
    const recap = unit.querySelector('.unit-recap');
    recap.hidden = !show;
    unit.classList.toggle('is-reviewing', show);
  }

  function showCurrentTab() {
    if (compactOutline.matches || !outline.open) return;
    const active = tabs.find(tab => tab.dataset.unitSelect === browseUnit());
    if (!active) return;
    const frame = outline.getBoundingClientRect();
    const top = frame.top + outline.querySelector('summary').offsetHeight + 5;
    const row = active.getBoundingClientRect();
    if (row.top < top) outline.scrollTop -= top - row.top;
    else if (row.bottom > frame.bottom - 5) outline.scrollTop += row.bottom - frame.bottom + 5;
  }

  const draftFields = new Map();
  function rememberGuidedPractice(item) {
    if (item?.closest('[data-guided-step]')) {
      if (recapUnit === current) recapUnit = undefined;
      rememberReading();
    }
  }

  for (const field of document.querySelectorAll('[data-question-draft]')) {
    const id = field.dataset.questionDraft;
    const draftKey = `personal-study-draft-${id}`;
    const siblings = draftFields.get(id) ?? [];
    siblings.push(field);
    draftFields.set(id, siblings);
    try { field.value = localStorage.getItem(draftKey) ?? ''; } catch { /* Drafting still works. */ }
    if (field.value) field.nextElementSibling.textContent = '草稿已保存';
    field.addEventListener('input', () => {
      for (const sibling of siblings) if (sibling !== field) sibling.value = field.value;
      let message = '草稿已保存';
      try {
        if (field.value) localStorage.setItem(draftKey, field.value);
        else localStorage.removeItem(draftKey);
      } catch { message = '当前浏览器无法保存草稿'; }
      for (const sibling of siblings) {
        const status = sibling.nextElementSibling;
        if (status.textContent !== message) status.textContent = message;
      }
      rememberGuidedPractice(field);
    });
  }

  notice.querySelector('button').addEventListener('click', () => bankUndo?.());
  bank.querySelector('[data-show-originals]').addEventListener('click', () => {
    applyBankFilter(filters.some(button => button.dataset.filter === 'archive') ? 'archive' : 'all');
    filters.find(button => button.dataset.filter === filter)?.focus();
  });

  for (const item of document.querySelectorAll('[data-question], [data-inline-question]')) {
    const id = item.dataset.question ?? item.dataset.inlineQuestion;
    const status = item.querySelector('.bank-status');
    const result = item.querySelector('.bank-result');
    const reveal = item.querySelector('[data-answer="reveal"]');
    const undo = item.querySelector('[data-bank-undo]');
    const steps = [...item.querySelectorAll('[data-bank-steps] > li')];
    const next = item.querySelector('[data-bank-next]');
    const all = item.querySelector('[data-bank-all]');
    const figures = item.querySelector('[data-bank-solution-figures]');
    let prior;
    let resultCount = 0;
    const views = questionViews.get(id) ?? [];
    views.push({ showSolution, showStatus, undo });
    questionViews.set(id, views);

    function showSolution(count) {
      resultCount = steps.length ? Math.max(0, Math.min(steps.length, count)) : count;
      count = resultCount;
      result.hidden = !count;
      reveal?.setAttribute('aria-expanded', String(Boolean(count)));
      if (reveal) reveal.textContent = count ? '收起解法' : '看解法';
      for (const [index, row] of steps.entries()) row.hidden = index >= count;
      if (next) next.disabled = count >= steps.length;
      if (all) all.disabled = count >= steps.length;
      if (figures) figures.hidden = !count || count < steps.length;
    }

    function showStatus() {
      const state = answers[id];
      status.textContent = state === 'correct' ? '已掌握' : state === 'wrong' ? '已加入错题 · 待复习' : '';
    }
    showStatus();
    if (steps.length && Number.isInteger(solutions[id])) showSolution(solutions[id]);

    function revealSolution(count) {
      for (const view of views) view.showSolution(count);
      if (steps.length) {
        if (resultCount) solutions[id] = resultCount;
        else delete solutions[id];
        save();
      }
      rememberGuidedPractice(item);
    }

    function updateAnswerViews() {
      for (const view of views) {
        view.showStatus();
        view.undo.hidden = true;
      }
      save();
      renderBank();
    }
    next?.addEventListener('click', () => {
      revealSolution(resultCount + 1);
      if (next.disabled) focusLastStep();
    });
    all?.addEventListener('click', () => {
      revealSolution(steps.length);
      focusLastStep();
    });

    function focusLastStep() {
      steps.at(-1).tabIndex = -1;
      steps.at(-1).focus({ preventScroll: true });
    }

    function restoreAnswer() {
      if (prior === undefined) delete answers[id];
      else answers[id] = prior;
      notice.hidden = true;
      updateAnswerViews();
      (item.getClientRects().length ? item : filters.find(button => button.dataset.filter === filter)).focus({ preventScroll: true });
    }
    undo.addEventListener('click', restoreAnswer);
    for (const button of item.querySelectorAll('[data-answer]')) {
      button.addEventListener('click', () => {
        if (button === reveal) {
          revealSolution(resultCount ? 0 : 1);
          return;
        }
        if (!resultCount) revealSolution(1);
        if (answers[id] === button.dataset.answer) return;
        prior = answers[id];
        answers[id] = button.dataset.answer;
        rememberGuidedPractice(item);
        notice.hidden = true;
        updateAnswerViews();
        if (!bank.hidden && filter === 'wrong' && answers[id] === 'correct') {
          notice.hidden = false;
          notice.querySelector('span').textContent = '已移出错题';
          bankUndo = restoreAnswer;
          notice.querySelector('button').focus();
        } else undo.hidden = false;
      });
    }
    if (!steps.length) bank.addEventListener('study-review-wrong', () => showSolution(0));
  }

  function updateOutline() {
    outline.open = !compactOutline.matches;
    showCurrentTab();
  }
  function selectFromOutline(id) {
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    showView(false);
    showFigures(false);
    recapUnit = undefined;
    select(id);
    showRecap(document.getElementById(id), false);
    rememberReading();
  }
  updateOutline();
  compactOutline.addEventListener('change', updateOutline);
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      selectFromOutline(tab.dataset.unitSelect);
      if (compactOutline.matches) outline.open = false;
      const heading = document.getElementById(current).querySelector('h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    });
  }

  document.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const notesJump = event.target.closest('[data-notes-jump]');
    if (notesJump || event.target.closest('[data-note-return]')) {
      event.preventDefault();
      if (notesJump) {
        if (location.hash !== '#study-notes') {
          notePlace = { hash: location.hash, state: history.state, scroll: window.scrollY, inBank: !bank.hidden, opener: notesJump };
          history.pushState(null, '', '#study-notes');
        }
        notesBack.textContent = notePlace?.inBank ? '回到题库' : '回到本节';
        openLinkedLesson();
        document.querySelector('#study-notes').focus({ preventScroll: true });
      } else {
        const unit = document.getElementById(current);
        history.pushState(notePlace?.state ?? null, '', notePlace?.hash || (notePlace?.inBank ? '#question-bank' : `#${current}`));
        openLinkedLesson();
        if (notePlace) window.scrollTo(0, notePlace.scroll);
        else unit.scrollIntoView({ block: 'start' });
        (notePlace?.opener ?? unit).focus({ preventScroll: true });
        notePlace = undefined;
      }
      return;
    }
    const back = event.target.closest('[data-return-reading]');
    if (back) {
      event.preventDefault();
      const question = linkedQuestion;
      const hash = readingHash || `#${current}`;
      const hasOrigin = Boolean(history.state?.studyReading);
      history.pushState(null, '', hash);
      const scroll = readingScroll;
      openLinkedLesson();
      if (hasOrigin) window.scrollTo(0, scroll);
      const opener = readingOpener?.getClientRects().length ? readingOpener : hash === '#figure-directory'
        ? figureQuestions.get(question?.id) ?? figureIndex : sectionFor(current);
      opener?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest('[data-figure-return]')) {
      event.preventDefault();
      const unit = document.getElementById(current);
      history.pushState(null, '', figurePlace?.hash || `#${current}`);
      showFigures(false);
      if (figurePlace) window.scrollTo(0, figurePlace.scroll);
      else unit.scrollIntoView({ block: 'start' });
      const opener = figurePlace?.opener;
      (opener?.getClientRects().length ? opener : unit).focus({ preventScroll: true });
      figurePlace = undefined;
      return;
    }
    const jump = event.target.closest('[data-review-jump], [data-current-jump]');
    if (jump) {
      event.preventDefault();
      if (!jump.hasAttribute('data-bank-toggle')) {
        applyBankFilter(curated ? 'all' : jump.hasAttribute('data-review-jump') ? 'review' : 'current');
      }
      enterBank(jump);
      return;
    }
    if (!event.target.closest('.lesson')) return;
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-worked-mode') || button.hasAttribute('data-worked-next')) {
      const example = button.closest('.worked-example');
      const mode = example.querySelector('[data-worked-mode]');
      const next = example.querySelector('[data-worked-next]');
      const rows = [...example.querySelectorAll('ol > li')];
      const counter = example.querySelector('[data-worked-count]');
      const progress = counter.parentElement;
      if (button === mode) {
        const trying = progress.hidden;
        progress.hidden = !trying;
        mode.textContent = trying ? '显示全部' : '自己试算';
        mode.setAttribute('aria-pressed', trying);
        for (const row of rows) row.hidden = trying;
      } else {
        const firstHidden = rows.find(row => row.hidden);
        if (firstHidden) firstHidden.hidden = false;
      }
      const shown = rows.filter(row => !row.hidden).length;
      const figures = example.querySelector('[data-worked-figures]');
      if (figures) figures.hidden = shown !== rows.length;
      counter.textContent = `已展开 ${shown} / ${rows.length} 步`;
      next.disabled = shown === rows.length;
      next.textContent = next.disabled ? '已显示全部步骤' : shown ? '看下一步' : '看解法';
      return;
    }
    if (button.hasAttribute('data-complete')) {
      completed.add(current);
      recapUnit = current;
      select(current);
      rememberReading();
      const unit = document.getElementById(current);
      const recap = unit.querySelector('.unit-recap');
      history.pushState(null, '', `#${recap.id}`);
      showRecap(unit, true);
      recap.querySelector('h3').focus({ preventScroll: true });
      recap.scrollIntoView({ block: 'start' });
    }
    if (button.hasAttribute('data-recap-back')) {
      selectFromOutline(current);
      const unit = document.getElementById(current);
      unit.focus({ preventScroll: true });
      unit.scrollIntoView({ block: 'start' });
    }
    if (button.hasAttribute('data-continue-unit')) {
      const next = sections[sections.findIndex(section => section.dataset.unit === current) + 1];
      selectFromOutline(next.dataset.unit);
      next.focus({ preventScroll: true });
      next.scrollIntoView({ block: 'start' });
    }
    if (button.hasAttribute('data-practice') || button.dataset.figurePractice) {
      applyBankFilter(curated ? 'all' : 'current');
      const question = button.dataset.figurePractice && document.getElementById(`question-${button.dataset.figurePractice}`);
      enterBank(button, question || bank);
    }
  });
  function applyBankFilter(nextFilter) {
    if (filter !== nextFilter) {
      filter = nextFilter;
      bankScroll = 0;
      if (filter === 'wrong') bank.dispatchEvent(new Event('study-review-wrong'));
    }
    renderBank();
    save();
  }
  for (const button of filters) button.addEventListener('click', () => {
    applyBankFilter(button.dataset.filter);
    history.replaceState(history.state, '', '#question-bank');
    highlightQuestion(null);
  });
  bank.addEventListener('study-practice-updated', renderBank);

  function bankOrigin(opener) {
    if (bank.hidden) {
      readingHash = location.hash || `#${current}`;
      readingOpener = opener;
      readingScroll = window.scrollY;
    }
    return { studyReading: { hash: readingHash, scroll: readingScroll } };
  }

  function enterBank(opener, target = bank) {
    if (location.hash !== `#${target.id}`) history.pushState(bankOrigin(opener), '', `#${target.id}`);
    openLinkedLesson();
    if (target !== bank || !bankScroll) target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  }

  function openLinkedLesson() {
    const target = document.getElementById(location.hash.slice(1));
    const section = target?.closest('[data-unit]');
    const inBank = Boolean(target?.closest('#question-bank'));
    if (target?.id === 'wrong-questions') applyBankFilter('wrong');
    const switching = inBank === bank.hidden;
    showView(inBank);
    showFigures(target === figureIndex && Boolean(target));
    if (!target) return false;
    if (inBank) {
      const origin = history.state?.studyReading;
      const fallback = figureQuestions.has(target.id) ? '#figure-directory' : '';
      const hash = origin?.hash ?? fallback;
      if (!origin || hash !== readingHash) readingOpener = undefined;
      readingHash = hash;
      readingScroll = origin?.scroll ?? 0;
      setReturnLink();
    }
    highlightQuestion(inBank ? target.closest('[data-question]') : null);
    if (target.closest('[data-question]') && target.closest('[hidden]')) {
      applyBankFilter('all');
    }
    if (section && section.dataset.unit !== current) select(section.dataset.unit);
    if (section) showRecap(section, target.classList.contains('unit-recap'));
    let details = target.closest('details');
    while (details) {
      details.open = true;
      details = details.parentElement.closest('details');
    }
    const guide = target.closest('[data-guided-lesson]');
    guidedLessons.get(guide)?.(target);
    const scrollTarget = target.id === 'wrong-questions' ? bank : guide && target.matches('[data-example]') ? guide : target;
    if (!switching || (inBank && target !== bank) || (!inBank && target !== section) || !readingScroll) {
      scrollTarget.scrollIntoView({ block: 'start' });
    }
    return true;
  }

  window.addEventListener('hashchange', openLinkedLesson);
  document.addEventListener('click', event => {
      const link = event.target.closest('a[data-experiment-link]');
      if (!link || event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (link.hash === '#figure-directory' && location.hash !== link.hash) {
        figurePlace = { hash: location.hash, scroll: window.scrollY, opener: link };
      }
      if (location.hash !== link.hash) {
        const target = document.getElementById(link.hash.slice(1));
        history.pushState(target?.closest('#question-bank') ? bankOrigin(link) : null, '', link.hash);
      }
      if (compactOutline.matches) outline.open = false;
      openLinkedLesson();
      document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  });
  const linkedTarget = document.getElementById(location.hash.slice(1));
  const linkedUnit = linkedTarget?.closest('[data-unit]');
  if (start) history.replaceState(null, '', location.pathname + location.hash);
  select(linkedUnit?.dataset.unit ?? lastReading);
  if (start && linkedUnit) rememberReading();
  try {
    if (!linkedTarget?.closest('#question-bank') && !localStorage.getItem('personal-study-last-unit')) rememberReading();
  } catch { /* Resume remains unavailable. */ }
  if (linkedTarget?.classList.contains('unit-recap') || !location.hash && recapUnit === current) {
    showRecap(document.getElementById(current), true);
  }
  if (location.hash) {
    const initialHash = location.hash;
    // Apply the deep link after the header and companion establish the layout.
    window.addEventListener('pageshow', () => requestAnimationFrame(() => {
      if (location.hash !== initialHash) return;
      openLinkedLesson();
      if (start && linkedUnit) {
        const heading = linkedUnit.querySelector('h2');
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }), { once: true });
  }
  const outlineLayout = new ResizeObserver(showCurrentTab);
  outlineLayout.observe(outline);
  outlineLayout.observe(outline.querySelector('.unit-nav'));
})();
