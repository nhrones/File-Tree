// deno-lint-ignore-file
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/context.ts
var files = [];
var ctx = {
  fileList: files,
  fileName: "",
  folderName: ""
};

// https://raw.githubusercontent.com/nhrones/BuenoRPC-Client/main/context.ts
var CTX = {
  DEBUG: false,
  DBServiceURL: "",
  registrationURL: "",
  requestURL: ""
};

// https://raw.githubusercontent.com/nhrones/BuenoRPC-Client/main/dbClient.ts
var { DBServiceURL, DEBUG, registrationURL, requestURL } = CTX;
var nextMsgID = 0;
var transactions = /* @__PURE__ */ new Map();
var DbClient = class {
  constructor(serviceURL, serviceType) {
    this.querySet = [];
    DBServiceURL = serviceURL.endsWith("/") ? serviceURL : serviceURL += "/";
    switch (serviceType) {
      case "IO":
        registrationURL = DBServiceURL + "SSERPC/ioRegistration", requestURL = DBServiceURL + "SSERPC/ioRequest";
        break;
      case "KV":
        registrationURL = DBServiceURL + "SSERPC/kvRegistration", requestURL = DBServiceURL + "SSERPC/kvRequest";
        break;
      case "RELAY":
        registrationURL = DBServiceURL + "SSERPC/relayRegistration", requestURL = DBServiceURL + "SSERPC/relayRequest";
        break;
      default:
        break;
    }
  }
  /** initialize our EventSource and fetch some data */
  init() {
    return new Promise((resolve, reject) => {
      let connectAttemps = 0;
      console.log("CONNECTING");
      const eventSource = new EventSource(registrationURL);
      eventSource.addEventListener("open", () => {
        console.log("CONNECTED");
        resolve();
      });
      eventSource.addEventListener("error", (_e) => {
        switch (eventSource.readyState) {
          case EventSource.OPEN:
            console.log("CONNECTED");
            break;
          case EventSource.CONNECTING:
            console.log("CONNECTING");
            connectAttemps++;
            if (connectAttemps > 1) {
              eventSource.close();
              alert(`No Service!
Please start the DBservice!
See: readme.md.`);
            }
            console.log(`URL: ${window.location.href}`);
            break;
          case EventSource.CLOSED:
            console.log("DISCONNECTED");
            reject();
            break;
        }
      });
      eventSource.onmessage = (evt) => {
        if (DEBUG)
          console.info("events.onmessage - ", evt.data);
        const parsed = JSON.parse(evt.data);
        const { txID, error, result } = parsed;
        if (!transactions.has(txID))
          return;
        const transaction = transactions.get(txID);
        transactions.delete(txID);
        if (transaction)
          transaction(error, result);
      };
    });
  }
  /**
   * fetch a querySet      
   */
  fetchQuerySet() {
    return new Promise((resolve, _reject) => {
      rpcRequest("GETALL", {}).then((result) => {
        if (typeof result === "string") {
          resolve(JSON.parse(result));
        } else {
          console.log("Ooopppps: ", typeof result);
        }
      });
    });
  }
  /**
   * get row from key
   */
  get(key) {
    for (let index = 0; index < this.querySet.length; index++) {
      const element = this.querySet[index];
      if (element.id === key)
        return element;
    }
  }
  /** 
   * The `set` method mutates - will call the `persist` method. 
   */
  set(key, value) {
    console.log(`set call key = `, key);
    try {
      rpcRequest(
        "SET",
        {
          key,
          value,
          //@ts-ignore ?
          currentPage: this.currentPage,
          //@ts-ignore ?
          rowsPerPage: this.rowsPerPage
        }
      ).then((result) => {
        console.info("SET call returned ", result.querySet);
        this.querySet = result.querySet;
        return this.querySet;
      });
    } catch (e) {
      return { Error: e };
    }
  }
  /** 
   * The `delete` method mutates - will call the `persist` method. 
   */
  delete(key) {
    try {
      rpcRequest("DELETE", { key }).then((result) => {
        this.querySet = result.querySet;
        this.totalPages = result.totalPages;
        return this.querySet;
      });
    } catch (_e) {
      return { Error: _e };
    }
  }
  /** 
   * The `clearAll` method removes all records from the DB. 
   */
  async clearAll() {
    try {
      await rpcRequest("CLEARALL", { key: [""] });
    } catch (_e) {
      return { Error: _e };
    }
  }
};
__name(DbClient, "DbClient");
var rpcRequest = /* @__PURE__ */ __name((procedure, params) => {
  const txID = nextMsgID++;
  return new Promise((resolve, reject) => {
    transactions.set(txID, (error, result) => {
      if (error)
        return reject(new Error(error));
      resolve(result);
    });
    fetch(requestURL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ txID, procedure, params })
    });
  });
}, "rpcRequest");

