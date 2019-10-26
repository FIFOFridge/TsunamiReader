import electron from 'electron'
//
// const isMain = electron.process !== undefined
// const process = isMain ? electron.process : electron.remote.process

export function isRunningMain() {
    return process.type === 'browser'
}

export function isRunningRenderer() {
    return process.type === 'renderer'
}

export function getRunnerType() {
    return process.type
}