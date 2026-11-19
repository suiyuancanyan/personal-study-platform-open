const ink = '#264639';
const green = '#427c60';
const blue = '#456f91';
const rust = '#a45140';
const grid = '#d7e2d7';
const pale = '#edf5eb';
const number = (value, digits = 2) => Number(value.toFixed(digits));

function arrow(d, x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2-y1,x2-x1);
  const tips = [angle-.48,angle+.48].map(a => [x2-8*Math.cos(a),y2-8*Math.sin(a)]);
  d.path([[x1,y1],[x2,y2]],color,2);
  d.path([tips[0],[x2,y2],tips[1]],color,2);
}

function loadline(d, { base, collector }) {
  const freeCurrent = base*.1;
  const maximum = 9.8/collector;
  const current = Math.min(freeCurrent,maximum);
  const voltage = 10-current*collector;
  const x = v => 64+v*41;
  const y = i => 176-i*13;
  for (const tick of [0,2,4,6,8,10]) {
    d.path([[x(tick),y(0)],[x(tick),y(10)]],grid,1);
    d.path([[x(0),y(tick)],[x(10),y(tick)]],grid,1);
    d.text(tick,x(tick)-4,198,ink,14);
    d.text(tick,38,y(tick)+5,ink,14);
  }
  d.path([[x(0),y(10)],[x(0),y(0)],[x(10),y(0)]],ink,1.5);
  d.text('I_C (mA)',59,29,ink,16);
  d.text('V_CE (V)',482,170,ink,15);
  d.path([[x(0),y(10/collector)],[x(10),y(0)]],green,3);
  d.path([[x(.2),y(0)],[x(.2),y(maximum)]],rust,1.5,[5,4]);
  d.path([[x(voltage),y(current)],[x(voltage),y(0)]],blue,1.5,[4,4]);
  d.circle(x(voltage),y(current),6,rust);
  d.text('Q',voltage>9?x(voltage)-23:x(voltage)+11,y(current)-8,rust,18);
  const from = x(.2);
  const to = x(10);
  const at = x(voltage);
  if (at-from>2) d.path([[from,219],[at,219]],rust,4);
  if (to-at>2) d.path([[at,219],[to,219]],blue,4);
  d.text('饱和侧',58,235,rust,13);
  d.text('截止侧',425,235,blue,13);
  const region = base === 0 ? '截止' : freeCurrent>=maximum ? '到达饱和边界或进入饱和' : '放大区';
  return `${region}。Q 点为 V_CE≈${number(voltage)} V、I_C≈${number(current)} mA。低端余量 ${number(voltage-.2)} V，高端余量 ${number(10-voltage)} V。`;
}

function zigzag(d, start, end, height) {
  const length = (end-start)/8;
  const points = [[start,height]];
  for (let i=1;i<8;i++) points.push([start+i*length,height+(i%2?-6:6)]);
  points.push([end,height]);
  d.path(points);
}

function opampNode(d, { input, reference }) {
  const ideal = 3*reference-2*input;
  const out = Math.max(-5,Math.min(5,ideal));
  const minus = (2*input+out)/3;
  const current = (input-minus)/10;
  const limited = out !== ideal;
  d.path([[65,97],[125,97]]);
  zigzag(d,125,192,97);
  d.path([[192,97],[303,97]]);
  d.path([[303,74],[303,171],[405,124],[303,74]],green,3);
  d.path([[189,150],[303,150]]);
  d.path([[405,124],[486,124],[486,39],[369,39]]);
  zigzag(d,295,369,39);
  d.path([[295,39],[251,39],[251,97]]);
  d.circle(251,97,4.8,rust);
  d.circle(451,124,3.6,green);
  d.text('−',314,103,ink,20);
  d.text('+',314,154,ink,18);
  d.text('10 kΩ',129,77,ink,15);
  d.text('20 kΩ',305,23,ink,15);
  d.text(`V_in=${number(input)} V`,31,119,blue,17);
  d.text(`V_+=${number(reference)} V`,177,177,green,17);
  d.text(`V_−=${number(minus)} V`,205,119,rust,15);
  d.text(`V_o=${number(out)} V`,421,154,limited?rust:green,17);
  if (Math.abs(current)>.001) {
    const right = current>0;
    arrow(d,right?128:181,114,right?181:128,114,blue);
    arrow(d,right?302:358,54,right?358:302,54,blue);
  }
  d.box(69,189,423,36,limited?'#f8e9e2':pale);
  d.text(limited ? '输出碰到电源限制，虚短失效' : '负反馈在线性区，两个输入端近似等电位',84,213,limited?rust:green,17);
  return `线性试算 V_o=${number(ideal)} V，实际 V_o=${number(out)} V，V_−=${number(minus)} V。输入支路电流 ${number(current,3)} mA（指向求和点为正）。`;
}

