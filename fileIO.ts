
import { join } from "https://deno.land/std@0.157.0/path/mod.ts";
import { walkSync, WalkEntry } from "https://deno.land/std@0.157.0/fs/mod.ts?s=walkSync"

export type contentCFG = {
    folder: string;
    fileName: string;
    content: string;
}

/** save file content */
export const getDirectory = (path: string) => {
    const paths: WalkEntry[] = []
    const entires = walkSync(path, {
        includeFiles: true,
        includeDirs: true,
        followSymlinks: false,
    });
    for (const entry of entires) {
        paths.push(entry)
    }
    return paths
}


/** save file content */
export const saveFile = (cfg: contentCFG) => {
    const { folder, fileName, content } = cfg
    console.log(`saving - folder ${folder} fileName ${fileName} content = ${content}`)
    return Deno.writeTextFile(join(folder, fileName), content);
}

/** get file content */
export const getFile = async (cfg: contentCFG): Promise<string> => {
    const { folder, fileName } = cfg
    return await Deno.readTextFile(join(folder, fileName));
}