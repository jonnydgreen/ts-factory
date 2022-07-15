// Get current source file

// Option 1
// Traverse AST template
// At each point try and find the current node if there is a parent
// Pass the parent along at each point
// Decide how to add/replace/skip

// Option 2
// Merge the ASTs
// Traverse the AST
// If no ID, we decide what to do
// Create an array of operations starting from the bottom up
// Kinda like building up a terraform declaration

// Thoughts
// Option 2 allows us to create a new state, similar to terraform
// This will allow for a lot of debugging opportunities as well
// as potentially making it more realistic

// How does terraform do it?
// Use similar terminology

// Use TSMorph for now - but let's move away from it
import { ts, TSM } from '../deps.ts';
import { asserts, blocks } from '../test.deps.ts';

const SyntaxKind = ts.SyntaxKind;
const factory = ts.factory;

// Get node text
function getNodeText(node: ts.Node): string {
  try {
    if (node.parent) {
      const text = node.getFullText();
      if (typeof text === 'string') {
        return text;
      }
    }
  } catch (error) {
    // Do nothing
  }

  return TSM.printNode(node, { removeComments: false });
}

function getNode<TNode>(nodes: Map<number, ts.Node>, id: number): TNode {
  const node = nodes.get(id);
  if (!node) {
    throw new Error(`Node with ID ${id} not found.`);
  }
  return node as unknown as TNode;
}

function registerNode(
  nodes: Map<number, ts.Node>,
  definition: any,
  node: ts.Node,
) {
  // TODO: maybe add a duplicate check
  if (definition.leadingComment) {
    ts.addSyntheticLeadingComment(
      node,
      definition.leadingComment.kind,
      definition.leadingComment.text,
      definition.leadingComment.hasTrailingNewLine,
    );
  }
  nodes.set(definition.id, node);
}

function shouldGetTSMNode<TNode>(
  node: TSM.Node,
  compilerNode: ts.Node,
): TNode | undefined {
  if (node.getKind() === SyntaxKind.TryStatement) {
    console.log(
      node.getKindName(),
      (node.compilerNode as any)._id,
      (compilerNode as any)._id,
    );
  }
  if (node.compilerNode === compilerNode) {
    return node as unknown as TNode;
  }

  for (const child of node.getChildren()) {
    const foundNode = shouldGetTSMNode(child, compilerNode);
    if (foundNode) {
      return foundNode as unknown as TNode;
    }
  }
}

function getTSMNode<TNode>(node: TSM.Node, compilerNode: ts.Node): TNode {
  const foundNode = shouldGetTSMNode<TNode>(node, compilerNode);
  if (!foundNode) {
    throw new Error(
      `Unable to find compiler node in source file: ${SyntaxKind[compilerNode.kind]}`,
    );
  }
  return foundNode;
}

function process(
  sourceFile: TSM.SourceFile,
  nodes: Map<number, ts.Node>,
  definition: any,
) {
  switch (definition.kind) {
    case SyntaxKind.SourceFile: {
      const sourceFile: TSM.SourceFile = definition.sourceFile;
      const statements: string[] = [];
      for (const statementId of definition.statements) {
        const node = getNode<ts.Statement>(nodes, statementId);
        statements.push(getNodeText(node).replace(/^\r?\n/, ''));
      }
      sourceFile.removeText();
      sourceFile.addStatements(statements);
      break;
    }
    case SyntaxKind.ExpressionStatement: {
      const expression = getNode<ts.Expression>(nodes, definition.expression);
      registerNode(
        nodes,
        definition,
        factory.createExpressionStatement(expression),
      );
      break;
    }
    case SyntaxKind.StringLiteral: {
      registerNode(
        nodes,
        definition,
        factory.createStringLiteral(definition.text, definition.isSingleQuote),
      );
      break;
    }
    case SyntaxKind.Block: {
      const existingBlock = getTSMNode<TSM.Block>(
        sourceFile,
        getNode<ts.Block>(nodes, definition.id),
      );
      const statements: string[] = [];
      for (const statementId of definition.statements) {
        const node = getNode<ts.Statement>(nodes, statementId);
        statements.push(getNodeText(node).replace(/^\r?\n/, ''));
      }
      existingBlock.removeText();
      existingBlock.addStatements(statements);
      break;
    }
    case SyntaxKind.TryStatement: {
      const existingTryStatement = getTSMNode<TSM.TryStatement>(
        sourceFile,
        getNode<ts.Block>(nodes, definition.id),
      );
      const statements: string[] = [];
      for (const statementId of definition.statements) {
        const node = getNode<ts.Statement>(nodes, statementId);
        statements.push(getNodeText(node).replace(/^\r?\n/, ''));
      }
      console.log('================');
      console.log(existingTryStatement.getTryBlock());
      console.log(existingTryStatement.getCatchClause());
      console.log(existingTryStatement.getFinallyBlock());
      console.log('================');
      break;
    }
    default: {
      throw new TypeError(
        `Unsupported definition kind: '${SyntaxKind[definition.kind]}'`,
      );
    }
  }
}

