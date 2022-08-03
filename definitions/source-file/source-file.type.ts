import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.type.ts';

export type SourceFileInput = CreateInput<
  ts.SourceFile,
  'statements'
>;
