import { Definition } from '../definitions/definitions.ts';
import { ts, tsm } from '../deps.ts';
import {
  generateInstructions,
  processInstructions,
} from '../instructions/instructions.ts';
import { Maybe } from '../types.ts';

let contents: string;
const filePath = 'scripts/typescript.d.ts';
try {
  contents = await Deno.readTextFile(filePath);
} catch {
  const response = await fetch(
    'https://raw.githubusercontent.com/dsherret/ts-morph/latest/deno/common/typescript.d.ts',
  );
  contents = await response.text();
  await Deno.writeTextFile(filePath, contents);
}

const project = new tsm.Project();
const sourceFile = project.createSourceFile(`${crypto.randomUUID()}.ts`, contents);

const mds = sourceFile.getStatements().filter((s): s is tsm.ModuleDeclaration =>
  s.isKind(ts.SyntaxKind.ModuleDeclaration)
);
let nodeFactoryInterfaceDeclaration: Maybe<tsm.InterfaceDeclaration> = undefined;
for (const md of mds) {
  const i = md.getInterface('NodeFactory');
  if (i) {
    nodeFactoryInterfaceDeclaration = i;
    break;
  }
}

if (typeof nodeFactoryInterfaceDeclaration === 'undefined') {
  throw new TypeError('NodeFactory interface not found in ts namespace');
}

const factories: tsm.MethodSignature[] = [];
const members = nodeFactoryInterfaceDeclaration.getMembers() as tsm.MethodSignature[];
for (const member of members) {
  const memberName = member.getName();
  if (memberName.startsWith('create')) {
    factories.push(member);
  }
}

function toKebabCase(input: string): string {
  return input.replace(/(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])/g, '-$1').trim()
    .toLowerCase();
}

interface ProcessDefinition {
  file: string;
  input: Definition;
}

function getDefinitions(factory: tsm.MethodSignature): ProcessDefinition[] {
  const name = factory.getName().replace(/^create/, '');
  const definitionFolder = `definitions/${toKebabCase(name)}/`;
  return [
    {
      file: `${definitionFolder}/${toKebabCase(name)}.type.ts`,
      input: {
        kind: ts.SyntaxKind.SourceFile,
        statements: [{
          kind: ts.SyntaxKind.InterfaceDeclaration,
          name,
          members: [],
          modifiers: [{ kind: ts.SyntaxKind.ExportKeyword }],
        }],
      },
    },
  ];
}

console.log('=== Processing factories ===');
let count = 0;
for (const factory of factories.slice(1)) {
  const name = factory.getName();
  const definitionFolder = `definitions/${toKebabCase(name.replace(/^create/, ''))}`;
  try {
    for await (const _ of Deno.readDir(definitionFolder)) {
      // Nothing to do
    }
    console.log(` - ${factory.getName()}: ${definitionFolder} exists, skipping...`);
  } catch {
    console.log(
      ` - ${factory.getName()}: ${definitionFolder} does not exist, creating...`,
    );

    const definitions = getDefinitions(factory);
    const project = new tsm.Project();
    for (const definition of definitions) {
      const sourceFile = project.createSourceFile(definition.file);
      const instructions = generateInstructions(sourceFile, definition.input);
      processInstructions(sourceFile, instructions);
    }
    await project.save();
    break;
  }

  count++;
}

if (count === factories.length) {
  console.log('=== All factories supported, nothing to do ===.');
} else {
  console.log(
    '=== Not all factories supported, please run again to improve support ===',
  );
}

// TODO: don't be clever and just generate everything! I.e. get rid of CreateInput
