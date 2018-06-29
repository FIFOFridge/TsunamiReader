import logger from './logger'

var consoleLogger = null
var orginConsole = console//keep old ref

if (global.consoleLogger === null || global.consoleLogger === undefined) {
    if (process.env.NODE_ENV == 'development') { //dev
        //https://stackoverflow.com/a/30197438
        var consoleLogger = (function(oldCons){
            return {
                log: function(text){
                    orginConsole.log(text)
                    logger.log(text)
                },
                info: function (text) {
                    orginConsole.info(text)
                    logger.info(text)
                },
                warn: function (text) {
                    orginConsole.warn(text)
                    logger.warn(text)
                },
                error: function (text) {
                    orginConsole.error(text)
                    logger.error(text)
                }
            }
        }(window.console))
    } else { //production
        //https://stackoverflow.com/a/30197438
        //supress console.*() for production
        var consoleLogger = (function(oldCons){
            return {
                log: function(text){
                    //orginConsole.log(text)
                    logger.log(text)
                },
                info: function (text) {
                    //orginConsole.info(text)
                    logger.info(text)
                },
                warn: function (text) {
                    //orginConsole.warn(text)
                    logger.warn(text)
                },
                error: function (text) {
                    //orginConsole.error(text)
                    logger.error(text)
                }
            }
        }(window.console))
    }

    global.consoleLogger = consoleLogger
}

export default global.consoleLogger