function stepWindow(d, { start, end, height, time }) {
  const x = t => 101+(t+3)*45.5;
  const edge = x(6);
  const startX = x(start);
  const endX = x(end);
  const levels = [47,86,141,203];
  for (const y of levels) d.path([[x(-3),y],[edge,y]],grid,1.4);
  const valueY = 141-height*10;
  d.path([[x(-3),47],[startX,47],[startX,29],[edge,29]],green,2.5);
  d.path([[x(-3),86],[endX,86],[endX,68],[edge,68]],blue,2.5);
  d.path([[x(-3),141],[startX,141],[startX,valueY],[endX,valueY],[endX,141],[edge,141]],ink,2.5);
  d.text('u(t−a)',17,49,green,16);
  d.text('u(t−b)',17,88,blue,16);
  d.text('x(t)',38,145,ink,17);
  d.text('x′(t)',34,206,rust,17);
  d.path([[x(time),18],[x(time),214]],rust,1.4,[4,5]);
  const active = time>=start && time<end;
  d.circle(x(time),active?valueY:141,4.8,rust);
  if (height) {
    arrow(d,startX,203,startX,203-height*6,rust);
    arrow(d,endX,203,endX,203+height*6,blue);
  }
  d.text('a',startX-5,234,green,16);
  d.text('b',endX-5,234,blue,16);
  d.text('t (s)',516,234,ink,14);
  return `t=${number(time)} s 时，x(t)=${active?height:0}。窗口宽 ${number(end-start)} s，有符号面积 ${number(height*(end-start))}。两个冲激权重分别为 ${height}、${-height}。`;
}

function alias(d, { frequency, rate }) {
  const folded = Math.abs(frequency-rate*Math.round(frequency/rate));
  const x = t => 51+t*39;
  const y = value => 114-value*58;
  for (let t=0;t<=12;t+=2) {
    d.path([[x(t),y(1.14)],[x(t),y(-1.14)]],grid,1);
    d.text(t,x(t)-5,202,ink,14);
  }
  d.path([[x(0),y(0)],[x(12),y(0)]],grid,1.2);
  d.path([[x(0),y(1.14)],[x(0),y(-1.14)]],ink,1.5);
  const curve = hz => Array.from({length:391},(_,i)=>{
    const time = i*12/390;
    return [x(time),y(Math.cos(2*Math.PI*hz*time/1000))];
  });
  d.path(curve(frequency),green,2.5);
  if (folded!==frequency) d.path(curve(folded),blue,2.4,[5,4]);
  for (let n=0;n<=Math.floor(rate*.012);n++) {
    const ms = n*1000/rate;
    d.circle(x(ms),y(Math.cos(2*Math.PI*frequency*n/rate)),4.8,rust);
  }
  d.text('时间 (ms)',461,221,ink,15);
  d.text('原信号',55,31,green,17);
  if (folded!==frequency) d.text('折回后的余弦',159,31,blue,17);
  d.text('采样点',374,31,rust,17);
  return `采样间隔 ${number(1000/rate,3)} ms，奈奎斯特频率 ${rate/2} Hz。样本等效频率 ${folded} Hz${folded===frequency?'，当前频率保持。':'，两条连续曲线在红点处重合。'}`;
}

