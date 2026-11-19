import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { courses } from './chapters.mjs';
import { encode, lessonText } from './lesson-text.mjs';
import { unitsByChapter } from './lessons.mjs';
import { comparisonTables, illustrations } from './illustrations.mjs';
import { chapterDrills } from './drills.mjs';
import { chapterReviews } from './lessons/chapter-reviews.mjs';
import { chapterGuides } from './lessons/chapter-guides.mjs';
import { figurePractice } from './lessons/figure-practice.mjs';
import { derivations } from './lessons/derivations.mjs';
import { exampleFigures, sourceProblems } from './figure-library.mjs';
import { practiceSelection } from './lessons/practice-selection.mjs';
import { chapterLabs } from './lab-guides.mjs';
import { derivationLabs, unitLabs, unitLabMarkup } from './unit-labs.mjs';
import { pnLearningEntry, pnSeriesCircuit } from './pn-learning-entry.mjs';
import { pnModelLab } from './pn-model-lab.mjs';
import { pnModelCheck } from './pn-model-check.mjs';
import { guidedLesson, mergesGuidedPractice } from './lessons/guided.mjs';

const diodeModelUnit = 'pn-junction-5';
const pnBasics = { 'pn-junction-1': 'pn-circuit-basics', 'pn-junction-4': 'pn-bias-basics' };
const searchAliases = { 'time-domain-3': '连续卷积 连续时间卷积', [diodeModelUnit]: '伏安特性 伏安特性曲线 伏安关系' };

const sourceRoot = process.env.STUDY_SOURCE_ROOT || null;
const previewRoot = fileURLToPath(new URL('../.local/course-previews/', import.meta.url));
const folders = {
  analog: '模电B混合式PPT/模电B混合式PPT',
  'analog-answers': '模电/模电/书后习题答案',
  'analog-review': '模电/模电',
  signal: '信号与系统/信号与系统/上课ppt',
  'signal-answers': '信号与系统/信号与系统/信号与系统-1到5章课后题答案',
  'signal-review': '信号与系统/信号与系统',
  physics: '习题册答案/习题册答案',
};
const reviewSources = {
  analog: [
    { group: 'analog-review', file: '去年的-24-25模拟电子线路B（混合式）复习大纲.pptx', title: '2024–25 学年复习大纲' },
    { group: 'analog-review', file: '考前提醒.pdf', title: '原资料中的考前提醒' },
  ],
  signals: [
    { group: 'signal-review', file: '2024-25信号B复习大纲.pdf', title: '2024–25 学年复习大纲' },
    { group: 'signal-review', file: '信号与系统B期末复习提要.pdf', title: '期末复习提要' },
    { group: 'signal-review', file: '复习知识点.docx', title: '复习知识点' },
  ],
};
const resources = new Map();
const courseSymbol = id => `<span class="course-symbol symbol-${id}" aria-hidden="true"><i></i></span>`;

function links(id, list) {
  return list.map((item, index) => {
    const route = `/materials/${id}/${index + 1}`;
    resources.set(route, item);
    const original = !item.original && /\.pptx?$/i.test(item.file) ? `<a class="material-original" href="${route}?original=1">下载原文件</a>` : '';
    return `<li><span class="material-name">${encode(item.title)}<small>${encode(extname(item.file).slice(1).toUpperCase())}</small></span><span class="material-actions"><a target="_blank" rel="noopener" href="${route}" aria-label="打开 ${encode(item.title)}">打开 ↗</a>${original}</span></li>`;
  }).join('');
}

function studyResources(entry, excerpt = '') {
  if (!sourceRoot && !excerpt) return '';
  return `<section class="panel materials" id="materials"><h2>原课件与习题</h2><ul>${excerpt}${sourceRoot ? links(entry.id, entry.sources) : ''}</ul></section>`;
}

function unitNotes(legacy) {
  return `<section class="panel" id="study-notes" tabindex="-1"><div class="notes-heading"><h2>学习笔记</h2><a href="#curriculum" data-note-return>回到本节</a></div>
    <label class="question-draft"><span data-note-label>本节笔记</span><textarea rows="4" data-unit-note placeholder="记下还想复习的知识点"></textarea><small role="status" data-note-status></small></label>
    <div data-unit-notes hidden><h3>按小节查看</h3><ul></ul></div>
    <details><summary>章节笔记</summary>${legacy}</details>
  </section>`;
}

function questionCard(q, { anchor = `question-${q.id}`, inline = false } = {}) {
  const { number } = q;
  const options = q.correct ? [q.correct, q.distractor] : [];
  if (number % 2 === 0) options.reverse();
  const task = options.length
    ? options.map(text => `<button type="button" data-answer="${text === q.correct ? 'correct' : 'wrong'}">${lessonText(text)}</button>`).join('')
    : '<button type="button" data-answer="reveal" aria-expanded="false">看解法</button>';
  const level = q.level ?? (q.correct ? '基础' : '应用');
  const returnLink = q.figureUnit ? `<a class="question-figure-link" href="#figure-${q.figureUnit}" data-experiment-link>回看图解 <span aria-hidden="true">↗</span></a>` : '';
  const visual = q.figureUnit && illustrations[q.figureUnit];
  const questionVisual = visual ? `<figure class="lesson-visual question-visual"><canvas role="img" aria-label="${encode(visual[1])}" data-figure="${visual[0]}" data-figure-value="${visual[2] ?? ''}"></canvas>${visual[3]?.length ? `<div class="chart-legend">${visual[3].map((label, index) => `<span class="trace-${index}">${lessonText(label)}</span>`).join('')}</div>` : ''}</figure>` : '';
  const solution = q.workedSteps
    ? `<ol data-bank-steps>${q.workedSteps.map(step => `<li hidden>${lessonText(step)}</li>`).join('')}</ol>${q.workedSteps.length > 1 ? '<div class="bank-choices"><button type="button" data-bank-next>看下一步</button><button type="button" data-bank-all>显示全部</button></div>' : ''}<div data-bank-solution-figures hidden>${figureStrip(q.figures?.filter(figure => figure.solution), (q.figures?.filter(figure => !figure.solution).length ?? 0) + 1)}</div>`
    : `<p><strong>答案</strong> ${lessonText(q.correct ?? q.answer)}</p><p><strong>解析</strong> ${lessonText(q.explanation)}</p>`;
  const context = inline ? '' : '<div class="question-context" data-question-context hidden><span data-question-unit></span><a href="#curriculum" data-return-reading>回到本节</a></div>';
  return `<section class="bank-question" id="${anchor}" ${inline ? 'data-inline-question' : 'data-question'}="${q.id}"${q.workedSteps ? ' data-example' : ''}${q.archive ? ' data-archive-example' : ''}${q.figures?.some(figure => !figure.solution) || visual ? ' data-illustrated' : ''} tabindex="-1">${context}<h4 class="question-title">${encode(level)}</h4><p data-example-prompt>${lessonText(q.prompt)}</p>${questionVisual}${returnLink}${figureStrip(q.figures?.filter(figure => !figure.solution))}${options.length ? '' : draftField(q.id)}<div class="bank-choices">${task}${q.workedSteps ? exampleHelp(q.archive) : ''}</div><div class="bank-result" hidden aria-live="polite">${solution}${q.answer || q.workedSteps ? '<button type="button" data-answer="correct">已掌握</button> <button type="button" data-answer="wrong">加入错题</button>' : ''}${inline ? '' : '<a class="next-question" data-next-question data-experiment-link hidden>下一道题 →</a>'}</div><div class="question-feedback"><p class="bank-status" role="status"></p><button type="button" data-bank-undo hidden>撤销</button></div></section>`;
}

