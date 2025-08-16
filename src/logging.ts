import { inspect } from "util";

// Logging
const levelList = ["error", "warning", "log", "verbose", "dumb"] as const;
const colors: number[] & { length: typeof levelList.length } = [
  31, 33, 32, 34, 35,
];
// Default levels
let defaultLevel: (typeof levelList)[number] = "log";
export function setDefaultLogLevel(level: (typeof levelList)[number]) {
  if (levelList.indexOf(level) === -1) {
    process.nextTick(() =>
      log(
        "warning",
        `Logging level ${level} is unknown. Falling back to full logging (${
          levelList[levelList.length - 1]
        })`
      )
    );
    level = levelList[levelList.length - 1];
  }
  defaultLevel = level;
  levels = evaluateLevels();
}
export function getDefaultLogLevel() {
  return defaultLevel;
}
// Making the level list
const { loglevel, enableColors = true } = process.env;
function evaluateLevels() {
  return (() => {
    // @ts-ignore
    if (levelList.indexOf(loglevel) === -1) {
      if (typeof loglevel !== "undefined") {
        process.nextTick(() =>
          log("warning", `Logging level ${loglevel} is unknown`)
        );
      }
      return levelList.slice(0, levelList.indexOf(defaultLevel) + 1);
    }
    return true
      ? levelList.slice(
          0,
          levelList.indexOf(loglevel as (typeof levelList)[number]) + 1
        )
      : [];
  })();
}
let levels = evaluateLevels();

// Actualy log
/**
 * Log a value. WIll trow and log the value if it is an Error and the isFatal property is true
 * @param level The logging level
 * @param value The value to log. It will be printed in the form reported by util.inspect if inspectValue is not provided and set to false
 * @param [inspectValue=true] If true, use util.inspect to spow the value
 */
export function log(
  level: (typeof levelList)[number],
  value: any,
  inspectValue: boolean = true
): void {
  if (levels.includes(level)) {
    process.stdout.write(
      `[${
        enableColors ? `\x1b[${colors[levels.indexOf(level)]};1m` : ""
      }${level}${enableColors ? "\x1b[0m" : ""}] ${
        inspectValue ? inspect(value, { colors: true }) : value
      }\n`
    );
  }
  // @ts-ignore
  if (value instanceof Error && value.isFatal === true) {
    throw value;
  }
}
