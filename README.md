# Turbopack compiles `.d.cts` declaration files reached through a dynamic `new Worker()` path

Minimal reproduction for a Turbopack bug in `next build` and `next dev`.

## The package

`fixtures/worker-pkg` is a tiny dual ESM/CJS package, laid out the way `tsup` and `tsdown` publish one:

- `dist/index.js` starts a worker whose file name is only known at runtime:
  `new Worker(join(dirname(fileURLToPath(import.meta.url)), name))`
- `dist/index.d.ts` and `dist/index.d.cts` are the type declarations.
  Both use `import`/`export` syntax, which is valid TypeScript for a `.d.cts` file.

It is installed from a tarball (`fixtures/worker-pkg-1.0.0.tgz`) so it lands in `node_modules` as a real copy, not a symlink.

## Steps

```bash
npm install
npm run build
```

Turbopack treats the dynamic worker path as "any file in `dist/`", pulls the declaration files into the module graph, and fails:

```
./node_modules/worker-pkg/dist/index.d.cts
Error: Unknown module type
```

With `serverExternalPackages: ['worker-pkg']` in `next.config.mjs`, it fails during externals tracing instead:

```
./node_modules/worker-pkg/dist/index.d.cts
Error: Specified module format (CommonJs) is not matching the module format of the source code (EcmaScript Modules)
```

`next dev` fails the same way when `/api/worker` is requested.

## Expected

Declaration files (`.d.ts`, `.d.cts`, `.d.mts`) are never executable, so they should not be added to the module graph, even when a dynamic path matches them.

`next build --webpack` succeeds, and `/api/worker` returns `{"message":"ready"}` at runtime.
Replacing the dynamic worker path with a literal `'worker.cjs'` also makes the Turbopack build succeed.
