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

function registerNode(nodes: Map<number, ts.Node>, definition: any, node: ts.Node) {
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

function process(nodes: Map<number, ts.Node>, definition: any) {
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
      registerNode(nodes, definition, factory.createExpressionStatement(expression));
      break;
    }
    case SyntaxKind.StringLiteral: {
      registerNode(
        nodes,
        definition,
        factory.createStringLiteral(
          definition.text,
          definition.isSingleQuote,
        ),
      );
      break;
    }
    default: {
      throw new TypeError(
        `Unsupported definition kind: '${SyntaxKind[definition.kind]}'`,
      );
    }
  }
}

blocks.describe('Like Terraform', () => {
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
      process(nodes, definition);
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
      process(nodes, definition);
    }

    // Assert
    await asserts.assertSnapshot(t, sourceFile.getFullText());
  });
});
