import { writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const figs = [
['oscillation-1-example-2.svg','弹簧振子｜求周期与最大加速度｜m = 0.50 kg，k = 50 N/m，A = 4 cm',[
['系统参数','ω = √(k/m) = 10 rad/s','T = 2π/ω = 0.628 s'],['回复力与加速度','x = +4 cm 时：F 指向左','a_max = ω²A = 4.0 m/s²'],['时序关系','x(t) = 4 cos(10t) cm','a(t) = −100x(t)']],'spring'],
['oscillation-2-example-2.svg','用初位移和初速度确定振幅与初相｜ω = 4 rad/s，x₀ = 3 cm，v₀ = −16 cm/s',[
['初始状态','cos φ = x₀/A','v₀ = −Aω sin φ < 0'],['振幅','A² = x₀² + (v₀/ω)²','A = √(3² + 4²) = 5 cm'],['初相象限','cos φ = 3/5，sin φ = 4/5','φ = atan2(4,3) ≈ 0.927 rad']],'phase'],
['oscillation-3-example-2.svg','简谐振动的速度方向和能量比例｜A = 10 cm，ω = 5 rad/s，x = 6 cm，向左运动',[
['位移决定能量比例','Eₚ/E = x²/A²','= 0.6² = 0.36'],['速度大小','|v| = ω√(A²−x²)','= 5×0.08 = 0.40 m/s'],['方向判定','此刻向左运动','v = −0.40 m/s']],'energy'],
['waves-1-example-2.svg','从空间快照和时间记录求波速｜波峰在 x = 0.2 m、0.8 m；探头每 0.15 s 见一次峰',[
['空间快照','λ = 0.8 − 0.2 = 0.60 m','相邻波峰给出波长'],['固定探头','T = 0.15 s','f = 1/T = 6.67 Hz'],['传播速度','v = λ/T = fλ','v = 0.60/0.15 = 4.0 m/s']],'wave'],
['waves-2-example-2.svg','从波动方程判断传播方向｜y = 0.02 cos(4πx + 20πt)',[
['标准形式','y = A cos(kx + ωt)','“+”表示沿 −x 传播'],['波长','k = 4π rad/m','λ = 2π/k = 0.50 m'],['波速与周期','ω = 20π rad/s','v = ω/k = 5.0 m/s']],'direction'],
['waves-4-example-2.svg','两端固定弦上有三个波腹｜L = 0.90 m，波速 36 m/s',[
['数波腹定模态','3 个波腹 → n = 3','L = nλ/2'],['波长与频率','λ = 2L/n = 0.60 m','f = v/λ = 60 Hz'],['节点位置','x = 0，0.30，0.60，0.90 m','相邻节点间距 λ/2']],'standing'],
['optics-2-example-2.svg','杨氏双缝的明暗条纹位置｜d = 0.30 mm，D = 1.5 m，λ = 600 nm',[
['相邻明纹间距','Δx = λD/d','= 3.0 mm'],['第一暗纹条件','到中心的程差 = λ/2','y₁ = Δx/2 = 1.5 mm'],['屏上级次','明：0，±3，±6 mm…','暗：±1.5，±4.5 mm…']],'double'],
['optics-3-example-1.svg','薄膜反射的半波损失｜空气／n = 1.5 薄膜／空气，λ₀ = 600 nm',[
['两次界面反射','上表面：低 n → 高 n，变相 π','下表面：高 n → 低 n，不变相'],['相对相位','薄膜往返相位 = 4πnd/λ₀','另有一次相对 π 相变'],['最小反射加强','4πnd/λ₀ + π = 2π','d = λ₀/(4n) = 100 nm']],'film'],
['optics-4-example-2.svg','空气劈尖的厚度与条纹｜λ₀ = 600 nm，暗纹间距 0.30 mm；求 α 与 x = 4.5 mm 处厚度',[
['条纹间距反推角度','b = λ/(2α)','α = 0.001 rad'],['沿劈尖线性增厚','t(x) ≈ αx','t(4.5 mm) = 4.5 μm'],['反射条纹标记','相邻同类暗纹差 Δt = λ/2','等厚线横向间距 b = 0.30 mm']],'wedge'],
['optics-5-example-2.svg','牛顿环由半径平方差求曲率半径｜λ = 600 nm；r₈² − r₃² = 3.0 mm²',[
['暗环关系','rₘ² = mλR','Δ(r²) = (8−3)λR'],['代入统一单位','λ = 0.00060 mm','R = 3.0/(5×0.00060) mm'],['结果','R = 1000 mm','即曲率半径 1.0 m']],'rings'],
['optics-6-example-1.svg','单缝第一暗纹与中央亮纹宽度｜λ = 500 nm，a = 0.10 mm，L = 2.0 m',[
['第一暗纹条件','a sinθ₁ = λ','θ₁ ≈ λ/a = 0.005 rad'],['单侧位置','y₁ ≈ Lθ₁','y₁ = 0.010 m = 1.0 cm'],['中央亮纹','两侧第一暗纹之间','W ≈ 2Lλ/a = 2.0 cm']],'slit'],
['optics-7-example-1.svg','光栅一级衍射角｜光栅常数 d = 2.0 μm，λ = 0.50 μm',[
['相邻缝程差','d sinθ = mλ','m = 1'],['求衍射角','sinθ = 0.50/2.0 = 0.25','θ ≈ 14.5°'],['左右对称级次','m = +1：+14.5°','m = −1：−14.5°']],'grating'],
['optics-8-example-1.svg','自然光通过两片偏振片｜两透射轴夹角 60°',[
['第一片：自然光','I₁ = I₀/2','输出为线偏振光'],['第二片：马吕斯定律','I₂ = I₁ cos²60°','I₂ = I₀/8'],['强度比例','入射：1','出射：0.125']],'polar'],
['optics-10-example-1.svg','空气劈尖更换波长后判断条纹｜500 nm 时 A 为第四条暗纹，棱边距 A 为 1.56 cm',[
['由旧波长求膜厚','2e + 250 nm = 7×250 nm','e = 750 nm'],['劈尖角','α ≈ e/l','α ≈ 4.81×10⁻⁵ rad'],['改用 600 nm','2e + 300 nm = 1800 nm = 3λ','A 为第三级亮纹；区间内 3 明、3 暗']],'wedgeOriginal'],
['optics-12-example-1.svg','固定屏点的单缝半波带｜P 原为第二暗纹，缝宽减半',[
['原缝宽 a','a sinθ = 2λ','跨越 4 个半波带'],['固定 P，θ 不变','缝宽减半，程差也减半','a/2 sinθ = λ'],['重新判定级次','半波带数 4 → 2','第二暗纹 → 第一暗纹']],'halfBands'],
['relativity-2-example-2.svg','同时性的相对性｜Δx = 300 m，S′ 以 0.60c 向 +x 运动',[
['S 系给定','Δt = 0','事件 2 位于 +x 方向'],['洛伦兹变换','Δt′ = γ(Δt − vΔx/c²)','γ = 1.25'],['时间间隔','Δt′ = −γ(0.60)(300 m)/c','Δt′ = −0.75 μs']],'spacetime'],
['relativity-3-example-1.svg','时间膨胀与长度收缩｜v = 0.60c，钟的固有时间 4 s，尺静长 10 m',[
['洛伦兹因子','γ = 1/√(1−0.60²)','γ = 1.25'],['运动钟','Δt = γΔτ','地面测得 5.0 s'],['沿运动方向的尺','L = L₀/γ','地面测得 8.0 m']],'relmeas'],
['relativity-4-example-2.svg','相对论总能、动能和动量｜v = 0.60c，静能 mc² = 2 MeV',[
['洛伦兹因子','γ = 1.25','β = 0.60'],['能量','E = γmc² = 2.50 MeV','K = (γ−1)mc² = 0.50 MeV'],['动量与校核','pc = γβmc² = 1.50 MeV','E² = (pc)² + (mc²)²']],'energyrel'],
['quantum-2-example-2.svg','光电效应的遏止电压｜λ = 400 nm，逸出功 W = 2.0 eV',[
['光子能量','Eγ = hc/λ','≈ 1240/400 = 3.10 eV'],['能量守恒','Kmax = Eγ − W','= 1.10 eV'],['遏止电压','eUs = Kmax','Us = 1.10 V']],'photo'],
['quantum-4-example-2.svg','氢原子 n = 3 到 n = 2 的发射谱线｜Eₙ = −13.6/n² eV',[
['跃迁能量','E₃ = −1.51 eV，E₂ = −3.40 eV','发射 ΔE = 1.89 eV'],['光子波长','λ = hc/ΔE','≈ 1240/1.89 = 656 nm'],['谱线位置','可见光红色区域','能量下降，发射光子']],'levels'],
['quantum-6-example-2.svg','无限深势阱 n = 3 降到 n = 2｜E₁ = 0.50 eV',[
['能级按 n² 增长','E₃ = 9E₁ = 4.50 eV','E₂ = 4E₁ = 2.00 eV'],['释放能量','ΔE = E₃ − E₂','ΔE = 2.50 eV'],['n = 2 波函数节点','ψ₂ ∝ sin(2πx/L)','内部节点：x = L/2']],'well'],
];
function esc(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function svg([file,title,rows,kind]){
const titleParts=title.split('｜');
const heading=titleParts.shift();
const detail=titleParts.join(' · ');
const [a,b,c]=rows;
let art='';
const line=(x1,y1,x2,y2,color='#285c78',w=5,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const txt=(x,y,t,size=22,color='#273d4b',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(t)}</text>`;
if(kind==='spring'){
 art=`${line(100,330,500,330,'#80939d',3)}${line(125,290,125,370,'#355b6d',6)}<path d="M125 330 L160 330 L178 305 L202 355 L226 305 L250 355 L274 305 L298 355 L322 305 L346 355 L370 330 L425 330" fill="none" stroke="#b77936" stroke-width="7"/> <rect x="425" y="285" width="75" height="90" rx="10" fill="#d9e8ef" stroke="#285c78" stroke-width="4"/>${txt(444,335,'m',28)}${line(405,400,520,400,'#3a8a66',5,'marker-end="url(#arrow)"')}${txt(438,432,'x = +A',20,'#3a8a66')}${txt(100,225,'回复力 ←',23,'#b55749')}${txt(100,470,'x(t)',20)}<path d="M145 470 C205 390 265 390 325 470 S445 550 505 470" fill="none" stroke="#386f91" stroke-width="5"/>`;
}else if(kind==='phase'||kind==='energy'||kind==='wave'||kind==='direction'||kind==='standing'){
 const axes=`${line(105,485,510,485,'#71848e',3)}${line(125,540,125,225,'#71848e',3)}`;
 if(kind==='phase') art=`${axes}<circle cx="125" cy="485" r="5" fill="#334b57"/>${line(125,485,365,335,'#d08543',8,'marker-end="url(#arrow)"')}${line(125,485,365,485,'#6997ab',3,'stroke-dasharray="8 8"')}${line(365,485,365,335,'#6997ab',3,'stroke-dasharray="8 8"')}${txt(375,350,'(x₀, −v₀/ω)',20)}${txt(90,520,'0',18)}${txt(275,520,'3 cm',18)}${txt(385,300,'4 cm',18)}${txt(240,275,'A = 5 cm',22,'#a46327')}`;
 else if(kind==='energy') art=`${axes}<path d="M145 460 C210 325 260 255 305 245 C365 270 420 350 490 460" fill="none" stroke="#c87b3a" stroke-width="6"/>${line(145,460,490,460,'#357a67',5)}${line(330,485,330,245,'#8f657f',3,'stroke-dasharray="9 7"')}${txt(90,220,'能量 E',20)}${txt(314,520,'x = 6 cm',18)}${txt(157,440,'Eₚ/E = 0.36',19,'#a05e2a')}${txt(372,448,'动能 0.64E',19,'#28765e')}`;
 else if(kind==='wave') art=`${axes}<path d="M135 350 C170 250 205 250 240 350 S310 450 345 350 S415 250 450 350 S485 430 510 350" fill="none" stroke="#357a9b" stroke-width="5"/>${line(240,420,450,420,'#ba7a3c',3,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(315,455,'λ = 0.60 m',19,'#a2642d')}${line(300,260,300,205,'#528468',5,'marker-end="url(#arrow)"')}${txt(317,225,'传播方向',19,'#528468')}`;
 else if(kind==='direction') art=`${axes}<path d="M130 365 C175 255 225 255 270 365 S365 475 410 365 S480 255 515 365" fill="none" stroke="#357a9b" stroke-width="5"/>${line(440,230,250,230,'#438064',5,'marker-end="url(#arrow)"')}${txt(270,205,'沿 −x 传播',21,'#438064')}${line(175,450,365,450,'#ba7a3c',3,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(220,478,'λ = 0.50 m',18,'#a2642d')}`;
 else art=`${line(110,485,520,485,'#334d5c',6)}<path d="M110 485 Q180 235 250 485 Q320 235 390 485 Q455 235 520 485" fill="none" stroke="#4b8f80" stroke-width="6"/>${[110,250,390,520].map(x=>line(x,455,x,510,'#c16757',5)).join('')}${txt(160,235,'3 个波腹',22,'#3d796b')}${txt(132,540,'0',17)}${txt(232,540,'0.30 m',17)}${txt(370,540,'0.60 m',17)}${txt(483,540,'0.90 m',17)}`;
}else if(kind==='double'){
 art=`${line(150,230,150,470,'#334d5c',6)}${line(150,300,190,300,'#fafcff',13)}${line(150,400,190,400,'#fafcff',13)}${txt(105,210,'双缝',18)}${line(195,300,485,335,'#5290a8',3)}${line(195,400,485,335,'#bd8246',3)}${line(490,240,490,470,'#334d5c',7)}${[265,300,335,370,405,440].map((y,i)=>line(490,y,515,y,i%2?'#7da8bb':'#c4734b',8)).join('')}${txt(525,280,'明',18,'#a65d3a')}${txt(525,375,'暗',18,'#486f80')}${line(550,300,550,335,'#8a607e',3,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(565,326,'1.5 mm',19,'#775169')}`;
}else if(kind==='film'){
 art=`${line(110,390,500,390,'#758992',7)}${line(110,470,500,470,'#758992',7)}<path d="M110 390 L500 390 L500 470 L110 470 Z" fill="#dcebf0" opacity="0.9"/>${txt(120,445,'薄膜 n = 1.5',20,'#315a6d')}${line(200,220,310,385,'#bb7740',5,'marker-end="url(#arrow)"')}${line(310,385,420,220,'#447f9a',5,'marker-end="url(#arrow)"')}${line(270,245,190,375,'#a45d50',5,'marker-end="url(#arrow)"')}${txt(280,215,'入射',18)}${txt(362,260,'往返光程',18,'#376f87')}${txt(105,520,'上反射 π；下反射 0 → 相对相变 π',19,'#7e4d53')}`;
}else if(kind==='wedge'){
 art=`${line(100,425,520,425,'#596e79',8)}<path d="M100 420 L520 300 L520 420 Z" fill="#d9e9ef" stroke="#47768a" stroke-width="2"/>${line(125,370,490,370,'#4f91a8',4,'stroke-dasharray="9 7"')}${line(130,445,490,445,'#b77c40',3,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(250,475,'条纹间距 b = 0.30 mm',18,'#98632e')}${line(150,420,150,405,'#8d617e',3,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(165,400,'t = αx',18,'#775169')}${txt(110,345,'t=0',17)}${txt(435,337,'t=4.5 μm',18,'#315f76')}${txt(485,405,'α',20,'#b75e4b')}`;
}else if(kind==='wedgeOriginal'){
 art=`${line(115,430,510,430,'#596e79',8)}<path d="M115 425 L510 295 L510 425 Z" fill="#d9e9ef" stroke="#47768a" stroke-width="2"/>${line(145,416,475,310,'#4f91a8',4,'stroke-dasharray="10 9"')}${line(145,400,475,400,'#bd7850',4,'stroke-dasharray="13 8"')}${line(145,382,475,382,'#4f91a8',4,'stroke-dasharray="10 9"')}${line(145,364,475,364,'#bd7850',4,'stroke-dasharray="13 8"')}${line(145,345,475,345,'#4f91a8',4,'stroke-dasharray="10 9"')}${line(145,327,475,327,'#bd7850',4,'stroke-dasharray="13 8"')}${line(447,430,447,316,'#725676',3,'stroke-dasharray="6 6"')}${txt(350,460,'棱边至 A：1.56 cm',18,'#725676')}${txt(400,300,'A',22,'#a35f44')}${txt(105,495,'旧光：A 为第 4 条暗纹',18,'#4c7b90')}${txt(105,525,'换 600 nm：A 落在第 3 级亮纹',18,'#9e673b')}${txt(105,555,'同一区间：3 条亮纹、3 条暗纹',18,'#3f765d')}`;
}else if(kind==='halfBands'){
 art=`${txt(105,225,'原缝宽 a',20,'#3a6479')}${txt(365,225,'缝宽减半 a/2',20,'#a16a38')}${line(205,260,205,470,'#526d78',8)}${[0,1,2,3].map(i=>`<rect x="212" y="${270+i*46}" width="82" height="42" fill="${i%2?'#f1e3d1':'#dcebf0'}" stroke="${i%2?'#bd7a42':'#5289a0'}" stroke-width="2"/>${txt(243,299+i*46,`半波带 ${i+1}`,15,'#344d59')}`).join('')}${line(294,290,330,290,'#517e92',3,'marker-end="url(#arrow)"')}${line(294,382,330,382,'#517e92',3,'marker-end="url(#arrow)"')}${line(380,315,380,420,'#526d78',8)}${[0,1].map(i=>`<rect x="387" y="${322+i*48}" width="82" height="44" fill="${i?'#f1e3d1':'#dcebf0'}" stroke="${i?'#bd7a42':'#5289a0'}" stroke-width="2"/>${txt(416,350+i*48,`半波带 ${i+1}`,15,'#344d59')}`).join('')}${line(469,340,510,340,'#517e92',3,'marker-end="url(#arrow)"')}${txt(112,515,'程差 2λ · 4 带两两抵消',18,'#3c7186')}${txt(365,515,'程差 λ · 2 带抵消',18,'#9c6637')}`;
}else if(kind==='rings'){
 art=`<circle cx="300" cy="365" r="132" fill="none" stroke="#4f94aa" stroke-width="5"/><circle cx="300" cy="365" r="108" fill="none" stroke="#bd7e40" stroke-width="4"/><circle cx="300" cy="365" r="78" fill="none" stroke="#4f94aa" stroke-width="5"/><circle cx="300" cy="365" r="48" fill="none" stroke="#bd7e40" stroke-width="4"/><circle cx="300" cy="365" r="15" fill="#647b84"/>${line(300,365,432,365,'#8c5f79',4,'marker-end="url(#arrow)"')}${txt(440,372,'r₈',19,'#775169')}${line(300,365,378,365,'#43806c',4,'marker-end="url(#arrow)"')}${txt(383,348,'r₃',18,'#3d775f')}${txt(100,545,'r₈² − r₃² = 5λR = 3.0 mm²',21,'#3e5d6b')}`;
}else if(kind==='slit'){
 art=`${line(115,250,115,485,'#344e5c',8)}${line(115,345,155,345,'#ffffff',14)}${line(115,390,155,390,'#ffffff',14)}${txt(82,230,'缝 a',17)}${line(160,345,470,270,'#4b8ca3',3)}${line(160,390,470,465,'#b97941',3)}${line(490,220,490,505,'#344e5c',7)}${line(475,300,505,300,'#bb7049',8)}${line(475,430,505,430,'#bb7049',8)}${line(545,300,545,430,'#80617d',3,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(555,372,'W = 2 cm',20,'#755473')}${line(200,340,350,303,'#4b8ca3',3,'stroke-dasharray="8 8"')}${txt(230,292,'θ₁',18,'#3d7085')}`;
}else if(kind==='grating'){
 art=`${Array.from({length:6},(_,i)=>line(115+i*34,280,115+i*34,450,'#344e5c',5)).join('')}${txt(112,480,'相邻缝距 d = 2.0 μm',18)}${line(355,365,500,260,'#4c8ba2',4)}${line(355,365,500,365,'#667e89',3)}${line(400,365,460,365,'#bf7a3d',3,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(415,395,'d',18,'#a16634')}${line(485,265,485,365,'#98718b',3,'stroke-dasharray="6 6"')}${txt(500,320,'θ = 14.5°',20,'#795b74')}${txt(150,235,'d sinθ = λ',22,'#365e72')}`;
}else if(kind==='polar'){
 art=`${line(100,360,170,360,'#ba7b3e',8,'marker-end="url(#arrow)"')}${[230,355].map((x,i)=>`<rect x="${x}" y="270" width="34" height="180" rx="7" fill="#e1edf1" stroke="#456f82" stroke-width="4"/><g stroke="#6c91a0" stroke-width="3">${Array.from({length:8},(_,j)=>line(x+4,285+j*21,x+30,285+j*21)).join('')}</g>`).join('')}${line(264,360,355,360,'#528ba0',7,'marker-end="url(#arrow)"')}${line(388,360,490,360,'#4a9276',7,'marker-end="url(#arrow)"')}${txt(210,240,'轴 0°',18)}${txt(342,240,'轴 60°',18)}${txt(135,500,'I₀',19,'#a26735')}${txt(250,500,'I₀/2',19,'#3a7084')}${txt(370,500,'I₀/8',19,'#3a7860')}`;
}else if(kind==='spacetime'){
 art=`${line(125,465,500,465,'#526c79',3)}${line(200,520,200,230,'#526c79',3)}${txt(505,470,'x',19)}${txt(182,220,'ct',19)}${line(200,465,455,260,'#b76f48',4)}${line(200,465,265,260,'#4c88a1',4)}${line(200,465,200,260,'#6a9a78',3,'stroke-dasharray="7 7"')}${line(265,465,265,420,'#6a9a78',3,'stroke-dasharray="7 7"')}${circle(200,465,10,'#466f84')}${circle(265,465,10,'#bd7545')}${txt(95,500,'event 1',17)}${txt(270,500,'event 2: +300 m',17)}${txt(335,295,'light',17,'#ac6846')}${txt(205,285,'S 同时轴',17,'#588361')}${txt(310,230,'S′ 中 Δt′ = −0.75 μs',20,'#765779')}`;
}else if(kind==='relmeas'){
 art=`${line(130,320,475,320,'#566e79',3)}${line(130,400,475,400,'#566e79',3)}${line(130,320,130,400,'#bd7b3f',7)}${line(475,320,475,400,'#bd7b3f',7)}${line(130,365,475,365,'#4c8ba1',4,'marker-end="url(#arrow)"')}${txt(250,300,'L₀ = 10 m',20,'#385d70')}${line(175,470,430,470,'#548f76',4,'marker-start="url(#arrow)" marker-end="url(#arrow)"')}${txt(238,510,'L = L₀/γ = 8 m',20,'#3e795f')}${txt(155,230,'沿运动方向测长',19)}`;
}else if(kind==='energyrel'){
 art=`<rect x="130" y="250" width="120" height="160" rx="12" fill="#dceaf0" stroke="#3e7185" stroke-width="4"/><rect x="300" y="210" width="120" height="200" rx="12" fill="#e9ded1" stroke="#a56c3d" stroke-width="4"/><rect x="470" y="370" width="70" height="40" rx="8" fill="#dcebe1" stroke="#52836b" stroke-width="4"/>${txt(155,340,'静能',22)}${txt(330,320,'总能',22)}${txt(487,398,'K',18)}${txt(135,450,'2.00 MeV',19)}${txt(300,450,'2.50 MeV',19)}${txt(450,450,'0.50 MeV',18)}${txt(180,225,'E = γmc²',18,'#3d7185')}${txt(320,185,'γ = 1.25',18,'#9b6339')}`;
}else if(kind==='photo'){
 art=`${line(115,260,235,330,'#bd7a3e',6,'marker-end="url(#arrow)"')}${line(115,345,235,345,'#bd7a3e',6,'marker-end="url(#arrow)"')}${line(115,430,235,360,'#bd7a3e',6,'marker-end="url(#arrow)"')}<rect x="235" y="255" width="32" height="160" fill="#e4edf0" stroke="#3e7084" stroke-width="4"/>${[0,1,2].map((i)=>`<circle cx="310" cy="${285+i*55}" r="8" fill="#9c6b8f"/>${line(270,285+i*55,365,285+i*55,'#528b71',4,'marker-end="url(#arrow)"')}`).join('')}${line(395,250,395,430,'#617782',5)}${line(455,250,455,430,'#617782',5)}${txt(100,230,'光子 3.10 eV',19,'#986332')}${txt(280,460,'电子 Kmax = 1.10 eV',18,'#3f7d65')}${txt(390,230,'Us = 1.10 V',19,'#765476')}`;
}else if(kind==='levels'){
 art=`${line(120,450,510,450,'#576f7a',3)}${line(185,410,420,410,'#447f95',6)}${line(185,290,420,290,'#bd7b42',6)}${line(185,230,420,230,'#bd7b42',6)}${txt(125,418,'n=1',18)}${txt(125,298,'n=2',18)}${txt(125,238,'n=3',18)}${line(300,245,300,280,'#658b6e',5,'marker-end="url(#arrow)"')}${txt(315,272,'发射 1.89 eV',18,'#3c735b')}${txt(185,500,'λ ≈ 656 nm（红光）',21,'#a84d48')}`;
}else if(kind==='well'){
 art=`${line(130,430,130,255,'#334f5d',8)}${line(130,430,490,430,'#334f5d',8)}${line(490,430,490,255,'#334f5d',8)}<path d="M130 430 C180 330 240 330 310 430 S430 530 490 430" fill="none" stroke="#4b8ca2" stroke-width="5"/><path d="M130 430 C180 245 240 245 310 430 S430 610 490 430" fill="none" stroke="#c17a40" stroke-width="5"/>${line(310,245,310,430,'#8e6280',3,'stroke-dasharray="7 7"')}${txt(160,310,'n=2：E₂ = 2.00 eV',19,'#3c7186')}${txt(160,220,'n=3：E₃ = 4.50 eV',19,'#9b653a')}${txt(325,405,'节点 L/2',18,'#785674')}${txt(180,500,'ΔE = 2.50 eV',21,'#3f775e')}`;
}
function circle(cx,cy,r,fill){return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`}
return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">三栏图解，按已知量、关键关系和计算结果说明例题。</desc><defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="context-stroke"/></marker></defs><rect width="1200" height="650" rx="26" fill="#fbfcfa"/><text x="54" y="48" font-size="27" font-weight="700" fill="#253e4b" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">${esc(heading)}</text><text x="54" y="79" font-size="16" fill="#526d79" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">${esc(detail)}</text><rect x="45" y="105" width="1110" height="500" rx="20" fill="#fff" stroke="#d9e2e3" stroke-width="2"/><g font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">${art}<g transform="translate(625,150)"><text x="0" y="0" font-size="20" font-weight="700" fill="#49788b">${esc(a[0])}</text><text x="0" y="48" font-size="20" fill="#273d4b">${esc(a[1])}</text><text x="0" y="86" font-size="20" fill="#273d4b">${esc(a[2])}</text><path d="M0 114 H475" stroke="#e2e8e8" stroke-width="2"/><text x="0" y="157" font-size="20" font-weight="700" fill="#a16d38">${esc(b[0])}</text><text x="0" y="205" font-size="20" fill="#273d4b">${esc(b[1])}</text><text x="0" y="243" font-size="20" fill="#273d4b">${esc(b[2])}</text><path d="M0 271 H475" stroke="#e2e8e8" stroke-width="2"/><text x="0" y="314" font-size="20" font-weight="700" fill="#4b806b">${esc(c[0])}</text><text x="0" y="362" font-size="20" fill="#273d4b">${esc(c[1])}</text><text x="0" y="400" font-size="20" fill="#273d4b">${esc(c[2])}</text></g></g></svg>`;
}
for(const item of figs) await writeFile(new URL(item[0],root),svg(item),'utf8');
console.log(`Wrote ${figs.length} SVG diagrams`);
