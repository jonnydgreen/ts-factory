import { ts } from '../../deps.ts';
import { BaseDefinition, StatementInput } from '../definitions.ts';

export interface SourceFileInput extends BaseDefinition<ts.SourceFile> {
  statements: StatementInput[];
}
