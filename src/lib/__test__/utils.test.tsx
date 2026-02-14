

describe('Utils file', () => {
    test("Test a valid version to normalise", () => {
        const version = "1.0.0.0 al t0 30 3";
        const result = normalizeVersionString(version)

        expect(result).toStrictEqual([1, 0, 0, 0]);
    });

})