function draftField(id) {
  return `<label class="question-draft"><span>演算草稿</span><textarea rows="3" data-question-draft="${id}" placeholder="写下你的过程"></textarea><small role="status"></small></label>`;
}

function outline(entry) {
  const list = unitsByChapter[entry.id];
  const buttons = list.map((unit, index) => {
    const lab = unit.id === chapterLabs[entry.id].unit || unitLabs[unit.id] || derivationLabs[unit.id];
    const mastery = unit.id === diodeModelUnit ? '<small data-pn-mastery></small>' : '';
    return `<button type="button" data-unit-select="${unit.id}" aria-controls="${unit.id}"><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${lessonText(unit.title)}${mastery}<small data-unit-done hidden>✓ 已完成</small></span>${lab ? '<span class="unit-lab-dot" title="含动手实验" role="img" aria-label="含动手实验"></span>' : ''}</button>`;
  }).join('');
  const hasFigures = list.some(unit => exampleFigures[unit.id]?.length || sourceProblems[unit.id]?.length);
  const gallery = hasFigures ? '<a class="outline-lab" href="#figure-directory" data-experiment-link>图文例题 <span aria-hidden="true">›</span></a>' : '';
  return `<aside class="chapter-outline" aria-label="章节目录"><details class="outline-disclosure" open><summary><span>本章小节</span><span id="unit-progress" aria-live="polite">已学 0 / ${list.length} 节</span></summary><p class="outline-position" data-outline-position hidden></p><progress id="chapter-progress" value="0" max="${list.length}" aria-label="本章学习进度"></progress><nav aria-label="本章小节" class="unit-nav">${buttons}</nav><div class="outline-tools"><a class="outline-lab" href="#lab-directory" data-experiment-link>实验目录 <span aria-hidden="true">›</span></a>${gallery}</div></details></aside>`;
}

function figureDirectory(entry) {
  const selection = practiceSelection[entry.id];
  const units = unitsByChapter[entry.id];
  const items = selection ? selection.map(([id, index, concept]) => ({
    href: `#question-${id}-source-${index + 1}`, title: concept,
    detail: units.find(unit => unit.id === id)?.title ?? '',
  })) : units.flatMap(unit => {
    const examples = new Set(exampleFigures[unit.id]?.map(figure => figure.example)).size + (sourceProblems[unit.id]?.length ?? 0);
    const href = sourceProblems[unit.id]?.length ? `#example-${unit.id}-guided-example` : `#examples-${unit.id}`;
    return examples ? [{ href, title: unit.title, detail: `${examples} 道例题` }] : [];
  });
  if (!items.length) return '';
  const rows = items.map(({ href, title, detail }) => `<li><a href="${href}" data-experiment-link><span class="figure-row-icon" aria-hidden="true"></span><span><strong>${lessonText(title)}</strong><small>${lessonText(detail)}${selection ? ' · <span data-figure-practice-state>未练习</span>' : ''}</small></span><span class="list-chevron" aria-hidden="true"></span></a></li>`).join('');
  return `<section class="figure-directory" id="figure-directory" tabindex="-1" hidden><div class="library-heading"><p class="library-context">${encode(entry.course)} · ${encode(entry.number)}</p><h2>图文例题</h2><p>${encode(entry.title)}<span aria-hidden="true"> · </span>${items.length} ${selection ? '道资料原题' : '组例题'}</p><a href="#curriculum" data-figure-return>回到本节</a></div><ul class="figure-directory-list">${rows}</ul></section>`;
}

function labDirectory(entry) {
  const mainLab = chapterLabs[entry.id];
  const links = unitsByChapter[entry.id].flatMap((unit, index) => {
    const items = [];
    if (unit.id === mainLab.unit) items.push({ id: 'experiment', title: mainLab.title });
    if (unitLabs[unit.id]) items.push({ id: `lab-${unit.id}`, title: unitLabs[unit.id].title });
    if (unit.id === diodeModelUnit) items.push({ id: 'pn-model-lab', title: '比较二极管的三种模型' });
    else if (derivationLabs[unit.id]) items.push({ id: `verify-${unit.id}`, title: derivationLabs[unit.id].title });
    return items.map(item => `<li><a href="#${item.id}" data-experiment-link><span class="lab-list-unit">第 ${index + 1} 节</span><span>${encode(item.title)}</span><span aria-hidden="true">↗</span></a></li>`);
  });
  return `<details class="lab-directory" id="lab-directory" tabindex="-1"><summary class="lab-directory-heading"><span>本章实验</span><span>${links.length} 项</span></summary><ul>${links.join('')}</ul></details>`;
}

