import logger from './logger'

var consoleLogger = null
var orginConsole = console//keep old ref

if (global.consoleLogger === null || global.consoleLogger === undefined) {
    if (process.env.NODE_ENV == 'development') { // *** dev ***
        //based on: https://stackoverflow.com/a/30197438
        consoleLogger = (function (oldCons) {
            return {
                log: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[LOG]   :" + text
                    orginConsole.log(text)
                    logger.log(text)
                },
                info: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[INFO]  :" + text
                    orginConsole.info(text)
                    logger.info(text)
                },
                warn: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[WARN]  :" + text
                    orginConsole.warn(text)
                    logger.warn(text)
                },
                error: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[ERROR] :" + text
                    orginConsole.error(text)
                    logger.error(text)
                }
            }
        }(window.console))
    } else { //*** prod ***
        //based on: https://stackoverflow.com/a/30197438
        //supress console.*() for production
        consoleLogger = (function (oldCons) {
            return {
                log: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[LOG]   :" + text
                    //orginConsole.log(text)
                    logger.log(text)
                },
                info: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[INFO]  :" + text
                    //orginConsole.info(text)
                    logger.info(text)
                },
                warn: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[WARN]  :" + text
                    //orginConsole.warn(text)
                    logger.warn(text)
                },
                error: function (text, appendInfoPrefix = true) {
                    if (appendInfoPrefix)
                        text = "[ERROR] :" + text
                    //orginConsole.error(text)
                    logger.error(text)
                }
            }
        }(window.console))
    }

    global.consoleLogger = consoleLogger
}

export default global.consoleLogger