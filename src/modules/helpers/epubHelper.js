import fs from 'fs'
import extractor from 'extract-zip'
import path from 'path'
import xml2js from 'xml2js'
import util from 'util'
import md5 from 'md5'

class EpubHelper {
    constructor() {
        this._valueDigger = this._valueDigger.bind(this)
    }

    /**
     * Extract epub and return its metadata
     * @param {string} filePath
     * @param {string} targetDirectory 
     */
    setupEpub(filePath, targetDirectory) {
        return new Promise((resolve, reject) => {
            if(!(fs.existsSync(filePath))) {
                reject(`unable to find: ${filePath}`)
                return
            }

            var epubmd5

            fs.readFile(filePath, (err, data) => {
                if(err)
                    reject(`error while reading file: ${filePath}`)

                epubmd5 = md5(data)
            })

            extractor(filePath, {dir: targetDirectory}, (err) => {
                if(err) {
                    reject(`error during extraction: ${err.message}`)
                    return
                }
            })

            this._processMetadata(targetDirectory).then((value) => {
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

    _processMetadata(baseDir) 
    {
        return new Promise((resolve, reject) => {

            var metaInfDirectoryPath = path.join(baseDir, '/META-INF/')
            var containerFilePath = path.join(metaInfDirectoryPath, 'Container.xml')
            var packageDocumentFilePath
            var contentFileRelativePath
    
            var containerFileContent
    
            if(!(fs.existsSync(containerFilePath))) {
                var containerFilePathLow = path.join(metaInfDirectoryPath, 'container.xml')

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

                            var metadata = this._metadataDigger(packageResult, path.dirname(packageDocumentFilePath))
                            resolve(metadata)
                            return
                        })
                    })
                }) 
            })
        })
    }

    _metadataDigger(packageRoot, opfDirectory) {
        var metadataNode = null
        var values = {}

        var fnMetanodeTest = (node) => {
            if(fnKeyNodeDigger(node, 'title') !== null)
                return true
            else
                return false
        }

        var metadataParentNode = this._keyNodeDigger(packageRoot, 'metadata')

        if(metadataParentNode === null) {//not found in package root
            Object.keys(packageRoot).forEach(rootNodes => {
                var fixedMetadataNode = this._keyNodeDigger(packageRoot[rootNodes], 'metadata')

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
                var found = null

                Object.keys(metadataParentNode).forEach(element => {//search in child nodes
                    if(found === null) {
                        var isMetaNode = fnMetanodeTest(metadataParentNode[element])

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
            return null //whos know how aliens make ufos?? :E
        }

        var keys = [
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
            var keyNode = this._keyNodeDigger(metadataNode, key)

            if(keyNode !== null) {
                var value = this._valueDigger(keyNode)

                if(value !== null) { //if value fond assign it to key
                    values[key] = value
                }
            }
        })

        //todo
        var coverPath = this._coverExtractor(packageRoot, metadataNode, opfDirectory)

        if(coverPath !== null && coverPath !== undefined) {
            values['cover'] = coverPath
        } else {
            values['cover'] = null
        }

        return values
    }

    _coverExtractor(packageRoot, metadataNode, opfDirectory) {
        //try find cover
        var metaNode = this._keyNodeDigger(metadataNode, 'meta')
        var coverResourceId = null
        var coverPath = null
        var manifestNode = null

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
                    var tmp = this._keyNodeDigger(packageRoot[rootNodes], 'manifest')

                    if(tmp !== null)
                        manifestNode = tmp
                }
            })

            if(manifestNode !== null) {
                coverPath = this._getResourceLink(manifestNode, opfDirectory, coverResourceId)
            }
        }

        return coverPath

    }

    //diggers
    //TODO: prop check
    _keyNodeDigger(metadataRoot, key, prop = null) {
        var query = new RegExp(key, 'i')
        var found = null

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
    _valueDigger(node, prop = null) {
        var values = []

        if(util.isArray(node)) {
            node.forEach(element => {
                var subnode = this._valueDigger(element, prop)

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
                return this._valueDigger(node._, prop)
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

    _getResourceLink(manifestNode, opfDirectory, resourceId) {
        var idValue = null
        var itemsNode = manifestNode["0"].item

        if(manifestNode === null || manifestNode === undefined || itemsNode === undefined)
            return null

        Object.keys(itemsNode).forEach(itemKey => {
            var item = itemsNode[itemKey]

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

export default new EpubHelper()