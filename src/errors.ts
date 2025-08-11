// Join tuple of strings with deleminator
export type Concantate<
  Tuple extends string[],
  Seperator extends string = "",
  Rest extends string = ""
> = Tuple["length"] extends 1
  ? `${Rest}${Tuple[0]}`
  : Tuple extends [infer start extends string, ...infer rest extends string[]]
  ? Concantate<rest, Seperator, `${Rest}${start}${Seperator}`>
  : never;
// Remove functions
export type NoFunc<T> = { [K in keyof T]: keyof T };
// Errors
type error = typeof Error;
const chains: WeakMap<any, [string[], number[]]> = new WeakMap();
export type pop<T extends any[]> = T extends [any, infer R] ? R : [];
// Colors!
const { enableColors = true } = process.env;
const colorList = [
  11, 13, 14, 26, 36, 56, 61, 71, 75, 76, 85, 126, 131, 135, 136, 155, 159, 165,
  190, 205, 215, 219, 229,
];
function stringToIndex(str: string, listLength: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  return hash % listLength;
}
// You can never over-type!
export function createClassifyedError<
  reason extends string,
  isFatal extends boolean = true,
  oldError extends {
    new (...args: Parameters<error>): InstanceType<oldError>;
  } = error
>(
  reason: reason,
  // @ts-ignore
  oldError: oldError = Error,
  // @ts-ignore
  isFatal: isFatal = true
): NoFunc<oldError> &
  ((...args: ConstructorParameters<oldError>) => Omit<
    InstanceType<oldError>,
    "isFatal"
  > & {
    reasonChain: string[];
    isFatal: isFatal;
  }) & {
    new (...args: ConstructorParameters<oldError>): Omit<
      InstanceType<oldError>,
      "isFatal"
    > & {
      reasonChain: string[];
      isFatal: isFatal;
    };
  } {
  const chain: string[] = [reason];
  if (chains.has(oldError)) {
    chain.unshift(...(chains.get(oldError) as [string[], number[]])[0]);
  }
  let color: number;
  const thisColorList = chains.has(oldError) ? (chains.get(oldError) as [string[], number[]])[1]:colorList;
  if (enableColors) {
    color = thisColorList[stringToIndex(reason, thisColorList.length)];
  }
  // @ts-ignore
  const prepend = `[${enableColors ? `\x1b[38;5;${color};1m` : ""}${reason}${
    enableColors ? "\x1b[0m" : ""
  }]`;
  // @ts-ignore
  class classifyedError extends oldError {
    constructor(message: string, ...params: pop<Parameters<error>>) {
      super(prepend + " " + message, ...params);
    }
  }
  const descriptors = Object.getOwnPropertyDescriptors(oldError);
  delete descriptors.prototype;
  Object.defineProperties(classifyedError, descriptors);
  // Must be non-enumerable so it will not show in error message.
  Object.defineProperty(classifyedError.prototype, "reasonChain", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: chain,
  });
  Object.defineProperty(classifyedError.prototype, "isFatal", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: isFatal,
  });
  chains.set(classifyedError, [
    chain,
    enableColors ? thisColorList.length > 1 ? thisColorList.filter((value) => value !== color) : colorList : [],
  ]);
  // @ts-ignore
  return classifyedError;
}
// Wrap error-generating functions to change the type of error that it throws and optionaly prepend its message
// assertFunc is in an array to prevent type widening
export function errorFuncWrap<assertFunc extends [(...args: any[]) => any]>(
  assertFunc: assertFunc[0],
  customError: { new (message: string): any } = Error,
  prependErrorWith: string = ""
): assertFunc[0] {
  return function wrapped(
    ...args: Parameters<assertFunc[0]>
  ): ReturnType<assertFunc[0]> {
    try {
      return assertFunc(...args);
    } catch (error) {
      throw new customError(
        prependErrorWith + (error as { message: string }).message
      );
    }
  };
}
export const chickenJVMError = createClassifyedError("ChickenJVM ERROR");
