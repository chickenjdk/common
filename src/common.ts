export class prioritizedHook {
  #listeners: ((...args: any[]) => void)[][] = [];
  addListener(priority: number, eventListener: (...args: any[]) => void): void {
    this.#listeners[priority] ??= [];
    this.#listeners[priority].push(eventListener);
  }
  call(...args: any[]): void {
    for (const listenersGroup of this.#listeners) {
      for (const listener of listenersGroup) {
        listener(...args);
      }
    }
  }
}
export type countingArray<
  length extends number,
  temp extends number[] = []
> = length extends temp["length"]
  ? temp
  : countingArray<length, [...temp, temp["length"]]>;
export type oneExtra<T extends number[]> = [...T, T["length"]];
export type range<from extends number, to extends number> = Exclude<
  oneExtra<countingArray<to>>[number],
  // @ts-ignore
  countingArray<from>[number]
>;
export function assertInRange<
  const expectedRange extends [number, number],
  rangeUnion extends number = range<expectedRange[0], expectedRange[1]>
>(
  real: number,
  range: expectedRange,
  error: Error
): asserts real is rangeUnion {
  if (!(real >= range[0] && real <= range[1])) {
    throw error;
  }
}
export function inRange<
  const expectedRange extends [number, number],
  rangeUnion extends number = range<expectedRange[0], expectedRange[1]>
>(real: number, range: expectedRange): real is rangeUnion {
  return real >= range[0] && real <= range[1];
}
export function assertNotUndefined(value: any, error: Error) {
  if (typeof value === "undefined") {
    throw error;
  }
}

export function bitMaskBool(value: number, mask: number): boolean {
  return (value & mask) !== 0;
}
export function toArray<T>(
  value: {
    [key in number]: T;
  },
  subtract: number = 0
): T[] {
  const output: T[] = [];
  for (const key in value) {
    output[Number(key) - subtract] = value[key];
  }
  return output;
}
export function fromArray<T>(
  value: T[],
  add: number = 0
): {
  [key in number]: T;
} {
  const output: {
    [key in number]: T;
  } = {};
  value.forEach((elm, index) => {
    output[index + add] = elm;
  });
  return output;
}
export type makeMutable<T> = {
  -readonly [K in keyof T]: T[K];
};
export type mapUnion<T, V> = T extends any ? T & V : never;
