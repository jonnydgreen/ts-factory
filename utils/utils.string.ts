export class StringUtils {
  /**
   * Upper cases the first letter of an input string.
   */
  static upperFirst(input: string): string {
    return `${input[0]?.toUpperCase() ?? ''}${input.slice(1)}`;
  }
}
