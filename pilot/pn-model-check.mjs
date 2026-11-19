const storageKey = 'personal-study-pn-model-check-v1';

export function pnModelCheck() {
  return `<section class="panel pn-model-check" id="pn-model-check" aria-labelledby="pn-model-check-title" tabindex="-1">
    <header class="pn-check-heading"><h3 id="pn-model-check-title">用新电路检验自己</h3><p>选模型、算电流，再用自己的话解释判断依据。</p></header>
    <div class="pn-check-progress" role="status" aria-live="polite"><strong data-pn-progress>已掌握 0 / 3 项</strong><span data-pn-skills>待完成：模型选择、限流计算、串联电路分析</span></div>

    <article class="pn-check-task" id="pn-model-task-1" data-pn-task="model-choice" aria-labelledby="pn-task-1-title" tabindex="-1">
      <p class="pn-task-kicker">任务 1 · 模型的电压预测</p><h3 id="pn-task-1-title">5 V 电源、1 kΩ 电阻和正向连接的硅二极管。题设采用理想模型估算，二极管两端电压是多少？</h3>
      <fieldset><legend>选择所用模型</legend><label><input type="radio" name="pn-model-choice" value="ideal"> 理想模型</label><label><input type="radio" name="pn-model-choice" value="constant"> 恒压降模型</label></fieldset>
      <label for="pn-model-drop">二极管两端电压</label><div class="pn-answer-row"><input id="pn-model-drop" data-pn-input="drop" type="text" inputmode="decimal" autocomplete="off" aria-describedby="pn-drop-hint pn-feedback-model-choice" placeholder="例如 1.2 V"><span>V</span></div>
      <p class="pn-task-hint" id="pn-drop-hint">答案取决于模型对导通压降的设定。</p><button type="button" data-pn-action="check-model">检查答案</button>
      <p class="pn-task-feedback" data-pn-feedback="model-choice" role="status" aria-live="polite"></p>
      <button type="button" data-pn-action="variant-model" hidden>换组参数再练</button><button type="button" class="pn-retry" data-pn-action="retry" data-pn-id="model-choice" hidden>再练一次</button>
    </article>

    <article class="pn-check-task" id="pn-model-task-2" data-pn-task="current-calc" aria-labelledby="pn-task-2-title" tabindex="-1">
      <p class="pn-task-kicker">任务 2 · 计算电流</p><h3 id="pn-task-2-title">用恒压降模型。电源为 3.3 V，电阻为 1 kΩ，硅二极管正向导通且压降取 0.7 V。求流过电阻的电流。</h3>
      <label for="pn-current-answer">支路电流</label><div class="pn-answer-row"><input id="pn-current-answer" data-pn-input="current" type="text" inputmode="decimal" autocomplete="off" aria-describedby="pn-current-hint pn-feedback-current-calc" placeholder="例如 1.2 mA"><span>mA 或 A</span></div>
      <p class="pn-task-hint" id="pn-current-hint">先求电阻两端的电压，再用 I = U / R。</p><button type="button" data-pn-action="check-current">检查答案</button>
      <p class="pn-task-feedback" data-pn-feedback="current-calc" role="status" aria-live="polite"></p><button type="button" data-pn-action="variant-current" hidden>换组参数再练</button><button type="button" class="pn-retry" data-pn-action="retry" data-pn-id="current-calc" hidden>再练一次</button>
    </article>

    <article class="pn-check-task" id="pn-model-task-3" data-pn-task="circuit-check" aria-labelledby="pn-task-3-title" tabindex="-1">
      <p class="pn-task-kicker">任务 3 · 分析陌生电路</p><h3 id="pn-task-3-title">电源为 12 V，电阻为 2.2 kΩ，二极管采用理想模型。求 X、Y 两点之间的支路电流，并说明你的判断依据。</h3>
      <figure class="pn-circuit"><svg viewBox="0 0 520 190" role="img" aria-labelledby="pn-circuit-title pn-circuit-desc">
        <title id="pn-circuit-title">12 V 电源、2.2 kΩ 电阻和二极管串联电路</title><desc id="pn-circuit-desc">图示带电源极性标记的串联支路，X、Y 标示二极管两侧节点。</desc>
        <path d="M70 44 H168 M254 44 H450 V146 H70" fill="none" stroke="#25323b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M168 44 v-16 h86 v32 h-86 z" fill="#fff" stroke="#25323b" stroke-width="3"/>
        <path d="M254 44 H340 M390 44 H450" fill="none" stroke="#25323b" stroke-width="4" stroke-linecap="round"/>
        <path d="M340 20 V68" data-pn-diode-bar fill="none" stroke="#25323b" stroke-width="4" stroke-linecap="round"/>
        <path d="M390 18 L390 70 L340 44 Z" data-pn-diode-shape fill="#eaf3ef" stroke="#25323b" stroke-width="3"/>
        <path d="M70 44 V78 M70 104 V146" fill="none" stroke="#25323b" stroke-width="3"/><path d="M50 78 H90 M58 104 H82" fill="none" stroke="#25323b" stroke-width="3"/>
        <text x="70" y="30" text-anchor="middle" font-size="18" fill="#182a33">+</text><text x="70" y="174" text-anchor="middle" font-size="18" fill="#182a33">−</text>
        <text x="210" y="37" text-anchor="middle" font-size="17" fill="#182a33" data-pn-resistance>2.2 kΩ</text><text x="105" y="99" font-size="17" fill="#182a33" data-pn-voltage>12 V</text>
        <text x="323" y="18" text-anchor="middle" font-size="15" fill="#53636b" data-pn-node-x>X</text><text x="418" y="67" text-anchor="middle" font-size="15" fill="#53636b" data-pn-node-y>Y</text>
      </svg><figcaption data-pn-circuit-caption>沿着导线从 X 到 Y 观察元件连接。</figcaption></figure>
      <fieldset><legend>选择题设的二极管模型</legend><label><input type="radio" name="pn-circuit-model" value="ideal"> 理想模型</label><label><input type="radio" name="pn-circuit-model" value="constant"> 恒压降模型</label></fieldset>
      <fieldset><legend>哪一侧是阳极？</legend><label><input type="radio" name="pn-anode-side" value="X"> X 侧</label><label><input type="radio" name="pn-anode-side" value="Y"> Y 侧</label></fieldset>
      <label for="pn-circuit-answer">X、Y 间的支路电流</label><div class="pn-answer-row"><input id="pn-circuit-answer" data-pn-input="circuit" type="text" inputmode="decimal" autocomplete="off" aria-describedby="pn-circuit-hint pn-feedback-circuit-check" placeholder="填写数值及单位"><span>A 或 mA</span></div>
      <p class="pn-task-hint" id="pn-circuit-hint"><button type="button" class="pn-help" data-pn-ask="请提示我如何根据电源极性和二极管符号判断此电路状态，不要直接给电流答案。">只提示判断方法</button> 可先回顾<a href="#pn-model-explanation" data-experiment-link>二极管模型说明</a>。</p>
      <label for="pn-reason">用自己的话说明判断依据</label><textarea id="pn-reason" data-pn-input="reason" rows="3" placeholder="说明电源极性、二极管连接和你的判断" aria-describedby="pn-reason-criterion"></textarea>
      <p class="pn-task-hint" id="pn-reason-criterion"><strong>自评标准：</strong>说明电源正负端分别连接到二极管的哪一侧，据此判断偏置状态，并说明这个判断如何影响电流。</p>
      <button type="button" data-pn-action="check-circuit">检查模型与电流</button> <button type="button" data-pn-action="confirm-reason" disabled>我已按标准说明</button>
      <p class="pn-task-feedback" data-pn-feedback="circuit-check" role="status" aria-live="polite"></p><button type="button" class="pn-retry" data-pn-action="retry" data-pn-id="circuit-check" hidden>再练一次</button><button type="button" data-pn-action="variant-circuit" hidden>换一种连接再练</button>
    </article>
    <p class="pn-check-return"><a href="#pn-model-lab" data-experiment-link>回到 PN 结实验</a> · <a href="#pn-junction-5" data-experiment-link>回到本节讲解</a></p>
  </section>`;
}

