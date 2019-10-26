import fs from 'fs'
// import * as Promise from 'bluebird'
import { log } from '@app/log'
import getStream from 'get-stream'
import path from 'path'
import util from 'util'
import ZipStream from 'node-stream-zip'
import * as xmlParser from 'fast-xml-parser'
import { hasNode } from '@helpers/objectHelper'
import epubMetadataTags from '@constants/epubMetadataTags'
import { appendLockExtension, trimSpecialExtension } from '@helpers/fileHelper'
import { default as bookModel, applyMetadata } from '@models/book'

export const coverProcessingMode = {
    FromMetadata: 'fromMetadata',
    OpenBookLibraryAPI: 'fromOBLapi',
    FirstPage: 'fromFirstPage'
}

export class EpubProcessor {
    constructor(path) {
        if(!this._invalidEpub(path))
            throw new Error(`invalid path: ${path}`)

        this.path = path
        this._cover = {
            path: null,
            mode: undefined
        }
        this.metadata = null
        this.stream = null
    }

    _invalidEpub(filePath) {
        if(!(fs.existsSync(filePath)))
            return false

        return path.extname(filePath) === '.epub'
    }

    async parseMetadata() {
        let zipStream = this.stream = new ZipStream({
            file: this.path,
            storeEntries: true
        })

        zipStream.once('ready', async () => {
            try {
                const rawMetaContainer = await this._getMetaContainer(zipStream)
                const metaContainer = await this._parseXML(rawMetaContainer)

                if (!(hasNode(metaContainer, 'container.rootfiles.rootfile.@full-path'))) {
                    log.error(`container don't contains rootfile node: ${JSON.stringify(metaContainer)}`)
                    reject(`container don't contains rootfile node: ${JSON.stringify(metaContainer)}`)
                }

                const opfContentPath = metaContainer.container.rootfiles.rootfile['@full-path']

                if (opfContentPath === null || opfContentPath === undefined || !this._isEntryValid(zipStream, opfContentPath)) {
                    log.error(`unable to get opf content path: ${JSON.stringify(metaContainer)}`)
                    reject(`unable to get opf content path: ${JSON.stringify(metaContainer)}`)
                }

                const opfEntry = this._getEntryByName(zipStream, opfContentPath)
                const rawOPF = await this._readEntryAsTextFile(zipStream, opfEntry)

                const parsedOPF = await this._parseXML(rawOPF)

                //ensure then metadata node exists in parsed object
                if (!(hasNode(parsedOPF, 'package.metadata'))) {
                    log.error(`opf don't contains metadata node: ${JSON.stringify(parsedOPF)}`)
                    reject(`opf don't contains metadata node: ${JSON.stringify(parsedOPF)}`)
                }

                this.metadata = await this._extractMetadataFromObject(parsedOPF.package.metadata)

                // this._updateCover(parsedOPF)

                return undefined
            } catch(e) {
                log.error(`unable to process epub file: ${e}`)
                throw new Error(e)
            }
        })
    }

    async tryExtractCover(targetPath) {
        if(!(this.isReading()))
            throw new Error(`stream is closed`)

        switch (this._cover.mode) {
            case coverProcessingMode.FromMetadata:
                const coverEntry = await this._getEntryByName(this.stream, this._cover.path)
                const coverBuffer = await this._readEntryAsBinaryFile(this.stream, coverEntry)

                const finalPath = appendLockExtension(targetPath)

                fs.appendFile(finalPath, coverBuffer, err => {
                    if(err)
                        throw new Error(`unable to write cover file path: ${err}`)

                    trimSpecialExtension(finalPath)
                    return true
                })

                break

            case coverProcessingMode.OpenBookLibraryAPI:
                //TODO: call OBL API and download cover if possible
                return false

            case coverProcessingMode.FirstPage:
                //TODO
                return false

            default:
                //TODO: log.warn(...)
                //TODO: use some default??
                return false
        }
    }

    isReading() {
        return this.stream !== undefined && this.stream !== null
    }

    hasCover() {
        return this._cover.mode !== undefined
    }

    toBookModel() {
        let model = bookModel

        model.set('path', this.path)

        applyMetadata(model, this.metadata)
    }

    async dispose() {
        if(this.isReading()) {
            this.stream.close(() => {
                    return true
                }
            )
        }
    }

    // --- Core ---

    async _getMetaContainer(archive) {
        let containerEntry

        //this function will try to find META-INF/container.xml
        //but we have to iterate all entries (until we find valid one)
        //becouse of some epubs have different file names case sensitivity :/
        const contentContainer = entry => {
            if(!(util.isString(entry)))
                return false

            const _entry = entry.toLowerCase()
            const trimStartIndex = Math.max(_entry.lastIndexOf("/"), _entry.lastIndexOf("\\"))

            if(trimStartIndex > 0) {
                const extracted = _entry.substring(
                    trimStartIndex + 1, //+1 is '/' char
                    _entry.length
                )

                return extracted === 'container.xml'
            } else
                return _entry === 'container.xml'
        }

        const entries = Object.values(archive.entries())

        for (const entry of entries) {
            if(containerEntry !== undefined)
                continue

            if(contentContainer(entry.name) === true) {
                containerEntry = entry
            }
        }

        if(containerEntry !== undefined) {
            // return opfEntry //this._readEntryAsTextFile(archive, this._getEntryByName(opfEntry))
            return this._readEntryAsTextFile(archive, containerEntry)
        } else {
            return null
        }
    }

