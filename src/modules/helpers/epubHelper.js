import fs from 'fs'
import extractor from 'extract-zip'
import path from 'path'
import xml2js from 'xml2js'
import util from 'util'
import md5 from 'md5'
import base64img from 'base64-img'

class EpubHelper {
    /**
     * Extract epub and return its metadata
     * @param {string} filePath
     * @param {string} targetDirectory
     * @param useMD5AsTargetDirectory
     */
    static extractAndParse(filePath, targetDirectory, useMD5AsTargetDirectory = true) {
        return new Promise((resolve, reject) => {
            if(!(fs.existsSync(filePath))) {
                reject(`unable to find: ${filePath}`)
                return
            }

            let fileBuffer = fs.readFileSync(filePath)
            let epubmd5 = md5(fileBuffer)

            if(useMD5AsTargetDirectory === true)
                targetDirectory = path.join(targetDirectory, '/' + epubmd5)

            console.log(targetDirectory)

            extractor(filePath, {dir: targetDirectory}, (err) => {
                if(err) {
                    reject(`error during extraction: ${err.message}`)
                    // return
                }
            })

            EpubHelper._processMetadata(targetDirectory).then((value) => {
                value['unpackedPath'] = targetDirectory
                value['md5'] = epubmd5
                resolve(value)
                return
            }, (rejected) => {
                reject(`error during metadata procession: ${rejected}`)

                return
            })
        })
    }

    static _processMetadata(baseDir) 
    {
        return new Promise((resolve, reject) => {

            const metaInfDirectoryPath = path.join(baseDir, '/META-INF/')
            let containerFilePath = path.join(metaInfDirectoryPath, 'Container.xml')
            let packageDocumentFilePath
            let contentFileRelativePath

            if(!(fs.existsSync(containerFilePath))) {
                const containerFilePathLow = path.join(metaInfDirectoryPath, 'container.xml')

                if(!(fs.existsSync(containerFilePathLow)))//fs is case-sensitive (linux too!), correction could be needed
                {
                    reject(`unable to find container file (container.xml)`)
                    return
                } else {
                    //fix file name
                    containerFilePath = containerFilePathLow
                }
            }
    
            fs.readFile(containerFilePath, {encoding: 'UTF-8'}, (err, data) => {
                if(err) {
                    reject(`unable to read container file`)
                    return
                }

                xml2js.parseString(data, (err, containerResult) => {
                    if(err) {
                        reject(`unable to parse container file`)
                        return
                    }

                    //console.log("container file ===> ", containerResult)

                    contentFileRelativePath = containerResult.
                                            container.
                                            rootfiles['0'].
                                            rootfile['0'].
                                            $['full-path']

                    if(contentFileRelativePath === undefined) {
                        reject(`unable to locate package file (.opf)`)
                        return
                    }
                    
                    packageDocumentFilePath = path.join(baseDir, contentFileRelativePath)
        
                    fs.readFile(packageDocumentFilePath, {encoding: 'UTF-8'}, (err, data) => {
                        if(err) {
                            reject(`unable to read package document: ${packageDocumentFilePath}`)
                            return
                        }
        
                        xml2js.parseString(data, (err, packageResult) => {
                            if(err) {
                                reject(`error during processing package document: ${packagDocumentFilePath}, error: ${err.message}`)
                                return
                            }
        
                            //console.log('package file ===> ', packageResult)

                            const metadata = EpubHelper._metadataDigger(packageResult, path.dirname(packageDocumentFilePath))
                            resolve(metadata)
                            // noinspection UnnecessaryReturnStatementJS
                            return
                        })
                    })
                }) 
            })
        })
    }

