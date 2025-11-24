import path from 'path';

import dts from 'vite-plugin-dts';

import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/main.ts'),
            name: 'DebounceSearch',
            fileName: (format) => `debounce-search-abstraction.${format}.js`,
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['lodash'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    lodash: '_',
                },
            },
        },
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            outputDir: 'dist/lib',
        }),
    ],
});
