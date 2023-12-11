
export const getLanguage = (name: string): string => {
    const ext = getExtention(name)
    if (ext === '.js' || ext === 'ts') return 'js'
    if (ext === '.css') return 'css'
    if (ext === '.html' || ext === '.md') return 'markdown'
    return 'js'
}

const getExtention = (name: string) => {
    return (name)
        ? name.substring(name.lastIndexOf('.'), name.length) || name
        : ''
}

/** Look up the content type based on a file extension. */
export const getContentType = (path: string) => {
    const ext = getExtention(path)
    const base = 'application/octet-stream'
    if (ext.length > 2) {
        return ContentType[ext] || base
    }
    return base
}

// A content type ditionary keyed by extension strings
const ContentType: Record<string, string> = {
    ".md": "text/markdown",
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".json": "application/json",
    ".map": "application/json",
    ".txt": "text/plain",
    ".ts": "text/typescript",
    ".tsx": "text/tsx",
    ".js": "application/javascript",
    ".jsx": "text/jsx",
    ".gz": "application/gzip",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".eot": "appliaction/vnd.ms-fontobject",
    ".ttf": "aplication/font-sfnt"
}