
import * as esbuild from "https://deno.land/x/esbuild@v0.14.51/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";

export type buildCFG = {
    entry: string[],
    out: string,
    minify: boolean
}
 
// bundles an entrypoint into a single ESM output.
export const build = async(cfg: buildCFG) => {
    console.log('Now Building')
    await esbuild.build({
        plugins: [denoPlugin()],
        entryPoints: cfg.entry,
        outfile: cfg.out,
        bundle: true,
        minify: cfg.minify,
        banner: { js: '// deno-lint-ignore-file' },
        format: "esm"
    });
    esbuild.stop();
}