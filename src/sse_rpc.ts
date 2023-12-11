
// deno-lint-ignore-file no-explicit-any
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />

const DEBUG = true

import { RpcId, RpcProcedure, RpcParams } from '../constants.ts'
const local = false
const postURL = (local) ? "http://localhost:9099/SSERPC/ioRequest" : "https://rpc-broker.deno.dev/SSERPC/ioRequest"
const regtURL = (local) ? "http://localhost:9099/SSERPC/ioRegistration" : "https://rpc-broker.deno.dev/SSERPC/ioRegistration"


/* Usage:
    import { rpcRequest } from './sse_rpc.js'
    // this returns a promise
    rpcRequest({ procedure: 'DO_SOMETHING', params: someValue(s) })
        .then ((value) => {
            log('got a result from RPC ', value)
            useIt(value);
        }).catch((e) => log(e))
    }
*/

/** Map of callbacks keyed by ID number */
// deno-lint-ignore no-explicit-any
const callbacks: Map<RpcId, any> = new Map()

/** ID number generator */
let nextMsgID = 0

/** refresh css  */
export function refreshCSS() {
   if (DEBUG) console.log('refreshed css')
   const sheets = [].slice.call(document.getElementsByTagName("link"));
   const head = document.getElementsByTagName("head")[0];
   for (let i = 0; i < sheets.length; ++i) {
      const elem = sheets[i] as HTMLLinkElement;
      const parent = elem.parentElement || head;
      parent.removeChild(elem);
      const rel = elem.rel;
      if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
         const url = elem.href.replace(/(&|\?)_cacheOverride=d+/, '');
         elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
      }
      parent.appendChild(elem);
   }
}

/** 
 * Post a message to our SSE-RPC-server     
 * We give each message a unique ID.    
 * We then create/save a callback with this ID.    
 * Finally, we return a promise for this callback.     
 * This is how we implement async transactions with    
 * our SSE-RPC-server. Since most of the heavy lifting is    
 * on the server, we never block the UI 
 */
export const rpcRequest = (procedure: RpcProcedure, params: RpcParams) => {
   const newID: RpcId = nextMsgID++
   return new Promise((resolve, reject) => {

      callbacks.set(newID, (error: any, result: any) => {
         if (error) return reject(new Error(error.message))
         resolve(result)
      })
      if (DEBUG) console.log(`fetch called: ${procedure}`)
      fetch(postURL, {
      method: "POST",
         body: JSON.stringify({ txID: newID, procedure: procedure, params: params }),
        });
})
}

/** Initialize our SSE communications */
export const initComms = () => {
   return new Promise((resolve, reject) => {

      /** EventSource from deno SSE-Sever */
      const events = new EventSource(regtURL);

      console.log('CONNECTING');

      events.onopen = () => {
         console.log('CONNECTED');
         resolve('ok')
      }

      events.onerror = () => {
         switch (events.readyState) {
            case EventSource.OPEN:
               console.log('CONNECTED');
               break;
            case EventSource.CONNECTING:
               console.log('CONNECTING');
               break;
            case EventSource.CLOSED:
               reject('closed')
               console.log('DISCONNECTED');
               break;
         }
      };

      // When we get a message from the server, we expect 
      // an object containing {msgID, error, and result}.
      // We find the callback that was registered for this ID, 
      // and call it with the error and result properities.
      // This will resolve or reject the promise that was
      // returned to the client when the callback was created.
      events.onmessage = (e) => {
         const { data } = e
         if (DEBUG) console.info('events.onmessage - ', data)
         const parsed = JSON.parse(data)
         const { txID, error, result } = parsed      // unpack
         if (txID >= 0) {
            if (!callbacks.has(txID)) return;        // check                  
            const callback = callbacks.get(txID)     // fetch
            callbacks.delete(txID)                   // clean up
            callback(error, result)                   // execute
         }
         else if (txID === -1) {
            console.log('refreshCSS()')
            refreshCSS();
         }
         else if (txID === -2) {
            console.log('window.location.reload()')
            window.location.reload();
         }
      }
   })
}