// src/elementBuilder.ts
function appendChildren(parent, children) {
  for (const child of children) {
    if (child)
      appendChild(parent, child);
  }
}
__name(appendChildren, "appendChildren");
function appendChild(parent, child) {
  switch (typeof child) {
    case "string": {
      const el = document.createTextNode(child);
      parent.appendChild(el);
      break;
    }
    default: {
      parent.appendChild(child);
      break;
    }
  }
}
__name(appendChild, "appendChild");
function appendToFolder(parent, child, folderName) {
  setProps(child, { "data-foldername": folderName });
  let children = [...parent.children];
  children.forEach((node) => {
    if (node.tagName === "UL") {
      node.appendChild(child);
    }
  });
}
__name(appendToFolder, "appendToFolder");
function setStyle(el, style) {
  if (typeof style == "string") {
    el.setAttribute("style", style);
  } else {
    Object.assign(el.style, style);
  }
}
__name(setStyle, "setStyle");
function setClass(el, className) {
  className.split(/\s/).forEach((element) => {
    if (element) {
      el.classList.add(element);
    }
  });
}
__name(setClass, "setClass");
function setProps(el, props) {
  const eventRegex = /^on([a-z]+)$/i;
  for (const propName in props) {
    if (!propName)
      continue;
    if (propName === "style") {
      setStyle(el, props[propName]);
    } else if (propName === "className") {
      setClass(el, props[propName]);
    } else if (eventRegex.test(propName)) {
      const eventToListen = propName.replace(eventRegex, "$1").toLowerCase();
      el.addEventListener(eventToListen, props[propName]);
    } else {
      el.setAttribute(propName, props[propName]);
    }
  }
}
__name(setProps, "setProps");
function createElement(type, props, ...children) {
  if (typeof type === "function") {
    return type(props);
  } else {
    const el = document.createElement(type);
    if (props && typeof props === "object") {
      setProps(el, props);
    }
    if (children) {
      appendChildren(el, children);
    }
    return el;
  }
}
__name(createElement, "createElement");

// src/utils.ts
var getLanguage = /* @__PURE__ */ __name((name) => {
  const ext = getExtention(name);
  if (ext === ".js" || ext === "ts")
    return "js";
  if (ext === ".css")
    return "css";
  if (ext === ".html" || ext === ".md")
    return "markdown";
  if (ext === ".json")
    return "json";
  return "js";
}, "getLanguage");
var getExtention = /* @__PURE__ */ __name((name) => {
  return name ? name.substring(name.lastIndexOf("."), name.length) || name : "";
}, "getExtention");

