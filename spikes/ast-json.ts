import { ts, tsm } from './deps.ts';

const p = new tsm.Project();
const text = `
export function hello() {}
`;
const sourceFile = p.createSourceFile(`${crypto.randomUUID()}.ts`, text);

// Add an ID to every node in the tree to make it easier to identify in
// the consuming application.
let nextId = 0;
export interface Node extends tsm.ts.Node {
  id?: number;
}
function addId(node: Node) {
  nextId++;
  node.id = nextId;
  ts.forEachChild(node, addId);
}
addId(sourceFile.compilerNode);

const cache: unknown[] = [];
const json = JSON.stringify(sourceFile.compilerNode, (key, value) => {
  // Discard the following.
  if (key === 'flags' || key === 'transformFlags' || key === 'modifierFlagsCache') {
    return;
  }

  // Replace 'kind' with the string representation.
  if (key === 'kind') {
    value = ts.SyntaxKind[value];
  }

  if (typeof value === 'object' && value !== null) {
    // Duplicate reference found, discard key
    if (cache.includes(value)) return;

    cache.push(value);
  }
  return value;
});

console.info(json);
