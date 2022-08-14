import { ts } from '../../deps.ts';
import { CreateInput, MergeIntersections } from '../definitions.type.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createInterfaceDeclaration}
 */
/**
 * Creates a TypeScript Interface Declaration.
 *
 * @example
 * export interface Hello {
 *   foo: string;
 * }
 */
export type InterfaceDeclarationInput = MergeIntersections<
  CreateInput<
    ts.InterfaceDeclaration,
    'name' | 'members',
    'decorators' | 'modifiers' | 'typeParameters' | 'heritageClauses'
  >
>;
