import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = 'http://127.0.0.1:3200';
const name = '模电第一章 · PN 结的正偏与反偏';
const description = '结合课件第 48 至 52 页，比较正偏和反偏下的内电场、耗尽区宽度及电流。';
const source = new URL('../课件样板/PN结正偏与反偏（原课件48至52页）.pdf', import.meta.url);
const publicDir = new URL('../openmaic/public/study-materials/', import.meta.url);

async function request(path, method = 'GET', body) {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`${method} ${path} returned ${response.status}: ${detail}`);
  }
  return response.json();
}

await mkdir(publicDir, { recursive: true });
await copyFile(source, new URL('pn-junction.pdf', publicDir));
const html = (await readFile(new URL('pn-junction.html', import.meta.url), 'utf8'))
  .replace('../课件样板/模电第一章.pdf#page=48', `${origin}/study-materials/pn-junction.pdf#page=1`);
await writeFile(new URL('pn-junction.html', publicDir), html);

const { stages } = await request('/api/stages');
const existing = stages.find(stage => stage.name === name && stage.description === description);
const stage = existing ?? (await request('/api/stages', 'POST', { name, description })).stage;
const coursePath = `/api/stages/${stage.id}`;

if (!stage.sceneCount) {
  const scenes = [
    {
      id: 'pn-junction-demo', stageId: stage.id, title: '偏置交互演示', order: 0, type: 'interactive',
      content: { type: 'interactive', html, url: '' },
    },
    {
      id: 'pn-junction-quiz', stageId: stage.id, title: '两题自测', order: 1, type: 'quiz',
      content: {
        type: 'quiz',
        questions: [
          {
            id: 'pn-forward-field', type: 'single', hasAnswer: true, points: 1,
            question: 'P 区接电源正极、N 区接负极，耗尽区如何变化？',
            options: [
              { value: 'A', label: '变窄' }, { value: 'B', label: '变宽' }, { value: 'C', label: '宽度不变' },
            ],
            answer: ['A'], analysis: '外加电场与内电场方向相反，耗尽区变窄，正向扩散电流增大。见原课件第 48 至 49 页。',
          },
          {
            id: 'pn-reverse-current', type: 'single', hasAnswer: true, points: 1,
            question: '反向偏置且未击穿时，反向电流主要来自什么？',
            options: [
              { value: 'A', label: '多数载流子扩散' }, { value: 'B', label: '少数载流子漂移' }, { value: 'C', label: '雪崩倍增' },
            ],
            answer: ['B'], analysis: '反偏加强内电场，压制多数载流子扩散。少数载流子在电场作用下产生很小的反向漂移电流。见原课件第 50 至 52 页。',
          },
        ],
      },
    },
  ];
  await request(coursePath, 'PUT', {
    stage: { id: stage.id, name, description, createdAt: stage.createdAt, updatedAt: stage.updatedAt },
    scenes,
    outline: { outlines: [], requirement: description, generationComplete: true, createdAt: stage.createdAt, updatedAt: stage.updatedAt },
  });
}

console.log(`${origin}/classroom/${stage.id}`);
