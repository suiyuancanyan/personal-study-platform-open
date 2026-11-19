import { encode, lessonText } from './lesson-text.mjs';

export const derivationLabs = {
  'pn-junction-5': {
    mode: 'diodeLoad',
    title: '改变电源，看电流从哪里开始增加',
    task: '比较 0.5 V 和 5 V。让电源经过 0.7 V，观察二极管开始导通时，电阻上的压降和电流如何变化。',
    diagram: '电源、电阻和硅二极管串联。下方是恒压降模型中电流随电源电压的变化图。',
    controls: [
      { id: 'voltage', label: '电源电压', min: 0, max: 6, step: .1, value: 5, unit: 'V' },
      { id: 'resistance', label: '串联电阻', min: 1, max: 3, step: .5, value: 1, unit: 'kΩ' },
    ],
    choices: [
      { id: 'off', label: '0.5 V 截止', values: { voltage: .5, resistance: 1 } },
      { id: 'edge', label: '0.7 V 临界', values: { voltage: .7, resistance: 1 } },
      { id: 'exercise', label: '题设 5 V', values: { voltage: 5, resistance: 1 } },
    ],
    play: '扫过电源电压', animate: 'voltage',
    reasoning: '截止时支路电流为零，电阻上没有压降，电源电压落在管子上。超过 0.7 V 后，管压降按 0.7 V 计算，电阻分到剩下的电压。把电阻调大，图上导通后的斜率 1/R 随之变小。',
  },
  'time-domain-3': {
    mode: 'overlapPractice',
    title: '滑过卷积的上升、平台和下降段',
    task: '点两个题设时刻，沿 τ 轴看重叠区的左右端点。再播放一遍，看下图的取样点如何形成整条卷积曲线。',
    diagram: '上图显示固定的 x、沿积分变量平移的 h 和两者交集。下图在卷积结果曲线上标出当前时刻。',
    controls: [{ id: 'time', label: '观察时刻 t', min: -.5, max: 3.5, step: .05, value: 1.5, unit: 's' }],
    choices: [
      { id: 'grow', label: '上升 · 0.5 s', values: { time: .5 } },
      { id: 'flat', label: '题设 · 1.5 s', values: { time: 1.5 } },
      { id: 'fall', label: '题设 · 2.5 s', values: { time: 2.5 } },
    ],
    play: '播放滑动窗口', animate: 'time',
    reasoning: '滑动窗口为 [t−1,t]，固定区间为 [0,2]。两者交集的长度乘 2 就是积分结果。窗口进入时，重叠每秒增 1 s。完全进入后长度保持 1 s。窗口滑出时，重叠缩短到零。',
  },
  'optics-12': {
    mode: 'halfWavePractice',
    title: '从中央亮纹扫到第二暗纹',
    task: '依次点中央、第一暗纹、第二暗纹。比较缝上累积的相位差、完整半波带的数量与焦平面亮度。',
    diagram: '单缝沿宽度积累相位，交替颜色表示每半个波长的路差。下图显示随焦平面位置变化的相对光强。',
    controls: [{ id: 'position', label: '距中央 y', min: 0, max: 6, step: .05, value: 0, unit: 'mm' }],
    choices: [
      { id: 'center', label: '中央', values: { position: 0 } },
      { id: 'first', label: '第一暗纹', values: { position: 2 } },
      { id: 'second', label: '第二暗纹', values: { position: 4 } },
    ],
    play: '扫过焦平面', animate: 'position',
    reasoning: '题设缝宽和波长下，每离开中央 1 mm，缝两端的路差增加 λ/2。相邻半波带中的对应点相差半个周期，可成对抵消。完整偶数带且没有余下部分时出现暗纹。中央路差为零，整个缝同相叠加。',
  },
};

