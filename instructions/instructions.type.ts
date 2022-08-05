import { Definition } from '../definitions/definitions.ts';

export type OpaqueString<TString extends string> = string & { __opaque: TString };

export type NodeID = OpaqueString<'NodeID'>;

export enum InstructionType {
  SET = 'SET',
  ADD = 'ADD',
  INSERT = 'INSERT',
  REPLACE = 'REPLACE',
  // TODO: support
  // UNSET = 'UNSET',
  // REMOVE = 'REMOVE',
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
  nodeID?: NodeID;
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
  nodeID: NodeID;
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
  nodeID: NodeID;
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
  nodeID: NodeID;
  field: string;
  index: number;
  definition: Definition;
}

export type Instruction =
  | AddInstruction
  | SetInstruction
  | InsertInstruction;
// | ReplaceInstruction
// | RemoveInstruction;

export interface InstructionRule {
  instruction: InstructionType;
  condition: string;
  index?: number | string;
}

export interface Instructions {
  id?: string;
  rules?: InstructionRule[];
}
