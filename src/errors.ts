import { inspect } from "util";

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
const chains: WeakMap<any, string[]> = new WeakMap();
export type pop<T extends any[]> = T extends [any, infer R] ? R : [];
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
  ((...args: ConstructorParameters<oldError>) => Omit<InstanceType<oldError>,"isFatal"> & {
    reasonChain: string[];
    isFatal: isFatal;
  }) & {
    new (...args: ConstructorParameters<oldError>): Omit<InstanceType<oldError>,"isFatal"> & {
      reasonChain: string[];
      isFatal: isFatal;
    };
  } {
  let chain = [reason as string];
  if (chains.has(oldError)) {
    chain.unshift(...(chains.get(oldError) as string[]));
  }
  const prepend = chain.map((reason) => `[${reason}]`).join(" ");
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
const levelList = [
  "error",
  "warning",
  "reasonable",
  "verbose",
  "dumb",
] as const;
const colors: number[] & { length: typeof levelList.length } = [
  31, 33, 32, 34, 37,
];
const { loglevel } = process.env;
const levels =
  typeof loglevel === "string" && loglevel in Object.values(levelList)
    ? levelList.slice(
        0,
        levelList.indexOf(loglevel as (typeof levelList)[number]) + 1
      )
    : [];
export function log(
  level: (typeof levelList)[number],
  value: string | Error
): void {
  if (levels.includes(level)) {
    process.stdout.write(
      `[\x1b[${colors[levels.indexOf(level)]};1m${level}\x1b[0m] ${inspect(
        value,
        { colors: true }
      )}`
    );
  }
  // @ts-ignore
  if (value.isFatal === true) {
    throw value;
  }
}
