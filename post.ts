import {DEBUG} from './constants.ts';

/** handler used to POST a message to a common BroadcastChannel, 
 * @param req (Request) - the original http request object
 * @returns (Promise<Response>) the required Response object 
 */
export async function POST(req: Request): Promise<Response> { 
    const data = await req.json();
    if (DEBUG) console.info('POST recieved ('+ (typeof data) + "): ", data)
    const bc = new BroadcastChannel("sse-rpc");
    bc.postMessage(data);
    bc.close();

    return new Response("");
}