function comparisonTable([caption, columns, ...rows]) {
  const heading = columns.map(column => `<th scope="col">${lessonText(column)}</th>`).join('');
  const body = rows.map(row => `<tr>${row.map(cell => `<td>${lessonText(cell)}</td>`).join('')}</tr>`).join('');
  return `<div class="lesson-table"><table><caption>${lessonText(caption)}</caption><thead><tr>${heading}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function figureStrip(figures = [], number = 1) {
  if (!figures.length) return '';
  return `<div class="example-figures${figures.length > 1 ? ' multiple-figures' : ''}">${figures.map(({ src, alt, caption, source, sourceHref }, i) => {
    const provenance = source && (sourceRoot && sourceHref
      ? `<a href="${encode(sourceHref)}" target="_blank" rel="noopener">${encode(source)} ↗</a>`
      : `<span>${encode(source)}</span>`);
    return `<figure><a class="example-figure-link" href="${encode(src)}" data-open-figure aria-label="放大图 ${number + i}：${encode(alt)}"><img src="${encode(src)}" alt="${encode(alt)}" loading="lazy" decoding="async"><span class="figure-enlarge" aria-hidden="true">＋</span></a><figcaption><p><strong>图 ${number + i}</strong> ${lessonText(caption)}</p>${provenance || ''}</figcaption></figure>`;
  }).join('')}</div>`;
}

function exampleHelp(detail = false) {
  return `<button class="example-help" type="button" data-example-help${detail ? ' data-example-detail' : ''}><span aria-hidden="true">✦</span> ${detail ? 'AI 详解' : 'AI 讲这道题'}</button>`;
}

function workedExample({ prompt, steps, figures, archive, questionId }, stepsId, label, trying = false) {
  const questionFigures = figures?.filter(figure => !figure.solution) ?? [];
  const solutionFigures = figureStrip(figures?.filter(figure => figure.solution), questionFigures.length + 1);
  const hidden = trying ? ' hidden' : '';
  const original = questionFigures.some(figure => /\.png$/i.test(figure.src) && figure.sourceHref);
  return `<section id="example-${stepsId}" tabindex="-1" data-example class="worked-example${questionFigures.length ? ' has-figures' : ''}${original ? ' source-worked-example' : ''}">
    <header><h4>${lessonText(label)}</h4></header>
    <p class="example-prompt" data-example-prompt>${lessonText(prompt)}</p>
    ${figureStrip(questionFigures)}
    ${questionId ? draftField(questionId) : ''}
    <div class="worked-solution"><ol id="${stepsId}">${steps.map(step => `<li${hidden}>${lessonText(step)}</li>`).join('')}</ol>
      <div class="worked-controls"><div class="worked-progress"${trying ? '' : ' hidden'}><button type="button" data-worked-next aria-controls="${stepsId}">看解法</button><span role="status" data-worked-count></span></div>${exampleHelp(archive)}<button type="button" data-worked-mode aria-controls="${stepsId}" aria-pressed="${trying}">${trying ? '显示全部' : '自己试算'}</button></div>
    </div>
    ${solutionFigures ? `<div class="worked-solution-figures" data-worked-figures${hidden}>${solutionFigures}</div>` : ''}
  </section>`;
}

function derivationMarkup(unit, relatedLab, hasFigure) {
  const exercise = derivations[unit];
  if (!exercise) return '';
  const { title, problem, steps } = exercise;
  const id = `derivation-${unit}`;
  const lab = unit === diodeModelUnit ? null : derivationLabs[unit];
  const labId = `verify-${unit}`;
  const rail = steps.map(({ label }, i) => `<li><button type="button" data-derive-jump="${i}" aria-controls="${id}-${i}"${i ? ' disabled' : ' aria-current="step"'}><span aria-hidden="true">${i + 1}</span>${lessonText(label)}</button></li>`).join('');
  const panels = steps.map((step, i) => {
    const stepId = `${id}-${i}`;
    const answers = step.type === 'number'
      ? `<label class="derivation-value"><span class="screen-reader">填数值${step.unit ? `（${encode(step.unit)}）` : ''}</span><input name="value" type="text" autocomplete="off" maxlength="32" spellcheck="false" placeholder="填数值">${step.unit ? `<span>${encode(step.unit)}</span>` : ''}</label><button type="submit" class="derivation-check">核对</button>`
      : (i % 2 === 0 ? [step.distractor, step.answer] : [step.answer, step.distractor]).map(choice => `<button type="submit" name="value" value="${choice === step.answer ? 'correct' : 'wrong'}">${lessonText(choice)}</button>`).join('');
    const tolerance = /保留[一二两三四五]位/.test(step.question)
      ? 0.5 * 10 ** -(step.answer.split('.')[1]?.length ?? 0) : 0;
    const answer = step.type === 'number' ? [step.answer.replace('-', '−'), step.unit].filter(Boolean).join(' ') : step.answer;
    return `<div id="${stepId}" class="derivation-step" data-derive-step${i ? ' hidden' : ''}>
      <h4 tabindex="-1">${i + 1}. ${lessonText(step.label)}</h4>
      <p id="${stepId}-question">${lessonText(step.question)}</p>
      <form class="derivation-form" aria-labelledby="${stepId}-question" data-value="${step.type === 'number' ? encode(step.answer) : ''}" data-tolerance="${tolerance}">${answers}</form>
      <div class="derivation-tools"><button type="button" data-derive-hint aria-controls="${stepId}-hint" aria-expanded="false">提示</button><button type="button" data-derive-reveal>查看这一步</button></div>
      <p class="derivation-hint" id="${stepId}-hint" hidden>${lessonText(step.hint)}</p>
      ${step.feedback ? `<template data-derive-mistake>${lessonText(step.feedback)}</template>` : ''}
      <p class="derivation-feedback" role="status"></p>
      <div class="derivation-result" hidden><p><strong>${lessonText(answer)}</strong></p><p data-example-step>${lessonText(step.reasoning)}</p><button type="button" data-derive-next>${i === steps.length - 1 ? '查看完成情况' : '下一步 →'}</button></div>
    </div>`;
  }).join('');
  return `<section class="derivation" id="${id}" data-derivation data-example tabindex="-1" aria-labelledby="${id}-title">
    <header class="derivation-heading"><div><p>分步推导</p><h3 id="${id}-title">${encode(title)}</h3></div><span data-derive-progress>0 / ${steps.length} 步</span></header>
    <div class="derivation-example"><p class="derivation-problem" data-example-prompt>${lessonText(problem)}</p>${exampleHelp()}</div>
    <ol class="derivation-rail" aria-label="推导步骤">${rail}</ol>
    ${panels}
    <div class="derivation-finish" hidden><h4 tabindex="-1">推导完成</h4><p data-derive-summary></p><div class="derivation-tools">${unit === diodeModelUnit ? '<a class="pn-primary" href="#pn-model-check" data-experiment-link>独立做三题</a>' : '<button type="button" class="derivation-check" data-practice>做本节练习</button>'}<button type="button" data-derive-reset>重新推导</button></div></div>
    <footer>${hasFigure ? `<a href="#figure-${unit}" data-experiment-link>回看图解 ↗</a>` : ''}${relatedLab && !lab ? `<a href="#${relatedLab}" data-experiment-link>去相关实验 ↗</a>` : ''}</footer>
    ${lab ? `<details class="derivation-lab" id="${labId}" tabindex="-1"><summary>用题设数值验证 <span>动画实验</span></summary>${unitLabMarkup(unit, lab, `practice-lab-${unit}`)}</details>` : ''}
  </section>`;
}

function curriculum(entry, chapterExperiment, pnBiasQuiz = '') {
  const list = unitsByChapter[entry.id];
  const siblings = courses.find(course => course.id === entry.courseId).chapters;
  const nextChapter = siblings[siblings.findIndex(chapter => chapter.id === entry.id) + 1];
  const guide = chapterLabs[entry.id];
  const selection = practiceSelection[entry.id];
  const curated = Boolean(selection);
  function originalsFor(unit) {
    if (!selection) return (sourceProblems[unit] ?? []).map((problem, index) => [{ ...problem, questionId: `${unit}-source-${index + 1}` }, index]);
    return selection.filter(([id]) => id === unit).map(([, index, concept]) => {
      const problem = sourceProblems[unit]?.[index];
      if (!problem?.figures.some(figure => !figure.solution && /\.(?:png|jpe?g|webp)$/i.test(figure.src) && figure.sourceHref)) {
        throw new Error(`Missing original exercise screenshot for ${unit}-${index + 1}`);
      }
      return [{ ...problem, archive: true, questionId: `${unit}-source-${index + 1}`, level: concept, figures: problem.figures.filter(figure => !figure.src.endsWith('.svg')) }, index];
    });
  }
  const panels = list.map((u, index) => {
    const paragraphs = items => items.map(p => `<p>${lessonText(p)}</p>`).join('');
    const body = paragraphs(u.paragraphs);
    const [firstStep, ...remainingSteps] = u.sections.map(section => `<section class="lesson-step"><h3>${lessonText(section.title)}</h3>${paragraphs(section.paragraphs)}</section>`);
    const figure = `<figure class="unit-diagram"><figcaption>从第一步到结论</figcaption><ol>${u.diagram.map(node => `<li>${lessonText(node)}</li>`).join('')}</ol></figure>`;
    const visual = illustrations[u.id];
    const figureQuestion = curated ? null : figurePractice[u.id];
    const legend = visual?.[3]?.map((label, index) => `<span class="trace-${index}">${lessonText(label)}</span>`).join('');
    const plot = visual ? `<figure class="lesson-visual" id="figure-${u.id}" tabindex="-1"><canvas role="img" aria-label="${encode(visual[1])}" data-figure="${visual[0]}" data-figure-value="${visual[2] ?? ''}"></canvas>${legend ? `<div class="chart-legend">${legend}</div>` : ''}<figcaption>${lessonText(visual[1])}${visual[4] ? `<span class="figure-reading"><strong>读图</strong> ${lessonText(visual[4])}</span>` : ''}${figureQuestion ? `<button type="button" class="figure-practice" data-figure-practice="${figureQuestion.id}">做一道读图题 <span aria-hidden="true">↗</span></button>` : ''}</figcaption></figure>` : '';
    const table = comparisonTables[u.id] ? comparisonTable(comparisonTables[u.id]) : '';
    const experiment = (u.id === guide.unit ? chapterExperiment : '') + unitLabMarkup(u.id);
    const relatedLab = u.id === diodeModelUnit ? 'pn-model-lab' : unitLabs[u.id] ? `lab-${u.id}` : u.id === guide.unit ? 'experiment' : '';
    const derivation = curated ? '' : derivationMarkup(u.id, relatedLab, Boolean(visual) && u.id !== diodeModelUnit);
    const examples = curated ? '' : u.examples.map((example, index) => workedExample({
      ...example, figures: exampleFigures[u.id]?.filter(figure => figure.example === index + 1),
    }, `${u.id}-steps-${index + 1}`, `例题 ${index + 1}`)).join('');
    const illustratedIndex = exampleFigures[u.id]?.find(figure => !figure.solution)?.example;
    const guidedIndex = illustratedIndex && u.examples[illustratedIndex - 1] ? illustratedIndex - 1 : u.examples.length - 1;
    const selected = originalsFor(u.id);
    const sourceExample = selected[0]?.[0];
    const worked = sourceExample ? questionCard({ ...sourceExample, id: sourceExample.questionId, workedSteps: sourceExample.steps },
      { anchor: `example-${u.id}-guided-example`, inline: true }) : curated ? '' : workedExample({
      ...u.examples[guidedIndex],
      figures: exampleFigures[u.id]?.filter(figure => figure.example === guidedIndex + 1),
    }, `${u.id}-guided-example`, '跟做例题', true);
    const originals = selected.map(([problem, index]) => questionCard({
      ...problem, id: problem.questionId, workedSteps: problem.steps, level: problem.level ?? '原资料例题',
    }, { anchor: `example-${u.id}-source-steps-${index + 1}`, inline: true })).join('');
    const practiceId = `examples-${u.id}`;
    const visualId = experiment ? (u.id === guide.unit ? 'experiment' : `lab-${u.id}`) : visual ? `figure-${u.id}` : '';
    const source = u.source?.match(/^(\d+)(?:#page=(\d+))?$/);
    const ref = sourceRoot && source && entry.sources[Number(source[1]) - 1] ? `<p><a target="_blank" rel="noopener" href="/materials/${entry.id}/${source[1]}${source[2] ? `#page=${source[2]}` : ''}">${encode(entry.sources[Number(source[1]) - 1].title)}${source[2] ? ` · 第 ${source[2]} 页` : ''} ↗</a></p>` : '';
    const opening = `<section class="unit-body" id="${u.id}" data-unit="${u.id}" data-title="${encode(u.title)}" tabindex="-1"${index ? ' hidden' : ''}>`;
    const learningGoal = `<p class="unit-goal"><strong>学完这节</strong> ${lessonText(u.goal)}</p>`;
    const lastUnit = index === list.length - 1;
    const forward = !lastUnit ? '<button type="button" data-continue-unit>继续下一节</button>'
      : nextChapter ? `<a href="${nextChapter.path}">继续下一章</a>` : '<a href="/">返回目录</a>';
    const recap = `<section class="unit-recap" id="recap-${u.id}" hidden><h3 tabindex="-1">${lastUnit ? '本章回顾' : '本节回顾'}</h3><p><strong>你现在能</strong> ${lessonText(u.goal)}</p><details><summary>怎样检查自己的解答？</summary><p>${lessonText(u.check)}</p></details>${lastUnit ? '<p><a href="#chapter-guide" data-experiment-link>回看章节串讲</a> · <a href="/">返回课程目录</a></p>' : ''}<div class="recap-actions"><button type="button" data-recap-back>回看本节</button><a href="#question-bank" data-current-jump>做资料题</a>${forward}</div></section>`;
    if (u.id === diodeModelUnit) {
      const modelExplanation = `<section class="pn-explanation" id="pn-model-explanation" tabindex="-1">
        ${u.formula ? `<p class="formula">${lessonText(u.formula)}</p>` : ''}
        <div class="pn-worked-layout">
          ${derivation}
          <div class="pn-worked-figure">
            ${pnSeriesCircuit('pn-worked-circuit', '5 V')}
            <details class="pn-term pn-term-voltage"><summary>${lessonText('V_D 是哪两点的电压？')}</summary><p>红表笔放在 A，黑表笔放在 K。读数是 A 点电位减去 K 点电位。</p></details>
            <details class="pn-term pn-term-current"><summary>${lessonText('I_D 箭头表示什么？')}</summary><p>箭头把从 A 到 K 定为电流的正方向。算出正值时，电流沿箭头流动。</p></details>
            <button type="button" class="pn-inline-help" data-pn-ask="用电路中的两个端点和一个电流箭头，解释 V_D、I_D 的含义和下标读法。">问 AI 这些符号</button>
          </div>
        </div>
        <p class="unit-check"><strong>验算</strong> ${lessonText(u.check)}</p>
        <details class="pn-note"><summary>记一句笔记</summary><label for="pn-model-explanation-note">这次用的是什么模型？</label><textarea id="pn-model-explanation-note" data-pn-note="pn-model-explanation" rows="2"></textarea></details>
      </section>`;
      return `${opening}
      <p class="pn-unit-position">第 5 节 <span aria-hidden="true">/</span> 共 7 节</p>
      <h2>${lessonText(u.title)}</h2>
      ${learningGoal}
      ${guidedLesson(u, {
        diagram: figure, plot, experiment: pnModelLab(), openingFigure: pnLearningEntry(), modelExplanation, worked, curated,
        modelCheck: curated ? '<section id="pn-model-check" tabindex="-1"><p>先算二极管的工作点，再用导通与截止判断限幅电路。</p><a href="#question-bank" data-current-jump>做本章两道资料题</a><div id="pn-model-task-3" tabindex="-1"></div></section>' : pnModelCheck(),
      })}
      <nav class="pn-path" aria-label="本节导航">
        <a href="#pn-junction-5" data-pn-resume data-experiment-link hidden>回到上次的小任务</a>
        <a href="#pn-model-lab" data-experiment-link>做实验</a>
        <a href="#pn-model-explanation" data-experiment-link>看推导</a>
        <a href="#pn-model-check" data-experiment-link>${curated ? '资料练习' : '独立做三题'}</a>
        <a href="#question-bank" data-current-jump>${curated ? '本章题库' : '本节加练'}</a>
      </nav>
      <details class="lesson-recap pn-more-examples" id="${practiceId}" tabindex="-1">
        <summary>查看完整讲义与图文例题</summary>
        <div class="explanation">${firstStep}${remainingSteps.join('')}</div>
        ${examples}${originals}
        ${ref}
      </details>
    ${recap}</section>`;
    }
    const prerequisite = pnBasics[u.id];
    const guided = guidedLesson(u, { diagram: figure, plot, experiment, worked, curated });
    return `${opening}
      <h2${prerequisite ? ` id="${prerequisite}" tabindex="-1"` : ''}>${lessonText(u.title)}</h2>
      ${learningGoal}
      ${entry.id === 'pn-junction' ? '<a class="pn-back" href="#pn-junction-5" data-pn-back data-experiment-link hidden>← 回到第 5 节</a>' : ''}
      ${guided}
      <nav class="unit-links" aria-label="本节导航">
        ${visualId ? `<a href="#${visualId}" data-experiment-link>${experiment ? '动手实验' : '知识图解'}</a>` : ''}
        ${sourceExample ? `<a href="#example-${u.id}-guided-example" data-experiment-link>资料例题</a>` : curated ? '' : `<a href="#${practiceId}" data-experiment-link>例题</a>`}
        <a href="#question-bank" data-current-jump>${curated ? '本章资料原题' : '本节习题'}</a>
      </nav>
      <details class="lesson-recap guided-reference"><summary>查看完整讲义</summary>
      <div class="explanation">${firstStep}${remainingSteps.join('')}</div>
      ${table}
      ${figure}
      ${u.formula ? `<p class="formula">${lessonText(u.formula)}</p>` : ''}
      ${derivation}
      ${examples || originals ? `<section class="unit-examples" id="${practiceId}" tabindex="-1"><h3>例题与步骤</h3>${examples}${originals}</section>` : ''}
      <p class="unit-check"><strong>怎样检查答案</strong> ${lessonText(u.check)}</p>
      <details class="lesson-recap"><summary>本节回顾</summary>${body}</details>
      ${ref}
      ${u.id === 'pn-junction-4' && !curated ? pnBiasQuiz : ''}
      ${u.id === 'pn-junction-7' ? '<a class="pn-primary" href="#question-bank" data-review-jump>做全章综合练习</a>' : ''}
      </details>
    ${recap}</section>`;
  }).join('');
  const drills = curated ? [] : chapterDrills(entry.id);
  const reviews = curated ? [] : chapterReviews[entry.id];
  const bank = list.map(u => {
    const sourced = originalsFor(u.id).map(([problem, index]) => ({ ...problem, id: `${u.id}-source-${index + 1}`, level: problem.level ?? '原题', workedSteps: problem.steps }));
    const questions = curated ? sourced : [...sourced, ...u.questions, figurePractice[u.id], ...drills.filter(q => q.unitId === u.id)].filter(Boolean);
    if (!questions.length) return '';
    const cards = questions.map((question, number) => questionCard(question, { number })).join('');
    if (u.id === diodeModelUnit && !curated) return `<section class="bank-group" data-bank-unit="${u.id}">
      <p class="pn-bank-start" data-pn-bank-start>第 5 节先做 <a href="#pn-model-check" data-experiment-link>三道必做题</a>，练习选模型、算电流和判断反接。</p>
      <details data-pn-bank-extra><summary>再练几道</summary>${cards}</details>
    </section>`;
    return `<section class="bank-group" data-bank-unit="${u.id}"><h3>${lessonText(u.title)}</h3>${cards}</section>`;
  }).join('');
  const chapterReview = `<section class="bank-group" data-bank-unit="review" hidden><h3>本章综合题</h3>${reviews.map((question, number) => questionCard(question, { number })).join('')}</section>`;
  const originals = (sourceRoot ? entry.sources : []).map((source, index) => ({source,index})).filter(({source}) => source.group === 'physics' || source.group.endsWith('answers'));
  const originalBank = originals.length ? `<details class="materials original-bank"><summary>原题与解析（${originals.length} 份）</summary><ul>${originals.map(({source,index}) => `<li><a href="/materials/${entry.id}/${index+1}" target="_blank" rel="noopener">${encode(source.title)} ↗</a></li>`).join('')}</ul></details>` : '';
  const questionCount = selection?.length ?? list.reduce((total, unit) => total + unit.questions.length + (sourceProblems[unit.id]?.length ?? 0) + Number(Boolean(figurePractice[unit.id])), drills.length + reviews.length);
  const pnReview = entry.id === 'pn-junction' && !curated ? '<section data-pn-practice-review hidden><h3>第 5 节待复习</h3><ul></ul></section>' : '';
  const archiveFilter = list.some(unit => sourceProblems[unit.id]?.some(problem => problem.archive))
    ? '<button type="button" data-filter="archive">资料原题</button>' : '';
  const bankFilters = curated ? '<button type="button" data-filter="all">资料原题</button>'
    : `<button type="button" data-filter="current">本节练习</button><button type="button" data-filter="all">全章题库</button>${archiveFilter}<button type="button" data-filter="illustrated">看图做题</button><button type="button" data-filter="review">综合练习</button>`;
  return `<section class="panel curriculum" id="curriculum" data-chapter="${entry.id}" aria-label="小节讲解">${panels}</section><section id="question-bank" class="panel question-bank" tabindex="-1" hidden${curated ? ' data-curated' : ''}><div class="curriculum-header"><div><h2>章节题库</h2><p>${questionCount} 道${curated ? '资料原题' : '练习'}</p></div><a href="#curriculum" data-return-reading>回到本节</a></div><div class="bank-filters" role="group" aria-label="题目范围">${bankFilters}<button type="button" id="wrong-questions" data-filter="wrong">错题</button></div><div id="bank-empty" hidden><p></p><button type="button" data-show-originals>${archiveFilter ? '查看资料原题' : '查看全章题库'}</button></div><div class="bank-notice" hidden><span role="status"></span> <button type="button">撤销</button></div>${pnReview}${bank}${curated ? '' : chapterReview}${originalBank}</section>`;
}

export function catalogPage() {
  const totalChapters = courses.reduce((total, course) => total + course.chapters.length, 0);
  const totalUnits = Object.values(unitsByChapter).reduce((total, units) => total + units.length, 0);
  const cards = courses.map(course => {
    const [first, ...rest] = course.chapters.map(entry => `<li><a href="${entry.path}"><span class="chapter-number">${encode(entry.number)}</span><strong>${encode(entry.title)}</strong><span class="chapter-units">${unitsByChapter[entry.id].length} 节</span></a></li>`);
    const unitCount = course.chapters.reduce((total, entry) => total + unitsByChapter[entry.id].length, 0);
    const reviews = sourceRoot && reviewSources[course.id];
    return `<section class="catalog-card course-${course.id}" id="${course.id}"><header>${courseSymbol(course.id)}<div><h2>${encode(course.title)}</h2><p>${course.chapters.length} 章 <span aria-hidden="true">·</span> ${unitCount} 节</p></div></header><ol>${first}</ol><details class="catalog-chapters"><summary>查看其余 ${rest.length} 章</summary><ol>${rest.join('')}</ol></details>${reviews ? `<details><summary>复习资料</summary><ul>${links(`review-${course.id}`, reviews)}</ul></details>` : ''}</section>`;
  }).join('');
  const nav = courses.map(course => `<a href="#${course.id}">${encode(course.title)}</a>`).join('');
  const searchData = courses.flatMap(course => course.chapters.flatMap(entry => unitsByChapter[entry.id].map(unit => ({
    id: unit.id, path: entry.path, chapter: entry.id, title: unit.title, course: course.title, topic: entry.title, number: entry.number,
    mergesPractice: mergesGuidedPractice(unit.id, practiceSelection[entry.id]?.some(([id]) => id === unit.id) ?? false),
    keywords: [searchAliases[unit.id], unit.goal, unit.formula, illustrations[unit.id]?.[1], unitLabs[unit.id]?.title, ...unit.sections.map(section => section.title), ...(exampleFigures[unit.id] ?? []).map(figure => figure.caption), ...(sourceProblems[unit.id] ?? []).map(problem => problem.prompt)].filter(Boolean).join(' '),
    passages: [...unit.paragraphs, ...unit.sections.flatMap(section => section.paragraphs)],
  }))));
  const reviewData = courses.flatMap(course => course.chapters.map(entry => ({
    chapter: entry.id, path: entry.path, course: course.title, title: entry.title,
    questions: practiceSelection[entry.id]?.map(([unit, index]) => `${unit}-source-${index + 1}`) ?? [
      ...unitsByChapter[entry.id].flatMap(unit => [...unit.questions, figurePractice[unit.id]].filter(Boolean)),
      ...chapterDrills(entry.id),
      ...(chapterReviews[entry.id] ?? []),
    ].map(question => question.id),
  })));
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>课程目录 · 我的学习台</title><link rel="stylesheet" href="/study.css"><link rel="stylesheet" href="/study-interface.css"><body class="catalog">
    <header class="catalog-sidebar"><a href="/" class="brand"><span class="brand-mark" aria-hidden="true"></span>学习台</a><nav aria-label="课程导航">${nav}</nav></header>
    <main class="catalog-frame">
      <header class="catalog-hero"><div class="catalog-hero-copy"><h1>我的课程</h1>
        <p class="catalog-intro">选一节，跟着图解学习，再做一道题检验理解。</p>
        <form class="catalog-search" role="search" hidden><label for="catalog-query" class="screen-reader">搜索知识点</label><input type="search" id="catalog-query" placeholder="搜索知识点，如卷积、半波带"></form>
      </div><div class="catalog-artwork" aria-hidden="true"><img class="catalog-art" src="/study-notebook.webp" alt="" width="900" height="600"></div></header>
      <a class="catalog-resume" data-resume hidden><span><small data-resume-label>继续学习</small><strong data-resume-title></strong><span data-resume-context></span></span><span data-resume-progress></span><span class="resume-arrow" aria-hidden="true">→</span></a>
      <details class="catalog-review" data-review hidden><summary><span>错题复习</span><span data-review-count></span></summary><ul></ul></details>
      <section class="catalog-results" id="catalog-results" aria-label="搜索结果" hidden><p data-result-count role="status"></p><button type="button" data-clear-search>清空搜索</button><ul></ul></section>
      <div class="catalog-course-heading"><h2>课程目录</h2><span>${courses.length} 门课 · ${totalChapters} 章 · ${totalUnits} 节</span></div>
      <div class="catalog-grid">${cards}</div>
    </main><script id="catalog-data" type="application/json">${JSON.stringify({ units: searchData, chapters: reviewData }).replaceAll('<','\\u003c')}</script><script src="/catalog.js" defer></script></body></html>`;
}

