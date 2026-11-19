const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const encode = text => String(text).replace(/[&<>"']/g, char => entities[char]);

// In lesson text, subscripts use _name or _{name}. Group a power with ^(…) or ^[…].
const notation = /([A-Za-zα-ωΑ-Ωℏ])_(?:\{([^{}\n]+)\}|(?:[A-Z][A-Z0-9]*|[a-z][a-z0-9]*|[α-ωΑ-Ω0-9]+)[′']?|[+−-])|\^(?=[(\[−+\-0-9A-Za-zα-ωΑ-Ω])/gu;

function power(text, start) {
  const open = text[start];
  const close = { '(': ')', '[': ']' }[open];
  if (!close) {
    const value = text.slice(start).match(/^[−+\-]?(?:\d+(?:\.\d+)?|[A-Za-zα-ωΑ-Ω])/u)?.[0];
    return value && [value, start + value.length];
  }
  let depth = 1;
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === open) depth++;
    if (text[i] === close && --depth === 0) return [text.slice(start + 1, i), i + 1];
  }
}

export function lessonText(input) {
  const text = String(input);
  const tokens = new RegExp(notation);
  let html = '';
  let start = 0;
  for (let token; (token = tokens.exec(text));) {
    const index = token.index;
    if (token[1]) {
      const [raw, base, grouped] = token;
      const subscript = grouped ?? raw.slice(raw.indexOf('_') + 1);
      html += encode(text.slice(start, index)) + `<span class="math-symbol"><var>${base}</var><sub>${encode(subscript)}</sub></span>`;
    } else {
      const exponent = power(text, index + 1);
      if (!exponent) continue;
      const [value, end] = exponent;
      html += encode(text.slice(start, index)) + `<sup class="math-power">${lessonText(value)}</sup>`;
      tokens.lastIndex = end;
    }
    start = tokens.lastIndex;
  }
  return html + encode(text.slice(start));
}
