import * as Promise from 'bluebird'
import ZipStream from 'node-stream-zip'
import getStream from 'get-stream'
import { log } from 'electron-log'
import path from 'path'
import fs from 'fs'
import xml2js from 'xml2js'
import util from 'util'
import base64img from 'base64-img'
import MetadataFields from '@constants/epubMetadataTags'
import { getAllValues } from '@constants/constantsHelper'
import { isWindows } from '@app/appWrapper'
import BookModel from '@models/book'
import * as xmlParser from 'fast-xml-parser'

export class EpubArchiveHelper {
    constructor(filePath) {
        if(!(this._isEpubValid(filePath)))
            throw new Error(`invaild epub file: ${filePath}`)

        this.filePath = filePath
    }

    getBookMetadata() {
        return new Promise((resolve, reject) => {
            const filePath = this.filePath

            // if (!(this._invalidEpub(filePath)))
            //     reject(`invalid epub format`)

            let stream

            try {
                stream = new ZipStream({
                    file: filePath,
                    storeEntries: true
                })

                //dump entries
                stream.on('ready', () => {
                    const bookModel = BookModel
                    this.__getMetadata(stream)
                        .then(metadataObject => {
                            resolve()
                        })
                        .catch(err => {
                            log.error(`unable to extract metadata: ${err}`)
                        })

                    // this._getMetadata(stream)
                    //     .then(metadata => { //assign parsed metadata to model
                    //         if(
                    //             metadata.hasOwnProperty(MetadataFields.Author) ||
                    //             metadata.hasOwnProperty(MetadataFields.Creator)
                    //         ) {
                    //             bookModel.set('author',
                    //                 metadata[MetadataFields.Author] ||
                    //                 metadata[MetadataFields.Creator]
                    //             )
                    //         }
                    //
                    //         //iterate other keys
                    //         for(let k in metadata) {
                    //             if(
                    //                 k === MetadataFields.Creator ||
                    //                 k === MetadataFields.Author
                    //             )
                    //                 continue
                    //
                    //             // noinspection JSUnfilteredForInLoop
                    //             if(bookModel.has(k)) { //just make sure
                    //                 // noinspection JSUnfilteredForInLoop
                    //                 bookModel.set(k, metadata[k])
                    //             } else {
                    //                 // noinspection JSUnfilteredForInLoop
                    //                 log.warn(`metadta tag extracted but it's missing in book model: ${k}`)
                    //             }
                    //         }
                    //
                    //         resolve(metadata)
                    //     })
                    //     .catch(err => {
                    //         reject(`unable to get book metadata: ${err}`)
                    //     })
                })

            } catch (e) {
                log.error(`error occured during processing epub file: ${e}`)
            } finally {
                stream.close()
            }
        })
    }

    __getOPFContent(archive) {
        return new Promise((resolve, reject) => {
            let opfEntry

            const opfEntryDetector = entry => {
                if(!(util.isString(entry)))
                    return false

                const _entry = entry.toLowerCase()
                const trimStartIndex = Math.max(_entry.lastIndexOf("/"), _entry.lastIndexOf("\\"))

                if(trimStartIndex > 0) {
                    const extracted = _entry.substring(
                        trimStartIndex + 1, //+1 is '/' char
                        _entry.length
                    )

                    return extracted === 'package.opf'
                } else
                    return _entry === 'package.opf'
            }

            for (const entry of Object.values(archive.entries())) {
                // entries += `entry: ${entry.name} - isDirectory: ${entry.isDirectory} \n`

                if(opfEntry !== undefined)
                    continue

                if(opfEntryDetector(entry.name) === true) {
                    opfEntry = entry
                }
            }

            if(opfEntry !== undefined) {
                const opfContent = this._readFileAsText(archive, opfEntry)
                resolve(opfContent)

            } else {
                reject()
            }
        })
    }

