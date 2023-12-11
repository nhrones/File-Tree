
import { DEBUG } from './constants.ts'
import { getDirectory, getFile, saveFile } from './fileIO.ts'

/** 
 * A request to subscribe to a Server Sent Event stream 
 * @param _req (Request) - the request object from the http request
 */
export function Listener(_req: Request): Response {
    const sseChannel = new BroadcastChannel("sse-rpc");
    if (DEBUG) console.log('Started SSE Stream!')

    const stream = new ReadableStream({
        start: (controller) => {

            // listening for bc messages
            sseChannel.onmessage = (e) => {
                const data = e.data
                const { id, procedure, params } = data

                // calling remote procedures
                switch (procedure) {
                    case 'GET_FOLDER': {                       
                        const {folder} = params
                        const entries = getDirectory(folder)
                        const reply = JSON.stringify({
                            msgID: id,
                            error: null,
                            result: JSON.stringify(entries)
                        })
                        controller.enqueue('data: ' + reply + '\n\n');
                        break;
                    }
                    // get file contents
                    case 'GET_FILE': {
                        getFile(params) // todo catch and report errors
                            .then((content: string) => {
                                const reply = JSON.stringify({
                                    msgID: id,
                                    error: null,
                                    result: content
                                })
                                controller.enqueue('data: ' + reply + '\n\n');
                            })
                        break;
                    }

                    // save file contents    
                    case 'SAVE_FILE': {
                        saveFile(params) // todo make async with error
                        const reply = JSON.stringify({
                            msgID: id,
                            error: null,
                            result: 'ok'
                        })
                        controller.enqueue('data: ' + reply + '\n\n');

                        break;
                    }
                    default: {
                        const reply = JSON.stringify({
                            msgID: id,
                            error: 'Unknown procedure called!',
                            result: procedure
                        })
                        controller.enqueue('data: ' + reply + '\n\n');
                        break;
                    }
                }
            };
        },
        cancel() {
            sseChannel.close();
        },
    });

    return new Response(stream.pipeThrough(new TextEncoderStream()), {
        headers: { "content-type": "text/event-stream" },
    });
}