function chapterUtilities(entry) {
  const guide = chapterGuides[entry.id];
  const curated = Boolean(practiceSelection[entry.id]);
  const exerciseUnit = !curated && unitsByChapter[entry.id].find(unit => derivations[unit.id]);
  const derivationLink = exerciseUnit ? `<a class="source-link" href="#derivation-${exerciseUnit.id}" data-experiment-link>分步推导 <span aria-hidden="true">↗</span></a>` : '';
  return `<section class="chapter-utilities" aria-label="本章资源"><h2>本章资源</h2><div class="chapter-tools">${labDirectory(entry)}
  <details class="chapter-guide" id="chapter-guide" tabindex="-1"><summary><span>章节串讲</span><span>${encode(guide.title)}</span></summary>
    <div class="chapter-guide-body"><h2>${encode(guide.title)}</h2><p>${lessonText(guide.background)}</p><p>${lessonText(guide.strategy)}</p>
    ${curated ? '' : workedExample({ prompt: guide.problem, steps: guide.steps }, 'chapter-guide-steps', '串讲例题')}
    <p class="unit-check">${lessonText(guide.transfer)}</p><a class="guide-practice" href="#question-bank" ${curated ? 'data-current-jump' : 'data-review-jump'}>${curated ? '做本章资料原题' : '做本章综合练习'} <span aria-hidden="true">↗</span></a></div></details>
    ${derivationLink}${sourceRoot ? '<a href="#materials" data-experiment-link>原课件与习题 <span class="list-chevron" aria-hidden="true"></span></a>' : ''}
  </div></section>`;
}

