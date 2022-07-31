import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.utils.ts';

export type SourceFileInput = CreateInput<
  ts.SourceFile,
  'statements'
>;