function film(d, { thickness, substrate }) {
  const matched = substrate===1.4;
  const flipped = substrate>1.4;
  const bottom = 106+Math.min(67,thickness*.16);
  const phase = 2*Math.PI*(2*1.4*thickness/560)+(flipped?0:Math.PI);
  const intensity = number(100*(1+Math.cos(phase))/2);
  d.box(39,77,305,bottom-77,'#edf4e9');
  d.box(39,bottom,305,46,'#e8edf2');
  d.path([[40,77],[344,77]],grid,1.5);
  d.path([[40,bottom],[344,bottom]],grid,1.5);
  d.text('空气 1.0',49,66,ink,15);
  d.text('薄膜 1.4',49,99,green,15);
  d.text(`底层 ${substrate}`,49,bottom+28,blue,15);
  arrow(d,112,21,158,77,ink);
  arrow(d,158,77,209,20,green);
  if (!matched) {
    const end = 172+(bottom-77)*.55;
    const exit = end+(bottom-77)*.45;
    d.path([[158,77],[end,bottom],[exit,77]],blue,2.6);
    arrow(d,exit,77,exit+45,22,blue);
  }
  d.text('上反射',220,20,green,15);
  if (!matched) d.text('下反射',290,42,blue,15);
  d.text('两束光的相对相位',369,38,ink,17);
  const cy=116;
  function phaseDial(cx, angle, color, label) {
    d.box(cx-43,cy-43,86,86,pale,grid,43);
    d.path([[cx-41,cy],[cx+41,cy]],grid,1.3);
    d.path([[cx,cy-41],[cx,cy+41]],grid,1.3);
    arrow(d,cx,cy,cx+31*Math.cos(angle),cy-31*Math.sin(angle),color);
    d.circle(cx,cy,3.2,ink);
    d.text(label,cx-24,180,color,15);
  }
  phaseDial(391,0,green,'上反射');
  if (!matched) phaseDial(498,phase,blue,'下反射');
  d.text(matched?'下界面无反射':'两束等幅示意',387,216,ink,15);
  return matched ? '膜与底层折射率相同。下界面无反射，这里只画上反射，不能用双束明暗条件。' :
    `传播相差为 ${number(2*1.4*thickness/560)} 周。${flipped?'两束都反转，相对额外相差为零。':'只有上反射翻转，相对多半周。'}等幅示意光强 ${intensity}%。`;
}

function polarizers(d, { angle }) {
  const cos = Math.cos(angle*Math.PI/180);
  const sin = Math.sin(angle*Math.PI/180);
  const power = [1,.5,.5*cos*cos,.5*cos*cos*sin*sin];
  const centers = [128,281,434];
  const y = 89;
  for (const [index, value] of power.entries()) {
    const start = index ? centers[index-1]+33 : 42;
    const end = index===3 ? 520 : centers[index]-33;
    if (value>1e-10) d.path([[start,y],[end,y]],['#8d794a',green,blue,rust][index],2+value*6);
    else d.path([[start,y],[end,y]],grid,1.5,[4,4]);
  }
  for (const [index, tilt] of [0,angle,90].entries()) {
    const x = centers[index];
    d.box(x-32,57,64,64,pale,grid,32);
    const r = 23;
    const dx = r*Math.sin(tilt*Math.PI/180);
    const dy = r*Math.cos(tilt*Math.PI/180);
    d.path([[x-dx,y-dy],[x+dx,y+dy]],green,3);
    d.text(`${tilt}°`,x-15,145,ink,17);
  }
  for (const [i, value] of power.entries()) {
    const x = 24+i*135;
    d.box(x,178,112,11,pale);
    if (value>1e-10) d.box(x,178,112*value,11,['#8d794a',green,blue,rust][i],null,5);
    d.text(['入射','第一片后','第二片后','第三片后'][i],x,168,ink,14);
    d.text(`${number(value*100)}% I₀`,x,213,ink,15);
  }
  return `第一片后 ${number(power[1]*100)}%，第二片后 ${number(power[2]*100)}%，第三片后 ${number(power[3]*100)}%（均相对于入射光强）。`;
}

