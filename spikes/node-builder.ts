import { ts } from '../deps.ts';

const SyntaxKind = ts.SyntaxKind;
const factory = ts.factory;

export function shouldBuildNode(ast: any): ts.Node | undefined {
  if (typeof ast === 'undefined') {
    return;
  }

  return buildNode(ast);
}

export function buildNode(ast: any): any {
  switch (ast.kind) {
    case SyntaxKind.SourceFile: {
      return factory.createSourceFile(
        ast.statements.map(buildNode),
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
      );
    }
    case SyntaxKind.ExpressionStatement: {
      return factory.createExpressionStatement(buildNode(ast.expression));
    }
    case SyntaxKind.CallExpression: {
      return factory.createCallExpression(
        buildNode(ast.expression),
        ast.typeArguments?.map(buildNode(ast.typeArguments)),
        ast.arguments?.map(buildNode),
      );
    }
    case SyntaxKind.PropertyAccessExpression: {
      return factory.createPropertyAccessExpression(
        buildNode(ast.expression),
        buildNode(ast.name),
      );
    }
    case SyntaxKind.Identifier: {
      return factory.createIdentifier(ast.escapedText);
    }
    case SyntaxKind.StringLiteral: {
      return factory.createStringLiteral(ast.text);
    }
    default: {
      throw new Error(`TS Node Kind not supported: '${ts.SyntaxKind[ast.kind]}'`);
    }
  }
}
