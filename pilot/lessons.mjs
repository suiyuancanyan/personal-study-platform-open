import { analogUnits } from './lessons/analog.mjs';
import { signalUnits } from './lessons/signals.mjs';
import { physicsUnits } from './lessons/physics.mjs';
import { addDepth, addExplanations } from './lessons/unit.mjs';
import { analogDepth } from './lessons/analog-depth.mjs';
import { signalDepth } from './lessons/signals-depth.mjs';
import { physicsDepth } from './lessons/physics-depth.mjs';
import { pnExplanations } from './lessons/pn-explanations.mjs';
import { analogExplanations } from './lessons/analog-explanations.mjs';
import { signalExplanations } from './lessons/signals-explanations.mjs';
import { physicsExplanations } from './lessons/physics-explanations.mjs';

export const unitsByChapter = { ...analogUnits, ...signalUnits, ...physicsUnits };
for (const content of [analogDepth, signalDepth, physicsDepth]) addDepth(unitsByChapter, content);
for (const unit of Object.values(unitsByChapter).flat()) {
  if (!unit.sections) throw new Error(`Missing expanded lesson: ${unit.id}`);
}
for (const content of [pnExplanations, analogExplanations, signalExplanations, physicsExplanations]) {
  addExplanations(unitsByChapter, content);
}
