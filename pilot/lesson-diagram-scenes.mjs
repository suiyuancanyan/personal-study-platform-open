
const ink = '#345445';
const green = '#397353';
const blue = '#466e96';
const rust = '#9b4f40';
const gray = '#627369';
const grid = '#c9d8cd';
const pale = '#edf5eb';
const lightBlue = '#eaf0f6';
const lightRose = '#f8ede8';

function box(p,x,y,width,height,fill=pale,border=grid,radius=7) {
  const {ctx}=p;
  ctx.beginPath();
  ctx.roundRect(x,y,width,height,radius);
  ctx.fillStyle=fill;
  ctx.fill();
  if (border) {
    ctx.strokeStyle=border;
    ctx.lineWidth=1.25;
    ctx.stroke();
  }
}

function ring(p,x,y,radius,color=ink,fill=null) {
  const {ctx}=p;
  ctx.beginPath();
  ctx.arc(x,y,radius,0,2*Math.PI);
  if(fill) {ctx.fillStyle=fill;ctx.fill();}
  ctx.strokeStyle=color;
  ctx.lineWidth=1.8;
  ctx.stroke();
}

function mark(p,x,y,color=rust) {
  p.line([[x-4,y-4],[x+4,y+4]],color,2);
  p.line([[x-4,y+4],[x+4,y-4]],color,2);
}

function trace(p,x0,x1,y,amplitude,fn,color=green) {
  p.line(Array.from({length:241},(_,index)=>{
    const t=index/240;
    return [x0+t*(x1-x0),y-amplitude*fn(t)];
  }),color,2.3);
}

function element(p,kind,x1,y1,x2,y2) {
  const dx=x2-x1,dy=y2-y1;
  const length=Math.hypot(dx,dy);
  const point=(t,d=0)=>[x1+dx*t-dy*d/length,y1+dy*t+dx*d/length];
  if(kind==='R') {
    const pins=[point(0)];
    for(let i=1;i<8;i++)pins.push(point(i/8,i%2?-5:5));
    pins.push(point(1));
    p.line(pins,ink);
  } else {
    p.line([point(0),point(.44)],ink);
    p.line([point(.56),point(1)],ink);
    p.line([point(.44,-11),point(.44,11)],ink);
    p.line([point(.56,-11),point(.56,11)],ink);
  }
}

function ground(p,x,y) {
  p.line([[x,y],[x,y+7]],gray,1.7);
  p.line([[x-11,y+7],[x+11,y+7]],gray,1.7);
  p.line([[x-7,y+12],[x+7,y+12]],gray,1.7);
  p.line([[x-3,y+16],[x+3,y+16]],gray,1.7);
}

function block(p,x,y,width,height,text,fill=pale,color=ink) {
  box(p,x,y,width,height,fill);
  p.label(text,x+9,y+height*.5+6,color,width-18);
}

function holes(p) {
  const x=[186,264,342,420,498];
  for(const [row,y] of [63,140].entries()){
    p.line([[x[0],y],[x.at(-1),y]],grid,1.3);
    const empty=row?2:3;
    for(const [index,pos] of x.entries()) {
      if(index===empty)ring(p,pos,y,10,rust,'#fffefa');
      else {
        ring(p,pos,y,10,green,pale);
        p.dot(pos,y,green);
      }
    }
  }
  p.label('补位前',60,69,ink);
  p.label('补位后',60,146,ink);
  p.arrow(345,96,417,96,green);
  p.label('电子向右',347,85,green);
  p.arrow(418,183,343,183,rust);
  p.label('空穴等效向左',432,189,rust);
}

function mosTerminals(p) {
  box(p,101,113,398,68,lightRose);
  box(p,125,111,94,37,lightBlue,grid,4);
  box(p,381,111,94,37,lightBlue,grid,4);
  box(p,215,111,170,12,'#96c3a6',null,2);
  box(p,228,93,144,13,'#f4e3b6',null,2);
  box(p,238,77,124,15,pale,green,2);
  p.line([[171,42],[171,111]],ink,2.5);
  p.line([[300,42],[300,77]],ink,2.5);
  p.line([[428,42],[428,111]],ink,2.5);
  p.label('源 S',145,33,blue);
  p.label('栅 G',274,33,ink);
  p.label('漏 D',403,33,blue);
  p.label('栅氧化层',377,99,rust);
  p.label('n⁺',155,135,blue);
  p.label('n⁺',415,135,blue);
  p.label('P 型衬底',255,170,rust);
  p.label('导通时形成的表面沟道',237,145,green,144);
}

