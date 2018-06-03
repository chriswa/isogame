/*

Custom Node Module Resolver

Rationale:
  Support for ECMAScript Modules (ESM) is available with some caveats:
  - in some modern browsers with <script type="module">
  - in Node with `node --experimental-modules`, with file extensions of '.mjs'
  - in VSCode code intel, but only with file extensions of '.js' (or jsx, ts, tsx) (this is due to TypeScript, which provides VSCode's JS code intel)
  Node and VSCode have conflicting requirements.

  One simple solution is to force Node to interpret all '.js' files as ESM within a directory structure, while allowing (most/all) npm dependencies using default rules

  See https://nodejs.org/api/esm.html#esm_loader_hooks

*/

const baseURL = new URL('file://');
baseURL.pathname = `${process.cwd()}/`;

export async function resolve(specifier, parentModuleURL = baseURL, defaultResolver) {
  //console.log("*** mjs-loader.mjs: resolving - ", specifier, parentModuleURL)
  const parentFilename = parentModuleURL.toString().match(/[^\/]+$/)
  const importFilename = specifier.match(/[^\/]+$/)[0]
  console.log(`(mjs-loader) ${parentFilename} imports "${importFilename}"`)

  const isESM = (specifier[0] === '.' || specifier[0] === '/') // naive

  if (isESM) {
    return {
      url: new URL(specifier, parentModuleURL).href,
      format: 'esm',
    }
  }
  else {
    return defaultResolver(specifier, parentModuleURL)
  }
}
