

/// <reference lib="dom" />
     
import { ctx } from './context.ts'
//import { initComms, rpcRequest } from './deps.ts' // './sse_rpc.ts'
import { DbClient, rpcRequest } from './deps.ts' 
import { NewTreeView } from './treeView.ts'
import { createElement } from './elementBuilder.ts'

//@ts-ignore in Global loaded in <Head> 
export const flask = new CodeFlask('.flaskContainer', {
    language: 'js',
    lineNumbers: false,
    handleTabs: true,
    defaultTheme: false,
});

let logger: HTMLPreElement;
let saveBtn: HTMLButtonElement
 
export const log = (what: string, whatElse = null, and = null) => {
    let text = what + "   ";
    if (whatElse)
        text += whatElse;
    if (and)
        text += and;
    logger.textContent += text + `
    `;
};
    
document.addEventListener('DOMContentLoaded', () => {
    logger = document.getElementById('logger') as HTMLPreElement;
    saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    const tree = document.getElementById("treeView") as HTMLDivElement;

    const DBServiceURL = "http://localhost:9099"

    const thisDB = new DbClient(DBServiceURL)   
    saveBtn.onclick = () => {
        if (ctx.fileName.length > 0 && ctx.folderName.length > 0) {
         rpcRequest('SAVE_FILE', {
                folder: ctx.folderName,
                fileName: ctx.fileName,
                content: flask.getCode()
            }).then((result: any) => {
                if (typeof result === 'string') log(result);
            }).catch((e: any) => log(e))
                
        } else {
            alert(`Missing folder or filename! folder: ${ctx.folderName}  file: ${ctx.fileName}`)
        }
    }
      
    thisDB.init("SSERPC/ioRegistration").then(() => {
        rpcRequest('GET_FOLDER', {
            folder: ctx.folderName,
            fileName: null,
            content: null
        }).then((result: any) => {
            ctx.fileList = JSON.parse(result + '')
            tree.appendChild(createElement(NewTreeView, null, null));
        }).catch((e: Error) => log(e.message))
    })
   
    log('started ')
  
});
 