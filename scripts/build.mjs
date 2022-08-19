import esbuild from 'esbuild';
import path from 'path';
import zlib from 'zlib';
import { copyFileSync, createWriteStream, mkdirSync } from 'fs';
import { readFile, writeFile, rm } from 'fs/promises';
import { execSync } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';

const brotliCompress = promisify(zlib.brotliCompress);

build().catch((e) => {
  throw e;
});

async function build() {
  await rm('./dist', { recursive: true, force: true });

  for (const pkg of ['core', 'ext', 'html', 'jsx-runtime', 'util']) {
    for (const format of ['esm', 'cjs']) {
      const outfile = `./dist/novo-ui.${pkg}.${
        format === 'cjs' ? 'cjs' : 'mjs'
      }`;

      await esbuild.build({
        entryPoints: [`./src/main/${pkg}.ts`],
        bundle: true,
        outfile,
        tsconfig: './tsconfig.build.json',
        target: 'esnext',
        minify: true,
        sourcemap: true,
        format,
        external: ['novo-ui'],
        define: {
          'process.env.NODE_ENV': '"production"'
        }
      });

      await createBrotliFile(outfile, outfile + '.br');
    }
  }

  execSync(
    'tsc -p ./tsconfig.build.json --emitDeclarationOnly -d --declarationDir dist/types',
    {
      stdio: 'inherit'
    }
  );

  copyFileSync('./src/main/jsx.d.ts', './dist/types/jsx.d.ts');

  await zipDirectory('.', './dist/source/source.zip', [
    '*',
    '.*',
    '.storybook/**',
    'boxroom/**',
    'scripts/**',
    'src/**'
  ]);
}

// === helpers =======================================================

async function createBrotliFile(source, target) {
  const content = await readFile(source, 'utf-8');

  const compressedContent = await brotliCompress(content, {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT
    }
  });

  await writeFile(target, compressedContent);
}

function zipDirectory(sourceDir, zipFile, fileGlob) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = createWriteStream(zipFile);

  archive.glob(fileGlob, {
    cwd: sourceDir,
    ignore: [
      'package-lock.json',
      'yarn.lock',
      'node_modules',
      'dist',
      'build',
      '.git'
    ]
  });

  return new Promise((resolve, reject) => {
    mkdirSync(path.dirname(zipFile), { recursive: true });
    archive.on('error', (err) => reject(err)).pipe(stream);
    stream.on('close', () => resolve());
    archive.finalize();
  });
}
