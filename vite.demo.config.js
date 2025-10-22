import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
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
