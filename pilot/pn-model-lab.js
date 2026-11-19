export function initPnModelLab(root = document) {
  const section = root.querySelector?.('#pn-model-lab');
  if (!section || section.dataset.ready) return;
  section.dataset.ready = 'true';
  const submit = section.querySelector('#pnml-submit');
  const feedback = section.querySelector('#pnml-prediction-feedback');
  const experiment = section.querySelector('#pnml-experiment');
  const readout = section.querySelector('#pnml-readout');
  const chart = section.querySelector('#pnml-chart');
  const explanation = section.querySelector('#pnml-explanation');
  const slider = section.querySelector('#pnml-voltage');
  const supply = section.querySelector('[data-pn-supply]');
  const description = section.querySelector('#pnml-circuit-desc');
  const ownWords = section.querySelector('#pnml-own-words');
  const wordsHint = section.querySelector('#pnml-words-hint');
  const switches = [...section.querySelectorAll('[data-source]')];
  let source = 0.5;

  // Representative Shockley curve: I(0.70 V) is approximately 1 mA.
  const nVt = 0.05;
  const Is = 8.3e-10;
  const resistance = 1000;
  const actualCurrent = vd => Is * (Math.exp(vd / nVt) - 1);
  const solveIntersection = vs => {
    let lo = 0, hi = vs;
    for (let i = 0; i < 70; i++) {
      const mid = (lo + hi) / 2;
      const residual = actualCurrent(mid) - (vs - mid) / resistance;
      if (residual > 0) hi = mid;
      else lo = mid;
    }
    const vd = (lo + hi) / 2;
    return { vd, current: actualCurrent(vd) };
  };
  const fmt = (n, digits = 3) => Number(n.toFixed(digits)).toLocaleString('zh-CN', { maximumFractionDigits: digits });
  const coords = (vd, ma) => [48 + vd * 340, 210 - ma * 34];

  function render() {
    const point = solveIntersection(source);
    const idealI = source / resistance * 1000;
    const fixedI = source > 0.7 ? (source - 0.7) / resistance * 1000 : 0;
    const actualMa = point.current * 1000;
    const fixedVd = fixedI > 0 ? 0.7 : source;
    const [px, py] = coords(point.vd, actualMa);

    supply.textContent = `${source.toFixed(1)} V`;
    description.textContent = `电源为 ${source.toFixed(1)} 伏，正极经一千欧电阻接二极管阳极 A，阴极 K 接回电源负极。电流参考方向从 A 到 K。`;
    slider.setAttribute('aria-valuetext', `${source.toFixed(1)} 伏`);
    readout.innerHTML = `<strong>电源 ${source} V，电阻 1 kΩ</strong><br>
      理想二极管：V<sub>D</sub> ≈ 0 V，I<sub>D</sub> ≈ ${fmt(idealI)} mA。<br>
      0.7 V 恒压降：${fixedI ? `V<sub>D</sub> ≈ 0.70 V，I<sub>D</sub> ≈ ${fmt(fixedI)} mA。` : `${source === 0.7 ? '正好处在导通边界' : '低于 0.7 V，按截止估算'}，I<sub>D</sub> ≈ 0 mA，V<sub>D</sub> ≈ ${source} V。`}<br>
      连续曲线：V<sub>D</sub> ≈ ${fmt(point.vd)} V，I<sub>D</sub> ≈ ${fmt(actualMa)} mA。
      <p class="pnml-change">恒压降模型的电阻压降 V<sub>R</sub> = ${fmt(source - fixedVd)} V</p>`;

    let curve = '';
    const clipV = nVt * Math.log1p(0.005 / Is);
    const curveEnd = Math.min(1, clipV);
    const curveSteps = Math.max(1, Math.ceil(curveEnd * 100));
    for (let i = 0; i <= curveSteps; i++) {
      const vd = curveEnd * i / curveSteps;
      const ma = actualCurrent(vd) * 1000;
      const [x, y] = coords(vd, ma);
      curve += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
    }
    const loadEndX = Math.min(source, 1);
    const [lx0, ly0] = coords(0, source);
    const [lx1, ly1] = coords(loadEndX, Math.max(0, (source - loadEndX) / resistance * 1000));
    const [idealX, idealY] = coords(0, Math.min(5, idealI));
    const [fixedX, fixedY] = coords(fixedVd, fixedI);
    const ticks = [0, 1, 2, 3, 4, 5].map(v => {
      const y = coords(0, v)[1];
      return `<path d="M45 ${y}h4" class="pnml-axis"/><text x="36" y="${y + 4}" text-anchor="end" font-size="11">${v}</text>`;
    }).join('');
    const xTicks = [0, .2, .4, .6, .8, 1].map(v => {
      const x = coords(v, 0)[0];
      return `<path d="M${x} 210v4" class="pnml-axis"/><text x="${x}" y="229" text-anchor="middle" font-size="11">${v.toFixed(1)}</text>`;
    }).join('');
    chart.innerHTML = `<svg class="pnml-chart" viewBox="0 0 420 260" role="img" aria-labelledby="pnml-plot-title pnml-plot-desc">
      <title id="pnml-plot-title">二极管伏安曲线与 ${source.toFixed(1)} V 电源的负载线</title>
      <desc id="pnml-plot-desc">横轴是二极管电压，单位伏；纵轴是电流，单位毫安。代表性二极管曲线和负载线相交于约 ${fmt(point.vd, 3)} 伏、${fmt(actualMa, 3)} 毫安。</desc>
      <path d="M48 40V210H390" fill="none" class="pnml-axis" stroke-width="1.7"/>
      ${[1,2,3,4,5].map(v => `<path d="M48 ${coords(0,v)[1]}H388" class="pnml-gridline"/>`).join('')}
      ${ticks}${xTicks}
      <text x="210" y="253" text-anchor="middle" font-size="12">二极管电压 V<tspan baseline-shift="sub" font-size="9">D</tspan>（V）</text>
      <text transform="translate(13 130) rotate(-90)" text-anchor="middle" font-size="12">电流 I<tspan baseline-shift="sub" font-size="9">D</tspan>（mA）</text>
      <path d="${curve}" fill="none" class="pnml-axis" stroke-width="3"/>
      <path d="M${lx0} ${ly0}L${lx1} ${ly1}" fill="none" class="pnml-load-line" stroke-width="2.5" stroke-dasharray="7 5"/>
      <circle cx="${idealX}" cy="${idealY}" r="4" class="pnml-ideal-mark" stroke="white" stroke-width="1.5"/>
      <rect x="${fixedX - 5}" y="${fixedY - 5}" width="10" height="10" class="pnml-fixed-mark" stroke="white"/>
      <circle cx="${px}" cy="${py}" r="5.5" class="pnml-work-point" stroke="white" stroke-width="1.5"/>
      <text x="${px > 285 ? px - 10 : px + 10}" y="${Math.max(33, py - 10)}" text-anchor="${px > 285 ? 'end' : 'start'}" font-size="12" class="pnml-point-label">${fmt(point.vd)} V, ${fmt(actualMa)} mA</text>
    </svg>`;
    const fixedStatement = fixedI > 0
      ? `0.7 V 恒压降模型给出 ${fmt(fixedI, 3)} mA。`
      : `0.7 V 恒压降模型按截止处理，电流为 0 mA。`;
    explanation.innerHTML = `当前 ${source.toFixed(1)} V 下，理想模型给出 ${fmt(idealI, 3)} mA；${fixedStatement}连续曲线交点约为 ${fmt(actualMa, 3)} mA。${source < 0.7 && source > 0 ? '此时连续曲线显示小电流，恒压降模型将其近似为零。' : ''}电源改变会移动负载线，新的交点同时满足器件伏安关系与回路方程。交点处 V<sub>R</sub> = ${(source - point.vd).toFixed(3)} V，V<sub>D</sub> = ${point.vd.toFixed(3)} V，两者相加为 ${source.toFixed(1)} V。`;
    slider.value = String(source);
    section.querySelectorAll('[data-source]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.source) === source)));
  }

  submit.addEventListener('click', () => {
    const choice = section.querySelector('input[name="pnml-prediction"]:checked');
    if (!choice) {
      feedback.textContent = '先选一个预测，再继续。';
      section.querySelector('input[name="pnml-prediction"]')?.focus();
      return;
    }
    feedback.textContent = choice.value === 'zero'
      ? '已记录。接下来观察曲线交点，看看“约为零”和实际曲线的小电流有什么区别。'
      : '已记录。接下来用负载线与器件曲线的交点检查这个判断。';
    submit.disabled = true;
    section.querySelectorAll('input[name="pnml-prediction"]').forEach(input => { input.disabled = true; });
    experiment.hidden = false;
    render();
    switches[0].focus();
  });
  switches.forEach(button => button.addEventListener('click', () => {
    source = Number(button.dataset.source);
    render();
  }));
  slider.addEventListener('input', () => {
    source = Number(slider.value);
    render();
  });
  section.querySelector('#pnml-check-words')?.addEventListener('click', () => {
    wordsHint.hidden = false;
    if (!ownWords.value.trim()) ownWords.focus();
  });
}