function labHeader(guide, formula = '') {
  return `<header class="lab-header"><p class="lab-label">动手实验</p><h3>${encode(guide.title)}</h3><p class="lab-task">${lessonText(guide.task)}</p>${formula ? `<p class="lab-formula">${lessonText(formula)}</p>` : ''}</header>`;
}

function labReasoning(guide) {
  return `<details class="lab-reasoning"><summary>为什么会这样？</summary><p>${lessonText(guide.reasoning)}</p></details>`;
}

function readerPage(base, entry) {
  return base.replace('<title>PN 结的正偏与反偏</title>', `<title>${encode(entry.title)} · 我的学习台</title>`)
    .replace(/<header class="study-header"[^>]*>[\s\S]*?<\/header>/, () => `<header class="study-header">
    <div class="study-location"><a href="/" class="brand" data-catalog-return><span class="back-chevron" aria-hidden="true"></span>课程目录</a><span>${encode(entry.number)} · ${encode(entry.title)}</span></div>
    <nav class="study-nav" aria-label="本章导航"><a href="#study-notes" data-notes-jump>笔记</a><a href="#question-bank" data-current-jump data-bank-toggle>题库</a><a href="#companion" id="companion-toggle" aria-controls="companion">AI 伴学</a></nav>
  </header>`)
    .replace('class="companion-layout"', `class="companion-layout course-${entry.courseId}${entry.id === 'pn-junction' ? ' pn-reader' : ''}"`)
    .replace('<div class="workspace">', () => `<div class="workspace"><div class="reader">${outline(entry)}`)
    .replace(/<section class="panel" id="review" hidden>[\s\S]*?<\/section>/, unitNotes)
    .replace(/<\/article>(\s*<aside class="companion")/, (_, companion) => `${figureDirectory(entry)}</article></div><div class="companion-backdrop" aria-hidden="true" hidden></div>${companion}`);
}