const baseCircuit = { voltage: 12, resistance: 2.2, kind: 'reverse' };

export function bindPnModelCheck(root, onProgress = () => {}) {
  if (!root) return () => {};
  const section = root.matches?.('#pn-model-check') ? root : root.querySelector('#pn-model-check');
  if (!section || section.dataset.pnBound) return () => {};
  section.dataset.pnBound = 'true';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { /* keep progress in memory */ }
  state.mastered ??= {};
  state.needsReview ??= {};
  state.circuit ??= baseCircuit;
  state.currentVariant ??= false;
  const feedback = id => section.querySelector(`[data-pn-feedback="${id}"]`);
  const setFeedback = (id, message, good = false) => {
    const target = feedback(id);
    if (target) { target.textContent = message; target.classList.toggle('is-good', good); }
  };
  const numberIn = text => {
    const match = String(text).trim().toLowerCase().replace(',', '.').match(/^([+-]?(?:\d+\.?\d*|\.\d+))\s*(ma|mv|a|v)?$/);
    if (!match) return NaN;
    const value = Number(match[1]);
    return match[2] === 'a' || match[2] === 'v' ? value * 1000 : value;
  };
  function updateProgress() {
    const skills = [['model-choice', '模型选择'], ['current-calc', '限流计算'], ['circuit-check', '串联电路分析']];
    const count = skills.filter(([id]) => state.mastered[id]).length;
    section.querySelector('[data-pn-progress]').textContent = `已掌握 ${count} / ${skills.length} 项`;
    section.querySelector('[data-pn-skills]').textContent = count === skills.length ? `已掌握：${skills.map(([, name]) => name).join('、')}` : `待完成：${skills.filter(([id]) => !state.mastered[id]).map(([, name]) => name).join('、')}`;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* progress remains in memory */ }
    onProgress({ taskId: 'pn-model-check', mastered: count === skills.length, masteredCount: count, total: skills.length, skills: { ...state.mastered }, needsReview: { ...state.needsReview } });
  }
  function setNeedsReview(id, needsReview) {
    if (needsReview) state.needsReview[id] = true;
    else delete state.needsReview[id];
    section.querySelector(`[data-pn-task="${id}"]`)?.setAttribute('data-pn-needs-review', String(Boolean(state.needsReview[id])));
    updateProgress();
  }
  function mark(id) {
    state.mastered[id] = true;
    delete state.needsReview[id];
    const card = section.querySelector(`[data-pn-task="${id}"]`);
    card?.classList.add('is-mastered');
    card?.setAttribute('data-pn-needs-review', 'false');
    const retry = card?.querySelector('[data-pn-action="retry"]');
    if (retry) retry.hidden = false;
    updateProgress();
  }
  function clearVerification() {
    const hadVerification = Boolean(state.verifiedCircuit);
    state.verifiedCircuit = null;
    const confirm = section.querySelector('[data-pn-action="confirm-reason"]');
    if (confirm) confirm.disabled = true;
    if (hadVerification) setFeedback('circuit-check', '答案已变化，请重新检查模型和电流。');
  }
  function anodeSide() { return state.circuit.kind === 'forward' ? 'X' : 'Y'; }
  function renderCircuit() {
    const card = section.querySelector('[data-pn-task="circuit-check"]');
    const forward = state.circuit.kind === 'forward';
    card.querySelector('#pn-task-3-title').textContent = forward
      ? `电源为 ${state.circuit.voltage} V，电阻为 ${state.circuit.resistance} kΩ。题设采用恒压降模型，硅二极管正向压降为 0.7 V。求 X、Y 两点之间的支路电流，并说明判断依据。`
      : `电源为 ${state.circuit.voltage} V，电阻为 ${state.circuit.resistance} kΩ，二极管采用理想模型。求 X、Y 两点之间的支路电流，并说明你的判断依据。`;
    card.querySelector('#pn-circuit-title').textContent = `${state.circuit.voltage} V 电源、${state.circuit.resistance} kΩ 电阻和二极管串联电路`;
    card.querySelector('[data-pn-resistance]').textContent = `${state.circuit.resistance} kΩ`;
    card.querySelector('[data-pn-voltage]').textContent = `${state.circuit.voltage} V`;
    card.querySelector('[data-pn-diode-bar]').setAttribute('d', forward ? 'M390 20 V68' : 'M340 20 V68');
    card.querySelector('[data-pn-diode-shape]').setAttribute('d', forward ? 'M340 18 L340 70 L390 44 Z' : 'M390 18 L390 70 L340 44 Z');
    card.querySelector('[data-pn-circuit-caption]').textContent = '沿导线从 X 到 Y 观察元件连接。';
    for (const input of card.querySelectorAll('input[type="radio"]')) input.checked = false;
    clearVerification();
  }
  function renderCurrentVariant() {
    const title = section.querySelector('#pn-task-2-title');
    title.textContent = state.currentVariant
      ? '用恒压降模型。电源为 5.2 V，电阻为 1.5 kΩ，硅二极管正向导通且压降取 0.7 V。求流过电阻的电流。'
      : '用恒压降模型。电源为 3.3 V，电阻为 1 kΩ，硅二极管正向导通且压降取 0.7 V。求流过电阻的电流。';
  }

  for (const [id, task] of [['model-choice', 'model-choice'], ['current-calc', 'current-calc'], ['circuit-check', 'circuit-check']]) {
    const card = section.querySelector(`[data-pn-task="${task}"]`);
    card?.setAttribute('data-pn-needs-review', String(Boolean(state.needsReview[id])));
    if (state.mastered[id]) {
      card?.classList.add('is-mastered');
      const retry = card?.querySelector('[data-pn-action="retry"]');
      if (retry) retry.hidden = false;
    }
  }
  renderCircuit();
  renderCurrentVariant();
  updateProgress();

  section.addEventListener('input', event => {
    if (event.target.matches('[data-pn-input="circuit"], [name="pn-circuit-model"], [name="pn-anode-side"]')) clearVerification();
  });
  section.addEventListener('change', event => {
    if (event.target.matches('[data-pn-input="circuit"], [name="pn-circuit-model"], [name="pn-anode-side"]')) clearVerification();
  });
  section.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || !event.target.matches('[data-pn-input="drop"], [data-pn-input="current"], [data-pn-input="circuit"]')) return;
    event.preventDefault();
    const action = event.target.dataset.pnInput === 'drop' ? 'check-model' : event.target.dataset.pnInput === 'current' ? 'check-current' : 'check-circuit';
    section.querySelector(`[data-pn-action="${action}"]`)?.click();
  });
  section.addEventListener('click', event => {
    const button = event.target.closest('[data-pn-action]');
    if (!button || !section.contains(button)) return;
    const action = button.dataset.pnAction;
    if (action === 'check-model') {
      const model = section.querySelector('input[name="pn-model-choice"]:checked')?.value;
      const rawDrop = section.querySelector('[data-pn-input="drop"]').value.trim();
      const drop = numberIn(rawDrop);
      if (model && model !== 'ideal') setNeedsReview('model-choice', true);
      if (model === 'ideal' && Number.isFinite(drop) && Math.abs(drop) < 0.02) {
        setFeedback('model-choice', '正确。理想模型把正向导通压降设为零。', true); mark('model-choice');
      } else if (!model || !Number.isFinite(drop)) {
        setFeedback('model-choice', '请选择模型并填写电压数值。');
        if (model && rawDrop) setNeedsReview('model-choice', true);
        if (model === 'constant') section.querySelector('[data-pn-action="variant-model"]').hidden = false;
      } else if (model !== 'ideal') {
        setFeedback('model-choice', '0.7 V 用在硅管的恒压降近似里。题目指定理想模型，换组参数再判断一次导通压降。');
        setNeedsReview('model-choice', true);
        section.querySelector('[data-pn-action="variant-model"]').hidden = false;
      } else {
        setFeedback('model-choice', '数值不符。检查该模型如何设定导通压降。');
        setNeedsReview('model-choice', true);
        section.querySelector('[data-pn-action="variant-model"]').hidden = false;
      }
    } else if (action === 'variant-model') {
      const card = section.querySelector('[data-pn-task="model-choice"]');
      card.querySelector('#pn-task-1-title').textContent = '8 V 电源、2.2 kΩ 电阻和正向连接的硅二极管。按理想模型估算，二极管两端电压是多少？';
      card.querySelector('input[name="pn-model-choice"][value="ideal"]').checked = false;
      card.querySelector('input[name="pn-model-choice"][value="constant"]').checked = false;
      card.querySelector('[data-pn-input="drop"]').value = '';
      setFeedback('model-choice', '重新选择模型并填写二极管两端电压。');
      button.hidden = true;
    } else if (action === 'check-current') {
      const value = numberIn(section.querySelector('[data-pn-input="current"]').value);
      const expected = state.currentVariant ? 3 : 2.6;
      if (Number.isFinite(value) && Math.abs(value - expected) < 0.03) {
        setFeedback('current-calc', '正确。电阻电流由电阻两端电压和阻值决定。', true); mark('current-calc');
      } else if (!state.currentVariant && Number.isFinite(value) && Math.abs(value - 3.3) < 0.03) {
        setFeedback('current-calc', '你直接用电源电压除以电阻了。先从电源电压中扣除二极管压降。');
        setNeedsReview('current-calc', true);
        section.querySelector('[data-pn-action="variant-current"]').hidden = false;
      } else if (!Number.isFinite(value)) {
        setFeedback('current-calc', '请输入有效数值和单位，例如 1.2 mA。');
        if (section.querySelector('[data-pn-input="current"]').value.trim()) setNeedsReview('current-calc', true);
      } else { setFeedback('current-calc', '结果不符。先求电阻两端的电压，再计算电流。'); setNeedsReview('current-calc', true); section.querySelector('[data-pn-action="variant-current"]').hidden = false; }
    } else if (action === 'variant-current') {
      state.currentVariant = !state.currentVariant;
      section.querySelector('[data-pn-input="current"]').value = '';
      renderCurrentVariant();
      setFeedback('current-calc', '参数已更新，请重新计算。');
      button.hidden = true;
    } else if (action === 'check-circuit') {
      const model = section.querySelector('input[name="pn-circuit-model"]:checked')?.value;
      const rawValue = section.querySelector('[data-pn-input="circuit"]').value.trim();
      const value = numberIn(rawValue);
      const selectedAnode = section.querySelector('input[name="pn-anode-side"]:checked')?.value;
      const expectedModel = state.circuit.kind === 'forward' ? 'constant' : 'ideal';
      const expected = state.circuit.kind === 'forward' ? (state.circuit.voltage - 0.7) / state.circuit.resistance : 0;
      if (!model || !selectedAnode || !rawValue) { setFeedback('circuit-check', '请完成模型选择、阳极侧判断和电流填写。'); return; }
      if (model !== expectedModel) { clearVerification(); setFeedback('circuit-check', '所选模型与题设条件不符。请按题目给出的模型重新计算。'); setNeedsReview('circuit-check', true); section.querySelector('[data-pn-action="variant-circuit"]').hidden = false; return; }
      if (!Number.isFinite(value)) { clearVerification(); setFeedback('circuit-check', '请输入有效数值和单位，例如 1.2 mA。'); setNeedsReview('circuit-check', true); return; }
      if (selectedAnode !== anodeSide()) {
        clearVerification(); setFeedback('circuit-check', state.circuit.kind === 'forward' ? '阳极在 X 侧。沿着符号尖端与竖线的位置再判断一次。' : '阳极在 Y 侧。沿着符号尖端与竖线的位置再判断一次。');
        setNeedsReview('circuit-check', true); return;
      }
      if (Math.abs(value - expected) > 0.03) { clearVerification(); setFeedback('circuit-check', '数值不符。结合二极管状态和所选模型，重算 X、Y 间的电流。'); setNeedsReview('circuit-check', true); section.querySelector('[data-pn-action="variant-circuit"]').hidden = false; return; }
      state.verifiedCircuit = { model, value: rawValue, anode: selectedAnode, kind: state.circuit.kind };
      setFeedback('circuit-check', '模型和电流都正确。写下连接关系与偏置判断，再按自评标准确认。', true);
      section.querySelector('[data-pn-action="confirm-reason"]').disabled = false;
    } else if (action === 'confirm-reason') {
      const model = section.querySelector('input[name="pn-circuit-model"]:checked')?.value;
      const value = section.querySelector('[data-pn-input="circuit"]').value.trim();
      const selectedAnode = section.querySelector('input[name="pn-anode-side"]:checked')?.value;
      const reason = section.querySelector('[data-pn-input="reason"]').value.trim();
      if (!state.verifiedCircuit || state.verifiedCircuit.model !== model || state.verifiedCircuit.value !== value || state.verifiedCircuit.anode !== selectedAnode || state.verifiedCircuit.kind !== state.circuit.kind) {
        clearVerification(); setFeedback('circuit-check', '模型或电流已变化，请重新检查答案。'); return;
      }
      if (!reason) { setFeedback('circuit-check', '先写下判断依据，再按标准自评。'); return; }
      setFeedback('circuit-check', '已记录自评。判断依据与计算结果相互对应。', true); mark('circuit-check');
      section.querySelector('[data-pn-action="variant-circuit"]').hidden = false;
    } else if (action === 'retry') {
      const id = button.dataset.pnId;
      const card = section.querySelector(`[data-pn-task="${id}"]`);
      if (id === 'model-choice') { card.querySelector('[data-pn-input="drop"]').value = ''; card.querySelectorAll('[name="pn-model-choice"]').forEach(input => { input.checked = false; }); setFeedback(id, '重新选择模型并计算电压。'); }
      if (id === 'current-calc') { card.querySelector('[data-pn-input="current"]').value = ''; setFeedback(id, '重新计算电流。'); }
      if (id === 'circuit-check') { card.querySelector('[data-pn-input="circuit"]').value = ''; card.querySelector('[data-pn-input="reason"]').value = ''; setFeedback(id, '重新分析电路状态并说明依据。'); clearVerification(); }
      card.classList.add('is-mastered'); button.textContent = '已掌握 · 再练一次';
    } else if (action === 'variant-circuit') {
      state.circuit = state.circuit.kind === 'reverse'
        ? { voltage: 6.7, resistance: 2, kind: 'forward' }
        : baseCircuit;
      section.querySelector('[data-pn-input="circuit"]').value = '';
      section.querySelector('[data-pn-input="reason"]').value = '';
      setFeedback('circuit-check', '电路条件已更新，请重新分析。');
      renderCircuit();
    }
    updateProgress();
  });
  return updateProgress;
}
