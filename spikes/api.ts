import { ts, TSM as tsm } from '../deps.ts';

const factory = ts.factory;

const fileName = 'spikes/example.ts';
const project = new tsm.Project();
const sourceFile = project.addSourceFileAtPath(fileName);

sourceFile.transform((traversal) => {
  const node = traversal.visitChildren(); // recommend always visiting the children first (post order)
  if (ts.isMethodDeclaration(node)) {
    const wrappedNode = tsm.createWrappedNode(node);
    const nodePos = wrappedNode.getPos();
    console.log({ nodePos });
    const pos = wrappedNode.getNameNode().getPos() + 1;
    const asyncText = tsm.printNode(
      factory.createModifier(ts.SyntaxKind.AsyncKeyword),
    ) + ' ';
    sourceFile.replaceText([pos, pos], asyncText);
    console.log(sourceFile.getChildAtPos(nodePos)!.compilerNode);
    return sourceFile.getChildAtPos(nodePos)!.compilerNode;
  }
  return node;
});

// const classNode = sourceFile.compilerNode.statements[3] as ts.ClassDeclaration;

// const getDataNode = classNode.members[2] as ts.MethodDeclaration;

// const a = factory.updateMethodDeclaration(
//   getDataNode,
//   undefined,
//   [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
//   undefined,
//   getDataNode.name,
//   undefined,
//   undefined,
//   getDataNode.parameters,
//   undefined,
//   undefined
// );

// console.log(tsm.printNode(a));

console.log(sourceFile.getFullText());