function transistor(p,x,y,scale=1,mirror=false) {
  const q=(a,b)=>[x+a*scale*(mirror?-1:1),y+b*scale];
  p.line([q(-37,0),q(-14,0)],ink);
  p.line([q(-14,-22),q(-14,22)],ink,3);
  p.line([q(-14,-10),q(16,-30),q(16,-46)],ink);
  p.line([q(-14,10),q(16,30),q(16,46)],ink);
  p.arrow(...q(-4,17),...q(12,28),rust);
}

function bjtTerminals(p) {
  ring(p,290,106,62,grid,pale);
  transistor(p,290,106,1.35);
  p.line([[154,106],[240,106]],ink);
  p.line([[312,24],[312,44]],ink);
  p.line([[312,168],[312,186]],ink);
  p.arrow(159,84,223,84,green);
  p.arrow(342,26,342,65,blue);
  p.arrow(342,147,342,185,rust);
  p.label('基极 B',74,111,ink);
  p.label('I_B 流入',146,74,green);
  p.label('集电极 C',355,48,blue);
  p.label('发射极 E',355,184,rust);
  p.label('I_E = I_B + I_C',392,109,ink);
}

function amplifierPorts(p) {
  for(const [i,x] of [32,315].entries()){
    box(p,x,23,253,166,'#f8fbf7');
    const cx=x+118;
    transistor(p,cx,100,.93);
    p.label(i?'共集（跟随器）':'共射（反相）',x+12,48,ink,225);
    p.arrow(x+33,100,cx-38,100,green);
    p.label('入',x+13,105,green);
    if(i===0){
      p.line([[cx+15,57],[cx+15,66],[x+207,66]],blue);
      p.arrow(x+207,66,x+225,66,blue);
      ground(p,cx+15,144);
      p.label('从 C 取出',x+167,87,blue,75);
    } else {
      ground(p,cx+15,57);
      p.line([[cx+15,143],[x+207,143]],blue);
      p.arrow(x+207,143,x+225,143,blue);
      p.label('从 E 取出',x+165,165,blue,79);
    }
  }
}

function tailSource(p) {
  transistor(p,202,75,.85);
  transistor(p,370,75,.85,true);
  p.arrow(113,75,171,75,green);
  p.arrow(463,75,403,75,blue);
  p.line([[216,114],[216,132],[356,132],[356,114]],ink);
  p.line([[300,132],[300,149]],ink);
  ring(p,300,169,20,green,pale);
  p.arrow(300,158,300,180,green);
  p.label('v₊',97,66,green);
  p.label('v₋',464,66,blue);
  p.label('左支路',136,104,green);
  p.label('右支路',401,104,blue);
  p.label('尾电流 I_T',329,175,ink);
  p.label('同升时，先看合计电流是否变化',48,202,gray);
}

function opampStages(p) {
  p.arrow(40,75,112,75,green);
  p.arrow(40,108,112,108,blue);
  p.label('＋',19,79,green);
  p.label('−',19,112,blue);
  block(p,114,61,104,62,'差分输入');
  block(p,258,61,108,62,'电压增益',lightBlue);
  block(p,407,61,104,62,'输出驱动',lightRose);
  p.arrow(218,92,255,92,green);
  p.arrow(366,92,404,92,green);
  p.arrow(511,92,565,92,green);
  p.label('负载',541,120,ink);
  block(p,255,150,112,38,'偏置电流');
  for(const x of [165,312,460])p.arrow(x,150,x,127,gray);
  p.line([[166,150],[460,150]],gray,1.3);
}

function feedbackSign(p) {
  ring(p,145,80,24,green,pale);
  p.label('+',132,72,green);
  p.label('−',141,96,rust);
  p.arrow(34,80,118,80,green);
  p.arrow(169,80,247,80,green);
  block(p,250,55,117,50,'放大 A',lightBlue);
  p.arrow(367,80,548,80,blue);
  p.line([[470,80],[470,150],[373,150]],blue);
  block(p,250,130,120,40,'取样 β',lightRose);
  p.line([[250,150],[145,150]],rust);
  p.arrow(145,150,145,107,rust);
  p.label('输入固定',32,64,green);
  p.label('误差变小',177,63,green);
  p.label('假设输出上升',414,56,blue);
  p.label('从误差中减去反馈量',187,197,rust);
}

