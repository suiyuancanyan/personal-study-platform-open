import { analogExampleFigures } from './lessons/analog-example-figures.mjs';
import { physicsExampleFigures } from './lessons/physics-example-figures.mjs';
import { signalsExampleFigures } from './lessons/signals-example-figures.mjs';

export const exampleFigures = { ...analogExampleFigures, ...physicsExampleFigures, ...signalsExampleFigures };
// Source exercise collections can be supplied with authorized course material.
export const sourceProblems = {};

export const figurePaths = new Set([
  ...Object.values(exampleFigures).flat(),
  ...Object.values(sourceProblems).flatMap(problems => problems.flatMap(problem => problem.figures)),
].map(figure => figure.src));
