const blue = '#32658f';
const green = '#356b54';
const red = '#a44e37';
const gray = '#607168';
const light = '#e3ebe6';
const { sin, cos, PI } = Math;

function axes({ arrow, label }, x, y, w, h, horizontal, vertical) {
  arrow(x, y, x + w, y, gray);
  arrow(x, y, x, y - h, gray);
  label(horizontal, x + w - 25, y + 23);
  label(vertical, x + 5, y - h - 6);
}

function wireBox({ ctx, label }, x, y, w, h, text, color = green) {
  ctx.fillStyle = '#f0f5f2';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.7;
  ctx.strokeRect(x, y, w, h);
  label(text, x + 10, y + h / 2 + 6, color, w - 16);
}

function curve({ line }, x0, x1, y, color) {
  line(Array.from({ length: 161 }, (_, i) => {
    const x = x0 + (x1 - x0) * i / 160;
    return [x, y(x)];
  }), color);
}

export const guidedFigures = {
  'pn-junction-1': ['断开的串联回路。电源两端仍可测电压，开关间隙切断了电流路径。', ({ line, label, dot }) => {
    line([[104, 91], [104, 52], [190, 52]]);
    line([[190, 52], [207, 42], [221, 62], [235, 42], [249, 62], [263, 42], [280, 52], [335, 52]]);
    line([[335, 52], [399, 24]], red);
    dot(335, 52, red); dot(414, 52, red);
    line([[414, 52], [500, 52], [500, 158], [104, 158], [104, 115]]);
    line([[80, 91], [128, 91]], blue, 3);
    line([[91, 115], [117, 115]], blue, 3);
    label('6 V', 33, 109, blue); label('电阻', 204, 30);
    label('断开的开关', 327, 86, red); label('I = 0', 431, 145);
  }],
  'pn-junction-2': ['每次电子向左填补空穴。观察空穴从左到右移动的三个位置。', ({ ctx, label, arrow }) => {
    for (let row = 0; row < 3; row++) {
      const y = 36 + row * 64;
      for (let i = 0; i < 5; i++) {
        const x = 125 + i * 76;
        ctx.beginPath(); ctx.arc(x, y, 12, 0, 2 * PI);
        ctx.lineWidth = 2; ctx.strokeStyle = i === row ? red : blue; ctx.stroke();
        if (i !== row) label('−', x - 6, y + 5, blue);
      }
      label(`第 ${row + 1} 次位置`, 20, y + 5);
      if (row < 2) arrow(125 + (row + 1) * 76 - 13, y - 17, 125 + row * 76 + 13, y - 17, blue);
    }
    label('红圈为空穴', 426, 196, red);
  }],
  'pn-junction-3': ['从接触前到平衡。扩散过后，靠近结面的固定负离子和正离子形成内电场。', ({ ctx, line, label, arrow }) => {
    for (const [x, title, after] of [[36, '刚接触', false], [319, '达到平衡', true]]) {
      ctx.fillStyle = '#f6eae6'; ctx.fillRect(x, 60, 116, 77);
      ctx.fillStyle = '#e9f1ed'; ctx.fillRect(x + 116, 60, 116, 77);
      line([[x + 116, 55], [x + 116, 142]], gray, 1);
      label(title, x, 40); label('P', x + 18, 86, red); label('N', x + 199, 86, blue);
      if (after) {
        label('− −', x + 74, 117, red); label('+ +', x + 126, 117, blue);
        arrow(x + 169, 166, x + 66, 166, green); label('内电场', x + 82, 194);
      } else {
        arrow(x + 44, 99, x + 177, 99, red);
        arrow(x + 177, 124, x + 44, 124, blue);
        label('空穴和电子扩散', x + 28, 166);
      }
    }
  }],
  'fet-2': ['固定过驱动电压 1 V。两个工作点沿同一条曲线移动，VDS=1 V 处进入饱和区。', (g) => {
    axes(g, 86, 160, 438, 111, 'VDS', '相对 ID');
    curve(g, 87, 510, x => {
      const v = Math.min((x - 87) / 190, 1);
      return 160 - 81 * (2 * v - v * v);
    }, green);
    g.line([[277, 79], [277, 160]], gray, 1.1);
    g.dot(182, 99, blue); g.dot(372, 79, red);
    g.label('0.5 V', 148, 122, blue); g.label('1 V', 260, 185); g.label('1.5 V', 351, 66, red);
    g.label('线性区', 110, 61); g.label('饱和区', 420, 102);
  }],
  'bjt-2': ['同一集电极回路的三个位置。增大基极驱动会沿负载线向低 VCE、高 IC 方向移动，直到接近饱和端。', (g) => {
    axes(g, 83, 167, 442, 112, 'VCE', 'IC');
    g.line([[105, 60], [489, 167]], green, 3);
    g.dot(114, 63, red); g.dot(330, 123, blue); g.dot(489, 167, green);
    g.label('饱和端', 127, 63, red); g.label('放大区工作点', 287, 106, blue); g.label('截止端', 435, 153);
    g.arrow(329, 146, 235, 120, gray); g.label('基极驱动增大', 161, 151);
  }],
  'frequency-3': ['同一串联 RC 可以取两个输出位置。取电容两端为低通，取电阻两端为高通。', (g) => {
    for (const [x, title, component] of [[25, '低通：取 C 两端', 'C'], [313, '高通：取 R 两端', 'R']]) {
      g.label(title, x + 7, 36);
      g.line([[x + 17, 74], [x + 60, 74], [x + 72, 64], [x + 84, 84], [x + 96, 64], [x + 108, 84], [x + 120, 74], [x + 188, 74]]);
      g.line([[x + 188, 74], [x + 188, 108]]);
      g.line([[x + 173, 108], [x + 203, 108]], blue);
      g.line([[x + 173, 120], [x + 203, 120]], blue);
      g.line([[x + 188, 120], [x + 188, 153], [x + 17, 153]]);
      g.dot(x + 17, 74); g.dot(x + 17, 153);
      g.label('R', x + 88, 60); g.label('C', x + 208, 123, blue);
      if (component === 'C') g.arrow(x + 242, 145, x + 242, 79, red);
      else g.arrow(x + 49, 106, x + 141, 106, red);
    }
  }],
  'differential-2': ['尾电流固定为 2 mA 的示意。输入相等时两支等分，左输入升高后左支多分、右支少分。', (g) => {
    for (const [x, title, left, right] of [[52, '输入相等', '1 mA', '1 mA'], [327, '左输入略高', '1.4 mA', '0.6 mA']]) {
      g.label(title, x + 38, 35);
      g.arrow(x + 25, 67, x + 25, 117, green);
      g.arrow(x + 153, 67, x + 153, 117, blue);
      g.line([[x + 25, 117], [x + 88, 139], [x + 153, 117]]);
      g.arrow(x + 88, 139, x + 88, 181, red);
      g.label(left, x - 9, 60, green); g.label(right, x + 118, 60, blue);
      g.label('总计 2 mA', x + 103, 180, red);
    }
  }],
  'feedback-2': ['取样点和比较点要分别看。本图示例从输出取电压，返回到输入处比较。', (g) => {
    g.arrow(31, 74, 127, 74);
    g.dot(132, 74, red);
    g.arrow(138, 74, 236, 74);
    wireBox(g, 236, 48, 119, 51, '放大器');
    g.arrow(355, 74, 560, 74, blue); g.dot(476, 74, blue);
    wireBox(g, 243, 136, 112, 44, '取样网络', blue);
    g.line([[476, 74], [476, 158], [355, 158]], blue);
    g.line([[243, 158], [132, 158]], blue); g.arrow(132, 158, 132, 81, red);
    g.label('输入', 34, 58); g.label('比较点', 103, 45, red); g.label('输出取样点', 429, 53, blue);
  }],
  'opamp-1': ['电压跟随器把输出接回反相端。正端电压上升时，负反馈使反相端电压随输出靠近它。', (g) => {
    g.line([[224, 49], [224, 139], [397, 94], [224, 49]]);
    g.arrow(66, 73, 219, 73, blue);
    g.line([[397, 94], [516, 94]]);
    g.dot(470, 94, red);
    g.line([[470, 94], [470, 176], [169, 176], [169, 117], [224, 117]], red);
    g.label('+', 233, 79); g.label('−', 233, 122);
    g.label('输入', 67, 57, blue); g.label('输出', 473, 77); g.label('负反馈', 289, 197, red);
  }],
  'opamp-3': ['反相迟滞比较器的两条路径。输入上升到 +2 V 才翻低，下降到 −2 V 才翻高。', (g) => {
    g.arrow(69, 105, 539, 105, gray); g.arrow(301, 168, 301, 30, gray);
    g.line([[108, 59], [361, 59]], green, 3); g.arrow(361, 59, 361, 148, green);
    g.line([[361, 148], [516, 148]], green, 3); g.arrow(240, 59, 287, 59, green);
    g.line([[516, 154], [241, 154]], red, 2.5); g.arrow(241, 154, 241, 65, red);
    g.line([[241, 65], [108, 65]], red, 2.5); g.arrow(349, 154, 298, 154, red);
    g.label('−2 V', 219, 196); g.label('+2 V', 343, 196);
    g.label('输出', 283, 24); g.label('输入', 510, 127);
  }],
  'opamp-4': ['正方波进入反相积分器。输入为正的区间对应输出向下爬坡，输入为零后输出保持。', (g) => {
    g.arrow(92, 79, 536, 79, gray); g.arrow(92, 165, 536, 165, gray);
    g.line([[96, 79], [163, 79], [163, 40], [375, 40], [375, 79], [514, 79]], blue, 2.8);
    g.line([[96, 165], [163, 165], [375, 195], [514, 195]], red, 2.8);
    g.line([[163, 81], [163, 157]], light, 2); g.line([[375, 81], [375, 160]], light, 2);
    g.label('输入', 28, 60, blue); g.label('输出', 28, 151, red); g.label('时间', 536, 160);
  }],
  'power-3': ['OCL 输出级的电流换路。正半周由正电源供电，负半周由负电源一侧承担。', (g) => {
    wireBox(g, 77, 60, 140, 44, '上管导通', blue);
    wireBox(g, 77, 131, 140, 44, '下管导通', red);
    g.label('+VCC', 86, 40, blue); g.label('−VCC', 85, 199, red);
    g.line([[217, 82], [308, 82], [308, 116]], blue);
    g.arrow(308, 116, 435, 116, blue);
    g.line([[435, 128], [295, 128], [295, 151]], red);
    g.arrow(295, 151, 217, 151, red);
    wireBox(g, 435, 101, 110, 45, '负载');
    g.label('正半周', 314, 98, blue); g.label('负半周', 311, 158, red);
  }],
  'oscillator-1': ['扰动经过放大和选频后回到加法点。返回量与原扰动同相时，两者相加。起振还要求该频率处的环路增益足够大。', (g) => {
    g.arrow(44, 67, 137, 67);
    g.dot(143, 67, red);
    g.arrow(150, 67, 230, 67);
    wireBox(g, 231, 45, 122, 44, '放大环节');
    g.arrow(355, 67, 553, 67, blue);
    g.dot(477, 67, blue);
    wireBox(g, 231, 127, 122, 44, '选频网络', blue);
    g.line([[477, 67], [477, 148]], blue);
    g.arrow(477, 148, 356, 148, blue);
    g.line([[231, 148], [143, 148]], red);
    g.arrow(143, 148, 143, 74, red);
    g.label('微小扰动', 43, 47);
    g.label('返回后同相相加', 54, 184, red);
  }],
  'am-4': ['上排的幅度随时间变，下排的幅度保持，而疏密随时间变。先从外缘分辨 AM，再观察 FM 的波峰间距。', (g) => {
    const start = 105, end = 552;
    for (const [y, type] of [[61, 'AM'], [151, 'FM']]) {
      g.arrow(96, y, 564, y, gray);
      g.label(type, 36, y + 5);
      curve(g, start, end, x => {
        const t = (x - start) / (end - start);
        return type === 'AM' ? y - (22 + 13 * cos(4 * PI * t)) * cos(44 * PI * t) : y - 28 * cos(42 * PI * t + 4 * sin(4 * PI * t));
      }, type === 'AM' ? green : blue);
    }
  }],
  'signal-basics-3': ['定位同一个波峰。原峰 t=1，变换后在 2t−4=1 的位置出现，因此新峰 t=2.5。', (g) => {
    for (const [y, peak, width, text, time, color] of [[84, 246, 68, 'x(t)', '1', green], [168, 393, 34, 'x(2t−4)', '2.5', blue]]) {
      g.arrow(100, y, 539, y, gray);
      g.line([[120, y], [peak - width, y], [peak, y - 48], [peak + width, y], [525, y]], color);
      g.dot(peak, y - 48, red);
      g.line([[peak, y - 48], [peak, y + 5]], light, 1);
      g.label(text, 25, y - 20, color); g.label(time, peak - 10, y + 23); g.label('t', 546, y + 7);
    }
  }],
  'time-domain-3': ['等宽时的三角形和不等宽时的梯形。看两张图中输出最高值能维持多久。', (g) => {
    for (const [x, title, points, times] of [
      [36, '两个宽 2 的矩形', [[0, 0], [92, 76], [184, 0]], [[0, '0'], [92, '2'], [184, '4']]],
      [331, '宽 2 与宽 1 的矩形', [[0, 0], [60, 76], [120, 76], [180, 0]], [[0, '0'], [60, '1'], [120, '2'], [180, '3']]],
    ]) {
      axes(g, x, 155, 222, 100, 't', 'y(t)');
      g.label(title, x + 11, 37);
      g.line(points.map(([dx, dy]) => [x + dx, 155 - dy]), green, 3);
      for (const [dx, value] of times) g.label(value, x + dx - 4, 179);
    }
  }],
  'discrete-2': ['索引加法决定乘积落进哪一格。两条中间路径都到 n=0，在那里把乘积相加。', (g) => {
    g.label('样本索引对', 42, 32); g.label('输出索引', 416, 32);
    for (const [y, label] of [[62, '(−1, 0)'], [99, '(−1, 1)'], [136, '(0, 0)'], [173, '(0, 1)']]) wireBox(g, 43, y - 13, 125, 27, label);
    for (const [y, text] of [[62, 'n = −1'], [117, 'n = 0'], [173, 'n = 1']]) wireBox(g, 413, y - 14, 116, 29, text, blue);
    for (const [y0, y1] of [[62, 62], [99, 117], [136, 117], [173, 173]]) g.arrow(171, y0, 410, y1, y1 === 117 ? red : green);
  }],
  'fourier-2': ['相同波形，重复发送对应离散谐波，只发一次对应连续频谱。右侧幅度采用各自的示意标度。', (g) => {
    for (const y of [77, 169]) {
      g.arrow(53, y, 267, y, gray);
      g.arrow(324, y, 550, y, gray);
      g.arrow(277, y - 22, 313, y - 22, gray);
    }
    const pulse = (x, y) => g.line([[x, y], [x, y - 35], [x + 24, y - 35], [x + 24, y]], green);
    for (const x of [70, 132, 194]) pulse(x, 77);
    pulse(132, 169);
    for (let n = -3; n <= 3; n++) {
      const x = 442 + 27 * n;
      const u = PI * n * 24 / 62;
      const h = 42 * (n ? Math.abs(sin(u) / u) : 1);
      g.line([[x, 77], [x, 77 - h]], blue, 2.2); g.dot(x, 77 - h, blue);
    }
    curve(g, 328, 547, x => {
      const u = (x - 438) / 32;
      return 169 - 46 * (u === 0 ? 1 : Math.abs(sin(PI * u) / (PI * u)));
    }, blue);
    g.label('周期重复', 82, 101); g.label('谐波谱线', 402, 101);
    g.label('单个脉冲', 93, 195); g.label('连续频谱', 401, 195);
  }],
  'fourier-5': ['两个不同频率的余弦可以穿过同一组采样点。蓝线和红线之间的差异，落在采样时刻之间。', (g) => {
    const x = t => 71 + t * 118;
    const y = (t, f) => 100 - 52 * cos(2 * PI * f * t);
    g.arrow(55, 100, 552, 100, gray);
    for (let i = 0; i < 5; i++) g.line([[x(i), 44], [x(i), 158]], light, 1.4);
    curve(g, x(0), x(4), px => y((px - 71) / 118, .1), blue);
    curve(g, x(0), x(4), px => y((px - 71) / 118, .9), red);
    for (let i = 0; i < 5; i++) g.dot(x(i), y(i, .1), green);
    g.label('100 Hz', 88, 192, blue); g.label('900 Hz', 235, 192, red); g.label('共同样本点', 388, 192);
  }],
  'laplace-1': ['e^(−2t)u(t) 的收敛域在 Re(s)=−2 右侧。虚部改变振荡，两条测试线的实部决定尾部衰减还是增长。', (g) => {
    g.ctx.fillStyle = '#e8f2ec'; g.ctx.fillRect(218, 28, 326, 148);
    g.arrow(55, 104, 554, 104, gray); g.arrow(370, 180, 370, 26, gray);
    g.line([[218, 28], [218, 176]], red, 2.3);
    g.line([[211, 97], [225, 111]], red); g.line([[225, 97], [211, 111]], red);
    g.label('增长：σ < −2', 57, 72, red); g.label('收敛：σ > −2', 389, 72, green);
    g.label('−2', 205, 130, red); g.label('Re(s)', 487, 130); g.label('Im(s)', 379, 29);
  }],
  'z-transform-1': ['同一极点的内侧和外侧对应不同收敛域。右边指数序列取圆外，左边指数序列取圆内。', (g) => {
    for (const [x, outer, text] of [[153, true, '右边序列：圆外'], [443, false, '左边序列：圆内']]) {
      const { ctx, arrow, label, line } = g;
      if (outer) { ctx.fillStyle = '#e9f2ed'; ctx.fillRect(x - 115, 19, 230, 149); }
      ctx.beginPath(); ctx.arc(x, 93, 55, 0, 2 * PI);
      ctx.fillStyle = outer ? '#fdfefc' : '#e9f2ed'; ctx.fill();
      ctx.strokeStyle = blue; ctx.lineWidth = 2; ctx.stroke();
      arrow(x - 100, 93, x + 97, 93, gray); arrow(x, 155, x, 27, gray);
      line([[x + 50, 88], [x + 60, 98]], red); line([[x + 60, 88], [x + 50, 98]], red);
      label('a', x + 59, 116, red); label(text, x - 90, 194);
    }
  }],
  'oscillation-1': ['振子在平衡点左右两侧时，弹簧回复力都指向平衡点。', (g) => {
    const { line, label, arrow, ctx } = g;
    for (const [y, x] of [[65, 246], [145, 430]]) {
      line([[109, y - 31], [109, y + 29]], gray, 4);
      line([[109, y], ...Array.from({ length: 13 }, (_, k) => [
        119 + (x - 137) * k / 12, y + (k % 2 ? -9 : 9),
      ]), [x - 18, y]], blue, 2);
      ctx.fillStyle = '#e1eee8'; ctx.fillRect(x - 18, y - 20, 37, 40);
      ctx.strokeStyle = green; ctx.strokeRect(x - 18, y - 20, 37, 40);
      arrow(x, y + 29, x < 330 ? x + 70 : x - 70, y + 29, red);
      label('F', x + (x < 330 ? 37 : -42), y + 52, red);
    }
    line([[330, 26], [330, 183]], gray, 1);
    label('平衡点 x=0', 284, 202);
  }],
  'oscillation-2': ['同一个初位移可以对应相反的初速度。比较两条曲线在 t=0 处的斜率。', (g) => {
    g.arrow(67, 107, 543, 107, gray); g.arrow(103, 179, 103, 36, gray);
    curve(g, 103, 527, x => 107 - 55 * cos((x - 103) / 63 + PI / 3), red);
    curve(g, 103, 527, x => 107 - 55 * cos((x - 103) / 63 - PI / 3), blue);
    g.dot(103, 79.5, green);
    g.label('A/2', 45, 84); g.label('t', 545, 132);
    g.label('+π/3：初速度向左', 120, 192, red);
    g.label('−π/3：初速度向右', 335, 192, blue);
  }],
  'waves-1': ['两张图都是正弦形状，横轴含义不同。左图量米得到波长，右图量秒得到周期。', (g) => {
    for (const [x, title, unit, range] of [[38, '固定时刻', '位置 x', '波长 λ'], [329, '固定位置', '时间 t', '周期 T']]) {
      g.label(title, x + 20, 36);
      g.arrow(x, 108, x + 242, 108, gray);
      g.arrow(x + 16, 166, x + 16, 54, gray);
      curve(g, x + 17, x + 231, t => 108 - 43 * sin(2 * PI * (t - x - 17) / 143), blue);
      const first = x + 17 + 143 / 4, last = first + 143;
      g.arrow(first, 54, last, 54, red); g.arrow(last, 54, first, 54, red);
      g.label(range, x + 88, 48, red); g.label(unit, x + 153, 184);
    }
  }],
  'waves-4': ['三条曲线是同一驻波在不同时刻的形状。所有曲线共同为零的位置是节点，波腹位移随时间变化。', (g) => {
    g.arrow(55, 105, 557, 105, gray);
    for (const [scale, color] of [[1, blue], [-.75, red], [.34, green]]) {
      curve(g, 75, 525, x => 105 - 58 * scale * sin(3 * PI * (x - 75) / 450), color);
    }
    for (const x of [75, 225, 375, 525]) {
      g.dot(x, 105, gray);
      g.label('波节', x - 17, 192);
      g.line([[x, 112], [x, 173]], light, 1);
    }
  }],
  'optics-1': ['两束光走过相同几何长度 L。空气段光程约为 L，折射率 1.5 的玻璃段光程为 1.5L。', (g) => {
    for (const [y, name, index, optical, color] of [[63, '空气', 'n ≈ 1', '光程约为 L', blue], [139, '玻璃', 'n = 1.5', '光程为 1.5L', green]]) {
      wireBox(g, 186, y - 23, 210, 45, '', color);
      g.label(index, 265, y - 8, color);
      g.arrow(68, y, 510, y, color);
      g.label(name, 82, y - 11, color);
      g.label('几何长度 L', 225, y + 42, gray);
      g.label(optical, 416, y + 32, color);
    }
  }],
  'optics-3': ['逐一判断界面反射。上排只有一次 π 反转，下排两次都反转，二者相减后没有额外相位差。', (g) => {
    const rows = [
      [66, '空气 1.0', '膜 1.5', '空气 1.0', 'π', '0', '相差 π'],
      [148, '空气 1.0', '膜 1.4', '基底 1.7', 'π', 'π', '相差 0'],
    ];
    for (const [y, left, film, base, top, bottom, delta] of rows) {
      wireBox(g, 25, y - 17, 109, 34, left);
      wireBox(g, 212, y - 17, 109, 34, film);
      wireBox(g, 397, y - 17, 109, 34, base);
      g.arrow(135, y, 210, y, red); g.arrow(322, y, 396, y, blue);
      g.label(top, 166, y - 10, red); g.label(bottom, 351, y - 10, blue);
      g.label(delta, 511, y + 6, gray);
    }
  }],
  'optics-6': ['第一暗纹时，缝的两半可以逐点配对。每对光的传播路差为 λ/2，相位相反。', (g) => {
    const { ctx, line, label, arrow } = g;
    ctx.fillStyle = '#e8f1f8'; ctx.fillRect(89, 37, 78, 67);
    ctx.fillStyle = '#f2eae5'; ctx.fillRect(89, 104, 78, 67);
    line([[89, 36], [89, 172]], gray, 2);
    for (const y of [58, 87]) {
      arrow(168, y, 486, y - 25, blue);
      arrow(168, y + 67, 486, y + 42, red);
      g.dot(160, y, blue); g.dot(160, y + 67, red);
    }
    label('上半', 96, 76, blue); label('下半', 96, 145, red);
    label('同方向出射', 345, 171); label('配对路差 λ/2', 335, 198);
  }],
  'optics-14': ['每过一片，光的偏振方向都变成当前透振轴方向。三道透振轴按 0°、45°、90° 排列。', (g) => {
    for (const [x, text, theta] of [[130, '0°', 0], [300, '45°', PI / 4], [470, '90°', PI / 2]]) {
      const { ctx, line, label } = g;
      ctx.beginPath(); ctx.arc(x, 95, 43, 0, 2 * PI);
      ctx.fillStyle = '#eaf2ee'; ctx.fill(); ctx.strokeStyle = green; ctx.lineWidth = 2; ctx.stroke();
      line([[x - 33 * cos(theta), 95 + 33 * sin(theta)], [x + 33 * cos(theta), 95 - 33 * sin(theta)]], blue, 3);
      label(text, x - 11, 163, blue);
    }
    g.arrow(182, 95, 245, 95); g.arrow(351, 95, 414, 95);
    g.label('每次旋转 45°，强度各乘 1/2', 162, 194);
  }],
  'relativity-2': ['同一对闪光事件能落在站台系的一条等时线上，也落在列车系的两条等时线上。斜率和间隔为示意。', (g) => {
    g.arrow(56, 174, 538, 174, gray); g.arrow(108, 184, 108, 27, gray);
    g.line([[111, 101], [527, 101]], blue, 2);
    g.line([[122, 117], [406, 39]], red, 2);
    g.line([[194, 158], [519, 69]], red, 2);
    g.dot(180, 101, green); g.dot(402, 101, green);
    g.label('事件 A', 138, 85); g.label('事件 B', 408, 98);
    g.label('站台系等时线', 47, 143, blue); g.label('列车系等时线', 368, 40, red);
    g.label('x', 529, 198); g.label('ct', 79, 31);
  }],
  'quantum-2': ['照同一材料时，频率决定每个光子的能量。图中低频强光有更多光子，每个光子的能量仍低于逸出功。', (g) => {
    const rows = [[53, '低频强光', 5, false], [138, '高频弱光', 2, true]];
    for (const [y, text, photons, escapes] of rows) {
      g.label(text, 44, y - 5);
      for (let i = 0; i < photons; i++) g.arrow(155 + 30 * i, y + 24, 177 + 30 * i, y + 24, escapes ? blue : red);
      g.line([[328, y + 5], [328, y + 49]], gray, 3);
      if (escapes) {
        g.dot(388, y + 24, blue); g.arrow(394, y + 24, 473, y + 24, blue);
        g.label('有光电子', 419, y + 7, blue);
      } else g.label('无光电子', 406, y + 30, gray);
    }
  }],
  'quantum-3': ['康普顿散射的角度从光子原传播方向量起。光子与反冲电子在碰撞后分别沿不同方向离开。', (g) => {
    g.arrow(48, 112, 280, 112, blue); g.dot(285, 112, gray);
    g.arrow(285, 112, 514, 30, blue); g.arrow(285, 112, 495, 182, red);
    g.line([[286, 112], [519, 112]], gray, 1.2);
    g.ctx.beginPath(); g.ctx.arc(285, 112, 54, -.34, 0);
    g.ctx.strokeStyle = blue; g.ctx.lineWidth = 1.8; g.ctx.stroke();
    g.label('入射光子', 64, 91, blue); g.label('散射光子', 425, 34, blue);
    g.label('反冲电子', 423, 198, red); g.label('θ', 344, 101, blue);
  }],
  'quantum-6': ['从 n=1 到 n=3，阱内节点数增加。蓝线画波函数，红线画对应概率密度。两者采用各自的示意标度。', (g) => {
    for (const [column, n] of [[49, 1], [235, 2], [421, 3]]) {
      const a = column, b = column + 119;
      g.line([[a, 33], [a, 177]], gray, 1.8); g.line([[b, 33], [b, 177]], gray, 1.8);
      g.line([[a, 75], [b, 75]], light); g.line([[a, 163], [b, 163]], light);
      curve(g, a, b, x => 75 - 32 * sin(n * PI * (x - a) / (b - a)), blue);
      curve(g, a, b, x => 163 - 40 * sin(n * PI * (x - a) / (b - a)) ** 2, red);
      g.label(`n = ${n}`, a + 41, 200);
    }
  }],
};