function tailSplit(d, { difference, tail }) {
  const ratio = 1/(1+Math.exp(-difference/26));
  const left = tail*ratio;
  const right = tail-left;
  const branches = [{x:164,share:ratio,current:left,color:green,title:'左支路'}, {x:392,share:1-ratio,current:right,color:blue,title:'右支路'}];
  for(const {x,share,current,color,title} of branches) {
    d.text(title,x-23,29,color,17,120);
    d.box(x-38,45,79,72,pale,grid);
    if (share>.001) d.box(x-29,107-53*share,61,53*share,color,null,4);
    d.text(`${number(current)} mA`,x+47,91,color,16,93);
    arrow(d,x,121,x,149,color);
    d.path([[x,149],[x,161],[280,161]],color,1.8+3*share);
  }
  d.circle(280,161,5,ink);
  arrow(d,280,166,280,196,rust);
  d.text(`尾电流 ${number(tail)} mA`,304,197,rust);
  d.text('两支路相加',123,197,ink,16,133);
  return `左支路 ${number(left)} mA（${number(ratio*100,1)}%），右支路 ${number(right)} mA（${number((1-ratio)*100,1)}%）。合计 ${number(tail)} mA。`;
}

function lcEnergy(d, { inductance, capacitance, phase }) {
  const angle = 2*Math.PI*phase;
  const charge = Math.cos(angle);
  const current = Math.sin(angle);
  const frequency = 1/(2*Math.PI*Math.sqrt(inductance*capacitance*1e-9));
  d.path([[178,62],[96,62],[96,153],[155,153]],ink,2.5);
  d.path([[196,62],[278,62],[278,153],[219,153]],ink,2.5);
  d.path([[178,42],[178,82]],blue,4);
  d.path([[196,42],[196,82]],blue,4);
  const coil = [];
  for(let n=0;n<=56;n++)coil.push([155+64*n/56,153-9*Math.abs(Math.sin(Math.PI*n/14))]);
  d.path(coil,green,2.7);
  d.text('电容 C',159,29,blue,16,88);
  d.text('线圈 L',159,182,green,16,88);
  if (Math.abs(charge)>.05) {
    d.text(charge>0?'+':'−',151,49,rust,20);
    d.text(charge>0?'−':'+',209,49,rust,20);
  }
  if (Math.abs(current)>.05) {
    const start = current>0 ? 111 : 251;
    const end = current>0 ? 251 : 111;
    arrow(d,start,111,end,111,rust);
    d.text('常规电流',147,100,rust,16,102);
  }
  const electric = charge*charge;
  const magnetic = current*current;
  for (const [index,value] of [electric,magnetic].entries()) {
    const y = 78+index*69;
    const color = index ? green : blue;
    d.text(index?'磁场能':'电场能',333,y-11,color,16,110);
    d.box(333,y,164,14,pale,grid,6);
    if(value>.0001) d.box(333,y,164*value,14,color,null,6);
    d.text(`${number(value*100)}%`,504,y+12,color,15);
  }
  return `f₀≈${number(frequency)} Hz。q/Q₀=${number(charge)}，I/I₀=${number(current)}。电场能 ${number(electric*100)}%，磁场能 ${number(magnetic*100)}%。`;
}

function movingFringes(d, { added }, ctx) {
  const left=105,right=522,spacing=80,origin=(left+right)/2;
  const shift=-added*spacing;
  for(const [index,y] of [65,139].entries()) {
    const center = origin+(index ? shift : 0);
    for(let x=left;x<=right;x++){
      const power=Math.cos(Math.PI*(x-center)/spacing)**2;
      const shade=Math.round(34+210*power**.48);
      ctx.fillStyle=`rgb(${shade-3},${shade},${Math.max(25,shade-8)})`;
      ctx.fillRect(x,y-17,1.3,34);
    }
    d.path([[center,y-23],[center,y+23]],rust,2.5);
    d.text(index?'加片后':'加片前',23,y+5,ink,17,76);
  }
  d.path([[origin,32],[origin,169]],blue,1.8,[5,4]);
  d.text('原中心',origin-22,25,blue,16,92);
  if(added>0)arrow(d,origin,181,origin+shift,181,rust);
  d.text('A 侧',left,218,ink,16,78);
  d.text('红线：总光程差为零',232,218,rust,16,193);
  d.text('B 侧',484,218,ink,16,67);
  const intensity = number(100*Math.cos(Math.PI*added)**2);
  const location = added===0 ? '留在原中心' : `向 A 侧移动 ${number(2*added)} mm`;
  return `零级${location}。原中心的相对光强约 ${intensity}%（两缝等强）。`;
}

