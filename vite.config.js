import {resolve} from 'path'
import {defineConfig} from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, './src/main.js'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'main'
                        ? 'assets/main.js'
                        : 'assets/[name]-[hash].js'
                },
            },
        },
        outDir: 'dist',
    },
})