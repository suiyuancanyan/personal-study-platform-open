import { execFile } from 'node:child_process';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { createInterface } from 'node:readline';

const deepseekModels = new Set(['deepseek-flash', 'deepseek-v4-pro']);
const serverKey = () => process.env.STUDY_DEEPSEEK_API_KEY || process.env.PAPERLENS_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;

export function companionStatus() {
  return { deepseekConfigured: Boolean(serverKey()) };
}

export function validCompanionModel(channel) {
  return channel === 'codex' || deepseekModels.has(channel);
}

export class CompanionError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

function codexArgs(model) {
  const args = ['exec', '--json', '--ephemeral', '--skip-git-repo-check', '--ignore-user-config', '--sandbox', 'read-only'];
  for (const feature of ['shell_tool', 'apps', 'plugins', 'multi_agent', 'computer_use', 'browser_use', 'image_generation', 'view_image', 'shell_snapshot']) {
    args.push('--disable', feature);
  }
  return [...args, '-c', 'web_search="disabled"', '-c', 'project_doc_max_bytes=0', '-c', 'approval_policy="never"',
    '-c', 'model_reasoning_effort="low"', '-c',
    'developer_instructions="You are a Chinese study tutor. Use the supplied conversation and lesson as reference. Do not use tools, access files, browse, or execute tasks. Give the student one manageable step at a time."',
    '--model', model, '-'];
}

function codexError(detail, error) {
  if (error?.code === 'ENOENT') return new CompanionError('未找到 Codex，请检查本机安装。');
  if (error?.killed) return new CompanionError('Codex 等待超时，可以重试。', 504);
  if (/quota|usage.?limit|rate.?limit|429/i.test(detail)) return new CompanionError('Codex 当前请求受限，可以切换 DeepSeek 或稍后重试。', 429);
  if (/unauthorized|login|auth|401/i.test(detail)) return new CompanionError('Codex 需要登录，请在 Codex 中登录后重试。');
  if (/model.*(?:not found|not supported|not available|unsupported)/i.test(detail)) return new CompanionError('当前 Codex 模型不可用，请检查本机模型配置。');
  return new CompanionError('Codex 未完成回答，请检查连接后重试。');
}

async function runCodex(messages, signal) {
  const directory = await mkdtemp(join(tmpdir(), 'study-companion-'));
  const model = 'gpt-6-luna';
  const executable = process.env.STUDY_CODEX_PATH || process.env.PAPERLENS_CODEX_PATH || 'codex';
  const prompt = messages.map(({ role, content }) => `=== ${role.toUpperCase()} ===\n${content}`).join('\n\n');
  try {
    return await new Promise((resolve, reject) => {
      const child = execFile(executable, codexArgs(model), {
        cwd: directory, signal, timeout: 180_000, maxBuffer: 2_000_000, windowsHide: true,
      }, (error, stdout, stderr) => {
        let result = '';
        let completed = false;
        let failure = '';
        for (const line of stdout.split(/\r?\n/)) {
          let event;
          try { event = JSON.parse(line); } catch { continue; }
          if (event.type === 'item.completed' && event.item?.type === 'agent_message') result = event.item.text ?? '';
          if (event.type === 'turn.completed') completed = true;
          if (event.type === 'turn.failed' || event.type === 'error') failure = event.error?.message || event.message || 'failed';
        }
        if (error || failure || !completed || !result.trim()) reject(codexError(failure + stderr, error));
        else resolve(result);
      });
      child.stdin.on('error', () => {});
      child.stdin.end(prompt, 'utf8');
    });
  } finally {
    await rmdir(directory).catch(() => {});
  }
}

async function* streamDeepSeek(model, providedKey, messages, signal) {
  const key = providedKey || serverKey();
  if (!key) throw new CompanionError('请在伴学面板输入 DeepSeek API Key。', 400);
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST', signal: AbortSignal.any([signal, AbortSignal.timeout(150_000)]),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, thinking: { type: 'disabled' }, temperature: 0.3, max_tokens: 1600, stream: true }),
  });
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    const errors = { 401: 'DeepSeek API Key 验证失败，请检查后重试。', 402: 'DeepSeek 余额不足，可以切换到 Codex。', 429: 'DeepSeek 当前请求受限，可以切换到 Codex 或稍后重试。' };
    throw new CompanionError(errors[response.status] ?? 'DeepSeek 暂时无法回答，请检查连接后重试。');
  }
  const body = Readable.fromWeb(response.body);
  const lines = createInterface({ input: body, crlfDelay: Infinity });
  let completed = false;
  try {
    for await (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') { completed = true; break; }
      const frame = JSON.parse(data);
      if (frame.error) throw new CompanionError('DeepSeek 未完成回答，请重试。');
      const delta = frame.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta) yield delta;
    }
  } finally {
    lines.close();
    body.destroy();
  }
  if (!completed) throw new CompanionError('DeepSeek 的回答中断，可以重新发送。');
}

export async function* companionReply({ channel, key, messages, signal }) {
  if (channel === 'codex') yield await runCodex(messages, signal);
  else yield* streamDeepSeek(channel, key, messages, signal);
}
