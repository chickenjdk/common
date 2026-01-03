// Join tuple of strings with delimiter
export type Concantate<
  Tuple extends string[],
  Separator extends string = "",
  Rest extends string = ""
> = Tuple["length"] extends 1
  ? `${Rest}${Tuple[0]}`
  : Tuple extends [infer start extends string, ...infer rest extends string[]]
  ? Concantate<rest, Separator, `${Rest}${start}${Separator}`>
  : never;
// Remove functions.
export type NoFunc<T> = { [K in keyof T]: keyof T };
// Errors.
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
/**
 * Create a classified error class that extends the oldError to add fancy classification prepended text and adds the reasonChain and isFatal properties.
 * @param reason The error reason
 * @param oldError The old error class to extend. Defaults to Error.
 * @param isFatal If the error is fatal. Defaults to true.
 * @returns The new error class that extends the oldError with the reasonChain and isFatal properties.
 */
export function createClassifiedError<
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
): NoFunc<oldError> & {
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
  const thisColorList = chains.has(oldError)
    ? (chains.get(oldError) as [string[], number[]])[1]
    : colorList;
  if (enableColors) {
    color = thisColorList[stringToIndex(reason, thisColorList.length)];
  }
  // @ts-ignore
  const prepend = `[${enableColors ? `\x1b[38;5;${color};1m` : ""}${reason}${
    enableColors ? "\x1b[0m" : ""
  }]`;
  // @ts-ignore
  class classifiedError extends oldError {
    constructor(message: string, ...params: pop<Parameters<error>>) {
      super(prepend + " " + message, ...params);
    }
  }
  const descriptors = Object.getOwnPropertyDescriptors(oldError);
  delete descriptors.prototype;
  Object.defineProperties(classifiedError, descriptors);
  // Must be non-enumerable so it will not show in the error message.
  Object.defineProperty(classifiedError.prototype, "reasonChain", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: chain,
  });
  Object.defineProperty(classifiedError.prototype, "isFatal", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: isFatal,
  });
  chains.set(classifiedError, [
    chain,
    enableColors
      ? thisColorList.length > 1
        ? thisColorList.filter((value) => value !== color)
        : colorList
      : [],
  ]);
  // @ts-ignore
  return classifiedError;
}
/**
 * @deprecated Use createClassifiedError instead. Removal scheduled for v3, as it is misspelled. 
 */
export const createClassifyedError = createClassifiedError;

// assertFunc is in an array to prevent type widening.
/**
 * Wrap error-generating functions to change the type of error that it throws and optionally prepend its message
 * @param assertFunc The assertion function to wrap. It should throw an error if the assertion fails.
 * @param customError The custom error class to throw instead of the original error. Defaults to Error.
 * @param prependErrorWith Text to prepend to the error message. Defaults to an empty string.
 * @returns A wrapped version of the assertFunc that throws the customError with the prepended message.
 */
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
export const chickenJVMError = createClassifiedError("ChickenJVM ERROR");