export const unitLabs = {
  'pn-junction-1': {
    mode: 'circuit',
    title: '接通电路，看串联和并联',
    task: '先断开开关，再把接法从串联切到并联。预测接通后总电流是变大还是变小，再看读数。',
    diagram: '可切换串联、并联的电阻电路，标有电源、开关、两个电阻和电流方向',
    controls: [
      { id: 'voltage', label: '电源电压', min: 2, max: 12, step: 1, value: 6, unit: 'V' },
      { id: 'resistance', label: 'R₂ 电阻', min: 1, max: 6, step: 1, value: 2, unit: 'kΩ' },
    ],
    choices: [
      { id: 'series', label: '串联' }, { id: 'parallel', label: '并联' },
      { id: 'switch', label: '断开开关', toggle: true },
    ],
    play: '显示电流方向',
    reasoning: 'R₁ 固定为 1 kΩ。串联时总电阻 R₁+R₂，两只电阻通过同一电流。并联时每个支路得到全部电源电压，总电流为 U/R₁+U/R₂。点的运动表示约定电流方向，速度只用于比较大小。',
  },
  'discrete-2': {
    mode: 'sequence',
    title: '点一个索引，看哪些乘积落到这一拍',
    task: '先选 n=0，再点左右两拍。观察标亮的格子，并尝试自己算出相加结果。',
    diagram: '离散卷积乘积表，行是输入索引，列是冲激响应索引，同一索引和的单元格以相同颜色标记',
    choices: [
      { id: 'left', label: 'n=−1' }, { id: 'middle', label: 'n=0' }, { id: 'right', label: 'n=1' },
    ],
    play: '逐拍播放',
    reasoning: '行索引 k 与列索引 m 之和等于当前 n 时，该格才有贡献。中间一拍有两格，1×(−1)+2×3=5。这个表和下方例题用的是同一组样本。',
  },
  'oscillation-1': {
    mode: 'spring',
    title: '拉开弹簧，观察一个周期',
    task: '播放后看方块经过平衡位置和两端点时的快慢。再把质量调到四倍，比较周期读数。',
    diagram: '水平弹簧和质量块。平衡点为虚线，红色箭头指向回复力方向',
    controls: [
      { id: 'mass', label: '质量', min: .25, max: 2, step: .25, value: .5, unit: 'kg' },
      { id: 'stiffness', label: '劲度系数', min: 10, max: 100, step: 10, value: 50, unit: 'N/m' },
      { id: 'phase', label: '周期内位置', min: 0, max: 1, step: .01, value: 0, unit: 'T' },
    ],
    play: '播放振动',
    reasoning: '从右端由静止释放时，x=Acos(2πt/T)。端点速度为零、回复力最大。经过平衡位置时，力为零、速度大小最大。播放经过统一慢放，参数变化之间的相对快慢保持。',
  },
  'optics-2': {
    mode: 'slits',
    title: '沿屏幕移动观察点，找明纹和暗纹',
    task: '点右侧亮带或拖滑块移动观察点。先找中央和相邻暗点，再缩小双缝间距，看看条纹间距怎么变。',
    diagram: '双缝到屏幕观察点的两条光路、相邻明暗条纹和当前位置标线',
    controls: [
      { id: 'gap', label: '双缝间距 d', min: .2, max: .8, step: .1, value: .3, unit: 'mm' },
      { id: 'position', label: '观察点 y', min: -6, max: 6, step: .01, value: 0, unit: 'mm' },
    ],
    choices: [{ id: 'center', label: '中央亮纹' }, { id: 'dark', label: '第一暗纹' }],
    play: '扫过屏幕',
    reasoning: '固定 λ=600 nm、D=1 m。小角度下 Δ≈dy/D，Δ/λ 为整数时两束光同相；为半整数时相消。图中几何尺寸为示意，强度按两缝等强且忽略单缝包络计算。',
  },
  'bjt-3': {
    mode: 'loadline',
    title: '移动 Q 点，找输出先碰到哪一端',
    task: '保持集电电阻 2 kΩ，把基极电流从 10 μA 调到 40 μA。比较集电极电压和两边的摆幅余量。',
    diagram: '三极管直流负载线、随基极电流移动的 Q 点、低端和高端摆幅余量',
    controls: [
      { id: 'base', label: '基极电流 I_B', min: 0, max: 65, step: 1, value: 25, unit: 'μA' },
      { id: 'collector', label: '集电电阻 R_C', min: 1, max: 4, step: .5, value: 2, unit: 'kΩ' },
    ],
    choices: [{ id: 'weak', label: '靠近截止', values: { base: 8, collector: 2 } }, { id: 'middle', label: '居中偏置', values: { base: 25, collector: 2 } }, { id: 'strong', label: '进入饱和', values: { base: 58, collector: 2 } }],
    play: '扫过基极电流', animate: 'base',
    reasoning: '模型取 V_CC=10 V、β=100、V_CE(sat)≈0.2 V。放大区试算 I_C=βI_B，再代入 V_CE=V_CC−I_C × R_C。若试算越过饱和边界，集电电流由外部电阻限制。横向两段距离表示忽略交流负载时的电压余量。',
    challenge: ['把 Q 点移到 V_CE=2 V 左右。若输出需要 3 V 峰值，哪一侧先失真？', '低端只剩约 2−0.2=1.8 V，高端还有约 8 V。先碰到饱和侧，低端削顶。'],
  },
  'opamp-1': {
    mode: 'opampNode',
    title: '沿着求和节点追踪电流和虚地',
    task: '先比较正端接地和接 1 V 时的反端电位。再选择「负向限幅」，看虚短还能不能成立。',
    diagram: '反相放大电路及输入电阻、反馈电阻、运放两端参考电位和输出电压',
    controls: [
      { id: 'input', label: '输入电压 V_in', min: -3, max: 3, step: .1, value: .5, unit: 'V' },
      { id: 'reference', label: '正端参考 V_+', min: 0, max: 1, step: .1, value: 0, unit: 'V' },
    ],
    choices: [{ id: 'ground', label: '虚地', values: { input: .5, reference: 0 } }, { id: 'offset', label: '正端接 1 V', values: { input: 2, reference: 1 } }, { id: 'limit', label: '负向限幅', values: { input: 3, reference: 0 } }],
    play: '扫过输入电压', animate: 'input',
    reasoning: '输入和反馈电阻分别为 10 kΩ 与 20 kΩ，输出范围按 ±5 V。在线性区 V_−≈V_+。输出限幅后，用两条电阻支路的电流守恒重算 V_−。理想模型中运放输入电流在这两种情况下都为零。',
    challenge: ['V_+=0、V_in=3 V 时，线性公式给 −6 V，图上为什么是 −5 V？这时 V_− 还是 0 V 吗？', '−6 V 超出输出下限。输出停在 −5 V 时，节点电位由 3 V 和 −5 V 经 10 kΩ、20 kΩ 分压，得到约 0.33 V。'],
  },
  'time-domain-1': {
    mode: 'stepWindow',
    title: '打开再关闭，把两条阶跃做成矩形窗',
    task: '拖动观察时刻，让它依次经过两个边界。把窗口高度改成负数，再看两个冲激的符号怎么变。',
    diagram: '两个延迟单位阶跃、相减后的矩形窗、边界处的导数冲激以及当前观察时刻',
    controls: [
      { id: 'start', label: '开启时刻 a', min: -2, max: 1, step: .5, value: 0, unit: 's' },
      { id: 'end', label: '关闭时刻 b', min: 2, max: 5, step: .5, value: 3, unit: 's' },
      { id: 'height', label: '窗口高度 A', min: -3, max: 3, step: 1, value: 2, unit: '' },
      { id: 'time', label: '观察时刻 t', min: -3, max: 6, step: .1, value: 1, unit: 's' },
    ],
    choices: [{ id: 'up', label: '正矩形', values: { height: 2 } }, { id: 'down', label: '负矩形', values: { height: -2 } }],
    play: '沿时间轴播放', animate: 'time',
    reasoning: '按 u(0)=1 的约定，x(t)=A[u(t−a)−u(t−b)] 在 a≤t<b 为 A。t=a 处的跳变量为 +A，t=b 处为 −A，分别是两个冲激的面积。两个冲激面积相加为零，因为 x 在两端都回到零。',
    challenge: ['如果 A=−2，t=a 处的冲激方向向上还是向下？', '从 0 跳到 −2，右极限减左极限得 −2，所以箭头向下。t=b 处从 −2 回到 0，箭头向上。'],
  },
  'fourier-5': {
    mode: 'alias',
    title: '原波形不同，采样点为什么重合',
    task: '先用 600 Hz 分别采 170 Hz 和 430 Hz 的余弦。再提高采样率，观察两条曲线何时不再混叠。',
    diagram: '原始连续余弦、折回基带的余弦、落在两条曲线共同位置的采样点',
    controls: [
      { id: 'frequency', label: '原信号频率', min: 100, max: 900, step: 10, value: 430, unit: 'Hz' },
      { id: 'rate', label: '采样频率', min: 400, max: 1000, step: 100, value: 600, unit: 'Hz' },
    ],
    choices: [{ id: 'low', label: '170 Hz', values: { frequency: 170, rate: 600 } }, { id: 'folded', label: '430 Hz 发生混叠', values: { frequency: 430, rate: 600 } }, { id: 'enough', label: '提高采样率', values: { frequency: 430, rate: 1000 } }],
    play: '扫过输入频率', animate: 'frequency',
    reasoning: '每隔 1/f_s 秒取样。频率相差整数倍 f_s 时，样本处的相位多整数圈。这里的余弦初相为零，所以负频率与正频率也给出相同样本。两条连续曲线并不相同，只有圆点位置完全一致。',
    challenge: ['以 600 Hz 采样 730 Hz 的余弦，样本等效频率是多少？', '730−600=130 Hz，落在 0 到 300 Hz 的基带。两种连续波形每一拍的取样值相同。'],
  },
  'optics-3': {
    mode: 'film',
    title: '同时看光路和反射相位',
    task: '先将膜厚调到 100 nm，再更换底层折射率。保持几何路程不变，观察哪一次反射发生 π 翻转。',
    diagram: '薄膜两条反射光路及两束反射光在同一波面上的相位箭头',
    controls: [
      { id: 'thickness', label: '膜厚 d', min: 0, max: 400, step: 5, value: 100, unit: 'nm' },
      { id: 'substrate', label: '底层折射率', min: 1.3, max: 1.7, step: .05, value: 1.35, unit: '' },
    ],
    choices: [{ id: 'one', label: '一次相对反转', values: { thickness: 100, substrate: 1.35 } }, { id: 'two', label: '两束都反转', values: { thickness: 100, substrate: 1.65 } }],
    play: '连续改变膜厚', animate: 'thickness',
    reasoning: '空气 n=1、膜 n=1.4，波长 560 nm。近正入射时传播相差来自 2nd。上反射总有 π 翻转；下反射从膜射向折射率更高的底层才有 π 翻转。相位图按两束反射光等幅说明明暗条件，不代表实际反射率。',
    challenge: ['膜厚 100 nm，底层折射率从 1.35 换成 1.65，为什么由亮变暗？', '传播相差保持半周。底层较低时两束还差一次 π，合成整周而亮；底层较高时两束的反转抵消，只剩半周而暗。'],
  },
  'optics-14': {
    mode: 'polarizers',
    title: '转动中间偏振片，量出每一段的光强',
    task: '先把中间片设到 0°，再调到 45° 与 90°。观察哪一段被挡住，以及末端能保留的最大比例。',
    diagram: '三片透振轴分别为 0 度、中间角、90 度的偏振片，以及每次投影后的光强条',
    controls: [{ id: 'angle', label: '中间片角度 θ', min: 0, max: 90, step: 1, value: 45, unit: '°' }],
    choices: [{ id: 'start', label: '0°', values: { angle: 0 } }, { id: 'center', label: '45°', values: { angle: 45 } }, { id: 'end', label: '90°', values: { angle: 90 } }],
    play: '转动中间片', animate: 'angle',
    reasoning: '自然光过第一片剩 I₀/2。随后每一片的透振轴会成为下一段的偏振方向，因此第二片乘 cos²θ，第三片乘 sin²θ。两者乘积在 θ=45° 时最大，末端为 I₀/8。',
    challenge: ['中间片从 30° 转到 60°，第二片出口和第三片出口的强度是否都相同？', '第二片出口从 3I₀/8 降到 I₀/8。第三片出口仍为 3I₀/32，因为两个投影因子互换。'],
  },
  'differential-2': {
    mode: 'tailSplit',
    title: '改变两端电压差，看尾电流怎么重新分配',
    task: '先让两个输入等电位，再让左端稍高。看两条电流读数的和是否改变，最后把左右输入交换。',
    diagram: '差分对的左、右支路在同一尾端合流，两条电流条显示各自分得的份额',
    controls: [
      { id: 'difference', label: '左减右输入电压', min: -100, max: 100, step: 5, value: 0, unit: 'mV' },
      { id: 'tail', label: '尾电流', min: .5, max: 3, step: .5, value: 2, unit: 'mA' },
    ],
    choices: [{id:'equal',label:'两端等高',values:{difference:0}},{id:'left',label:'左端高 50 mV',values:{difference:50}},{id:'right',label:'右端高 50 mV',values:{difference:-50}}],
    play: '扫过差模电压', animate: 'difference',
    reasoning: '两只晶体管匹配并工作在放大区时，电流比近似 e^(v_d/V_T)，这里取 V_T=26 mV。尾端固定总电流，差模输入只改变分配比例。',
    challenge: ['保持 2 mA 尾电流，将左端高 50 mV 换成右端高 50 mV。两支路读数有什么关系？','两路读数互换，合计仍为 2 mA。差模电压变号使电流比取倒数。'],
  },
  'oscillator-4': {
    mode: 'lcEnergy',
    title: '跟着一个周期看电容和电感交换能量',
    task: '从充满电的电容出发，依次选 0、1/4 和 1/2 周期。看电容的电荷、线圈电流与能量条。',
    diagram: '理想 LC 回路中电容的两板电荷、电流方向及电场能、磁场能的占比',
    controls: [
      { id: 'inductance', label: '电感 L', min: 5, max: 40, step: 5, value: 10, unit: 'mH' },
      { id: 'capacitance', label: '电容 C', min: 1, max: 8, step: 1, value: 1, unit: 'μF' },
      { id: 'phase', label: '周期内位置', min: 0, max: 1, step: .01, value: 0, unit: 'T' },
    ],
    choices: [{id:'initial',label:'刚开始',values:{phase:0}},{id:'quarter',label:'1/4 周期',values:{phase:.25}},{id:'half',label:'1/2 周期',values:{phase:.5}}],
    play: '播放能量交换', animate: 'phase', loop: true,
    reasoning: '理想回路中 q/Q₀=cos(2πt/T)，取电容正极开始放电的电流方向为正，则 I/I₀=sin(2πt/T)。电场能和磁场能分别按余弦、正弦的平方分配。动画按周期慢放，频率读数用实际 L、C 计算。',
    challenge: ['C 从 1 μF 改为 4 μF，L 不变。频率和四分之一周期的储能分配各怎么变？','频率减半。四分之一周期仍由电感存下全部能量；只是到达这一刻用时加倍。'],
  },
  'optics-9': {
    mode: 'movingFringes',
    title: '给 A 路加薄片，追踪真正的零级亮纹',
    task: '把附加光程从 0 调到半个波长，再调到一个波长。比较原中心的明暗和红线标出的零级位置。',
    diagram: '上排为双缝原始条纹，下排为给 A 路加片后的条纹，红线标出各自的零级亮纹',
    controls: [{id:'added',label:'A 路附加光程',min:0,max:2,step:.05,value:.5,unit:'λ'}],
    choices: [{id:'none',label:'不加片',values:{added:0}},{id:'half',label:'增加半波长',values:{added:.5}},{id:'full',label:'增加一波长',values:{added:1}}],
    play: '连续加厚薄片', animate: 'added',
    reasoning: '把 A 侧记作负坐标，条纹间距固定为 2 mm。加片后 A 路总光程增加，新零级需要向 A 侧移动来抵消这段额外光程。增加一个整波长时图样看起来重合，但旧中心已变成另一级亮纹。',
    challenge: ['A 路多出一个波长，为什么条纹图样看起来没动，红线却移动了？','整幅条纹移动恰好一个周期，原来每个亮点都被邻级亮纹补上。红线跟踪的是两路总光程差为零的位置，而不是任意亮点。'],
  },
  'quantum-3': {
    mode: 'comptonMotion',
    title: '转动探测方向，比较散射波长与电子能量',
    task: '比较 0°、90°、180°。先预测哪个角度波长增加最多，再固定 90°，改变入射波长。',
    diagram: '入射光子、出射光子与反冲电子的方向。电子方向由二维动量守恒计算',
    controls: [
      {id:'angle',label:'光子散射角',min:0,max:180,step:5,value:90,unit:'°'},
      {id:'wavelength',label:'入射波长',min:20,max:100,step:5,value:70,unit:'pm'},
    ],
    choices: [{id:'forward',label:'前向 0°',values:{angle:0}},{id:'side',label:'侧向 90°',values:{angle:90}},{id:'back',label:'后向 180°',values:{angle:180}}],
    play: '转动探测方向', animate: 'angle',
    reasoning: '自由电子初始静止时，Δλ=(h/(m_e × c))(1−cosθ)，电子的康普顿波长约 2.426 pm。电子动量是入射光子动量减出射光子动量。箭头长度只示意方向，动能由两束光子的能量差求出。',
    challenge: ['固定 90°，把入射波长从 70 pm 减为 35 pm。波长增加量和电子获得的能量哪个变？','波长增加量保持 2.426 pm。短波长处同样的波长差对应更大的能量差，电子动能增加。'],
  },
};

