import { extraLabRenderers } from './unit-lab-diagrams.mjs';
import { lessonText } from './lesson-text.mjs';

(() => {
  const W = 560;
  const H = 240;
  const ink = '#264639';
  const green = '#427c60';
  const rust = '#a45140';
  const blue = '#456f91';
  const lineColor = '#bacbbf';
  const light = '#eef5eb';
  const fmt = value => Number(value.toFixed(2));
  const wave = (phase) => Math.cos(phase * 2 * Math.PI);

  function pen(ctx) {
    return {
      path(points, color = ink, thickness = 2.5, dash = []) {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash);
        points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.stroke();
        ctx.setLineDash([]);
      },
      text(text, x, y, color = ink, size = 18, maxWidth = W - x - 6) {
        ctx.fillStyle = color;
        const width = ctx.canvas.width/(devicePixelRatio || 1);
        const fontSize = Math.max(size,Math.min(21,10.5*W/width));
        ctx.font = `600 ${fontSize}px "Microsoft YaHei UI", system-ui, sans-serif`;
        ctx.fillText(text, x, y, maxWidth);
      },
      circle(x, y, radius, color = ink) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      },
      box(x, y, w, h, fill, border = null, radius = 8) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fillStyle = fill;
        ctx.fill();
        if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.stroke(); }
      },
    };
  }

  function arrow(d, from, to, y, color) {
    const sign = Math.sign(to-from);
    d.path([[from,y],[to,y]],color,2.4);
    d.path([[to-9*sign,y-5],[to,y],[to-9*sign,y+5]],color,2.4);
  }

  function resistor(d, a, b, y) {
    const unit = (b-a)/8;
    const points = [[a,y]];
    for(let i=1;i<8;i++) points.push([a+i*unit,y+(i%2 ? -7 : 7)]);
    points.push([b,y]);
    d.path(points);
  }

  function movingPoints(d, points, rate, time, color) {
    const lengths = points.slice(1).map((point,i) => Math.hypot(point[0]-points[i][0], point[1]-points[i][1]));
    const total = lengths.reduce((sum, length) => sum+length,0);
    for (let i=0;i<5;i++) {
      let distance = (time*rate+total*i/5) % total;
      for (const [index, length] of lengths.entries()) {
        if (distance > length) { distance -= length; continue; }
        const [x,y] = points[index];
        const [nextX,nextY] = points[index+1];
        d.circle(x+(nextX-x)*distance/length,y+(nextY-y)*distance/length,3.6,color);
        break;
      }
    }
  }

  function circuit(d, p, state) {
    const { voltage: volts, resistance: r2 } = p;
    const series = state.choice === 'series';
    const i1 = state.open ? 0 : series ? volts/(1+r2) : volts;
    const i2 = state.open ? 0 : series ? i1 : volts/r2;
    const total = series ? i1 : i1+i2;

    d.path([[90,111],[90,50],[164,50]]);
    d.path([[187,50],[240,50]]);
    d.path([[90,133],[90,190],[468,190]]);
    d.path([[70,111],[110,111]],rust,3);
    d.path([[78,133],[102,133]],rust,3);
    d.circle(164,50,3);
    d.circle(187,50,3);
    d.path([[164,50],[187,state.open?33:50]],green,3);
    d.text(`${volts} V`,32,157,rust,17);
    d.text('+',53,116,rust,16);

    if (series) {
      resistor(d,240,306,50);
      d.path([[306,50],[352,50]]);
      resistor(d,352,418,50);
      d.path([[418,50],[468,50],[468,190]]);
      d.text('R₁',260,30);
      d.text('R₂',373,30);
      if (!state.open) {
        arrow(d,368,290,163,green);
        d.text('约定电流方向',249,151,green,16);
        if (state.elapsed) movingPoints(d,[[90,103],[90,50],[468,50],[468,190],[90,190],[90,138]],36+i1*16,state.elapsed,green);
      }
    } else {
      d.path([[240,50],[240,137],[306,137]]);
      d.path([[240,76],[306,76]]);
      resistor(d,306,390,76);
      resistor(d,306,390,137);
      d.path([[390,76],[468,76],[468,190]]);
      d.path([[390,137],[468,137]]);
      d.text('R₁',335,59);
      d.text('R₂',335,120);
      d.circle(240,76,4);
      d.circle(468,137,4);
      if (!state.open) {
        arrow(d,291,366,98,green);
        arrow(d,291,366,160,blue);
      }
      if (!state.open && state.elapsed) {
        for (const [y, current, color] of [[76,i1,green],[137,i2,blue]]) {
          movingPoints(d,[[90,103],[90,50],[240,50],[240,y],[468,y],[468,190],[90,190],[90,138]],36+current*16,state.elapsed,color);
        }
      }
    }
    d.text(state.open ? '回路断开' : '回路闭合',118,221,state.open?rust:green,16);
    return state.open ? `开关断开，电源仍为 ${volts} V，稳态电流为 0 mA。` :
      `总电流 ${fmt(total)} mA。R₁：${fmt(i1)} mA，${fmt(i1)} V。R₂：${fmt(i2)} mA，${fmt(i2*r2)} V。`;
  }

  const sequenceNames = ['left', 'middle', 'right'];
  function sequence(d, state) {
    const chosen = sequenceNames.indexOf(state.choice)-1;
    d.text('列 m',54,35,ink,16);
    d.text('h[0] = 3',165,37);
    d.text('h[1] = −1',350,37);
    const table = [['1 × 3 = 3','1 × (−1) = −1'], ['2 × 3 = 6','2 × (−1) = −2']];
    for (const [row, values] of table.entries()) {
      const y = 56+row*62;
      d.text(row ? 'x[0] = 2' : 'x[−1] = 1',18,y+32,ink,16);
      for (const [column, calculation] of values.entries()) {
        const x = 147+column*185;
        const active = row+column-1 === chosen;
        d.box(x,y,172,53,active?'#dcebd8':'#f7faf5',active?green:lineColor);
        d.text(calculation,x+13,y+32,active?ink:'#607266',16);
      }
    }
    const results = [3,5,-2];
    for(let i=0;i<3;i++) {
      const x = 146+i*121;
      const active = i-1 === chosen;
      d.box(x,188,111,39,active?green:light);
      d.text(`y[${i-1}] = ${results[i]}`,x+10,212,active?'#fff':ink,16);
    }
    return ['n=−1，只有 (−1,0) 相加为 −1，y[−1]=3。','n=0，(−1,1) 和 (0,0) 都有贡献，y[0]=−1+6=5。','n=1，只有 (0,1) 相加为 1，y[1]=−2。'][chosen+1];
  }

  const period = ({ mass, stiffness }) => 2*Math.PI*Math.sqrt(mass/stiffness);
  function spring(d, p) {
    const x = 321+124*wave(p.phase);
    d.path([[35,143],[35,50]],lineColor,4);
    d.path([[28,144],[500,144]],lineColor,2);
    d.path([[321,54],[321,182]],lineColor,1.7,[4,5]);
    d.text('平衡位置',280,206,ink,17);
    d.text('−A',176,178,blue,16);
    d.text('+A',433,178,blue,16);
    const coil = [[35,110],[55,110]];
    const dx = (x-81)/14;
    for (let i=1;i<=14;i++) coil.push([55+i*dx,110+(i%2?-14:14)]);
    coil.push([x-26,110]);
    d.path(coil,green,3);
    d.box(x-26,86,52,57,'#cfe4ce',green);
    if (Math.abs(x-321)>6) {
      const sign = x>321?-1:1;
      const to = x+sign*(20+.30*Math.abs(x-321));
      arrow(d,x,to,62,rust);
      d.text('回复力',Math.min(x,to)-12,44,rust,16);
    }
    const t = period(p);
    const position = fmt(4*wave(p.phase));
    const velocity = fmt(-.04*2*Math.PI/t*Math.sin(p.phase*2*Math.PI));
    return `周期 T=${fmt(t)} s。此刻 x=${position} cm，v=${velocity} m/s。`;
  }

  function slits(d, p, ctx) {
    const fringe = .6/p.gap;
    const sample = y => Math.cos(Math.PI*y/fringe)**2;
    const yPixel = value => 120-value*13;
    const screen = 434;
    const point = yPixel(p.position);
    const holeHalf = 15+20*p.gap;
    const slitTop = 120-holeHalf;
    const slitBottom = 120+holeHalf;
    d.path([[37,120],[113,120]],green,2);
    arrow(d,35,110,120,green);
    d.path([[131,34],[131,slitTop-5]],ink,5);
    d.path([[131,slitTop+5],[131,slitBottom-5]],ink,5);
    d.path([[131,slitBottom+5],[131,206]],ink,5);
    d.text('S₁',85,slitTop-4,blue,16);
    d.text('S₂',85,slitBottom+14,rust,16);
    d.path([[131,120],[screen,120]],lineColor,1.5,[5,5]);
    d.path([[131,slitTop],[screen,point]],blue,2);
    d.path([[131,slitBottom],[screen,point]],rust,2);
    d.text('屏幕',438,28,ink,16);
    for (let y=42;y<=198;y++) {
      const brightness = sample((120-y)/13);
      const color = Math.round(48+201*brightness);
      ctx.fillStyle = `rgb(${color-3},${color},${Math.max(35,color-11)})`;
      ctx.fillRect(screen,y,51,1.5);
    }
    d.path([[screen-11,point],[screen+60,point]],rust,1.6);
    d.circle(screen,point,4.8,rust);
    d.text('P',screen+68,point+5,rust,16);
    d.text('两条光路',229,214,ink,16);
    return `条纹间距 ${fmt(fringe)} mm。此处 Δ/λ≈${fmt(p.position/fringe)}，相对光强约 ${fmt(100*sample(p.position))}%。`;
  }

  function setup(section) {
    const mode = section.dataset.unitLab;
    const canvas = section.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const d = pen(ctx);
    const play = section.querySelector('[data-play]');
    const readout = section.querySelector('[data-reading]');
    const sliders = [...section.querySelectorAll('[data-parameter]')];
    const buttons = [...section.querySelectorAll('[data-choice]')];
    const presets = new Map(buttons.filter(button => button.dataset.values).map(button => [button, JSON.parse(button.dataset.values)]));
    const displays = new Map(sliders.map(input => [input, section.querySelector(`[data-value="${input.dataset.parameter}"]`)]));
    const animate = sliders.find(input => input.dataset.parameter === section.dataset.animate);
    const loop = section.hasAttribute('data-loop');
    const defaults = Object.fromEntries(sliders.map(input => [input.dataset.parameter, Number(input.defaultValue)]));
    const parameters = { ...defaults };
    const defaultChoice = mode === 'sequence' ? 'middle' : mode === 'circuit' ? 'series' : 'center';
    let state = { choice: defaultChoice, elapsed: 0, open: false };
    let frame;
    let lastTime;
    let sweepStart = 0;
    let lastReading;
    const builtIn = {
      circuit: () => circuit(d,parameters,state),
      sequence: () => sequence(d,state),
      spring: () => spring(d,parameters),
      slits: () => slits(d,parameters,ctx),
    };
    const draw = builtIn[mode] ?? (() => extraLabRenderers[mode](d,parameters,ctx));

    function render() {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const scale = devicePixelRatio || 1;
      const w = Math.round(width*scale);
      const h = Math.round(height*scale);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.setTransform(w/W,0,0,h/H,0,0);
      ctx.clearRect(0,0,W,H);
      const text = draw();
      if (lastReading !== text) {
        readout.innerHTML = lessonText(text);
        lastReading = text;
      }
      for (const input of sliders) {
        const id = input.dataset.parameter;
        input.value = parameters[id];
        const value = `${fmt(parameters[id])} ${input.dataset.unitLabel}`.trim();
        const display = displays.get(input);
        if (display.textContent !== value) display.textContent = value;
      }
      for (const button of buttons) {
        const id = button.dataset.choice;
        const preset = presets.get(button);
        const chosen = preset ? Object.entries(preset).every(([key,value]) => parameters[key] === value) : id === state.choice;
        button.setAttribute('aria-pressed', id === 'switch' ? state.open : chosen);
        if (id === 'switch') button.textContent = state.open ? '闭合开关' : '断开开关';
      }
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = undefined;
      play.textContent = play.dataset.startLabel;
      play.setAttribute('aria-pressed','false');
    }

    function choose(id) {
      if (id === 'switch') state.open = !state.open;
      else if (mode === 'slits') {
        state.choice = id;
        parameters.position = id === 'center' ? 0 : .3/parameters.gap;
      } else state.choice = id;
      render();
    }

    function tick(now) {
      const dt = Math.min(.06,(now-lastTime)/1000);
      lastTime = now;
      state.elapsed += dt;
      if (animate) {
        const min = Number(animate.min);
        const span = Number(animate.max)-min;
        const step = Number(animate.step);
        const cycle = (sweepStart+state.elapsed/4)%(loop?1:2);
        const fraction = loop ? cycle : 1-Math.abs(1-cycle);
        const next = min+Math.round(fraction*span/step)*step;
        parameters[animate.dataset.parameter] = fmt(next);
      }
      if (mode === 'spring') parameters.phase = (parameters.phase+dt/(period(parameters)*3)) % 1;
      if (mode === 'slits') {
        const cycle = (state.elapsed % 10)/10;
        parameters.position = -6+12*(1-Math.abs(2*cycle-1));
      }
      if (mode === 'sequence') state.choice = sequenceNames[Math.floor(state.elapsed/1.15)%3];
      render();
      frame = requestAnimationFrame(tick);
    }

    for (const input of sliders) input.addEventListener('input', () => {
      stop();
      const key = input.dataset.parameter;
      parameters[key] = Number(input.value);
      if (mode === 'slits') {
        if (key === 'gap' && state.choice === 'dark') parameters.position = .3/parameters.gap;
        else if (key === 'position') state.choice = null;
      }
      render();
    });
    for (const button of buttons) button.addEventListener('click', () => {
      if (mode !== 'circuit') stop();
      const values = presets.get(button);
      if (values) { Object.assign(parameters,values); render(); }
      else choose(button.dataset.choice);
    });
    if (mode === 'slits') {
      function movePoint(event) {
        const box = canvas.getBoundingClientRect();
        const y = (event.clientY-box.top)*H/box.height;
        parameters.position = Math.max(-6,Math.min(6,fmt((120-y)/13)));
        render();
      }
      canvas.addEventListener('pointerdown', event => {
        const box = canvas.getBoundingClientRect();
        const x = (event.clientX-box.left)*W/box.width;
        if (x < 416 || x > 514) return;
        stop();
        state.choice = null;
        if (event.pointerType === 'mouse') canvas.setPointerCapture(event.pointerId);
        movePoint(event);
      });
      canvas.addEventListener('pointermove', event => {
        if (canvas.hasPointerCapture(event.pointerId)) movePoint(event);
      });
    }
    play.addEventListener('click', () => {
      if (frame) { stop(); return; }
      state.elapsed = 0;
      if (animate) sweepStart = (parameters[animate.dataset.parameter]-Number(animate.min))/(Number(animate.max)-Number(animate.min));
      if (mode === 'slits') state.choice = null;
      lastTime = performance.now();
      play.textContent = '暂停';
      play.setAttribute('aria-pressed','true');
      frame = requestAnimationFrame(tick);
    });
    section.querySelector('[data-reset]').addEventListener('click', () => {
      stop();
      Object.assign(parameters,defaults);
      state = { choice: defaultChoice, elapsed: 0, open: false };
      render();
    });
    const stopHidden = () => { if (!section.getClientRects().length) stop(); };
    window.addEventListener('study-unit-changed', stopHidden);
    window.addEventListener('study-step-changed', stopHidden);
    window.addEventListener('study-view-changed', stopHidden);
    const disclosure = section.closest('details');
    disclosure?.addEventListener('toggle', () => { if (!disclosure.open) stop(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    new ResizeObserver(render).observe(canvas);
    stop();
    render();
  }

  for (const lab of document.querySelectorAll('[data-unit-lab]')) setup(lab);
})();