function feedbackTypes(p) {
  p.label('输出电压取样',182,42,blue,142);
  p.label('输出电流取样',391,42,rust,142);
  p.label('输入串联',36,91,ink,103);
  p.label('输入并联',36,153,ink,103);
  for(const [row,y] of [62,124].entries())for(const [col,x] of [154,357].entries()){
    const sample=col?'I_o':'V_o';
    const mix=row?'电流合并':'电压相减';
    const color=col?rust:blue;
    box(p,x,y,180,48,col?lightRose:lightBlue);
    p.label(sample,x+14,y+30,color,42);
    p.arrow(x+54,y+23,x+89,y+23,color);
    p.label(mix,x+99,y+30,ink,72);
  }
}

function opampRc(p) {
  for(const [i,x] of [23,313].entries()){
    const cy=106, tap=x+114, triangle=x+145, output=x+249;
    p.label(i?'微分器':'积分器',x+83,28,ink,95);
    p.line([[x+6,cy],[x+30,cy]],ink);
    element(p,i?'C':'R',x+30,cy,x+86,cy);
    p.line([[x+86,cy],[triangle,cy]],ink);
    p.line([[triangle,cy-15],[triangle,cy+65],[x+205,cy+25],[triangle,cy-15]],green);
    p.line([[x+205,cy+25],[output,cy+25],[output,62],[x+203,62]],ink);
    element(p,i?'R':'C',x+203,62,x+145,62);
    p.line([[x+145,62],[tap,62],[tap,cy]],ink);
    p.dot(tap,cy,green);
    p.label(i?'C':'R',x+52,91,blue);
    p.label(i?'R':'C',x+168,52,rust);
    p.label('−',triangle+8,cy+6,ink);
    p.label('+',triangle+8,cy+48,ink);
    p.line([[triangle,cy+42],[tap,cy+42]],ink);
    ground(p,tap,cy+42);
    p.label('入',x+6,135,gray);
    p.label('出',output-2,cy+51,gray);
  }
}

function oclStage(p) {
  p.label('+V_CC',267,25,green);
  p.label('−V_CC',266,202,rust);
  p.line([[300,28],[300,46]],ink);
  p.line([[300,164],[300,184]],ink);
  block(p,244,46,112,37,'上管',pale);
  block(p,244,128,112,37,'下管',lightRose);
  p.line([[300,83],[300,128]],ink);
  p.line([[300,107],[454,107],[454,121]],ink);
  element(p,'R',454,121,454,164);
  ground(p,454,164);
  p.dot(300,107,green);
  p.arrow(217,49,217,88,green);
  p.arrow(217,123,217,162,rust);
  p.label('正半周供电',78,75,green);
  p.label('负半周吸电流',63,146,rust);
  p.label('负载 R_L',473,148,ink);
  p.label('输出',376,95,gray);
}

function wienCircuit(p) {
  const y=64;
  p.arrow(45,y,91,y,green);
  element(p,'C',91,y,158,y);
  p.line([[158,y],[195,y]],ink);
  element(p,'R',195,y,266,y);
  p.line([[266,y],[486,y]],ink);
  p.arrow(486,y,547,y,blue);
  p.line([[313,y],[313,97]],ink);
  p.line([[420,y],[420,97]],ink);
  element(p,'R',313,97,313,148);
  element(p,'C',420,97,420,148);
  p.line([[313,148],[313,163],[420,163],[420,148]],ink);
  ground(p,365,163);
  p.dot(313,y,green);
  p.dot(420,y,green);
  p.label('放大器输出',39,41,green);
  p.label('C',117,93,ink);
  p.label('R',222,93,ink);
  p.label('R',328,126,ink);
  p.label('C',436,126,ink);
  p.label('反馈电压',458,42,blue);
}

function modulationCompare(p) {
  const carrier=14;
  for(const [index,y] of [40,105,169].entries()){
    const x=99;
    p.line([[x,y],[565,y]],grid,1.2);
    p.label(['AM','FM','PM'][index],43,y+4,ink);
    if(index===0) {
      const envelope=t=>1+.44*Math.cos(2*Math.PI*t);
      trace(p,x,565,y,16,t=>envelope(t)*Math.cos(2*Math.PI*carrier*t),green);
      trace(p,x,565,y,16,envelope,rust);
    } else {
      trace(p,x,565,y,17,t=>Math.cos(2*Math.PI*carrier*t+1.9*(index===1?Math.sin(2*Math.PI*t):Math.cos(2*Math.PI*t))),index===1?blue:rust);
    }
  }
  p.label('同一时间刻度',428,203,gray);
}

