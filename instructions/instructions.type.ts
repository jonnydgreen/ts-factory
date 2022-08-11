import { Definition } from '../definitions/definitions.ts';

export type OpaqueString<TString extends string> = string & { __opaque: TString };

export type ItemOrArray<TItem> = TItem | TItem[];

export type Path = OpaqueString<'Path'>;

export enum InstructionType {
  SET = 'SET',
  ADD = 'ADD',
  INSERT = 'INSERT',
  REPLACE = 'REPLACE',
  UNSET = 'UNSET',
  REMOVE = 'REMOVE',
}

// TODO: review descriptions

/**
 * Add field to an array of fields on a parent node. E.g. statements
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the add operator associated with the defined node and field
 *  - Compile definition and apply to add operator
 *  - Move on to the next instruction
 */
export interface AddInstruction {
  type: InstructionType.ADD;
  field: string;
  path?: Path;
  definition: Definition;
}

/**
 * Set a field on a parent node. E.g. async keyword
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the set operator associated with the defined node and field
 *  - Compile definition and apply to set operator
 *  - Move on to the next instruction
 */
export interface SetInstruction {
  type: InstructionType.SET;
  path: Path;
  field: string;
  definition: Definition;
}

/**
 * Insert a field at a specific index within an array of fields on a parent node. E.g. statement at position 2
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the insert operator associated with the defined node and field
 *  - Ensure the array is of length at least the set position
 *  - Compile definition and apply to insert operator
 *  - Move on to the next instruction
 */
export interface InsertInstruction {
  type: InstructionType.INSERT;
  path: Path;
  field: string;
  index: number;
  definition: Definition;
}

/**
 * Replace a field at a specific index within an array of fields on a parent node. E.g. new statement at position 1
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the replace operator associated with the defined node and field
 *  - Ensure the array is of length at least the set position
 *  - Compile definition and apply to insert operator
 *  - Move on to the next instruction
 */
export interface ReplaceInstruction {
  type: InstructionType.REPLACE;
  path: Path;
  field: string;
  index: number;
  definition: Definition;
}

/**
 * Remove a field at a specific index within an array of fields on a parent node. E.g. remove statement at position 1
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the replace operator associated with the defined node and field
 *  - Ensure the array is of length at least the set position
 *  - Compile definition and apply to insert operator
 *  - Move on to the next instruction
 */
export interface RemoveInstruction {
  type: InstructionType.REMOVE;
  path: Path;
  field: string;
  index: number;
}

/**
 * Unset a field on node. E.g. type on a function declaration
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the replace operator associated with the defined node and field
 *  - Ensure the array is of length at least the set position
 *  - Compile definition and apply to insert operator
 *  - Move on to the next instruction
 */
export interface UnsetInstruction {
  type: InstructionType.UNSET;
  path: Path;
  field: string;
}

export type Instruction =
  | AddInstruction
  | SetInstruction
  | InsertInstruction
  | ReplaceInstruction
  | UnsetInstruction
  | RemoveInstruction;

export interface InstructionRule {
  instruction: InstructionType;
  condition: string;
  index?: number | string;
  field?: string;
}

export interface Instructions {
  id?: string;
  rules?: InstructionRule[];
}
