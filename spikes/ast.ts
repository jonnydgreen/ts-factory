import { ts, TSM } from '../deps.ts';
import { TSNode, TSNodeAST } from './ast.type.ts';
import { buildNode } from './node-builder.ts';

const factory = ts.factory;
const SyntaxKind = ts.SyntaxKind;

// const p = new TSM.Project();
// const s = p.addSourceFileAtPath('example.ts');
// console.log(s.compilerNode);

const fileName = 'spikes/example.ts';
const source = await Deno.readTextFile(fileName);
const sourceFile = ts.createSourceFile(
  fileName,
  source,
  ts.ScriptTarget.Latest,
  true,
);

// Add an ID to every node in the tree to make it easier to identify in
// the consuming application.
let nextId = 0;
function addId(node: TSNode) {
  node.id = ++nextId;
  ts.forEachChild(node, addId);
}
addId(sourceFile);

// No need to save the source again.
sourceFile.text = '';

const cache: unknown[] = [];
const keysToDiscard = ['flags', 'transformFlags', 'modifierFlagsCache'];
const ast: TSNodeAST<ts.SourceFile> = JSON.parse(
  JSON.stringify(sourceFile, (key, value) => {
    // Discard the following.
    if (keysToDiscard.includes(key)) {
      return;
    }

    if (typeof value === 'object' && value !== null) {
      // Duplicate reference found, discard key
      if (cache.includes(value)) {
        return;
      }

      cache.push(value);
    }
    return value;
  }),
);

function createAST<TNode extends ts.Node = ts.Node>(
  node: TSNodeAST<TNode>,
): TSNodeAST<TNode> {
  return node;
}

// const newAST: TSNodeAST<ts.SourceFile> = {
//   kind: SyntaxKind.SourceFile,
//   statements: [
//     {
//       kind: SyntaxKind.ExpressionStatement,
//       expression: {
//         kind: SyntaxKind.CallExpression,
//         expression: {
//           kind: SyntaxKind.PropertyAccessExpression,
//           expression: {
//             kind: SyntaxKind.Identifier,
//             escapedText: 'console',
//           } as TSNodeAST<ts.Identifier>,
//           name: {
//             kind: SyntaxKind.Identifier,
//             escapedText: 'log',
//           } as TSNodeAST<ts.Identifier>,
//         } as TSNodeAST<ts.PropertyAccessExpression>,
//         typeArguments: undefined,
//         arguments: [
//           {
//             kind: SyntaxKind.StringLiteral,
//             text: 'Hello, there.',
//           } as TSNodeAST<ts.StringLiteral>,
//         ] as unknown as ts.NodeArray<ts.Expression>,
//       } as TSNodeAST<ts.CallExpression>,
//     } as TSNodeAST<ts.ExpressionStatement>,
//   ] as unknown as ts.NodeArray<ts.Statement>,
// };

const newAST = {
  kind: SyntaxKind.SourceFile,
  statements: [
    {
      kind: SyntaxKind.ExpressionStatement,
      expression: {
        kind: SyntaxKind.CallExpression,
        expression: {
          kind: SyntaxKind.PropertyAccessExpression,
          expression: {
            kind: SyntaxKind.Identifier,
            escapedText: 'console',
          },
          name: {
            kind: SyntaxKind.Identifier,
            escapedText: 'log',
          },
        },
        arguments: [
          {
            kind: SyntaxKind.StringLiteral,
            text: 'Hello, there.',
          },
        ],
      },
    },
  ],
};

const consoleLogNode = factory.createSourceFile(
  [factory.createExpressionStatement(factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier('console'),
      factory.createIdentifier('log'),
    ),
    undefined,
    [factory.createStringLiteral('Hello, there.')],
  ))],
  factory.createToken(ts.SyntaxKind.EndOfFileToken),
  ts.NodeFlags.None,
);

// If no node, construct and insert
const builtNode = buildNode(newAST);

const expected = TSM.printNode(consoleLogNode);
const actual = TSM.printNode(builtNode);

console.log({
  expected,
  actual,
  equal: expected === actual,
});
