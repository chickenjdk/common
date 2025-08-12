/**
 * Check if a value is a specific number type, not just plain number
 */
export type IsSpecificNumber<T> = number extends T
  ? false
  : T extends number
  ? true
  : false;
/**
 * Duplicate an array type, expanding all of its elements, except those that match the Ignore type.
 * Please use Expand instead of this type directly.
 */
export type ArrayClone<
  T extends any[],
  Ignore = never,
  N extends any[] = []
> = IsSpecificNumber<T["length"]> extends true
  ? T["length"] extends 0
    ? N
    : T extends [infer item, ...infer rest]
    ? ArrayClone<rest, Ignore, [...N, Expand<item, Ignore, false>]>
    : never
  : Expand<T[number], Ignore, false>[];
/**
 * Check if type A and B are both true.
 */
export type and<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;
/**
 * Get the opposite boolean as T
 */
export type not<T extends boolean> = T extends true ? false : true;
/**
 * Expand an object or array type, iterating recursivly over all of the elements down to string/number/symbol in order to turn a type containing others into the most basic form, except those that match the Ignore type.
 * Mainly used to help with making docs and IDEs display inteligable types, even for the most spaghetti of types and code.
 */
export type Expand<
  O,
  Ignore = never,
  DontIgnoreTop extends boolean = true
> = and<O extends Ignore ? true : false, not<DontIgnoreTop>> extends true
  ? O
  : O extends any[]
  ? ArrayClone<O, Ignore>
  : {
      [K in keyof O]: O[K] extends string | number | symbol
        ? O[K]
        : O[K] extends any[]
        ? ArrayClone<O[K], Ignore>
        : Expand<O[K], Ignore, false>;
    };
// Narrowest/widest type utility
/**
 * Check if U contains a narrower subtype of T, if so return true, if not return false.
 */
export type ContainsNarrower<T, U> =
  // Map over U, looking for types that T is a subtype of
  (
    U extends any
      ? // If the union member T is a subtype to U, drop U because that means U is wider
        T extends U
        ? never
        : // If U is a subtype of T, keep U because that means U is narrower, so return 0 therefore causing the result to be true because 0 does not extend never
        U extends T
        ? 0
        : never
      : never
  ) extends never
    ? false
    : true;
/**
 * Check if U contains a type that T is a subtype of, if so return true, if not return false.
 */
export type ContainsWider<T, U> =
  // Map over U, looking for types that T is a subtype of. If there are any that are wider than T, return true, otherwise return false
  (
    U extends any
      ? // If the union member T is a subtype to U, check further. If not, it means that T is wider than U, so return never
        T extends U
        ? // Check if U is a subtype of T. If so, then U is narrower, and we are not interested in it, so return never.
          U extends T
          ? never
          : 0
        : never
      : never
  ) extends never
    ? false
    : true;
/**
 * For unions containing ovverlapping types, this type will remove all types that are a wider version of any of the other types in the union, leaving only the narrowest types.
 */
export type Narrowest<T, U = T> =
  // Map over T
  T extends any
    ? ContainsNarrower<T, U> extends true
      ? never // If T is a subtype of U, drop T
      : T // If T is not a subtype of U, keep T
    : never;
export type Widest<T, U = T> =
  // Map over T
  T extends any
    ? ContainsWider<T, U> extends true
      ? never // If U is a subtype of T, drop T
      : T // If U is not a subtype of T, keep T
    : never;
// Number array utils
/**
 * Make an array of numbers from 0 to length - 1, with the length being the number passed as the first parameter.
 * @example countingArray<5> // [0, 1, 2, 3, 4]
 */
export type countingArray<
  length extends number,
  temp extends number[] = []
> = length extends temp["length"]
  ? temp
  : countingArray<length, [...temp, temp["length"]]>;
/**
 * Add the length of the array to the end of the array.
 * @example oneExtra<countingArray<5>> // [0, 1, 2, 3, 4, 5]
 */
export type oneExtra<T extends number[]> = [...T, T["length"]];
/**
 * Get the range of numbers from `from` to `to` (inclusive).
 * @example range<2, 5> // [2, 3, 4, 5]
 */
export type range<from extends number, to extends number> = Exclude<
  oneExtra<countingArray<to>>[number],
  // @ts-ignore
  countingArray<from>[number]
>;