function causality(p) {
  const positions=[154,304,454];
  p.arrow(67,108,552,108,gray);
  for(const [i,x] of positions.entries()){
    p.line([[x,101],[x,115]],ink,2);
    p.dot(x,108,i===1?ink:i===0?green:rust);
    p.label(['t₀−1','t₀','t₀+1'][i],x-22,137,ink);
  }
  p.arrow(153,72,293,72,green);
  p.label('过去值可以取得',140,59,green);
  p.arrow(451,72,314,72,rust);
  p.label('未来值尚未出现',325,59,rust);
  p.label('固定输出时刻，再检查它依赖哪一处输入。',101,177,gray);
}

function shiftPhase(p) {
  const left=105,right=545;
  p.line([[left,79],[right,79]],grid,1.4);
  p.line([[left,156],[right,156]],grid,1.4);
  p.line([[325,24],[325,192]],grid,1.1,[4,4]);
  trace(p,left,right,79,45,t=>Math.exp(-17*(t-.5)**2),green);
  p.line([[left,119],[right,191]],blue,2.5);
  p.line([[left,156],[right,156]],rust,1.7,[5,4]);
  p.label('幅度',45,59,ink);
  p.label('相位',45,151,ink);
  p.label('延时前后重合',382,55,green);
  p.label('延时后的相位',396,203,blue);
  p.label('ω',554,162,gray);
}

function sRoc(p) {
  box(p,209,25,326,145,pale,null,2);
  p.arrow(63,100,556,100,gray);
  p.arrow(330,184,330,15,gray);
  p.line([[209,25],[209,170]],rust,1.8,[5,4]);
  mark(p,209,100,rust);
  p.label('−1',192,125,rust);
  p.label('0',335,122,gray);
  p.label('Re(s)',510,126,gray);
  p.label('jω',343,34,gray);
  p.label('收敛域 Re(s)>−1',364,69,green);
  p.label('右边指数 e^(−t)u(t)',72,196,ink);
}

function zRoc(p) {
  box(p,117,21,368,165,pale,null,3);
  ring(p,300,104,51,grid,'#fffefa');
  ring(p,300,104,83,green);
  p.arrow(93,104,530,104,gray);
  p.arrow(300,192,300,14,gray);
  mark(p,351,104,rust);
  p.label('0.6',350,133,rust);
  p.label('单位圆',392,65,green);
  p.label('收敛域 |z|>0.6',393,158,green);
  p.label('Re(z)',508,130,gray);
}

function zFeedback(p) {
  p.arrow(51,73,115,73,green);
  block(p,119,53,66,40,'× b');
  p.arrow(185,73,253,73,green);
  ring(p,274,73,20,green,pale);
  p.label('+',268,80,green);
  p.arrow(294,73,540,73,blue);
  p.line([[465,73],[465,148],[431,148]],blue);
  block(p,344,127,87,42,'z⁻¹',lightBlue);
  p.arrow(344,148,309,148,blue);
  block(p,220,127,87,42,'× a',lightRose);
  p.line([[220,148],[180,148],[180,104],[274,104]],rust);
  p.arrow(274,104,274,95,rust);
  p.label('x[n]',38,55,green);
  p.label('y[n]',499,52,blue);
  p.label('y[n−1]',350,193,blue);
}

function waveViews(p) {
  for(const [i,left] of [26,312].entries()){
    box(p,left,27,259,150,'#f8fbf7');
    p.label(i?'固定位置 x=0':'固定时刻 t=0',left+13,52,ink,225);
    p.arrow(left+27,109,left+242,109,gray);
    trace(p,left+27,left+226,109,28,t=>Math.cos(4*Math.PI*t),i?blue:green);
    p.line([[left+28,155],[left+127,155]],rust,1.8);
    p.line([[left+28,150],[left+28,160]],rust,1.8);
    p.line([[left+127,150],[left+127,160]],rust,1.8);
    p.label(i?'周期 T':'波长 λ',left+49,172,rust);
    p.label(i?'t':'x',left+238,134,gray);
  }
}

