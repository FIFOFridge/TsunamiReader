import path from 'path'
import fs from 'fs'

const testFilesDirectory = path.join(__dirname, '../files/')

export function getTestFilePath(fileName) {
    return path.join(testFilesDirectory, fileName)
}

export function hasTestFilePath(fileName) {
    return fs.existsSync(path.join(testFilesDirectory, fileName))
}