import {convertCamelCaseToSnakeCase, waitForEvent} from "../utils.js";
import { EventEmitter } from "events";

describe('Utils file', () => {
    test("Test a valid  camel case to snake case", () => {
        const value = "TestCamelCase";
        const result = convertCamelCaseToSnakeCase(value)

        expect(result).toMatch("test_camel_case");
    });


    test("Test an invalid value for camel case", () => {
        const value = undefined;
        const result = convertCamelCaseToSnakeCase(value)

        expect(result).toMatch("");
    });
})

describe("waitForEvent", () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should resolve when the event is emitted", async () => {
        const promise = waitForEvent<string>(emitter, "test-event");

        emitter.emit("test-event", "hello world");

        const result = await promise;
        expect(result).toBe("hello world");
    });

    it("should reject if an error event is emitted", async () => {
        const promise = waitForEvent(emitter, "test-event");

        emitter.emit("error", new Error("Something went wrong"));

        await expect(promise).rejects.toThrow("Something went wrong");
    });

    it("should reject if the timeout is reached", async () => {
        const timeoutMs = 1000;
        const promise = waitForEvent(emitter, "test-event", timeoutMs);

        // Fast-forward time
        jest.advanceTimersByTime(timeoutMs + 1);

        await expect(promise).rejects.toThrow("Timeout reached");
    });
});