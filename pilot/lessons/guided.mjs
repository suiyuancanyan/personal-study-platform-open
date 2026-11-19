import { encode, lessonText } from '../lesson-text.mjs';
import { guidedFigures } from '../guided-figures.mjs';
import { guidedOpenings } from './guided-openings.mjs';

const convolution = [
  {
    title: '先想象两张透明纸',
    text: [
      '想象两张透明纸，各画了一段从 0 到 2、高度为 1 的矩形。把第一张固定在桌上，第二张可以左右滑动。',
      '同一个横坐标上，把两张纸的高度相乘。两张都有颜色时，乘积是 1；其中一张空白时，乘积是 0。今天我们就用这个乘积来算卷积。',
    ],
    question: '如果两个矩形完全错开，乘积图还有面积吗？',
    options: [
      ['有，两个矩形都有面积', '这里算的是同一位置的高度乘积。每个位置至少有一个高度为 0，所以乘积处处为 0。'],
      ['没有，乘积处处为 0', '对。只要两段没有重叠，当前的卷积值就是 0。'],
    ],
  },
  {
    title: '弄清 t 和 τ 各在做什么',
    text: [
      '现在想求 y(1)。这轮计算里，先把 t 固定为 1，相当于把第二张纸停在一个位置。',
      'τ 是图上的横坐标。沿横轴从左往右看，我们在每个 τ 处计算 x(τ) 与 h(1−τ) 的乘积，最后把这些乘积积起来。',
      '想求 y(2) 时，再把 t 换成 2，重新扫一次横轴。每选一个 t，就得到输出图上的一个点。',
    ],
    question: '求 y(1) 的那一轮，哪个量在积分时变化？',
    options: [
      ['τ', '对。t 固定为 1，τ 沿着横轴走。'],
      ['t', '求 y(1) 已经选定了 t=1。沿横轴变化的是 τ。'],
    ],
  },
  {
    title: '翻转，再平移第二个矩形',
    text: [
      '先把 h(τ) 沿纵轴翻转成 h(−τ)，矩形从 [0,2] 转到 [−2,0]。接着将翻转后的矩形平移 t，得到 h(t−τ)，覆盖 [t−2,t]。',
      '拿 t=1 试一遍。左边的条件给出 τ≤1，右边的条件给出 τ≥−1。合起来，h(1−τ) 在 [−1,1] 内等于 1。',
      '同样地，任意 t 对应的区间是 [t−2,t]。这个写法能直接告诉你滑动矩形的左右边界。',
    ],
    question: '把第二张纸滑到 t=3 时，它覆盖哪一段？',
    options: [
      ['[3,5]', '检查右端点。τ=3 时，h 的输入 t−τ 恰好是 0。τ 再大，输入就小于 0 了。'],
      ['[1,3]', '对。左右边界分别是 3−2=1 和 3。'],
    ],
  },
  {
    title: '动手看重叠怎样变长、再变短',
    text: [
      '固定的 x(τ) 一直占着 [0,2]。先选「部分重叠」，看看 [−1,1] 和 [0,2] 共同覆盖哪一段。再选「完全重叠」，看看输出曲线上的圆点移到了哪里。',
      '最后试「正在分开」。两次部分重叠分别出现在固定矩形的左边和右边。只要重叠长度相同，卷积值就相同。',
    ],
    question: '比较 t=1 和 t=3，哪个时刻的卷积值更大？',
    options: [
      ['t=3 更大', 't=3 时交集是 [1,2]。回到 t=1 看 [0,1]，两段都长 1。'],
      ['一样大', '对。t=1 与 t=3 的交集都长 1，乘积高度也是 1，所以两个输出都等于 1。'],
    ],
  },
  {
    title: '把刚才的几个点连成完整曲线',
    text: [
      't=0 时两段刚接触，t=2 时完全重合，t=4 时刚分开。这三个时刻是重叠长度改变规律的地方。',
      '在 0≤t≤2 时，交集从 0 延伸到 t，长度等于 t。在 2≤t≤4 时，交集从 t−2 延伸到 2，长度等于 4−t。其余时刻没有重叠，输出是 0。',
      '所以输出从 (0,0) 上升到 (2,2)，再下降到 (4,0)。这条三角形的每个点都对应一次重叠计算。',
    ],
    question: '如果 t=2.5，应该用哪一段求输出？',
    options: [
      ['用下降段，算 4−2.5', '对。此时交集是 [0.5,2]，所以 y(2.5)=1.5。'],
      ['用上升段，算 2.5', 't 已经超过 2，右端固定在 2，左端移到 0.5。重叠只剩 1.5。'],
    ],
  },
  {
    title: '把一张纸剪短，看看为什么会出现平台',
    text: [
      '换一个例子。x 仍然在 [0,2] 内高为 1。把 h 改成只在 [0,1] 内有值，高度改成 2。于是滑动的一段变为 [t−1,t]。',
      '当 t=1，短矩形刚好完整进入 [0,2]。继续移动到 t=2 前，它始终完整地待在长矩形里。这段时间交集长度一直是 1，乘积高度一直是 2，输出因此固定在 2。',
      '完整输出依次在 0 到 1 上升为 2t，在 1 到 2 保持为 2，在 2 到 3 下降为 2(3−t)，其他时刻为 0。图形是梯形。',
    ],
    question: '在 t=1.5 时，交集是哪一段？',
    options: [
      ['[0,1.5]', '用新的左边界 t−1=0.5。短矩形只有 1 个单位宽。'],
      ['[0.5,1.5]', '对。短矩形完整包含在长矩形里，所以输出是 1×2=2。'],
    ],
  },
  {
    title: '遇到非矩形，重叠区里怎么积？',
    text: [
      '保留刚才的两个区间，但把 x 的高度改成 x(τ)=τ。它在 [0,2] 内是一条斜线。现在重叠区里的高度乘积是 2τ，会随位置变化。',
      '仍然先求交集。例如 t=1.5 时，交集还是 [0.5,1.5]。把这个交集写成积分上下限，得到 y(1.5)=∫₀.₅¹.⁵ 2τ dτ=1.5²−0.5²=2。',
      '每次先找上下限，再看区间内乘积是什么。矩形的乘积高度恒定，所以可以直接用宽乘高。',
    ],
    question: '这个斜坡例子在 t=0.5 时，应当在哪一段积分 2τ？',
    options: [
      ['[0,0.5]', '对。滑动段是 [−0.5,0.5]，和 [0,2] 的交集是 [0,0.5]。'],
      ['[−0.5,0.5]', '这只是 h(t−τ) 的区间。负半段上 x(τ)=0，要取两段交集后再积分。'],
    ],
  },
  {
    title: '换一组数字，自己连起来做',
    text: [
      '纸上画两段矩形。x 在 [0,3] 内高为 1，h 在 [0,1] 内高为 2，区间外都为 0。求完整的 y(t)。',
      '先写出滑动段的两个端点，找出刚相接、刚完全重叠、开始分开、完全分开对应的四个 t，再写每段的输出。最后看图形面积能否等于两个输入面积的乘积。',
    ],
    question: '写完以后，选出你的分段点查看核对过程。',
    options: [
      ['0、1、3、4', '对。四段依次是 0≤t<1 时 2t，1≤t<3 时 2，3≤t≤4 时 2(4−t)，区间外为 0。梯形面积为 1+4+1=6，与 3×2 一致。'],
      ['0、1、2、3', '这里 x 比上一题长了 1。短矩形右端到达 3 时才开始离开，左端到达 3 时完全离开。再算一次两个时刻。'],
    ],
  },
];