    __getMetadata(archive) {
        return new Promise((resolve, reject) => {
            try {
                let rawOPF = this.__getOPFContent(archive)
                    .then(rawOPF => {
                        const parserOptions = {
                            attributeNamePrefix: "@_",
                            attrNodeName: false,
                            textNodeName: "#text",
                            ignoreAttributes: false,
                            ignoreNameSpace: true,
                            allowBooleanAttributes: false,
                            parseNodeValue: true,
                            parseAttributeValue: false,
                            trimValues: true,
                            cdataTagName: false
                        }

                        const metadataObject = xmlParser.getTraversalObj(rawOPF, parserOptions)

                        if(metadataObject.package.metadata !== undefined) {
                            this.__extractMetadata(metadataObject.package.metadata)
                                .then(metadata => {
                                    resolve(metadata)
                                })
                                .catch(err => {
                                    throw err
                                })
                        } else {
                            return null
                        }
                    })
                    .catch(err => {
                        throw err
                    })
            } catch (e) {
                log.error(`error during metadata processing: ${e}`)
                reject(err)
            }
        })
    }

    __extractMetadata(metadataNode) {
        return new Promise(resolve => {
            let extracted = {}

            const nodeExtractor = node => {
                if(util.isString(node)) {
                    return node
                } else if(util.isObject(node)) {
                    if(node.hasOwnProperty('#text'))
                        return node['#text']

                    return null
                }
            }

            for(let node in metadataNode) {
                if(MetadataFields.hasOwnProperty(node)) {
                    const value = nodeExtractor(node)

                    if(value !== null)
                        extracted[node] = value
                }
            }

            resolve(extracted)
        })
    }

    _isEpubValid(filePath) {
        if(!(fs.existsSync(filePath)))
            return false

        return path.extname(filePath) === '.epub'
    }

    _isPathValid(archive, path) {
        const entry = archive.entry(path)
        return entry !== undefined
        // archive.stream(path, err => {
        //     return !err
        // })
    }

    _isPathADirectory(archive, path) {
        if(!(this._isPathValid(archive, path)))
            return undefined

        return archive.entry(path).isDirectory
    }

    _readFileAsText(archive, path) {
        return this._readFile(archive, path, 'utf8')
    }

    _readFileAsBinary(archive, path) {
        return this._readFile(archive, path, 'binary')
    }

    _readFileAsBuffer(archive, path) {
        return new Promise((resolve, reject) => {
            if(!this._isPathValid(archive, path) || this._isPathADirectory(path))
                reject(undefined)

            archive.stream((err, stream) => {
                if(err) {
                    log.warn(`unable to get file stream: ${path}, err: ${err}`)
                    reject(undefined)
                }

                getStream.buffer(stream)
                    .then(r => {
                        resolve(r)
                    })
                    .catch(e => {
                        log.warn(`unable to get file buffer: ${path}, err: ${e}`)
                        reject(undefined)
                    })
            })
        })
    }

    _readFile(archive, path, encoding) {
        return new Promise((resolve, reject) => {
            if(!this._isPathValid(archive, path) || this._isPathADirectory(path))
                reject(undefined)

            archive.stream((err, stream) => {
                if(err) {
                    log.warn(`unable to get file: ${path}, err: ${err}`)
                    reject(undefined)
                }

                getStream(stream, {encoding: encoding})
                    .then(r => {
                        resolve(r)
                    })
                    .catch(e => {
                        log.warn(`unable to get file stream: ${path}, err: ${e}`)
                        reject(undefined)
                    })
            })
        })
    }

