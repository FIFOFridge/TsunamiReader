class Logger {
    constructor() {
        this._stored = ''
    }

    debug(text) {
        this._push(`[DEBUG]: ${text}`)
    }

    info(text) {
        this._push(`[INFO]: ${text}`)
    }

    warn(text) {
        this._push(`[WARN]: ${text}`)
    }

    verbose(text) {
        this._push(`[VERBOSE]: ${text}`)
    }

    error(text) {
        this._push(`[ERROR]: ${text}`)
    }

    _push(text) {
        this._stored += text
    }

    dump() {
        return this._stored
    }
}

export function log() {
    return new Logger()
}