function newFigure(unitId) {
  const figure = guidedFigures[unitId];
  if (!figure) return '';
  const [caption] = figure;
  return `<figure class="lesson-visual guided-figure">
    <canvas role="img" aria-label="${encode(caption)}" data-figure="${unitId}" data-guided-figure></canvas>
    <figcaption>${lessonText(caption)}</figcaption>
  </figure>`;
}

export function mergesGuidedPractice(unitId, hasCuratedExample) {
  return hasCuratedExample && unitId !== 'pn-junction-5' && unitId !== 'time-domain-3';
}

function lessonSteps(unit, { diagram, plot, experiment, worked, openingFigure, modelExplanation, modelCheck, curated }) {
  const { id, sections, questions } = unit;
  const newPlot = newFigure(id);
  if (id === 'time-domain-3') {
    const visuals = { 2: plot, 3: experiment, 5: newPlot };
    return convolution.map((step, index) => curated && index === convolution.length - 1
      ? { title: '用课件原题练习卷积', content: worked || '<a href="#question-bank" data-current-jump>做本章资料原题</a>' }
      : { ...step, content: visuals[index] });
  }

  const opening = guidedOpenings[id];
  if (!opening?.situation || !opening.question || !opening.feedback) throw new Error(`Missing guided opening: ${id}`);
  const checkpoint = questions.find(question => question.correct && question.distractor);
  const exercise = questions.findLast(question => question.level === '应用' && question.answer)
    ?? questions.findLast(question => question.answer);
  const checkChoices = [
    [checkpoint.correct, `对。${checkpoint.explanation}`],
    [checkpoint.distractor, `再想一步。${checkpoint.explanation}`],
  ];
  if (Number(id.split('-').at(-1)) % 2 === 0) checkChoices.reverse();

  const steps = [{
    title: '先想一个具体问题',
    text: [opening.situation],
    content: openingFigure,
    question: opening.question,
    options: [['看看怎么想', opening.feedback]],
  }, {
    title: sections[0].title,
    text: sections[0].paragraphs,
  }];
  if (newPlot || plot) steps.push({
    title: newPlot ? '对着示意图看一遍' : '把刚才的话放到图上',
    content: newPlot || plot,
  });
  if (experiment) steps.push({
    title: '动手试一次',
    content: experiment,
  });
  steps.push(...sections.slice(1).map(section => ({ title: section.title, text: section.paragraphs })));
  if (newPlot && plot) steps.push({ title: '再读一张图', content: plot });
  if (curated) {
    if (modelExplanation) steps.push({ title: '读懂电路和符号', content: modelExplanation });
    if (mergesGuidedPractice(id, Boolean(worked))) steps.push({
      title: '做一道资料例题',
      text: ['先看题图并写下你的判断，再展开解法逐步核对。'],
      content: worked,
      mergedPractice: true,
    });
    else steps.push(
      ...(modelExplanation ? [] : [{ title: '准备做题', text: [unit.check] }]),
      { title: worked ? '跟着做一道资料例题' : '做本章资料原题', content: worked || '<a href="#question-bank" data-current-jump>查看题目和原图</a>' },
      { title: '核对自己的解法', text: ['先写下第一步，再对照题目下方的解题过程。'], content: modelCheck || '<a href="#question-bank" data-current-jump>打开本章题库</a>' },
    );
  } else steps.push({
    title: '用一个判断检查理解',
    question: checkpoint.prompt,
    options: checkChoices,
  }, {
    title: modelExplanation ? '跟着电路图推导' : '跟着做一道例题',
    content: modelExplanation || worked,
  }, {
    title: modelCheck ? '换电路，独立做三题' : '换一道题，自己试一试',
    content: modelCheck,
    question: modelCheck ? '' : exercise.prompt,
    options: modelCheck ? [] : [['核对答案', `${exercise.answer} ${exercise.explanation}`]],
  });
  steps.push({
    title: '把这节的思路串起来',
    content: diagram,
    text: [unit.check],
  });
  return steps;
}