function comptonMotion(d, { angle, wavelength }) {
  const theta = angle*Math.PI/180;
  const change = 2.42631*(1-Math.cos(theta));
  const outgoing = wavelength+change;
  const energy = 1239.84*(1/wavelength-1/outgoing);
  const ex = 1/wavelength-Math.cos(theta)/outgoing;
  const ey = Math.sin(theta)/outgoing;
  const length = Math.hypot(ex,ey);
  const x = 255, y = 115;
  d.path([[x,y],[493,y]],grid,1.5,[5,4]);
  arrow(d,51,y+3,x-7,y+3,green);
  d.circle(x,y,5.5,ink);
  const photonStartY = y-6;
  const px = x+88*Math.cos(theta),py = photonStartY-88*Math.sin(theta);
  arrow(d,x,photonStartY,px,py,blue);
  if(length>1e-10)arrow(d,x,y+5,x+105*ex/length,y+5+105*ey/length,rust);
  d.text('入射光子',66,155,green,16,120);
  d.text('散射光子',Math.max(45,Math.min(441,px-36)),Math.max(22,py-13),blue,16,112);
  d.text(length>1e-10?'反冲电子':'无动量转移',398,176,rust,16,133);
  d.text(`θ=${angle}°`,396,53,blue,17,125);
  d.text('电子初始静止',186,220,ink,16,168);
  return `波长增加 ${number(change,3)} pm，出射波长 ${number(outgoing,3)} pm。电子获得约 ${number(energy,3)} keV 的动能。`;
}

function diodeLoad(d, { voltage, resistance }) {
  const on = voltage > .7;
  const drop = Math.min(voltage, .7);
  const current = Math.max(0, voltage - drop)/resistance;
  const x = v => 113 + v*62;
  const y = i => 205 - i*15;
  d.path([[84,47],[84,27],[179,27]]);
  zigzag(d,179,265,27);
  d.path([[265,27],[342,27],[342,47]]);
  d.path([[342,47],[342,72],[84,72],[84,56]]);
  d.path([[68,47],[100,47]],rust);
  d.path([[75,56],[93,56]],rust);
  d.box(329,29,26,30,'#fff');
  d.path([[332,33],[352,33],[342,47],[332,33]],green,2.5);
  d.path([[332,49],[352,49]],green,2.5);
  d.path([[342,49],[342,64]]);
  d.text(`${number(voltage)} V`,23,53,rust,17);
  d.text(`${number(resistance)} kΩ`,195,20,ink,15);
  d.text(on ? '正向导通' : voltage === .7 ? '导通临界' : '截止',388,52,on?green:ink,18);
  if (on) arrow(d,111,36,165,36,blue);
  d.path([[x(0),y(5.5)],[x(0),y(0)],[x(6),y(0)]],ink,1.5);
  for (const v of [0,2,4,6]) {
    d.path([[x(v),y(0)],[x(v),y(5.2)]],grid,1);
    d.text(v,x(v)-3,225,ink,14);
  }
  for (const i of [2,4]) {
    d.path([[x(0),y(i)],[x(6),y(i)]],grid,1);
    d.text(i,x(0)-22,y(i)+4,ink,14);
  }
  d.text('I (mA)',31,121,ink,15);
  d.text('电源 (V)',493,213,ink,14);
  d.path([[x(.7),y(0)],[x(.7),y(5.5)]],rust,1.4,[4,4]);
  d.text('0.7 V',x(.7)+5,124,rust,15);
  d.path([[x(0),y(0)],[x(.7),y(0)],[x(6),y(5.3/resistance)]],green,3);
  d.circle(x(voltage),y(current),5.5,rust);
  return `二极管压降 ${number(drop)} V，电阻压降 ${number(voltage-drop)} V，支路电流 ${number(current)} mA。`;
}

