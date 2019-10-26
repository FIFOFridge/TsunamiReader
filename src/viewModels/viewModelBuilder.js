import { log } from '@app/log'

const componentHooks = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed'
]

export function build(template, extension, storeTemplateComponentHooks = true) {
    log.verbose(`building view model: ${extension.data.viewName}`)

    let baseHooks = storeTemplateComponentHooks ? {base: {}} : {}

    let templateCopy = Object.assign({}, template)
    let extensionCopy = Object.assign({}, extension)

    //store hooks in base[hookName]
    if(storeTemplateComponentHooks) {
        for(let hookIndex in componentHooks) {
            const hook = componentHooks[hookIndex]

            if(
                templateCopy.hasOwnProperty(hook) &&
                extension.hasOwnProperty(hook))
            {
                baseHooks.base[hook] = templateCopy[hook]
            }
        }
    }

    let templateDataNode = undefined
    let extensionDataNode = undefined
    let finallDataNode = undefined

    //'data' node merge needed
    if(templateCopy.hasOwnProperty('data') && extensionCopy.hasOwnProperty('data')) {
        extensionDataNode = _copyDataNode(extensionCopy)
        templateDataNode = _copyDataNode(templateCopy)

        //merge data nodes
        finallDataNode = Object.assign(templateDataNode, extensionDataNode)

        //wrap data object into function return, for vue compatibility
        finallDataNode = _transformToVueData(finallDataNode)

        //delete uncomatible data nodes
        delete templateCopy['data']
        delete extensionCopy['data']

    } else if(templateCopy.hasOwnProperty('data')) {
        finallDataNode = _transformToVueData(_copyDataNode(templateCopy))
        delete templateCopy['data']

    } else if(extensionCopy.hasOwnProperty('data')) {
        finallDataNode = _transformToVueData(_copyDataNode(extensionCopy))
        delete extensionCopy['data']

    } else {
        finallDataNode = {}
    }

    let methods = _mergeMethods(template.methods, extension.methods)

    delete templateCopy.methods
    delete extensionCopy.methods

    // vue don't allow to create non-function object in method node:
    // https://stackoverflow.com/questions/49950029/vue-uncaught-typeerror-fn-bind-is-not-a-function
    //  //move base hooks into methods.base node, to avoid invalid vue data structure
    //  methods = _mergeMethods(methods, baseHooks)

    methods = _mergeMethods(methods, baseHooks)

    if(methods.hasOwnProperty('base')) {
        //move {root}.base method to {root}.method with 'base_' prefix
        //to avoid vue errors
        let prefixed = {}

        //methods.base contains base hook methods
        for (let baseMethod in methods.base) {
            prefixed['base_' + baseMethod] = methods.base[baseMethod]
        }

        //merge prefixed methods into {root} and delete {root}.base
        methods = Object.assign(methods, prefixed)
        delete methods.base
    }

    //format for merge
    methods = {
        methods: methods
    }

    let vm = Object.assign(templateCopy, extensionCopy, methods, finallDataNode)
    return vm
}

function _copyDataNode(source) {
    return Object.assign({}, source['data'])
}

function _transformToVueData(dataObject) {
    if(!(dataObject instanceof Object)) {
        throw new Error(`wrong source type`)
    }

    // return Function
    return { data: new Function(`return ${JSON.stringify(dataObject)}`) }
}

function _mergeMethods(templateMethods, ...args) {
    let final = Object.assign({}, templateMethods)

    if(args.length > 0) {
        for(let argIndex in args) {
            const methods = args[argIndex]

            if(methods === undefined)
                continue

            for(let method in methods)
                final[method] = methods[method]
        }
    }

    return final
}