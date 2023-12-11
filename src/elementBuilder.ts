// deno-lint-ignore-file
/// <reference lib="dom" />

function appendChildren(parent: any, children: any) {
    for (const child of children) {
        if (child) appendChild(parent, child);
    }
}

export function appendChild(parent: any, child: any) {
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

export function appendToFolder(parent: any, child: any, folderName: string) {
    setProps(child,{'data-foldername': folderName})
    let children = [...parent.children]
    children.forEach( (node) => {
        if (node.tagName === 'UL') {
            node.appendChild(child); 
        }
    })     
}
 
export function setStyle(el: any, style: any) {
    if (typeof style == "string") {
        el.setAttribute("style", style);
    } else {
        Object.assign(el.style, style);
    }
}

export function setClass(el: any, className: any) {
    className.split(/\s/).forEach((element: any) => {
        if (element) {
            el.classList.add(element);
        }
    });
}

export function setProps(el: any, props: any) {
    const eventRegex = /^on([a-z]+)$/i;
    for (const propName in props) {
        if (!propName) continue;

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

/** html element builder
 * @param {string} type - the tag name of an html element
 * @param {object} props - the elements properties
 * @param {array}, children - an array of child elements
 * @returns {HTMLElement} an HTMLElement
 * */
export function createElement(type: any, props: any, ...children: any) {
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