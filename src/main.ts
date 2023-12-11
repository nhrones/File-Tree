/// <reference lib="dom" />
     
import { ctx } from './context.ts'
import { initComms, rpcRequest, refreshCSS } from './sse_rpc.ts'
import { NewTreeView } from './newTreeView.ts'
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
    refreshCSS()
    logger = document.getElementById('logger') as HTMLPreElement;
    saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    const tree = document.getElementById("treeView") as HTMLDivElement;
       
    saveBtn.onclick = () => {
        if (ctx.fileName.length > 0 && ctx.folderName.length > 0) {
            rpcRequest('SAVE_FILE', {
                folder: ctx.folderName,
                fileName: ctx.fileName,
                content: flask.getCode()
            }).then((result) => {
                if (typeof result === 'string') log(result);
            }).catch((e) => log(e))
                
        } else {
            alert(`Missing folder or filename! folder: ${ctx.folderName}  file: ${ctx.fileName}`)
        }
    }
      
    initComms().then(() => {
        rpcRequest('GET_FOLDER', {
            folder: ctx.folderName,
            fileName: null,
            content: null
        }).then((result) => {
            ctx.fileList = JSON.parse(result + '')
            tree.appendChild(createElement(NewTreeView, null, null));
        }).catch((e) => log(e))
    })
   
    log('started ')
  
});
 