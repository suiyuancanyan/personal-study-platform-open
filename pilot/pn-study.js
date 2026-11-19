import { initPnModelLab } from './pn-model-lab.js';
import { bindPnModelCheck } from './pn-model-check.mjs';

const unit = document.querySelector('#pn-junction-5');
const lesson = unit.closest('.lesson');
const bank = document.querySelector('#question-bank');
const resumeKey = 'personal-study-pn-model-place-v1';
const notesKey = 'personal-study-pn-model-notes-v1';
const backLinks = [...document.querySelectorAll('[data-pn-back]')];
const linkedNotes = document.querySelector('#pn-linked-notes');
const places = ['pn-model-lab', 'pn-model-explanation', 'pn-model-check'];
const taskIds = ['pn-model-task-1', 'pn-model-task-2', 'pn-model-task-3'];
let place;
let notes = {};
try {
  place = localStorage.getItem(resumeKey);
  notes = JSON.parse(localStorage.getItem(notesKey) ?? '{}') ?? {};
} catch { /* The lesson works without browser storage. */ }
let returnPoint = '';
let mastery;
let ticking = false;

initPnModelLab();

function updateMastery(progress) {
  mastery = progress;
  const tab = document.querySelector('[data-unit-select="pn-junction-5"]');
  const review = bank.querySelector('[data-pn-practice-review] ul');
  const needsReview = [...unit.querySelectorAll('[data-pn-needs-review="true"]')];
  tab.querySelector('[data-pn-mastery]').textContent = [
    `掌握 ${progress.masteredCount} / ${progress.total} 项`,
    needsReview.length ? `${needsReview.length} 项可复习` : '',
  ].filter(Boolean).join(' · ');
  review.replaceChildren(...needsReview.map(task => {
    const row = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${task.id}`;
    link.setAttribute('data-experiment-link', '');
    link.textContent = task.querySelector('.pn-task-kicker').textContent;
    row.append(link);
    return row;
  }));
  bank.dispatchEvent(new Event('study-practice-updated'));
}
if (unit.querySelector('[data-pn-task]')) bindPnModelCheck(unit, updateMastery);
if (place && !document.getElementById(place)) place = 'pn-model-check';

function savePlace(id) {
  if (!places.includes(id) && !taskIds.includes(id)) return;
  if (place === id) return;
  place = id;
  try { localStorage.setItem(resumeKey, id); } catch { /* Position is still available this visit. */ }
}

function updatePlace() {
  ticking = false;
  const frame = lesson.getBoundingClientRect();
  const top = Math.max(frame.top, 60);
  const bottom = Math.min(frame.bottom, innerHeight);
  const unitBox = unit.getBoundingClientRect();
  const inUnit = !unit.hidden && unitBox.top < bottom - 40 && unitBox.bottom > top + 60;
  const active = inUnit && places.find(id => {
    const place = document.getElementById(id);
    return !place.closest('[hidden]') && place.getBoundingClientRect().top <= top + 90;
  });
  if (active) {
    const task = active === 'pn-model-check' && taskIds.findLast(id => document.getElementById(id)?.getBoundingClientRect().top <= top + 115);
    savePlace(task || active);
  }
}

function trackPosition() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updatePlace);
}

function setReturn(id) {
  returnPoint = id;
  for (const link of backLinks) {
    link.hidden = !id;
    link.href = `#${id || unit.id}`;
  }
}

document.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  if (link.hasAttribute('data-pn-prereq')) setReturn(unit.id);
  if (link.hasAttribute('data-pn-back')) requestAnimationFrame(() => setReturn(''));
}, { capture: true });

window.addEventListener('study-unit-changed', () => {
  if (!unit.hidden && returnPoint) requestAnimationFrame(() => setReturn(''));
  trackPosition();
});
window.addEventListener('study-step-changed', trackPosition);
document.addEventListener('scroll', trackPosition, { capture: true, passive: true });
window.addEventListener('resize', trackPosition);
unit.addEventListener('focusin', event => {
  const target = event.target.closest('[data-pn-task]');
  if (target) savePlace(target.id);
});

const resume = unit.querySelector('[data-pn-resume]');
if (place && place !== unit.id && document.getElementById(place)) {
  resume.href = `#${place}`;
  resume.hidden = false;
}
trackPosition();

function noteTitle(id) {
  return ({
    'pn-model-lab': '电源与工作点',
    'pn-model-explanation': '从电路图到算式',
    'pn-model-task-3': '陌生电路判断',
  })[id];
}

function renderNotes() {
  const list = linkedNotes.querySelector('ul');
  list.replaceChildren();
  for (const [id, value] of Object.entries(notes)) {
    if (!value || !noteTitle(id)) continue;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.setAttribute('data-experiment-link', '');
    a.textContent = noteTitle(id);
    const p = document.createElement('p');
    p.textContent = value;
    li.append(a, p);
    list.append(li);
  }
  linkedNotes.hidden = !list.childElementCount;
}

function addNote(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const details = document.createElement('details');
  details.className = 'pn-note';
  const summary = document.createElement('summary');
  summary.textContent = '记一句笔记';
  const field = document.createElement('textarea');
  field.rows = 2;
  field.setAttribute('aria-label', `${noteTitle(id)}笔记`);
  field.dataset.pnNote = id;
  details.append(summary, field);
  target.append(details);
}

addNote('pn-model-lab');
addNote('pn-model-task-3');
for (const field of unit.querySelectorAll('[data-pn-note]')) {
  field.value = notes[field.dataset.pnNote] ?? '';
  field.addEventListener('input', () => {
    notes[field.dataset.pnNote] = field.value;
    try { localStorage.setItem(notesKey, JSON.stringify(notes)); } catch { /* Keep the note in this page. */ }
    renderNotes();
  });
}
renderNotes();

document.querySelector('[data-pn-export]').addEventListener('click', () => {
  const general = document.querySelector('#notes').value.trim();
  const recorded = Object.entries(notes).filter(([id, value]) => noteTitle(id) && value.trim())
    .map(([id, value]) => `${noteTitle(id)}\n${value}\n${location.origin}${location.pathname}#${id}`);
  const unitNotes = [...document.querySelectorAll('[data-unit-notes] li')].map(item => {
    const link = item.querySelector('a');
    return `${link.textContent}\n${item.querySelector('p').textContent}\n${link.href}`;
  });
  const wrong = [...bank.querySelectorAll('[data-question]')]
    .filter(card => card.querySelector('.bank-status').textContent === '已加入错题')
    .map(card => card.querySelector('[data-example-prompt]').textContent);
  const text = ['PN 结学习记录', general, ...unitNotes, ...recorded,
    mastery ? `第 5 节练习进度：${mastery.masteredCount} / ${mastery.total} 项` : '',
    ...[...unit.querySelectorAll('[data-pn-task]')].filter(task => task.dataset.pnNeedsReview === 'true')
      .map(task => task.querySelector('h3').textContent),
    wrong.length ? `题库错题\n${wrong.join('\n')}` : '',
  ].filter(Boolean).join('\n\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'PN结学习记录.txt';
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