export function unitLabMarkup(unit, lab = unitLabs[unit], anchor = `lab-${unit}`) {
  if (!lab) return '';
  const choices = (lab.choices ?? []).map(({id, label, toggle, values}) =>
    `<button type="button" data-choice="${id}"${toggle || values ? ' aria-pressed="false"' : ''}${values ? ` data-values="${encode(JSON.stringify(values))}"` : ''}>${lessonText(label)}</button>`).join('');
  const controls = (lab.controls ?? []).map(control => {
    const id = `${anchor}-${control.id}`;
    return `<div class="unit-lab-control"><label for="${id}">${lessonText(control.label)}</label><output data-value="${control.id}" for="${id}" aria-live="off"></output><input type="range" id="${id}" data-parameter="${control.id}" data-unit-label="${control.unit}" min="${control.min}" max="${control.max}" step="${control.step}" value="${control.value}"></div>`;
  }).join('');
  return `<section class="inline-lab unit-lab" id="${anchor}" tabindex="-1" data-unit-lab="${lab.mode}"${lab.animate ? ` data-animate="${lab.animate}"` : ''}${lab.loop ? ' data-loop' : ''} aria-label="${encode(lab.title)}">
    <header class="lab-header"><p class="lab-label">动手实验</p><h3>${lessonText(lab.title)}</h3><p class="lab-task">${lessonText(lab.task)}</p></header>
    <div class="unit-lab-stage"><canvas role="img" aria-label="${encode(lab.diagram)}"></canvas></div>
    <div class="unit-lab-actions"><div class="lab-presets">${choices}</div><div class="lab-play"><button type="button" data-play data-start-label="${encode(lab.play)}">${lessonText(lab.play)}</button><button type="button" data-reset>重置</button></div></div>
    ${controls ? `<div class="unit-lab-controls">${controls}</div>` : ''}
    <p class="lab-reading" data-reading></p>
    <details class="lab-reasoning"><summary>为什么会这样？</summary><p>${lessonText(lab.reasoning)}</p></details>
    ${lab.challenge ? `<details class="lab-challenge"><summary>预测一下</summary><p>${lessonText(lab.challenge[0])}</p><details><summary>核对推理</summary><p>${lessonText(lab.challenge[1])}</p></details></details>` : ''}
  </section>`;
}
