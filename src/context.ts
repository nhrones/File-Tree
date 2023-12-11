
export type fileType = {
    name: string
    isFile: boolean
    isDirectory: boolean
    isSymlink: boolean
}

export const files: fileType[] = []

export const ctx = {
    fileList: files,
    fileName: '',
    folderName: '',
}
