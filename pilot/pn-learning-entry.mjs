export function pnSeriesCircuit(id, supply) {
  return `
  <figure class="pn-entry-circuit">
    <svg viewBox="0 0 540 177" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg">
      <title id="${id}-title">电源、电阻和二极管串联回路</title>
      <desc id="${id}-desc">${supply} 电源的正极经一千欧电阻连接二极管阳极 A，电流参考方向从阳极到阴极 K。二极管电压的参考正端在 A，负端在 K。</desc>
      <defs>
        <marker id="${id}-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0 0L9 4.5L0 9Z" fill="currentColor" />
        </marker>
      </defs>
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M120 48H200M315 48H350M410 48H500V160H120V130M120 80V48" />
        <path d="M200 48l10-13 15 26 15-26 15 26 15-26 15 26 15-26 15 13" />
        <path d="M100 80H140M108 130H132" />
        <path class="pn-current-arrow" d="M145 20H190" marker-end="url(#${id}-arrow)" />
        <path d="M350 23L395 48L350 73Z" fill="currentColor" stroke="none" />
        <path d="M410 23V73" stroke-width="5" />
        <path d="M395 48H410" />
      </g>
      <g fill="currentColor" font-family="system-ui, sans-serif" font-size="18" font-weight="600">
        <text x="10" y="111" font-size="18" data-pn-supply>${supply}</text>
        <text x="258" y="29" text-anchor="middle">1 kΩ</text>
        <text class="pn-current-label" x="202" y="20">I<tspan baseline-shift="sub" font-size="13">D</tspan></text>
        <text class="pn-voltage-label" x="345" y="17" text-anchor="end">A</text>
        <text class="pn-voltage-label" x="416" y="17">K</text>
        <text class="pn-voltage-label" x="380" y="105" text-anchor="middle">+ V<tspan baseline-shift="sub" font-size="13">D</tspan> −</text>
        <text x="88" y="86" text-anchor="middle">+</text>
        <text x="88" y="136" text-anchor="middle">−</text>
      </g>
    </svg>
    <figcaption>电源、电阻与二极管串联，流过它们的是同一股电流。</figcaption>
  </figure>`;
}

export function pnLearningEntry() {
  return `
<div class="pn-learning-entry">
  ${pnSeriesCircuit('pn-entry-circuit', '0.5 V / 5 V')}
  <p class="pn-entry-terms"><strong>A</strong> 为阳极，<strong>K</strong> 为阴极。</p>
  <nav class="pn-entry-prereqs" aria-label="相关基础">
    <a href="#pn-circuit-basics" data-experiment-link data-pn-prereq>回顾电压、电流和电阻</a>
    <a href="#pn-bias-basics" data-experiment-link data-pn-prereq>回顾正向与反向偏置</a>
  </nav>
</div>`;
}
