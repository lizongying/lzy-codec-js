import {defineConfig} from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.js',
            name: 'LzyCodec',
            formats: ['es', 'umd'],
        },
        outDir: 'dist',
    },
})