function opticalPath(p) {
  for(const [i,y] of [70,135].entries()){
    box(p,142,y-27,391,54,i?lightBlue:'#f6faf5');
    p.label(i?'介质 n=1.5':'空气 n≈1',36,y+5,ink,102);
    trace(p,151,523,y,16,t=>Math.cos((i?12:8)*Math.PI*t),i?blue:green);
  }
  p.line([[142,176],[533,176]],rust,1.8);
  p.line([[142,170],[142,183]],rust,1.8);
  p.line([[533,170],[533,183]],rust,1.8);
  p.label('相同几何长度 L',250,201,rust);
}

function fringeShift(p) {
  const left=116,right=552,spacing=86;
  const {ctx}=p;
  for(const [i,y] of [68,132].entries()) {
    const center=333+(i?-spacing/2:0);
    for(let x=left;x<=right;x++){
      const v=Math.cos(Math.PI*(x-center)/spacing)**2;
      const lightness=Math.round(20+74*v);
      ctx.fillStyle='hsl(115, 15%, '+lightness+'%)';
      ctx.fillRect(x,y-17,1.2,34);
    }
    p.line([[center,y-21],[center,y+21]],rust,2.4);
    p.label(i?'加片后':'加片前',28,y+6,ink,77);
  }
  p.line([[333,42],[333,158]],gray,1.4,[4,4]);
  p.arrow(330,174,293,174,rust);
  p.label('靠 A 缝',116,195,ink);
  p.label('零级左移半个间距',228,198,rust);
  p.label('靠 B 缝',483,195,ink);
}

function wedgeCount(p) {
  const x=d=>138+d*325;
  const end=x(1.25);
  for(const [i,y] of [70,131].entries()){
    const pitch=i?.25:.30;
    box(p,x(0),y-17,end-x(0),34,i?lightBlue:pale);
    for(let order=0;order*pitch<=1.250001;order++) {
      const pos=x(order*pitch);
      p.line([[pos,y-17],[pos,y+17]],i?blue:green,3.2);
      p.label(order,pos-4,y+36,i?blue:green);
    }
    p.label(i?'500 nm':'600 nm',43,y+6,ink,90);
  }
  p.line([[x(0),28],[x(0),153]],rust,1.3,[4,3]);
  p.line([[end,28],[end,153]],rust,1.3,[4,3]);
  p.label('0',x(0)-5,197,gray);
  p.label('膜厚 d',280,196,ink);
  p.label('1.25 μm',end-36,197,gray);
}

function halfZones(p) {
  for(const [row,y] of [64,136].entries()){
    const count=2*(row+1);
    const start=151, width=370, w=width/count;
    p.label(row?'第二暗纹':'第一暗纹',39,y+7,ink,105);
    for(let i=0;i<count;i++){
      const x=start+i*w;
      const mid=x+w/2;
      box(p,x,y-20,w,40,i%2?lightRose:lightBlue,grid,2);
      if(i%2) p.arrow(mid+14,y,mid-14,y,rust);
      else p.arrow(mid-14,y,mid+14,y,blue);
      p.label('带 '+(i+1),mid-22,y+37,i%2?rust:blue);
    }
  }
  p.label('成对比较，相邻带的对应点相差半个波长',151,202,ink,385);
}

function focalRays(p) {
  const focus=[499,55];
  p.line([[45,110],[557,110]],grid,1.3,[5,4]);
  p.line([[499,26],[499,174]],gray,2.2);
  p.line([[278,27],[270,61],[267,110],[270,158],[278,188]],blue,2.4);
  p.line([[278,27],[286,61],[289,110],[286,158],[278,188]],blue,2.4);
  for(const [a,b] of [[70,45],[131,106]]){
    p.arrow(70,a,270,b,green);
    p.arrow(288,b,...focus,green);
  }
  p.dot(...focus,rust);
  p.line([[517,55],[517,110]],rust,1.5);
  p.label('焦平面',505,29,gray,76);
  p.label('y',526,90,rust);
  p.label('透镜',250,205,blue);
  p.label('同一衍射方向',57,177,green);
  p.label('焦距 f',378,147,ink);
  p.line([[294,160],[490,160]],gray,1.6);
}

