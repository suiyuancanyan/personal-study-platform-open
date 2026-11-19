(() => {
  const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

  for (const exercise of document.querySelectorAll('[data-derivation]')) {
    const steps = [...exercise.querySelectorAll('[data-derive-step]')];
    const tabs = [...exercise.querySelectorAll('[data-derive-jump]')];
    const progress = exercise.querySelector('[data-derive-progress]');
    const finish = exercise.querySelector('.derivation-finish');
    const key = `personal-study-${exercise.id}-v1`;
    let saved;
    try { saved = JSON.parse(localStorage.getItem(key)); } catch { /* The exercise is still usable. */ }
    let results = [];
    if (Array.isArray(saved?.results)) {
      for (const result of saved.results.slice(0, steps.length)) {
        if (result !== 'solved' && result !== 'shown') break;
        results.push(result);
      }
    }

    function show(index, focus = true) {
      for (const [i, step] of steps.entries()) {
        const result = results[i];
        step.hidden = i !== index;
        const tab = tabs[i];
        tab.disabled = i > results.length;
        tab.dataset.deriveStatus = result ?? '';
        if (result) {
          tab.setAttribute('aria-label', `第 ${i + 1} 步，${tab.lastChild.textContent}，${result === 'solved' ? '已答对' : '已看解析'}`);
          const feedback = step.querySelector('.derivation-feedback');
          feedback.dataset.tone = 'success';
          feedback.textContent = result === 'solved' ? '答对了' : '已展开本步解析';
        } else tab.removeAttribute('aria-label');
        if (i === index) tab.setAttribute('aria-current', 'step');
        else tab.removeAttribute('aria-current');
        step.querySelector('form').hidden = Boolean(result);
        step.querySelector('.derivation-tools').hidden = Boolean(result);
        step.querySelector('.derivation-result').hidden = !result;
      }
      progress.textContent = `${results.length} / ${steps.length} 步`;
      finish.hidden = index !== steps.length;
      const solved = results.filter(result => result === 'solved').length;
      finish.querySelector('[data-derive-summary]').textContent = `独立答对 ${solved} 步，参考解析 ${results.length - solved} 步。`;
      if (focus) (steps[index] ?? finish).querySelector('h4').focus();
      try { localStorage.setItem(key, JSON.stringify({ index, results })); } catch { /* Keep the current attempt in memory. */ }
    }

    for (const [i, step] of steps.entries()) {
      const form = step.querySelector('form');
      const input = form.elements.namedItem('value');
      const hintButton = step.querySelector('[data-derive-hint]');
      const hint = step.querySelector('.derivation-hint');
      const feedback = step.querySelector('.derivation-feedback');
      const next = step.querySelector('[data-derive-next]');

      function complete(result) {
        if (results[i]) return;
        results[i] = result;
        hint.hidden = true;
        hintButton.setAttribute('aria-expanded', 'false');
        show(i, false);
        next.focus({ preventScroll: true });
      }

      form.addEventListener('submit', event => {
        event.preventDefault();
        const mistake = step.querySelector('[data-derive-mistake]');
        feedback.dataset.tone = 'retry';
        if (form.dataset.value !== '') {
          const raw = input.value.trim().normalize('NFKC').replace(/[−–]/g, '-');
          const value = decimal.test(raw) ? Number(raw) : NaN;
          const expected = Number(form.dataset.value);
          const tolerance = Number(form.dataset.tolerance) + 1e-10 * Math.max(1, Math.abs(expected));
          if (Math.abs(value - expected) <= tolerance) {
            complete('solved');
            return;
          }
          if (Number.isFinite(value)) {
            feedback.replaceChildren('再核对一下。', ...hint.cloneNode(true).childNodes);
          } else {
            feedback.textContent = '请填一个数值，例如 −2 或 0.5。';
          }
        } else if (event.submitter?.value === 'correct') {
          complete('solved');
        } else if (mistake) {
          feedback.replaceChildren(mistake.content.cloneNode(true));
        }
      });

      hintButton.addEventListener('click', () => {
        hint.hidden = !hint.hidden;
        hintButton.setAttribute('aria-expanded', String(!hint.hidden));
      });
      step.querySelector('[data-derive-reveal]').addEventListener('click', () => complete('shown'));
      tabs[i].addEventListener('click', () => show(i));
      next.addEventListener('click', () => show(i + 1));
    }

    exercise.querySelector('[data-derive-reset]').addEventListener('click', () => {
      results = [];
      for (const step of steps) {
        step.querySelector('form').reset();
        step.querySelector('.derivation-feedback').textContent = '';
        step.querySelector('.derivation-hint').hidden = true;
        step.querySelector('[data-derive-hint]').setAttribute('aria-expanded', 'false');
      }
      show(0);
    });
    const resume = Number.isInteger(saved?.index) ? Math.max(0, Math.min(saved.index, results.length)) : results.length;
    show(resume, false);
  }
})();
