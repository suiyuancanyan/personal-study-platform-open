const figure = (example, name, alt, caption, extra = {}) => ({ example, src: `/figures/physics/${name}`, alt, caption, ...extra });

export const physicsExampleFigures = {
  'oscillation-1': [
    figure(2, 'oscillation-1-example-2.svg', '弹簧振子在正位移处受向左的回复力，配有位移、速度和加速度的时间曲线。', 'm=0.50 kg、k=50 N/m、A=4 cm：周期 0.628 s，最大加速度 4.0 m/s²。'),
  ],
  'oscillation-2': [
    figure(2, 'oscillation-2-example-2.svg', '简谐振动的相位矢量图用初位移 3 cm 和换算后的初速度分量 4 cm 求得振幅 5 cm 与初相。', 'x₀=3 cm、v₀=−16 cm/s、ω=4 rad/s：A=5 cm，φ≈0.927 rad。'),
  ],
  'oscillation-3': [
    figure(2, 'oscillation-3-example-2.svg', '位移为振幅的 0.6 倍时，弹性势能占总能量 36%；速度箭头指向左。', 'A=10 cm、ω=5 rad/s、x=6 cm：势能占比 0.36，速度为 −0.40 m/s。'),
  ],
  'waves-1': [
    figure(2, 'waves-1-example-2.svg', '空间快照标出相邻波峰间距 0.60 m，时间记录标出固定探头的 0.15 s 周期。', 'λ=0.60 m、T=0.15 s：f=6.67 Hz，v=4.0 m/s。'),
  ],
  'waves-2': [
    figure(2, 'waves-2-example-2.svg', '波形 y=0.02 cos(4πx+20πt) 向 x 负方向传播，波长 0.50 m，速度 5.0 m/s。', '从 k=4π rad/m、ω=20π rad/s 读取 λ=0.50 m、v=5.0 m/s。'),
  ],
  'waves-4': [
    figure(2, 'waves-4-example-2.svg', '两端固定的弦上有三个波腹，四个节点均匀分布在 0 至 0.90 m 之间。', 'L=0.90 m、v=36 m/s：λ=0.60 m、f=60 Hz，内部节点在 0.30 m 和 0.60 m。'),
  ],
  'optics-2': [
    figure(2, 'optics-2-example-2.svg', '杨氏双缝的两条光路在屏上相遇；标出了相邻明纹间距 3.0 mm 和首暗纹距中心 1.5 mm。', 'd=0.30 mm、D=1.5 m、λ=600 nm：Δx=3.0 mm，第一暗纹位于 ±1.5 mm。'),
  ],
  'optics-3': [
    figure(1, 'optics-3-example-1.svg', '空气、折射率 1.5 薄膜、空气的反射光在上界面有一次 π 相变，下界面没有。', 'λ₀=600 nm：最小反射加强膜厚 d=λ₀/(4n)=100 nm。'),
  ],
  'optics-4': [
    figure(2, 'optics-4-example-2.svg', '空气劈尖沿长度方向线性增厚；等厚条纹间距为 0.30 mm。', 'λ₀=600 nm、相邻暗纹间距 0.30 mm：α=0.001 rad，距棱边 4.5 mm 处膜厚 4.5 μm。'),
  ],
  'optics-5': [
    figure(2, 'optics-5-example-2.svg', '牛顿环同心圆示意图标记了第 3 和第 8 暗环半径。', 'λ=600 nm、r₈²−r₃²=3.0 mm²：曲率半径 R=1.0 m。'),
  ],
  'optics-6': [
    figure(1, 'optics-6-example-1.svg', '单缝两侧第一暗纹间距构成中央亮纹宽度；图上标出首暗纹角和 2 cm 的中央宽度。', 'λ=500 nm、a=0.10 mm、L=2.0 m：首暗纹离中心 1.0 cm，中央亮纹宽 2.0 cm。'),
  ],
  'optics-7': [
    figure(1, 'optics-7-example-1.svg', '光栅相邻狭缝的程差 d sinθ=λ 决定一级主极大，左右对称。', 'd=2.0 μm、λ=0.50 μm：一级衍射角 θ≈14.5°。'),
  ],
  'optics-8': [
    figure(1, 'optics-8-example-1.svg', '自然光通过第一片偏振片后变为线偏振光，再经夹角 60° 的第二片后强度为 I₀/8。', '先减半，再乘 cos²60°=1/4，最终 I₂=I₀/8。'),
  ],
  'optics-10': [
    figure(1, 'optics-10-example-1.svg', '空气劈尖在 A 处由 500 nm 下的第四暗纹转为 600 nm 下的第三级亮纹；图示棱边至 A 的范围及明暗条纹。', '原题第 11 题：α≈4.81×10⁻⁵ rad；换用 600 nm 后 A 是亮纹，棱边至 A 有 3 条亮纹和 3 条暗纹。', { source: '11-3 作业.pdf', sourceHref: '/materials/optics/3#page=9' }),
  ],
  'optics-12': [
    figure(1, 'optics-12-example-1.svg', '固定观察点 P 对应的程差随缝宽减半而减半；原来的四个半波带变为两个。', 'P 原为第二暗纹：a sinθ=2λ；a 减半后程差为 λ，半波带数 4→2，条纹级次由第二暗纹变为第一暗纹。', { source: '11-4 作业.pdf', sourceHref: '/materials/optics/4#page=5' }),
  ],
  'relativity-2': [
    figure(2, 'relativity-2-example-2.svg', '同时发生且相距 300 m 的两个事件，在以 0.60c 向正方向运动的参考系中有时间先后。', 'Δx=300 m、Δt=0、v=0.60c：洛伦兹变换得到 Δt′=−0.75 μs。'),
  ],
  'relativity-3': [
    figure(1, 'relativity-3-example-1.svg', '运动钟与沿运动方向的尺分别展示时间膨胀和长度收缩。', 'v=0.60c、固有时 4 s、静长 10 m：γ=1.25，地面测得 5.0 s 与 8.0 m。'),
  ],
  'relativity-4': [
    figure(2, 'relativity-4-example-2.svg', '总能量、静能和动能以同一刻度的比例方框展示，并标注 pc 的数值。', 'v=0.60c、mc²=2 MeV：E=2.50 MeV，K=0.50 MeV，pc=1.50 MeV。'),
  ],
  'quantum-2': [
    figure(2, 'quantum-2-example-2.svg', '光子能量超过逸出功 1.10 eV；电子最大动能对应 1.10 V 遏止电压。', 'λ=400 nm、W=2.0 eV：Eγ=3.10 eV，Kmax=1.10 eV，Us=1.10 V。'),
  ],
  'quantum-4': [
    figure(2, 'quantum-4-example-2.svg', '氢原子 n=3 到 n=2 的向下跃迁释放 1.89 eV 光子，对应约 656 nm 红光。', 'Eₙ=−13.6/n² eV：n=3→2 发射谱线 λ≈656 nm。'),
  ],
  'quantum-6': [
    figure(2, 'quantum-6-example-2.svg', '一维无限深势阱中 n=2 波函数在中心 x=L/2 有内部节点，n=3 到 n=2 释放 2.50 eV。', 'E₁=0.50 eV：E₃=4.50 eV、E₂=2.00 eV、ΔE=2.50 eV。'),
  ],
};
