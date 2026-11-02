import * as esbuild from 'esbuild';
import fs from 'fs';

async function buildElectron() {
  fs.mkdirSync('dist-electron', { recursive: true });

  console.log('Building Electron main bundle...');
  await esbuild.build({
    entryPoints: ['electron/main.ts'],
    outfile: 'dist-electron/main.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: ['electron', 'vite', 'lightningcss', 'fsevents', '@vitejs/*'],
    sourcemap: false,
  });

  console.log('Building Electron preload bundle...');
  await esbuild.build({
    entryPoints: ['electron/preload.ts'],
    outfile: 'dist-electron/preload.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: ['electron', 'vite', 'lightningcss', 'fsevents', '@vitejs/*'],
    sourcemap: false,
  });

  console.log('✓ Electron scripts bundled into dist-electron/ successfully.');
}

buildElectron().catch((err) => {
  console.error('Electron build failed:', err);
  process.exit(1);
});
