import { diagramScenes } from './lesson-diagram-scenes.mjs';
import { guidedFigures } from './guided-figures.mjs';

(() => {
  const green = '#32664f';
  const rust = '#9d5142';
  const gold = '#896426';
  const gray = '#53665b';
  const grid = '#e1e9de';
  const sin = Math.sin;
  const cos = Math.cos;
  const pi = Math.PI;
  const gaussian = x => Math.exp(-x*x*2);
  const sinc = x => x ? sin(pi*x)/(pi*x) : 1;
  const clamp = v => Math.max(-.65,Math.min(.65,v));
  const diagrams = {
    diode: [[0,1],[0,6],['正向电压 (V)','相对电流'], x => Math.exp(9*(x-.8))-.00075],
    loadline: [[0,12],[0,4.5],['VCE (V)','IC (mA)'], x => (12-x)/3],
    clip: [[0,2],[-1.4,1.4],['时间','相对幅度'],x=>sin(2*pi*x), x=>clamp(-sin(2*pi*x))],
    frequency: [[-1.5,1.5],[0,1.12],['log₁₀(f/fc)','幅值'],x=>1/Math.sqrt(1+10**(2*x))],
    difference: [[0,2],[-.75,1.5],['时间','电压'],x=>.8+.22*sin(2*pi*x),x=>.8-.22*sin(2*pi*x),x=>.44*sin(2*pi*x)],
    threshold: [[0,2],[-1.2,1.2],['时间','相对电压'],x=>sin(2*pi*x),x=>sin(2*pi*x)>.35?.9:-.9,x=>.35],
    deadzone: [[0,2],[-1.2,1.2],['时间','相对电压'],x=>sin(2*pi*x),x=>Math.sign(sin(2*pi*x))*Math.max(Math.abs(sin(2*pi*x))-.3,0)],
    envelope: [[0,16],[-1.15,1.15],['循环次数','相对振幅'],x=>Math.min(1,.12*1.18**x)*sin(2*pi*x),x=>Math.min(1,.12*1.18**x),x=>-Math.min(1,.12*1.18**x)],
    am: [[0,2],[-1.9,1.9],['时间','相对幅度'],x=>(1+.65*cos(2*pi*x))*cos(24*pi*x),x=>1+.65*cos(2*pi*x),x=>-1-.65*cos(2*pi*x)],
    segments: [[-1,4],[-.35,4.6],['t (s)','x(t)'],x=>x<0?0:x<2?2*x:4],
    shift: [[-3,4],[0,1.16],['时间','相对幅度'],gaussian,x=>gaussian(x-1.4)],
    rectangle: [[-1,5],[-.2,3.5],['时间','x(t)'],x=>x>=1&&x<4?3:0],
    overlap: [[-1,4],[-.12,1.22],['积分变量 τ','矩形高度'],x=>Number(x>=0&&x<=2),x=>Number(x>=1&&x<=3),x=>Number(x>=1&&x<=2)*.88],
    exponential: [[0,4],[0,1.12],['t','h(t)'], x=>Math.exp(-2*x)],
    phase: [[0,2],[-1.2,1.2],['时间','x/A'],x=>cos(2*pi*x),x=>cos(2*pi*x-pi/3)],
    energy: [[0,2],[0,1.15],['时间','E/E总'],x=>sin(2*pi*x)**2,x=>cos(2*pi*x)**2,x=>1],
    interference: [[0,2],[-2.2,2.2],['时间','合位移'],x=>2*cos(2*pi*x),x=>0],
    standing: [[0,2],[-1.1,1.1],['位置 x/λ','位移'],x=>sin(2*pi*x),x=>-.62*sin(2*pi*x)],
    diffraction: [[-3,3],[0,1.1],['屏幕位置','归一化光强'],x=>sinc(1.45*x)**2,x=>sinc(.85*x)**2],
    polarization: [[0,180],[0,1.12],['夹角 θ (°)','I/I₀'],x=>cos(x*pi/180)**2],
    dilation: [[0,.96],[1,3.8],['v/c','Δt/Δτ'],x=>1/Math.sqrt(1-x*x)],
    photoelectric: [[0,6],[0,4.2],['光子能量 (eV)','最大动能 (eV)'],x=>x>=2?x-2:NaN],
    well: [[0,1],[-1.2,1.25],['x/L','相对幅度'],x=>sin(2*pi*x),x=>sin(2*pi*x)**2],
    rectification: [[0,2],[-2.15,2.15],['时间 / 周期','电压 (V)'], x => 2*sin(2*pi*x), x => Math.max(0, 2*sin(2*pi*x)-.7)],
    'rc-pair': [[-2,2],[0,1.04],['log₁₀(f/fc)','归一化幅值'], x => 1/Math.sqrt(1+10**(2*x)), x => 1/Math.sqrt(1+10**(-2*x))],
    'step-total': [[0,3],[0,3.2],['时间 (s)','y(t)'], x => Math.exp(-2*x), x => 3*(1-Math.exp(-2*x)), x => 3-2*Math.exp(-2*x)],
    'average-difference': [[0,1],[0,1.04],['Ω/π','归一化幅值'], x => cos(pi*x/2), x => sin(pi*x/2)],
    'wave-shift': [[0,2],[-1.12,1.12],['位置 x/λ','位移 y/A'], x => cos(2*pi*(x-.25)), x => cos(2*pi*(x-.50))],
    'polarizer-chain': [[0,90],[0,.14],['中间透振轴角度 (°)','I/I₀'], x => sin(2*pi*x/180)**2/8],
    recovery: [[-1.5,2.5],[-1.1,.9],['相对时间','相对电流'], x => x<0 ? .7 : x<.55 ? -.85 : -.85*Math.exp(-5*(x-.55))],
    'common-source': [[0,2],[-.5,.5],['时间 / 周期','交流电压 (V)'], x => .1*sin(2*pi*x), x => -.4*sin(2*pi*x)],
    cascade: [[-1.5,1.5],[-63,1],['log₁₀(f/fc)','增益 (dB)'], x => -10*Math.log10(1+10**(2*x)), x => -20*Math.log10(1+10**(2*x)), () => -3],
    'output-resistance': [[0,8],[0,1.08],['负载电流 (mA)','输出电压 (V)'], x => 1-.1*x, x => 1-.02*x],
    'signal-power': [[0,2],[-1.12,1.12],['时间 / 周期','归一化幅值'], x => cos(2*pi*x), x => cos(2*pi*x)**2, () => .5],
    'step-tau': [[0,4],[0,1.1],['时间 t/τ','归一化输出'], x => 1-Math.exp(-x), () => 1-Math.exp(-1)],
    kinetic: [[0,.95],[0,2.4],['速度 v/c','动能 K/mc²'], x => 1/Math.sqrt(1-x*x)-1, x => x*x/2],
    blackbody: [[.25,3],[0,.75],['波长 (μm)','相对光谱辐出度'], x => 10/(x**5*Math.expm1(14388/(x*3000))), x => 10/(x**5*Math.expm1(14388/(x*4500)))],
    'bjt-regions': [[0,70],[0,5.3],['基极电流 (μA)','集电极电流 (mA)'], x => Math.min(.1*x,4.8)],
    passband: [[0,6],[0,1.1],['log₁₀(f/Hz)','归一化幅值'], x => 1/Math.sqrt((1+10**(2*(2-x)))*(1+10**(2*(x-4))))],
    'tail-split': [[-4,4],[0,1.12],['归一化差模输入','尾电流份额'], x => 1/(1+Math.exp(-x)), x => 1/(1+Math.exp(x)), () => 1],
    'load-power': [[0,2],[-1.12,1.12],['时间 / 周期','归一化量'], x => cos(2*pi*x), x => cos(2*pi*x)**2, () => .5],
    'power-limits': [[0,24],[0,15],['负载 (Ω)','允许峰值 (V)'], () => 9, x => .6*x],
    'wien-peak': [[-2,2],[0,.37],['log₁₀(f/f₀)','反馈幅值'], x => {const r=10**x;return r/Math.sqrt((1-r*r)**2+9*r*r);}],
    'lc-exchange': [[0,1],[0,1.12],['时间 / 周期','储能 / 总能'], x => cos(2*pi*x)**2, x => sin(2*pi*x)**2, () => 1],
    'delayed-impulse': [[-.5,5],[0,1.13],['时间 (s)','相对幅度'], x => x<0?0:Math.exp(-x), x => x<2?0:Math.exp(2-x)],
    'partial-exp': [[0,4],[-1.1,1.1],['时间 (s)','相对幅度'], x => Math.exp(-x), x => -Math.exp(-4*x), x => Math.exp(-x)-Math.exp(-4*x)],
    beats: [[0,2],[-2.14,2.14],['时间 (s)','相对位移'], x => cos(8*pi*x)+cos(10*pi*x), x => 2*Math.abs(cos(pi*x)), x => -2*Math.abs(cos(pi*x))],
  };

  function drawFigure(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = devicePixelRatio || 1;
    canvas.width = Math.round(rect.width*dpr);
    canvas.height = Math.round(rect.height*dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(canvas.width/600, canvas.height/210);
    const mode = canvas.dataset.figure;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    function line(points, color = green, width = 2.2) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (const [i,[x,y]] of points.entries()) i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      ctx.stroke();
    }
    function label(text,x,y,color=gray,maxWidth=593-x) {
      ctx.fillStyle = color;
      const size = Math.max(16, 6900 / rect.width);
      ctx.font = `500 ${size}px system-ui, sans-serif`;
      ctx.fillText(text, x, y, maxWidth);
    }
    function dot(x,y,color=rust) {
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,4,0,2*pi); ctx.fill();
    }
    function arrow(x1,y1,x2,y2,color=green) {
      const a=Math.atan2(y2-y1,x2-x1);
      line([[x1,y1],[x2,y2]],color);
      line([[x2-9*cos(a-.5),y2-9*sin(a-.5)],[x2,y2],[x2-9*cos(a+.5),y2-9*sin(a+.5)]],color);
    }
    function plot(spec,top=24,bottom=166) {
      const [[a,b],[c,d],[xlabel,ylabel],...curves]=spec;
      const xp=x=>72+(x-a)/(b-a)*484;
      const yp=y=>bottom-(y-c)/(d-c)*(bottom-top);
      const base=yp(Math.max(c,0));
      for(let k=0;k<=4;k++){
        const x=a+k*(b-a)/4,y=c+k*(d-c)/4;
        line([[xp(x),top],[xp(x),bottom]],grid,1);
        line([[72,yp(y)],[556,yp(y)]],grid,1);
        label(Number(x.toFixed(2)),xp(x)-9,bottom+17);
        label(Number(y.toFixed(2)),29,yp(y)+5);
      }
      line([[72,top],[72,bottom]],gray,1.3);
      line([[72,base],[556,base]],gray,1.3);
      label(ylabel,72,top-7);
      label(xlabel,425,bottom+35);
      curves.forEach((f,j)=>{
        let points=[];
        for(let k=0;k<=360;k++){
          const x=a+(b-a)*k/360,y=f(x);
          if(Number.isFinite(y)&&y>=c&&y<=d)points.push([xp(x),yp(y)]);
          else if(points.length){line(points,[green,rust,gold][j]);points=[];}
        }
        if(points.length)line(points,[green,rust,gold][j]);
      });
      return {xp,yp,base};
    }
    if (canvas.hasAttribute('data-guided-figure')) {
      guidedFigures[mode][1]({ ctx, line, label, dot, arrow });
      return;
    }
    if (diagrams[mode]) {
      const {xp,yp}=plot(diagrams[mode]);
      if(mode==='loadline'){dot(xp(6),yp(2)); label('Q (6 V, 2 mA)',xp(6)+9,yp(2)-8,rust);}
      if(mode==='frequency'){ctx.setLineDash([4,4]);line([[72,yp(Math.SQRT1_2)],[xp(0),yp(Math.SQRT1_2)],[xp(0),yp(0)]],rust,1.5);ctx.setLineDash([]);}
      if(mode==='step-tau'){const value=1-Math.exp(-1);line([[xp(1),yp(0)],[xp(1),yp(value)]],gray,1.5);dot(xp(1),yp(value));}
      return;
    }
    if (diagramScenes[mode]) {
      diagramScenes[mode]({ ctx, line, label, dot, arrow });
      return;
    }
    if(mode==='loop'){
      line([[105,97],[105,48],[240,48],[254,35],[272,61],[288,35],[305,61],[320,48],[490,48],[490,160],[105,160],[105,114]]);
      line([[80,97],[130,97]],rust,3);line([[91,114],[119,114]],rust,3);
      label('电源',60,143);label('R',274,28);arrow(360,38,428,38);label('I',391,29);
    }else if(mode==='junction'){
      const half=canvas.dataset.figureValue==='1'?45:82;
      ctx.fillStyle='#f6ebe6';ctx.fillRect(55,49,245,97);
      ctx.fillStyle='#e8f0e5';ctx.fillRect(300,49,245,97);
      ctx.fillStyle='#f8efd9';ctx.fillRect(300-half,49,half*2,97);
      label('P 区',113,84); label('N 区',443,84);
      for(let y=81;y<=122;y+=19){label('−',270,y,rust);label('+',320,y,green);}
      label('耗尽区',268,168);arrow(385,187,222,187);label('内电场',399,192);
    }else if(mode==='fet'){
      plot([[0,4],[0,5],['VDS (V)','相对 ID'],x=>x<1?2*x-x*x:1,x=>x<1.5?3*x-x*x:2.25,x=>x<2?4*x-x*x:4]);
      label('VGS 增大 ↑',414,41,rust);
    }else if(mode==='feedback'){
      dot(145,72);label('输入',52,52);arrow(56,72,140,72);
      ctx.strokeStyle=green;ctx.strokeRect(244,43,106,58);label('放大 A',266,79);
      arrow(150,72,242,72);arrow(350,72,537,72);label('输出',497,53);
      line([[460,72],[460,154],[340,154]],gray);ctx.strokeRect(235,131,105,46);label('取样 β',249,160);
      line([[235,154],[145,154]],gray);arrow(145,154,145,79,gray);label('−',161,108,rust);
    }else if(['spectrum','cos-spectrum','samples','levels'].includes(mode)){
      if(mode==='levels'){
        label('E (eV)',55,20);line([[84,35],[84,180]],gray);
        for(const [n,y,e] of [[1,166,'−13.6'],[2,64,'−3.4'],[3,45,'−1.51'],[4,38,'−0.85']]){
          line([[140,y],[460,y]],green,1.7);label(e,26,y+5);label('n='+n,469,y+5);
        }
        arrow(302,68,302,158,rust);label('发射光子',317,120,rust);
      }else{
        arrow(75,148,551,148,gray);arrow(75,148,75,34,gray);
        const stems=mode==='samples'?[[155,44],[215,22],[275,94],[335,52],[395,33],[455,66]]:mode==='cos-spectrum'?[[230,81],[420,81]]:[[195,46],[315,101],[435,46]];
        for(const [x,h] of stems){line([[x,148],[x,148-h]],green,2.6);dot(x,148-h,rust);}
        if(mode==='spectrum'){label('fc−fm',172,174);label('fc',306,174);label('fc+fm',412,174);}
        if(mode==='cos-spectrum'){label('−f₀',218,174);label('0',316,174);label('+f₀',408,174);}
        if(mode==='samples'){label('整数样本 n',448,174);label('x[n]',54,25);}
      }
    }else if(mode==='impulse-derivative'){
      line([[63,80],[544,80]],gray,1);line([[63,80],[153,80],[310,35],[465,35],[465,80],[544,80]]);
      label('f(t)',30,41);label('−2',144,102);label('0',305,102);label('2',460,102);
      line([[63,155],[544,155]],gray,1);line([[63,155],[153,155],[153,126],[310,126],[310,155],[544,155]]);
      arrow(465,155,465,194,rust);label('−2δ(t−2)',474,195,rust);label('f′(t)',27,132);
    }else if(mode==='unit-circle'){
      arrow(160,104,447,104,gray);arrow(301,189,301,17,gray);
      ctx.beginPath();ctx.arc(301,104,70,0,2*pi);ctx.strokeStyle=green;ctx.stroke();
      for(const [x,text] of [[245,'−0.8'],[350,'0.7']]){line([[x-4,100],[x+4,108]],rust);line([[x-4,108],[x+4,100]],rust);label(text,x-19,128,rust);}
      label('Re(z)',455,108);label('Im(z)',310,27);
    }else if(mode==='double-slit'){
      line([[172,30],[172,69]],gray,6);line([[172,83],[172,125]],gray,6);line([[172,139],[172,178]],gray,6);
      line([[515,25],[515,188]],gray,3);dot(515,63);label('观察点 P',439,51);label('屏',522,183);
      line([[172,76],[515,63]],green);line([[172,132],[515,63]],rust);
      label('r₁',291,61,green);label('r₂',286,128,rust);label('双缝',121,112);
    }else if(mode==='film'||mode==='wedge'){
      const isWedge=mode==='wedge';
      line([[83,132],[524,isWedge?132:144]],gray,2);
      line([[83,isWedge?127:80],[524,isWedge?61:80]],gray,2);
      if(isWedge){
        for(let i=1;i<7;i++){const x=83+i*61;line([[x,127-(x-83)*66/441],[x,132]],rust,1.3);}
        label('接触棱边',61,163);label('膜厚沿 x 增大',340,159);
      }else{
        arrow(139,29,224,80);arrow(224,80,309,29);arrow(224,80,292,144,rust);arrow(292,144,360,80,rust);arrow(360,80,442,29,rust);
        label('上表面反射',314,25,green);label('膜内往返',290,178,rust);
      }
    }else if(mode==='wedge-scale'){
      line([[85,150],[510,150]],gray,3);
      line([[85,150],[510,46]],green,3);
      line([[298,98],[298,150]],rust,2);
      line([[510,46],[510,150]],rust,2);
      label('棱边',75,177);label('L/2',285,177);label('L',501,177);
      label('d/2',312,131,rust);label('d',525,102,rust);
    }else if(mode==='rings'){
      for(let n=1;n<=8;n++){
        ctx.beginPath();ctx.arc(295,106,29*Math.sqrt(n),0,2*pi);ctx.strokeStyle=n%2?green:gray;ctx.lineWidth=2;ctx.stroke();
      }
      label('中心',276,110);label('外侧环更密',417,112);
    }else if(mode==='grating'){
      line([[205,24],[205,184]],gray,4);arrow(67,108,201,108);
      arrow(210,108,530,108,gray);arrow(210,108,511,68,'#4063a0');arrow(210,108,491,32,rust);
      label('入射白光',60,89);label('零级',511,133);label('蓝光',473,84,'#4063a0');label('红光',444,28,rust);
    }
  }
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) drawFigure(entry.target);
  });
  for (const canvas of document.querySelectorAll('[data-figure]')) observer.observe(canvas);
})();
