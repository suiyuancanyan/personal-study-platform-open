(() => {
  if (!document.querySelector('[data-open-figure]')) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'figure-viewer';
  dialog.setAttribute('aria-labelledby', 'figure-viewer-title');
  dialog.innerHTML = `<header><h2 id="figure-viewer-title">原题图片</h2><button type="button" autofocus>关闭</button></header>
    <div class="figure-viewer-image" tabindex="0" aria-label="图片区域，放大后可用方向键平移">
      <img alt=""><div class="figure-error" hidden><p role="status">图片加载失败。</p><button type="button" data-retry-figure>重试图片</button></div>
    </div>
    <footer><div class="figure-caption"><p></p><a target="_blank" rel="noopener" data-figure-source>打开原资料</a></div>
      <div class="figure-viewer-controls">
        <button type="button" data-figure-prev>上一张</button><span data-figure-count role="status"></span><button type="button" data-figure-next>下一张</button>
        <button type="button" data-figure-out aria-label="缩小图片">−</button><button type="button" data-figure-in aria-label="放大图片">＋</button>
        <button type="button" class="figure-zoom">实际大小</button><button type="button" data-ask-figure>引用图注提问</button>
      </div>
    </footer>`;
  document.body.append(dialog);
  const get = selector => dialog.querySelector(selector);
  const image = get('img');
  const caption = get('.figure-caption p');
  const source = get('[data-figure-source]');
  const frame = get('.figure-viewer-image');
  const zoom = get('.figure-zoom');
  const error = get('.figure-error');
  const prev = get('[data-figure-prev]');
  const next = get('[data-figure-next]');
  const count = get('[data-figure-count]');
  const zoomOut = get('[data-figure-out]');
  const zoomIn = get('[data-figure-in]');
  let opener;
  let pictures;
  let index;
  let scale = 1;
  let quote = '';
  let drag;

  function resize() {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    if (!naturalWidth || !dialog.open) return;
    const fit = Math.max(1, Math.min(naturalWidth * 1.55, frame.clientWidth - 24, (innerHeight * .73 - 24) * naturalWidth / naturalHeight));
    const width = scale === 'actual' ? naturalWidth : Math.max(1, fit * scale);
    image.style.width = `${width}px`;
    frame.classList.toggle('is-pannable', scale !== 1);
    zoom.textContent = scale === 1 ? '实际大小' : '适应窗口';
    zoomOut.disabled = scale === 1;
    zoomIn.disabled = typeof scale === 'number' && scale >= 4;
  }

  function load() {
    const link = pictures[index];
    const figure = link.closest('figure');
    const provenance = figure.querySelector('figcaption a');
    caption.textContent = figure.querySelector('figcaption').textContent.trim();
    source.hidden = !provenance;
    if (provenance) source.href = provenance.href;
    image.alt = link.querySelector('img').alt;
    image.hidden = false;
    error.hidden = true;
    scale = 1;
    frame.scrollTo(0, 0);
    frame.classList.remove('is-pannable');
    image.style.width = '';
    zoom.textContent = '实际大小';
    zoom.disabled = zoomIn.disabled = zoomOut.disabled = true;
    image.src = link.href;
    prev.hidden = next.hidden = count.hidden = pictures.length < 2;
    prev.disabled = index === 0;
    next.disabled = index === pictures.length - 1;
    count.textContent = `${index + 1} / ${pictures.length}`;
    if (image.complete && image.naturalWidth) onLoad();
  }

  function onLoad() {
    zoom.disabled = false;
    resize();
  }

  image.addEventListener('load', onLoad);
  image.addEventListener('error', () => {
    image.hidden = true;
    error.hidden = false;
  });
  window.addEventListener('resize', resize);
  get('[data-retry-figure]').addEventListener('click', () => {
    image.removeAttribute('src');
    load();
    frame.focus();
  });
  document.querySelector('.lesson').addEventListener('click', event => {
    const target = event.target.closest('[data-open-figure]');
    if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = target;
    pictures = [...target.closest('.example-figures').querySelectorAll('[data-open-figure]')];
    index = pictures.indexOf(target);
    quote = '';
    dialog.showModal();
    load();
  });
  prev.addEventListener('click', () => { index--; load(); if (prev.disabled) next.focus(); });
  next.addEventListener('click', () => { index++; load(); if (next.disabled) prev.focus(); });
  zoom.addEventListener('click', () => {
    scale = scale === 1 ? 'actual' : 1;
    if (scale === 1) frame.scrollTo(0, 0);
    resize();
  });
  zoomIn.addEventListener('click', () => { scale = typeof scale === 'number' ? Math.min(4, scale * 1.5) : 2; resize(); });
  zoomOut.addEventListener('click', () => { scale = typeof scale === 'number' ? Math.max(1, scale / 1.5) : 1; resize(); });
  frame.addEventListener('pointerdown', event => {
    if (scale === 1 || event.target !== image || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, left: frame.scrollLeft, top: frame.scrollTop };
    frame.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  frame.addEventListener('pointermove', event => {
    if (drag) frame.scrollTo(drag.left + drag.x - event.clientX, drag.top + drag.y - event.clientY);
  });
  frame.addEventListener('lostpointercapture', () => { drag = null; });
  frame.addEventListener('keydown', event => {
    const offsets = { ArrowUp: [0, -48], ArrowDown: [0, 48], ArrowLeft: [-48, 0], ArrowRight: [48, 0] };
    if (!offsets[event.key]) return;
    event.preventDefault();
    frame.scrollBy(...offsets[event.key]);
  });
  get('[autofocus]').addEventListener('click', () => dialog.close());
  get('[data-ask-figure]').addEventListener('click', () => {
    const prompt = opener.closest('[data-example]')?.querySelector('[data-example-prompt]')?.textContent;
    quote = [caption.textContent, image.alt, prompt].filter(Boolean).join(' ').slice(0, 350);
    dialog.close();
  });
  dialog.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    if (quote) document.dispatchEvent(new CustomEvent('study-figure-quote', {
      detail: { text: quote, source: opener.closest('[data-example]'), opener },
    }));
  });
})();
