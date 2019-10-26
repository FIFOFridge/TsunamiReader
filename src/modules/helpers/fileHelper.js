import fs from 'fs'
import path from 'path'
import { specialFileExtensions } from '@constants/index'

export function isLocked(filePath) {
    return fs.existsSync(filePath) && path.extname(filePath) === specialFileExtensions.Lock
}

export function appendLockExtension(filePath) {
    return filePath + '.' + specialFileExtensions.Lock
}

export function isDownloading(filePath) {
    return fs.existsSync(filePath) && path.extname(filePath) === specialFileExtensions.Download
}

export function appendDownloadExtension(filePath) {
    return filePath + '.' + specialFileExtensions.Download
}

export async function backup(baseFilePath) {
    const backupFilePath = baseFilePath + '.' + specialFileExtensions.Backup

    if(fs.existsSync(backupFilePath)) {
        fs.unlink(baseFilePath, err => {
            if(err)
                throw new Error(`unable to backup file: ${err}`)

            fs.copyFile(baseFilePath, backupFilePath, err => {
                if(err)
                    throw new Error(`unable to copy backup file: ${err}`)
            })

            return true
        })
    } else {
        fs.copyFile(baseFilePath, backupFilePath, err => {
            if(err)
                throw new Error(`unable to copy backup file: ${err}`)
        })

        return true
    }
}

export function hasBackupSync(filePath) {
    return fs.existsSync(filePath) && path.extname(filePath) === specialFileExtensions.Backup
}

export async function cleanBackup(baseFilePath) {
    const backupFilePath = baseFilePath + '.' + specialFileExtensions.Backup

    fs.unlink(backupFilePath, err => {
        if(err)
            throw new Error(`unable to clean backup file: ${err}`)

        return undefined
    })
}

export function cleanBackupSync(baseFilePath) {
    const backupFilePath = baseFilePath + '.' + specialFileExtensions.Backup

    fs.unlinkSync(backupFilePath)
}

export async function restoreFromBackup(baseFilePath) {
    const backupFilePath = baseFilePath + '.' + specialFileExtensions.Backup

    if(!(hasBackupSync(baseFilePath)))
        throw new Error(`file don't have a backup: ${baseFilePath}`)

    if(fs.existsSync(baseFilePath)) { //if original exists
        fs.unlink(baseFilePath, err => { //delete
            if(err)
                throw new Error(`unable to delete original existing file: ${baseFilePath}`)

            fs.copyFile(backupFilePath, baseFilePath, err => { //copy
                if(err)
                    throw new Error(`unable to copy backup to oringinal file path: ${baseFilePath}`)

                return true
            })
        })
    } else {
        fs.copyFile(backupFilePath, baseFilePath, err => {
            if(err)
                throw new Error(`unable to copy backup to oringinal file path: ${baseFilePath}`)

            return true
        })
    }
}

export function trimSpecialExtension(filePath, _throw = true) {
    if(!(fs.existsSync(filePath)))
        throw new Error(`file don't exists: ${filePath}`)

    const newFileName = filePath
        .replace('.' + specialFileExtensions.Lock, '')
        .replace('.' + specialFileExtensions.Download, '')

    if(filePath === newFileName && _throw)
        throw new Error(`filePath don't have special extension: ${filePath}`)

    fs.renameSync(filePath, newFileName)
}