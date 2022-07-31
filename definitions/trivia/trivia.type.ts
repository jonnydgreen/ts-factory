import { ts } from '../../deps.ts';

export interface SingleLineCommentTriviaInput {
  kind: ts.SyntaxKind.SingleLineCommentTrivia;
  text: string;
}

export interface MultiLineCommentTriviaInput {
  kind: ts.SyntaxKind.MultiLineCommentTrivia;
  text: string;
}

export type LeadingTriviaInput =
  | SingleLineCommentTriviaInput
  | MultiLineCommentTriviaInput;
