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

// src/sse_rpc.ts
var DEBUG = false;
var local = false;
var postURL = local ? "http://localhost:9099/SSERPC/ioRequest" : "https://rpc-broker.deno.dev/SSERPC/ioRequest";
var regtURL = local ? "http://localhost:9099/SSERPC/ioRegistration" : "https://rpc-broker.deno.dev/SSERPC/ioRegistration";
var callbacks = /* @__PURE__ */ new Map();
var nextTxID = 0;
function refreshCSS() {
  if (DEBUG)
    console.log("refreshed css");
  const sheets = [].slice.call(document.getElementsByTagName("link"));
  const head = document.getElementsByTagName("head")[0];
  for (let i2 = 0; i2 < sheets.length; ++i2) {
    const elem = sheets[i2];
    const parent = elem.parentElement || head;
    parent.removeChild(elem);
    const rel = elem.rel;
    if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
      const url = elem.href.replace(/(&|\?)_cacheOverride=d+/, "");
      elem.href = url + (url.indexOf("?") >= 0 ? "&" : "?") + "_cacheOverride=" + (/* @__PURE__ */ new Date()).valueOf();
    }
    parent.appendChild(elem);
  }
}
__name(refreshCSS, "refreshCSS");
var rpcRequest = /* @__PURE__ */ __name((procedure, params) => {
  const newTxID = nextTxID++;
  return new Promise((resolve, reject) => {
    callbacks.set(newTxID, (error, result) => {
      if (error)
        return reject(new Error(error.message));
      resolve(result);
    });
    if (DEBUG)
      console.log(`fetch called: ${procedure}`);
    fetch(postURL, {
      method: "POST",
      body: JSON.stringify({ txID: newTxID, procedure, params })
    });
  });
}, "rpcRequest");
var initComms = /* @__PURE__ */ __name(() => {
  return new Promise((resolve, reject) => {
    const events = new EventSource(regtURL);
    console.log("CONNECTING");
    events.onopen = () => {
      console.log("CONNECTED");
      resolve("ok");
    };
    events.onerror = () => {
      switch (events.readyState) {
        case EventSource.OPEN:
          console.log("CONNECTED");
          break;
        case EventSource.CONNECTING:
          console.log("CONNECTING");
          break;
        case EventSource.CLOSED:
          reject("closed");
          console.log("DISCONNECTED");
          break;
      }
    };
    events.onmessage = (e) => {
      const { data } = e;
      if (DEBUG)
        console.info("events.onmessage - ", data);
      const parsed = JSON.parse(data);
      const { txID, error, result } = parsed;
      if (txID >= 0) {
        if (!callbacks.has(txID))
          return;
        const callback = callbacks.get(txID);
        callbacks.delete(txID);
        callback(error, result);
      } else if (txID === -1) {
        console.log("refreshCSS()");
        refreshCSS();
      } else if (txID === -2) {
        console.log("window.location.reload()");
        window.location.reload();
      }
    };
  });
}, "initComms");

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

// src/newTreeView.ts
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
  rpcRequest("GET_FILE", {
    folder: foldername,
    fileName: filename,
    content: null
  }).then((result) => {
    const lang = getLanguage(ctx.fileName);
    if (typeof result === "string") {
      flask.updateLanguage(lang);
      flask.updateCode(result);
    }
  }).catch((e2) => log(e2));
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
document.addEventListener("DOMContentLoaded", () => {
  refreshCSS();
  logger = document.getElementById("logger");
  saveBtn = document.getElementById("saveBtn");
  const tree = document.getElementById("treeView");
  saveBtn.onclick = () => {
    if (ctx.fileName.length > 0 && ctx.folderName.length > 0) {
      rpcRequest("SAVE_FILE", {
        folder: ctx.folderName,
        fileName: ctx.fileName,
        content: flask.getCode()
      }).then((result) => {
        if (typeof result === "string")
          log(result);
      }).catch((e) => log(e));
    } else {
      alert(`Missing folder or filename! folder: ${ctx.folderName}  file: ${ctx.fileName}`);
    }
  };
  initComms().then(() => {
    rpcRequest("GET_FOLDER", {
      folder: ctx.folderName,
      fileName: null,
      content: null
    }).then((result) => {
      ctx.fileList = JSON.parse(result + "");
      tree.appendChild(createElement(NewTreeView, null, null));
    }).catch((e) => log(e));
  });
  log("started ");
});
export {
  flask,
  log
};
