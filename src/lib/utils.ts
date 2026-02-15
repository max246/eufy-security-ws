import { EventEmitter } from "events";
import { inspect } from "util";

/**
 *  Convert Camel case to snake case
 *
 * @param value
 */
export const convertCamelCaseToSnakeCase = function (value: string | undefined): string {
  if (value === undefined) return "";
  return value.replace(/[A-Z]/g, (letter, index) => {
    return index == 0 ? letter.toLowerCase() : "_" + letter.toLowerCase();
  });
};

export const waitForEvent = function <T>(emitter: EventEmitter, event: string, timeout?: number): Promise<T> {
  return new Promise((resolve, reject) => {
    let internalTimeout: NodeJS.Timeout | undefined = undefined;
    let fail: { (...args: any[]): void; (err: Error): void; (...args: any[]): void; (...args: any[]): void };

    const success = (val: T): void => {
      emitter.off("error", fail);
      resolve(val);
    };

    fail = (err: Error): void => {
      emitter.off(event, success);
      reject(err);
    };

    emitter.once(event, success);
    emitter.once("error", fail);

    if (timeout) {
      internalTimeout = setTimeout(() => {
        emitter.off(event, success);
        emitter.off("error", fail);
        reject(new Error("Timeout reached"));
      }, timeout);
    }
  });
};

export const initializeInspectStyles = function (): void {
  inspect.styles.special = "cyan";
  inspect.styles.number = "green";
  inspect.styles.bigint = "green";
  inspect.styles.boolean = "yellow";
  inspect.styles.undefined = "grey";
  inspect.styles.null = "bold";
  inspect.styles.string = "red";
  inspect.styles.symbol = "green";
  inspect.styles.date = "magenta";
  inspect.styles.regexp = "red";
  inspect.styles.module = "underline";
};
