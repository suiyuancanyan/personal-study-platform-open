import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { CompanionError, companionReply, companionStatus, validCompanionModel } from './companion-models.mjs';
import { chapters } from './chapters.mjs';
import { catalogPage, chapterPage, pnPage, serveMaterial } from './course-pages.mjs';
import { unitsByChapter } from './lessons.mjs';
import { figurePaths } from './figure-library.mjs';

const host = '127.0.0.1';
const port = Number(process.env.STUDY_PORT ?? 3210);
const origin = `http://${host}:${port}`;
const loopbackOrigins = new Set([origin, `http://localhost:${port}`]);
const pdf = await readFile(new URL('../课件样板/PN结正偏与反偏（原课件48至52页）.pdf', import.meta.url))
  .catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
const html = (await readFile(new URL('pn-junction.html', import.meta.url), 'utf8'))
  .replace('</body>', '<script src="/curriculum.js"></script><script src="/derivation.js"></script><script type="module" src="/lesson-visuals.js"></script><script type="module" src="/unit-labs.js"></script><script src="/companion.js"></script><script src="/figure-viewer.js"></script></body>');
const pages = {
  '/': ['text/html; charset=utf-8', catalogPage()],
  '/companion.js': ['text/javascript; charset=utf-8', await readFile(new URL('companion.js', import.meta.url))],
  '/curriculum.js': ['text/javascript; charset=utf-8', await readFile(new URL('curriculum.js', import.meta.url))],
  '/pn-study.js': ['text/javascript; charset=utf-8', await readFile(new URL('pn-study.js', import.meta.url))],
  '/pn-model-lab.js': ['text/javascript; charset=utf-8', await readFile(new URL('pn-model-lab.js', import.meta.url))],
  '/pn-model-check.mjs': ['text/javascript; charset=utf-8', await readFile(new URL('pn-model-check.mjs', import.meta.url))],
  '/pn-model-check.css': ['text/css; charset=utf-8', await readFile(new URL('pn-model-check.css', import.meta.url))],
  '/derivation.js': ['text/javascript; charset=utf-8', await readFile(new URL('derivation.js', import.meta.url))],
  '/figure-viewer.js': ['text/javascript; charset=utf-8', await readFile(new URL('figure-viewer.js', import.meta.url))],
  '/catalog.js': ['text/javascript; charset=utf-8', await readFile(new URL('catalog.js', import.meta.url))],
  '/lesson-visuals.js': ['text/javascript; charset=utf-8', await readFile(new URL('lesson-visuals.js', import.meta.url))],
  '/guided-figures.mjs': ['text/javascript; charset=utf-8', await readFile(new URL('guided-figures.mjs', import.meta.url))],
  '/lesson-text.mjs': ['text/javascript; charset=utf-8', await readFile(new URL('lesson-text.mjs', import.meta.url))],
  '/lesson-diagram-scenes.mjs': ['text/javascript; charset=utf-8', await readFile(new URL('lesson-diagram-scenes.mjs', import.meta.url))],
  '/unit-labs.js': ['text/javascript; charset=utf-8', await readFile(new URL('unit-labs.js', import.meta.url))],
  '/unit-lab-diagrams.mjs': ['text/javascript; charset=utf-8', await readFile(new URL('unit-lab-diagrams.mjs', import.meta.url))],
  '/experiments.js': ['text/javascript; charset=utf-8', await readFile(new URL('experiments.js', import.meta.url))],
  '/study.css': ['text/css; charset=utf-8', await readFile(new URL('study.css', import.meta.url))],
  '/study-interface.css': ['text/css; charset=utf-8', await readFile(new URL('study-interface.css', import.meta.url))],
  '/study-notebook.webp': ['image/webp', await readFile(new URL('study-notebook.webp', import.meta.url))],
};
if (pdf) pages['/source.pdf'] = ['application/pdf', pdf];
const imageTypes = { png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' };
for (const path of figurePaths) {
  const match = path.match(/^\/figures\/(?:analog|physics|signals)\/[a-z0-9_-]+\.(png|webp|jpe?g|svg)$/i);
  if (!match) throw new Error(`Invalid figure path: ${path}`);
  pages[path] = [imageTypes[match[1].toLowerCase()], await readFile(new URL(`.${path}`, import.meta.url))];
}
for (const entry of chapters.values()) {
  const body = entry.id === 'pn-junction' ? pnPage(html, entry, Boolean(pdf)) : chapterPage(html, entry);
  pages[entry.path] = ['text/html; charset=utf-8', body];
}

const tutorPrompt = `你是模电课的中文伴学老师。优先回答学生当前卡住的地方，通常用两三句话说明原因和结果。
如果学生要求出题，出一道短题，先等学生回答。学生回答后，指出对错与原因。
教学依据是模电第一章原课件第 48 至 52 页。第 48 至 49 页：正偏时 P 接正极、N 接负极，外加电场和内电场反向，降低势垒，耗尽区变窄。P 区空穴和 N 区电子从两侧向结区扩散更容易，正向扩散电流增大。耗尽区主要含固定离子，移动载流子浓度很低。解释时优先采用以上表述。
第 50 至 51 页：反偏时 P 接负极、N 接正极，外加电场和内电场同向，势垒升高，耗尽区变宽，多数载流子跨结扩散受抑制。击穿前，少数载流子在电场作用下漂移，形成很小的反向电流。说清多数载流子的扩散与少数载流子的漂移，避免笼统描述电场排斥载流子。
第 52 页：上述差异体现单向导电性。零偏时扩散和漂移平衡，净电流为零。图的滑块是相对强弱，没有电压单位。
只有讲到这些课件内容时才在回答末尾标明对应页码。圈画区域来自位置推断，结合提问解释，遇到模糊指代时先确认。`;

async function chat(request, response) {
  const requestOrigin = request.headers.origin;
  if ((requestOrigin && !loopbackOrigins.has(requestOrigin)) ||
      !request.headers['content-type']?.startsWith('application/json')) {
    response.writeHead(403).end();
    return;
  }

  let input;
  try {
    let body = '';
    request.setEncoding('utf8');
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 18000) {
        response.writeHead(413).end();
        return;
      }
    }
    input = JSON.parse(body);
  } catch {
    response.writeHead(400).end();
    return;
  }

  const { messages, context, chapter = 'pn-junction', unit, channel = 'codex', key } = input ?? {};
  const lesson = chapters.get(chapter);
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 9 ||
      messages.some(message => !message || !['user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string' || !message.content.trim() || message.content.length > 1500) ||
      messages.at(-1).role !== 'user' || typeof context !== 'string' || context.length > 1800 || !lesson ||
      !validCompanionModel(channel) || (key !== undefined && (typeof key !== 'string' || !/^[!-~]{0,256}$/.test(key)))) {
    response.writeHead(400).end();
    return;
  }

  const abort = new AbortController();
  response.once('close', () => abort.abort());
  const activeUnit = unitsByChapter[chapter]?.find(entry => entry.id === unit);
  const hintRule = unit === 'pn-junction-5'
    ? '\n读二极管符号时，竖杠一侧是阴极 K，另一侧是阳极 A。符号尖端指向阴极。学生只要一步提示时，只说接下来该观察或计算哪一步。判断接法的第一步可让学生在图上找竖杠、认出阴极。先停在那里，等学生自己判断，不报结论和数值。'
    : '';
  const chapterInstructions = chapter === 'pn-junction' ? tutorPrompt : `你是《${lesson.course}》中文伴学老师。当前是${lesson.number}《${lesson.title}》。
结合本章知识点、当前参数、圈画位置和学生所引用的文字作答。默认用两三句话。学生要求出题时，先出一道短题，等学生回答再解释。
本章知识点：${lesson.key.join(' ')}
参数实验：${lesson.experiment.formula}。${lesson.experiment.observation}
可以在现有材料支持的范围内解释。没有明确页码时不要编造页码；圈画只表示大致位置。`;
  const examples = activeUnit?.examples.map(({ prompt, steps }, index) => [`例题 ${index + 1}：${prompt}`, ...steps].join('\n')).join('\n\n');
  const walkthrough = activeUnit?.sections.map(({ title, paragraphs }) => [title, ...paragraphs].join('\n')).join('\n\n');
  const lessonInstructions = activeUnit
    ? `${chapterInstructions}\n当前小节《${activeUnit.title}》优先于章节实验。面向初学者，解释用到的术语；学生问怎么算时，写出公式、代入和中间结果。先识别学生所问的例题，沿用该题的数据、步骤和结果，核对边界、单位和分项加总。只有学生要求出题时才附加练习。${hintRule}\n${activeUnit.paragraphs.join(' ')}\n${walkthrough}\n${activeUnit.formula ?? ''}\n检查：${activeUnit.check}\n本节例题：\n${examples}`
    : chapterInstructions;
  const instructions = `${lessonInstructions}\n如果课件状态标记了“当前例题”，以该题的题干、图中信息和参考解法为准。学生明确要完整详解时，写出读图、列式依据、各步代入计算和验算，篇幅按题目难度决定。一般首次讲题时，交代已知和所求，给一个具体的起步提示就停下。用中文短段落和可直接阅读的公式，例如 I_B = (5 − 0.7) / R_B。用 I_B 或 V_{CE} 写下标，使用 Unicode 数学符号和普通斜线表示分数。请勿使用 Markdown 标记、LaTeX 命令或数学环境。`;
  try {
    const modelMessages = [{ role: 'system', content: instructions }, ...messages.slice(0, -1), {
      role: 'user', content: `当前课件状态（供参考）\n${context}\n\n学生提问\n${messages.at(-1).content}`,
    }];
    let received = false;
    for await (const content of companionReply({ channel, key, messages: modelMessages, signal: abort.signal })) {
      if (response.destroyed) return;
      if (!response.headersSent) response.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' });
      response.write(`${JSON.stringify({ message: { content } })}\n`);
      received ||= Boolean(content.trim());
    }
    if (!received) throw new CompanionError('模型返回了空回答，可以重新发送。');
    response.end('{"done":true}\n');
  } catch (error) {
    if (abort.signal.aborted) return;
    const message = error instanceof CompanionError ? error.message : '模型服务暂时无法连接，可以重新发送。';
    const body = JSON.stringify({ error: message });
    if (response.headersSent) response.end(`${body}\n`);
    else response.writeHead(error instanceof CompanionError ? error.status : 502, {
      'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    }).end(body);
  }
}

createServer((request, response) => {
  const url = new URL(request.url, origin);
  const path = url.pathname;
  if (path === '/api/chat' && request.method === 'POST') {
    void chat(request, response);
    return;
  }
  if (path === '/api/companion/status' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      .end(JSON.stringify(companionStatus()));
    return;
  }
  if (path.startsWith('/materials/')) {
    void serveMaterial(url, request, response).then(served => { if (!served) response.writeHead(404).end(); });
    return;
  }
  const page = Object.hasOwn(pages, path) && pages[path];
  if (!page) {
    response.writeHead(404).end();
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const [type, body] = page;
  response.writeHead(200, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body) });
  response.end(request.method === 'HEAD' ? undefined : body);
}).listen(port, host, () => console.log(`http://${host}:${port}`));