    static _metadataDigger(packageRoot, opfDirectory) {
        let metadataNode = null
        const values = {}

        const fnMetanodeTest = (node) => {
            if (fnKeyNodeDigger(node, 'title') !== null)
                return true
            else
                return false
        }

        let metadataParentNode = EpubHelper._keyNodeDigger(packageRoot, 'metadata')

        if(metadataParentNode === null) {//not found in package root
            Object.keys(packageRoot).forEach(rootNodes => {
                const fixedMetadataNode = EpubHelper._keyNodeDigger(packageRoot[rootNodes], 'metadata')

                if(fixedMetadataNode !== null) {
                    metadataParentNode = fixedMetadataNode
                }
            })
        }

        if(metadataParentNode === null || metadataParentNode === undefined)
            return null

        //console.log(`   metadata node >>>`, metadataParentNode)

        if(util.isArray(metadataParentNode)) {
            metadataNode = metadataParentNode["0"]
        } else if(util.isObject(metadataParentNode)) {
            if(!(fnMetanodeTest(metadataParentNode))) {//not passed
                let found = null

                Object.keys(metadataParentNode).forEach(element => {//search in child nodes
                    if(found === null) {
                        const isMetaNode = fnMetanodeTest(metadataParentNode[element])

                        if(isMetaNode === true)
                            found = metadataParentNode[element]
                    }
                })

                if(found === null) {
                    //console.log(`unable to find metanode :/`)
                    return null
                }

                metadataNode = found
            } else if(fnMetanodeTest(metadataParentNode)) {
                metadataNode = metadataParentNode
            } else {
                //console.log(`unable to find metanode :/`)
                return null
            }
        } else {
            return null
        }

        const keys = [
            'rights',
            'identifier',
            'creator',
            'author',
            'contributor',
            'title',
            'language',
            'subject',
            'date',
            'source'
        ]

        keys.forEach(key => {
            const keyNode = EpubHelper._keyNodeDigger(metadataNode, key)

            if(keyNode !== null) {
                const value = EpubHelper._valueDigger(keyNode)

                if(value !== null) { //if value fond assign it to key
                    values[key] = value
                }
            }
        })

        //todo
        const coverPath = EpubHelper._coverExtractor(packageRoot, metadataNode, opfDirectory)

        if(coverPath !== null && coverPath !== undefined) {
            values['cover'] = coverPath
        } else {
            values['cover'] = null
        }

        return values
    }

    static _coverExtractor(packageRoot, metadataNode, opfDirectory) {
        //try find cover
        const metaNode = EpubHelper._keyNodeDigger(metadataNode, 'meta')
        let coverResourceId = null
        let coverPath = null
        let manifestNode = null

        if(metaNode !== null) {
            metaNode.forEach(element => {
                if(coverResourceId === null) {
                    if(element.$.name === 'cover') {
                        coverResourceId = element.$.content
                    }
                }
            })
        }

        if(coverResourceId !== null) {
            Object.keys(packageRoot).forEach(rootNodes => {
                if(manifestNode === null) {
                    const tmp = EpubHelper._keyNodeDigger(packageRoot[rootNodes], 'manifest')

                    if(tmp !== null)
                        manifestNode = tmp
                }
            })

            if(manifestNode !== null) {
                coverPath = EpubHelper._getResourceLink(manifestNode, opfDirectory, coverResourceId)
            }
        }

        return base64img.base64Sync(coverPath)
    }

    //diggers
    //TODO: prop check
    static _keyNodeDigger(metadataRoot, key, prop = null) {
        const query = new RegExp(key, 'i')
        let found = null

        Object.keys(metadataRoot).forEach(element => {
            if(found)
                return

            if(element.match(query) !== null) {//contains specifited key, ex: "creator" >> OR << its called recursively 
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
    static _valueDigger(node, prop = null) {
        const values = []

        if(util.isArray(node)) {
            node.forEach(element => {
                const subnode = EpubHelper._valueDigger(element, prop)

                if(subnode !== null)
                    values.push(subnode)
            })

            return values
        } else if(util.isObject(node)) {
            if(prop !== null) {
                if(node.$ === undefined) //dont constains any prop
                    return null

                //TODO prop check
            }

            if(node._ !== undefined) {
                return EpubHelper._valueDigger(node._, prop)
            }

            //console.log(`ValueDigger, object without value ==> `, node)
            return null
        } else if(util.isString(node)) {
            return node
        } else { //unrecognized node value
            //console.log(`ValueDigger, unrecognized node format ==> `, node)
            return null
        }
    }

    static _getResourceLink(manifestNode, opfDirectory, resourceId) {
        let idValue = null
        const itemsNode = manifestNode["0"].item

        if(manifestNode === null || manifestNode === undefined || itemsNode === undefined)
            return null

        Object.keys(itemsNode).forEach(itemKey => {
            const item = itemsNode[itemKey]

            if(item.$ !== undefined) {
                //console.log('================')
                //console.log(item.$.id)
                //console.log(item.$.href)
                if(item.$.id == resourceId) {
                    idValue = item.$.href
                }
            }
        })

        if(idValue == null || idValue == undefined)
            return null
        
        return path.join(opfDirectory, idValue)
    }
}

export default EpubHelper