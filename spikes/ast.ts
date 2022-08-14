import { ts, tsm } from '../deps.ts';
import { TSNode, TSNodeAST } from './ast.type.ts';
import { buildNode } from './node-builder.ts';

const factory = ts.factory;
const SyntaxKind = ts.SyntaxKind;

function printAST(node: ts.Node): unknown {
  const cache: unknown[] = [];
  const keysToDiscard = ['flags', 'transformFlags', 'modifierFlagsCache'];
  return JSON.parse(
    JSON.stringify(node, (key, value) => {
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
}

const node = factory.createNumericLiteral(4, ts.TokenFlags.HexSpecifier);

console.log(tsm.printNode(node));
console.log(printAST(node));
