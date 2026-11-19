import { pnSeriesCircuit } from './pn-learning-entry.mjs';

export function pnModelLab() {
  return `<section class="pn-model-lab" id="pn-model-lab" tabindex="-1" aria-labelledby="pnml-title">
    <div class="pnml-intro"><h3 id="pnml-title">改变电源，比较三种模型</h3></div>
    <div class="pnml-card" id="pnml-predict">
      <h3>第一步：先作预测</h3>
      <fieldset>
        <legend>电源为 0.5 V 时，你预计二极管电流有多大？</legend>
        <div class="pnml-options">
          <label class="pnml-choice"><input type="radio" name="pnml-prediction" value="zero"> 约为 0，基本截止</label>
          <label class="pnml-choice"><input type="radio" name="pnml-prediction" value="large"> 已明显导通，电流较大</label>
        </div>
      </fieldset>
      <button class="pnml-button" id="pnml-submit" type="button">提交预测</button>
      <p class="pnml-note">先按自己的理解选择。提交后才会显示电路切换与曲线。</p>
      <p id="pnml-prediction-feedback" aria-live="polite"></p>
    </div>
    <div id="pnml-experiment" hidden>
      <div class="pnml-stage">
        <div class="pnml-card">
          <h3>第二步：切换电源</h3>
          <p>切换 0.5 V 和 5 V，比较电阻两端的压降。</p>
          <div class="pnml-switches" role="group" aria-label="选择电源电压">
            <button type="button" class="pnml-switch" data-source="0.5" aria-pressed="true">0.5 V</button>
            <button type="button" class="pnml-switch" data-source="5" aria-pressed="false">5 V</button>
          </div>
          ${pnSeriesCircuit('pnml-circuit', '0.5 V')}
          <div class="pnml-readout" id="pnml-readout" aria-live="polite"></div>
          <label for="pnml-voltage">微调电源电压（0–5 V）</label>
          <input id="pnml-voltage" type="range" min="0" max="5" step="0.1" value="0.5" aria-label="电源电压，0 到 5 伏">
          <p class="pnml-note">电阻压降 V<sub>R</sub> = V<sub>S</sub> − V<sub>D</sub>。</p>
        </div>
        <div class="pnml-card">
          <h3>第三步：看三种模型</h3>
          <p>同一电路可用不同二极管模型估算。下图为当前电源对应的负载线与二极管伏安曲线。</p>
          <div class="pnml-chart-wrap" id="pnml-chart" aria-live="polite"></div>
          <div class="pnml-key" aria-label="图例"><span><i class="pnml-dot"></i>代表性器件曲线</span><span><i class="pnml-dash"></i>负载线</span><span><i class="pnml-ideal"></i>理想模型</span><span><i class="pnml-fixed"></i>0.7 V 模型</span><span><i class="pnml-point"></i>连续曲线交点</span></div>
          <details class="pnml-note"><summary>曲线取值说明</summary><p>图中用一条代表性的硅二极管曲线作模拟。曲线在 V<sub>D</sub> = 0.70 V 时的 I<sub>D</sub> 约为 1 mA。计算参数为 nV<sub>T</sub> = 0.05 V、I<sub>S</sub> = 8.3 × 10<sup>−10</sup> A。</p></details>
        </div>
      </div>
      <div class="pnml-card pnml-interpretation">
        <h3>最后解释：为什么工作点会移动？</h3>
        <p>负载线来自回路方程：I<sub>D</sub> = (V<sub>S</sub> − V<sub>D</sub>)/R。器件曲线描述二极管自身的电压与电流关系。两条关系同时成立的位置，就是这个电源和电阻下的工作点。</p>
        <div class="pnml-answer" id="pnml-explanation"></div>
        <fieldset><legend>用自己的话解释</legend>
          <label for="pnml-own-words">当电源从 0.5 V 调到 5 V，工作点为什么移动？</label>
          <textarea id="pnml-own-words" rows="3" placeholder="可以从负载线和器件曲线的交点来说明"></textarea>
          <button class="pnml-button" id="pnml-check-words" type="button">查看提示</button>
          <p id="pnml-words-hint" aria-live="polite" hidden>电源改变会移动负载线；新的交点同时满足回路方程和二极管伏安关系。</p>
        </fieldset>
        <a class="pn-primary" href="#pn-model-explanation" data-experiment-link>用算式解释</a>
      </div>
    </div>
  </section>`;
}
