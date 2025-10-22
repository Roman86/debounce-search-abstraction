export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: [
        'ts',
        'js',
        'json',
    ],
    collectCoverageFrom: ['lib/**/*.ts'],
    testTimeout: 20000,
};