const overlapWidth = t => Math.max(0, Math.min(2,t) - Math.max(0,t-1));
function overlapPractice(d, { time }) {
  const x = t => 101 + (t+1.5)*83;
  const y = value => 205 - value*25;
  const left = Math.max(0,time-1);
  const right = Math.min(2,time);
  const width = overlapWidth(time);
  const fixedY = 48;
  const movingY = 79;
  d.text('x(τ)',24,fixedY+5,green,16);
  d.text('h(t−τ)',18,movingY+5,blue,16);
  if (width) d.box(x(left),32,x(right)-x(left),60,'#f1dacb',null,2);
  d.path([[x(-1.5),fixedY+10],[x(0),fixedY+10],[x(0),fixedY-9],[x(2),fixedY-9],[x(2),fixedY+10],[x(3.5),fixedY+10]],green,2.6);
  d.path([[x(-1.5),movingY+8],[x(time-1),movingY+8],[x(time-1),movingY-7],[x(time),movingY-7],[x(time),movingY+8],[x(3.5),movingY+8]],blue,2.6);
  d.text('τ (s)',486,109,ink,15);
  d.text('y(t)',30,158,green,16);
  d.text('2',81,y(2)+5,ink,15);
  d.path([[x(-1.5),y(2)],[x(3.5),y(2)]],grid,1.4,[4,4]);
  d.path([[x(-1.5),y(0)],[x(3.5),y(0)]],grid,1.4);
  for (const t of [-1,0,1,2,3]) {
    d.path([[x(t),94],[x(t),99]],grid,1.4);
    d.text(t,x(t)-5,112,ink,14);
    d.path([[x(t),y(0)],[x(t),y(0)+5]],grid,1.4);
    d.text(t,x(t)-5,225,ink,14);
  }
  d.path([-1.5,0,1,2,3,3.5].map(t => [x(t),y(2*overlapWidth(t))]),green,2.8);
  d.path([[x(time),y(0)],[x(time),y(2*width)]],rust,1.4,[3,4]);
  d.circle(x(time),y(2*width),5.5,rust);
  d.text('t (s)',484,225,ink,15);
  const interval = width ? `重叠 [${number(left)}, ${number(right)}] s` : '无正长度重叠';
  return `t=${number(time)} s。滑动区间 [${number(time-1)}, ${number(time)}] s，${interval}。长度 ${number(width)} s，y(t)=${number(2*width)}。`;
}

function halfWavePractice(d, { position }) {
  // With the exercise parameters, each millimeter adds one half-wavelength.
  const bands = position;
  const whole = Math.floor(bands);
  const x = mm => 106 + mm*65;
  const y = intensity => 202 - 76*intensity;
  const relative = mm => mm === 0 ? 1 : (Math.sin(Math.PI*mm/2)/(Math.PI*mm/2))**2;
  const colors = ['#b7d5bf','#e8bbaa'];
  d.text('单缝',29,64,ink,16);
  d.box(x(0),35,x(6)-x(0),43,'#e7f0e5',grid,2);
  if (bands > 0) {
    for (let i = 0; i < Math.ceil(bands); i++) {
      const left = x(6*i/bands);
      const right = x(6*Math.min(bands,i+1)/bands);
      d.box(left,35,right-left,43,colors[i%2],null,0);
      if (right-left > 24) d.text(i+1,(left+right)/2-5,63,ink,16);
    }
  }
  d.text('同相端',x(0),98,ink,14);
  d.text(`相差 ${number(bands/2,3)} λ`,x(6)-108,98,rust,15);
  d.text('相对光强',22,129,ink,15);
  d.path([[x(0),y(1)],[x(6),y(1)]],grid,1,[4,4]);
  d.path([[x(0),y(1)],[x(0),y(0)],[x(6),y(0)]],ink,1.4);
  d.path(Array.from({length:121}, (_, i) => [x(i/20),y(relative(i/20))]),green,2.7);
  for (const mm of [0,2,4,6]) {
    d.path([[x(mm),y(0)],[x(mm),y(0)+4]],ink,1.4);
    d.text(mm,x(mm)-4,222,ink,14);
  }
  d.text('y (mm)',497,222,ink,14);
  d.path([[x(position),111],[x(position),y(0)]],rust,1.4,[4,4]);
  d.circle(x(position),y(relative(position)),5,rust);
  const rest = bands - whole;
  const remainder = rest > 1e-9 ? `，另有 ${number(rest)} 带余段` : '';
  return `y=${number(position)} mm，边缘路差 ${number(bands/2,3)} λ。完整半波带 ${whole} 个${remainder}，相对光强 ${number(relative(position)*100,2)}%。`;
}

export const extraLabRenderers = {
  loadline, opampNode, stepWindow, alias, film, polarizers, tailSplit, lcEnergy, movingFringes, comptonMotion,
  diodeLoad, overlapPractice, halfWavePractice,
};
