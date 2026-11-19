import { lessonText } from './lesson-text.mjs';

(() => {
  const pi = Math.PI;
  const sin = Math.sin;
  const cos = Math.cos;
  const sinc = x => x === 0 ? 1 : sin(pi*x)/(pi*x);
  const clip = x => Math.max(-1, Math.min(1, x));
  const pulse = x => Number(x >= 0 && x <= 2);
  const trace = (name, f, kind = 'line') => ({ name, f, kind });
  const model = (x, y, ...traces) => ({ x, y, traces });
  const fetObservation = 1.5;
  const overdrive = (voltage, threshold) => Math.max(voltage - threshold, 0);
  const waveforms = (name, output, amplitude = 1) => {
    const input = x => amplitude*sin(pi*2*x);
    return model([0,2], [-1.75,1.75], trace('输入',input), trace(name,x=>output(input(x))));
  };
  const charts = {
    fet: p => model([0, 3.2], [0, 8], trace('漏电流', x => overdrive(x, p)**2)),
    bjt: p => waveforms('限幅输出', x => clip(-1.45*x), p),
    lowpass: p => model([-1, 1.4], [0, 1.08], trace('增益', x => 1/Math.sqrt(1+(10**x/p)**2)), trace('截止幅度', () => Math.SQRT1_2)),
    opamp: p => waveforms('闭环输出', x => clip(-p*x), 0.45),
    differential: p => model([0,2], [-1.55,1.55], trace('正端输入',x=>p+0.32*sin(2*pi*x)),trace('负端输入',x=>p-0.32*sin(2*pi*x)),trace('差模输出',x=>0.64*sin(2*pi*x))),
    feedback: p => model([0, 30], [0, 32], trace('开环增益', x => x), trace('闭环增益', x => x/(1+p*x))),
    power: p => waveforms('推挽输出', x => Math.sign(x)*Math.max(Math.abs(x)-p, 0)),
    oscillator: p => model([0, 20], [-1.1, 1.1], trace('振荡输出', x => Math.min(1,0.12*p**x)*sin(pi*x)), trace('振幅包络', x => Math.min(1,0.12*p**x))),
    am: p => model([0, 2], [-2.7, 2.7], trace('调幅波形', x => (1+p*cos(2*pi*x))*cos(26*pi*x)), trace('带符号包络', x => 1+p*cos(2*pi*x))),
    shift: p => {
      const x = t => Math.exp(-2*(t+0.55)**2) + 0.45*Math.exp(-5*(t-0.75)**2);
      return model([-4, 4], [0, 1.14], trace('原信号', x), trace('移位信号', t => x(t-p)));
    },
    convolution: p => model([-3, 6], [0, 1.22], trace('x(τ)', pulse), trace('h(t−τ)', x => pulse(p-x)), trace('重叠', x => pulse(x)*pulse(p-x),'area')),
    sinc: p => model([-4, 4], [-0.3, 1.1], trace('实数频谱', x => sinc(p*x))),
    laplace: p => model([0, 4], [0, 12], trace('冲激响应', x => Math.exp(p*x))),
    discrete: p => model([0, 10], [-1.15, 1.15], trace('离散冲激响应', x => p**x,'stems')),
    z: p => model([-1.6, 1.6], [-1.25, 1.25], trace('单位圆上半部', x => Math.sqrt(1-x*x)), trace('单位圆下半部', x => -Math.sqrt(1-x*x)), trace('极点', () => p,'pole')),
    oscillation: p => model([0, 2], [-1.15, 1.15], trace('位移', x => cos(2*pi*x+p*pi/180))),
    wave: p => model([0, 3], [-1.15, 1.15], trace('初始波形', x => cos(2*pi*x)), trace('当前波形', x => cos(2*pi*x-p*pi/180))),
    diffraction: p => model([-3, 3], [0, 1.08], trace('相对光强', x => sinc(p*x)**2,'area')),
    relativity: p => model([0, 4], [0, 15], trace('静止参照', x => x), trace('坐标时间', x => x/Math.sqrt(1-p*p))),
    photoelectric: p => model([0, 8], [0, 8], trace('最大动能', x => x < p ? NaN : x-p)),
  };

  const data = window.chapterData;
  const options = data.experiment;
  const input = document.querySelector('#bias');
  const canvas = document.querySelector('#plot');
  const ctx = canvas.getContext('2d');
  const extraCanvas = document.querySelector('#lab-visualization');
  const field = document.querySelector('#field');
  const summary = document.querySelector('#summary');
  const legend = document.querySelector('#legend');
  const play = document.querySelector('#advance');
  const presets = [...document.querySelectorAll('[data-lab-preset]')];
  const reading = document.querySelector('#lab-readout');
  const notes = document.querySelector('#notes');
  const storageKey = `personal-study-${data.id}-v1`;
  const saveStatus = document.querySelector('#save-status');
  let saved = {};
  let frame;
  let descending = false;
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { saveStatus.textContent = '浏览器未能读取学习记录。'; }

  function save(values) {
    Object.assign(saved, values);
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); }
    catch { saveStatus.textContent = '浏览器未能保存学习记录。'; }
  }

  const lessonState = {
    id: data.id,
    current: () => `${options.label} = ${input.value}`,
    labels: ['图左侧','图中央','图右侧'],
    region: x => Math.min(2, Math.floor(x * 3)),
  };
  const colors = ['#557969', '#9b4b31', '#ba872f'];

  function render() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = devicePixelRatio || 1;
    canvas.width = Math.round(width*ratio);
    canvas.height = Math.round(height*ratio);
    ctx.scale(ratio, ratio);
    const box = { left: 42, top: 20, width: width-58, height: height-56 };
    const value = Number(input.value);
    const series = charts[options.chart](value);
    if (options.chart === 'z') {
      const radius = Math.min(box.width/3.2, box.height/2.5);
      box.left += (box.width-radius*3.2)/2;
      box.width = radius*3.2;
      box.height = radius*2.5;
    }
    const [xmin,xmax] = series.x;
    const [ymin,ymax] = series.y;
    const xp = x => box.left+(x-xmin)*box.width/(xmax-xmin);
    const yp = y => box.top+(ymax-y)*box.height/(ymax-ymin);
    const baseline = yp(Math.max(ymin,0));
    const isConvolution = options.chart === 'convolution';
    const ticks = (min, max) => Array.from({ length: 5 }, (_, i) => min + i * (max - min) / 4);
    const xTicks = isConvolution ? [-2, 0, 2, 4, 6] : ticks(xmin, xmax);
    const yTicks = isConvolution ? [0, .5, 1] : ticks(ymin, ymax);

    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#53635c';
    ctx.strokeStyle = '#dce2d9';
    ctx.lineWidth = 1;
    for (const x of xTicks) {
      ctx.beginPath(); ctx.moveTo(xp(x),yp(ymin)); ctx.lineTo(xp(x),yp(ymax)); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(Number(x.toFixed(1)),xp(x),yp(ymin)+15);
    }
    for (const y of yTicks) {
      ctx.beginPath(); ctx.moveTo(xp(xmin),yp(y)); ctx.lineTo(xp(xmax),yp(y)); ctx.stroke();
      ctx.textAlign='right'; ctx.fillText(Number(y.toFixed(1)),xp(xmin)-5,yp(y)+4);
    }
    ctx.strokeStyle='#83978d';
    ctx.beginPath(); ctx.moveTo(xp(xmin),baseline); ctx.lineTo(xp(xmax),baseline); ctx.stroke();
    ctx.textAlign='left'; ctx.fillText(options.y,box.left,12);
    ctx.textAlign='right'; ctx.fillText(options.x,xp(xmax),height-4);
    ctx.save();
    ctx.beginPath(); ctx.rect(box.left-5,box.top-5,box.width+10,box.height+10); ctx.clip();
    series.traces.forEach(({f,kind}, index) => {
      ctx.strokeStyle=ctx.fillStyle=colors[index];
      ctx.lineWidth=2;
      ctx.setLineDash(isConvolution && index === 1 ? [7, 5] : []);
      if (kind === 'pole') {
        const x=xp(f()), y=yp(0);
        ctx.beginPath(); ctx.moveTo(x-5,y-5); ctx.lineTo(x+5,y+5); ctx.moveTo(x+5,y-5); ctx.lineTo(x-5,y+5); ctx.stroke();
        return;
      }
      ctx.beginPath();
      let previous = false;
      for (let i=0, steps=kind==='stems' ? xmax-xmin : 360; i<=steps; i++) {
        const x=xmin+i*(xmax-xmin)/steps, y=f(x);
        if (!Number.isFinite(y)) { previous=false; continue; }
        if (kind==='stems') { ctx.moveTo(xp(x),baseline); ctx.lineTo(xp(x),yp(y)); }
        else if (previous) ctx.lineTo(xp(x),yp(y));
        else ctx.moveTo(xp(x),yp(y));
        previous=true;
      }
      if (!isConvolution || kind !== 'area') ctx.stroke();
      if (kind==='area') { ctx.lineTo(xp(xmax),baseline); ctx.lineTo(xp(xmin),baseline); ctx.closePath(); ctx.globalAlpha=.17; ctx.fill(); ctx.globalAlpha=1; }
    });
    ctx.restore();
    if (options.chart === 'fet') {
      const x = xp(fetObservation);
      const y = yp(series.traces[0].f(fetObservation));
      ctx.save();
      ctx.strokeStyle = '#53635c';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, box.top + 19);
      ctx.lineTo(x, baseline);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#53635c';
      ctx.textAlign = 'center';
      ctx.fillText('VGS = 1.5 V', x, box.top + 12);
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, 2*pi);
      ctx.fillStyle = colors[0];
      ctx.fill();
      ctx.strokeStyle = '#fffdf8';
      ctx.stroke();
      ctx.restore();
    }
    if (options.chart === 'wave') {
      const crest = xp(1+value/360);
      ctx.fillStyle = '#9b4b31';
      ctx.beginPath();
      ctx.arc(crest,yp(1),4.5,0,2*pi);
      ctx.fill();
    }
    renderExtra(value);
  }

  function renderExtra(value) {
    if (!extraCanvas) return;
    const { width, height } = extraCanvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = devicePixelRatio || 1;
    extraCanvas.width = Math.round(width*ratio);
    extraCanvas.height = Math.round(height*ratio);
    const pen = extraCanvas.getContext('2d');
    pen.scale(ratio,ratio);
    const left = 18;
    const span = width-36;
    if (options.chart === 'diffraction') {
      const x = position => left+(position+3)*span/6;
      for (let pixel=0;pixel<span;pixel++) {
        const intensity = sinc(value*(6*pixel/span-3))**2;
        const shade = Math.round(38+213*intensity**.45);
        pen.fillStyle = `rgb(${shade}, ${shade}, ${Math.max(30,shade-8)})`;
        pen.fillRect(left+pixel,12,1.4,height-28);
      }
      pen.fillStyle = '#9b4b31';
      for (const position of [-1/value,1/value]) pen.fillRect(x(position)-1,height-15,2,9);
      return;
    }
    const x = t => left+(t+1)*span/6;
    const y = output => height-21-output*(height-35)/2;
    pen.strokeStyle = '#b8c8b8';
    pen.beginPath(); pen.moveTo(x(-1),y(0)); pen.lineTo(x(5),y(0)); pen.stroke();
    pen.fillStyle = '#53635c';
    pen.font = '11px system-ui';
    for (let tick=0;tick<=4;tick++) pen.fillText(String(tick),x(tick)-3,height-5);
    pen.strokeStyle = '#397353';
    pen.lineWidth = 2;
    pen.beginPath(); pen.moveTo(x(0),y(0)); pen.lineTo(x(2),y(2)); pen.lineTo(x(4),y(0)); pen.stroke();
    pen.fillStyle = '#9b4b31';
    pen.beginPath(); pen.arc(x(value),y(Math.max(0,2-Math.abs(value-2))),4.5,0,2*pi); pen.fill();
  }

  const fmt = value => Number(value.toFixed(2));
  const readouts = {
    fet: p => `图中标出的 V_GS=${fetObservation} V 处，过驱动 ${fmt(overdrive(fetObservation, p))} V，归一化漏电流 ${fmt(overdrive(fetObservation, p)**2)}。`,
    bjt: p => `输出峰值 ${fmt(Math.min(1,1.45*p))}。${p*1.45 > 1 ? '峰值达到限制，已削顶。' : '输出仍在摆幅范围内。'}`,
    lowpass: p => `在 f=1 处，归一化幅度为 ${fmt(1/Math.sqrt(1+1/p**2))}。−3 dB 点位于 f=${fmt(p)}。`,
    opamp: p => `线性计算的输出峰值 ${fmt(.45*p)}。${.45*p > 1 ? '超过示意摆幅，实际截在 ±1。' : '正弦保持，输出反相。'}`,
    differential: p => `两输入的平均值为 ${fmt(p)}，差模输出峰值保持 0.64。`,
    feedback: p => `开环增益 A=20 时，闭环增益 A_f=${fmt(20/(1+20*p))}。`,
    power: p => `输入幅度低于 ${fmt(p)} 时，输出为零。输出峰值为 ${fmt(1-p)}。`,
    oscillator: p => `第 10 次循环的包络幅度约 ${fmt(Math.min(1,.12*p**10))}。${p === 1 ? '包络不变。' : p < 1 ? '逐次衰减。' : '逐次增长后受稳幅限制。'}`,
    am: p => `带符号包络的最小值 ${fmt(1-p)}，最大值 ${fmt(1+p)}。${p>1?'负谷对应包络翻折。':''}`,
    shift: p => `每个特征点的新时刻 = 原时刻 ${p < 0 ? '−' : '+'} ${fmt(Math.abs(p))}。幅值保持。`,
    convolution: p => {
      const left = Math.max(0,p-2);
      const right = Math.min(2,p);
      const overlap = right > left ? `交集 [${fmt(left)}, ${fmt(right)}]，长度 ${fmt(right-left)}，y(t)=${fmt(right-left)}。` : '没有正长度的交集，y(t)=0。';
      return `t=${fmt(p)}。 ${overlap}`;
    },
    discrete: p => `h[0]=1，h[1]=${fmt(p)}，h[2]=${fmt(p*p)}。`,
    sinc: p => `右侧首零点 f=1/T=${fmt(1/p)}，两首零点之间宽度为 ${fmt(2/p)}。`,
    laplace: p => `t=2 时 h(2)=${fmt(Math.exp(2*p))}。极点 ${p < 0 ? '在左半平面' : p > 0 ? '在右半平面' : '在原点'}。`,
    z: p => `极点模 |p|=${fmt(Math.abs(p))}。${Math.abs(p)<1 ? '因果收敛域包含单位圆，系统稳定。' : '因果收敛域不包含单位圆，系统不稳定。'}`,
    oscillation: p => `初位移 x₀/A=${fmt(cos(p*pi/180))}，初速度 v₀/(Aω)=${fmt(-sin(p*pi/180))}。`,
    wave: p => `已过 ${fmt(p/360)} 个周期，波峰沿 +x 方向移动 ${fmt(p/360)}λ。`,
    diffraction: p => `第一暗点位于 ±${fmt(1/p)}，中央亮纹宽 ${fmt(2/p)}（横轴归一化单位）。`,
    relativity: p => `γ=${fmt(1/Math.sqrt(1-p*p))}。固有时 2 s 对应坐标时间 ${fmt(2/Math.sqrt(1-p*p))} s。`,
    photoelectric: p => p>3 ? '3 eV 小于逸出功，此能量下没有光电子。' : `3 eV 光子能引起逸出，最大动能 ${fmt(3-p)} eV。`,
  };

  function update(persist = true) {
    const value = Number(input.value);
    field.textContent = String(value);
    summary.innerHTML = lessonText(options.observation);
    reading.innerHTML = lessonText(readouts[options.chart](value));
    for (const button of presets) button.setAttribute('aria-pressed', Number(button.dataset.labPreset) === value);
    render();
    if (persist) save({ value });
    input.dispatchEvent(new Event('bias-updated'));
  }

  input.value = Number.isFinite(saved.value) ? saved.value : options.initial;
  legend.replaceChildren(...charts[options.chart](Number(input.value)).traces.map(({name}, index) => {
    const entry = document.createElement('span');
    entry.innerHTML = lessonText(name);
    entry.style.setProperty('--trace', colors[index]);
    if (options.chart === 'convolution' && index === 1) entry.classList.add('trace-dashed');
    return entry;
  }));
  new ResizeObserver(render).observe(canvas);
  input.addEventListener('input', () => { stop(); descending = false; update(); });
  function stop(persist = false) {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = undefined;
    play.textContent = '播放';
    play.setAttribute('aria-pressed', 'false');
    reading.removeAttribute('aria-live');
    if (persist) update();
  }
  function setValue(value) {
    stop();
    descending = false;
    input.value = value;
    update();
  }
  for (const button of presets) button.addEventListener('click', () => setValue(button.dataset.labPreset));
  document.querySelector('#reset-lab').addEventListener('click', () => setValue(options.initial));
  document.querySelector('#draw').addEventListener('click', () => stop(true));
  const stopHidden = () => { if (!canvas.getClientRects().length) stop(true); };
  window.addEventListener('study-unit-changed', stopHidden);
  window.addEventListener('study-step-changed', stopHidden);
  window.addEventListener('study-view-changed', stopHidden);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(true); });
  play.setAttribute('aria-pressed', 'false');
  play.addEventListener('click', () => {
    if (frame) { stop(true); return; }
    play.textContent = '暂停';
    play.setAttribute('aria-pressed', 'true');
    reading.setAttribute('aria-live', 'off');
    const span = options.max - options.min;
    const fraction = (Number(input.value) - options.min) / span;
    const wraps = options.chart === 'wave';
    const startPhase = wraps ? fraction : descending ? 1 - fraction / 2 : fraction / 2;
    const start = performance.now();
    function tick(now) {
      const cycle = (startPhase + Math.max(0, now - start) / 8000) % 1;
      descending = !wraps && cycle >= .5;
      const fraction = wraps ? cycle : 1 - Math.abs(2 * cycle - 1);
      const previous = input.value;
      input.value = options.min + fraction * span;
      if (input.value !== previous) update(false);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  });
  notes.value = saved.notes ?? '';
  notes.addEventListener('input', () => save({notes:notes.value}));
  const quiz = document.querySelector('#quiz');
  const result = document.querySelector('#quiz-result');
  function showAnswer(value) {
    result.innerHTML = lessonText(`${value === 'correct' ? '答对了。' : '这题可以再看一遍。'}${data.quiz[3]}`);
  }
  if (quiz) {
    if (saved.answer) { quiz.elements.choice.value = saved.answer; showAnswer(saved.answer); }
    quiz.addEventListener('submit', event => {
      event.preventDefault();
      const value = quiz.elements.choice.value;
      showAnswer(value);
      save({answer:value});
    });
    document.querySelector('#retry').addEventListener('click', () => {
      quiz.reset(); result.textContent=''; save({answer:null});
    });
  }
  document.querySelector('#review').hidden=false;
  update(false);
  window.chapterRuntime = { lessonState, input, field, summary, saved, save, junction: canvas.parentElement };
})();
