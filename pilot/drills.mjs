const fmt = value => Number(value.toFixed(3)).toString();

const templates = {
  'pn-junction': [5, (i) => {
    const v = 3 + i, r = 1 + i % 3;
    return [`正向硅二极管串联 ${r} kΩ 接 ${v} V，按 0.7 V 模型求电流。`, `${fmt((v-.7)/r)} mA`, `电阻承担 ${fmt(v-.7)} V。用伏特除以千欧，直接得到毫安。`];
  }],
  fet: [2, i => {
    const overdrive = i/4, vgs=1+overdrive, vds=i%2?overdrive/2:overdrive+1;
    return [`NMOS 的 VT=1 V、VGS=${fmt(vgs)} V、VDS=${fmt(vds)} V，判断工作区。`, vds<overdrive?'线性区':'饱和区', `VGS 高于阈值，过驱动是 ${fmt(overdrive)} V。把 VDS 与这个数比较。`];
  }],
  bjt: [3, i => [`共射级发射极接地，VCC=${6+i} V、RC=2 kΩ、ICQ=${fmt(i/4)} mA，求 VCEQ。`, `${fmt(6+i/2)} V`, `集电电阻的直流压降为 ${fmt(i/2)} V。从电源电压减去该压降。`]],
  frequency: [2, i => [`中频为 40 dB，下降到 37 dB 的两个频率为 ${i*100} Hz 和 ${i*2000} Hz，求带宽。`, `${i*1900} Hz`, '这两个是相对中频下降 3 dB 的边界。带宽是上限减下限。']],
  differential: [1, i => [`v₊=${fmt(1+i/100)} V、v₋=${fmt(1-i/100)} V，求差模、共模电压。`, `${i*20} mV 和 1 V`, '正端减负端得到差模，两端取平均得到共模。']],
  feedback: [3, i => [`A=${20*i}，β=0.1，求准确的闭环增益。`, fmt(20*i/(1+2*i)), `Aβ=${2*i}，分母为 ${1+2*i}，再用 A 除以分母。`]],
  opamp: [2, i => [`反相运放在线性区，Rin=2 kΩ、Rf=${2*i} kΩ，输入 0.2 V，求输出。`, `${fmt(-.2*i)} V`, `反相增益为 −${i}，乘上输入电压。`]],
  power: [1, i => [`8 Ω 负载上的正弦输出峰值为 ${2*i} V，求平均功率。`, `${fmt(i*i/4)} W`, '峰值除以 √2 得到有效值，再用有效值的平方除以负载。']],
  oscillator: [3, i => [`文氏电桥两只电阻各为 ${i} kΩ，两只电容各为 100 nF，求振荡频率。`, `约 ${fmt(10000/(2*Math.PI*i))} Hz`, `RC=${fmt(i/10)} ms，代入 f₀=1/(2πRC)。`]],
  am: [2, i => [`载频 100 kHz，单音消息频率 ${i} kHz，写出两个边频及带宽。`, `${100-i} kHz、${100+i} kHz，带宽 ${2*i} kHz`, '从载频向两侧分别移动一个消息频率，两个位置相减就是带宽。']],
  'signal-basics': [3, i => [`原信号的峰在 t=${i}，求 x(2t−4) 的峰位置。`, `t=${fmt((i+4)/2)}`, `令新括号 2t−4 等于原来的峰时刻 ${i}，求解 t。`]],
  'time-domain': [3, i => [`两个高度为 1、支持区间均为 [0,2] 的矩形卷积，求 t=${fmt(i/2)} 时的输出。`, fmt(Math.min(i/2,4-i/2)), '翻转平移后的支持为 [t−2,t]。与 [0,2] 取交集，其长度就是输出。']],
  discrete: [2, i => [`x[0..1]=[${i},1]，h[0..1]=[2,1]，求离散卷积。`, `[${2*i}, ${i+2}, 1]`, 'n=0 只有首项相乘，n=1 把交叉的两个乘积相加，n=2 只有末项相乘。']],
  fourier: [2, i => [`矩形脉冲高 2、宽 ${i} s、关于原点对称，求零频值与首正零点。`, `${2*i}，${fmt(1/i)} Hz`, '零频值是脉冲面积；首正零点为时宽的倒数。']],
  laplace: [3, i => [`初始静止时 y′+${i}y=2x，求系统函数和冲激响应。`, `H=2/(s+${i})，h=2e^(−${i}t)u(t)`, '变换微分方程得到 (s+a)Y=2X。取输出与输入之比，再按因果指数项反变换。']],
  'z-transform': [3, i => {
    const p=(i-3)/2;
    return [`因果系统唯一极点为 ${fmt(p)}，判断 BIBO 稳定性。`, Math.abs(p)<1?'稳定':'不稳定', `极点的模为 ${fmt(Math.abs(p))}。只有严格小于 1 时单位圆才落在该因果系统的收敛域内。`];
  }],
  oscillation: [3, i => [`弹簧劲度 200 N/m，振幅 ${i*2} cm，求总能量。`, `${fmt(.04*i*i)} J`, '先把厘米换算成米，再用 E=kA²/2。']],
  waves: [2, i => [`波动方程 y=Acos(${2*i}πt−4πx)，求波速、波长、传播方向。`, `${fmt(i/2)} m/s、0.5 m，沿 +x`, 'ω 是 t 的系数，k 是 x 项系数的绝对值。v=ω/k、λ=2π/k；固定相位后 x 随 t 增大。']],
  optics: [6, i => [`波长 600 nm，屏距 1 m，缝宽 ${i/10} mm，求中央亮纹宽度（小角度）。`, `约 ${fmt(12/i)} mm`, '单侧第一暗纹的位置是 Lλ/a。中央亮纹宽度取正负两个首暗纹之间的距离。']],
  relativity: [3, i => {
    const v=(i+2)/10;
    return [`飞船以 ${fmt(v)}c 飞行，船上钟走过 2 s，实验室测得的间隔是多少？`, `约 ${fmt(2/Math.sqrt(1-v*v))} s`, '船上同一只钟记录的是固有时，实验室测得的间隔等于固有时乘 γ。'];
  }],
  quantum: [2, i => [`金属逸出功 2 eV，入射光子能量为 ${fmt(2+i/2)} eV，求最大初动能和遏止电压大小。`, `${fmt(i/2)} eV，${fmt(i/2)} V`, '先从光子能量扣除逸出功，再根据 eUₛ=Kₘₐₓ 求电压。']],
};

export function chapterDrills(chapter) {
  const [unit, make] = templates[chapter];
  return Array.from({ length: 6 }, (_, index) => {
    const [prompt, answer, explanation] = make(index+1);
    return { id: `${chapter}-drill-${index+1}`, unitId: `${chapter}-${unit}`, prompt, answer, explanation };
  });
}
