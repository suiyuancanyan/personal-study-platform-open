(async () => {
  const { lessonText } = await import('/lesson-text.mjs');
  const { lessonState, input, summary, saved, save, junction } = window.chapterRuntime;
  const get = selector => document.querySelector(selector);
  const panel = get('#companion');
  const reader = get('.reader');
  const header = get('.study-header');
  const backdrop = get('.companion-backdrop');
  const sheetHandle = get('.sheet-handle');
  const lesson = get('.lesson');
  const canvas = get('#ink');
  const paint = canvas.getContext('2d');
  const draw = get('#draw');
  const undo = get('#undo-ink');
  const quote = get('#quote');
  const quoteSelection = get('#quote-selection');
  const removeQuote = get('#remove-quote');
  const askContext = get('#ask-context');
  const askForm = get('#ask-form');
  const question = get('#question');
  const send = get('#ask-send');
  const status = get('#ask-status');
  const model = get('#companion-model');
  const keyField = get('#companion-key-field');
  const deepseekKey = get('#companion-key');
  const transcript = get('.transcript');
  const messages = get('#messages');
  const archived = get('#pn-history-messages');
  const revise = get('#revise-turn');
  const toggle = get('#companion-toggle');
  const close = get('#companion-close');
  const sourceLink = get('#pn-context-source');
  const drawer = window.matchMedia('(width < 1360px)');
  const newReply = get('#view-new-reply');
  const compact = window.matchMedia('(max-width: 759px)');
  const regions = lessonState.labels;
  const annotations = saved.annotations ?? {};
  const history = Array.isArray(saved.companion) ? saved.companion : [];
  let currentStroke = null;
  let selection = '';
  let citation = '';
  let figureQuote = '';
  let example = null;
  let opener = toggle;
  let busy = false;
  let retryTurn = false;
  let hasServerKey = false;
  let transcriptPosition;
  let latestFailure;

  const modelPreference = 'personal-study-companion-channel';
  try {
    const stored = localStorage.getItem(modelPreference);
    if ([...model.options].some(option => option.value === stored)) model.value = stored;
  } catch { /* The default remains available. */ }

  function renderModel() {
    keyField.hidden = model.value === 'codex' || hasServerKey;
  }
  renderModel();
  model.addEventListener('change', () => {
    try { localStorage.setItem(modelPreference, model.value); } catch { /* The selection still applies this visit. */ }
    status.textContent = '';
    renderModel();
  });
  fetch('/api/companion/status').then(response => response.json()).then(config => {
    hasServerKey = config.deepseekConfigured === true;
    renderModel();
  }).catch(() => {});

  document.body.classList.add('companion-layout');
  for (const element of document.querySelectorAll('.study-header, .course-label, .mark-tools, #ink, #companion')) {
    element.hidden = false;
  }

  function syncDrawer() {
    const open = document.body.classList.contains('chat-open');
    const modal = drawer.matches && open;
    panel.inert = !open;
    header.inert = reader.inert = modal;
    backdrop.hidden = !modal;
    if (modal) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      if (!panel.contains(document.activeElement)) question.focus({ preventScroll: true });
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
    }
  }

  function setChatOpen(open) {
    if (!open && document.body.classList.contains('chat-open')) transcriptPosition = nearLatest() ? undefined : transcript.scrollTop;
    document.body.classList.toggle('chat-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '收起 AI 伴学' : '打开 AI 伴学');
    syncDrawer();
    if (open) {
      if (transcriptPosition === undefined) scrollToLatest();
      else transcript.scrollTop = transcriptPosition;
    }
  }

  function closeChat(restoreFocus = true) {
    setChatOpen(false);
    if (restoreFocus) (opener.getClientRects().length ? opener : toggle).focus({ preventScroll: true });
  }

  toggle.addEventListener('click', event => {
    event.preventDefault();
    const open = !document.body.classList.contains('chat-open');
    if (open) {
      opener = toggle;
      setChatOpen(true);
      question.focus({ preventScroll: true });
    } else closeChat();
  });
  close.addEventListener('click', () => closeChat());
  backdrop.addEventListener('click', () => closeChat());
  let sheetDrag;
  sheetHandle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    sheetHandle.setPointerCapture(event.pointerId);
    sheetDrag = { start: event.clientY, distance: 0 };
    panel.classList.add('is-sheet-dragging');
  });
  sheetHandle.addEventListener('pointermove', event => {
    if (!sheetDrag) return;
    sheetDrag.distance = Math.max(0, event.clientY - sheetDrag.start);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.style.setProperty('--sheet-offset', `${sheetDrag.distance}px`);
    }
  });
  function endSheetDrag(dismiss) {
    panel.classList.remove('is-sheet-dragging');
    if (dismiss && sheetDrag?.distance >= 90) closeChat();
    sheetDrag = undefined;
    panel.style.removeProperty('--sheet-offset');
  }
  sheetHandle.addEventListener('pointerup', () => endSheetDrag(true));
  sheetHandle.addEventListener('lostpointercapture', () => endSheetDrag(false));
  sheetHandle.addEventListener('click', event => {
    if (event.detail === 0) closeChat();
  });
  drawer.addEventListener('change', syncDrawer);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeChat();
    }
    if (event.key !== 'Tab' || !drawer.matches) return;
    const controls = [...panel.querySelectorAll('button, a[href], textarea, input, select, summary')]
      .filter(control => !control.disabled && control.tabIndex >= 0 && control.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });
  sourceLink.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (drawer.matches) closeChat(false);
  });
  setChatOpen(false);

  const bias = () => Number(input.value);
  const strokeList = () => annotations[bias()] ?? [];

  function markedRegions() {
    const points = strokeList().flat();
    if (!points.length) return [];
    const counts = [0, 0, 0];
    for (const [x] of points) {
      counts[lessonState.region(x)]++;
    }
    return regions.filter((_, index) => counts[index] >= points.length * 0.16);
  }

  function showContext() {
    const marks = input.closest('[hidden]') ? [] : markedRegions();
    const step = activeStep()?.querySelector('h3');
    askContext.textContent = example ? [example.title, example.source, figureQuote ? '已引用当前图注' : ''].filter(Boolean).join(' · ') : [
      window.activeStudyUnit ? `正在学：${window.activeStudyUnit}` : `当前${lessonState.current()}`,
      step?.textContent ?? '',
      marks.length ? `圈画涉及${marks.join('、')}` : '',
      citation ? `引用「${citation.length > 60 ? `${citation.slice(0, 60)}…` : citation}」` : '',
    ].filter(Boolean).join(' · ');
    askContext.title = askContext.textContent;
    removeQuote.hidden = !citation;
    undo.disabled = strokeList().length === 0;
  }

  window.addEventListener('study-unit-changed', () => {
    if (example && example.unit !== window.activeStudyUnitId) {
      example = null;
      citation = '';
      figureQuote = '';
      sourceLink.hidden = true;
    }
    showContext();
  });
  window.addEventListener('study-step-changed', showContext);

  function activeStep() {
    return document.querySelector('[data-unit]:not([hidden]) [data-guided-step]:not([hidden])');
  }

  function renderInk() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    paint.setTransform(ratio, 0, 0, ratio, 0, 0);
    paint.clearRect(0, 0, width, height);
    paint.lineWidth = 3.4;
    paint.lineJoin = paint.lineCap = 'round';
    paint.strokeStyle = '#b0462b';
    const strokes = currentStroke ? [...strokeList(), currentStroke.points] : strokeList();
    for (const points of strokes) {
      paint.beginPath();
      points.forEach(([x, y], index) => {
        if (index === 0) paint.moveTo(x * width, y * height);
        else paint.lineTo(x * width, y * height);
      });
      paint.stroke();
    }
  }

  function point(event) {
    const box = canvas.getBoundingClientRect();
    const clamp = value => Math.round(Math.max(0, Math.min(1, value)) * 1000) / 1000;
    return [clamp((event.clientX - box.left) / box.width), clamp((event.clientY - box.top) / box.height)];
  }

  draw.addEventListener('click', () => {
    const active = junction.classList.toggle('drawing');
    draw.setAttribute('aria-pressed', active);
    draw.textContent = active ? '退出圈画' : '圈画';
  });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    currentStroke = { id: event.pointerId, points: [point(event)] };
  });
  canvas.addEventListener('pointermove', event => {
    if (currentStroke?.id !== event.pointerId || currentStroke.points.length >= 300) return;
    currentStroke.points.push(point(event));
    renderInk();
  });
  function finishStroke(event) {
    if (currentStroke?.id !== event.pointerId) return;
    if (event.type === 'pointerup' && currentStroke.points.length > 1) {
      annotations[bias()] = [...strokeList().slice(-19), currentStroke.points];
      save({ annotations });
    }
    currentStroke = null;
    renderInk();
    showContext();
  }
  canvas.addEventListener('pointerup', finishStroke);
  canvas.addEventListener('pointercancel', finishStroke);
  canvas.addEventListener('lostpointercapture', finishStroke);
  undo.addEventListener('click', () => {
    annotations[bias()] = strokeList().slice(0, -1);
    save({ annotations });
    renderInk();
    showContext();
  });
  input.addEventListener('bias-updated', () => {
    currentStroke = null;
    renderInk();
    showContext();
  });
  new ResizeObserver(renderInk).observe(canvas);

  document.addEventListener('selectionchange', () => {
    const selected = window.getSelection();
    selection = '';
    if (selected?.rangeCount && !selected.isCollapsed && lesson.contains(selected.anchorNode) && lesson.contains(selected.focusNode)) {
      selection = plainNotation(selected.getRangeAt(0).cloneContents()).slice(0, 350);
    }
    quote.disabled = !selection;
    quoteSelection.hidden = true;
    if (!selection || !selected.rangeCount) return;
    const rect = selected.getRangeAt(0).getBoundingClientRect();
    if (!rect.width || rect.bottom < 70 || rect.top > innerHeight - 24) return;
    quoteSelection.style.left = `${Math.max(10, Math.min(innerWidth - 138, rect.left))}px`;
    quoteSelection.style.top = `${rect.top < 110 || compact.matches ? Math.min(innerHeight - 44, rect.bottom + 6) : rect.top - 39}px`;
    quoteSelection.hidden = false;
  });
  document.addEventListener('scroll', () => { quoteSelection.hidden = true; }, { capture: true, passive: true });
  function cite(text, source, trigger) {
    if (!text) return;
    example = null;
    figureQuote = '';
    opener = trigger || toggle;
    citation = text;
    sourceLink.hidden = !source?.id;
    if (source?.id) sourceLink.href = `#${source.id}`;
    quoteSelection.hidden = true;
    showContext();
    setChatOpen(true);
    question.focus({ preventScroll: true });
  }

  function citeExample(source) {
    const prompt = plainNotation(source.querySelector('[data-example-prompt]').cloneNode(true));
    const figures = [...source.querySelectorAll('.example-figures img')].map(image => image.alt);
    const provenance = source.querySelector('.example-figures figcaption a')?.textContent.replace(/\s*↗$/, '');
    const identity = source.dataset.question ?? source.querySelector('[data-question-draft]')?.dataset.questionDraft ?? source.id;
    const solution = [...source.querySelectorAll('.worked-solution ol > li, .bank-result ol > li, [data-example-step]')]
      .map(node => plainNotation(node.cloneNode(true)));
    citation = prompt;
    figureQuote = '';
    example = {
      unit: source.closest('[data-bank-unit]')?.dataset.bankUnit ?? source.closest('[data-unit]')?.dataset.unit ?? window.activeStudyUnitId,
      title: source.querySelector('.question-title, header h4')?.textContent ?? (prompt.length > 62 ? `${prompt.slice(0, 62)}…` : prompt),
      source: provenance,
      sourceId: source.id,
      context: [`当前例题（${identity}）：${prompt}`, provenance ? `来源：${provenance}` : '', figures.length ? `图中信息：${figures.join('；')}` : '',
        solution.length ? `参考解法：${solution.join(' ')}` : ''].filter(Boolean).join('\n'),
    };
    sourceLink.href = `#${source.id}`;
    sourceLink.hidden = false;
  }
  for (const button of [quote, quoteSelection]) {
    button.addEventListener('pointerdown', event => event.preventDefault());
    button.addEventListener('click', () => cite(selection, undefined, button));
  }
  document.addEventListener('study-figure-quote', event => {
    const { text, source, opener: thumbnail } = event.detail;
    if (!source?.matches('[data-example]')) {
      cite(text, source, thumbnail);
      return;
    }
    citeExample(source);
    figureQuote = text;
    opener = thumbnail;
    retryTurn = false;
    showContext();
    setChatOpen(true);
    question.focus({ preventScroll: true });
  });
  document.addEventListener('click', event => {
    const explain = event.target.closest('[data-example-help]');
    if (explain) {
      if (busy) {
        setChatOpen(true);
        close.focus({ preventScroll: true });
        return;
      }
      citeExample(explain.closest('[data-example]'));
      opener = explain;
      retryTurn = false;
      showContext();
      setChatOpen(true);
      close.focus({ preventScroll: true });
      void ask(explain.hasAttribute('data-example-detail')
        ? '请完整详解这道资料原题。'
        : '带我读这道题。先说清楚题目给了什么、要找什么，再给我一个能自己做的起步提示。');
      return;
    }
    const button = event.target.closest('[data-pn-ask]');
    if (!button) return;
    const source = button.closest('[data-pn-task], #pn-model-lab, #pn-model-explanation, [data-unit]');
    const label = source?.querySelector('h3, figcaption');
    const image = source?.querySelector('svg desc');
    const sourceText = [label, image].filter(Boolean).map(node => plainNotation(node.cloneNode(true))).join('。');
    cite(sourceText || '第 5 节串联电路', source, button);
    retryTurn = false;
    setQuestion(button.dataset.pnAsk);
    status.textContent = '';
  });
  removeQuote.addEventListener('click', () => {
    citation = '';
    example = null;
    figureQuote = '';
    sourceLink.hidden = true;
    showContext();
    saveDraft();
  });

  function addMessage(role, content, target = messages) {
    const row = document.createElement('div');
    row.className = `message ${role}`;
    const label = document.createElement('h3');
    label.textContent = role === 'user' ? '我' : 'AI 伴学';
    const text = document.createElement('p');
    text.innerHTML = lessonText(content);
    row.append(label, text);
    target.append(row);
    return { row, text };
  }

  function scrollToLatest() {
    transcript.scrollTop = transcript.scrollHeight;
    newReply.hidden = true;
  }

  const nearLatest = () => transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 48;
  newReply.addEventListener('click', () => {
    scrollToLatest();
    messages.lastElementChild?.focus({ preventScroll: true });
  });
  transcript.addEventListener('scroll', () => { if (nearLatest()) newReply.hidden = true; }, { passive: true });

  history.forEach(({ role, content }) => addMessage(role, content, archived || messages));
  if (archived) archived.parentElement.hidden = !history.length;
  revise.hidden = Boolean(archived) || history.length < 2;
  const previousTurns = archived ? history.length : 0;
  scrollToLatest();
  const initialDraft = saved.companionDraft;
  if (initialDraft?.text) {
    question.value = initialDraft.text;
    const source = document.getElementById(initialDraft.sourceId);
    if (source?.matches('[data-example]')) {
      citeExample(source);
      figureQuote = initialDraft.figureQuote ?? '';
    }
  }
  showContext();

  function saveDraft() {
    save({ companionDraft: question.value ? { text: question.value, sourceId: example?.sourceId, figureQuote } : undefined });
  }

  function setQuestion(text) {
    question.value = text;
    saveDraft();
  }
  question.addEventListener('input', saveDraft);

  function plainNotation(content) {
    for (const index of [...content.querySelectorAll('sub, sup')].reverse()) {
      index.replaceWith(index.tagName === 'SUB' ? `_{${index.textContent}}` : `^(${index.textContent})`);
    }
    return content.textContent.trim().replace(/\s+/g, ' ');
  }

  function modelContext() {
    if (example) {
      return figureQuote ? `学生引用图注：${figureQuote}\n${example.context}` : example.context;
    }
    const chapterExperimentVisible = !input.closest('[hidden]');
    const marks = chapterExperimentVisible ? markedRegions() : [];
    const active = activeStep();
    const stepText = [...(active?.querySelectorAll(':scope > h3, :scope > p') ?? [])].map(node => plainNotation(node.cloneNode(true))).join('\n');
    const readout = active?.querySelector('.lab-reading, #pnml-readout');
    const reading = readout && !readout.closest('[hidden]') && plainNotation(readout.cloneNode(true));
    return [
      stepText ? `当前学习步骤：${stepText}` : '',
      chapterExperimentVisible ? `本节实验参数：${lessonState.current()}。${plainNotation(summary.cloneNode(true))}` : '',
      reading ? `本节实验读数：${reading}` : '',
      marks.length ? `当前图中圈画可能涉及：${marks.join('、')}。` : '',
      citation ? `学生引用的讲解或图注：「${citation}」` : '',
    ].filter(Boolean).join('\n');
  }

  async function streamReply(response, onText) {
    if (!response.ok || !response.body) {
      const failure = await response.json().catch(() => null);
      throw new Error(failure?.error || '模型连接失败，可以重新发送。');
    }
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    let reply = '';
    let complete = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          const frame = JSON.parse(line);
          if (frame.error) throw new Error(frame.error);
          if (frame.message?.content) {
            reply += frame.message.content;
            onText(reply);
          }
          complete ||= frame.done === true;
        }
      }
    } finally {
      reader.releaseLock();
    }
    if (!complete || !reply.trim()) throw new Error('模型未完成回答，可以重新发送。');
    return reply.trim();
  }

  async function ask(content = question.value.trim(), failedTurn) {
    if (busy || !content) return;
    const channel = model.value;
    const key = channel === 'codex' ? '' : deepseekKey.value.trim();
    if (channel !== 'codex' && !hasServerKey && !key) {
      status.textContent = '请先输入 DeepSeek API Key。';
      if (!question.value) setQuestion(content);
      deepseekKey.focus();
      return;
    }
    busy = send.disabled = revise.disabled = model.disabled = deepseekKey.disabled = true;
    status.textContent = channel === 'codex' ? '等待 Codex · 6 Luna 回答…' : '等待 DeepSeek 回答…';
    const context = failedTurn?.context ?? modelContext();
    const unit = failedTurn?.unit ?? example?.unit ?? window.activeStudyUnitId;
    const user = { role: 'user', content };
    const replaced = retryTurn ? [...messages.children].slice(-2) : [];
    const contextHistory = history.slice(previousTurns, retryTurn ? -2 : undefined);
    const pending = failedTurn?.pending ?? addMessage('user', content);
    failedTurn?.errorActions.remove();
    const reply = failedTurn?.reply ?? addMessage('assistant', '正在讲解…');
    reply.text.textContent = '正在讲解…';
    reply.row.tabIndex = -1;
    if (question.value.trim() === content) setQuestion('');
    scrollToLatest();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, ...(key ? { key } : {}), chapter: lessonState.id, unit, context: context.slice(0, 1800), messages: [...contextHistory.slice(-8), user] }),
      });
      const answer = await streamReply(response, text => {
        const follow = nearLatest();
        reply.text.textContent = text;
        if (follow) scrollToLatest();
        else newReply.hidden = false;
      });
      const follow = nearLatest();
      reply.text.innerHTML = lessonText(answer);
      if (follow) scrollToLatest();
      else newReply.hidden = false;
      if (retryTurn) {
        history.splice(-2, 2);
        replaced.forEach(row => row.remove());
        retryTurn = false;
      }
      history.push(user, { role: 'assistant', content: answer.slice(0, 1500) });
      if (latestFailure?.reply === reply) latestFailure = undefined;
      save({ companion: history.slice(-40) });
      revise.hidden = false;
      status.textContent = '回答已保存';
    } catch (error) {
      const follow = nearLatest();
      reply.text.textContent = error instanceof TypeError ? '伴学连接中断。' : error.message;
      const errorActions = document.createElement('button');
      errorActions.type = 'button';
      errorActions.textContent = '重试';
      const failed = { content, context, unit, pending, reply, errorActions };
      latestFailure = failed;
      errorActions.addEventListener('click', () => void ask(content, failed));
      reply.row.append(errorActions);
      status.textContent = '讲解暂未完成';
      if (!question.value) setQuestion(content);
      if (follow) scrollToLatest();
      else newReply.hidden = false;
    } finally {
      busy = send.disabled = revise.disabled = model.disabled = deepseekKey.disabled = false;
    }
  }

  function submitQuestion() {
    const text = question.value.trim();
    void ask(text, latestFailure?.content === text ? latestFailure : undefined);
  }
  askForm.addEventListener('submit', event => { event.preventDefault(); submitQuestion(); });
  revise.addEventListener('click', () => {
    if (busy || history.length < 2) return;
    if (!question.value) {
      setQuestion(history.at(-2).content);
      retryTurn = true;
      status.textContent = '发送后将更新上一轮回答';
    }
    question.focus();
  });
  question.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitQuestion();
    }
  });
  for (const button of document.querySelectorAll('[data-prompt]')) {
    button.addEventListener('click', () => {
      retryTurn = false;
      setQuestion(button.dataset.prompt);
      status.textContent = '';
      question.focus();
    });
  }
})();