function addId(node: ts.Node): void {
  (node as any)._id = crypto.randomUUID();
  node.forEachChild(addId);
}

blocks.describe('Like Terraform', () => {
  blocks.it.only(
    'should render a nested node with an existing file node',
    async (t) => {
      // Arrange
      function findNode(
        node: ts.Node,
        kind: ts.SyntaxKind,
      ): ts.Node | undefined {
        if (node.kind === kind) {
          return node;
        }

        for (const child of node.getChildren()) {
          const foundNode = findNode(child, kind);
          if (foundNode) {
            return foundNode;
          }
        }
      }

      const nodes = new Map<number, ts.Node>();
      const p = new TSM.Project();
      const sourceFile = p.addSourceFileAtPath('spikes/try.ts');
      addId(sourceFile.compilerNode);

      const consoleLogExprNode = findNode(
        sourceFile.compilerNode,
        ts.SyntaxKind.ExpressionStatement,
      )!;
      const blockNode = consoleLogExprNode.parent;
      const tryStatement = blockNode.parent as ts.TryStatement;
      const catchClauseNode = tryStatement.catchClause;
      const fBlock = tryStatement.parent;
      const fn = fBlock.parent;
      nodes.set(17, blockNode);
      nodes.set(18, consoleLogExprNode);
      nodes.set(19, catchClauseNode!);
      nodes.set(20, tryStatement);
      nodes.set(21, fBlock);
      nodes.set(22, fn);

      // Act
      const definitions = [
        {
          id: 1,
          kind: SyntaxKind.StringLiteral,
          text: 'Hello',
          isSingleQuote: true,
        },
        {
          id: 2,
          kind: SyntaxKind.ExpressionStatement,
          expression: 1,
        },
        {
          id: 17,
          kind: SyntaxKind.Block,
          statements: [18, 2],
        },
        {
          id: 20,
          kind: SyntaxKind.TryStatement,
          tryBlock: 17,
          catchClause: 19,
        },
        {
          id: 21,
          kind: SyntaxKind.Block,
          statements: [20],
        },
        {
          id: 22,
          kind: SyntaxKind.FunctionDeclaration,
          statements: [21],
        },
        {
          id: 100,
          kind: SyntaxKind.SourceFile,
          statements: [22],
          sourceFile,
        },
      ];
      for (const definition of definitions) {
        process(sourceFile, nodes, definition);
      }

      // Assert
      await asserts.assertSnapshot(t, sourceFile.getFullText());
    },
  );

  blocks.it('should render with a manual factory', async (t) => {
    // Arrange
    const nodes = new Map<number, ts.Node>();
    const project = new TSM.Project();
    const sourceFile = project.createSourceFile(crypto.randomUUID());

    const definitions = [
      {
        id: 1,
        kind: SyntaxKind.StringLiteral,
        text: 'Hello',
        isSingleQuote: true,
      },
      {
        id: 2,
        kind: SyntaxKind.ExpressionStatement,
        leadingComment: {
          kind: SyntaxKind.SingleLineCommentTrivia,
          text: ' Some useful comment',
          hasTrailingNewLine: true,
        },
        expression: 1,
      },
      {
        id: 3,
        kind: SyntaxKind.SourceFile,
        statements: [2],
        sourceFile,
      },
    ];
    for (const definition of definitions) {
      process(sourceFile, nodes, definition);
    }

    // Assert
    await asserts.assertSnapshot(t, sourceFile.getFullText());
  });

  blocks.it('should render with am existing file', async (t) => {
    // Arrange
    const nodes = new Map<number, ts.Node>();
    const p = new TSM.Project();
    const sourceFile = p.addSourceFileAtPath('spikes/basic.ts');
    const [statement1, statement2, statement3] = sourceFile.getStatementsWithComments();
    nodes.set(7, statement1.compilerNode);
    nodes.set(8, statement2.compilerNode);
    nodes.set(9, statement3.compilerNode);

    // Act
    const definitions = [
      {
        id: 1,
        kind: SyntaxKind.StringLiteral,
        text: 'Hello',
        isSingleQuote: true,
      },
      {
        id: 2,
        kind: SyntaxKind.ExpressionStatement,
        leadingComment: {
          kind: SyntaxKind.SingleLineCommentTrivia,
          text: ' Some useful comment',
          hasTrailingNewLine: true,
        },
        expression: 1,
      },
      {
        id: 3,
        kind: SyntaxKind.SourceFile,
        statements: [7, 8, 9, 2],
        sourceFile,
      },
    ];
    for (const definition of definitions) {
      process(sourceFile, nodes, definition);
    }

    // Assert
    await asserts.assertSnapshot(t, sourceFile.getFullText());
  });
});