export function guidedLesson(unit, resources) {
  const unitId = unit.id;
  const steps = lessonSteps(unit, resources);

  const panels = steps.map((step, index) => `
    <section class="guided-step" data-guided-step${step.mergedPractice ? ' data-merged-practice' : ''}${index ? ' hidden' : ''}>
      <h3 tabindex="-1">${lessonText(step.title)}</h3>
      ${(step.text ?? []).map(paragraph => `<p>${lessonText(paragraph)}</p>`).join('')}
      ${step.content ?? ''}
      ${step.question ? `<p class="guided-question" id="${unitId}-check-${index}">${lessonText(step.question)}</p>
      <div class="guided-options" role="group" aria-labelledby="${unitId}-check-${index}">
        ${step.options.map(([option, feedback]) => `<button type="button" data-guided-answer aria-pressed="false">${lessonText(option)}</button><p class="guided-response" hidden>${lessonText(feedback)}</p>`).join('')}
      </div>
      <div data-guided-feedback class="guided-feedback" role="status"></div>` : ''}
    </section>`).join('');

  return `<div class="guided-lesson" data-guided-lesson>
    <div class="guided-meter"><p class="guided-progress" data-guided-progress>第 1 步 / 共 ${steps.length} 步</p><span class="guided-meter-track" style="--step-count: ${steps.length}"><progress data-guided-meter value="1" max="${steps.length}" aria-label="本节进度"></progress></span></div>
    ${panels}
    <div class="guided-actions">
      <button type="button" data-guided-back disabled>上一步</button>
      <button type="button" data-guided-next class="guided-next">继续</button>
      <button type="button" data-practice hidden>做本节练习</button>
      <button type="button" data-complete hidden>完成本节</button>
    </div>
  </div>`;
}
