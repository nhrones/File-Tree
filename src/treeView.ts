// deno-lint-ignore-file
import { createElement, appendChild, appendToFolder } from './elementBuilder.ts'
import { ctx } from './context.ts'
import { rpcRequest } from "./deps.ts"
import { log, flask } from './main.ts'
import { getLanguage } from './utils.ts'

/* shorthand functions (createElement is defined at bottom)*/
export const div = (props: any, ...children: any) => createElement("div", props, ...children);
export const ul = (props: any, ...children: any) => createElement("ul", props, ...children);
export const li = (props: any, ...children: any) => createElement("li", props, ...children);
export const i = (props: any, ...children: any) => createElement("i", props, ...children);
export const span = (props: any, ...children: any) => createElement("span", props, ...children);
export const header = (props: any, ...children: any) => createElement("header", props, ...children);
export const p = (props: any, ...children: any) => createElement("p", props, ...children);
export const section = (props: any, ...children: any) => createElement("section", props, ...children);
export const button = (props: any, ...children: any) => createElement("button", props, ...children);


/* ---------------------------
   Files 
*  ---------------------------*/

const File = (name: string) => {
   return div(
      {
         'data-filename': name,
         onClick: onNodeClicked,
         className: "file"
      },
      i({ className: "material-icons", style: "opacity: 0;" }, "arrow_right"),
      i({ className: "material-icons" }, "insert_drive_file"),
      span(null, name),
   );
};


/* ---------------------------
   Folders 
*  ---------------------------*/

const openedFolderIcon = "folder_open";
const closedFolderIcon = "folder";
const openedArrowIcon = "arrow_drop_down";
const closedArrowIcon = "arrow_right";

/** Reacts to the event of a tree node being clicked. */
function onNodeClicked(e: any) {
   const { filename, foldername } = e.currentTarget.dataset
   ctx.fileName = filename
   ctx.folderName = foldername
   rpcRequest('GET_FILE',
      { folder: foldername, fileName: filename, content: null })
      .then((result: any) => {
         const lang = getLanguage(ctx.fileName)
         if (typeof result === 'string') {
            flask.updateLanguage(lang)
            flask.updateCode(result)
         }
      }).catch((e: Error) => log('ERROR on savebtn '+ e.message))
}


function changeOpened(event: any) {
   const folderHeader = event.target.classList.contains("folder-header")
      ? event.target
      : event.target.parentElement;
   const opened = folderHeader.getAttribute("opened") == "true";
   const newOpened = !opened;

   const icons = folderHeader.querySelectorAll(".material-icons");
   icons.forEach((icon: any) => {
      if (/arrow/i.test(icon.textContent)) {
         icon.textContent = newOpened ? openedArrowIcon : closedArrowIcon;
      } else {
         icon.textContent = newOpened ? openedFolderIcon : closedFolderIcon;
      }
   });

   try {
      const sibling = folderHeader.nextElementSibling;
      if (newOpened) {
         sibling.classList.remove("hide");
      } else {
         sibling.classList.add("hide");
      }
   } catch (_e) {
      console.warn(`No sibling of elem ${folderHeader} found ...`);
   }

   folderHeader.setAttribute("opened", newOpened);
}

/** folder builder */
const Folder = (props: any, ...children: any) => {
   const opened = props.opened || false;
   const arrowIcon = opened ? openedArrowIcon : closedArrowIcon;
   const folderIcon = opened ? openedFolderIcon : closedFolderIcon;
   const folderName = props.name || "unknown";

   return div(
      { className: "folder" },
      header(
         {
            onClick: changeOpened,
            className: "folder-header",
            opened: opened
         },
         i({ className: "material-icons" }, arrowIcon),
         i({ className: "material-icons" }, folderIcon),
         span(null, folderName)
      ),
      ul({ className: opened ? "" : "hide" }, ...children)
   );
};

const getFolder = (path: string) => {
   const sub = path.lastIndexOf('\\')
   if (sub === -1) {
      if (path.lastIndexOf('.') != -1) { // a root file
         return '.'
      } // a raw directory
      return path
   }
   return path.substring(0, sub)
}

const loadFiles = (entries: any) => {
   let container = section({ id: "#flaskArea", classname: 'container ' })
   let thisIndex = 0
   try {
      const folders = new Map()
      entries.forEach((entry: any, index: number) => {
         thisIndex = index
         const { path, name, isDirectory } = entry
         let folderName = getFolder(path)
         if (isDirectory) {
            if (!folders.has(folderName)) {
               let folder = Folder({ name: folderName })
               folders.set(folderName, folder)

               appendChild(container, folder)
            }
         } else {
            if (folders.has(folderName)) {
               appendToFolder(folders.get(folderName), File(name), folderName)
            }
         }
      });
   } catch (e) {
      console.info('Error: at ' + thisIndex, e)
   }
   console.info('container: ', container)
   return container
}

export const NewTreeView = () => {
   return loadFiles(ctx.fileList)
}
