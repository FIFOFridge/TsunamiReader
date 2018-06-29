//https://www.npmjs.com/package/winston
import winston from 'winston'

var logger = null

if (global.logger === null || global.logger === undefined) {
    console.log('init')

    if (process.env.NODE_ENV == 'development') { //dev
        logger = winston.createLogger({
            level: 'debug',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'info.log', level: 'info' }),
                new winston.transports.File({ filename: 'warn.log', level: 'warn' }),
                new winston.transports.File({ filename: 'debug.log', level: 'debug' })
            ]
        });
    } else { //production
        logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: 'combined.log' })
            ]
        });
    }

    global.logger = logger
} else {
    logger = global.logger
}

export default logger