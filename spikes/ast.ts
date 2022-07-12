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
const project = new TSM.Project();
const sourceFile = project.addSourceFileAtPath(fileName);
// const sourceFile = ts.createSourceFile(
//   fileName,
//   source,
//   ts.ScriptTarget.Latest,
//   true,
// );

// Add an ID to every node in the tree to make it easier to identify in
// the consuming application.
let nextId = 0;
const nodes = new Map<number, TSNode>();
function addId(node: TSNode) {
  // TODO: use symbol
  node.id = ++nextId;
  nodes.set(nextId, node);
  ts.forEachChild(node, addId);
}
addId(sourceFile.compilerNode);

const cache: unknown[] = [];
const keysToDiscard = ['flags', 'transformFlags', 'modifierFlagsCache'];
const existingAST: TSNodeAST<ts.SourceFile> = JSON.parse(
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
        // TODO: Need to think about how this works for subsequent runs on existing files.
        // Do we add again?
        // How can we detect existing call expressions?
        // Can we detect them?
        // Should we detect them?
        // Do we need a skipIf operation at the statement level?
        __operations: {
          skip: {
            keys: ['expression.expression.escapedText'],
          },
        },
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

const newNodeText = 'console.log("Hello, there.");';

// const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
//   const visit: ts.Visitor = (node: TSNode) => {
//     node = ts.visitEachChild(node, visit, context);

//     if (
//       Number.isInteger(node.id) && ts.isBlock(node) && ts.isTryStatement(node.parent)
//     ) {
//       console.log('IN TRY BLOCK');
//       const consoleLogNode = factory.createExpressionStatement(
//         factory.createCallExpression(
//           factory.createPropertyAccessExpression(
//             factory.createIdentifier('console'),
//             factory.createIdentifier('log'),
//           ),
//           undefined,
//           [factory.createStringLiteral('Hello, there.')],
//         ),
//       );
//       console.log('------------');
//       const wrappedNode = TSM.createWrappedNode(node, {
//         sourceFile: sourceFile.compilerNode,
//         typeChecker: project.getTypeChecker().compilerObject,
//       });
//       console.log('------------');
//       wrappedNode.addStatements(TSM.printNode(consoleLogNode));
//       console.log('------------');
//       // const newStatement = TSM.printNode(consoleLogNode);
//       // // The function checkChangeRange in typescript.js code-documents the specs for TextChangeRange and newText
//       // const oldText = node.getFullText()
//       // const textChangeRange: ts.TextChangeRange = {
//       //   newLength: newStatement.length,
//       //   span: { start: oldText.length - 1, length: 0 },
//       // };
//       // const newText = oldText + newStatement
//       // return factory.createTryStatement(node.tryBlock.)
//       // ts.updateSourceFile(sourceFile);
//       return wrappedNode.compilerNode;
//     }

//     // if (node.id === 1 && ts.isSourceFile(node)) {
//     //   console.log('IN SOURCE FILE');
//     //   const consoleLogNode = factory.createExpressionStatement(
//     //     factory.createCallExpression(
//     //       factory.createPropertyAccessExpression(
//     //         factory.createIdentifier('console'),
//     //         factory.createIdentifier('log'),
//     //       ),
//     //       undefined,
//     //       [factory.createStringLiteral('Hello, there.')],
//     //     ),
//     //   );
//     //   const newStatement = TSM.printNode(consoleLogNode);
//     //   // The function checkChangeRange in typescript.js code-documents the specs for TextChangeRange and newText
//     //   const oldText = node.getFullText()
//     //   const textChangeRange: ts.TextChangeRange = {
//     //     newLength: newStatement.length,
//     //     span: { start: oldText.length - 1, length: 0 },
//     //   };
//     //   const newText = oldText + newStatement
//     //   return node.update(newText, textChangeRange)
//     // }

//     return node;
//   };

//   return (node) => ts.visitNode(node, visit);
// };

// const [result] = ts.transform(sourceFile.compilerNode, [transformer]).transformed;

function traverseAST(node: TSM.Node): void {
  console.log(node.getKindName());
  if (
    node.isKind(SyntaxKind.Block) && node.getParent().isKind(SyntaxKind.TryStatement)
  ) {
    const consoleLogNode = factory.createExpressionStatement(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('console'),
          factory.createIdentifier('log'),
        ),
        undefined,
        [factory.createStringLiteral('Hello, there.')],
      ),
    );
    const newStatement = TSM.printNode(consoleLogNode);
    node.addStatements([newStatement]);
  }

  if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
    console.log('OBJECT LITERAL');
    node.addPropertyAssignment({ name: 'hello', initializer: '"there"' });
  }

  node.forEachChild(traverseAST);
}

traverseAST(sourceFile);

console.log('==================');
console.log(sourceFile.getFullText());
console.log('==================');

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
const builtNode = buildNode(nodes, newAST);

const expected = TSM.printNode(consoleLogNode);
const actual = TSM.printNode(builtNode);

console.log({
  expected,
  actual,
  equal: expected === actual,
});
