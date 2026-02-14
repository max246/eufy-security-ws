/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    // This tells Jest to treat these files as ES Modules
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        // This resolves the ".js" extension in your TS files to the actual source
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                // FORCE THE COMPILER SETTINGS HERE
                tsconfig: {
                    module: 'NodeNext',
                    moduleResolution: 'NodeNext',
                    target: 'ES2022',
                    allowSyntheticDefaultImports: true,
                    resolveJsonModule: true,
                },

            },
        ],
    },

};