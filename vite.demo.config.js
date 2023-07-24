const { defineConfig } = require('vite');
import { createHtmlPlugin } from 'vite-plugin-html';

module.exports = defineConfig({
    plugins: [
        createHtmlPlugin({
            template: 'demo/index.html',
            inject: {
                data: {
                    title: 'debounce-search-abstraction demo',
                },
            },
            minify: true,
            entry: 'demo/demo.ts',
        }),
    ],
});
