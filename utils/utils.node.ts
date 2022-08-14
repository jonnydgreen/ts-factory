import { ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';

export function shouldPrintNode(node?: ts.Node): Maybe<string> {
  if (node) {
    return printNode(node);
  }
}

export function printNode(node: ts.Node): string {
  return tsm.printNode(node, { removeComments: false });
}