export function pnPage(base, entry, hasSourcePdf) {
  const guide = chapterLabs[entry.id];
  const excerpt = hasSourcePdf ? '<li><a target="_blank" rel="noopener" href="/source.pdf#page=1">PN 结的正偏与反偏 · 原课件第 48 至 52 页 ↗</a></li>' : '';
  const selfQuiz = base.match(/<h2>两题自测<\/h2>[\s\S]*?<div id="quiz-result"[^>]*><\/div>/)?.[0] ?? '';
  const body = base.replace(selfQuiz, '')
    .replace('<div id="messages" role="log" aria-label="伴学对话"></div>', '<details class="pn-chat-history" id="pn-chat-history" hidden><summary>历史对话</summary><div id="pn-history-messages"></div></details><div id="messages" role="log" aria-label="本次伴学对话"></div>')
    .replace('<p class="source" id="save-status" role="status">学习记录保存在当前浏览器。</p>', '<p class="source" id="save-status" role="status">学习记录保存在当前浏览器。</p><div id="pn-linked-notes" hidden><h3>按知识点查看</h3><ul></ul></div><button type="button" data-pn-export>导出笔记与错题</button>')
    .replace(/<header class="lesson-hero">[\s\S]*?<\/header>/, '')
    .replace(/<section class="panel experiment"[\s\S]*?<\/section>/, experiment => {
      const inline = experiment.replace('class="panel experiment"', 'class="inline-lab experiment"')
        .replace(/<div class="experiment-heading">.*?<\/div>/, () => labHeader(guide))
        .replace('</section>', () => `${labReasoning(guide)}</section>`);
      return curriculum(entry, inline, `<section class="pn-bias-quiz" aria-label="正反偏自测">${selfQuiz.replace('两题自测', '正反偏自测')}</section>`) + chapterUtilities(entry);
    })
    .replace(/<\/article>(\s*<aside class="companion")/, (_, companion) => `${studyResources(entry, excerpt)}</article>${companion}`);
  return readerPage(body, entry)
    .replace('<body ', '<link rel="stylesheet" href="/pn-model-check.css"><body ')
    .replace('</body>', '<script type="module" src="/pn-study.js"></script></body>');
}

