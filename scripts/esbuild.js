const esbuild = require('esbuild');
const chokidar = require('chokidar');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

function build() {
    console.time('build');
    esbuild
        .build({
            entryPoints: ['./src/index.ts'],
            outfile: 'dist/index.js',
            bundle: true,
            minify: true,
            platform: 'node',
            sourcemap: true,
            target: 'node14',
            plugins: [nodeExternalsPlugin()]
        })
        .catch(() => process.exit(1))
        .finally(() => {
            console.timeEnd('build');
        });
}

build();
if (process.argv.includes('--watch')) {
    const fsWatch = chokidar.watch(['./src']);
    fsWatch.on('change', (file) => {
        console.log('Detected change to', file);
        build();
    });
}
