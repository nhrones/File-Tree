
import { debounce } from "https://deno.land/std@0.154.0/async/debounce.ts"; 
import { serve } from "https://deno.land/std@0.154.0/http/server.ts";
import { DEBUG, MINIFY, host, port } from './constants.ts'
import { getContentType } from './utils.ts'
import { Listener } from './listen.ts'
import { POST } from './post.ts'
import { buildCFG, build } from './build.ts'


// handle all http requests
async function handleRequest(request: Request): Promise<Response> {

    let { pathname } = new URL(request.url);

    if (pathname.includes('/listen')) {
        return Listener(request)
    }
    else if (request.method === 'POST') {
        return POST(request)
    }
    else { // File Request  
        if (pathname.endsWith("/")) { pathname += "index.html" }
        try {
            const body = await Deno.readFile("./dist" + pathname)
            const headers = new Headers()
            headers.set("content-type", getContentType(pathname))
            return new Response(body, { status: 200, headers });
        } catch (e) {
            console.error(e.message)
            return await Promise.resolve(new Response(
                "Internal server error: " + e.message, { status: 500 }
            ))
        }
    }
}

serve(handleRequest, { hostname: host, port: port });

/////////////////////////////////////
// open index.html in the browser
/////////////////////////////////////
const startBrowser = Deno.run({
    cmd: [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "http://localhost:8000",
    ]
});

const buildAndRefresh = debounce(
    (event: Deno.FsEvent) => {
        if (DEBUG) console.log("[%s]    %s", event.kind, event.paths[0])
        const srcChanged = event.paths[0].includes("src")
        const distChanged = event.paths[0].includes("dist")
        if (srcChanged) {
            const cfg: buildCFG = {
                entry: ["./src/main.ts"],
                minify: MINIFY,
                out: "./dist/bundle.js"
            }
            build(cfg).then(() => {
                const tempBC = new BroadcastChannel("sse-rpc");
                tempBC.postMessage({ id: -2, procedure: "reload", params: [] }),
                tempBC.close();
            })
        } else if (distChanged) {
            const tempBC = new BroadcastChannel("sse-rpc");
            tempBC.postMessage({ id: -1, procedure: "refreshcss", params: [] }),
            tempBC.close();
        }

    }, 400,
);

/** watch for <src/> file change */
const watcher = Deno.watchFs(["src\\", "dist\\"]);
for await (const event of watcher) {
    buildAndRefresh(event)
}
     
// wait for the process to complete
await startBrowser.status();