export function chapterPage(base, entry) {
  const e = entry.experiment;
  const guide = chapterLabs[entry.id];
  const labels = ['correct', 'incorrect'];
  if (entry.id.length % 2) labels.reverse();
  const choices = labels.map(value => `<label><input required type="radio" name="choice" value="${value}"> ${lessonText(entry.quiz[value === 'correct' ? 1 : 2])}</label>`).join('');
  const quiz = practiceSelection[entry.id] ? '' : `<h2>随堂自测</h2><form id="quiz"><fieldset><legend>${lessonText(entry.quiz[0])}</legend>${choices}</fieldset><button>查看答案</button> <button type="button" id="retry">重新答题</button></form><div id="quiz-result" aria-live="polite"></div>`;
  const presets = guide.buttons.map(({ value, label }) => `<button type="button" data-lab-preset="${value}" aria-pressed="false">${lessonText(label)}</button>`).join('');
  const extraVisual = {
    convolution: '完整卷积结果 y(t)。圆点标出当前时刻和卷积值。',
    diffraction: '屏幕亮度示意。红色标记指向第一对暗纹。',
  }[e.chart];
  const experiment = `<section class="inline-lab experiment" id="experiment" tabindex="-1" aria-label="${encode(guide.title)}">
      ${labHeader(guide, e.formula)}
      <div class="parameter-row"><label for="bias">${lessonText(e.label)}</label><span id="field"></span></div>
      <input id="bias" type="range" min="${e.min}" max="${e.max}" step="${e.step}" value="${e.initial}">
      <div class="lab-presets" aria-label="对照参数">${presets}</div>
      <div class="experiment-plot"><canvas id="plot" role="img" aria-label="${encode(`${e.x}与${e.y}的交互图，${e.observation}`)}"></canvas><canvas id="ink" aria-hidden="true" hidden></canvas></div>
      <div id="legend" class="chart-legend"></div>
      ${extraVisual ? `<figure class="lab-extra-view"><canvas id="lab-visualization" role="img" aria-label="${encode(extraVisual)}"></canvas><figcaption>${encode(extraVisual)}</figcaption></figure>` : ''}
      <div class="lab-playback"><button type="button" id="advance">播放</button><button type="button" id="reset-lab">重置</button></div>
      <p class="lab-reading"><strong>当下读数</strong> <span id="lab-readout" role="status"></span></p>
      <div class="mark-tools" hidden><button type="button" id="draw" aria-pressed="false">圈画</button><button type="button" id="undo-ink" disabled>撤销圈画</button><button type="button" id="quote" disabled>引用选中文字</button></div>
      <p class="lab-observation" id="summary"></p>
      ${labReasoning(guide)}
    </section>`;
  const article = `<article class="lesson">
    ${curriculum(entry, experiment)}
    ${chapterUtilities(entry)}
    <section class="panel" id="review" hidden>${quiz}<h2><label for="notes">我的笔记</label></h2><textarea id="notes" rows="4" placeholder="记下还想复习的知识点"></textarea><p class="source" id="save-status" role="status">学习记录保存在当前浏览器。</p></section>
    ${studyResources(entry)}</article>`;
  const config = JSON.stringify(entry).replaceAll('<','\\u003c');
  const body = base.replace(/<article class="lesson">[\s\S]*?<\/article>/, () => article)
    .replace(/<script>[\s\S]*?<\/script>/, () => `<script>window.chapterData=${config}</script><script type="module" src="/experiments.js"></script>`)
    .replace('<script src="/companion.js"></script>', '<script type="module" src="/companion.js"></script>');
  return readerPage(body, entry);
}