    async _extractMetadataFromObject(metadataObject) {
        let extracted = {}

        for(let tagName in epubMetadataTags) {
            const tag =  epubMetadataTags[tagName]

            if(metadataObject.hasOwnProperty(tag)) {
                extracted[tag] = this._nodeValueExtractor(metadataObject[tag], tag)
            }
        }

        return extracted
    }

    async _updateCover(opfObject) {
        let coverResourceId = null

        if (hasNode(opfObject, 'package.metadata.meta.@name')) { //common guttenberg cover format
            if (opfObject.package.metadata.meta['@name'] === 'cover') {
                coverResourceId = this._getResourcePath(opfObject.package.manifest, coverResourceId)

                if(coverResourceId !== null) {
                    this._cover.path = coverResourcePath
                    this._cover.mode = coverProcessingMode.FromMetadata
                }
            }
        }

        if(coverResourceId !== null)
            return true

        // else if(*valid isbn found*) {
            //TODO: try download cover using open book libarary api
        //}
        //else {
            //TODO: try to parse .ncx navigation file and extract first page image
            //    : which usualy contains cover
        //}

        // return coverResourceId
        return false
    }

    _nodeValueExtractor(node, tag) {
        if(util.isString(node)) {
            return node
        } else if(util.isObject(node)) {
            if(node.hasOwnProperty('#text')) {
                return node['#text']
            } else {
                return '-'
            }
        } else if(util.isArray(node)) {
            return node.join(',')
        } else {
            log.warn(`unable to parse metadata property: ${tag}, type: ${typeof(tag)}`)
            return '-'
        }
    }

    async _parseXML(xml) {
        const parserOptions = {
            attributeNamePrefix: "@",
            attrNodeName: false,
            textNodeName: "#text",
            ignoreAttributes: false,
            ignoreNameSpace: true,
            allowBooleanAttributes: false,
            parseNodeValue: true,
            parseAttributeValue: false,
            trimValues: false,
            cdataTagName: false
        }

        if(xmlParser.validate(xml, parserOptions) !== true) {
            log.error(`xml content is invalid: ${xml}`)
            return null
        }

        return xmlParser.parse(xml, parserOptions)
    }

    // --- Epub Archive Helpers ---
    _getResourcePath(manifestNode, resourceId) {
        let value = null

        for(let itemIndex in manifestNode) {
            const item = manifestNode[itemIndex]

            if(hasNode(item, '@id') && item['@id'] === resourceId) {
                if(hasNode(item, '@href')) {
                    value = item['@href']
                } else {
                    log.error(`resource id matched, but unable to get value: ${resourceId}, ${JSON.stringify(item)}`)
                }

                break
            }
        }

        return value
    }

    // --- Archive Helpers ---
    _getEntryExtension(archive, entryOrPath) {
        let entry = null

        if (util.isString(entryOrPath))
            entry = this._getEntryByName(entryOrPath)
        else
            entry = entryOrPath

        let splited = entry.name.split('.')

        if(splited.length < 2)
            throw new Error(`unable to get entry extension: ${entry.name}`)

        return splited[splited.length - 1]
    }

    _isEntryValid(archive, path) {
        return archive.entry(path) !== undefined
    }

    _isEntryADirectory(archive, path) {
        if(!(this._isPathValid(archive, path)))
            return undefined

        return archive.entry(path).isDirectory
    }

    _readEntryAsTextFile(archive, entry) {
        return this._readEntry(archive, entry, 'utf8')
    }

    _readEntryAsBinaryFile(archive, entry) {
        return this._readEntry(archive, entry, 'binary')
    }

    _readEntryAsBuffer(archive, entry) {
        return new Promise((resolve, reject) => {
            if(!this._isPathValid(archive, entry) || this._isPathADirectory(entry))
                reject(undefined)

            archive.stream((err, stream) => {
                if(err) {
                    log.warn(`unable to get file stream: ${entry}, err: ${err}`)
                    reject(undefined)
                }

                getStream.buffer(stream)
                    .then(r => {
                        resolve(r)
                    })
                    .catch(e => {
                        log.warn(`unable to get file buffer: ${entry}, err: ${e}`)
                        reject(undefined)
                    })
            })
        })
    }

    _readEntry(archive, entry, encoding) {
        return new Promise((resolve, reject) => {
            try {
                archive.stream(entry, (err, stream) => {
                    if (err) {
                        log.warn(`unable to get file: ${entry}, err: ${err}`)
                        reject(undefined)
                    }

                    getStream(stream, {encoding: encoding})
                        .then(r => {
                            resolve(r)
                        })
                        .catch(e => {
                            log.warn(`unable to get file stream: ${entry}, err: ${e}`)
                            reject(undefined)
                        })

                })
            } catch (e) {
                log.error(`unable to read entry: ${entry.name}`)
            }
        })
    }

    _getDirectoryFromEntryPath(archive, path, _throw = false) {
        let dirPath = path.substring(0, Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")))

        if(dirPath === undefined ||
            dirPath.length < 1)
        {
            if(_throw)
                throw new Error(`unable to get directory from path: ${path}`)

            return undefined
        }

        return dirPath
    }

    _getEntryByName(archive, name) {
        return archive.entry(name)
    }
}