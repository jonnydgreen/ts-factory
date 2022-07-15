import { TSM as tsm } from '../deps.ts';

export function convertToNodeFn(method: string, input: string): string {
  return `${method}${input[0].toUpperCase()}${input.slice(1)}`;
}

export function getNodeById(currentNode: tsm.Node, id: string): tsm.Node {
  if (id === '') {
    return currentNode;
  }
  const [location, ...remainingId] = id.split('.');
  const functionName = convertToNodeFn('get', location);
  const getNextNodeOrNodes = (currentNode[
    functionName as keyof typeof currentNode
  ] as () => unknown | unknown[]).bind(currentNode);
  if (typeof getNextNodeOrNodes === 'function') {
    const nextNodeOrNodes = getNextNodeOrNodes();
    if (Array.isArray(nextNodeOrNodes)) {
      const index = Number(remainingId?.[0]);
      if (!Number.isInteger(index)) {
        throw new TypeError(
          `Next node is an array of nodes but the following ID is not an array index '${remainingId
            ?.[0]}'`,
        );
      }
      const nextNode = nextNodeOrNodes[index];
      if (typeof nextNode === 'undefined') {
        throw new TypeError(`Node not found at index '${index}'`);
      }
      const [, ...nextIdParts] = remainingId;
      return getNodeById(nextNode, nextIdParts.join('.'));
    }

    if (typeof nextNodeOrNodes === 'undefined') {
      throw new TypeError(
        `Node not found at location '${location}' for ID '${id}'`,
      );
    }

    if (remainingId.length === 0) {
      return nextNodeOrNodes as tsm.Node;
    } else {
      return getNodeById(nextNodeOrNodes as tsm.Node, remainingId.join('.'));
    }
  }
  throw new TypeError(
    `Function of name '${functionName}' does not exist on Node of kind '${currentNode.getKindName()}' from ID: '${id}'`,
  );
}