function lightClock(p) {
  const panels=[{left:24,bottom:153,top:63,x:160,end:160},{left:314,bottom:153,top:63,x:383,end:506}];
  for(const [i,item] of panels.entries()) {
    box(p,item.left,27,261,157,'#f8fbf7');
    p.label(i?'外部惯性系':'光钟静止系',item.left+11,48,ink,205);
    p.line([[item.x-24,item.bottom],[item.x+24,item.bottom]],blue,4);
    p.line([[item.end-24,item.top],[item.end+24,item.top]],blue,4);
    if(i) {
      p.line([[item.x-23,item.top],[item.x+23,item.top]],grid,2,[4,3]);
      p.arrow(item.x+23,item.top,item.end-26,item.top,gray);
    }
    p.arrow(item.x,item.bottom-4,item.end,item.top+5,rust);
    p.label('发出',item.x-19,item.bottom+22,gray);
    p.label('到达',item.end+30,item.top+8,gray,50);
  }
}

function simultaneity(p) {
  const ox=132, oy=143;
  p.arrow(65,oy,552,oy,gray);
  p.arrow(ox,186,ox,24,gray);
  p.line([[67,172],[500,45]],blue,2.4);
  p.dot(ox,oy,green);
  p.dot(413,oy,rust);
  p.label('A',ox-14,166,green);
  p.label('B',405,166,rust);
  p.label('ct',ox-30,32,gray);
  p.label('x',551,166,gray);
  p.label('船系 t′=0',379,61,blue);
  p.label('地面系 t=0',443,132,gray);
  p.label('B 位于船系同时线下方',286,197,rust);
}

function compton(p) {
  const origin=[284,103];
  p.arrow(56,103,278,103,green);
  p.line([[286,103],[548,103]],grid,1.3,[5,4]);
  p.arrow(288,100,486,38,blue);
  p.arrow(288,106,455,177,rust);
  p.dot(...origin,gray);
  p.label('入射光子 λ',76,82,green);
  p.label('散射光子 λ′',429,30,blue);
  p.label('反冲电子',459,184,rust);
  const {ctx}=p;
  ctx.beginPath();
  ctx.arc(origin[0],origin[1],65,-.303,0);
  ctx.strokeStyle=blue;
  ctx.lineWidth=1.8;
  ctx.stroke();
  p.label('θ',358,93,blue);
  p.label('初始电子近似静止',75,168,gray);
}

function wavepackets(p) {
  const left=126,right=547;
  for(const [i,y] of [85,165].entries()){
    p.line([[left,y],[right,y]],grid,1.4);
    const widths=i?[.11,.24]:[.24,.11];
    for(const [j,width] of widths.entries()){
      trace(p,left,right,y,47,t=>Math.exp(-.5*((t-.5)/width)**2),j?blue:green);
    }
    p.label(i?'波数分布':'位置分布',38,y-8,ink,82);
    p.label(i?'k':'x',556,y+7,gray);
  }
  p.label('绿色：位置较宽',136,199,green,157);
  p.label('蓝色：位置较窄',330,199,blue,160);
}

function laserLevels(p) {
  for(const [i,y] of [45,94,168].entries()){
    p.line([[118,y],[531,y]],i===1?blue:gray,2.5);
    p.label(['E₂','E₁','E₀'][i],70,y+6,ink);
  }
  p.arrow(173,164,173,49,green);
  p.label('泵浦',183,135,green);
  p.arrow(327,49,327,89,gray);
  p.label('快速弛豫',338,77,gray);
  p.arrow(453,100,453,162,rust);
  p.label('受激辐射',463,141,rust);
  p.label('粒子累积在上激光能级',195,118,blue);
}

export const diagramScenes = {
  holes,
  'mos-terminals': mosTerminals,
  'bjt-terminals': bjtTerminals,
  'amplifier-ports': amplifierPorts,
  'tail-source': tailSource,
  'opamp-stages': opampStages,
  'feedback-sign': feedbackSign,
  'feedback-types': feedbackTypes,
  'opamp-rc': opampRc,
  'ocl-stage': oclStage,
  'wien-circuit': wienCircuit,
  'modulation-compare': modulationCompare,
  causality,
  'shift-phase': shiftPhase,
  's-roc': sRoc,
  'z-roc': zRoc,
  'z-feedback': zFeedback,
  'wave-views': waveViews,
  'optical-path': opticalPath,
  'fringe-shift': fringeShift,
  'wedge-count': wedgeCount,
  'half-zones': halfZones,
  'focal-rays': focalRays,
  'light-clock': lightClock,
  simultaneity,
  compton,
  wavepackets,
  'laser-levels': laserLevels,
};
