// Curated worked-example figures for the analog electronics lessons.
export const analogExampleFigures = {
  "pn-junction-5": [
    {
      "example": 1,
      "src": "/figures/analog/pn-diode-series.svg",
      "alt": "5 V 电源、正向硅二极管与 1 kΩ 串联闭合回路，标出 0.7 V 管压降和 4.3 mA 电流。",
      "caption": "先扣除硅管压降，再用电阻上的 4.3 V 求回路电流。",
      "source": "第一章完整课件",
      "sourceHref": "/materials/pn-junction/1"
    }
  ],
  "fet-4": [
    {
      "example": 1,
      "src": "/figures/analog/fet-common-source-gain.svg",
      "alt": "共源放大器交流等效电路，RD 为 3 kΩ、RL 为 6 kΩ，源极交流接地，输出反相。",
      "caption": "RD 与 RL 并联为 2 kΩ，乘以 2 mS 跨导后得到 Av 约 −4。",
      "source": "原授课课件",
      "sourceHref": "/materials/fet/1"
    }
  ],
  "bjt-3": [
    {
      "example": 1,
      "src": "/figures/analog/bjt-load-line.svg",
      "alt": "12 V 电源与 3 kΩ 集电电阻的直流负载线，从 IC=0、VCE=12 V 到 VCE=0、IC=4 mA，Q 点位于 6 V、2 mA。",
      "caption": "由两个截距画出负载线，静态工作点 Q 为 (6 V, 2 mA)。",
      "source": "原授课课件",
      "sourceHref": "/materials/bjt/1"
    }
  ],
  "frequency-3": [
    {
      "example": 1,
      "src": "/figures/analog/frequency-rc-lowpass.svg",
      "alt": "1 kΩ 串联电阻、100 nF 对地电容构成低通，输出取电容端，截止点约 1.59 kHz 且幅度为 0.707。",
      "caption": "电路连接、输出位置和截止点幅频关系对应同一个 RC 低通。",
      "source": "原授课课件",
      "sourceHref": "/materials/frequency/1"
    }
  ],
  "differential-1": [
    {
      "example": 1,
      "src": "/figures/analog/differential-inputs.svg",
      "alt": "差分输入 v+ 为 1.01 V、v− 为 0.99 V，差模 20 mV，共模 1.00 V；共同增加 0.2 V 后差模不变。",
      "caption": "差模用两路之差，共模用两路平均值。",
      "source": "原授课课件",
      "sourceHref": "/materials/differential/1"
    }
  ],
  "feedback-3": [
    {
      "example": 1,
      "src": "/figures/analog/feedback-loop-gain.svg",
      "alt": "闭环负反馈框图，前向增益 A=100，反馈系数 β=0.1，环路增益 10，闭环增益约 9.09。",
      "caption": "环路增益为 10，精确闭环增益为 100/11。",
      "source": "原授课课件",
      "sourceHref": "/materials/feedback/1"
    }
  ],
  "opamp-2": [
    {
      "example": 1,
      "src": "/figures/analog/opamp-summing-amplifier.svg",
      "alt": "反相求和运放，两路 1 V 和 2 V 经相等电阻输入，反馈电阻相等，虚地节点汇流，输出为 −3 V。",
      "caption": "相等电阻比下，输出是两路输入之和取反。",
      "source": "原授课课件",
      "sourceHref": "/materials/opamp/1"
    }
  ],
  "power-1": [
    {
      "example": 1,
      "src": "/figures/analog/power-speaker-watt.svg",
      "alt": "峰值 4 V 的正弦电压加在 8 Ω 扬声器上，均方根值约 2.828 V，平均功率为 1 W。",
      "caption": "从峰值换算到均方根值后，再计算负载平均功率。",
      "source": "原授课课件",
      "sourceHref": "/materials/power/1"
    }
  ],
  "oscillator-3": [
    {
      "example": 1,
      "src": "/figures/analog/oscillator-wien-bridge.svg",
      "alt": "等值 R=10 kΩ、C=10 nF 的文氏桥选频网络连接运放正反馈，频率约 1.59 kHz，β 约 1/3，稳幅增益约 3。",
      "caption": "选频网络给出零相移频率，负反馈设置所需放大倍数。",
      "source": "正弦波振荡器课件",
      "sourceHref": "/materials/oscillator/1"
    }
  ],
  "am-1": [
    {
      "example": 1,
      "src": "/figures/analog/am-envelope-depth.svg",
      "alt": "AM 波形正包络最大 3 V、最小 1 V，中值载波幅度 2 V，调制度为 0.5。",
      "caption": "包络峰谷直接给出载波幅度与 50% 调制度。",
      "source": "调制及解调课件",
      "sourceHref": "/materials/am/1"
    }
  ],
  "pn-junction-6": [
    {
      "example": 1,
      "src": "/figures/analog/pn-zener-regulator.svg",
      "alt": "9 V 输入经 1 kΩ 电阻接 5 V 稳压输出，负载 2 mA 与稳压管并联，支路电流为 2 mA。",
      "caption": "4 mA 串联电流分为 2 mA 负载电流和 2 mA 稳压管电流。",
      "source": "第一章完整课件",
      "sourceHref": "/materials/pn-junction/1"
    }
  ],
  "bjt-4": [
    {
      "example": 1,
      "src": "/figures/analog/bjt-output-headroom.svg",
      "alt": "输出静态值 7 V，边界为 0.2 V 与 10 V；向上余量 3 V、向下余量 6.8 V。",
      "caption": "输出向上余量较小，对称输出峰值最多约 3 V。",
      "source": "原授课课件",
      "sourceHref": "/materials/bjt/1"
    }
  ],
  "opamp-3": [
    {
      "example": 1,
      "src": "/figures/analog/opamp-comparator.svg",
      "alt": "比较器把 Vin 与 1 V 门限比较，Vin 低于门限时输出约 −5 V，高于门限时输出约 +5 V。",
      "caption": "输入跨越 1 V 门限时，输出从负饱和切换到正饱和。",
      "source": "原授课课件",
      "sourceHref": "/materials/opamp/1"
    }
  ],
  "power-3": [
    {
      "example": 1,
      "src": "/figures/analog/power-classb-efficiency.svg",
      "alt": "互补推挽输出级使用 ±10 V 电源，8 Ω 负载输出峰值 8 V，估算输出 4 W、直流输入 6.37 W、效率 62.8%。",
      "caption": "正弦输出峰值决定负载功率与理想直流输入功率。",
      "source": "原授课课件",
      "sourceHref": "/materials/power/1"
    }
  ],
  "am-3": [
    {
      "example": 1,
      "src": "/figures/analog/am-overmodulation-envelope.svg",
      "alt": "m=1.2 的 AM 带符号包络跨过零，包络检波输出出现翻折失真。",
      "caption": "过调制时包络已跨零，简单检波不能还原原消息。",
      "source": "调制及解调课件",
      "sourceHref": "/materials/am/1"
    }
  ],
  "am-2": [
    {
      "example": 1,
      "src": "/figures/analog/am-sidebands-spectrum.svg",
      "alt": "单音 AM 频谱载波在 100 kHz，上下边带位于 97 kHz 和 103 kHz，理论带宽 6 kHz。",
      "caption": "边带各距载波 3 kHz，频带总宽为 2fm。",
      "source": "调制及解调课件",
      "sourceHref": "/materials/am/1"
    }
  ]
};

// Actual exercise slides selected from the local analog electronics course PDFs.