    //TODO: test it across platforms
    _getDirectoryFromPath(archive, path, _throw = false) {
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

    _getMetadata(archive/*, filterMetadata = true*/) {
        return new Promise((resolve, reject) => {
            //TODO: replace it with regex search for container file
            //TODO: in existing entries
            const containerPath = `/META-INF/container.xml`
            const upperContainerPath = `/META-INF/Container.xml`

            if (!(
                this._isPathValid(archive, containerPath) ||
                this._isPathValid(archive, upperContainerPath)
            ))
                throw new Error(`unable to locate /META-INF/container.xml`)

            const finalContainerPath =
                this._isPathValid(archive, containerPath) ?
                    containerPath :
                    upperContainerPath

            //read /META-INF/container.xml
            /*const containerContent = */this._readFile(archive, finalContainerPath)
                .then(data => {
                    xml2js.parseString(data, (err, xmlResult) => {
                        if (err)
                            throw new Error(`unable to parse container.xml: ${err}`)

                        let metadataOPFPath = xmlResult.container.rootfiles['0'].rootfile['0'].$['full-path']

                        this._processMetadataFromOPF(archive, metadataOPFPath)
                            .then(r => {
                                resolve(r)
                            })
                            .catch(err => {
                                throw err
                            })
                    })
                })
                .catch(err => {
                    throw err //rethrow
                })
        })
    }

    _processMetadataFromOPF(archive, path/*, filtrMetadata*/) {
        if(!(this._isPathValid(archive, metadataOPFPath)))
            throw new Error(`invaild metadata OPF path`)

        const opfContent = this._readFile(archive, path)

        xml2js.parseString(opfContent, (err, xmlResult) => {
            if(err)
                throw new Error(`unable to parse metadata OPF: ${err}`)

            return this._metadataDigger(archive, xmlResult, this._getDirectoryFromPath(archive, path, true))
        })
    }

    _metadataDigger(packageRoot, opfDirectory, archive) {
        let metadataNode = null
        const values = {}

        const fnMetanodeTest = (node) => {
            return this._keyNodeDigger(node, 'title') !== null;
        }

        let metadataParentNode = this._keyNodeDigger(packageRoot, 'metadata')

        if (metadataParentNode === null) {//not found in package root
            Object.keys(packageRoot).forEach(rootNodes => {
                const fixedMetadataNode = this._keyNodeDigger(packageRoot[rootNodes], 'metadata')

                if (fixedMetadataNode !== null) {
                    metadataParentNode = fixedMetadataNode
                }
            })
        }

        if (metadataParentNode === null || metadataParentNode === undefined)
            return null

        if (util.isArray(metadataParentNode)) {
            metadataNode = metadataParentNode["0"]
        } else if (util.isObject(metadataParentNode)) {
            if (!(fnMetanodeTest(metadataParentNode))) {//not passed
                let found = null

                Object.keys(metadataParentNode).forEach(element => {//search in child nodes
                    if (found === null) {
                        const isMetaNode = fnMetanodeTest(metadataParentNode[element])

                        if (isMetaNode === true)
                            found = metadataParentNode[element]
                    }
                })

                if (found === null) {
                    log.error(`unable to find metanode: ${metadataParentNode}`)
                    return null
                }

                metadataNode = found
            } else if (fnMetanodeTest(metadataParentNode)) {
                metadataNode = metadataParentNode
            } else {
                log.error(`unable to find metanode: ${metadataParentNode}`)
                return null
            }
        } else {
            return null
        }

        // const keys = [
        //     'rights',
        //     'identifier',
        //     'creator',
        //     'author',
        //     'contributor',
        //     'title',
        //     'language',
        //     'subject',
        //     'date',
        //     'source'
        // ]
        const keys = getAllValues(MetadataFields)

        keys.forEach(key => {
            const keyNode = this._keyNodeDigger(metadataNode, key)

            if (keyNode !== null) {
                const value = this._valueDigger(keyNode)

                if (value !== null) { //if value fond assign it to key
                    values[key] = value
                }
            }
        })

        let coverAsBase64 = null

        this._coverExtractor(packageRoot, metadataNode, opfDirectory, archive)
            .then(base64 => {
                coverAsBase64 = base64
            })
            .catch(err => {
                log.info(`unable to extract cover: ${err}`)
            })

        values['cover'] = coverAsBase64

        return values
    }

    // _coverExtractor(packageRoot, metadataNode, opfDirectory) {
    //     //try find cover
    //     const metaNode = this._keyNodeDigger(metadataNode, 'meta')
    //     let coverResourceId = null
    //     let coverPath = null
    //     let manifestNode = null
    //
    //     if (metaNode !== null) {
    //         metaNode.forEach(element => {
    //             if (coverResourceId === null) {
    //                 if (element.$.name === 'cover') {
    //                     coverResourceId = element.$.content
    //                 }
    //             }
    //         })
    //     }
    //
    //     if (coverResourceId !== null) {
    //         Object.keys(packageRoot).forEach(rootNodes => {
    //             if (manifestNode === null) {
    //                 const tmp = this._keyNodeDigger(packageRoot[rootNodes], 'manifest')
    //
    //                 if (tmp !== null)
    //                     manifestNode = tmp
    //             }
    //         })
    //
    //         if (manifestNode !== null) {
    //             coverPath = this._getResourceLink(manifestNode, opfDirectory, coverResourceId)
    //         }
    //     }
    //
    //     return base64img.base64Sync(coverPath)
    // }

    async _coverExtractor(packageRoot, metadataNode, opfDirectory, archive) {
        const metaNode = this._keyNodeDigger(metadataNode, MetadataFields.Metadata)
        let coverResourceId = null
        let coverPath = null
        let manifestNode = null

        if (metaNode !== null) {
            metaNode.forEach(element => {
                if (coverResourceId === null) {
                    if (element.$.name === MetadataFields.Cover) {
                        coverResourceId = element.$.content
                    }
                }
            })
        }

        if (coverResourceId !== null) {
            Object.keys(packageRoot).forEach(rootNodes => {
                if (manifestNode === null) {
                    const tmp = this._keyNodeDigger(packageRoot[rootNodes], 'manifest')

                    if (tmp !== null)
                        manifestNode = tmp
                }
            })

            if (manifestNode !== null) {
                coverPath = this._getResourceLink(manifestNode, opfDirectory, coverResourceId)
            }
        }

        if(coverPath === null)
            return null

        const coverBuffer = this._readFileAsBuffer(archive, coverPath)

        base64img.base64(coverBuffer, (err, base64Result) => {
            if(err)
                return null

            return base64Result
        })
    }

    //TODO: prop check
    _keyNodeDigger(metadataRoot, key, prop = null) {
        const query = new RegExp(key, 'i')
        let found = null

        Object.keys(metadataRoot).forEach(element => {
            if (found)
                return

            if (element.match(query) !== null) {//contains specifited key, ex: "creator" >> OR << its called recursively
                //console.log(`       :_keyNodeDigger >> query matched ${query.source}`, element)
                /*
                if(prop !== null && prop !== undefined) {

                    if(element.$ === undefined) //not defined in object
                        return null

                    //TODO:
                    //check for specific prop name
                }*/

                found = metadataRoot[element]
            }
        })

        return found
    }

//TODO: prop check
    _valueDigger(node, prop = null) {
        const values = []

        if (util.isArray(node)) {
            node.forEach(element => {
                const subnode = this._valueDigger(element, prop)

                if (subnode !== null)
                    values.push(subnode)
            })

            return values
        } else if (util.isObject(node)) {
            if (prop !== null) {
                if (node.$ === undefined) //dont constains any prop
                    return null

                //TODO prop check
            }

            if (node._ !== undefined) {
                return this._valueDigger(node._, prop)
            }

            //console.log(`ValueDigger, object without value ==> `, node)
            return null
        } else if (util.isString(node)) {
            return node
        } else { //unrecognized node value
            //console.log(`ValueDigger, unrecognized node format ==> `, node)
            return null
        }
    }

    _getResourceLink(manifestNode, opfDirectory, resourceId) {
        let idValue = null
        const itemsNode = manifestNode["0"].item

        if (manifestNode === null || manifestNode === undefined || itemsNode === undefined)
            return null

        Object.keys(itemsNode).forEach(itemKey => {
            const item = itemsNode[itemKey]

            if (item.$ !== undefined) {
                // noinspection EqualityComparisonWithCoercionJS
                if (item.$.id == resourceId) {
                    idValue = item.$.href
                }
            }
        })

        if (idValue == null )
            return null

        let separator

        if(isWindows()) {
            separator = '\\'
        } else {
            separator = '/'
        }

        return '' + opfDirectory + separator + idValue
    }
}