import type { ts } from '../deps.ts';
import type { Instructions } from '../instructions/instructions.type.ts';
import type { ExpressionInput, MemberNameInput, StatementInput } from './definitions.ts';
import type { LeadingTriviaInput } from './trivia/trivia.type.ts';

export type MergeIntersections<I> = { [K in keyof I]: I[K] };

export type NonFnKeys<T> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

// deno-fmt-ignore
export type MapTSTypes<T> =
  T extends ts.SyntaxKind ? T :
  T extends ts.NodeArray<infer TNode> ? MapTSTypes<TNode>[] :
  T extends ts.__String ? string :
  T extends string ? string :
  T extends ts.Statement ? StatementInput :
  T extends string | ts.MemberName ? string | MemberNameInput :
  // T extends ts.TypeNode ? TypeNodeInput :
  T extends ts.Expression ? ExpressionInput :
  T extends ts.SyntaxKind ? ExpressionInput :
  unknown;

export type CreateInput<
  TNode extends ts.Node,
  TNodeKeys extends NonFnKeys<TNode>,
  TPartialNodeKeys extends NonFnKeys<TNode> = TNodeKeys,
> = MergeIntersections<
  & {
    kind: TNode['kind'];
    leadingTrivia?: LeadingTriviaInput;
    __instructions?: Instructions;
  }
  & {
    -readonly [K in TNodeKeys]: MapTSTypes<Exclude<TNode[K], undefined>>;
  }
  & {
    -readonly [K in Exclude<TPartialNodeKeys, TNodeKeys>]?: MapTSTypes<
      Exclude<TNode[K], undefined>
    >;
  }
>;
