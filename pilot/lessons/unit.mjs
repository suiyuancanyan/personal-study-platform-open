// A lesson uses one line per explanation, diagram, worked example and exercise.
export function units(chapter, content, offset = 0) {
  return content.trim().split(/\n\s*\n/).map((block, index) => {
    const [title, ...lines] = block.trim().split('\n').map(line => line.trim());
    const lesson = { id: `${chapter}-${offset + index + 1}`, title, paragraphs: [], examples: [], questions: [] };
    for (const line of lines) {
      if (line[1] !== ' ') {
        lesson.paragraphs.push(line);
        continue;
      }
      const value = line.slice(2).trim();
      switch (line[0]) {
        case '图': lesson.diagram = value.split('｜'); break;
        case '式': lesson.formula = value; break;
        case '例': {
          const [prompt, ...steps] = value.split('｜');
          lesson.examples.push({ prompt, steps });
          break;
        }
        case '题': {
          const [prompt, correct, distractor, explanation] = value.split('｜');
          lesson.questions.push({ id: `${lesson.id}-q${lesson.questions.length + 1}`, prompt, correct, distractor, explanation });
          break;
        }
        case '练': {
          const [prompt, answer, explanation] = value.split('｜');
          lesson.questions.push({ id: `${lesson.id}-q${lesson.questions.length + 1}`, prompt, answer, explanation });
          break;
        }
        case '源': lesson.source = value; break;
        default: lesson.paragraphs.push(line);
      }
    }
    if (lesson.paragraphs.length < 2 || lesson.diagram?.length !== 3 ||
        !lesson.examples.some(example => example.steps.length >= 2) ||
        lesson.questions.length < 2 || lesson.questions.some(q => !q.explanation || !(q.answer || q.distractor))) {
      throw new Error(`Incomplete lesson: ${lesson.id} ${title}`);
    }
    return lesson;
  });
}

export function extend(target, chapter, content) {
  target[chapter].push(...units(chapter, content, target[chapter].length));
}

export function addDepth(target, content) {
  const seen = new Set();
  for (const block of content.trim().split(/\n\s*\n/)) {
    const [id, ...lines] = block.trim().split('\n').map(line => line.trim());
    const chapter = id.slice(0, id.lastIndexOf('-'));
    const unit = target[chapter]?.find(item => item.id === id);
    if (!unit || seen.has(id)) throw new Error(`Unexpected expanded lesson: ${id}`);
    seen.add(id);
    unit.sections = [];
    const initialCount = unit.questions.length;
    for (const line of lines) {
      const [label, ...fields] = line.split('｜');
      const [first, second, third] = fields;
      if (label === '目标' && first) unit.goal = first;
      else if (label === '讲' && first && second) unit.sections.push({ title: first, paragraphs: fields.slice(1) });
      else if (label === '检' && first) unit.check = first;
      else if (label === '例' && fields.length >= 4) unit.examples.push({ prompt: first, steps: fields.slice(1) });
      else if (['基础', '应用', '综合'].includes(label) && first && second && third) {
        const id = `${unit.id}-q${unit.questions.length + 1}`;
        unit.questions.push({ id, level: label, prompt: first, answer: second, explanation: third });
      } else throw new Error(`Invalid expanded lesson ${id}: ${line}`);
    }
    if (!unit.goal || unit.sections.length < 2 || !unit.check || unit.examples.length < 2 || unit.questions.length < initialCount + 2) {
      throw new Error(`Missing explanation or practice for ${id}`);
    }
  }
}

export function addExplanations(target, content) {
  const units = new Map(Object.values(target).flat().map(unit => [unit.id, unit]));
  const seen = new Set();
  for (const block of content.trim().split(/\n\s*\n/)) {
    const [id, ...lines] = block.split('\n').map(line => line.trim());
    const unit = units.get(id);
    if (!unit || !lines.length || seen.has(id)) throw new Error(`Invalid explanation unit: ${id}`);
    seen.add(id);
    for (const line of lines) {
      const [label, title, ...paragraphs] = line.split('｜');
      if (label !== '讲' || !title || !paragraphs.length || paragraphs.some(p => !p)) throw new Error(`Invalid explanation: ${id} ${line}`);
      unit.sections.push({ title, paragraphs });
    }
  }
}