export async function serveMaterial(url, request, response) {
  const source = resources.get(url.pathname);
  if (!source) return false;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return true;
  }
  const isSlides = /\.pptx?$/i.test(source.file);
  const preview = join(previewRoot, `${basename(source.file, extname(source.file))}.pdf`);
  const original = join(sourceRoot, folders[source.group], source.file);
  let file = original;
  if (isSlides && !source.original && !url.searchParams.has('original') && await stat(preview).then(s => s.size > 0, () => false)) file = preview;
  const mime = {
    '.pdf': 'application/pdf', '.jpg': 'image/jpeg',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }[extname(file).toLowerCase()];
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size === 0) throw new Error('missing material');
    const headers = { 'Content-Type': mime, 'Content-Length': info.size };
    if (!['application/pdf','image/jpeg'].includes(mime)) headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(basename(file))}`;
    response.writeHead(200, headers);
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      .end(request.method === 'HEAD' ? undefined : `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>原资料暂不可读</title><link rel="stylesheet" href="/study.css"><link rel="stylesheet" href="/study-interface.css"><main class="catalog-frame"><section class="panel"><h1>原资料暂不可读</h1><p>${encode(source.title)} · 本机文件缺失或无法读取。</p><p><a href="">重试</a> · <a href="/">返回课程目录</a></p></section></main></html>`);
  }
  return true;
}