// src/treeView.ts
var div = /* @__PURE__ */ __name((props, ...children) => createElement("div", props, ...children), "div");
var ul = /* @__PURE__ */ __name((props, ...children) => createElement("ul", props, ...children), "ul");
var i = /* @__PURE__ */ __name((props, ...children) => createElement("i", props, ...children), "i");
var span = /* @__PURE__ */ __name((props, ...children) => createElement("span", props, ...children), "span");
var header = /* @__PURE__ */ __name((props, ...children) => createElement("header", props, ...children), "header");
var section = /* @__PURE__ */ __name((props, ...children) => createElement("section", props, ...children), "section");
var File = /* @__PURE__ */ __name((name) => {
  return div(
    {
      "data-filename": name,
      onClick: onNodeClicked,
      className: "file"
    },
    i({ className: "material-icons", style: "opacity: 0;" }, "arrow_right"),
    i({ className: "material-icons" }, "insert_drive_file"),
    span(null, name)
  );
}, "File");
var openedFolderIcon = "folder_open";
var closedFolderIcon = "folder";
var openedArrowIcon = "arrow_drop_down";
var closedArrowIcon = "arrow_right";
function onNodeClicked(e) {
  const { filename, foldername } = e.currentTarget.dataset;
  ctx.fileName = filename;
  ctx.folderName = foldername;
  rpcRequest(
    "GET_FILE",
    { folder: foldername, fileName: filename, content: null }
  ).then((result) => {
    const lang = getLanguage(ctx.fileName);
    if (typeof result === "string") {
      flask.updateLanguage(lang);
      flask.updateCode(result);
    }
  }).catch((e2) => log(e2.message));
}
__name(onNodeClicked, "onNodeClicked");
function changeOpened(event) {
  const folderHeader = event.target.classList.contains("folder-header") ? event.target : event.target.parentElement;
  const opened = folderHeader.getAttribute("opened") == "true";
  const newOpened = !opened;
  const icons = folderHeader.querySelectorAll(".material-icons");
  icons.forEach((icon) => {
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
__name(changeOpened, "changeOpened");
var Folder = /* @__PURE__ */ __name((props, ...children) => {
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
        opened
      },
      i({ className: "material-icons" }, arrowIcon),
      i({ className: "material-icons" }, folderIcon),
      span(null, folderName)
    ),
    ul({ className: opened ? "" : "hide" }, ...children)
  );
}, "Folder");
var getFolder = /* @__PURE__ */ __name((path) => {
  const sub = path.lastIndexOf("\\");
  if (sub === -1) {
    if (path.lastIndexOf(".") != -1) {
      return ".";
    }
    return path;
  }
  return path.substring(0, sub);
}, "getFolder");
var loadFiles = /* @__PURE__ */ __name((entries) => {
  let container = section({ id: "#flaskArea", classname: "container " });
  let thisIndex = 0;
  try {
    const folders = /* @__PURE__ */ new Map();
    entries.forEach((entry, index) => {
      thisIndex = index;
      const { path, name, isDirectory } = entry;
      let folderName = getFolder(path);
      if (isDirectory) {
        if (!folders.has(folderName)) {
          let folder = Folder({ name: folderName });
          folders.set(folderName, folder);
          appendChild(container, folder);
        }
      } else {
        if (folders.has(folderName)) {
          appendToFolder(folders.get(folderName), File(name), folderName);
        }
      }
    });
  } catch (e) {
    console.info("Error: at " + thisIndex, e);
  }
  console.info("container: ", container);
  return container;
}, "loadFiles");
var NewTreeView = /* @__PURE__ */ __name(() => {
  return loadFiles(ctx.fileList);
}, "NewTreeView");

// src/main.ts
var flask = new CodeFlask(".flaskContainer", {
  language: "js",
  lineNumbers: false,
  handleTabs: true,
  defaultTheme: false
});
var logger;
var saveBtn;
var log = /* @__PURE__ */ __name((what, whatElse = null, and = null) => {
  let text = what + "   ";
  if (whatElse)
    text += whatElse;
  if (and)
    text += and;
  logger.textContent += text + `
    `;
}, "log");
logger = document.getElementById("logger");
saveBtn = document.getElementById("saveBtn");
var tree = document.getElementById("treeView");
var RunningLocal = window.location.href === "http://localhost:8080/";
console.log(`RunningLocal`, RunningLocal);
var dbServiceURL = RunningLocal ? "http://localhost:9099" : "https://bueno-rpc.deno.dev/";
var thisDB = new DbClient(dbServiceURL, "IO");
saveBtn.onclick = () => {
  if (ctx.fileName.length > 0 && ctx.folderName.length > 0) {
    rpcRequest(
      "SAVE_FILE",
      { folder: ctx.folderName, fileName: ctx.fileName, content: flask.getCode() }
    ).then((result) => {
      if (typeof result === "string")
        log(result);
    }).catch((e) => log(e));
  } else {
    alert(`Missing folder or filename! folder: ${ctx.folderName}  file: ${ctx.fileName}`);
  }
};
thisDB.init().then(() => {
  rpcRequest(
    "GET_FOLDER",
    { folder: ctx.folderName, fileName: null, content: null }
  ).then((result) => {
    ctx.fileList = JSON.parse(result + "");
    tree.appendChild(createElement(NewTreeView, null, null));
  }).catch((e) => log(e.message));
});
log("started ");
export {
  flask,
  log
};
