import { ts } from '../deps.ts';
import { TSNode, TSNodeAST } from './ast.type.ts';

const SyntaxKind = ts.SyntaxKind;
const factory = ts.factory;

export function shouldBuildNode(
  nodes: Map<number, TSNode>,
  ast: any,
): ts.Node | undefined {
  if (typeof ast === 'undefined') {
    return;
  }

  return buildNode(nodes, ast);
}

export function buildNode(
  nodes: Map<number, TSNode>,
  ast: any,
  parentNode?: ts.Node,
): any {
  switch (ast.kind) {
    case SyntaxKind.SourceFile: {
      return factory.createSourceFile(
        ast.statements.map((statement: TSNodeAST) => buildNode(nodes, statement)),
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
      );
    }
    case SyntaxKind.ExpressionStatement: {
      return factory.createExpressionStatement(buildNode(nodes, ast.expression));
    }
    case SyntaxKind.CallExpression: {
      return factory.createCallExpression(
        buildNode(nodes, ast.expression),
        ast.typeArguments?.map((argument: TSNodeAST) => buildNode(nodes, argument)),
        ast.arguments?.map((argument: TSNodeAST) => buildNode(nodes, argument)),
      );
    }
    case SyntaxKind.PropertyAccessExpression: {
      return factory.createPropertyAccessExpression(
        buildNode(nodes, ast.expression),
        buildNode(nodes, ast.name),
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
